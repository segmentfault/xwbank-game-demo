/// <reference path="RenderContext.ts"/>
/// <reference path="Profiler.ts"/>
/**
 * @module ezgame
*/
namespace ez {

	export namespace internal{
		export function createCanvas(): HTMLCanvasElement {
			if (PLATFORM == Platform.WeiXin)
				return wx.createCanvas();
			else
				return document.createElement("canvas");
		}
	}

	/** 
	* 使用canvas渲染
	*/
	export const enum CanvasSupport {
		/**
		 *不支持canvas模式
		*/
		NotSupport,
		/**
		 * 如果没有WebGL，退回canvas模式
		*/
		Fallback,
		/**
		 * 只用canvas模式
		*/
		Prefer
	}

	/** 
	* 引擎启动参数
	*/
	export interface LaunchData {
		/** 
		* 游戏窗口宽度
		*/
		width?: number;
		/** 
		* 游戏窗口高度
		*/
		height?: number;
		/** 
		* 窗口最小宽度
		*/
		minWidth?: number;
		/** 
		* 窗口最大宽度
		*/
		maxWidth?: number;
		/** 
		* 窗口最小高度
		*/
		minHeight?: number;
		/** 
		* 窗口最大高度
		*/
		maxHeight?: number;
		/** 
		* 窗口最小宽高比
		*/
		minRatio?: number;
		/** 
		* 窗口最大宽高比
		*/
		maxRatio?: number;
		/** 
		* 窗口根元素
		* 如果不指定的话，默认寻找id为game的元素
		*/
		div?: HTMLElement;
		/**
		* 微信小游戏主屏canvas
		*/
		canvas?: HTMLCanvasElement;
		/** 
		* 窗口适配策略
		* 
		* 微信小游戏平台上只支持FixedHeight,FixedWidth,ScreenSize三种模式
		*/
		scaleMode: ScreenAdaptMode;
		/** 
		* 自定义窗口适配策略
		*/
		onScreenAdapt?: (screenWidth: number, screenHeight: number) => { width: number, height: number, scale: number };
		/** 
		* 游戏窗口对齐模式
		*/
		alignMode?: ScreenAlignMode;
		/** 
		* 期望的fps，default: 60
		*/
		fps?: number;
		/** 
		* WebGL创建附加参数
		*/
		wglOptions?: WebGLContextAttributes;
		/** 
		* 是否在高分屏上启用高清渲染
		*/
		highDPI?: boolean;
		/** 
		* 是否开启3D渲染功能
		*/
		render3D?: boolean;
		/** 
		* canvas模式支持
		*/
		canvasMode?: CanvasSupport;
	}

	const enum TouchEvent {
		begin = 1,
		move = 2,
		end = 3
	}

	class TouchDataImpl implements TouchData {
		public id: number;
		public type: TouchEvent;
		public screenX: number;
		public screenY: number;
		public bubble: boolean = true;
		public time: number;
		public rawEvent: any;
		target: TouchHandler;

		public constructor(id, type, x, y, e) {
			this.id = id;
			this.type = type;
			this.screenX = x;
			this.screenY = y;
			this.rawEvent = e;
			this.time = Date.now();
		}

		public capture() {
			root.capture(this.id, this.target);
		}

		public excludeCapture() {
			root.cancelTouch(this.id, this.target);
		}
	}

	var gl: WebGLRenderingContext = null;

	function getLocation(e, div, invScale) {
		var doc = document.documentElement;
		var body = document.body;
		var l = 0, t = 0, x, y;

		if(div.getBoundingClientRect) {
			var box = div.getBoundingClientRect();
			l = box.left;
			t = box.top;
		}
		l += window.pageXOffset - doc.clientLeft;
		t += window.pageYOffset - doc.clientTop;
		if(e.pageX != null) {
			x = e.pageX;
			y = e.pageY;
		}
		else {
			l -= body.scrollLeft;
			t -= body.scrollTop;
			x = e.clientX;
			y = e.clientY;
		}
		var id = -1;
		if(typeof e.identifier == "number")
			id = e.identifier;
		else if(typeof e.pointerId == "number")
			id = e.pointerId;
		return {
			id: id,
			x: (x - l) * invScale,
			y: (y - t) * invScale
		}
	}

	abstract class UIRootBase extends DataModel implements UIRoot {
		public scale: number;
		protected invScale: number;
		protected touchEvents: TouchDataImpl[] = [];
		protected _canvas: HTMLCanvasElement;
		protected _onScreenResize: Function[];
		protected _lastSize;
		protected _screenBuffer: RenderTexture;
		//protected _screenSize: Point;
		protected _stage: Stage;
		protected _sizeDirty: boolean = false;
		protected _childs: Array<ui.Element> = [];
		protected _sizeChanged: boolean = false;
		textStyle: ui.TextStyle;
		touchCaptures: Dictionary<TouchHandler[]> = {};
		private _namedChilds: Dictionary<ui.Element> = {};

