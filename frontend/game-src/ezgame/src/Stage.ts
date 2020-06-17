/// <reference path="Sprite.ts"/>
/** 
 * @module Visual
*/
namespace ez {

	interface RenderState {
		color: string;
		gradient: GradientFill;
		shader: Shader;
		params: any;
		texture: Texture;
		alpha: number;
		zIndex: number;
		blendMode: BlendMode;
		commit();
	}

	function makeIdentMat2D() {
		return ezasm.tempAllocMat2x3(1, 0, 0, 1, 0 ,0);
	}

	var batchQueue: RenderState[];
	
	function batchCommit() {
		function isEqual(s1: RenderState, s2: RenderState): boolean {
			return s1.blendMode === s2.blendMode && s1.gradient === s2.gradient && s1.texture === s2.texture && s1.shader === s2.shader && !s1.params && !s2.params;
		}

		if (batchQueue.length == 0)
			return;
		insertSort(batchQueue, cmpZIndex);
		var idx = 0;
		while (idx < batchQueue.length) {
			for (var i = idx + 1; i < batchQueue.length; i++) {
				if (batchQueue[idx].zIndex < batchQueue[i].zIndex)
					break;
				if (isEqual(batchQueue[idx], batchQueue[i])) {
					var t = batchQueue[i];
					for (var j = i; j > idx; j--)
						batchQueue[j] = batchQueue[j - 1];
					batchQueue[++idx] = t;
				}
			}
			idx++;
		}
		idx = 0;
		var rs = batchQueue[idx];
		if (rs.color) {
			//console.log("set color %s", rs.color);
			RenderContext.setFillColor(rs.color);
		}
		RenderContext.setAlphaBlend(rs.alpha, rs.blendMode);
		if (rs.gradient)
			RenderContext.setFillGradient(rs.gradient);
		(<IRenderContextWGL>RenderContext).setShader(rs.shader, rs.params);
		rs.commit();
		for (i = 1; i < batchQueue.length; i++) {
			var rs2 = batchQueue[i];
			if (rs.alpha != rs2.alpha || rs.blendMode != rs2.blendMode)
				RenderContext.setAlphaBlend(rs2.alpha, rs2.blendMode);
			if (rs2.gradient)
				RenderContext.setFillGradient(rs2.gradient);
			else if (rs.color != rs2.color) {
				//console.log("set color %s", rs2.color);
				RenderContext.setFillColor(rs2.color);
			}
			if(rs.shader !== rs2.shader)
				(<IRenderContextWGL>RenderContext).setShader(rs2.shader, rs2.params);
			rs2.commit();
			rs = rs2;
		}
	}

	var BatchRC = {
		color: "",
		gradent: null,
		shader: null,
		alpha: 0,
		blendMode: BlendMode.Normal,
		zIndex: 0,
		toRS: function () {
			return {
				zIndex: this.zIndex,
				color: this.color,
				gradent: this.gradent,
				shader: this.shader,
				alpha: this.alpha,
				blendMode: this.blendMode
			}
		},
		setZ: function (zIndex) {
			this.zIndex = zIndex;
		},
		fillRect: function (width: number, height: number, transform: Handle) {
			var rs = this.toRS();
			rs.commit = function () {
				//console.log("fillRect ");
				RenderContext.fillRect(width, height, transform);
			};
			batchQueue.push(rs);
		},
		drawImage: function (texture: Texture, transform: Handle, width: number, height: number, srcRect?: Rect) {
			var rs = this.toRS();
			rs.texture = texture.id;
			rs.commit = function () {
				//console.log("drawImage ");
				RenderContext.drawImage(texture, transform, width, height, srcRect);
			};
			batchQueue.push(rs);
		},
		drawImageRepeat: function (texture: Texture, transform: Handle, width: number, height: number, repeat: string) {
			var rs = this.toRS();
			rs.texture = texture.id;
			rs.commit = function () {
				RenderContext.drawImageRepeat(texture, transform, width, height, repeat);
			};
			batchQueue.push(rs);
		},
		drawImageS9: function (texture: Texture, transform: Handle, s9: Number4, width: number, height: number, srcRect?: Rect) {
			var rs = this.toRS();
			rs.texture = texture.id;
			rs.commit = function () {
				//console.log("drawImageS9 ");
				RenderContext.drawImageS9(texture, transform, s9, width, height, srcRect);
			};
			batchQueue.push(rs);
		},
		setAlphaBlend: function (value: number, blendMode: BlendMode) {
			this.alpha = value;
			this.blendMode = blendMode;
		},
		setFillColor: function (color: string) {
			this.color = color;
			this.gradient = null;
		},
		setFillGradient: function (gradient: GradientFill) {
			this.gradient = gradient;
		},
		setShader: function (shader: Shader, params?: any) {
			this.shader = shader;
			this.params = params;
		},
		drawText: function (content: TextMetric, transform: Handle, x: number, y: number,
			width: number, height: number, align: AlignMode, stroke?: StrokeStyle) {
			var rs = this.toRS();
			rs.texture = "_font";
			rs.commit = function () {
				(<IRenderContextCanvas>RenderContext).drawText(content, transform, x, y, width, height, align, stroke);
			};
			batchQueue.push(rs);
		},
		drawTextCache: function (x: number, y: number, cache: any, transform: Handle) {
			var rs = this.toRS();
			rs.texture = "_font";
			rs.commit = function () {
				//console.log("drawTextCache %d %d", x, y, tex, transform);
				(<IRenderContextWGL>RenderContext).drawTextCache(x, y, cache, transform);
			};
			batchQueue.push(rs);
		},
		bindTexture: function (tex: Texture, idx: number) {
			throw new Error("unsupport bindTexture in bacth mode");
		},
	};

