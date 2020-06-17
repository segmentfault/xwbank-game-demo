/// <reference path="RenderContext.ts"/>
/**
 * @module Visual
*/
namespace ez {
	/** 
	* sprite数据定义
	*/
	export interface SpriteData {
		type: string;
		id?: string;
		blendMode?: BlendMode;
		visible?: boolean;
		zIndex?: number;
		x?: number;
		y?: number;
		scaleX?: number;
		scaleY?: number;
		scale?: number;
		width?: number;
		height?: number;
		anchorX?: number;
		anchorY?: number;
		angle?: number;
		opacity?: number;
		color?: string;
		mirrorH?: boolean;
		mirrorV?: boolean;
		skew?: number;
		effect?: string;
		effectParams?: Object;

		//image
		src?: string;
		pattern?: string;

		// substage
		clip?: boolean;
		ownerBuffer?: boolean;
		culling?: boolean;
		batchMode?: boolean;
		drawCache?: boolean;
		childs?: SpriteData[];

		//rectfill
		gradient?: string;

		//label
		text?: string;
		font?: string;
		format?: TextFormat;
		strokeColor?: string;
		strokeWidth?: number;
		bkColor?: string;
		lineHeight?: number;
		align?: AlignMode;
		margin?: Number4;

		//seqframe
		frames?: SeqFrameDesc|string[];
		fps?: number;
		loop?: boolean;
		framesDuration?: number[];
		autoPlay?: boolean;

		//载入初始化
		onLoad?: Function;
		[key: string]: any;
	}

	function makeMatrix(h: Handle): Matrix {
		var f = ezasm.handleToFloatArray(h, 6);
		return new Matrix(f[0], f[1], f[2], f[3], f[4], f[5]);
	}

	/**
	 * Sprite基类
	 */
	export abstract class Sprite implements IDispose {
		protected _parent: Stage;
		protected _id: string;
		protected _zIndex;
		private _transform: Matrix;
		protected _color: string;
		private _rev: number;
		protected _handle: Handle;
		protected _target: Sprite;
		protected _targetRev: number;
		protected _blendMode: BlendMode;
		protected _opacity: number;
		protected _effect: string;
		protected _effectParams: any;
		//protected _createData: SpriteData;
		private static types: any = {};

		/**
		 * 根据类型名创建sprite
		 * @param type: 类型名
		 * @param parent: stage容器
		 * @param id: 对象id， optional
		 */
		public static create<T extends Sprite>(type: string, parent: Stage, id?: string): T {
			if(!Sprite.types[type])
				throw new Error(`${type}Sprite is not exist!`);
			return Sprite.types[type](parent, id);
		}
		/**
		 * 注册Sprite对象类型
		 * @param type: 类型名
		 * @param creator: 创建函数
		 */
		public static register(type: string, creator: (parent: Stage, id?: string) => Sprite) {
			Sprite.types[type] = creator;
		}

		protected _dispose() {
			ezasm.poolFree(this._handle);
			this._parent = undefined;
			this._handle = 0;
			Tween.stopTweens(this);
			if(this.onDispose)
				this.onDispose();
		}
		protected get culled(): boolean {
			return ezasm.getCulled(this._handle);
		}
		protected set culled(v: boolean) {
			ezasm.setCulled(this._handle, v);
		}
		protected applyEffect(rc: IRenderContext) {
			if(!useWGL)
				return;
			(<IRenderContextWGL>rc).setShader(Effect.get(this._effect), this._effectParams);
			/*if(this._effect) {
				var shader = this._effect;
				(<IRenderContextWGL>rc).setShader(shader, this._effectParams);
			}
			else
				(<IRenderContextWGL>rc).setShader(null);*/
		}
		protected _buildTransform() {
			if(this._target && this._target.disposed)
				this._target = null;
			var parentTrans = 0;
			var changed = false;
			if(this._target) {
				this._target._buildTransform();
				parentTrans = ezasm.getlocalTrans(this._target._handle);
				changed = this._targetRev != this._target._rev;
				this._targetRev = this._target._rev;
			}
			var h = this._handle;
			var t = ezasm.getlocalTrans(h);
			if(!t || changed) {
				var rev = ezasm.buildLocalTrans(h, parentTrans);
				if(this._rev != rev) {
					this._transform = null;
					this._rev = rev;
				}
			}
		}
		protected _prepare(bound: Rect, transfrom: Handle, transChanged: boolean) {
			var handle = this._handle;
			this._buildTransform();
			if(transChanged || !ezasm.getglobalTrans(handle))
				ezasm.buildGlobalTrans(handle, transfrom);
			this.culled = this._parent.culling && ezasm.cullingTest(handle, bound.left, bound.top, bound.right, bound.bottom);
		}
		protected abstract _draw(rc: IRenderContext, opacity: number): void;