		abstract onResize(force?: boolean);
		abstract startInput(ctrl: ui.TextInput);
		abstract cancelInput();
		abstract setHighDPI(enable: boolean);
		//public abstract capture(id: number, ctrl: TouchHandler);
		public isCaptured(id: number): boolean {
			return !!this.touchCaptures[id];
		}
		public capture(id: number, ctrl: TouchHandler) {
			if(this.touchCaptures[id]) {
				if(this.touchCaptures[id].indexOf(ctrl) == -1)
					this.touchCaptures[id].push(ctrl);
			}
			else
				this.touchCaptures[id] = [ctrl];
		}
		public cancelTouch(id: number, ctrl: TouchHandler) {
			if(this.touchCaptures[id]) {
				var arr = this.touchCaptures[id];
				this.touchCaptures[id] = [ctrl];
				for(var i = 0; i < arr.length; i++) {
					if(arr[i] != ctrl && arr[i].onTouchCancel)
						arr[i].onTouchCancel(id);
				}
			}
		}
	
		public screenToClient(x: number, y: number): Point {
			return new Point(x, y);
		}
		public clientToScreen(x: number, y: number): Point {
			return new Point(x, y);
		}
		get _displayStage(): Stage {
			return this._stage;
		}

		public createChild<T extends ui.Element>(uiclass: UIClass<T>, props?: any): T{
			//var c = <any>ui.createUIElement(className, <any>this);
			var klass = <any>ui.getGuiClass(uiclass.ClassName);
			if (!klass)
				throw new Error(`${uiclass.ClassName} is not registered.`);
			let c = new klass(this);
			this._childs.push(c);
			this.childSizeChanged();
			if (props) {
				c._setProps(props);
				if (props.id) {
					var childs = this._namedChilds;
					var id = props.id;
					if (childs[id])
						Log.warn("control id conflict.", id);
					childs[id] = c;
					c._id = id;
				}
			}
			return c;
		}
		public clear() {
			var arr = this._childs.concat();
			for (var i = 0; i < arr.length; i++)
				arr[i].dispose();
		}
		protected renderImpl(frameProfiler) {
			if(PROFILING) {
				Profile.addCommand("begin render");
			}
			this._stage.render(this._screenBuffer, frameProfiler);			
		}

		public find(id: string, recursive?: boolean): any {
			for(var i = 0; i < this._childs.length; i++) {
				var c = this._childs[i];
				if(c.id == id)
					return c;
				if(typeof (<any>c).find === "function") {
					var k = (<any>c).find(id, recursive);
					if(k)
						return k;
				}
			}
			return null;
		}
		private _fireEvent() {
		}
		_removeChild(child: ui.Element) {
			var idx = this._childs.indexOf(child);
			if (idx == -1)
				throw new Error("child not exist!");
			this._childs.splice(idx, 1);
		}

		private childSizeChanged() {
			this._sizeDirty = true;
			//sizeInvalidate = true;
		}
		public get width() {
			return this.getProp("width");
		}
		public set width(v: number) {
			this.setProp("width", v);
		}

		public get height() {
			return this.getProp("height");
		}
		public set height(v: number) {
			this.setProp("height", v);
		}
		public addScreenResizeListener(func: (width: number, height: number) => void, ctx?: any) {
			func = ctx ? func.bind(ctx) : func;
			if (!this._onScreenResize)
				this._onScreenResize = [];
			this._onScreenResize.push(func);
		}

		public render(frameProfiler) {
			if(!this._stage.dirty)
				return;
			this.renderImpl(frameProfiler);
		}

		public checkSizeMeasure() {
			if (!this._sizeDirty && !this._sizeChanged)
				return;
			var w = this.width;
			var h = this.height;
			for (var i = 0; i < this._childs.length; i++) {
				var child = this._childs[i];
				child.measureBound(w, h, this._sizeChanged);
			}
			this._sizeChanged = false;
			this._sizeDirty = false;
		}

		public findControls(x: number, y: number): TouchHandler[] {
			if (x < 0 || x >= this.width || y < 0 || y >= this.height)
				return null;
			for (var i = this._childs.length - 1; i >= 0; i--) {
				var r = this._childs[i].findControls(x, y);
				if (r != null)
					return r;
			}
			return [];
		}

		public findElements(x: number, y: number): ui.Element[] {
			var r = [];
			for (var i = this._childs.length - 1; i >= 0; i--)
				this._childs[i].findElements(x, y, r);
			return r;
		}

        public resize(w: number, h: number) {
            this.width = w;
            this.height = h;
			if(useWGL) {
                this._canvas.width = w;
                this._canvas.height = h;
            }
            this.onResize();
        }

