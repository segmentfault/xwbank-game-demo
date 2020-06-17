/// <reference path="Sprite.ts"/>
/// <reference path="TextMetric.ts"/>
/**
 * @module Visual
*/
namespace ez {
	var fontPools;
	export function scanFontText() {
		fontPools = {};
	}
	export function outputFontText() {
		for(var k in fontPools) {
			console.log(k + ": " + fontPools[k]);
		}
	}
	function updateFontPool(font:string, text:string) {
		if(!DEBUG)
			return;
		font = font.trim();
		font = font.substring(font.indexOf("px") + 2);
		font.trim();
		if(!fontPools[font]) {
			fontPools[font] = "OUT";
		}
		if(fontPools[font].indexOf(text) < 0)
			fontPools[font] = fontPools[font] + text;
	}

	var textCanvas: HTMLCanvasElement;

	initCall(function () {
		textCanvas = internal.createCanvas();
		textCanvas.width = 240;
		textCanvas.height = 80;
		var ctx = textCanvas.getContext("2d");
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		(<any>ctx).imageSmoothingEnabled = true;
		(<any>ctx).imageSmoothingQuality = "high";
	});

	function formatStroke(stroke) {
		return stroke ? stroke.color + stroke.width : null;
	}
	function formatGrad(grad) {
		return "" + (grad.x0 || "0") + 
			(grad.y0 || "0") + 
			(grad.x1 || "0") + 
			(grad.y1 || "0") + grad.colors.join();
	}
	const SCALE_FACTOR = 64;

	/**
	 * 文本对象
	 */
	export class LabelSprite extends Sprite {
		protected _font: string;
		protected _format: TextFormat = TextFormat.Ellipse;//TextFormat.WordBreak | TextFormat.Ellipse;
		protected _bkColor: string;
		protected _text: string = "";
		protected _strokeColor: string = "#000000";
		protected _gradient: GradientFill;
		protected _strokeWidth: number = 0;
		protected _lineHeight: number = 0;
		protected _textMetric: TextMetric;
		protected _margin: Number4 = null;
		protected _align: AlignMode = AlignMode.Left | AlignMode.Top;
		private _lastTextScale;
		private _caches: FontCache.TextCacheObject[];