	function upperBound(arr: Array<any>, start: number, end: number, val, cmp: (t1, t2) => number): number {
		var n = end - start;
		while (n > 0) {
			var mid = n >> 1;
			if (cmp(arr[start + mid], val) <= 0) {
				start += mid + 1;
				n -= mid + 1;
			}
			else
				n = mid;
		}
		return start;
	}

	function cmpZIndex(t1, t2) {
		t1 = t1.zIndex;
		t2 = t2.zIndex;
		return t1 > t2 ? 1 : (t1 == t2 ? 0 : -1);
	}

	function insertSort(arr: Array<any>, cmp: (t1, t2) => number) {
		var tmp = [];
		var sorted = arr.length;
		for (var i = 0; i < arr.length - 1; i++) {
			if (cmp(arr[i + 1], arr[i]) < 0) {
				sorted = i + 1;
				break;
			}
		}
		while (sorted < arr.length) {
			var index = 0;
			tmp[index++] = arr[sorted];
			for (i = sorted; i < arr.length - 1; i++) {
				if (cmp(arr[i + 1], arr[i]) != 0)
					break;
				tmp[index++] = arr[i + 1];
			}
			var insert = upperBound(arr, 0, sorted, tmp[0], cmp);
			for (i = sorted - 1; i >= insert; i--)
				arr[i + index] = arr[i];
			for (i = 0; i < index; i++)
				arr[insert + i] = tmp[i];
			sorted += index;
			while (sorted < arr.length) {
				if (cmp(arr[sorted], arr[sorted - 1]) < 0)
					break;
				++sorted;
			}
		}
	}

	/** @ignore */
	export interface IPreRender {
		preRender(profile?: WGLPerFrameProfiler | CanvasPerFrameProfiler);
	}
	/**
     * 舞台对象接口
	 * @description 舞台是sprite的容器，舞台里可以嵌套子舞台，舞台中的每个sprite继承舞台自身的变换矩阵和透明度设置
     */
	export interface Stage {
		/** @inernal */
		render(target: RenderTexture, profile?: any): void;

		/** @inernal */
		makeDirty(needSort: boolean): void;

		/** @inernal */
		addChild(item: any, id: string);

		/** @inernal */
		needPreRender(node: IPreRender);

		/** @inernal */
		_remove(item:Sprite);

		culling: boolean;