		public dispatchTouchEvents() {
			var ctrls;
			var i;
			var touchs = this.touchEvents;
			this.touchEvents = [];
			for(var j = 0; j < touchs.length; j++) {
				var e = touchs[j];
				switch (e.type) {
					case TouchEvent.begin:
						ctrls = this.findControls(e.screenX, e.screenY);
						//Log.debug(e.screenX, e.screenY, ctrls);
						if (!ctrls)
							break;
						for (i = 0; i < ctrls.length; i++) {
							e.target = ctrls[i];
							if (ctrls[i].onTouchBegin)
								ctrls[i].onTouchBegin.call(e.target, e);
							if (!e.bubble)
								break;
						}
						break;
					case TouchEvent.move:
						var a = this.touchCaptures[e.id];
						if (a) {
							for (i = 0; i < a.length; i++) {
								e.target = a[i];
								if (!a[i].disposed && a[i].onTouchMove)
									a[i].onTouchMove.call(e.target, e);
							}
							break;
						}
						ctrls = this.findControls(e.screenX, e.screenY);
						if (!ctrls)
							break;
						for (i = 0; i < ctrls.length; i++) {
							e.target = ctrls[i];
							if (ctrls[i].onTouchMove)
								ctrls[i].onTouchMove.call(e.target, e);
							if (!e.bubble)
								break;
						}
						break;
					case TouchEvent.end:
						var a = this.touchCaptures[e.id];
						if(a) {
							delete this.touchCaptures[e.id];
							for (i = 0; i < a.length; i++) {
								e.target = a[i];
								if (!a[i].disposed && a[i].onTouchEnd)
									a[i].onTouchEnd.call(e.target, e);
							}
							break;
						}
						ctrls = this.findControls(e.screenX, e.screenY);
						if (!ctrls)
							break;
						for (i = 0; i < ctrls.length; i++) {
							e.target = ctrls[i];
							if (ctrls[i].onTouchEnd)
								ctrls[i].onTouchEnd.call(e.target, e);
							if (!e.bubble)
								break;
						}
						break;
				}
			}
		}
	}

	class UIRootHtml extends UIRootBase {
		private div: HTMLElement;
		private _input: HTMLInputElement | HTMLTextAreaElement;
		private _inputting: boolean = false;
		private _inputCtrl: ui.TextInput;
		private _launchData: LaunchData;
		private isIOS = false;
		//private _lastHoverCtrl: ui.Control;

		constructor(data: LaunchData) {
			super();
			var ua = navigator.userAgent.toLowerCase();
			this.isIOS = ua.indexOf("iphone") >= 0 || ua.indexOf("ipad") >= 0 || ua.indexOf("ipod") >= 0;

			this._launchData = data;
			var div:any = this.div = data.div;
			this._stage = createStage(); 
			var ctx = this;
			if (data.canvasMode == CanvasSupport.Prefer)
				useWGL = WGLVersion.NoGL;
			else
				useWGL = WGLVersion.GL1;
			if(useWGL) {
				var c = internal.createCanvas();
				c.style.left = "0px";
				c.style.top = "0px";
				var options = {
					alpha: false,
					preserveDrawingBuffer: false,
					depth: !!data.render3D,
					stencil: !!data.render3D,
					antialias: true
				};
				if (data.wglOptions) {
					for (var k in data.wglOptions)
						options[k] = data.wglOptions[k];
				}
				gl = <WebGLRenderingContext>c.getContext("experimental-webgl", options);
				if(!gl) {
					if (data.canvasMode == CanvasSupport.Fallback)
						useWGL = WGLVersion.NoGL;
					else
						throw new Error("your browser doesn't support WebGL!");
				}
				else {
					this._canvas = c;
					div.appendChild(c);
					internal.createWGLRenderContext(gl);
					let data: any = { width: 0, height: 0, memSize: 0, fb: null  };
					this._screenBuffer = new RenderTexture(data, 0, 0);
				}
			}

			if(!useWGL) {
				createCanvasRenderContext();
				var c = document.createElement("canvas");
				div.appendChild(c);
				this._canvas = c;
			}

			this.onResize();
			var isTouch = false;
			function prevent(e) {
				e.stopPropagation();
				e.preventDefault();
			}
			div.oncontextmenu = function () {
				return false;
			}
			var mouseDown = false;
			div.onpointerdown = function (e: PointerEvent) {
				if(ctx._inputting)
					return;
				prevent(e);
				mouseDown = true;
				div.setPointerCapture(e.pointerId);
				ctx.onTouchBegin(e);
			}
			div.onpointermove = function (e: PointerEvent) {
				if(ctx._inputting)
					return;
				prevent(e);
				ctx.onTouchMove(e);
				if(!mouseDown)
					ctx.mouseMove(e);
			}
			div.onpointerup = function (e: PointerEvent) {
				if(ctx._inputting)
					return;
				prevent(e);
				mouseDown = false;
				div.releasePointerCapture(e.pointerId);
				ctx.onTouchEnd(e);
			}
			
			div.addEventListener("touchstart", function (e: any) {
				if(!isTouch) {
					div.onpointerdown = null;
					div.onpointermove = null;
					div.onpointerup = null;
					isTouch = true;
				}
				if (ctx._inputting)
					return;
				e.stopPropagation();
				e.preventDefault();
				var l = e.changedTouches.length;
				for (var i = 0; i < l; i++)
					ctx.onTouchBegin(e.changedTouches[i]);
			}, { passive: false });
			div.addEventListener("touchmove", function (e: any) {
				if (ctx._inputting)
					return;
				e.stopPropagation();
				e.preventDefault();
				var l = e.changedTouches.length;
				for (var i = 0; i < l; i++)
					ctx.onTouchMove(e.changedTouches[i]);
			}, { passive: false });
			div.addEventListener("touchend", function (e: any) {
				if (ctx._inputting)
					return;
				e.stopPropagation();
				e.preventDefault();
				var l = e.changedTouches.length;
				for (var i = 0; i < l; i++)
					ctx.onTouchEnd(e.changedTouches[i]);
			}, { passive: false });
			div.addEventListener("touchcancel", function (e: any) {
				if (ctx._inputting)
					return;
				e.stopPropagation();
				e.preventDefault();
				var l = e.changedTouches.length;
				for (var i = 0; i < l; i++)
					ctx.onTouchEnd(e.changedTouches[i]);
			}, { passive: false });
		}