		public static Type = "Label";
		public getType(): string {
			return LabelSprite.Type;
		}
		protected _prepare(bound: Rect, transfrom: Handle, transChanged: boolean) {
			super._prepare(bound, transfrom, transChanged);
			if(!useWGL || this.text == "")
				return;
			var textScale = Math.max(1, (RenderContext.scale * SCALE_FACTOR) | 0);
			var invTScale;
			if(textScale != SCALE_FACTOR)
				invTScale = SCALE_FACTOR / textScale;
			if(this._lastTextScale != textScale) {
				this._lastTextScale = textScale;
				this._caches = null;
			}
			var scaleStr = this._lastTextScale.toString();
			textScale = this._lastTextScale / SCALE_FACTOR;
			var textMetric = this.textMetric;
			var lineHeight = TextMetric.getFontHeight(textMetric.font);
			var padding = this._strokeWidth | 0;
			if(!this._caches) {
				if(!textMetric.maxWidth)
					return;
				this._caches = [];
				if(padding > 0)
					padding += 1;
				var w = Math.min(FontCache.Width, textMetric.maxWidth + padding * 2 + 2);
				var h = Math.min(FontCache.Height, 2 + (lineHeight + padding * 2) | 0);
				var iw = (w * textScale + 0.5) | 0;
				var ih = (h * textScale + 0.5) | 0;
				if(textCanvas.width < iw)
					textCanvas.width = iw;
				if(textCanvas.height < ih)
					textCanvas.height = ih;
				var ctx = textCanvas.getContext("2d");
				ctx.textAlign = "left";
				ctx.textBaseline = "middle";
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				if(textScale != 1)
					ctx.scale(textScale, textScale);

				if(DEBUG && fontPools) {
					updateFontPool(textMetric.font, this.text);
				}

				if(this.format & TextFormat.RichText) {
					for(let i = 0; i < textMetric.richLines.length; i++) {
						let line = textMetric.richLines[i];
						for(let j = 0; j < line.length; j++) {
							let item = line[j];
							if(item.width <= 0) {
								item.cache = null;
							}
							else {
								var c = FontCache.getTextCacheOrKey(item.font, item.color,
									formatStroke(item.stroke), scaleStr, item.text);
								if(typeof c === "string") {
									let offX = 0;
									let offY = ((lineHeight + 1) * 0.5) | 0;
									let width = item.width + padding * 2 + 1;
									let w1 = width;
									let h1 = h;
									ctx.font = item.font;
									ctx.fillStyle = item.color;
									if(item.stroke) {
										offX = item.stroke.width;
										offY += item.stroke.width;
										w1 += item.stroke.width * 2 + 1;
										h1 += item.stroke.width * 2 + 1;
										ctx.strokeStyle = item.stroke.color;
										ctx.lineWidth = item.stroke.width;
									}
									ctx.clearRect(0, 0, w1 + 1, h1);
									if(item.stroke)
										ctx.strokeText(item.text, offX, offY + 1, item.width + offX * 2 + 2);
									ctx.fillText(item.text, offX, offY + 1, item.width + offX * 2 + 2);
									if(textScale != 1) {
										var w2 = (w1 * textScale + 0.5) | 0;
										var h2 = (h1 * textScale + 0.5) | 0;
										var img = ctx.getImageData(0, 0, w2, h2);
										var cache = { img: img, w: w2 * invTScale, h: h2 * invTScale, region: null, text: item.text };
									}
									else {
										img = ctx.getImageData(0, 0, w1, h1);
										cache = { img: img, w: w1, h: h1, region: null, text: item.text };
									}
									FontCache.setTextCache(c, cache);
									c = cache;
								}
								item.cache = c;
								this._caches.push(c);
								FontCache.addTextCache(c);
							}
						}
					}
				}
				else {
					var fill = this._gradient ? formatGrad(this._gradient) : this._color;
					var stroke = this._strokeWidth > 0 ? this._strokeColor + this._strokeWidth : "";

					if(this._gradient) {
						let g = this._gradient;
						let grad = ctx.createLinearGradient(g.x0 || 0, g.y0 || 0, g.x1 || 0, g.y1 || 0);
						for(let i = 0; i < g.colors.length; i++)
							grad.addColorStop(i / (g.colors.length - 1), g.colors[i]);
						ctx.fillStyle = grad;
					}
					else
						ctx.fillStyle = this._color;
					ctx.font = textMetric.font;
					if(this._strokeWidth > 0) {
						ctx.strokeStyle = this._strokeColor;
						ctx.lineWidth = this._strokeWidth;
					}
					var y = (((lineHeight + 1) * 0.5) | 0) + padding + 1;
					for(var i = 0; i < textMetric.lines.length; i++) {						
						var l = textMetric.lines[i];
						if(l.width <= 0) {
							this._caches.push(null);
							continue;
						}
						var c = FontCache.getTextCacheOrKey(textMetric.font, fill, stroke, scaleStr, l.text);
						if(typeof c === "string") {
							ctx.clearRect(0, 0, w + 1, h);
							if(padding > 0)
								ctx.strokeText(l.text, padding, y, w + padding * 2 + 2);
							ctx.fillText(l.text, padding, y, w + padding * 2 + 2);
							var width = l.width + padding * 2 + 2;
							if(textScale != 1) {
								var w1 = (width * textScale + 0.5) | 0;
								var h1 = (h * textScale + 0.5) | 0;
								var img = ctx.getImageData(0, 0, w1, h1);
								var cache = { img: img, w: w1 * invTScale, h: h1 * invTScale, region: null, text: l.text };
							}
							else {
								img = ctx.getImageData(0, 0, width, h);
								cache = { img: img, w: width, h: h, region: null, text: l.text };
							}
							FontCache.setTextCache(c, cache);
							c = cache;
						}
						this._caches.push(<FontCache.TextCacheObject>c);
						FontCache.addTextCache(<FontCache.TextCacheObject>c);
					}
				}
				ctx = null;
			}
			else {
				for(var i = 0; i < this._caches.length; i++)
					if(this._caches[i])
						FontCache.addTextCache(this._caches[i]);
			}
		}

		private clearCache() {
			this.setDirty();
			if(this._caches)
				this._caches = null;
		}
		private clear() {
			this._textMetric = null;
			this.setDirty();
			if(this._caches)
				this._caches = null;
		}