		/**
		 * 构造函数
		 * @param stage 舞台容器
		 * @param id 对象名字
		 */
		constructor(stage: Stage, id?: string) {
			if (!stage)
				throw new Error("the stage can't be null");
			this._handle = ezasm.newSpriteData();
			this._rev = -1;
			this._parent = <SubStageSprite>stage;
			this._color = "#ffffff";
			if(id)
				this._id = id;
			this._parent.addChild(this, id);
		}
		/**
		 * 获取对象类型
		 */
		abstract getType(): string;
		/**
		 * 销毁事件（销毁时触发）
		 */
		onDispose: Function;
		/**
		 * 是否已被销毁
		 */
		public get disposed() {
			return this._handle === 0;
		}
		/**
		 * 销毁sprite，销毁之后会自动从stage中移除该对象
		 */
		public dispose() {
			if(this._parent)
				this._parent.remove(this);
			else
				Log.warn("the sprite has been disposed");
		}
		/**
		 * 设置对象变化标志，触发刷新计算
		 * @description 通常该方法不需要手动调用，引擎内部会自动跟踪所有的属性变化，在绘制前检查对象的变化标志触发相关的刷新计算
		 * @param needSort 是否改变了zorder，需要重新进行z排序
		 */
		public setDirty(needSort = false) {
			if (!this._parent)
				return;
			if (this.visible)
				this._parent.makeDirty(needSort);
		}
		/**
		* 获取局部变换矩阵（相对parent）
		*/
		public get localTransform(): Matrix {
			this._buildTransform();
			if(!this._transform)
				this._transform = makeMatrix(ezasm.getlocalTrans(this._handle));
			return this._transform;
		}
		/**
		* 获取全局变换矩阵
		*/
		public get globalTransform(): Matrix {
			var t = ezasm.getglobalTrans(this._handle);
			if(t)
				return makeMatrix(t);
			else {
				var v = this.localTransform.clone();
				var p = this._parent.globalTransform;
				if(p)
					v.append(p);
				return v;
			}
		}
		/**
		* 是否显示
		*/
		public get visible(): boolean {
			return ezasm.getVisible(this._handle);
		}

		public set visible(v: boolean) {
			if(this._parent)
				this._parent.makeDirty(false);
			ezasm.setVisible(this._handle, v);
		}

		/**
		* effect特效(仅WebGL模式下支持)
		* @default null，使用默认效果
		*/
		public get effect(): string {
			return this._effect;
		}
		public set effect(val: string) {
			if (!Effect.has(val)){
				Log.error(`effect ${name} is not exist!`);
				return;
			}
			if (this._effect == val)
				return;
			this.setDirty();
			this._effect = val;		
		}
		