		public cancelInput() {
			this._inputCtrl = null;
			this._inputting = false;
			window.scrollTo(0, 0);
			if(this._input) {
				this.div.removeChild(this._input);
				this._input = null;
			}
		}
		public startInput(ctrl: ui.TextInput) {
			if(this._inputting) {
				Log.error("the last inputting is not end.");
				return;
			}
			var bound = ctrl.getBound();
			var start = ctrl.clientToScreen(0, 0);
			bound = new Rect(start.x, start.y, bound.width, bound.height);
			bound.left *= this.scale;
			bound.top *= this.scale;

			if(this._input) {
				this.div.removeChild(this._input);
				this._input = null;
			}

			if(ctrl.multiLine) {
				this._input = document.createElement("textarea");
			}
			else {
				this._input = document.createElement("input");
				this._input.type = ctrl.type || "text";
			}
			var ctx = <any>this._input;
			this.div.appendChild(this._input);
			if(ctx.scrolltoView) {
				//Log.info("scroll");
				setTimeout(function () { ctx.scrolltoView({ block: 'start' }) }, 100);
			}
			this._inputting = true;
			this._inputCtrl = ctrl;
			var style: CSSStyleDeclaration = ctx.style;

			ctx.value = ctrl.text;
			ctrl.visible = false;
			//ctrl.text = "";
			var font = (<any>ctrl)._label.font;
			style.font = font;
			style.transform = "scale(" + this.scale + ")";
			style.color = (<any>ctrl)._label.color;
			if (ctrl.maxLength)
				ctx.maxLength = ctrl.maxLength;			
			style.left = bound.left + "px";
			style.top = bound.top + "px";
			style.overflow = "hidden";
			style.width = (bound.width | 0).toString() + "px";
			style.height = (bound.height | 0).toString() + "px";
			style.visibility = "visible";
			ctx.focus();

			var That = this;
			ctx.onblur = ev => { That.endInputHandler(false); };

			if(!ctrl.multiLine || ctrl.submitOnReturn) {
				if (this.isIOS) {
					ctx.oninput = function (ev) {
						var v = ctx.value;
						if (v.indexOf("\n") >= 0) {
							ctx.value = v.replace("\n", "");
							That.endInputHandler(true);
						}
					}
				}
				else {
					ctx.onkeydown = ev => {
						if (ev.key == "Enter")
							That.endInputHandler(true);
					}
				}
			}
		}
		private endInputHandler(enter: boolean) {
			var val = "";
			if(!this._inputCtrl)
				return;
			var c = this._inputCtrl;
			val = this._input.value;
			if(this._input) {
				this.div.removeChild(this._input);
				this._input = null;
			}
			c.visible = true;
			c.state = "normal";
			c.text = val;
			c.fireEvent("input", enter);
			this._inputting = false;
			window.scrollTo(0, 0);
		}
		setHighDPI(enable: boolean) {
			if (this._launchData.highDPI != enable) {
				this._launchData.highDPI = enable;
				this.onResize(true);
			}
		}
		public onResize(force?: boolean) {
			if (this._inputting)
				return;
			var launchData = this._launchData;
			var div = this.div;
			var canvas = this._canvas;
			var parent = div.parentElement;
			if (parent == document.body)
				parent = document.documentElement;
			var screenWidth = parent.clientWidth;
			var screenHeight = parent.clientHeight;
			if(force || !this._lastSize || this._lastSize[0] != screenWidth || this._lastSize[1] != screenHeight)
				this._lastSize = [screenWidth, screenHeight];
			else
				return;
				
			var width, height;
			var scale = 1;
			if(launchData.scaleMode == ScreenAdaptMode.FixedHeight) {
				height = launchData.height;
				scale = height / screenHeight;
				width = scale * screenWidth;
				if (launchData.maxWidth)
					width = Math.min(width, launchData.maxWidth);

				if (launchData.minWidth && width < launchData.minWidth) {
					scale = launchData.minWidth / screenWidth;
					width = launchData.minWidth;
				}
			}
			else if(launchData.scaleMode == ScreenAdaptMode.FixedWidth) {
				width = launchData.width;
				scale = width / screenWidth;
				height = scale * screenHeight;
				if (launchData.maxHeight)
					height = Math.min(height, launchData.maxHeight);

				if (launchData.minHeight && height < launchData.minHeight) {
					scale = launchData.minHeight / screenHeight;
					height = launchData.minHeight;
				}
			}
			else if(launchData.scaleMode == ScreenAdaptMode.ScreenSize) {
				scale = window.devicePixelRatio;
				width = screenWidth * scale;
				height = screenHeight * scale;
				//Log.info(`onresize ${scale} ${screenWidth} ${screenHeight}`);
			}
			else if(launchData.scaleMode == ScreenAdaptMode.FixedNoScale) {
				width = launchData.width;
				height = launchData.height;
				scale = 1;
			}
			else if(launchData.scaleMode == ScreenAdaptMode.Fixed) {
				width = launchData.width;
				height = launchData.height;
				scale = Math.max(width / screenWidth, height / screenHeight);
			}
			else if(launchData.scaleMode == ScreenAdaptMode.ShowAll) {
				width = screenWidth;
				height = screenHeight;
				var ratio = width / height;
				if (launchData.minRatio && ratio < launchData.minRatio)
					height = width / launchData.minRatio;
				if (launchData.maxRatio && ratio > launchData.maxRatio)
					width = height * launchData.maxRatio;

				if (launchData.minWidth && width < launchData.minWidth || launchData.minHeight && height < launchData.minHeight)
					scale = Math.max(launchData.minWidth ? launchData.minWidth / width : 1, launchData.minHeight ? launchData.minHeight / height : 1);

				if (launchData.maxWidth && width > launchData.maxWidth || launchData.maxHeight && height > launchData.maxHeight)
					scale = Math.min(launchData.maxWidth ? launchData.maxWidth / width : 1, launchData.maxHeight ? launchData.maxHeight / height : 1);

				width = scale * width;
				height = scale * height;
			}
			else if(launchData.scaleMode == ScreenAdaptMode.Custom) {
				var r = launchData.onScreenAdapt(screenWidth, screenHeight);
				width = r.width;
				height = r.height;
				scale = r.scale;
			}
			this.invScale = scale;
			scale = 1 / scale;
			var w = round(width * scale);
			var h = round(height * scale);

			if(force || this.width != width || this.height != height || this.scale != scale) {
				this.scale = scale;
				this.width = width;
				this.height = height;
				this._sizeChanged = true;
				this._stage.makeDirty(false);
				if (this._onScreenResize){
					for (let func of this._onScreenResize)
						func(width, height);
				}

				if(!useWGL) {
					canvas.width = width;
					canvas.height = height;
					this._screenBuffer = RenderTexture.createFromCanvas(canvas);
					canvas.style.width = w + "px";
					canvas.style.height = h + "px";
				}
				else{
					canvas.style.width = w + "px";
					canvas.style.height = h + "px";
					if(launchData.highDPI) {
						var s = scale * window.devicePixelRatio;
						canvas.width = (width * s) | 0;
						canvas.height = (height * s) | 0;
						this._screenBuffer.scale = s;
					}
					else {
						canvas.width = width | 0;
						canvas.height = height | 0;
						this._screenBuffer.scale = 1;
					}
					this._screenBuffer.resize(width, height);
				}
			}

			var x = 0;
			var y = 0;
			var va = launchData.alignMode & 3;
			var ha = launchData.alignMode >> 2;
			if (ha == 1)
				x = round((screenWidth - w) * 0.5);
			else if (ha == 2)
				x = screenWidth - w;
			if (va == 1)
				y = round((screenHeight - h) * 0.5);
			else if (va == 2)
				y = screenHeight - h;

			div.style.left = Math.max(0, x) + "px";
			div.style.top = Math.max(0, y) + "px";
			div.style.width = Math.min(screenWidth, w) + "px";
			div.style.height = Math.min(screenHeight, h) + "px";
		}

