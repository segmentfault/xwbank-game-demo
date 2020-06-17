namespace ez {
	var fs = `
precision mediump float;
uniform float PixelSize;
uniform sampler2D texture0;
uniform float BlendWeights[LENGTH];
varying vec2 v_tc;

void main(){
	vec4 color = vec4(0.0);
	for(int i = 0; i < LENGTH; i++){
#ifdef HORIZENTAL
		float p = v_tc.x + float(i - OFFSET) * PixelSize;
		p = abs(p);
		p = min(2.0 - p, p);
		vec2 uv = vec2(p, v_tc.y);
#else
		float p = v_tc.y + float(i - OFFSET) * PixelSize;
		p = abs(p);
		p = min(2.0 - p, p);
		vec2 uv = vec2(v_tc.x, p);
#endif
		color += texture2D(texture0, uv) * BlendWeights[i];
	}
	gl_FragColor = color;
}`;

	function getEffect(horn: boolean, radius: number) {
		var name = `blur_${horn ? 'h' : 'v'}${radius}`;
		if(Effect.has(name))
			return Effect.get(name);
		var define = "";
		if(horn)
			define += "#define HORIZENTAL\n";
		define += `#define OFFSET ${radius}\n`;
		define += `#define LENGTH ${radius * 2 + 1}\n`;
		var gl = getGL();
		Effect.register(name, new Effect(define + fs,
			{ PixelSize: gl.uniform1f, BlendWeights: gl.uniform1fv }));
		return Effect.get(name);
	}

	/** 
	 * Blur特效对象
	 * 	放置在这个容器中的元素将获得模糊效果
	 */
	export class BlurStageSprite extends SubStageSprite implements IPreRender {
		private _tmpBuffer: RenderTexture;
		private _hornShader: Shader;
		private _vertShader: Shader;
		private _blendWeights: Float32Array;
		private _radius: number;

		public static Type = "BlurStage";
		public getType(): string {
			return BlurStageSprite.Type;
		}
		public constructor(parent: Stage, id?: string) {
			super(parent, id);
			//this.ownerBuffer = true;
			this.width = this.height = 1;
			//this._data = { width: 1, height: 1 };
			this.radius = 0;
		}
		/**
		 * 模糊半径
		 */
		public get radius(): number {
			return this._radius;
		}
		public set radius(val: number) {
			if(val === this._radius)
				return;
			this._radius = val;
			if(val <= 0)
				return;
			var sigma = val * 0.5;
			val = val | 0;
			var length = val * 2 + 1;

			this._blendWeights = new Float32Array(length);
			var p1 = 1 / (Math.sqrt(2 * Math.PI) * sigma);
			var p2 = 1 / (2 * sigma * sigma);
			var sum = 0;
			for(var i = 0; i < length; i++) {
				var t = (i - val);
				this._blendWeights[i] = p1 * Math.exp(-t * t * p2);
				sum += this._blendWeights[i];
			}
			sum = 1 / sum;
			for(i = 0; i < length; i++)
				this._blendWeights[i] *= sum;
			//console.log("weights", this._blendWeights);
			this._hornShader = getEffect(true, val);
			this._vertShader = getEffect(false, val);
			this._hornShader.bind("BlendWeights", this._blendWeights);
			this._vertShader.bind("BlendWeights", this._blendWeights);
			this.setDirty();
		}
		/** @internal */
		preRender(profile?: WGLPerFrameProfiler | CanvasPerFrameProfiler) {
			if(!this._rtBuffer) {
				this._rtBuffer = RenderTexture.create(this.width, this.height);
				this._tmpBuffer = RenderTexture.create(this.width, this.height);
			}
			if(this.dirty) {
				super.preRender();
				if(this.radius <= 0)
					return;
				Profile.addCommand("blur effect");
				var rc = <IRenderContextWGL>RenderContext;
				rc.beginRender(this._tmpBuffer, rc.profile);
				rc.setFillColor("#ffffff");
				rc.setShader(this._hornShader);
				this._hornShader.bind("PixelSize", 1 / this.width);
				RenderContext.drawImage(this._rtBuffer, 0, this.width, this.height);
				RenderContext.endRender();

				rc.beginRender(this._rtBuffer, rc.profile);
				rc.setShader(this._vertShader);
				this._vertShader.bind("PixelSize", 1 / this.width);
				rc.drawImage(this._tmpBuffer, 0, this.width, this.height);
				rc.endRender();
			}
		}

		protected destroyBuffer() {
			if(this._rtBuffer) {
				this._rtBuffer.dispose();
				this._rtBuffer = null;
				this._tmpBuffer.dispose();
				this._tmpBuffer = null;
			}
		}

		get ownerBuffer(): boolean { return true; }
		set ownerBuffer(val: boolean) {}
	}

	Sprite.register(BlurStageSprite.Type, (p, id) => new BlurStageSprite(p, id));

	export module ui {
		/** 
		* 带模糊特效的Group
		*/
		export class BlurGroup extends ui.Container {
			static ClassName = "BlurGroup";
			static instance: BlurGroup;
			static Properties: ui.PropDefine[] = [
				{ name: "radius", default: 0, type: "number", converter: parseFloat }
			];
			static HasChildElements = true;

			constructor(parent: ui.Container) {
				super(parent, new BlurStageSprite((<any>parent)._displayStage));
				this._init(BlurGroup);
				this.bind("radius", this._stage);
			}

			public setChilds(data: ElementData[]) {
				this.clearChilds();
				this._setChilds(data);
			}
			/**
			 * 模糊半径
			 */
			public radius: number;
		}
		ui.initUIClass(BlurGroup, ui.Container);
	}
}