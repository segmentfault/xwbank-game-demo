/// <reference path="Sprite.ts"/>
/**
 * @module Visual
*/
namespace ez {

	function loadHitMask(mask: ArrayBuffer) {
		var data = new Int8Array(mask, 10);
		var info = new Int16Array(mask, 0, 5);
		var sig = info[0] + (info[1] << 16);
		if(sig != 0x4B53414D) {
			Log.error('mask file error.');
			return null;
		}
		var w = info[2];
		var h = info[3];
		var level = info[4];
		var lines:number[][] = [];
		var line = [];
		var last = 0;
		for(var i = 0; i < mask.byteLength - 10; i++) {
			var len = data[i];
			if(len == -128) {
				if(line.length > 0)
					Log.error(`mask data error`);
				var d = data[++i];
				var l = lines[lines.length - d - 1];
				lines.push(l);
				continue;
			}
			if(len == 0) {
				if(last)
					line.push(last);
				lines.push(line.length > 0 ? line : null);
				line = [];
				last = 0;
			}
			else if(last * len < 0) {
				line.push(last);
				last = len;
			}	
			else
				last += len;
		}
		if(lines.length != h)
			Log.error("mask data error");
		Log.debug(`load mask sig=${sig} width=${w} height=${w} level=${level} lines=${lines.length}`);
		return { level: level, data: lines };
	}

	/**
	 * 图像的点击判断模式
	 */
	export const enum HitTestMode {
		BoundingBox,
		Pixel
	}

	/**
	 * 图像对象
	 */
	export class ImageSprite extends Sprite {
		private _pattern: string;
		private _texture: Texture;
		private _data: Texture | ImageRes;
		private _hitMask: { data: number[][], level: number };
		private _clipRect: Rect;
		private _width;
		private _height;

		protected _dispose() {
			this._texture = null;
			this._data = null;
			this._parent = null;
			super._dispose();
		}
		public static Type = "Image";
		public getType(): string {
			return ImageSprite.Type;
		}
		protected _draw(rc: IRenderContext, opacity: number) {
			var tex = this._texture;
			if (!tex || tex.empty)
				return;
			if(!tex.ready) {
				tex.load(this.setDirty.bind(this));
				return;
			}
			rc.setFillColor(this.color);
			opacity *= this.opacity;
			if(opacity < 0.01)
				return;
			if(useWGL)
				this.applyEffect(rc);
			rc.setAlphaBlend(opacity, this.blendMode);
			if((<any>rc).setZ)
				(<any>rc).setZ(this.zIndex);
			var transform = ezasm.getglobalTrans(this._handle);
			if(!transform) {
				Log.error("global transfrom is null", tex.name);
			}
			if(this._pattern)
				rc.drawImageRepeat(tex, transform, this.width, this.height, this._pattern);
			else if (tex.s9)
				rc.drawImageS9(tex, transform, tex.s9, this.width, this.height, tex.subRect);
			else
				rc.drawImage(tex, transform, this.width, this.height, tex.subRect);
		}

		public constructor(stage: Stage, id?: string) {
			super(stage, id);
			this._data = null;
			this._color = "#ffffff";
		}
		private _setWidth(val: number) {
			var h = this._handle;
			if(!h)
				return;
			if(ezasm.setwidth(h, val))
				this.setDirty();
		}
		private _setHeight(val: number) {
			var h = this._handle;
			if(!h)
				return;
			if(ezasm.setheight(h, val))
				this.setDirty();
		} 
		public get width(): number {
			return ezasm.getwidth(this._handle);
		}
		public set width(val: number) {
			this._setWidth(val);
			this._width = val;
		}
		public get height(): number {
			return ezasm.getheight(this._handle);
		}
		public set height(val: number) {
			this._setHeight(val);
			this._height = val;
		}
		/**
		* 图像资源，set时可以是资源名,Texture,ImageRes，get时获得Texture或ImageRes
		*/
		public get src(): string | Texture | ImageRes {
			return this._data;
		}
		public set src(img: string | Texture | ImageRes) {
			if(typeof img === "string")
				img = parse.ImageSrc(<string>img);
			if(this._data == img)
				return;
			this.setDirty();
			this._data = <ImageRes>img;
			this._hitMask = null;
			if(!img) {
				this._texture = null;
				return;
			}
			var imgRes = <ImageRes>img;
			if (imgRes.getData) {
				this._texture = imgRes.getData();
				if (imgRes.hitMask) {
					this._hitMask = imgRes.hitMask;
				}
				else if (imgRes.args.hitMask) {
					let mask = getRes<ArrayBuffer>(imgRes.args.hitMask);
					mask.load(r => {
						if (r)
							this._hitMask = imgRes.hitMask = loadHitMask(mask.getData());
					}, this);
				}
				else
					this._hitMask = null;
			}
			else
				this._texture = <Texture>img;
			if(this._width === undefined)
				this._setWidth(this._texture.width);
			if(this._height === undefined)
				this._setHeight(this._texture.height);
		}
		/**
		* 设置重复填充模式，可选模式："repeat-x","repeat-y", "repeat"
		*/
		public get pattern(): "repeat-x"|"repeat-y"|"repeat" {
			return <any>this._pattern;
		}
		public set pattern(pattern: "repeat-x"|"repeat-y"|"repeat") {
			if(this._pattern == pattern)
				return;
			this._pattern = pattern;
			this.setDirty();
		}
		/**
		* 设置图片剪切，以原图大小为基础剪切部分图片显示，默认为null
		*/
		public get clipRect(): Rect {
			return this._clipRect;
		}
		public set clipRect(r: Rect) {
			this._clipRect = r;
			this.setDirty();
		}
		/**
		 * 判断该点是否在对象上
		 *	当图像资源有hitmask时会以图像的alpha通道进行像素级判定，hitmask需要通过工具预先生成。没有hitmask则以图像矩形区域进行判定
		 * @param x
		 * @param y
		 */
		public hitTest(x: number, y: number): boolean {
			if(!this._texture)
				return false;
			if(x < 0 || y < 0 || x >= this.width || y >= this.height)
				return false;
			if(!this._hitMask)
				return true;
			let t = this._texture;
			x = (x * t.width / this.width) >> this._hitMask.level;
			y = (y * t.height / this.height) >> this._hitMask.level;
			var line = this._hitMask.data[y];

			//Log.debug(x, y, line);
			if(!line)
				return false;
			let idx = 0;
			while(idx < line.length) {
				var l = Math.abs(line[idx]);
				if(x < l)
					return line[idx] > 0;
				else
					x -= l, idx++;
			}
			return false;
		}
	}

	Sprite.register(ImageSprite.Type, function (p, id) { return new ImageSprite(p, id) });
}