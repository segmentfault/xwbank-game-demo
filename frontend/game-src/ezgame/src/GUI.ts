/// <reference path="Sprite.ts"/>
/// <reference path="parser.ts"/>
/** 
 * @module GUI
*/
namespace ez.ui {
	import parse = ez.parse;
	/**
	* UI属性绑定数据定义
	*/
	export interface DataBinderItem {
		/**
		* 源对象，源对象需从DataModel继承
		*/
		src?: Object;
		/**
		* 源属性名字
		*/
		prop: string;
		/**
		* 目标对象
		*/
		target: Object;
		/**
		* 目标属性名字
		*/
		targetProp?: string;
		/**
		* 转换函数
		*/
		converter?: (val: any) => any;
    }

	/**
	* UI属性定义，供UI模板编译器使用
	*/
	export interface PropDefine {
		name: string;
		type: string;
        default?: any;
		converter?: (data: string) => any;
		validate?: string;
		customProperty?: boolean;
	}
	/**
	* Control状态迁移的子项数据定义
	*/
	/*export interface StateItemData {
		target: any;
		targetProp: string;
		value?: any;
		src?: any;
		srcProp?: string;
	}*/
	/**
	* Control状态迁移数据定义
	*/
	export interface ControlStateData {
		/*
		 * 状态进入事件
		 * @summary 可用于实现迁移动画
		 */
		onEnter?: (ctrl: Control, lastState: string) => void;
		/*
		 * 状态离开事件
		 * @summary 可用于实现迁移动画
		 */
		onLeave?: (ctrl: Control, newState: string) => void;
		/*
		 * 属性列表（用于当设置状态时修改控件及子元素的属性）
		 */
		props?: Dictionary<any>;
	}
	/**
	* UI元素的数据定义
	*/
	export interface ElementData {
		class: string;
		id?: string;
		childsProperty?: any;
		_array?: any[];
		_childs?: any[];
        [x: string]: any;
	}
	/**
	 * UI类的元数据
	 */
	export interface UIClassData {
		prototype: any;
		ClassName: string;
		Properties: PropDefine[];
		HasChildElements?: boolean;
		States?: Dictionary<ControlStateData>;
		Styles?: Dictionary<any>;
		baseclass: UIClassData;
		hasProperty(prop: string) : boolean;
		
	}

	export interface ControlClass {
		prototype: any;
		mixins(eventHander: any): void;
		checkStates(...states: string[]);
	}

	/**
	* UI事件
	*/
	export interface EventArgs {
		/**
		* 事件名字
		*/
		name: string;
		/**
		* 发起事件的控件
		*/
		sender: Element;
		/**
		* 事件参数
		*/
		arg?: any;
		/**
		* 是否向上冒泡
		*/
		bubble: boolean;
	}

	/**
	 * 文本样式
	 * @summary 文本样式包含了一组文本相关的属性，用于设置控件上的文本样式，控件的文本样式会逐级向上继承父容器上的文本样式，通过向容器设置文本样式方便统一更改每个子控件的文本样式
	 */
	export interface TextStyle {
		/**
		 * 样式名
		*/
		id: string;
		font?: string;
		format?: TextFormat;
		strokeColor?: string;
		strokeWidth?: number;
		color?: string;
		bkColor?: string;
		lineHeight?: number;
		align?: AlignMode;
		margin?: Number4;
		gradient?: GradientFill;
	}

	/**
	 * UI模板数据
	 * @description 通过uiml定义template，可以实现UI类的逻辑和样式分离，用户可以在uiml中定义UI类的属性、childs、数据绑定和事件处理。
	 * 在template中重新定义childs，从而获得新的外观、布局等信息。当这个UI类创建的时候指定template属性就可以将UI的外观和布局替换成模板
	 * 中所定义的内容，从而实现逻辑和样式的独立修改。
	 */
	export interface Template {
		name: string;
		childs: ElementData[]|any[];
		init(ui: Container);
	}

	var fontStyles = {};
	var templates = {};

	/**
	 * 注册UI模板
	 * @param temps 
	 */
	export function registerTemplates(temps: Dictionary<Template>|Template[]) {
		for(let k in temps)
			templates[temps[k].name] = temps[k];
	}
	/**
	 * 获取ui模板
	 * @param name 模板名
	 * @returns template 
	 */
	export function getTemplate(name: string): Template{
		var t = templates[name];
		if(!t)
			Log.warn(`not find template ${name}`);
		return t;
	}
	/**
	 * 添加一个/一组文本样式
	 * @param style 
	 */
	export function registerTextStyle(style: TextStyle | TextStyle[]) {
		if (Array.isArray(style)) {
			for (var i = 0; i < style.length; i++) {
				registerTextStyle(style[i]);
			}
		}
		else {
			if (DEBUG && fontStyles.hasOwnProperty(style.id) && style.id != "default")
				Log.warn(`the textstyle ${style.id} is already registered.`);
			fontStyles[style.id] = style;
			style.toString = function () { return this.id; }
		}
	}
	/**
	 * 获取文本样式
	 * @param style 样式名
	 */
	export function getTextStyle(style: string) {
		if (DEBUG && !fontStyles.hasOwnProperty(style))
			Log.warn(`the textstyle ${style} is not registered.`);
		return fontStyles[style];
	}

	export function getTextStyleNames(): string[] {
		return Object.getOwnPropertyNames(fontStyles);
	}

	var _uiClasses = {};

	export function getAllGuiClassNames(): string[] {
		return Object.getOwnPropertyNames(_uiClasses);
	}

	export function getGuiClass(name: string): UIClassData {
		return _uiClasses[name];
	}
	
	/**@internal */
	export function createUIElement(name: string, parent: Container): Element {
		var cls = _uiClasses[name];
		if (!cls)
			throw new Error(`the ui class:'${name}' is not exist!`);
		var c = new cls(parent);
		return c;
	}

	function setObjProp(prototype, name) {
		Object.defineProperty(prototype, name, {
			get: function () { return this.getProp(name) },
			set: function (val) { this.setProp(name, val); },
			enumerable: true,
			configurable: true
		});
	}
	/** 注册UI类 */
	export function initUIClass(uiClass: UIClassData, baseClass: UIClassData, abstract?: boolean) {
		var cls = <any>uiClass;
		cls.baseclass = baseClass;
		cls._properties = {};
		cls._propDefaults = {};
		cls._propConverters = {};
		function copyVals(d, b){
			for(let k in b)
				d[k] = b[k];
		}
		if(baseClass){
			let base = <any>baseClass;
			copyVals(cls._properties, base._properties);
			copyVals(cls._propDefaults, base._propDefaults);
			copyVals(cls._propConverters, base._propConverters);
		}
		if (cls.Properties) {
			let props = <PropDefine[]>cls.Properties;
			for (let i = 0; i < props.length; i++) {
				let prop = props[i];
				if (!prop.customProperty)
					setObjProp(cls.prototype, prop.name);
				cls._properties[props[i].name] = "";
				if(prop.default !== undefined)
					cls._propDefaults[prop.name] = prop.default;
				if (prop.converter)
					cls._propConverters[prop.name] = prop.converter;
			}
		}
		if(!abstract) {
			var name = cls.ClassName;
			if(_uiClasses.hasOwnProperty(name))
				throw new Error("the gui class name conflict! name=" + name);
			_uiClasses[name] = cls;
		}
	}

	function calcDimension(dim: Dimension, size: number) {
		return dim ? dim.calcSize(size) : undefined;
	}

	interface BoundDimension {
		x?: number;
		y?: number;
		left?: number;
		top?: number;
		right?: number;
		bottom?: number;
		width?: number;
		height?: number;
	}
	function hasValue(x) {
		return typeof (x) === "number";
	}
	function calcDim(width: number, height: number): BoundDimension {
		var dim: BoundDimension = {};
		dim.left = calcDimension(this.left, width);
		dim.right = calcDimension(this.right, width);
		dim.top = calcDimension(this.top, height);
		dim.bottom = calcDimension(this.bottom, height);
		dim.x = calcDimension(this.x, width);
		dim.y = calcDimension(this.y, height);

		if (hasValue(dim.left) && hasValue(dim.right))
			dim.width = Math.max(0, width - dim.right - dim.left);
		else
			dim.width = calcDimension(<Dimension>this.width, width);

		if (hasValue(dim.top) && hasValue(dim.bottom))
			dim.height = Math.max(0, height - dim.bottom - dim.top);
		else
			dim.height = calcDimension(<Dimension>this.height, height);
		return dim;
	}

	function toRect(width: number, height: number, dim: BoundDimension): Rect {
		if (!hasValue(dim.left)) {
			if (hasValue(dim.right))
				dim.left = width - dim.right - dim.width;
			else if (hasValue(dim.x))
				dim.left = dim.x - this.anchorX * dim.width;
			else
				dim.left = 0;
		}
		if (!hasValue(dim.top)) {
			if (hasValue(dim.bottom))
				dim.top = height - dim.bottom - dim.height;
			else if (hasValue(dim.y))
				dim.top = dim.y - this.anchorY * dim.height;
			else
				dim.top = 0;
		}
		return new Rect(dim.left, dim.top, dim.width, dim.height);
	}

	function removeEvent() {
		if (this._p) {
			this.disposed = true;
			var events = this._p._events;
			this._p = null;
			var name = this.name;
			var n = events[name];
			if (Array.isArray(n)) {
				var idx = n.indexOf(this);
				if (idx != -1)
					n.splice(idx, 1);
			}
			else if (n == this)
				delete events[name];
		}
	}

	function childSizeChanged() {
		if (this.childSizeChanged) {
			this.childSizeChanged();
			return;
		}
		if (!this._sizeDirty) {
			childSizeChanged.call(this._parent);
		}
		this._sizeDirty = true;
	}

	//create child with compact mode
	function convPropArray(clsName, props, id, left, top, right, bottom, width, height, x, y, opacity, visible, scale, angle, anchorX, anchorY, zIndex, touchable, childsProperty, array, childs) {
		var c = <any>{};
		c.class = clsName;
		if(undefined !== x) c.x = x;
		if(undefined !== y) c.y = y;
		if(undefined !== left) c.left = left;
		if(undefined !== top) c.top = top;
		if(undefined !== right) c.right = right;
		if(undefined !== bottom) c.bottom = bottom;
		if(undefined !== width) c.width = width;
		if(undefined !== height) c.height = height;
		if(undefined !== opacity) c.opacity = opacity;
		if(undefined !== visible) c.visible = visible;
		if(undefined !== scale) c.scale = scale;
		if(undefined !== angle) c.angle = angle;
		if(undefined !== anchorX) c.anchorX = anchorX;
		if(undefined !== anchorY) c.anchorY = anchorY;
		if(undefined !== zIndex) c.zIndex = zIndex;
		if(undefined !== touchable) c.touchable = touchable;
		if(undefined !== id) c.id = id;
		if(props)
			for(var k in props)
				c[k] = props[k];
		if(array)
			c._array = array;
		if(childsProperty)
			c.childsProperty = childsProperty;
		if(childs)
			c._childs = childs;
		return c;
	}

	var g_parentChilds: any;