		private onTouchBegin(e) {
			internal.startAudio();
			var l = getLocation(e, this.div, this.invScale);
			this.touchEvents.push(new TouchDataImpl(l.id, TouchEvent.begin, l.x, l.y, e));
			//Log.info("onTouchBegin", e);
			//this.dispatchTouchEvents();
		}

		private onTouchMove(e) {
			var l = getLocation(e, this.div, this.invScale);
			this.touchEvents.push(new TouchDataImpl(l.id, TouchEvent.move, l.x, l.y, e));
			//Log.info("onTouchMove", e);
			//this.dispatchTouchEvents();
		}

		private onTouchEnd(e) {
			var l = getLocation(e, this.div, this.invScale);
			this.touchEvents.push(new TouchDataImpl(l.id, TouchEvent.end, l.x, l.y, e));
			//Log.info("onTouchEnd", e);
			//this.dispatchTouchEvents();
		}

		private mouseMove(e) {

		}

		public dispatchTouchEvents() {
			if (this._inputting)
				return;
			super.dispatchTouchEvents();
		}
	}

	class UIRootWX extends UIRootBase {
		_launchData: LaunchData;
		_inputCtrl: ui.TextInput;

		constructor(data: LaunchData) {
			super();
			this._launchData = data;
			this._canvas = data.canvas;
			this._stage = createStage(); 
			var ctx = this;
			internal.createWGLRenderContext(gl);
			this._screenBuffer = new RenderTexture(<TextureData>{ width: 0, height: 0, memSize: 0, fb:null });
			this.onResize();
			var ctx = this;
			function getPos(e) {
				return {
					id: e.identifier, x: e.clientX * ctx.invScale, y: e.clientY * ctx.invScale
				};
			}
			wx.onTouchStart(function (e) {
				var l = e.changedTouches.length;
				Log.info(`touch start `, e.changedTouches[0]);
				for (var i = 0; i < l; i++)
					ctx.onTouchBegin(getPos(e.changedTouches[i]));
			});
			wx.onTouchMove(function(e){
				var l = e.changedTouches.length;
				for (var i = 0; i < l; i++)
					ctx.onTouchMove(getPos(e.changedTouches[i]));
			});
			wx.onTouchEnd(function(e){
				var l = e.changedTouches.length;
				for (var i = 0; i < l; i++)
					ctx.onTouchEnd(getPos(e.changedTouches[i]));
			});
			wx.onTouchCancel(function(e){
				var l = e.changedTouches.length;
				for (var i = 0; i < l; i++)
					ctx.onTouchEnd(getPos(e.changedTouches[i]));
			});
			wx.onKeyboardConfirm(function (v) {
				Log.info("input:", v);
				var ctrl = ctx._inputCtrl;
				if(!ctrl)
					return;
				ctrl.state = "normal";
				ctrl.text = v.value;
				ctrl.fireEvent("input", true);
				ctx._inputCtrl = null;
			});
		}
		setHighDPI(enable: boolean) {
			if (this._launchData.highDPI != enable) {
				this._launchData.highDPI = enable;
				this.onResize(true);
			}
		}
		public startInput(ctrl: ui.TextInput) {
			wx.showKeyboard({
				defaultValue: ctrl.text,
				maxLength: ctrl.maxLength,
				multiple: ctrl.multiLine,
				confirmHold: false,		//	当点击完成时键盘是否收起	
				confirmType: "done",	//	键盘右下角 confirm 按钮的类型，只影响按钮的文本内容: done,next,search,go,send				
				//complete: function () { wx.offKeyboardConfirm(confirm); }
			});
			this._inputCtrl = ctrl;
		}
		public cancelInput() {
			this._inputCtrl = null;
			wx.hideKeyboard({});
		}

