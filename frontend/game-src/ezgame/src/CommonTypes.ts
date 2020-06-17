/// <reference path="config.ts"/>
/// <reference path="DataModel.ts"/>

/**
 * @module ezgame
 */
namespace ez {
	var initFuncs = [];
	var initAfterFuncs = [];

	/** @internal */
	export namespace internal {
		export function init() {
			for (var i = 0; i < initFuncs.length; i++)
				initFuncs[i]();
			initFuncs = null;
		}
		export function afterInit() {
			for (var i = 0; i < initAfterFuncs.length; i++)
				initAfterFuncs[i]();
			initAfterFuncs = null;
		}
	}
	/**
	 * 初始化事件注册，在egl初始化前被调用
	 * @param func 回调函数
	 * @param afterInit 默认在ez.initialize前调用，设置为true的话则在ez.initialize()之后调用
	 */
	export function initCall(func: Function, afterInit = false) {
		if (afterInit)
			initAfterFuncs.push(func);
		else
			initFuncs.push(func);
	}
}

/**
 * 基础类型
 * @module CommonTypes
 */
namespace ez {
	/** 
	* 4个数字的元组
	*/
	export type Number4 = [number, number, number, number];
	/** 
	* 3个数字的元组
	*/
	export type Number3 = [number, number, number];
	/** 
	* 2个数字的元组
	*/
	export type Number2 = [number, number];
	/**
	* 字典类型
	*/
	export type Dictionary<T> = { [key: string]: T; }

	/** 
	* 定义UI位置坐标用的对象，支持像素和百分比
	*/
	export class Dimension {
		value: number;
		isPercent: boolean;

		constructor(val: number | string) {
			if (typeof (val) === "number") {
				this.value = <number>val;
				this.isPercent = false;
			}
			else if (typeof (val) === "string") {
				var s = <string>val;
				s = s.trim();
				if(/^-?\d+\.?\d*%$/.test(s)) {
					this.value = parseFloat(s.substring(0, s.length - 1)) * 0.01;
					this.isPercent = true;
				}
				else if(/^(-?\d+)(\.\d+)?$/.test(s)) {
					this.value = parseFloat(s);
					this.isPercent = false;
				}
				else
					throw new Error(`${val} is not a number or percent.`);
			}
		}

		public toString(): string {
			if (this.isPercent)
				return (this.value * 100).toString() + "%";
			else
				return this.value.toString();
		}
		/**
		* 转换为像素坐标值
		*/
		public calcSize(size: number): number {
			return this.isPercent ? this.value * size : this.value;
		}
	}

	/**
	 * 2D点对象
	 */
	export class Point {
		public constructor(x?: number, y?: number) {
			this.x = x || 0;
			this.y = y || 0;
		}
		public x: number;
		public y: number;