	/**
	* UI基类，提供基础UI属性，数据绑定， 布局计算
	*/
	export class Element extends DataModel {
		private static _properties: any;
		protected static _propDefaults: Dictionary<any>;
		protected static _propConverters: Dictionary<(val: any) => any>;
		static baseclass: UIClassData;
		static ClassName = "Element";
		static Properties: PropDefine[] = [
			{ name: "x", type: "number|string|Dimension", converter: parse.Dimension, validate: "dimension" },
			{ name: "y", type: "number|string|Dimension", converter: parse.Dimension, validate: "dimension" },
			{ name: "left", type: "number|string|Dimension", converter: parse.Dimension, validate: "dimension" },
			{ name: "top", type: "number|string|Dimension", converter: parse.Dimension, validate: "dimension" },
			{ name: "right", type: "number|string|Dimension", converter: parse.Dimension, validate: "dimension" },
			{ name: "bottom", type: "number|string|Dimension", converter: parse.Dimension, validate: "dimension" },
			{ name: "width", type: "number|string|Dimension", converter: parse.Dimension, validate: "dimension" },
			{ name: "height", type: "number|string|Dimension", converter: parse.Dimension, validate: "dimension" },
			{ name: "opacity", default: 1, type: "number", converter: parse.Float, validate: "opacity" },
			{ name: "visible", default: true, type: "boolean", converter: parse.Boolean },
			{ name: "scaleX", default: 1, type: "number", converter: parse.Float, validate: "scale" },
			{ name: "scaleY", default: 1, type: "number", converter: parse.Float, validate: "scale" },
			{ name: "scale", default: 1, type: "number", converter: parse.Float, validate: "scale" },
			{ name: "angle", default: 0, type: "number", converter: parse.Float, validate: "angle" },
			{ name: "anchorX", default: 0.5, type: "number", converter: parse.Float, validate: "float" },
			{ name: "anchorY", default: 0.5, type: "number", converter: parse.Float, validate: "float" },
			{ name: "zIndex", default: 0, type: "number", converter: parse.Int, validate: "int" },
			{ name: "touchable", default: true, type: "boolean", converter: parse.Boolean }
		];
		static hasProperty(prop: string): boolean {
			return this._properties.hasOwnProperty(prop);
		}
		protected _bound: Rect = null;
		protected _parent: Container;
		//protected _styles: any;
		//protected _onBoundChange() { }
		//private _class: UIClassData;
		private _id: string;
		private _events: Dictionary<EventHandler | EventHandler[]> = {};

		protected _setProps(props: Dictionary<any>) {
			for(let k in props) {
				if(k === "class" || k === "id" || k === "_array") {
					continue;
				}
				else if(k === "childsProperty" || k === "_childs") {
					Log.error(`${this.class.ClassName} can't have childs`);
				}
				else if(k === "style") {
					this[k] = props[k];
				}
				else {
					if(DEBUG && !this.class.hasProperty(k))
						Log.error(`The ${this.class.ClassName} has no '${k}' property!`);
					this[k] = props[k];
				}
			}
		}
		/*		
		protected _initProperties() {
			*for (var i = 0; i < props.length; i++) {
				var p = props[i];
				if (p.hasOwnProperty("default"))
					this.setProp(p.name, p.default);
				if (p.converter)
					this.setPropConverter(p.name, p.converter);
			}
		}*/
		protected _init(uiClass){
			this.setDefaults(uiClass._propDefaults);
			this.setPropConverters(uiClass._propConverters);
		}

		constructor(parent: Container) {
			super();
			this._init(Element);
			var sizeProperties = ["left", "top", "right", "bottom", "width",
				"height", "x", "y", "anchorX", "anchorY"];
			function f() {
				this._bound = null;
				childSizeChanged.call(this._parent);
			}
			for (var p in sizeProperties)
				this.addObserver(sizeProperties[p], f, this);
			this._parent = parent;
			if (this.onCreate)
				callNextFrame(function() {
					if(!this.disposed)
						this.onCreate();
				}, this);
		}
		private _fireEvent(e: EventArgs) {
			if(this.disposed)
				return;
			var h = this._events[e.name];
			let parent = this.parent;
			if (h) {
				if (Array.isArray(h)) {
					for (var i = 0; i < h.length; i++)
						h[i].func.call(h[i].ctx, e);
				}
				else
					h.func.call(h.ctx, e);
				if (e.bubble)
					parent._fireEvent(e);
			}
			else
				parent._fireEvent(e);
		}
		/** 
		* 发起一个自定义事件
		* @param event: 事件名字
		* @param arg: 事件参数
		* @param bubble: 是否向上冒泡，默认为false
		*/
		public fireEvent(event: string, arg?: any, bubble?: boolean) {
			if (bubble === undefined)
				bubble = false;
			this._fireEvent({
				name: event,
				arg: arg,
				bubble: bubble,
				sender: this
			});
		}
		/** 
		* 添加事件的回调处理函数
		* @param event: 事件名字
		* @param func: 事件回调函数
		* @param ctx: this上下文
		*/
		public addEventHandler(event: string, func: (e: EventArgs) => any, ctx?: any): IDispose {
			var t = { name: event, func: func, ctx: ctx, _p: this, disposed: false, dispose: removeEvent };
			if (!this._events[event]) {
				this._events[event] = t;
			}
			else {
				var o = this._events[event];
				if (Array.isArray(o))
					o.push(t);
				else
					this._events[event] = [o, t];
			}
			return t;
		}

		/**
		 * 从父容器中移除并销毁该UI对象
		 */
		public dispose() {
			if(this.disposed) {
				Log.error("the element has been disposed.");
				return;
			}
			this._parent._removeChild(this);
			this._parent = null;
			this._bound = null;
			Tween.stopTweens(this);
			super.dispose();
		}

		/**
		 * 获取控件类的元数据
		 */
		public get class(): UIClassData { return (<any>this).constructor; }
		/** 
		* 控件id标识
		* @remark 每个自定义的UI类都可以包含若干带id名字的子UI元素，可以通过find方法查找，也可以通过namedChilds属性访问
		*/
		public get id(): string { return this._id; }
		
		/** 
		* 左边界位置
		* @remark set可以是number,string,Dimension类型，get时为Dimension类型
		*/
		public left: number | string | Dimension;
		/** 
		* 上边界位置
		*/
		public top: number | string | Dimension;
		/** 
		* 右边界位置
		* @remark 设置右边位置属性使得控件的右边自动跟随父控件的右边对齐
		*/
		public right: number | string | Dimension;
		/** 
		* 底边界位置
		* @remark 设置底边位置属性使得控件的底边自动跟随父控件的底边对齐
		*/
		public bottom: number | string | Dimension;
		/** 
		* 基于anchor点的x位置
		* @remark 当left和right都未设置时由x确定控件位置
		*/
		public x: number | string | Dimension;
		/** 
		* 基于anchor点的y位置
		* @remark 当top和bottom都未设置时由y确定控件位置
		*/
		public y: number | string | Dimension;
		/** 
		* 宽度
		*/
		public width: number | string | Dimension;
		/** 
		* 高度
		*/
		public height: number | string | Dimension;
		/** 
		* 透明度，0~1
		*/
		public opacity: number;
		/** 
		* 可见性
		*/
		public visible: boolean;
		/** 
		* 水平缩放倍率
		* @remark 缩放和旋转仅改变UI元素的显示，但不会影响到UI的边界和布局
		*/
		public scaleX: number;
		/** 
		* 垂直缩放倍率
		*/
		public scaleY: number;
		/** 
		* 缩放倍率
		*/
		public scale: number;
		/** 
		* 旋转角度
		*/
		public angle: number;
		/** 
		* 控件中心点水平位置，0~1
		*/
		public anchorX: number;
		/** 
		* 控件中心点垂直位置，0~1
		*/
		public anchorY: number;
		/** 
		* 是否可触控，若设置为不可触控则点击判断会穿过该控件
		*/
		public touchable: boolean;
		/** 
		* z排序值
		*/
		public zIndex: number;

		/** 
		* 控件创建完成事件
		* @remark 可以通过uiClass.prototype.onCreate来绑定事件处理函数
		*/
		public onCreate: () => void;
		
		//public set style(style: string) {
		//	if(!style)
		//		return;
		//	var styles = this.class.Styles;
		//	if(!styles || !styles[style])
		//		throw new Error(`style ${style} is not exist.`);
		//	this._setProps(styles[style]);
		//	/*if(typeof style === "string") {
		//		var styles = this.class.Styles;
		//		if(!styles || !styles[style])
		//			throw new Error(`style ${style} is not exist.`);
		//		this.style = styles[style];
		//	}
		//	else if (style) {
		//		for (var k in style) {
		//			if (DEBUG && !this.class.hasProperty(k))
		//				Log.error(`The UIElement has no '${k}' property!`);
		//			this.setProp(k, style[k]);
		//		}
		//	}*/
		//}
		/** 
		* 父UI容器
		*/
		public get parent(): Container {
			return this._parent;
		}
		protected textStyleChanged() {
		}
		protected get parentStage(): Stage {
			return (<any>this._parent)._displayStage;
		}

		/** 
		* 获取UI元素的边界
		* @remark UI元素的布局计算是lazy evaluate的，在游戏逻辑中不管怎么修改布局属性，都不会立刻计算元素的边界，
		* 而是等到渲染前统一计算，这样节省了大量计算资源，但是也可能会导致依赖于元素边界数据的逻辑代码出现错误，因此在getBound()时
		* 可能返回null，这时需要调用measureBound(width, height, true)强制计算一下bound。 
		*/
		public getBound(): Rect {
			return this._bound;
		}

		/** 
		* 屏幕坐标转换为UI局部坐标
		*/
		public screenToClient(x: number, y: number): Point {
			if (this._bound) {
				x -= this._bound.left;
				y -= this._bound.top;
			}
			return this.parent.screenToClient(x, y);
		}
		/** 
		* UI局部坐标转换为屏幕坐标
		*/
		public clientToScreen(x: number, y: number): Point {
			if (this._bound) {
				x += this._bound.left;
				y += this._bound.top;
			}
			return this.parent.clientToScreen(x, y);
		}
		/** 
		* 设置边界（内部使用）
		*/
		public setBound(bound: Rect) {
			this._bound = bound;
			this.fireEvent("boundChange", bound, false);
			//this._onBoundChange();
		}
		/** 
		* 测量UI元素的边界
		*/
		public measureBound(w: number, h: number, force: boolean = false) {
			if (!force && this._bound)
				return;
			var dim = calcDim.call(this, w, h);
			dim.width = dim.width || 0;
			dim.height = dim.height || 0;
			this._bound = toRect.call(this, w, h, dim);
			this.fireEvent("boundChange", this._bound, false);
		}
		/** 
		* 测量点是否在控件内，xy为父控件坐标空间
		*/
		public ptInBound(x: number, y: number): boolean {
			return this._bound && this.touchable && this.visible && this._bound.contains(x, y);
		}
		/** 
		* 点击判定，xy为本控件坐标空间
		*/
		public hitTest(x: number, y: number): boolean {
			return false;
		}
		/** 
		* 查找点中的控件，xy为父控件坐标空间
		*/
		public findControls(x: number, y: number): ui.Control[] {
			if (!this.ptInBound(x, y))
				return null;
			x -= this._bound.left;
			y -= this._bound.top;
			return this.hitTest(x, y) ? [] : null;
		}
		/**
		 * 查找坐标点中的所有元素
		 */
		public findElements(x: number, y: number, results: ui.Element[]) {
			if (!this.ptInBound(x, y))
				return;
			x -= this._bound.left;
			y -= this._bound.top;
			if (this.hitTest(x, y))
				results.push(this);
		}
	}
	initUIClass(Element, null, true);

	interface EventHandler {
		func: Function;
		ctx: any;
	}

	/** 
	* UI容器基类，从Container继承的类中可以包含子元素
	*/
	export class Container extends Element {
		protected _childs: Array<Element> = [];
		protected _stage: SubStageSprite;
		protected _lastBound: Rect;
		protected _sizeDirty: boolean = false;
		protected _namedChilds: Dictionary<Element> = {};
		private _style: string;

		static ClassName = "Container";
		static Properties: PropDefine[] = [
			{ name: "culling", default: false, type: "boolean", converter: parse.Boolean },
			{ name: "clip", default: false, type: "boolean", converter: parse.Boolean },
			{ name: "drawCache", default: false, type: "boolean", converter: parse.Boolean },
			{ name: "batchMode", default: false, type: "boolean", converter: parse.Boolean },
			{ name: "ownerBuffer", default: false, type: "boolean", converter: parse.Boolean },
			{ name: "textStyle", type: "string", validate: "textStyle" }
		];

