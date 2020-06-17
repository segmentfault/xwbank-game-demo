namespace ez {

	/// 设置3d动画数据按fps来缓存，fps=0时不缓存
	export var Cache3DAnimationFPS = 0;

	function loadImage(url): Promise<HTMLImageElement> {
		return new Promise<HTMLImageElement>((r, e) => {
			var img = new Image();
			img.crossOrigin = "Anonymous";
			img.src = url;
			img.onload = function () {
				r(img);
			};
			img.onerror = function (ev:any) {
				e(ev.message);
			}
		});
	};

	/**
	 * 加载3D模型文件
	 */
	export function loadModelFile(filename: string): Promise<Model> {
		var type;
		if(filename.substring(0, 4) == "http") {
			var ext = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
			if(ext == "model")
				type = ResType.model;
			else if(ext == "gltf")
				type = ResType.gltf;
			else
				throw new Error(`unknown type of '${filename}'`);
		}
		else {
			var res = getRes(filename);
			type = res.type;
			if (type != ResType.model && type != ResType.gltf)
				throw new Error(`the res of '${filename}' is not model type`);
		}
		return new Promise<Model>((r, e) => {
			if (type == ResType.model)
				modelFile.load(filename, r, e);
			else if (type == ResType.gltf)
				gltf.load(filename, r, e);
		});
	}

	/**
	 * 3D场景对象
	 * @remark 在stage3D中可以载入并渲染3D场景，renderPipeline
	 */
	export class Stage3DSprite extends Sprite {
		private _ownerBuffer: boolean;
		private _rtBuffer: RenderTexture;
		private _bound: Rect;
		private _ticker: Object;
		//private _fps: number = 0;
		private renderables: Renderable[] = [];
		//private envMap: Texture;

		public static Type = "Stage3D";

		public getType(): string {
			return SubStageSprite.Type;
		}

		public renderPipeline: IRenderPipeline;
		public camera: Camera;
		
		public constructor(parent: Stage, id?: string) {
			super(parent, id);
			this.camera = new Camera();
			this._ownerBuffer = false;
			this._ticker = addTicker(this.update, this);
		}

		protected destroyBuffer() {
			if(this._rtBuffer) {
				this._rtBuffer.dispose();
				this._rtBuffer = null;
			}
		}

		protected _dispose() {
			super._dispose();
			this.destroyBuffer();
			this.clear();
			removeTicker(this._ticker);
		}

		/**
		* 舞台宽度
		*/
		public get width(): number {
			return ezasm.getwidth(this._handle);
		}
		public set width(val: number) {
			if(this.width == val)
				return;
			this.destroyBuffer();
			ezasm.setwidth(this._handle, val);
		}

		/**
		* 舞台高度
		*/
		public get height(): number {
			return ezasm.getheight(this._handle);
		}
		public set height(val: number) {
			if(this.height == val)
				return;
			this.destroyBuffer();
			ezasm.setheight(this._handle, val);
		}

		/**
		* 舞台是否自带离屏缓冲区
		*/
		get ownerBuffer(): boolean {
			return ezasm.getOwnerBuffer(this._handle);
		}
		set ownerBuffer(val: boolean) {
			if(val == this.ownerBuffer)
				return;
			ezasm.setOwnerBuffer(this._handle, val);
			this.setDirty();
			if(!val)
				this.destroyBuffer();
		}
		update(dt:number) {
			var d = false;
			var models = this.renderables;
			for(var i = 0; i < models.length; i++)
				d = models[i].update(dt) || d;
			if(d || this.camera.changed)
				this.setDirty();
			this.camera.changed = false;
		}

		public setDirty(needSort = false) {
			if(!this._parent)
				return;
			if(this.visible) {
				this._parent.makeDirty(needSort);
				if(this._ownerBuffer)
					this._parent.needPreRender(this);
			}
		}

		preRender(profile?: WGLPerFrameProfiler | CanvasPerFrameProfiler) {
			if(this._ownerBuffer) {
				if(this.width <= 0 || this.height <= 0)
					return;
				if(!this._rtBuffer)
					this._rtBuffer = RenderTexture.create(this.width, this.height, true);
				var rc = <IRenderContextWGL>RenderContext;
				rc.beginRender(this._rtBuffer, <WGLPerFrameProfiler>profile);
				var ctx = rc.begin3DRender(null);
				var gl = getGL();
				gl.clear(gl.DEPTH_BUFFER_BIT);
				this.renderPipeline.render(ctx, this.renderables, this.camera);
				rc.endRender();
			}
		}
		
		protected _prepare(bound: Rect, transfrom: Handle, transChanged: boolean) {
			var handle = this._handle;
			this._buildTransform();
			if (transChanged || !ezasm.getglobalTrans(handle)) {
				ezasm.buildGlobalTrans(handle, transfrom);
				if(this.width > 0) {
					var b = ezasm.handleToFloatArray(ezasm.calcBound(handle), 4);
					this._bound = new Rect(b[0], b[1], b[2] - b[0], b[3] - b[1]);
				}
				else
					this._bound = null;
			}
		}

		protected _draw(rc: IRenderContext, opacity: number): boolean {
			opacity *= this.opacity;
			if(opacity < 0.01)
				return;
			if(this._rtBuffer) {
				//rc.apply(this._effect);
				this.applyEffect(rc);
				rc.setAlphaBlend(opacity, this.blendMode);
				rc.setFillColor("#ffffff");
				ezasm.saveTempStack();
				var m;
				if(useWGL) {
					m = ezasm.tempStackAlloc(6 * 4);
					var f = ezasm.handleToFloatArray(m, 6);
					f[0] = 1; f[3] = -1;
					f[1] = f[2] = f[4] = 0;
					f[5] = this.height;
					ezasm.mat2x3Append(m, ezasm.getglobalTrans(this._handle));
				}
				else
					m = ezasm.getglobalTrans(this._handle);
				rc.drawImage(this._rtBuffer, m, this.width, this.height);
				ezasm.restoreTempStack();
			}
			else if(!this.ownerBuffer) {
				if(this.renderables.length == 0)
					return;
				if(this._bound) {
					if(this._bound.left < 0 || this._bound.top < 0) {
						Log.error("the stage3d out of bound.");
						return;
					}
					//gl.viewport((this._bound.left * rc.scale) | 0, ((ctx.height - this._bound.bottom) * rc.scale) | 0, (this._bound.width * rc.scale) | 0, (this._bound.height * rc.scale) | 0);
				}
				var ctx = (<IRenderContextWGL>rc).begin3DRender(this._bound);
				var gl = getGL();
				gl.clear(gl.DEPTH_BUFFER_BIT);
				ezasm.saveTempStack();
				try {
					this.renderPipeline.render(ctx, this.renderables, this.camera);
				}
				catch(e) {
					Log.error("render error: ", e);
				}
				ezasm.restoreTempStack();
				ctx.end();
			}
		}
		/**
		 * 清除全部子对象
		 */
		clear() {
			var objs = this.renderables;
			this.renderables = [];
			for(var i = 0; i < objs.length; i++) {
				objs[i].dispose();
			}
		}

		/**
		 * 添加一个子对象
		 * @param obj 
		 */
		public addChild(obj: Renderable) {
			obj.scene = this;
			this.renderables.push(obj);
		}

		/**
		 * 移除一个子对象
		 * @param obj
		 */
		public remove(obj: Renderable) {
			var idx = this.renderables.indexOf(obj);
			if(idx == -1)
				return;
			this.renderables.splice(idx, 1);
		}

		/**
		 * 加载3D模型文件并添加到场景中
		 * @param name 
		 * @returns model 
		 */
		public async loadModel(name: string): Promise<Model> {
			var m = await loadModelFile(name);
			this.addChild(m);
			return m;
		}	
	}
	Sprite.register(Stage3DSprite.Type, (p, id) => new Stage3DSprite(p, id));

	export module ui {
		/**
		 * 包装3D场景的UI元素
		 */
		export class Stage3D extends Visual {
			static ClassName = "Stage3D";
			static Properties: PropDefine[] = [
				{ name: "ownerBuffer", default: false, type: "boolean", converter: parse.Boolean }
			];
			_stage: Stage3DSprite;

			constructor(parent: Container) {
				super(parent, new Stage3DSprite((<any>parent)._displayStage));
				this._stage = <Stage3DSprite>this._sprite;
				//this.setProp("childs", null);
				this.bind("ownerBuffer", this._sprite);
			}
			/**
			 * 3D场景对象
			 */
			public get stage(): Stage3DSprite {
				return this._stage;
			}
		}
		initUIClass(Stage3D, ui.Visual);
	}
}