		dispose() {
			super.dispose();
			this.clear();
		}
		public constructor(parent: Stage, id?:string) {
			super(parent, id);
			this._color = "#ffffff";
		}
		/**
		 * 文本测量结果
		 */ 
		public get textMetric(): TextMetric {
			if (!this._textMetric) {
				var w = this.width || 1024;
				var h = this.height || TextMetric.getFontHeight(this.font);
				if (this._margin) {
					w -= this._margin[0] + this._margin[2];
					h -= this._margin[1] + this._margin[3];
				}
				this._textMetric = new TextMetric(this.font);
				if(this._format & TextFormat.RichText)
					this._textMetric.measureRichText(this._text, w, h, this._format, this.color);
				else
					this._textMetric.measureText(this._text, w, h, this._format);
				if (this._lineHeight)
					this._textMetric.lineHeight = this._lineHeight;
			}
			return this._textMetric;
		}
		/**
		 * 文本框宽度
		 */ 
		public get width(): number {
			return ezasm.getwidth(this._handle);
		}
		public set width(val: number) {
			ezasm.setwidth(this._handle, val);
			this.clear();
		}
		/**
		 * 文本框高度
		 */
		public get height(): number {
			return ezasm.getheight(this._handle);
		}
		public set height(val: number) {
			ezasm.setheight(this._handle, val);
			this.clear();
		}
		/**
		* 渐变填充
		*/
		public get gradient(): GradientFill {
			return this._gradient;
		}
		public set gradient(val: GradientFill) {
			this._gradient = val;
			this.clear();
		}
		/**
		 * 字体
		 */
		public get font(): string {
			return this._font || TextMetric.DefaultFont;
		}
		public set font(val: string) {
			if (val == this._font)
				return;
			this._font = val;
			this.clear();
		}
		/**
		 * 文本格式
		 */
		public get format(): TextFormat {
			return this._format;
		}
		public set format(val: TextFormat) {
			if (val == this._format)
				return;
			this._format = val;
			this.clear();
		}
		/**
		 * 文本内容
		 */
		public get text(): string {
			return this._text;
		}
		public set text(val: string) {
			if (val == null)
				val = "";
			else
				val = val.toString();
			if (val == this._text)
				return;
			this._text = val;
			this.clear();
		}
		/**
		 * 描边颜色
		 */
		public get strokeColor(): string {
			return this._strokeColor;
		}
		public set strokeColor(val: string) {
			if (val == this._strokeColor)
				return;
			this._strokeColor = val;
			this.clearCache();
		}
		/**
		 * 描边宽度
		 */
		public get strokeWidth(): number {
			return this._strokeWidth;
		}
		public set strokeWidth(val: number) {
			val = val || 0;
			if (val == this._strokeWidth)
				return;
			this._strokeWidth = val;
			this.clearCache();
		}
		/**
		 * 文本颜色
		 */
		public get color() {
			return this._color;
		}
		public set color(val: string) {
			if(!val)
				val = "#ffffff";
			if(val == this._color)
				return;
			this.setDirty();
			this._color = val;
			this.clearCache();
		}
		/**
		 * 行高
		 */
		public get lineHeight(): number {
			return this._lineHeight;
		}
		public set lineHeight(val: number) {
			if (val == this._lineHeight)
				return;
			this._lineHeight = val;
			if (!this._textMetric)
				return;
			if (val && val > 0)
				this._textMetric.lineHeight = val;
			else
				this._textMetric.lineHeight = TextMetric.getFontHeight(this.font);
			this.setDirty();
		}
		/**
		 * 文本对齐模式
		 */
		public get align(): AlignMode {
			return this._align;
		}
		public set align(val: AlignMode) {
			if (val == this._align)
				return;
			this._align = val;
			this.setDirty();
		}
		/**
		 * 空白边距
		 */
		public get margin(): Number4 {
			return this._margin;
		}
		public set margin(val: Number4) {
			this._margin = val;
			this.clear();
		}
		/**
		 * 背景底色
		 */
		public get bkColor(): string {
			return this._bkColor;
		}
		public set bkColor(val: string) {
			if (val == this._bkColor)
				return;
			this._bkColor = val;
			this.setDirty();
		}