		_removeChild(child: Element) {
			var idx = this._childs.indexOf(child);
			if (idx == -1)
				throw new Error("child not exist!");
			this._childs.splice(idx, 1);
		}
		protected _setChilds(data: ElementData[] | any[]) {
			for(var i = 0; i < data.length; i++) {
				var props = data[i];
				if(Array.isArray(props))
					props = convPropArray.apply(null, props);
				let klass = _uiClasses[props.class];
				if (!klass)
					throw new Error(`${props.class} is not exist!`);
				if(props._array) {
					let a = [];
					if(g_parentChilds && props.id)
						g_parentChilds[props.id] = a;
					let p: any = {};
					for(let k in props)
						if(k !== "_array")
							p[k] = props[k];
					for(let j = 0; j < props._array.length; j++) {
						if(props.id)
							p.id = props.id + j;
						var c = <any>this.createChild(klass, p);
						c._setProps(props._array[j]);
						a.push(c);
					}					
				}
				else
					this.createChild(klass, props);
			}
		}
		protected _setProps(props: Dictionary<any>) {
			for(let k in props) {
				if(k === "class" || k === "id" || k === "_array") {
					continue;
				}
				else if(k === "_childs") {
					if(!this.class.HasChildElements)
						Log.error(`The ${this.class.ClassName} can't has childs!`);
					else
						(<any>this).setChilds(props[k]);
				}
				else if(k === "childsProperty" || k === "style") {
					this[k] = props[k];
				}
				else {
					if(DEBUG && !this.class.hasProperty(k))
						Log.error(`The ${this.class.ClassName} has no '${k}' property!`);
					this[k] = props[k];
				}
			}
		}
		protected _createChilds(data: ElementData[] | any[]) {
			var parentChilds = g_parentChilds;
			g_parentChilds = this._namedChilds;
			this._setChilds(data);
			g_parentChilds = parentChilds;
		}
		/**
		 * 根据名字查找子元素
		 * @param id 元素id
		 * @param recursive 是否递归向下级容器查找
		 */
		public find(id: string, recursive?: boolean): Element {
			if (this._namedChilds[id])
				return this._namedChilds[id];
			if(!recursive)
				return null;
			for(var i = 0; i < this._childs.length; i++) {
				var c = this._childs[i];
				if(typeof (<any>c).find === "function") {
					var k = (<any>c).find(id, recursive);
					if(k)
						return k;
				}
			}
			return null;
		}

		/** 
		* 删除所有的子元素
		*/
		public clearChilds() {
			var childs = this._childs.concat();
			for (var i = 0; i < childs.length; i++)
				childs[i].dispose();
		}

		public dispose() {
			if(this.disposed) {
				Log.error("the control has been disposed!");
				return;
			}				
			this.clearChilds();
			this._childs = null;
			this._stage.dispose();
			this._stage = null;
			super.dispose();
		}
		/** 
		* 获得子元素数量
		*/
		public get childCount() {
			return this._childs.length;
		}
		/** 
		* 根据index获得子元素
		*/
		public getChild(idx: number) {
			if (idx < 0 || idx >= this._childs.length)
				throw new RangeError();
			return this._childs[idx];
		}

		protected get _displayStage(): Stage {
			return this._stage;
		}

		protected textStyleChanged() {
			for (var i in this._childs) {
				var c = <any>this._childs[i];
				c.textStyleChanged();
			}
		}
		constructor(parent: Container, stage?: SubStageSprite) {
			super(parent);
			this.setDefaults(Container._propDefaults);
			this.setPropConverters(Container._propConverters);
			stage = stage || new SubStageSprite(this.parentStage);
			this._stage = stage;
			this.bind("culling", stage);
			this.bind("opacity", stage);
			this.bind("visible", stage);
			this.bind("scaleX", stage);
			this.bind("scaleY", stage);
			this.bind("scale", stage);
			this.bind("angle", stage);
			this.bind("clip", stage);
			this.bind("zIndex", stage);
			this.bind("ownerBuffer", stage);
			this.bind("drawCache", stage);
			this.bind("batchMode", stage);
			this.addObserver("textStyle", this.textStyleChanged, this);
			this.addEventHandler("boundChange", function (e) {
				var b = this._bound;
				if (!b) return;
				stage.width = b.width;
				stage.height = b.height;
				stage.anchorX = this.anchorX;
				stage.anchorY = this.anchorY;
				stage.x = b.left + stage.anchorX * b.width;
				stage.y = b.top + stage.anchorY * b.height;
			}, this);
		}

		/** 
		* 是否在渲染前预先剔除超出边界范围的物体，默认为false
		*/
		public culling: boolean;
		/**
		* 是否在渲染前预先剔除超出边界范围的物体，默认为false
		*/
		public drawCache: boolean;
		/** 
		* 是否显示超出边界的子元素，默认为false
		*/
		public clip: boolean;
		/** 
		* 是否自带显示缓冲区，默认为false
		*/
		public ownerBuffer: boolean;
		/**
		* 跨stage的自动合批模式
		* @remark 打开改选项可以将该容器下的所有子元素按照渲染状态进行重新排序，以尽可能有利于合批提高渲染性能（但也可能造成前后次序错误，谨慎使用）
		*/
		public batchMode: boolean;
		/**
		* 文本样式
		* @remark Label子控件会逐级向父容器请求文本样式
		*/
		public textStyle: string;

		/**
		*  创建子元素
		 * @param uiclass UI类型
		 * @param [props] 属性表
		 * @returns child ui子元素
		 */
		public createChild<T extends Element>(uiclass: UIClass<T>, props?: any): T {
			//let c = <any>createUIElement(className, this);
			var klass = _uiClasses[uiclass.ClassName];
			if (!klass)
				throw new Error(`${uiclass.ClassName} is not registered.`);
			var tname = props?.template;
			var template;
			if (tname){
				template = templates[tname];
				if (!template)
					Log.error(`template '${tname}' is not exist!`);
			}
			let c = new klass(this, template);
			this._childs.push(c);
			childSizeChanged.call(this);
			if(props) {
				c._setProps(props);
				if(props.id) {
					if(this._namedChilds[props.id])
						Log.warn("child id conflict.", this._namedChilds, props.id);
					this._namedChilds[props.id] = c;
					if(g_parentChilds && g_parentChilds != this._namedChilds) {
						if(g_parentChilds[props.id])
							Log.warn("child id conflict.", g_parentChilds, props.id);
						g_parentChilds[props.id] = c;
					}
					c._id = props.id;
				}
			}
			return <T>c;
		}
		/** 
		* 测量边界
		*/
		public measureBound(w: number, h: number, force: boolean = false) {
			if (force || !this._bound) {
				const dim = calcDim.call(this, w, h);
				if ((dim.width === undefined) || (dim.height === undefined)) {
					let w1 = dim.width || 0, h1 = dim.height || 0;
					let w2 = 0, h2 = 0;
					for(let i = 0; i < this._childs.length; i++) {
						const c = this._childs[i];
						c.measureBound(w1, w2, false);
						const r = c.getBound();
						w2 = Math.max(w2, r.right);
						h2 = Math.max(h2, r.bottom);
					}
					dim.width = dim.width || w2;
					dim.height = dim.height || h2;
				}
				this._bound = toRect.call(this, w, h, dim);
				this.fireEvent("boundChange", this._bound, false);
			}
			if (!this._lastBound ||
				this._lastBound.width != this._bound.width ||
				this._lastBound.height != this._bound.height) {
				let lastBound = this._lastBound;
				this._lastBound = this._bound;
				for(let i = 0; i < this._childs.length; i++) {
					const child = this._childs[i];
					child.measureBound(this._bound.width, this._bound.height, true);
				}
			}
			else if (this._sizeDirty) {
				for(let i = 0; i < this._childs.length; i++) {
					const child = this._childs[i];
					child.measureBound(this._bound.width, this._bound.height, false);
				}
			}
			this._sizeDirty = false;
		}
		/**
		 * 查找目标点下的Control及其子Control
		 */
		public findControls(x: number, y: number): Control[] {
			if (!this.ptInBound(x, y))
				return null;
			x -= this._bound.left;
			y -= this._bound.top;
			for (var i = this._childs.length - 1; i >= 0; i--) {
				var r = this._childs[i].findControls(x, y);
				if (r)
					return r;
			}
			return this.hitTest(x, y) ? [] : null;
		}
		/**
		 * 查找坐标点中的所有元素
		 */
		public findElements(x: number, y: number, results: ui.Element[]) {
			if (!this.ptInBound(x, y))
				return;
			x -= this._bound.left;
			y -= this._bound.top;
			for (var i = this._childs.length - 1; i >= 0; i--)
				this._childs[i].findElements(x, y, results);
			if (this.hitTest(x, y))
				results.push(this);
		}

		protected _setStyle(style: Dictionary<any>) {
			for(var k in style) {
				if(k == "childsProperty") {
					this.childsProperty = style[k];
					/*var childs = style[k];
					for (var n in childs) {
						if (!this._namedChilds[n])
							throw new Error(`child ${n} is not exist.`);
						this._namedChilds[n].style = childs[n];
					}*/
				}
				else {
					if(DEBUG && !this.class.hasProperty(k))
						Log.error(`The ${this.class.ClassName} has no '${k}' property!`);
					else
						this[k] = style[k];
				}
			}
		}
		/**
		* 设置样式
		* @remark 样式可以为字符串，表示从控件类的样式表（styles）里寻找相应的样式，在uiml里要预先定义相应的样式表。style对象为一个JSON对象，包含一组属性值
		*/
		public set style(style: string) {
			if(!style)
				return;
			if(!this.class.Styles || !this.class.Styles[style])
				throw new Error(`style ${style} is not exist in ${this.class.ClassName}.`);
			this._setStyle(this.class.Styles[style]);
			this._style = style;
		}
		public get style():string {
			return this._style;
		}
		/**
		 * 设置namedChilds元素的属性
		 */ 
		public set childsProperty(properties: Dictionary<any>) {
			for(var k in properties) {
				var child = this._namedChilds[k];
				if(!child) {
					Log.warn(`namedChild '${k}' is not exist.`);
					continue;
				}
				var props = properties[k];
				for(var n in props) {
					if(n !== "style" && !child.class.hasProperty(n))
						Log.warn(`The UI[${child.class.ClassName}] has no '${n}' property!`);
					else
						child[n] = props[n];
				}
			}
		}
	}
	initUIClass(Container, Element, true);


	/** 
	* 简单的UI容器类，用于包含多个子元素
	*/
	export class Group extends Container {
		static ClassName = "Group";
		static instance: Group;
		static Properties: PropDefine[] = [];
		//static ChildElementsProperty = "childs";
		static HasChildElements = true;
		constructor(parent: Container) {
			super(parent);
			//this.setProp("childs", null);
		}
		/**
		 * 设置子控件
		 */
		public setChilds(data: ElementData[]) {
			this.clearChilds();
			this._setChilds(data);
		}
	}
	initUIClass(Group, Container);
	//registerGuiClass("Group", Group);

	/** 
	* 控件基类
	* @remark 控件可以接收和处理触摸事件，控件类可以定义状态表
	*/
	export class Control extends Container implements TouchHandler {
		static ClassName = "Control";
		static instance: Control;
		static States: Dictionary<ControlStateData>;
		static Properties: PropDefine[] = [
			{ name: "state", default: null, type: "string" },
			{ name: "hittable", type: "boolean" }
		];
		/**
		 * 将Touch事件处理类混入当前Control类中
		 * @param eventHander Touch事件处理类，可以从EventHandlerBase继承，用于处理Touch事件
		 */
		static mixins(eventHander: any) {
			let b = eventHander.prototype;
			let p = this.prototype;
			let names = Object.getOwnPropertyNames(b);
			for (var k of names){
				if(k == "constructor")
					continue;
				p[k] = b[k];
			}
		}
		/** 
		* 检查控件状态表是否完整
		*/
		static checkStates(...states: string[]) {
			if (!this.States)
				throw new Error("the control has no states table.");
			for (var i = 0; i < states.length; i++) {
				var s = states[i];
				if (!this.States[s])
					throw new Error(`states[${s}] is missing!`);
			}
		}

		constructor(parent: Container) {
			super(parent);
		}
		/** 
		* 触摸点按下事件
		*/
		public onTouchBegin: (e: TouchData) => void;
		/** 
		* 触摸点移动事件
		*/
		public onTouchMove: (e: TouchData) => void;
		/** 
		* 触摸点抬起事件
		*/
		public onTouchEnd: (e: TouchData) => void;
		/** 
		* 触摸点事件被取消
		*/
		public onTouchCancel: (id: number) => void;
		/** 
		* 当前状态
		*/
		public state: string;

		/**
		 * 控件是否默认可点中
		 * @remark 设置为hittable时Control区域内都可被点中，否则将调用Control内子元素的hitTest方法来决定Control是否被点中
		 */
		public hittable: boolean;