		globalTransform: Matrix;
        /**
        * 子元素数量
        */
		readonly count: number;
        /**
        * 舞台内子元素是否有发生过变化
        */
		readonly dirty: boolean;
        /**
        * 通过索引获取子元素
        */
		getItem(index: any): Sprite;
        /**
        * 移除一个子元素
        */
		remove(sprite: Sprite): void;
        /**
        * 将子元素的绘制顺序调整到相同zIndex值的最上面
        */
		bringToTop(sprite: Sprite): void;
        /**
        * 将子元素的绘制顺序调整到相同zIndex值的最下面
        */
		bringToBottom(sprite: Sprite): void;
        /**
        * 根据sprite对象数据载入一个舞台
        */
		load(items: SpriteData[]): Sprite[];
        /**
        * 根据id查找子元素，没有找到的话，会继续递归查找子舞台
        */
		find(id: string): Sprite;
        /**
        * 清除所有子元素
        */
		clear(): void;
		/*
		* 查找目标点上点中的sprite
		* @param allHitTargets: true返回全部命中的对象，false仅返回最前面的命中对象
		*/
		hitFind(x: number, y: number, allHitTargets?: boolean): Sprite | Sprite[];
	}
	
	/**
	 * 子舞台对象，通过添加子舞台实现舞台的嵌套
	 */
	export class SubStageSprite extends Sprite implements Stage, IPreRender {
		protected _rtBuffer: RenderTexture;
		protected _bound: Rect;
		private _cachedCommands: any;
		private _noChange: boolean;
		public static Type = "SubStage";

		_dispose() {
			super._dispose();
			this.clear();
			this.destroyBuffer();
		}

		public setDirty(needSort = false) {
			if(!this._parent)
				return;
			this._isDirty = true;
			if(this.visible) {
				this._parent.makeDirty(needSort);
				if(this.ownerBuffer)
					this._parent.needPreRender(this);
			}
		}

		public getType(): string { return SubStageSprite.Type; }

		public constructor(parent: Stage, id?: string) {
			super(parent, id);
			this._bound = null;
		}

		/** @inernal */
		preRender(profile?: WGLPerFrameProfiler | CanvasPerFrameProfiler) {
			if (this.disposed || !this.ownerBuffer || this.width <= 0 || this.height <= 0)
				return;
			if(!this._rtBuffer)
				this._rtBuffer = RenderTexture.create(this.width, this.height);
			(<any>RenderContext)._textScale = 1;
			//this._stage.prepare(this.width, this.height);
			//this.globalTransform()
			//wasm.saveTempStack();
			//this._prepareRender(new egl.Rect(0, 0, this.width, this.height), wasm.getglobalTrans(this._handle), false);
			//wasm.restoreTempStack();
			ezasm.setGlobalTransform(ezasm.getglobalTrans(this._handle));
			(<any>RenderContext).beginRender(this._rtBuffer, profile);
			var rc = RenderContext;
			if(this.batchMode) {
				rc = <any>BatchRC;
				batchQueue = [];
			}
			this._render(rc, 1);
			if(this.batchMode) {
				batchCommit();
				batchQueue = null;
			}
			RenderContext.endRender();
			ezasm.setGlobalTransform(0);
		}

		protected _prepare(bound: Rect, transfrom: Handle, transChanged: boolean) {
			var handle = this._handle;
			var noChange = true;
			this._buildTransform();
			if(transChanged || !ezasm.getglobalTrans(handle)) {
				transChanged = true;
				ezasm.buildGlobalTrans(handle, transfrom);
				if(this.width > 0) {
					var b = ezasm.handleToFloatArray(ezasm.calcBound(handle), 4);
					this._bound = new Rect(b[0], b[1], b[2] - b[0], b[3] - b[1]);
				}
				else
					this._bound = bound;
				if (this._cachedCommands)
					this._cachedCommands = null;
				noChange = false;
			}
			if(this._isDirty) {
				noChange = false;
				if (this._cachedCommands)
					this._cachedCommands = null;				
			}
			if(this.drawCache)
				this._noChange = noChange;
			this.culled = this._parent.culling && this.width > 0 && (this._bound.left >= bound.right || this._bound.right <= bound.left || this._bound.top >= bound.bottom || this._bound.bottom <= bound.top);
			if (!this.culled)
				this._prepareRender(this.clip ? Rect.intersect(this._bound, bound) : bound, ezasm.getglobalTrans(handle), transChanged);
		}