		public clone(): Point {
			return new Point(this.x, this.y);
		}
		public toString(): string {
			return "" + this.x + "," + this.y;
		}
		public equals(pt: Point): boolean {
			return this.x == pt.x && this.y == pt.y;
		}
		public static add(p1: Point, p2: Point) {
			return new Point(p1.x + p2.x, p1.y + p2.y);
		}
		public static sub(p1: Point, p2: Point) {
			return new Point(p1.x - p2.x, p1.y - p2.y);
		}
		public static mul(p1: Point, v: number) {
			return new Point(p1.x * v, p1.y * v);
		}
		public static parse(val: string): Point {
			var args = val.split(",");
			return new Point(parseFloat(args[0]), parseFloat(args[1]));
		}
		public static distance(p1: Point, p2: Point): number {
            return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y))
        }
	}
	/**
	 * 2D矩形对象
	 */
	export class Rect {
		constructor(l?: number, t?: number, w?: number, h?: number) {
			this.left = l || 0;
			this.top = t || 0;
			this.width = w || 0;
			this.height = h || 0;
		}

		public left: number;
		public top: number;
		public width: number;
		public height: number;

		public get right(): number {
			return this.left + this.width;
		}
		public set right(value: number) {
			this.width = value - this.left;
		}
		public get bottom(): number {
			return this.top + this.height;
		}
		public set bottom(value: number) {
			this.height = value - this.top;
		}
		public clone(): Rect {
			return new Rect(this.left, this.top, this.width, this.height);
		}
		public toString(): string {
			return "" + this.left + "," + this.top + "," + this.width + "," + this.height;
		}
		public static parse(val: string): Rect {
			var args = val.split(",");
			return new Rect(parseFloat(args[0]), parseFloat(args[1]), parseFloat(args[2]), parseFloat(args[3]));
		}
		public contains(x: number, y: number): boolean {
			return this.left <= x &&
				this.left + this.width >= x &&
				this.top <= y &&
				this.top + this.height >= y;
		}
		public containsPt(pt: Point): boolean {
			return this.contains(pt.x, pt.y);
		}
		public static equal(r1: Rect, r2: Rect): boolean {
			if(!r1 || !r2)
				return false;
			return r1.top === r2.top && r1.left === r2.width && r1.left === r2.width && r1.height === r2.height;
		}
		public static intersect(r1: Rect, r2: Rect): Rect {
			var l = Math.max(r1.left, r2.left);
			var t = Math.max(r1.top, r2.top);
			return new Rect(l, t, Math.max(0, Math.min(r1.right, r2.right) - l),
				Math.max(0, Math.min(r1.bottom, r2.bottom) - t));
		}
	}
	/*
	 * 颜色对象, rgba范围为0~255
	 */
	export class Color {
		r: number;
		g: number;
		b: number;
		a: number;
		constructor(r = 0, g = 0, b = 0, a = 255) {
			this.r = r;
			this.g = g;
			this.b = b;
			this.a = a;
		}
		/*
		 * 转换为rgba32格式
		 */
		public get rgba(): number {
			return (this.a << 24) | (this.b << 16) | (this.g << 8) | this.r; 
		}
		/*
		 * 转换为vec3格式，rgb归一化为0~1
		 */
		public toVec3(): Number3{
			var f = 1 / 255;
			return [this.r * f, this.g * f, this.b * f];
		}
		/*
		 * 转换为vec4格式，rgb归一化为0~1
		 */
		public toVec4(): Number4 {
			var f = 1 / 255;
			return [this.r * f, this.g * f, this.b * f, this.a * f];
		}
	}
	/**
	 * 2D矩阵对象
	 */
	export class Matrix {
		constructor(a?: number, b?: number, c?: number, d?: number, tx?: number, ty?: number) {
			this._11 = (typeof a === "number") ? a : 1;
			this._12 = b || 0;
			this._21 = c || 0;
			this._22 = (typeof d === "number") ? d : 1;
			this.tx = tx || 0;
			this.ty = ty || 0;
		}

		public _11: number;
		public _12: number;
		public _21: number;
		public _22: number;
		public tx: number;
		public ty: number;

		public static Deg2Rad = Math.PI / 180;
		public static Identity = new Matrix();

		public static rotate(angle): Matrix {
			var a = Matrix.Deg2Rad * angle;
			var c = Math.cos(a);
			var s = Math.sin(a);
			return new Matrix(c, s, -s, c, 0, 0);
		}

		public static scale(sx, sy): Matrix {
			return new Matrix(sx, 0, 0, sy, 0, 0);
		}

		public static translate(x, y): Matrix {
			return new Matrix(1, 0, 0, 1, x, y);
		}

		public clone(): Matrix {
			return new Matrix(this._11, this._12, this._21, this._22, this.tx, this.ty);
		}
		public identity(): Matrix {
			this._11 = 1;
			this._12 = 0;
			this._21 = 0;
			this._22 = 1;
			this.tx = 0;
			this.ty = 0;
			return this;
		}
		public rotate(a): Matrix {
			a *= Matrix.Deg2Rad;
			var c = Math.cos(a);
			var s = Math.sin(a);
			var _11 = this._11;
			var _21 = this._21;
			var tx = this.tx;
			this._11 = _11 * c - this._12 * s;
			this._12 = _11 * s + this._12 * c;
			this._21 = _21 * c - this._22 * s;
			this._22 = _21 * s + this._22 * c;
			this.tx = tx * c - this.ty * s;
			this.ty = tx * s + this.ty * c;
			return this;
		}

		public scale(sx, sy): Matrix {
			this._11 *= sx;
			this._12 *= sx;
			this.tx *= sx;

			this._21 *= sy;
			this._22 *= sy;
			this.ty *= sy;
			return this;
		}

		public translate(x, y): Matrix {
			this.tx += x;
			this.ty += y;
			return this;
		}

		public append(m: Matrix): Matrix {
			var _11 = this._11;
			var _12 = this._12;
			var _21 = this._21;
			var _22 = this._22;
			var tx = this.tx;
			this._11 = _11 * m._11 + _12 * m._21;
			this._12 = _11 * m._12 + _12 * m._22;
			this._21 = _21 * m._11 + _22 * m._21;
			this._22 = _21 * m._12 + _22 * m._22;
			this.tx = tx * m._11 + this.ty * m._21 + m.tx;
			this.ty = tx * m._12 + this.ty * m._22 + m.ty;
			return this;
		}

		public invert(): Matrix {
			var _11 = this._11;
			var _12 = this._12;
			var _21 = this._21;
			var _22 = this._22;
			var a = 1 / (_11 * _22 - _12 * _21);
			var tx = this.tx;
			this._11 = _22 * a;
			this._12 = -_12 * a;
			this._21 = -_21 * a;
			this._22 = _11 * a;
			this.tx = (_21 * this.ty - _22 * tx) * a;
			this.ty = (_12 * tx - _11 * this.ty) * a;
			return this;
		}

		public transformPt(pt: Point): Point {
			var r: Point = new Point();
			r.x = this._11 * pt.x + this._21 * pt.y + this.tx;
			r.y = this._12 * pt.x + this._22 * pt.y + this.ty;
			return r;
		}

		public transform(pt: Number2) {
			var x = this._11 * pt[0] + this._21 * pt[1] + this.tx;
			pt[1] = this._12 * pt[0] + this._22 * pt[1] + this.ty;
			pt[0] = x;
		}

		public static multiply(m1: Matrix, m2: Matrix): Matrix {
			return new Matrix(
				m1._11 * m2._11 + m1._12 * m2._21,
				m1._11 * m2._12 + m1._12 * m2._22,
				m1._21 * m2._11 + m1._22 * m2._21,
				m1._21 * m2._12 + m1._22 * m2._22,
				m1.tx * m2._11 + m1.ty * m2._21 + m2.tx,
				m1.tx * m2._12 + m1.ty * m2._22 + m2.ty);
		}
	}

	/**
	* 渐变填充信息
	*/
	export interface GradientFill {
		x0?: number;
		y0?: number;
		x1?: number;
		y1?: number;
		colors: Array<string>;
	}

	/**
	* 文本描边信息
	*/
	export interface StrokeStyle {
		width: number;
		color: string;
	}

	/**
	* 播放状态
	*/
	export const enum MediaState {
		Stop = 0,
		Play = 1,
		Pause = 2
	}

	/**
	* 对齐模式
	*/
	export enum AlignMode {
		Left = 0,
		Center = 1,
		Right = 2,
		Top = 0,
		VCenter = 4,
		Bottom = 8
	};

	/** 
	* 文本文本布局方式
	*/
	export enum TextFormat {
		SingleLine = 0,
		/** 
		* 按词来换行
		*/
		WordBreak = 1,
		/** 
		* 多行
		*/
		MultiLine = 2,
		/** 
		* 超出范围的文字用...代替
		*/
		Ellipse = 4,
		/**
		* 宽度超出范围时缩小显示
		*/
		Shrink = 8,
		/**
		* 富文本格式
		* 支持<color #fff></color> <font 22px></font> <stroke 2 #fff></stroke> <br>
		*/
		RichText = 16
	}

	/** 
	* 混合模式
	*/
	export enum BlendMode {
		Normal = 0,
		Add = 1,
		Copy = 2,
		Subtract = 3,
		Multiply = 4,
		Screen = 5
	}
	/**
	* 触摸事件数据
	*/
	export interface TouchData {
		/**
		* 触摸点的id
		*/
		id: number;
		/**
		* 屏幕坐标，可以使用screenToClient转换为UI元素的局部坐标
		*/
		screenX: number;
		screenY: number;
		/**
		* 是否向上冒泡，默认为：true
		*/
		bubble: boolean;
		/**
		* 事件发起时间
		*/
		time: number;
		/**
		* 捕获该点事件，使得后续事件不管是否在该控件内都向该控件发送
		*/
		capture();
		/**
		* 取消控件对该触摸点的捕获
		*/
		excludeCapture();
	}	
}