		public hitTest(x:number, y:number):boolean {
			if (this.hittable)
				return true;
			return super.hitTest(x, y);
		}
		
		protected _setStyle(style: Dictionary<any>) {
			for(var k in style) {
				if(k === "childsProperty") {
					this.childsProperty = style[k];
				}
				else if(k === "States") {
					this._states = style["States"];
					this._stateChange(this.state, this.state);
				}
				else {
					if(DEBUG && !this.class.hasProperty(k))
						Log.error(`The ${this.class.ClassName} has no '${k}' property!`);
					else
						this[k] = style[k];
				}
			}
		}

		/**
		 * 根据坐标查找子控件
		 */
		public findControls(x: number, y: number): Control[] {
			if (!this.ptInBound(x, y))
				return null;
			x -= this._bound.left;
			y -= this._bound.top;
			var childs = this._childs;
			for (var i = childs.length - 1; i >= 0; i--) {
				var r = childs[i].findControls(x, y);
				if (r) {
					r.push(this);
					return r;
				}
			}
			var p = this.hitTest(x, y) ? [this] : null;
			return p;
		}

		private _states: Dictionary<ControlStateData>;
		//private _statesUserEvent: Dictionary<ControlStateData>;
		/*private static applyState(items) {
			for (var i = 0; i < items.length; i++) {
				var t = items[i];
				if (t.src)
					t.target[t.targetProp] = t.src[t.srcProp];
				else
					t.target[t.targetProp] = t.value;
			}
		}*/
		private _stateChange(newState: string, oldState: string) {
			var s1 = this._states[oldState];
			var s2 = this._states[newState];
			if (!s1 || !s2)
				throw new Error("unknown state.");
			var props = s2.props;
			if(s1.onLeave)
				s1.onLeave(this, newState);
			if(props) {
				for(let k in props) {
					if(k === "childsProperty") {
						var childs = props[k];
						for(let n in childs) {
							let child = this._namedChilds[n];
							if(!child) {
								Log.warn(`namedChild '${k}' is not exist.`);
								continue;
							}
							let cprops = childs[n];
							for(let p in cprops) {
								if(p !== "style" && !child.class.hasProperty(p))
									Log.warn(`The UI[${child.class.ClassName}] has no '${n}' property!`);
								else {
									let v = cprops[p];
									child[p] = typeof (v) == "function" ? v.call(this) : v;
								}
							}
						}
					}
					else {
						let v = props[k];
						this[k] = typeof (v) == "function" ? v.call(this) : v;
					}
				}
			}
			if(s2.onEnter)
				s2.onEnter(this, oldState);
		}
		protected _initStates(s: string, states: Dictionary<ControlStateData>) {
			this._states = states;
			this.state = s;
			this.addObserver("state", this._stateChange, this);
			this._stateChange(s, s);
		}		
	}
	initUIClass(Control, Container);
	//registerGuiClass("Control", Control);

	/** 
	* 设置滚动方向
	*/
	export enum ScrollMode {
		Horizontal = 1,
		Vertical = 2,
		All = 3
	}
	/** 
	* 可滚动的视图容器，支持子元素在视图里的滚动显示 
	*/
	export class ScrollView extends Control {
		protected _scrollStage: SubStageSprite;
		static ClassName = "ScrollView";
		static instance: ScrollView;
		//static ChildElementsProperty = "childs";
		static HasChildElements = true;
		static Properties: PropDefine[] = [
			{ name: "xScroll", default: 0, type: "number", converter: parse.Float, validate: "float" },
			{ name: "yScroll", default: 0, type: "number", converter: parse.Float, validate: "float" },
			{ name: "scrollWidth", default: 0, type: "number", converter: parse.Float, validate: "float" },
			{ name: "scrollHeight", default: 0, type: "number", converter: parse.Float, validate: "float" },
			{ name: "scrollMode", default: ScrollMode.All, type: "ScrollMode", converter: parse.getEnumParser(ScrollMode) }
		];

		private _startPos: Point;
		private _lastPos: Point;
		private _ticker: Object;
		private _touchId: number;
		private _startScrollPos: Point;
		private _lastVol: Point;
		private _lastMoveTime: number;

		private static convScroll(p) {
			return -p;
		}
		public dispose() {
			super.dispose();
			if (this._ticker) {
				removeTicker(this._ticker);
				this._ticker = null;
			}
		}
		constructor(parent: Container) {
			super(parent);
			this._init(ScrollView);
			this._scrollStage = new SubStageSprite(this._stage);
			//this._scrollStage.width = 1;
			//this._scrollStage.height = 1;
			//this._initProperties(ScrollView.Properties);
			//this.setProp("childs", null);
			this.bind("xScroll", this._scrollStage, "x", ScrollView.convScroll);
			this.bind("yScroll", this._scrollStage, "y", ScrollView.convScroll);
			this.clip = true;
		}

		/** 
		* 水平滚动位置
		*/
		public xScroll: number;
		/** 
		* 垂直滚动位置
		*/
		public yScroll: number;
		/** 
		* 水平滚动范围
		*/
		public scrollWidth: number;
		/** 
		* 垂直滚动范围
		*/
		public scrollHeight: number;
		/** 
		* 滚动方向
		*/
		public scrollMode: ScrollMode;
	
		/** 
		* 计算滚动范围，如果没有设置scrollWidth/scrollHeight的话就根据子元素的位置和大小自动计算滚动范围
		*/
		public getScrollRange(): Number2 {
			var b = this.getBound() || new Rect(0, 0, 1, 1);
			var b2 = b;
			var r = [this.scrollWidth, this.scrollHeight];
			if (!r[0] || !r[1]) {
				r[0] = r[0] || b.width;
				r[1] = r[1] || b.height;
				for (var i = 0; i < this._childs.length; i++) {
					var c = this._childs[i];
					b = c.getBound();
					if(!b) {
						c.measureBound(b2.width, b2.height);
						b = c.getBound();
					}
					r[0] = Math.max(r[0], b.right);
					r[1] = Math.max(r[1], b.bottom);
				}
				r[0] = this.scrollWidth || r[0];
				r[1] = this.scrollHeight || r[1];
			}
			/*if(!this.hasProp("culling")) {
				this._stage.culling = r[0] > b2.width || r[1] > b2.height;
			}*/
			//Log.debug(`scroll range: ${r[1]}`);
			return <Number2>r;
		}

		public screenToClient(x: number, y: number): Point {
			var b = this._bound;
			if (b) {
				x -= b.left - <number>this.xScroll;
				y -= b.top - <number>this.yScroll;
			}
			return this.parent.screenToClient(x, y);
		}
		public clientToScreen(x: number, y: number): Point {
			var b = this._bound;
			if (b) {
				x += b.left - <number>this.xScroll;
				y += b.top - <number>this.yScroll;
			}
			return this.parent.clientToScreen(x, y);
		}
		public findControls(x: number, y: number): Array<Control> {
			if (!this.ptInBound(x, y))
				return null;
			x -= this._bound.left - <number>this.xScroll;
			y -= this._bound.top - <number>this.yScroll;
			for (var i = this._childs.length - 1; i >= 0; i--) {
				var r = this._childs[i].findControls(x, y);
				if (r != null) {
					r.push(this);
					return r;
				}
			}
			return [this];
		}

		protected get _displayStage(): Stage {
			return this._scrollStage;
		}

		public setChilds(data: ElementData[]) {
			this.clearChilds();
			this._setChilds(data);
		}
	}

	function addScrollEventHandler(uiClass: any) {
		uiClass.prototype.onTouchBegin = function (d: TouchData) {
			if (this._startPos)
				return;
			if (this._ticker) {
				removeTicker(this._ticker);
				this._ticker = null;
			}
			this._touchId = d.id;
			this._lastPos = new Point(d.screenX, d.screenY);
			this._startPos = new Point(d.screenX, d.screenY);
			this._lastVol = new Point(0, 0);
			this._startScrollPos = new Point(this.xScroll, this.yScroll);
			Tween.stopTweens(this);
			d.capture();
			d.bubble = false;
		}
		uiClass.prototype.onTouchMove = function (d: TouchData) {
			if (!this._startPos || this._touchId != d.id)
				return;
			var dx = d.screenX - this._startPos.x;
			var dy = d.screenY - this._startPos.y;
			var px = this._startScrollPos.x - dx;
			var py = this._startScrollPos.y - dy;
			var mode = <ScrollMode>this.scrollMode;
			if (Math.abs(dx) > 5 || Math.abs(dy) > 5)
				d.excludeCapture();

			var dt = 1 / (d.time - this._lastMoveTime + 1);
			var vx = (d.screenX - this._lastPos.x) * dt;
			var vy = (d.screenY - this._lastPos.y) * dt;

			if (Math.abs(vx) > Math.abs(this._lastVol.x))
				this._lastVol.x = vx * 0.5 + this._lastVol.x * 0.5;
			else
				this._lastVol.x = vx;

			if (Math.abs(vy) > Math.abs(this._lastVol.y))
				this._lastVol.y = vy * 0.5 + this._lastVol.y * 0.5;
			else
				this._lastVol.y = vy;

			this._lastMoveTime = d.time;
			this._lastPos.x = d.screenX;
			this._lastPos.y = d.screenY;
			if (px < 0)
				px *= 0.4;
			if (py < 0)
				py *= 0.4;
			var range = this.getScrollRange();
			var w = range[0] - this._bound.width;
			var h = range[1] - this._bound.height;
			if (px > w)
				px = w + (px - w) * 0.4;
			if (py > h)
				py = h + (py - h) * 0.4;
			if (mode & ScrollMode.Horizontal)
				this.xScroll = px;
			if (mode & ScrollMode.Vertical)
				this.yScroll = py;
			//console.log("scroll: %s, %s", px, py);
		}
		uiClass.prototype.onTouchEnd = function (d: TouchData) {
			if (!this._startPos || this._touchId != d.id)
				return;
			this._startPos = undefined;
			this._startScrollPos = undefined;
			var x = <number>this.xScroll;
			var y = <number>this.yScroll;
			var prop: any = {};
			var mode = <ScrollMode>this.scrollMode;
			var range = this.getScrollRange();
			var w = range[0] - this._bound.width;
			var h = range[1] - this._bound.height;
			var sh = mode & ScrollMode.Horizontal;
			var sv = mode & ScrollMode.Vertical;
			var ani = Tween.add(this);

			if (x < 0 && sh)
				prop.xScroll = [x, 0];
			if (y < 0 && sv)
				prop.yScroll = [y, 0];
			if (x > w && sh)
				prop.xScroll = [x, w];
			if (y > h && sv)
				prop.yScroll = [y, h];
			if ((prop.yScroll !== undefined) || (prop.xScroll !== undefined)) {
				ani.move(prop, 100);
				ani.play();
			}
			else {
				var vx = this._lastVol.x;
				var vy = this._lastVol.y;
				var sp: any = {};
				if (!sh)
					vx = 0;
				if (!sv)
					vy = 0;
				var sx = vx < 0 ? -1 : 1;
				var sy = vy < 0 ? -1 : 1;
				vx = Math.min(5, Math.abs(vx));
				vy = Math.min(5, Math.abs(vy));

				function tick() {
					var y = <number>this.yScroll;
					var x = <number>this.xScroll;
					if (vx > 0) {
						x -= vx * 16 * sx;
						if (x < 0 || x > w)
							vx = Math.max(0, vx - 0.5);
						else
							vx = Math.max(0, vx - 0.02);
						this.xScroll -= vx * 16 * sx;
						x = this.xScroll;
					}
					if (vy > 0) {
						y -= vy * 16 * sy;
						if (y < 0 || y > h)
							vy = Math.max(0, vy - 0.5);
						else
							vy = Math.max(0, vy - 0.02);
						this.yScroll -= vy * 16 * sy;
						y = this.yScroll;
					}
					if (vx == 0 && vy == 0) {
						var prop: any = {};
						if (x < 0 && sh)
							prop.xScroll = [x, 0];
						if (y < 0 && sv)
							prop.yScroll = [y, 0];
						if (x > w && sh)
							prop.xScroll = [x, w];
						if (y > h && sv)
							prop.yScroll = [y, h];
						if (prop.yScroll !== undefined || prop.xScroll !== undefined) {
							ani.move(prop, 100);
							ani.play();
						}
						return false;
					}
					return true;
				}

				this._ticker = addTicker(dt => {
					for (var i = 0; i < dt; i += 16) {
						if (!tick.call(this)) {
							removeTicker(this._ticker);
							break;
						}
					}
				}, this);
			}
		}
	}