		public render(frameProfiler) {
			if(!this._stage.dirty)
				return;
			this.renderImpl(frameProfiler);
		}
		public onResize(force?: boolean) {
			var launchData = this._launchData;
			var info = wx.getSystemInfoSync();
			var screenWidth = info.windowWidth;
			var screenHeight = info.windowHeight;
			Log.info(`onresize:${screenWidth} ${screenHeight}`);
			if(force || !this._lastSize || this._lastSize[0] != screenWidth || this._lastSize[1] != screenHeight)
				this._lastSize = [screenWidth, screenHeight];
			else
				return;
			//this.needResize = false;
			var width, height;
			var scale = 1;
			if (launchData.scaleMode == ScreenAdaptMode.FixedHeight) {
				height = launchData.height;
				scale = height / screenHeight;
				width = scale * screenWidth;
				//if (launchData.maxWidth)
				//	width = Math.min(width, launchData.maxWidth);
				//if (launchData.minWidth && width < launchData.minWidth) {
					//scale = launchData.minWidth / screenWidth;
				//	width = launchData.minWidth;
				//}
			}
			else if (launchData.scaleMode == ScreenAdaptMode.FixedWidth) {
				width = launchData.width;
				scale = width / screenWidth;
				height = scale * screenHeight;
				/*if (launchData.maxHeight)
					height = Math.min(height, launchData.maxHeight);

				if (launchData.minHeight && height < launchData.minHeight) {
					//scale = launchData.minHeight / screenHeight;
					height = launchData.minHeight;
				}*/
			}
			else if (launchData.scaleMode == ScreenAdaptMode.ScreenSize) {
				scale = 1;
				width = screenWidth;
				height = screenHeight;
			}
			else if (launchData.scaleMode == ScreenAdaptMode.Custom) {
				var r = launchData.onScreenAdapt(screenWidth, screenHeight);
				width = r.width;
				height = r.height;
				scale = r.scale;
			}
			else {
				scale = 1;
				width = screenWidth;
				height = screenHeight;
				Log.error(`not support in wx`);
			}

			if(force || this.width != width || this.height != height || this.invScale != scale) {
				this.invScale = scale;
				this.scale = 1 / scale;
				this.width = width;
				this.height = height;
				this._sizeChanged = true;
				this._stage.makeDirty(false);
				if (this._onScreenResize){
					for (let func of this._onScreenResize)
						func(width, height);
				}
				if (!launchData.highDPI) {
					this._canvas.width = width | 0;
					this._canvas.height = height | 0;
				}
				else {
					screenWidth = Math.min(2048, info.windowWidth * info.pixelRatio);
					screenHeight = Math.min(2048, info.windowHeight * info.pixelRatio);
					scale = Math.min(screenWidth / width, screenHeight / height);
					this._canvas.width = (width * scale) | 0;
					this._canvas.height = (height * scale) | 0;
					this._screenBuffer.scale = scale;
				}
				this._screenBuffer.resize(width, height);
			}
		}
		 