		protected _draw(rc: IRenderContext, opacity: number): boolean {
			opacity *= this.opacity;
			if(opacity < 0.01)
				return;
			if(this._rtBuffer) {
				if(useWGL)
					this.applyEffect(rc);
				rc.setAlphaBlend(opacity, this.blendMode);
				rc.setFillColor(this.color);
				ezasm.saveTempStack();
				var m;
				if(useWGL) {
					m = ezasm.tempAllocMat2x3(1, 0, 0, -1, 0, this.height);
					ezasm.mat2x3Append(m, ezasm.getglobalTrans(this._handle));
				}
				else
					m = ezasm.getglobalTrans(this._handle);
				rc.drawImage(this._rtBuffer, m, this.width, this.height);
				ezasm.restoreTempStack();
			}
			else if (!this.ownerBuffer) {
				if (this._cachedCommands) {
					if (this._cachedCommands.fontRev != FontCache.rev)
						this._cachedCommands = null;
					else {
						//Log.debug("replay the cached draw command list.");
						(<IRenderContextWGL>RenderContext).replay(this._cachedCommands);
						return;
					}
				}
				var drawCache = useWGL && this.drawCache && rc == RenderContext && this._noChange;
				if (drawCache)
					drawCache = (<IRenderContextWGL>rc).beginRecorder();
					
				var render = true;
				if(this.clip)
					render = rc.pushClipRect(this._bound);
				if(render) {
					if(this.batchMode) {
						if(rc != RenderContext) {
							Log.error("batch mode can't be nested!");
						}
						else {
							rc = <any>BatchRC;
							batchQueue = [];
						}
					}
					this._render(rc, opacity);
					if(this.batchMode) {
						rc = RenderContext;
						batchCommit();
						batchQueue = null;
					}
				}
				if(this.clip)
					rc.popClipRect();

				if (drawCache) {
					this._cachedCommands = (<IRenderContextWGL>RenderContext).endRecorder();
					if (this._cachedCommands){
						//this._cachedCommands.fontRev = FontCache.rev;
						Log.debug(`geneate draw cache cmd:${this._cachedCommands.length}`);
					}
				}
			}
		}
		protected destroyBuffer() {
			if(this._rtBuffer) {
				this._rtBuffer.dispose();
				this._rtBuffer = null;
			}
		}
		/**
		* 是否剪切舞台内超出舞台边界的对象，默认为不剪切
		*/
		get clip(): boolean {
			return ezasm.getClip(this._handle);
		}
		set clip(val: boolean) {
			if(this.clip == val)
				return;
			ezasm.setClip(this._handle, val);
			this.setDirty();
		}

		/**
		* 是否在绘制时预先剔除超出舞台边界的对象，默认为false
		*/
		public culling: boolean;

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
		* 舞台是否自带离屏缓冲区，默认为false
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

		/**
		* 是否缓存绘制命令（WebGL下有效），默认为false
		* @description stage设置绘制缓存后，当stage及其子元素相对与上一帧没有任何变化时，将直接向WebGL提交缓存的绘制命令，从而节省所有的中间计算过程。
	    * 对不经常变化的stage设置缓存后可以有效提高渲染效率，对经常变化的stage设置缓存会造成不必要的内存浪费
		*/
		public drawCache: boolean;

		/**
		* 是否需要跨舞台进行自动合批排序，默认为false
		* @description 设置跨舞台自动合批后，该舞台下包括子元素的所有对象绘制将根据最小上下文切换原则重新排序渲染，这可能导致渲染顺序错乱，可以通过设置zIndex来强制决定渲染顺序修正顺序错误
		*/
		public batchMode: boolean;