	initUIClass(ScrollView, Control);
	addScrollEventHandler(ScrollView);
	//registerGuiClass("ScrollView", ScrollView);

	interface TouchPoint {
		id: number;
		x: number;
		y: number;
	}
	/** 
	* 带缩放的卷动视图容器
	*/
	export class ScaleScrollView extends ScrollView {
		static ClassName = "ScaleScrollView";
		static instance: ScaleScrollView;
		//static ChildElementsProperty = "childs";
		static HasChildElements = true;
		static Properties: PropDefine[] = [
			{ name: "scaleRange", default: [1, 2], type: "Number2", converter: parse.Numbers, validate: "int2" },
			{ name: "scaleRamp", default: 0.1, type: "number", converter: parse.Float, validate: "float" },
		];
		private _pt1: TouchPoint;
		private _pt2: TouchPoint;

		constructor(parent: Container) {
			super(parent);
		}
		public getScrollRange(): Number2 {
			return [this.scrollWidth * this.scale, this.scrollHeight * this.scale];
		}
		public screenToClient(x: number, y: number): Point {
			var b = this._bound;
			if(b) {
				x -= b.left - <number>this.xScroll;
				y -= b.top - <number>this.yScroll;
			}
			var s = this.scale;
			x *= s;
			y *= s;
			return this.parent.screenToClient(x, y);
		}
		public clientToScreen(x: number, y: number): Point {
			var b = this._bound;
			if(b) {
				x += b.left - <number>this.xScroll;
				y += b.top - <number>this.yScroll;
			}
			var s = 1 / this.scale;
			x *= s;
			y *= s;
			return this.parent.clientToScreen(x, y);
		}
		public findControls(x: number, y: number): Array<Control> {
			if(!this.ptInBound(x, y))
				return null;
			x -= this._bound.left - <number>this.xScroll;
			y -= this._bound.top - <number>this.yScroll;
			var s = this.scale;
			x *= s;
			y *= s;
			for(var i = this._childs.length - 1; i >= 0; i--) {
				var r = this._childs[i].findControls(x, y);
				if(r != null) {
					r.push(this);
					return r;
				}
			}
			return [this];
		}
	}
	function addScaleScrollEventHandler(uiClass: any) {
		function findPt(ctx, id) {
			if(ctx._pt1 && ctx._pt1.id == id)
				return ctx._pt1;
			if(ctx._pt2 && ctx._pt2.id == id)
				return ctx._pt2;
			return null;
		}

		uiClass.prototype.onTouchBegin = function (d: TouchData) {
			if(this._pt2)
				return;
			if(!this._pt1 && this._ticker) {
				removeTicker(this._ticker);
				this._ticker = null;
			}
			if(!this._pt1) {
				this._pt1 = { id: d.id, x: d.screenX, y: d.screenY };
				this._startScrollPos = new Point(this.xScroll, this.yScroll);
			}
			else {
				d.excludeCapture();
				this._pt2 = { id: d.id, x: d.screenX, y: d.screenY };
				var dx = this._pt1.x - this._pt2.x;
				var dy = this._pt1.y - this._pt2.y;
				this._startScale = this.scale / Math.sqrt(dx * dx + dy * dy);
			}
			/*
			this._touchId = d.id;
			this._lastPos = new Point(d.screenX, d.screenY);
			this._startPos = new Point(d.screenX, d.screenY);
			this._lastVol = new Point(0, 0);
			this._startScrollPos = new Point(this.xScroll, this.yScroll);*/
			Tween.stopTweens(this);
			d.capture();
			d.bubble = false;
		}
		uiClass.prototype.onTouchMove = function (d: TouchData) {
			var pt = findPt(this, d.id);
			if(!pt)
				return;
			if(this._pt2) {
				pt.x = d.screenX;
				pt.y = d.screenY;
				var dx = this._pt1.x - this._pt2.x;
				var dy = this._pt1.y - this._pt2.y;
				var dist = Math.sqrt(dx * dx + dy * dy);
				var scale = this._startScale * dist;
				var range = this.scaleRange;
				if(scale < range[0])
					scale = range[0] + (scale - range[0]) * this.scaleRamp;
				else if(scale > range[1])
					scale = range[1] + (scale - range[1]) * this.scaleRamp;
				this.scale = scale;
			}
			else {
				var dx = d.screenX - this._pt1.x;
				var dy = d.screenY - this._pt1.y;
				var px = this._startScrollPos.x - dx;
				var py = this._startScrollPos.y - dy;
				if(Math.abs(dx) > 5 || Math.abs(dy) > 5)
					d.excludeCapture();

				var dt = 1 / (d.time - this._lastMoveTime + 1);
				var vx = (d.screenX - this._lastPos.x) * dt;
				var vy = (d.screenY - this._lastPos.y) * dt;

				if(Math.abs(vx) > Math.abs(this._lastVol.x))
					this._lastVol.x = vx * 0.5 + this._lastVol.x * 0.5;
				else
					this._lastVol.x = vx;

				if(Math.abs(vy) > Math.abs(this._lastVol.y))
					this._lastVol.y = vy * 0.5 + this._lastVol.y * 0.5;
				else
					this._lastVol.y = vy;

				this._lastMoveTime = d.time;
				this._lastPos.x = d.screenX;
				this._lastPos.y = d.screenY;
				if(px < 0)
					px *= 0.4;
				if(py < 0)
					py *= 0.4;
				var range = this.getScrollRange();
				var w = range[0] - this._bound.width;
				var h = range[1] - this._bound.height;
				if(px > w)
					px = w + (px - w) * 0.4;
				if(py > h)
					py = h + (py - h) * 0.4;
				this.xScroll = px;
				this.yScroll = py;
			}
		}
		uiClass.prototype.onTouchEnd = function (d: TouchData) {
			if(!this._pt1)
				return;
			if(this._pt2) {
				this._pt2 = null;
			}
			else {
				this._startPos = undefined;
				this._startScrollPos = undefined;
				var x = <number>this.xScroll;
				var y = <number>this.yScroll;
				var prop: any = {};
				var range = this.getScrollRange();
				var w = range[0] - this._bound.width;
				var h = range[1] - this._bound.height;
				var ani = Tween.add(this);

				if(x < 0)
					prop.xScroll = [x, 0];
				if(y < 0)
					prop.yScroll = [y, 0];
				if(x > w)
					prop.xScroll = [x, w];
				if(y > h)
					prop.yScroll = [y, h];
				if((prop.yScroll !== undefined) || (prop.xScroll !== undefined)) {
					ani.move(prop, 100);
					ani.play();
				}
				else {
					var vx = this._lastVol.x;
					var vy = this._lastVol.y;
					var sp: any = {};
					var sx = vx < 0 ? -1 : 1;
					var sy = vy < 0 ? -1 : 1;
					vx = Math.min(5, Math.abs(vx));
					vy = Math.min(5, Math.abs(vy));

					function tick() {
						var y = <number>this.yScroll;
						var x = <number>this.xScroll;
						if(vx > 0) {
							x -= vx * 16 * sx;
							if(x < 0 || x > w)
								vx = Math.max(0, vx - 0.5);
							else
								vx = Math.max(0, vx - 0.02);
							this.xScroll -= vx * 16 * sx;
							x = this.yScroll;
						}
						if(vy > 0) {
							y -= vy * 16 * sy;
							if(y < 0 || y > h)
								vy = Math.max(0, vy - 0.5);
							else
								vy = Math.max(0, vy - 0.02);
							this.yScroll -= vy * 16 * sy;
							y = this.yScroll;
						}
						if(vx == 0 && vy == 0) {
							var prop: any = {};
							if(x < 0)
								prop.xScroll = [x, 0];
							if(y < 0)
								prop.yScroll = [y, 0];
							if(x > w)
								prop.xScroll = [x, w];
							if(y > h)
								prop.yScroll = [y, h];
							if(prop.yScroll !== undefined || prop.xScroll !== undefined) {
								ani.move(prop, 100);
								ani.play();
							}
							return false;
						}
						return true;
					}

					this._ticker = addTicker(dt => {
						for(var i = 0; i < dt; i += 16) {
							if(!tick.call(this)) {
								removeTicker(this._ticker);
								break;
							}
						}
					}, this);
				}
			}
		}
	}

	initUIClass(ScaleScrollView, ScrollView);
	addScaleScrollEventHandler(ScaleScrollView);
	//registerGuiClass("ScaleScrollView", ScaleScrollView);

	/**
	* List item的布局模式
	*/
	export enum LayoutMode {
		/** 
		* 横向排列
		*/
		Horizontal,
		/** 
		* 纵向排列
		*/
		Vertical,
		/** 
		* 横向换行排列
		*/
		Wrap
	}

	/** 
	* 列表视图元素接口 
	*/
	export interface ListItemClass extends Element {
		dataSource: any;
	}

	/** 
	* 列表视图，用于在视图内放置一组item元素，item的排列支持横向、纵向、换行三种排列方式 
	*/
	export class ListView extends Container {
		static ClassName = "ListView";
		static instance: ListView;
		static Properties: PropDefine[] = [
			{ name: "itemClass", default: "", type: "string" },
			{ name: "layoutMode", default: LayoutMode.Vertical, type: "LayoutMode", converter: parse.getEnumParser(LayoutMode) },
			{ name: "itemPadding", type: "Number4", converter: parse.Number4, validate: "int4" },
			{ name: "item", type: "Object", converter: parse.JSObj }
		];
		
		private HornLayout() {
			var padding = this.itemPadding;
			var x = padding ? padding[0] : 0;
			var y = padding ? padding[1] : 0;
			var px = padding ? padding[2] : 0;
			for (var i = 0; i < this._childs.length; i++) {
				var c = this._childs[i];
				if (!c.visible)
					continue;
				var r = c.getBound();
				r.left = x;
				r.top = y;
				x += r.width + px;
				c.setBound(r);
			}
		}

		private VertLayout() {
			var padding = this.itemPadding;
			var x = padding ? padding[0] : 0;
			var y = padding ? padding[1] : 0;
			var py = padding ? padding[3] : 0;
			for (var i = 0; i < this._childs.length; i++) {
				var c = this._childs[i];
				if (!c.visible)
					continue;
				var r = c.getBound();
				r.left = x;
				r.top = y;
				y += r.height + py;
				c.setBound(r);
			}
		}

		private WrapLayout() {
			var w = this._bound.width;
			var padding = this.itemPadding;
			var x0 = padding ? padding[0] : 0;
			var y = padding ? padding[1] : 0;
			var px = padding ? padding[2] : 0;
			var py = padding ? padding[3] : 0;
			var x = x0;
			for (var i = 0; i < this._childs.length; i++) {
				var c = this._childs[i];
				if (!c.visible)
					continue;
				var r = c.getBound();
				if (x > x0 && x + r.width > w) {
					x = x0;
					y += r.height + py;
				}
				r.left = x;
				r.top = y;
				x += r.width + px;
				c.setBound(r);
			}
		}
		private calcLayout() {
			if (!this._bound)
				return;
			/*var w = this._bound.width;
			var h = this._bound.height;
			for (var i = 0; i < this._childs.length; i++) {
				var c = this._childs[i];
				c.measureBound(w, h, true);
			}*/
			switch (this.layoutMode) {
				case LayoutMode.Vertical:
					this.VertLayout();
					break;
				case LayoutMode.Horizontal:
					this.HornLayout();
					break;
				case LayoutMode.Wrap:
					this.WrapLayout();
					break;
			}
		}
		_childChange = false;
		childSizeChanged() {
			this._sizeDirty = true;
			this._childChange = true;
			childSizeChanged.call(this.parent);
		}
		private _createChild(): any {
			var c = super.createChild(_uiClasses[this.itemClass]);
			c.addObserver("visible", () => {
				this._childChange = true;
				childSizeChanged.call(this._parent);
			}, this);
			return c;
		}
		public measureBound(width: number, height: number, force: boolean = false) {
			var i;
			var dim = calcDim.call(this, width, height);
			if(this._sizeDirty) {
				for(i = 0; i < this._childs.length; i++) {
					var child = this._childs[i];
					child.measureBound(dim.width || width, dim.height || height, force);
				}
			}
			if(force || !this._bound || this._childChange) {
				var oldBound = this._bound;
				//var calc = false;
				if (!dim.width || !dim.height) {
					this._bound = new Rect(0, 0, dim.width || width, dim.height || height);
					this.calcLayout();
					dim.width = dim.width || 0;
					dim.height = dim.height || 0;
					for (i = 0; i < this._childs.length; i++) {
						var c = this._childs[i];
						if (!c.visible)
							continue;
						var b = c.getBound();
						dim.width = Math.max(dim.width, (b.right + (this.itemPadding ? this.itemPadding[2] : 0)));
						dim.height = Math.max(dim.height, (b.bottom + (this.itemPadding ? this.itemPadding[3] : 0)));
					}
					//calc = true;
				}
				this._bound = toRect.call(this, width, height, dim);
				if(!Rect.equal(oldBound, this._bound))
					this.fireEvent("boundChange", this._bound, false);
			}
			this._sizeDirty = false;
		}
		public dispose() {
			super.dispose();
			this._source = null;
		}
		/** 
		* 列表视图内不可直接创建子元素
		*/
		public createChild<T extends Element>(uiclass: UIClass<T>, props?: any): T {
			throw new Error("List view can't create child element.");
		}

