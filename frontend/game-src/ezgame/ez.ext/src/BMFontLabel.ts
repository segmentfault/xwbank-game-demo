namespace ez {
	export interface BMFontCharInfo {
		rect: Rect;
		xOff: number;
		yOff: number;
		advance: number;
	}

	export interface BMFontDesc {
        src: string;
		size: number;
        lineHeight: number;
        baseline: number;
        chars: number[][];
		name?: string;
		dict?: Dictionary<BMFontCharInfo>;
    }

    export interface BMFontTextMetricLine {
        width: number;
        height: number;
        text: string;
        newLine: boolean;
    }

	var BMFontPool: Dictionary<BMFontDesc> = {};
	
	export function registerBMFont(name: string, desc: BMFontDesc) {
		desc.name = name;
		if (!desc.dict) {
			desc.dict = {};
			var res = getRes<Texture>(desc.src);
			if (!res)
				throw new Error("not find BMFont src " + desc.src);
			var offset = res.getData().subRect;
			for (var i in desc.chars) {
				var c = desc.chars[i];
				var s = String.fromCharCode(c[0]);
				var region = new Rect(c[1], c[2], c[3], c[4]);
				if (offset) {
					region.left += offset.left;
					region.top += offset.top;
				}
				desc.dict[s] = { rect: region, xOff: c[5], yOff: c[6], advance: c[7] };
			}
		}
		BMFontPool[name] = desc;
	}

	export class BMTextMetric extends TextMetric {
		_fnt: BMFontDesc;

		public constructor(font: string) {
			super(null);
			this._font = font;
			this._fnt = BMFontPool[font];
			if (!this._fnt)
				throw new Error("not found BMFont: " + font);
			this.lineHeight = this._fnt.lineHeight;
		}

		textWidth(text: string) {
			var w = 0;
			var dict = this._fnt.dict;
			for (var i = 0; i < text.length; i++) {
				var ch = dict[text.charAt(i)];
				if (ch)
					w += ch.advance;
			}
			return w;
		}

		measureLine(text: string, maxWidth: number, wordBreak: boolean): Array<TextMetricLine> {
			if (text.length == 0)
				return [];
			var lines = [];
			var idx = 0;
			var w1 = 0;
			var ch;
			var dict = this._fnt.dict;
			if (wordBreak) {
				var s1: string;
				while (true) {
					var end = TextMetric.GetNextWordBreak(text, idx);
					var str = text.substring(0, end);
					var w = this.textWidth(str);
					if (w >= maxWidth) {
						if (w1 > 0) {
							lines.push({ text: s1, width: w1, newline: false });
							text = text.substring(idx);
							idx = 0;
							w1 = 0;
						}
						else {
							w = 0;
							ch = dict[text.charAt(0)];
							if (ch)
								w += ch.advance;
							for (var i = 1; i < end; i++) {
								ch = dict[text.charAt(i)];
								if (ch && w + ch.advance > maxWidth) {
									lines.push({ text: text.substring(0, i), width: w, newline: false });
									text = text.substring(i);
									idx = 0;
									w1 = 0;
									break;
								}
							}
						}
					}
					else {
						idx = end;
						w1 = w;
						s1 = str;
					}
				}
			}
			else {
				var w = 0;
				for (var i = 0; i < text.length; i++) {
					ch = dict[text.charAt(i)];
					if (ch)
						w += ch.advance;
					if (w > maxWidth) {
						var n = i - idx;
						if (n == 0)
							n = 1;
						else
							w -= ch.advance;
						lines.push({ text: text.substring(idx, idx + n), width: w, newline: false });
						idx = i - n;
						w = 0;
					}
				}
				if (idx < text.length)
					lines.push({ text: text.substring(idx, text.length), width: w, newline: true });
			}

			return lines;
		}
		public measureText(text: any, width: number, height: number, format: TextFormat) {
			if (text == null)
				text = "";
			if (typeof text !== "string")
				text = text.toString();
			if (text == "") {
				this.maxWidth = 0;
				this.lines = [];
				return;
			}
			this.lines = [];
			this.maxWidth = width;
			text = text.replace("\r\n", "\n");
			var lines = text.split("\n");
			var wordBreak = !!(format & TextFormat.WordBreak);
			var ellipse = false;
			var maxLine = Math.max(1, (height / this.lineHeight) | 0);

			if (format & TextFormat.MultiLine) {
				for (var i = 0; i < lines.length; i++) {
					var l = this.measureLine(lines[i], width, wordBreak);
					if (this.lines.length + l.length > maxLine) {
						this.lines = this.lines.concat(l.slice(0, maxLine - this.lines.length));
						break;
					}
					this.lines = this.lines.concat(l);
				}
				this.maxWidth = this.lines.reduce<number>((prev, line) => { return Math.max(prev, line.width) }, 0);
			}
			else {
				var k = this.measureLine(lines[0], width, false)[0];
				if (k.text.length < lines[0].length) {
					if (k.text.length > 1)
						k.text = k.text.substring(0, k.text.length - 1);
					k.text += "...";
					k.width = this.textWidth(k.text);
				}
				this.lines.push(k);
				this.maxWidth = k.width;
			}
		}
	}

	/**
	 * 图片文本对象
	 */
	export class BMFontLabelSprite extends LabelSprite {

		public static Type = "BMFontLabel";
		public getType(): string {
			return BMFontLabelSprite.Type;
		}

		private _texture: Texture;
		private _res: ImageRes;
		private _fnt: BMFontDesc;

        _dispose() {
            this._res = null;
            this._texture = null;
            super._dispose();
		}
		public get textMetric(): TextMetric {
			if (!this._textMetric) {
				this._textMetric = new BMTextMetric(this._font);
				var w = this.width || 500;
				var h = this.height || this._fnt.lineHeight;
				if (this._margin) {
					w -= this._margin[0] + this._margin[2];
					h -= this._margin[1] + this._margin[3];
				}
				this._textMetric.measureText(this._text, w, h, this._format);
				if (this._lineHeight)
					this._textMetric.lineHeight = this._lineHeight;
			}
			return this._textMetric;
		}

        public constructor(parent: Stage, id?:string) {
            super(parent, id);
        }

		public set lineHeight(val: number) {
			if (val == this._lineHeight)
				return;
			this._lineHeight = val;
			if (!this._textMetric)
				return;
			this._textMetric.lineHeight = val || this._fnt.lineHeight;
			this.setDirty();
		}

		public get font(): string {
			return this._font;
		}
		public set font(val: string) {
			if (val == this._font)
				return;
			this._font = val;
			this._fnt = BMFontPool[val];
			if (!this._fnt)
				throw new Error("BMFont " + val + " is not found!");
			this._textMetric = null;
			var res = getRes<Texture>(this._fnt.src);
			if (!res)
				throw new Error("BMFont src " + val + " is not found!");
			this._res = res;
			function onImgReady() {
				var ctx = this.ctx;
				if (ctx._res != this.data)
					return;
				ctx._texture = ctx._res.getData();
				ctx.setDirty();
			}
			if (res.state == ResState.Loading || res.state == ResState.Unload)
				res.load(onImgReady, { ctx: this, data: res });
			else
				this._texture = res.getData();

			this.setDirty();
		}

		protected _draw(rc: IRenderContext, opacity: number): boolean {
			if (this.text == "")
				return;
			if (!this._texture)
				return;
			opacity *= this.opacity;
			if(opacity < 0.01)
				return;
			if(useWGL)
				this.applyEffect(rc);
			var transform = ezasm.getglobalTrans(this._handle);
			if (this._bkColor) {
				rc.setFillColor(this._bkColor);
				rc.fillRect(this.width, this.height, ezasm.getglobalTrans(this._handle));
			}
			var textMetric = this.textMetric;
			var s = textMetric.lineHeight;
			var w = this.width || textMetric.maxWidth;
			var h = this.height || s * textMetric.lines.length;
			var x = this._margin ? this._margin[0] : 0;
			var y = this._margin ? this._margin[1] : 0;
			if (this._margin) {
				w -= this._margin[0] + this._margin[2];
				h -= this._margin[1] + this._margin[3];
			}
			var a = this._align;
			var lines = textMetric.lines;
			if ((a & AlignMode.VCenter) == AlignMode.VCenter)
				y += (h - lines.length * s) * 0.5;
			else if ((a & AlignMode.Bottom) == AlignMode.Bottom)
				y += h - lines.length * s;

			ezasm.saveTempStack();

			var tex = this._texture;
			var fnt = this._fnt;
			for (var i = 0; i < lines.length; i++) {
				var x0 = x;
				var line = textMetric.lines[i];
				if ((a & AlignMode.Center) == AlignMode.Center)
					x0 += (w - line.width) * 0.5;
				else if ((a & AlignMode.Right) == AlignMode.Right)
					x0 += w - line.width;
				for (var j = 0; j < line.text.length; j++) {
					var ch = fnt.dict[line.text.charAt(j)];
					if (ch) {
						/*var t = wasm.tempStackAlloc(6 * 4);
						var m = wasm.handleToFloatArray(t, 6);
						m[0] = m[3] = 1; m[1] = m[2] = 0; m[4] = x0 + ch.xOff; m[5] = y + ch.yOff;*/
						var t = ezasm.tempAllocMat2x3(1, 0, 0, 1, x0 + ch.xOff, y + ch.yOff);
						ezasm.mat2x3Append(t, transform);
						//t.translate(x0 + ch.xOff, y + ch.yOff).append(this._globalTrans);
						rc.drawImage(tex, t, ch.rect.width, ch.rect.height, ch.rect);
						x0 += ch.advance;
					}
				}
				y += s;
			}
			ezasm.restoreTempStack();
		}
    }

	Sprite.register(BMFontLabelSprite.Type, function (p, id) { return new BMFontLabelSprite(p, id) });
} 