		/**
		 * 设置shader参数
		 */
		public set effectParams(params: Object) {
			this._effectParams = params;
			this.setDirty();
		}
		/** 
		* 颜色
		* @default #ffffff
		*/
		public get color(): string {
			return this._color;
		}
		public set color(val: string) {
			if(!val)
				val = "#ffffff";
			if(val == this._color)
				return;
			this.setDirty();
			this._color = val;
		}
		/** 
		* 设置z排序值
		* @remark 对象显示顺序自动按照zIndex顺序排序，zIndex大的在上面
		* @default 0
		*/
		public get zIndex(): number {
			return this._zIndex === undefined ? 0 : this._zIndex;
		}
		public set zIndex(val: number) {
			if(val === this._zIndex)
				return;
			this._zIndex = val;
			this.setDirty(true);
		}
		/**
		 * 判断该点是否在对象上
		 * @param x
		 * @param y
		 */
		public hitTest(x: number, y: number): boolean {
			/*var m = this.localTransform.clone();
			m.invert();
			var pt: Number2 = [x, y];
			m.transform(pt);*/
			return (x >= 0 && y >= 0 && x < this.width && y < this.height);
		}
		/**
		 * 将对象移到目标stage中
		 * @param stage 目标stage
		 */
		public setParent(stage:Stage){
			if(this.disposed)
				throw new Error("the sprite has been disposed");
			stage.addChild(this, this.id);
			this._parent._remove(this);
			this._parent = stage;
		}
		/**
		* sprite对象名字
		*/
		public get id(): string {
			return this._id;
		}
		/**
		* 将sprite对象链接到目标对象上，跟随目标对象的变换矩阵运动
	    * @param target 跟随的对象
		*/
		public link(target: Sprite) {
			this._target = target;
			this._targetRev = -1;
		}
		/**
		* 取消链接
		*/
		public unlink() {
			this._target = undefined;
		}
		/** 
		* 透明度，取值(0~1)
		*/
		public get opacity(): number {
			return this._opacity === undefined ? 1 : this._opacity;
		}
		public set opacity(v: number) {
			if (this._opacity === v)
				return;
			this._opacity = v;
			this.setDirty();
		}
		/** 
		* 混合模式
		*/
		public get blendMode(): BlendMode {
			return this._blendMode === undefined ? BlendMode.Normal : this._blendMode;
		}
		public set blendMode(v: BlendMode) {
			if (this._blendMode === v)
				return;
			this._blendMode = v;
			this.setDirty();
		}
		/** 
		* x位置
		*/
		public x: number;
		/** 
		* y位置
		*/
		public y: number;
		/** 
		* 水平方向缩放
		*/
		public scaleX: number;
		/** 
		* 垂直方向缩放
		*/
		public scaleY: number;
		/** 
		* 整体缩放
		*/
		public scale: number;
		/** 
		* 宽度
		*/
		public width: number;
		/** 
		* 高度
		*/
		public height: number;
		/** 
		* x轴锚点(0~1)，默认在左上角
		*/
		public anchorX: number;
		/** 
		* y轴锚点(0~1)，默认在左上角
		*/
		public anchorY: number;
		/** 
		* 旋转角度(顺时针)，单位为角度
		*/
		public angle: number;
		/** 
		* 水平方向斜切
		*/
		public skew: number;
		/** 
		* 水平方向镜像
		*/
		public mirrorH: boolean;
		/** 
		* 垂直方向镜像
		*/
		public mirrorV: boolean;
	}

	initCall(function () {
		function setProp(name, getFunc, setFunc) {
			Object.defineProperty(Sprite.prototype, name, {
				get: function () { 
					var h = this._handle;
					if(!h) return;
					return getFunc(h);
				},
				set: function (v) {
					var h = this._handle;
					if(!h) return;
					if(setFunc(h, v))
						this.setDirty();
				},
				enumerable: true,
				configurable: true
			});
		}
		let props = ["x", "y", "scaleX", "scaleY", "scale", "width", "height",
			"anchorX", "anchorY", "angle", "skew"];//, "opacity", "blendMode"];
		for(let i = 0; i < props.length; i++) {
			let n = props[i];
			setProp(n, ezasm["get" + n], ezasm["set" + n]);
		}
		setProp("mirrorH", ezasm.getMirrorH, ezasm.setMirrorH);
		setProp("mirrorV", ezasm.getMirrorV, ezasm.setMirrorV);
	});
}