		constructor(parent: Container) {
			super(parent);
			this._init(ListView);
			//this._initProperties(ListView.Properties);
			this.addEventHandler("boundChange", function (e) {
				this.calcLayout();
			}, this);
		}

		private _srcOb: IDispose;

		private _createItem(item) {
			var c = this._createChild();
			c.dataSource = item;
			if(this.item) {
				for(let k in this.item) {
					if(k === "style")
						c.style = this.item[k];
					else {
						if(DEBUG && !c.class.hasProperty(k))
							Log.error(`The ${c.class.ClassName} has no '${k}' property!`);
						else
							c[k] = this.item[k];
					}
				}
			}
			return c;
		}

		private _onSrcChange(type: CollectionChangeType, idx?: number, item?: any) {
			var c: any;
			switch (type) {
				case CollectionChangeType.clear:
					this.clearChilds();
					break;
				case CollectionChangeType.add:
					c = this._createItem(item);
					this._childs.pop();
					this._childs.splice(idx, 0, c);
					break;
				case CollectionChangeType.remove:
					c = this._childs[idx];
					c.dispose();
					break;
				case CollectionChangeType.update:
					(<ListItemClass>this._childs[idx]).dataSource = item;
					break;
			}
			this._bound = null;
			childSizeChanged.call(this._parent);
		}

		private _source: DataCollection;

		set childsProperty(properties: Dictionary<any>) {
			if(!properties["item"]) {
				Log.warn(`not find item properties.`);
				return;
			}
			this.item = properties["item"];
		}
		/** 
		* 设置列表视图的数据源，列表里的列表元素会自动绑定到item上
		*/
		public set items(source: DataCollection|any[]) {
			if (!this.itemClass)
				throw new Error("itemClass is missing");
			if (Array.isArray(source)) {
				if (!this._source)
					this._source = new DataCollection();
				this._source.clear();
				this._source.addItems(source);
			}
			else
				this._source = <DataCollection>source;
			if (this._srcOb)
				this._srcOb.dispose();
			this.clearChilds();
			var items = this._source.items;
			for (let i = 0; i < items.length; i++)
				this._createItem(items[i]);
			this._srcOb = this._source.addObserver(this._onSrcChange, this);
			this._bound = null;
			childSizeChanged.call(this._parent);
		}
		public get items(): DataCollection|any[] {
			if (!this._source)
				this.items = new DataCollection();
			return this._source;
		}

		/** 
		* 布局模式
		*/
		public layoutMode: LayoutMode;
		/** 
		* item元素的UI类，列表根据指定的UI类来创建item所对应的UI子元素
		*/
		public itemClass: string;
		/** 
		* item之间的间距
		*/
		public itemPadding: Number4;
		/**
		 * item属性设置（设置一组属性值，用于初始化item元素的属性）
		 */
		public item: Dictionary<any>;
	}
	initUIClass(ListView, Container);
	//registerGuiClass("ListView", ListView);

	export const enum SlideMode {
		Horizental,
		Vertical
	}
	/** 
	* 用于包含多个标签页显示的视图 
	*/
	export class StackView extends Control {
		static ClassName = "StackView";
		static instance: StackView;
		//static ChildElementsProperty = "childs";
		static HasChildElements = true;
		static Properties: Array<PropDefine> = [
			{ name: "activePage", default: 0, type: "number", converter: parse.Int, validate: "int" }
		];
		private _slideTween: Tween;
		private indexChanged(newVal: number, oldVal: number) {
			if (this._slideTween) {
				var c = this._childs[newVal];
				c.left = 0; c.top = 0;
				this._slideTween.stop();
			}
			for (var i = 0; i < this._childs.length; i++)
				this._childs[i].visible = (newVal == i);
		}
		private touchBegin(e: TouchData) {
			//e.screenX, e.screenY
		}
		private touchMove(e: TouchData) {
		}
		private touchEnd(e: TouchData) {
		}
		constructor(parent: Container) {
			super(parent);
			this._init(StackView);
			//this._initProperties(StackView.Properties);
			this.addObserver("activePage", this.indexChanged, this);
		}
		/** 
		 * 添加一个页面，如果要删除页面的话，调用页面对象的dispose()即可
		 * @param uiClass 页面的类名
		 * @param props   页面属性
		 */
		public addPage<T extends Element>(uiclass: UIClass<T>, props?: any): T {
			var idx = this._childs.length;
			var p = this.createChild(uiclass, props);
			p.visible = idx == this.activePage;
			return p;
		}
		/**
		 * 获取page
		 * @param index
		 */
		public getPage(index:number): Element {			
			return this._childs[index];
		}
		/** 
		* 设置一组页面
		*/
		public setChilds(data: ElementData[]) {
			this.clearChilds();
			this._setChilds(data);
			for (var i = 0; i < this._childs.length; i++)
				this._childs[i].visible = (this.activePage == i);
		}
		/**
		 * 滑动过渡效果
		 * @param mode
		 */
		public slideTransition: (p: number, prevPage: Element, activePage: Element) => void;
		/**
		 * 允许点击滑动
		 * @param mode
		 */
		public touchSlide(mode: SlideMode) {
			this.onTouchBegin = this.touchBegin;
			this.onTouchEnd = this.touchEnd;
			this.onTouchMove = this.touchMove;
		}
		/** 
		* 滑屏效果
		* @param activePage: 切换到的目标页面Index
		* @param aniCB: 自定义动画效果，返回tween动画对象
		*/
		public slide(activePage: number, aniCB: (prevPage: Element, activePage: Element) => Tween) {
			if (activePage < 0 || activePage >= this._childs.length)
				throw new Error("page index out of range.");
			var prevPage = this._childs[this.activePage];
			this.activePage = activePage;
			var currPage = this._childs[activePage];
			prevPage.visible = true;
			this._slideTween = aniCB(prevPage, currPage).target(prevPage).set({ visible: false }).play();
		}

		/** 
		* 当前显示页面的index
		*/
		public activePage: number;
	}
	initUIClass(StackView, Container);
	//registerGuiClass("StackView", StackView);

	/** 
	* 用于包装sprite可视元素，实现UI对象的可视化，Visual是叶节点，不可包含UI子元素 
	*/
	export class Visual extends Element {
		static ClassName = "Visual";
		static Properties: PropDefine[] = [
			{ name: "effect", default: null, type: "string" },
			{ name: "effectParams", default: null, type: "Object", converter: parse.JSObj, customProperty: true },
			{ name: "blendMode", default: BlendMode.Normal, type: "BlendMode", converter: parse.getEnumParser(BlendMode) },
			{ name: "mirrorH", default: false, type: "boolean", converter: parse.Boolean },
			{ name: "mirrorV", default: false, type: "boolean", converter: parse.Boolean },
		];

		protected _sprite: Sprite;

		/** 获取sprite对象 */
		public get sprite(){ return this._sprite; }
		/**
		 * shader特效
		 */
        public effect: string;
		/**
		 * shader特效参数
		 */
        public get effectParams(): Object {
			return this._sprite.effectParams;
		}
		public set effectParams(v: Object) {
			this._sprite.effectParams = v;
		}
		/** 
		* 混合模式
		*/
		public blendMode: string | BlendMode;
		/** 
		* 水平镜像
		*/
		public mirrorH: boolean;
		/** 
		* 垂直镜像
		*/
		public mirrorV: boolean;
		/** 
		* 销毁UI对象
		*/
		public dispose() {
			this._sprite.dispose();
			this._sprite = null;
			super.dispose();
		}

		constructor(parent: Container, sprite: Sprite) {
			super(parent);
			this._sprite = sprite;
			this._init(Visual);
			//this._initProperties(Visual.Properties);
			this.bind("opacity", this._sprite);
			this.bind("visible", this._sprite);
			this.bind("angle", this._sprite);
			this.bind("blendMode", this._sprite);
			this.bind("scaleX", this._sprite);
			this.bind("scaleY", this._sprite);
			this.bind("scale", this._sprite);
			this.bind("zIndex", this._sprite);
			this.bind("mirrorH", this._sprite);
			this.bind("mirrorV", this._sprite);
			this.bind("effect", this._sprite);
			this.addEventHandler("boundChange", function (e) {
				var b = this._bound;
				if (!b) return;
				var s = this._sprite;
				s.width = b.width;
				s.height = b.height;
				s.anchorX = this.anchorX;
				s.anchorY = this.anchorY;
				s.x = b.left + s.anchorX * b.width;
				s.y = b.top + s.anchorY * b.height;
			}, this);
		}

		public hitTest(x: number, y: number): boolean {
			return true;
		}
	}
	initUIClass(Visual, Element, true);	

	/** 
	* 矩形填充元素，包装RectFillSprite
	*/
	export class RectFill extends Visual {
		static ClassName = "RectFill";
		static instance: RectFill;
		static Properties: PropDefine[] = [
			{ name: "color", default: "#000000", type: "string", validate: "color" },
			{ name: "gradient", default: null, type: "GradientFill", converter: parse.GradientFill, validate:"GradientFill" }
		];

		constructor(parent: Container) {
			super(parent, new RectFillSprite((<any>parent)._displayStage));
			this._init(RectFill);
			//this._initProperties(RectFill.Properties);
			this.bind("color", this._sprite);
			this.bind("gradient", this._sprite);
		}

		/** 获取sprite对象 */
		public sprite: RectFillSprite;

		/** 
		* 渐变填充
		*/
		public gradient: GradientFill;
		/** 
		* 颜色填充
		*/
		public color: string;
	}
	initUIClass(RectFill, Visual);
	//registerGuiClass("RectFill", RectFill);

	/**
	* 图像元素
	*/
	export class Image extends Visual {
		static ClassName = "Image";
		static instance: Image;
		static Properties: PropDefine[] = [
			{ name: "src", default: null, type: "string|ImageRes", converter: parse.ImageSrc, validate: "resource" },
			{ name: "color", default: "#ffffff", type: "string", validate: "color" },
			{ name: "pattern", default: null, type: "string", validate: "pattern" }
			//{ name: "hitTestMode", default: null, type: "HitTestData", converter: parseHitTestData }
		];

		constructor(parent: Container) {
			super(parent, new ImageSprite((<any>parent)._displayStage));
			this._init(Image);
			//this._initProperties(Image.Properties);
			this.bind("color", this._sprite);
			this.bind("src", this._sprite);
			this.bind("pattern", this._sprite);
			this.addObserver("src", function () {
				this._bound = null;
				childSizeChanged.call(this._parent);
			}, this);
		}