namespace ez.ui {
	/** 
	* 图片文本元素，包装BMFontLabelSprite
	*/
	export class BMFontLabel extends Visual {
		static ClassName = "BMFontLabel";
		static instance: BMFontLabel;
		static Properties: PropDefine[] = [
			{ name: "text", default: "", type: "string" },
			{ name: "font", type: "string" },
			{ name: "format", type: "TextFormat", converter: parse.getEnumParser(TextFormat) },
			{ name: "lineHeight", type: "number", converter: parse.Int },
			{ name: "align", type: "AlignMode", converter: parse.getEnumParser(AlignMode) },
			{ name: "margin", type: "Number4", converter: parse.Number4 },
		];

		constructor(parent: Container) {
			super(parent, new BMFontLabelSprite((<any>parent)._displayStage));
			this._init(BMFontLabel);
			//this._initProperties(BMFontLabel.Properties);

			this.bind("text", this._sprite);
			this.bind("font", this._sprite);
			this.bind("format", this._sprite);
			this.bind("lineHeight", this._sprite);
			this.bind("align", this._sprite);
			this.bind("margin", this._sprite);
		}
		public measureBound(width: number, height: number, force?: boolean) {
			if (!force && this._bound)
				return;
			var t = (<BMFontLabelSprite>this._sprite).textMetric;
			super.measureBound(width || t.maxWidth, height || (t ? t.lineHeight * t.lines.length : 0), force);
		}
		/** 获取sprite对象 */
		public sprite: BMFontLabelSprite;
		public text: string;
		public font: string;
		public format: TextFormat;
		public lineHeight: number;
		public align: AlignMode;
		public margin: Number4;
	}
	initUIClass(BMFontLabel, Visual);
}