		protected _draw(rc: IRenderContext, opacity: number): boolean {
			//rc.setFillColor(this.color);
			opacity *= this.opacity;
			if(opacity < 0.01)
				return;
			if(useWGL)
				this.applyEffect(rc);
			rc.setAlphaBlend(opacity, this.blendMode);
			var transform = ezasm.getglobalTrans(this._handle);
			if(this._bkColor) {
				rc.setFillColor(this._bkColor);
				rc.fillRect(this.width, this.height, transform);
			}
			if (this.text == "")
				return;
			if(!this._caches)
				return;
			var padding = this._strokeWidth|0;
			var textMetric = this.textMetric;
			var scale = 1;
			//var trans = this._globalTrans;
			if((<any>rc).setZ)
				(<any>rc).setZ(this.zIndex);
			ezasm.saveTempStack();
			
			var w = this.width || textMetric.maxWidth;
			if ((this._format & TextFormat.Shrink) && textMetric.maxWidth > w) {
				scale = w / textMetric.maxWidth;
				w = textMetric.maxWidth;
				var t = ezasm.tempAllocMat2x3(scale, 0, 0, scale, 0, 0);
				ezasm.mat2x3Append(t, transform);
				transform = t;
			}
			var s = textMetric.lineHeight * scale;
			var h = (this.height || s * textMetric.lines.length);
			var x = this._margin ? this._margin[0] : 0;
			var y = this._margin ? this._margin[1] : 0;
			if (this._margin) {
				w -= this._margin[0] + this._margin[2];
				h -= this._margin[1] + this._margin[3];
			}
			if (useWGL) {
				var a = this._align;
				x -= padding;
				y -= padding;
				rc.setFillColor("#ffffff");
				if(this.format & TextFormat.RichText) {
					if((a & AlignMode.VCenter) == AlignMode.VCenter)
						y += (h - (textMetric.richLines.length + 0.4) * s) * 0.5;
					else if((a & AlignMode.Bottom) == AlignMode.Bottom)
						y += h - (textMetric.richLines.length + 0.4) * s;
					for(let i = 0; i < textMetric.richLines.length; i++) {
						let line = textMetric.richLines[i];
						var x0 = x;
						if(line.length == 0) {
							y += s;
							continue;
						}
						var last = line[line.length - 1];
						if((a & AlignMode.Center) == AlignMode.Center)
							x0 += (w - last.x - last.width) * 0.5;
						else if((a & AlignMode.Right) == AlignMode.Right)
							x0 += w - last.width - last.x;
						for(let j = 0; j < line.length; j++) {
							let item = line[j];
							let c = item.cache;
							if(!c)
								continue;
							if(item.underline) {
								var t = ezasm.tempAllocMat2x3(1, 0, 0, 1, x0 + item.x, textMetric.lineHeight + y);
								ezasm.mat2x3Append(t, transform);
								rc.setFillColor(item.color);
								rc.fillRect(item.width, s * 0.0625, t);
							}
							if(item.strike) {
								var t = ezasm.tempAllocMat2x3(1, 0, 0, 1, x0 + item.x, textMetric.lineHeight * 0.5 + y);
								rc.setFillColor(item.color);
								ezasm.mat2x3Append(t, transform);
								rc.fillRect(item.width, s * 0.0625, t);
							}
							let offY = item.stroke ? item.stroke.width : 0;
							(<IRenderContextWGL>rc).drawTextCache(x0 + item.x, y - offY, c, transform);
						}
						y += s;
					}
				}
				else {
					if((a & AlignMode.VCenter) == AlignMode.VCenter)
						y += (h - textMetric.lines.length * s) * 0.5;
					else if((a & AlignMode.Bottom) == AlignMode.Bottom)
						y += h - textMetric.lines.length * s;
					for(var i = 0; i < this._caches.length; i++) {
						var c = this._caches[i];
						if(c) {
							var x0 = x;
							if((a & AlignMode.Center) == AlignMode.Center)
								x0 += (w - textMetric.lines[i].width) * 0.5;
							else if((a & AlignMode.Right) == AlignMode.Right)
								x0 += w - textMetric.lines[i].width;
							(<IRenderContextWGL>rc).drawTextCache(x0, y / scale, c, transform);
						}
						y += s;
					}
				}
			}
			else {
				var stroke: StrokeStyle;
				if (this._strokeWidth > 0 && this._strokeColor)
					stroke = { width: this._strokeWidth, color: this._strokeColor };
				if (this._gradient)
					rc.setFillGradient(this._gradient);
				else
					rc.setFillColor(this._color);
				(<IRenderContextCanvas>rc).drawText(this._textMetric, transform, x, y, w, h, this.align, stroke);
			}
			ezasm.restoreTempStack();
		}		
	}

	Sprite.register(LabelSprite.Type, function (p, id) { return new LabelSprite(p, id) });
}