		/** 获取sprite对象 */
		public sprite: ImageSprite;
		/**
		 * 平铺模式
		 */
		public pattern: string;
		/**
		 * 图片资源
		 */
		public src: string | ImageRes;
		/**
		 * 颜色相乘
		 */
		public color: string;
		/**
		 * 直接设置纹理
		 */
		public set image(v: Texture) {
			(<ImageSprite>this._sprite).src = v;
		}
		public hitTest(x: number, y: number): boolean {
			return this._sprite.hitTest(x, y);
		}
		public measureBound(width: number, height: number, force?: boolean) {
			if (!force && this._bound)
				return;
			var dim = calcDim.call(this, width, height);
			var src = <ImageRes>this.src;
			if (dim.width === undefined)
				dim.width = src ? src.getData().width : 0;
			if(dim.height === undefined)
				dim.height = src ? src.getData().height : 0;
			this._bound = toRect.call(this, width, height, dim);
			this.fireEvent("boundChange", this._bound, false);
			//this._onBoundChange();
		}
	}
	initUIClass(Image, Visual);
	//registerGuiClass("Image", Image);

	/**
	* 序列帧动画元素
	*/
	export class SeqFrame extends Visual {
		static ClassName = "SeqFrame";
		static instance: SeqFrame;
		static Properties: PropDefine[] = [
			{ name: "frames", default: null, type: "SeqFrameDesc", converter: parse.SeqFrameDesc, validate:"SeqFrameDesc" },
			{ name: "color", default: "#ffffff", type: "string", validate: "color" },
			{ name: "loop", default: false, type: "boolean" },
			{ name: "autoPlay", default: false, type: "boolean" },
			{ name: "fps", default: 30, type: "number", validate: "float" },
		];

		constructor(parent: Container) {
			super(parent, new SeqFrameSprite((<any>parent)._displayStage));
			this._init(SeqFrame);
			//this._initProperties(SeqFrame.Properties);
			this.bind("color", this._sprite);
			this.bind("frames", this._sprite);
			this.bind("fps", this._sprite);
			this.bind("autoPlay", this._sprite);			
			this.addObserver("frames", function (v) {
				this._bound = null;
				childSizeChanged.call(this._parent);
			}, this);
		}

		/** 获取sprite对象 */
		public sprite: SeqFrameSprite;
		/**
		 * 载入后自动播放
		 */
		public autoPlay: boolean;
		/**
		 * 序列帧定义
		 */
		public frames: SeqFrameDesc;
		/**
		 * 播放帧率
		 */
		public fps: number;
		/**
		 * 循环播放
		 */
		public loop: boolean;
		/**
		 * 颜色相乘
		 */
		public color: string;
		/**
		 * 开始播放
		 */
		public play() {
			this.sprite.play();
		}
		/**
		 * 停止播放
		 */
		public stop() {
			this.sprite.stop();
		}
		/**
		 * 暂停播放
		 */
		public pause() {
			this.sprite.pause();
		}
		/**
		 * 播放状态
		 */
		public get state(): MediaState {
			return this.sprite.state;
		}
		public hitTest(x: number, y: number): boolean {
			return this._sprite.hitTest(x, y);
		}
		public measureBound(width: number, height: number, force?: boolean) {
			if (!force && this._bound)
				return;
			var dim = calcDim.call(this, width, height);
			if (this.frames) {
				var img = getRes<Texture>(this.frames.prefix + this.frames.from);
				if (dim.width === undefined)
					dim.width = img ? img.getData().width : 0;
				if(dim.height === undefined)
					dim.height = img ? img.getData().height : 0;
			}
			this._bound = toRect.call(this, width, height, dim);
			this.fireEvent("boundChange", this._bound, false);
		}
	}
	initUIClass(SeqFrame, Visual);
	//registerGuiClass("SeqFrame", SeqFrame);
	/** 
	* SubStage元素，包装SubStageSprite。通过在UI里添加UIStage元素，用户就可以在该元素里获得Stage容器，从而向这个Stage添加sprites，构造轻量级的可视树
	*/
	export class UIStage extends Visual {
		static ClassName = "UIStage";
		static instance: UIStage;
		//static ChildElementsProperty = "childs";
		static HasChildElements = true;
		static Properties: PropDefine[] = [
			{ name: "clip", default: false, type: "boolean", converter: parse.Boolean }
		];
		//_stage: Stage;
		protected _setProps(props: Dictionary<any>) {
			for(let k in props) {
				if(k === "class" || k === "id" || k === "_array") {
					continue;
				}
				else if(k === "childsProperty") {
					Log.error(`${this.class.ClassName} can't have childs`);
				}
				else if(k === "_childs") {
					this.setChilds(props[k]);
				}
				else if(k === "style") {
					this[k] = props[k];
				}
				else {
					if(DEBUG && !this.class.hasProperty(k))
						Log.error(`The ${this.class.ClassName} has no '${k}' property!`);
					this[k] = props[k];
				}
			}
		}
		constructor(parent: Container) {
			super(parent, new SubStageSprite((<any>parent)._displayStage));
			//this._stage = (<SubStageSprite>this._sprite).stage;
			this.setProp("childs", null);
			this.bind("clip", this._sprite);
		}
		/** 获取sprite对象 */
		public sprite: SubStageSprite;
		/**
		 * 查找stage内的sprite
		 * @param id: sprite id
		 */
		public find(id: string): Sprite {
			return this.sprite.find(id);
		}
		/**
		 * stage对象
		 */
		public get stage(): Stage {
			return <SubStageSprite>this._sprite;
		}
		/**
		 * 载入sprites
		 */
		public setChilds(val: SpriteData[]) {
			this.stage.clear();
			this.stage.load(val);
		}
	}
	initUIClass(UIStage, Visual);

	/** 
	* 文本元素，包装LabelSprite
	*/
	export class Label extends Visual {
		static ClassName = "Label";
		static instance: Label;
		static Properties: PropDefine[] = [
			{ name: "text", default: "", type: "string" },
			{ name: "font", type: "string", customProperty: true, validate: "font" },
			{ name: "format", type: "TextFormat", converter: parse.getEnumParser(TextFormat), customProperty: true },
			{ name: "strokeColor", type: "string", validate: "color" },
			{ name: "strokeWidth", type: "number", converter: parse.Int, validate: "int" },
			{ name: "color", type: "string", validate: "color" },
			{ name: "bkColor", type: "string", validate: "color" },
			{ name: "lineHeight", type: "number", converter: parse.Int, validate: "int" },
			{ name: "align", type: "AlignMode", converter: parse.getEnumParser(AlignMode) },
			{ name: "margin", type: "Number4", converter: parse.Number4, validate: "int4" },
			{ name: "textStyle", type: "string" },
			{ name: "gradient", default: null, type: "GradientFill", converter: parse.GradientFill, validate:"GradientFill" }
			//{ name: "cacheAsBitmap", default: false, type: "boolean", converter: parse.Boolean },
		];
		_textStyleCache: TextStyle;

		constructor(parent: Container) {
			super(parent, new LabelSprite((<any>parent)._displayStage));
			this._init(Label);
			//this._initProperties(Label.Properties);
			this.addObserver("textStyle", this.textStyleChanged, this);
			//this.addEventHandler("textStyleChange", this.updateTextStyle, this);

			this.bind("text", this._sprite);
			this.bind("font", this._sprite);
			this.bind("format", this._sprite);
			this.bind("strokeColor", this._sprite);
			this.bind("strokeWidth", this._sprite);
			this.bind("color", this._sprite);
			this.bind("bkColor", this._sprite);
			this.bind("lineHeight", this._sprite);
			this.bind("align", this._sprite);
			this.bind("margin", this._sprite);
			this.bind("gradient", this._sprite);
			this.textStyleChanged();
		}

		protected textStyleChanged() {
			this._textStyleCache = { id: "" };
			var c = <Container>(<Element>this);
			do {
				var s = c.textStyle;
				if(s) {
					var style = getTextStyle(s);
					if(style) {
						for(var k in style)
							if(!this._textStyleCache.hasOwnProperty(k))
								this._textStyleCache[k] = style[k];
					}
				}
				c = c.parent;
			} while(c);
			
			var props = ["font", "strokeColor", "format", "strokeWidth", "color", "bkColor", "lineHeight", "align", "margin"];
			var sp = <LabelSprite>this._sprite;
			for (var i in props) {
				var p = props[i];
				sp[p] = this.getProp(p) || this._textStyleCache[p];
				//if(this._textStyleCache[p] !== undefined && !this.hasProp(p))
				//	sp[p] = this._textStyleCache[p];
			}
		}

		/** 获取sprite对象 */
		public sprite: LabelSprite;
		/**
        * 文本测量结果
        */
		public get textMetric() {
			return (<LabelSprite>this._sprite).textMetric;
		}
		public measureBound(width: number, height: number, force?: boolean) {
			if (!force && this._bound)
				return;
			var sprite = <LabelSprite>this._sprite;
			var dim = calcDim.call(this, width, height);

			if (!dim.width || !dim.height) {
				sprite.width = dim.width || 1024;
				sprite.height = dim.height || 1024;
				if (!dim.width)
					dim.width = sprite.textMetric.maxWidth + (this.hasProp("margin") ? this.margin[0] + this.margin[2] : 0);
				if (!dim.height)
					dim.height = sprite.textMetric.lineHeight * Math.max(1, sprite.textMetric.lines.length) + (this.hasProp("margin") ? this.margin[1] + this.margin[3] : 0);
			}
			this._bound = toRect.call(this, width, height, dim);
			this.fireEvent("boundChange", this._bound, false);
		}
        /**
        * 文本字体
        */
		public get font(): string {
			return this.getProp("font") || this._textStyleCache.font;
		}
		public set font(v: string) {
			this.setProp("font", v);
		}
        /**
        * 文本格式
        */
		public get format(): TextFormat {
			return this.getProp("format") || this._textStyleCache.format;
		}
		public set format(v: TextFormat) {
			this.setProp("format", v);
		}
		/**
        * 文本样式
	    * @summary: 如果不指定控件的文本样式，控件会向上从父控件继承文本样式
        */
		public textStyle: string;
        /**
        * 文本内容
        */
		public text: string;
        /**
        * 描边颜色
        */
		public strokeColor: string;
        /**
        * 描边宽度
        */
		public strokeWidth: number;
        /**
        * 文本颜色
        */
		public color: string;
        /**
        * 文本背景色
        */
		public bkColor: string;
        /**
        * 行高
        */
		public lineHeight: number;
        /**
        * 文本对齐模式
        */
		public align: AlignMode;
        /**
        * 文本边距
        */
		public margin: Number4;
		/**
        * 文本渐变填充
        */
		public gradient: GradientFill;
	}
	initUIClass(Label, Visual);
	//registerGuiClass("Label", Label);

	/**
	 * 含超链接的富文本 
	 * @summary: 包装富文本Label，处理触摸事件，当用户点到a标签文本时产生click事件，event的arg参数为a标签的href值
	 */
	export class RichTextWithHyperlink extends Control {
		static ClassName = "RichTextWithHyperlink";
		static instance: RichTextWithHyperlink;
		static Properties: PropDefine[] = [
			{ name: "text", default: "", type: "string" },
			{ name: "font", type: "string", customProperty: true },
			{ name: "color", type: "string" },
			{ name: "lineHeight", type: "number", converter: parse.Int }
		];
		_label: Label;
		_href: RichTextMetricLine;

		constructor(parent: Container) {
			super(parent);
			this._init(RichTextWithHyperlink);
			//this._initProperties(RichTextWithHyperlink.Properties);
			this._createChilds([
				{ class: "Label", id: "label", width: "100%", height: "100%" }
			]);
			this._initStates("normal", { normal: {}, down: {}});
			this._label = <Label>this._namedChilds["label"];
			this._label.format = TextFormat.MultiLine | TextFormat.WordBreak | TextFormat.RichText;
			this._label.align = AlignMode.Left | AlignMode.Top;
			this.bind("text", this._label);
			this.bind("font", this._label);
			this.bind("color", this._label);
			this.bind("lineHeight", this._label);
		}
		public get namedChilds(): { label: Label } {
			return <any>this._namedChilds;
		}
		public get textMetric() {
			return this._label.textMetric;
		}