		/**
		* 将stage拷贝到一个临时的canvas上
	    * @description ownerBuffer必须设置为true
		*/
		public saveToCanvas(): HTMLCanvasElement {
			if (!this._rtBuffer)
				return null;
			var canvas = internal.createCanvas();
			var w = canvas.width = this._rtBuffer.width;
			var h = canvas.height = this._rtBuffer.height;
			var ctx = canvas.getContext("2d");
			if (useWGL) {
				var img = ctx.createImageData(w, h);
				var gl = getGL();
				gl.bindFramebuffer(GL.FRAMEBUFFER, this._rtBuffer.framebuffer);
				gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, img.data);
				gl.bindFramebuffer(GL.FRAMEBUFFER, null);
				//RenderContext.endRender();
				//ctx.scale(0, -1);
				//ctx.translate(0, h);
				var stride = w * 4;
				var tmp = new Uint8ClampedArray(stride);
				var h1 = h >> 1;
				for (let i = 0; i < h1; i++) {
					var s = img.data.subarray(i * stride, (i + 1) * stride);
					var d = img.data.subarray((h - i - 1) * stride, (h - i) * stride);
					tmp.set(d);
					d.set(s);
					s.set(tmp);
				}
				ctx.putImageData(img, 0, 0);
				//var bitmap = await createImageBitmap(img, 0, 0, w, h, { imageOrientation: "flipY", premultiplyAlpha: "premultiply" });
				//ctx.drawImage(bitmap, 0, 0);
				//bitmap.close();
			}
			else{
				ctx.drawImage(this._rtBuffer.canvas, 0, 0);
			}
			return canvas;
		}

		private _namedItems = {};
		private _items = [];
		private _isDirty = true;
		private _needSort = true;
		private _preRenderList: IPreRender[];
		private _render: (rc: IRenderContext, opacity: number) => void;
		private _prepareRender: (bound: Rect, transform: Handle, transChanged: boolean) => void;