		private onTouchBegin(e) {
			//Log.info(`onTouchBegin`, e);
			this.touchEvents.push(new TouchDataImpl(e.id || -1, TouchEvent.begin, e.x, e.y, e));
		}

		private onTouchMove(e) {
			this.touchEvents.push(new TouchDataImpl(e.id || -1, TouchEvent.move, e.x, e.y, e));
		}

		private onTouchEnd(e) {
			this.touchEvents.push(new TouchDataImpl(e.id || -1, TouchEvent.end, e.x, e.y, e));
		}
	}

	function round(val: number): number {
		return (val + 0.5) | 0;
	}

	var root: UIRootBase;
	var frameTime: number;
	var lastUpdateTime: number;
	var tickers = [];
	var nextFrameCallers = [];
	var timers = {};
	var timerIdx = 0;
	var timeScale = 1;

	/** 
	* 在下一帧渲染时调用，常用于循环刷新
	*/
	export function callNextFrame(func: () => void, thisObj?: any) {
		nextFrameCallers.push({ func: func, ctx: thisObj });
    }
	/** 
	* 添加一个timer
	*/
	export function setTimer(delay: number, func: () => void, thisObj?: any): number {
		var data = { func: func, ctx: thisObj, delay: delay };
        timers[++timerIdx] = data;
        return timerIdx;
	}
	/** 
	* 删除一个timer
	*/
	export function removeTimer(id: number) {
		delete timers[id];
	}
	/** 
	* 添加每帧循环调用，常用于循环刷新
	*/
	export function addTicker(func: (dt: number) => void, thisObj?: any): Object {
		var ticker = { func: func, ctx: thisObj };
		tickers.push(ticker);
		return ticker;
	}
	/** 
	* 获取当前游戏时间(ms)
	*/
	export function getTick() {
		return Date.now() * timeScale;
	}
	/** 
	* 删除一个ticker
	*/
	export function removeTicker(ticker: Object) {
		var idx = tickers.indexOf(ticker);
		if (idx != -1)
			tickers.splice(idx, 1);
	}
	/**
	 * 当前游戏运行的fps
	 */
	export var fps: number = 0;

	/** 
	* 时间加速/减速(加速齿轮)，对timer起作用
	* @scale 时间缩放系数，例如：0.5表示时间加速一倍，2表示时间减慢一倍
	*/
	export function timeShift(scale: number) {
		timeScale = scale;
	}

	/** 
	* 获得根对象
	*/
	export function getRoot(): UIRoot {
		return root;
	}

	var gamePause = false;
	/**
	 * 暂停游戏
	 */
	export function pause(){
		gamePause = true;
	}
	/**
	 * 继续运行
	 */
	export function resume() {
		gamePause = false;
	}

	/**
	 * 等待一段事件
	 * @param ms 毫秒数
	*/
	export function delay(ms: number): Promise<void> {
		return new Promise<void>(r => ez.setTimer(ms, r));
	}
	/**
	 * 等待下一帧开始
	*/
	export function nextFrame(): Promise<void> {
		return new Promise<void>(r => { ez.callNextFrame(r); });
	}