		findHyperlink(pt: Point): RichTextMetricLine {
			let metric = this._label.textMetric;
			let line = (pt.y / metric.lineHeight) | 0;
			if(line >= metric.richLines.length)
				return null;
			var items = metric.richLines[line];
			for(let i = 0; i < items.length; i++) {
				let item = items[i];
				if(item.href && pt.x >= item.x && pt.x < item.x + item.width)
					return item;
			}			
			return null;
		}
		onTouchBegin = function(d: TouchData) {
			var pt = this.screenToClient(d.screenX, d.screenY);
			var href = this.findHyperlink(pt);
			if(!href)
				return;
			this._href = href;
			d.capture();
			this.state = "down";
		}
		onTouchCancel = function (id: number) {
			if(this.state == "down")
				this.state = "normal";
		}
		onTouchEnd = function (d: TouchData) {
			if(this.state == "down") {
				this.state = "normal";
				var pt = this.screenToClient(d.screenX, d.screenY);
				var href = this.findHyperlink(pt);
				if(this._href == href)
					this.fireEvent("click", href.href);
				this._href = null;
			}
		}

		/**
		* 文本字体
		*/
		public get font(): string {
			if(this.hasProp("font"))
				return this.getProp("font");
			else
				return this._label.font;
		}
		public set font(v: string) {
			this.setProp("font", v);
		}

		public text: string;
		public color: string;
		public lineHeight: number;
	}
	initUIClass(RichTextWithHyperlink, Control);


	/** 
	* 文本输入控件，使用html标签实现的输入控件
	*/
	export class TextInput extends Control {
		static ClassName = "TextInput";
		static instance: TextInput;
		static Properties: PropDefine[] = [
			{ name: "text", default: "", type: "string" },
			{ name: "font", type: "string", validate: "font" },
			{ name: "color", type: "string", validate: "color" },
			{ name: "bkColor", type: "string", validate: "color" },
			{ name: "lineHeight", type: "number", converter: parse.Int, validate: "int" },
			{ name: "multiLine", type: "boolean", converter: parse.Boolean },
			{ name: "submitOnReturn", type: "boolean", converter: parse.Boolean },
			{ name: "margin", type: "Number4", converter: parse.Number4, validate: "int4" },
			{ name: "maxLength", type: "number", converter: parse.Int, validate: "int" },
			{ name: "type", default: "text", type: "string" }
		];
		//event: textChange
		private _label: LabelSprite;

		static States: Dictionary<ControlStateData> = { normal: {}, inputing: {}, disable: {} };

		public dispose() {
			if(this.state == "inputing") {
				getRoot().cancelInput();
			}
			this._label.dispose();
			this._label = null;
			super.dispose();
		}

		constructor(parent: Container) {
			super(parent);
			var ctx = this;
			this._label = new LabelSprite(this.parentStage);
			var lb = this._label;
			lb.format = TextFormat.Ellipse;
			this._init(TextInput);
			//this._initProperties(TextInput.Properties);
			this.bind("text", lb, "text", c => {
				if (ctx.type === "password")
					c = c.replace(/./g, "●");
				return c;
			});
			this.bind("font", lb);
			this.bind("color", lb);
			this.bind("bkColor", lb);
			this.bind("lineHeight", lb);
			this.bind("opacity", lb);
			this.bind("visible", lb);
			this.bind("angle",  lb);
			this.bind("scaleX", lb);
			this.bind("scaleY", lb);
			this.bind("scale", lb);
			this.bind("zIndex", lb);
			this._label.align = AlignMode.Left | AlignMode.VCenter;
			this.addObserver("multiLine", function (v) {
				lb.format = v ? TextFormat.WordBreak | TextFormat.MultiLine : TextFormat.Ellipse;
				lb.align = v ? AlignMode.Left | AlignMode.Top : AlignMode.Left | AlignMode.VCenter;
			}, this);
			this.bind("margin", lb);

			this._initStates("normal", TextInput.States);
			this.addEventHandler("boundChange", function (e) {
				var b = this._bound;
				if (!b)
					return;
				var s = this._label;
				s.width = b.width;
				s.height = b.height;
				s.anchorX = this.anchorX;
				s.anchorY = this.anchorY;
				s.x = b.left + s.anchorX * b.width;
				s.y = b.top + s.anchorY * b.height;
			}, this);
			this.addObserver("textStyle", this.textStyleChanged, this);
			//this.addObserver("textStyle", this.updateTextStyle, this);
			//this.addEventHandler("textStyleChange", this.updateTextStyle, this);
			//this.updateTextStyle();
		}

		protected textStyleChanged() {
			var s = this.textStyle;
			var parent = this.parent;
			while (!s && parent) {
				s = parent.textStyle;
				parent = parent.parent;
			}
			if (s) {
				var props = ["font", "color", "bkColor", "lineHeight", "margin"];
				var sp = <LabelSprite>this._label;
				for (var i in props) {
					var p = props[i];
					if (s[p] !== undefined && !this.hasProp(p))
						sp[p] = s[p];
				}
			}
		}
		public beginInput() {
			this.state = "inputing";
			(<any>getRoot()).startInput(this);
		}
		/** 
		* TextInput内不可直接创建子元素
		*/
		public createChild<T extends Element>(uiclass: UIClass<T>, props?: any): T {
			throw new Error("TextInput can't create child element.");
		}

		public findControls(x: number, y: number): Control[] {
			if(!this.ptInBound(x, y) || !this.touchable)
				return null;
			return [this];
		}
		public text: string;
		public font: string;
		public color: string;
		public bkColor: string;
		public lineHeight: number;
		public multiLine: boolean;
		public margin: Number4;
        /**
        * 最大可输入的字符数
        */
		public maxLength: number;
        /**
        * 是否在按回车时完成输入
        */
		public submitOnReturn: boolean;
        /**
        * 输入类型：text,number,password
        */
		public type: string;
	}
	initUIClass(TextInput, Control);
	//registerGuiClass("TextInput", TextInput);	
	TextInput.prototype.onTouchBegin = function (e: TouchData) {
		if(this.state == "normal") {
			e.bubble = false;
			this.beginInput();
		}
	};
	
	/** 
	* 标签按钮接口
	*/
	export interface TabBtn {
		/** 
		* 标签状态 select/unselect
		*/
		state: string;
		group: TabGroup;
	}

	/** 
	* 标签页头，与StackView组合使用可以实现完整的标签视图
	*/
	export class TabGroup extends Container {
		static ClassName = "TabGroup";
		static instance: TabGroup;
		//static ChildElementsProperty = "items";
		static HasChildElements = true;
		static Properties: ui.PropDefine[] = [
			{ name: "activeIndex", default: -1, type: "number", converter: parse.Int, validate: "int" },
		];

		private _tabs: TabBtn[] = [];
		private _selectChange(newVal, oldVal) {
			if (oldVal >= 0 && oldVal < this._tabs.length)
				this._tabs[oldVal].state = "unselect";
			if (newVal >= 0 && newVal < this._tabs.length)
				this._tabs[newVal].state = "select";
			else
				Log.warn("tab index out of range.");
		}
		constructor(parent: ui.Container) {
			super(parent);
			this._init(TabGroup);
			//this._initProperties(TabGroup.Properties);
			this.addObserver("activeIndex", this._selectChange, this);
			//this.setProp("items", null);
		}
		public select(tab: TabBtn) {
			const idx = this._tabs.indexOf(tab);
			if (idx == -1)
				throw new Error("tab is not exist!");
			this.activeIndex = idx;
		}
		/** 
		* 添加一个标签按钮
		*/
		public addTabBtn(btn: string | TabBtn, props?: any) {
			const idx = this._childs.length;
			let tab;
			if (typeof (btn) === "string"){
				let klass = _uiClasses[btn];
				if (!klass)
					throw new Error(`${btn} is not exist!`);
				tab = <any>this.createChild(klass, props);
			}
			else
				tab = <TabBtn>btn;
			tab.group = this;
			tab.state = idx == this.activeIndex ? "select" : "unselect";
			this._tabs.push(tab);
			return tab;
		}
		/** 
		* 设置一组标签按钮
		*/
		public setChilds(items: ui.ElementData[]) {
			/*for(var i = 0; i < items.length; i++) {
				var item = items[i];
				var c;
				if(Array.isArray(item))
					c = createChild.apply(this, item);
				else
					c = this.createChild(item.class, item);
				this.addTabBtn(c);
			}*/
			this.clearChilds();
			this._setChilds(items);
			for(var i = 0; i < this._childs.length; i++)
				this.addTabBtn(<TabBtn><any>this._childs[i]);
			var idx = this.activeIndex;
			if(idx >= 0 && idx < this._tabs.length)
				this._tabs[idx].state = "select";
		}
		/** 
		* 设置当前标签页index
		*/
		public activeIndex: number;
	}
	initUIClass(TabGroup, Container);
	//registerGuiClass("TabGroup", TabGroup);
}

/**
 * @module GUI
*/
namespace ez {
	export interface TouchHandler {
		onTouchBegin: (e: TouchData) => void;
		onTouchMove: (e: TouchData) => void;
		onTouchEnd: (e: TouchData) => void;
		onTouchCancel: (id: number) => void;
		disposed: boolean;
	}
	export type UIClass<T extends ui.Element> = { ClassName: string, instance: T };
	/** 
	 * UI根对象接口，通过egl.getRoot()获取，root代表了整个游戏窗口区域的范围，可以在root上创建ui元素。
	 */
	export interface UIRoot extends DataModel {
		/** @internal */
		resize(width: number, height: number);
		/** @internal */
		capture(id: number, ctrl: TouchHandler);
		/** @internal */
		screenToClient(x: number, y: number): Point;
		/** @internal */
		clientToScreen(x: number, y: number): Point;
		/**
		 * 文本样式
		 */
		textStyle: ui.TextStyle;
		/**
		 * 在root上创建ui元素
		 * @param uiclass ui类型
		 * @param props 元素属性表
		 * @return ui元素
		 */
		createChild<T extends ui.Element>(uiclass: UIClass<T>, props?: any): T;
		/**
		 * 根据id查找ui子元素
		 */
		find(id: string, recursive?: boolean): ui.Element;
		/**
		 * 清除所有ui子元素
		 */
		clear();
		/**
		 * 屏幕大小变化事件处理
		 */
		addScreenResizeListener(func: (width: number, height: number) => void, ctx?: any);
		/**
		 * 某个触摸事件是否被控件捕获
		 */
		isCaptured(id: number): boolean;
		/**
		 * 取消输入
		 */
		cancelInput();
		/**
		 * root宽度
		 */
		readonly width: number;
		/**
		 * root高度
		 */
		readonly height: number;
		/**
		 * 游戏窗口分辨率相对屏幕分辨率的缩放系数
		 */
		readonly scale: number;
		/**
		* 是否启用高清渲染
		* 启用高清渲染后，文本、矢量图形和3D模型将以屏幕实际分辨率大小进行渲染，在高清屏上获得清晰的显示
		* 开启后可能在低端机型上导致性能问题，需要进行一定的适配
		*/
		setHighDPI(enable: boolean);
	}

	/**
	* 屏幕适配模式
	*/
	export const enum ScreenAdaptMode {
		/**
		* 根据启动配置里设置的宽高参数以及当前屏幕的宽高比例调整root大小，并将root拉伸到屏幕大小
		*/
		ShowAll,
		/**
		* 固定root的大小，并将root拉伸到屏幕大小
		*/
		Fixed,
		/**
		* 固定root的大小。且不进行拉伸
		*/
		FixedNoScale,
		/**
		* 固定root的宽度，根据启动配置里高度范围以及当前屏幕的宽高比例调整root高度，并将root拉伸到屏幕大小
		*/
		FixedWidth,
		/**
		* 固定root的高度，根据启动配置里高度范围以及当前屏幕的宽高比例调整root宽度，并将root拉伸到屏幕大小
		*/
		FixedHeight,
		/**
		* 将root调整为屏幕大小
		*/
		ScreenSize,
		/**
		* 自定义适配策略，需要在启动配置里配置onScreenAdapt
		*/
		Custom
	}
	/**
    * 游戏窗口对齐模式
    */
	export const enum ScreenAlignMode {
		LeftTop = 0,
		LeftCenter = 1,
		LeftBottom = 2,
		CenterTop = 4,
		AllCenter = 5,
		CenterBottom = 6,
		RightTop = 8,
		RightCenter = 9,
		RightBottom = 10
	}
}