		public makeDirty(needSort: boolean) {
			this._needSort = needSort || this._needSort;
			if (this._isDirty)
				return;
			this._isDirty = true;
			this.setDirty(false);
		}
		/**@inernal */
		addChild: (item: any, id: string) => void;
		/**@inernal */
		needPreRender: (node: IPreRender) => void;
		/**@inernal */
		render: (target: RenderTexture, profile?: any) => void;
		/**@inernal */
		_remove: (item: Sprite) => void;
		readonly count: number;
		readonly dirty: boolean;
		getItem : (index: any) => Sprite;
		remove : (sprite: Sprite) => void;
		bringToTop: (sprite: Sprite) => void;
		bringToBottom: (sprite: Sprite) => void;
		load: (items: SpriteData[]) => Sprite[];
		find: (id: string) => Sprite;
		clear: () => void;
		hitFind: (x: number, y: number, allHitTargets?: boolean) => Sprite | Sprite[];
	}

	/** 
	* 舞台对象实现类
	*/
	class StageImpl implements Stage {
		private _namedItems = {};
		private _items = [];
		private _isDirty = true;
		private _needSort = true;
		private _parent: Stage;
		private _preRenderList: IPreRender[];
		culling: boolean;
		globalTransform: Matrix;

		private _render(rc: IRenderContext, opacity: number): void {
			this._isDirty = false;
			for(var i = 0; i < this._items.length; i++) {
				var item = this._items[i];
				if(item.visible && !item.culled)
					item._draw(rc, opacity);
			}
		}

		private _prepareRender(bound: Rect, transform: Handle, transChanged: boolean): void {
			if(this._needSort) {
				insertSort(this._items, cmpZIndex);
				this._needSort = false;
			}
			for(var i = 0; i < this._items.length; i++) {
				var item = this._items[i];
				if(item.visible)
					item._prepare(bound, transform, transChanged);
			}
		}

		needPreRender(node: IPreRender) {
			if(this._preRenderList)
				this._preRenderList.push(node);
			else
				this._parent.needPreRender(node);
		}

		public constructor() {
			this._preRenderList = [];
		}

		public render(target: RenderTexture, profile?: any): void {
			RenderContext.scale = target.scale;
			ezasm.saveTempStack();
			this._prepareRender(new Rect(0, 0, target.width, target.height), makeIdentMat2D(), false);
			ezasm.restoreTempStack();

			if (this._preRenderList && this._preRenderList.length > 0) {
				for (var i = 0; i < this._preRenderList.length; i++) {
					this._preRenderList[i].preRender(profile);
				}
				this._preRenderList = [];
			}
			(<IRenderContextWGL>RenderContext).beginRender(target, profile);
			this._render(RenderContext, 1);
			RenderContext.endRender();
		}

		/** @ignore */
		public addChild(item: any, id: string) {
			if (id) {
				if (this._namedItems[id])
					throw new Error("id conflict! id:" + id);
				else
					this._namedItems[id] = item;
			}
			this._needSort = true;
			this._items.push(item);
		}

		public makeDirty(needSort: boolean) {
			this._needSort = needSort || this._needSort;
			this._isDirty = true;
		}
		
		public get count(): number {
			return this._items.length;
		}
		
		public get dirty(): boolean {
			return this._isDirty;
		}

		public getItem(index): Sprite {
			return <Sprite>this._items[index];
		}

		_remove(sprite: Sprite) {
			var idx = this._items.indexOf(sprite);
			if (idx == -1)
				throw new Error("this sprite is not exist in stage!");
			this._items.splice(idx, 1);
			if (sprite.id)
				delete this._namedItems[sprite.id];
			this.makeDirty(false);
		}

		public remove(sprite: Sprite) {
			this._remove(sprite);
			(<any>sprite)._dispose();
		}
		
		public bringToTop(sprite: Sprite) {
			var idx = this._items.indexOf(sprite);
			if (idx == -1)
				throw new Error("this sprite is not exist in stage!");
			for (var i = 0; i < idx; i++)
				this._items[i + 1] = this._items[i];
			this._items[0] = sprite;
			this.makeDirty(true);
		}
		
		public bringToBottom(sprite: Sprite) {
			var idx = this._items.indexOf(sprite);
			if (idx == -1)
				throw new Error("this sprite is not exist in stage!");
			for (var i = idx; i < this._items.length - 1; i++)
				this._items[i] = this._items[i + 1];
			this._items[this._items.length - 1] = sprite;
			this.makeDirty(true);
		}
		
		public load(items: SpriteData[]): Sprite[] {
			var sprites = [];
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				var sprite = Sprite.create(item.type, this, item.id);
				sprites.push(sprite);
				//sprite["_createData"] = item;
				for (var k in item) {
					if(k === "id" || k === "type" || k === "onLoad")
						continue;
					sprite[k] = item[k];
				}
				if (item.type == "SubStage" && item.childs)
					(<SubStageSprite>sprite).load(item.childs);

				if (item.onLoad)
					item.onLoad.call(sprite);
			}
			return sprites;
		}
		
		public find(id: string): Sprite {
			if (this._namedItems[id])
				return this._namedItems[id];
			else {
				for (var i = 0; i < this._items.length; i++) {
					var t = this._items[i];
					if (!t.stage)
						continue;
					var s = t.stage.find(id);
					if (s)
						return s;
				}
			}
			return null;
		}
		
		public clear() {
			//Log.debug(`clear ${this._items.length} items`);
			this._namedItems = {};
			if(this._items.length > 0) {
				var items = this._items.concat();
				for(var i = 0; i < items.length; i++)
					items[i]._dispose();
			}
			this._items = [];
		}
		
		public hitFind(x: number, y: number, allHitTargets?: boolean): Sprite | Sprite[] {
			if (this._needSort) {
				insertSort(this._items, cmpZIndex);
				this._needSort = false;
			}
			if (allHitTargets) {
				var r = [];
				for (var i = this._items.length - 1; i >= 0; i--) {
					var item = this._items[i];
					if(item.visible) {
						let m = item.localTransform.clone();
						m.invert();
						var pt: Number2 = [x, y];
						m.transform(pt);
						if(item.hitTest(pt[0], pt[1]))
							r.push(item);
					}
				}
				return r;
			}
			else {
				for (var i = this._items.length - 1; i >= 0; i--) {
					var item = this._items[i];
					if(item.visible) {
						let m = item.localTransform.clone();
						m.invert();
						var pt: Number2 = [x, y];
						m.transform(pt);
						if(item.hitTest(pt[0], pt[1]))
							return item;
					}
				}
				return null;
			}
		}
	}
	export function createStage(): Stage {
		return new StageImpl();
	}
	Object.getOwnPropertyNames(StageImpl.prototype).forEach(name => {
		if (SubStageSprite.prototype[name])
			return;
		//console.log("mixin " + name);
		var desc = Object.getOwnPropertyDescriptor(StageImpl.prototype, name);
		if (desc.value)
			SubStageSprite.prototype[name] = StageImpl.prototype[name];
		else
			Object.defineProperty(SubStageSprite.prototype, name, desc);
	})
	Sprite.register(SubStageSprite.Type, (p, id) => new SubStageSprite(p, id));
}