	/** 
	* 引擎初始化
	*/
	export function initialize(data: LaunchData) {
		if (typeof Log === "undefined")
			Log = console;

		ui.registerTextStyle({ id: "default", font: TextMetric.DefaultFont, color: "#ffffff" });
		internal.init();

		if(PLATFORM == Platform.WeiXin) {
			if (wx.getSystemInfoSync().platform == "ios")
				internal.setImageExt(".2");
			else
				internal.setImageExt(".1");
			if (!data.canvas)
				data.canvas = wx.createCanvas();
		}
		else {
			var style = document.createElement("style");
			document.body.appendChild(style);
			style.appendChild(document.createTextNode(`
.ezgame div{display:block;margin:0 auto;padding:0;border:0;position:absulute;}
.ezgame canvas{display:block;position:absulute;}
.ezgame input, textarea{background: none;padding: 0px;outline: thin;border:0 none;padding: 0;position:absolute;z-index: 1000;display: block;font-size-adjust: none;transform-origin:0 0;}
.ezgame textarea{word-break: break-all;}`));

			if (typeof data.alignMode !== "number")
				data.alignMode = ScreenAlignMode.AllCenter;
			if (typeof data.scaleMode !== "number")
				data.scaleMode = ScreenAdaptMode.ShowAll;
			if (!data.div)
				data.div = document.getElementById("game");
			data.div.setAttribute("class", "ezgame");
			root = new UIRootHtml(data);
		}

		var reqFrame;
		if (typeof requestAnimationFrame == "function")
			reqFrame = requestAnimationFrame;
		else{
			reqFrame = window.webkitRequestAnimationFrame || window["mozRequestAnimationFrame"] || window["oRequestAnimationFrame"] || window["msRequestAnimationFrame"];
			if (!reqFrame)
				reqFrame = function (callback) { return window.setTimeout(callback, frameTime) }
		}

		frameTime = data.fps ? 1000 / data.fps : 0;
		lastUpdateTime = Date.now();

		var frames = 0;
		var startTime = Date.now();
		
		var upaditing = false;
		setInterval(() => {
			var t = Date.now() - lastUpdateTime;
			if (t > 200 && !upaditing && !gamePause) {
				upaditing = true;
				Log.debug("%d: more than %d ms no update. force to update", lastUpdateTime, t);
				frameUpdate(false);
				lastUpdateTime = Date.now();
				upaditing = false;
			}
		}, 1000);

		function frameUpdate(request) {
			if (request)
				reqFrame(frameUpdate);
			var dt = Date.now() - lastUpdateTime;
			if (dt < frameTime || gamePause)
				return;
			if(dt > 1000)
				dt = 1000;
			var frameProfiler;
			if(PROFILING)
				frameProfiler = Profile.newFrame();
			lastUpdateTime = Date.now();
			root.onResize();
			if (nextFrameCallers.length > 0) {
				var q = nextFrameCallers.splice(0, nextFrameCallers.length);
				for (var i = 0; i < q.length; i++) {
					if (DEBUG) {
						q[i].func.call(q[i].ctx);
					}
					else {
						try {
							q[i].func.call(q[i].ctx);
						}
						catch (e) {
							Log.error("nextFrame caller exception: " + e.message + "\ncall tack: " + e.stack);
						}
					}
				}
			}
			for (var i = 0; i < tickers.length; i++) {
				var ticker = tickers[i];
				if (DEBUG) {
					ticker.func.call(ticker.ctx, dt * timeScale);
				}
				else {
					try {
						ticker.func.call(ticker.ctx, dt * timeScale);
					}
					catch (e) {
						Log.error("ticker exception: " + e.message + "\ncall stack: " + e.stack);
						tickers.splice(i, 1);
					}
				}
			}
			for (var k in timers) {
				var data = timers[k];
				data.delay -= dt * timeScale;
				if (data.delay <= 0) {
					delete timers[k];
					if (DEBUG) {
						data.func.apply(data.ctx);
					}
					else {
						try {
							data.func.apply(data.ctx);
						}
						catch (e) {
							Log.error("timer exception: " + e.message + "\ncall stack: " + e.stack);
						}
					}
				}
			}
			root.dispatchTouchEvents();
			root.checkSizeMeasure();
			if (PROFILING && frameProfiler) {
				frameProfiler.updateTime = Profile.now() - frameProfiler.updateTime;
				frameProfiler.renderTime = Profile.now();
			}
			if (request) {
				if (DEBUG) {
					root.render(frameProfiler);
				}
				else {
					try {
						root.render(frameProfiler);
					}
					catch (e) {
						Log.error("render exception: " + e.message + "\ncall stack: " + e.stack);
					}
				}
			}
			if (PROFILING && frameProfiler) {
				Profile.endFrame();
				frameProfiler = null;
			}
			frames++;
			var dt = Date.now() - startTime;
			if (dt > 1000) {
				startTime = Date.now();
				fps = frames * 1000 / dt;
				frames = 0;
			}
		}
		reqFrame(frameUpdate);
		startTime = Date.now();
		
		internal.afterInit();
	}
}