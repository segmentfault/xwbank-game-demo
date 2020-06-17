/**
 * @module Text
*/
namespace ez {
	/** 
	* 载入字体文件
    * @name 字体名
    * @url 字体文件地址(html模式下需要准备.eot .woff .ttf三种格式的字体文件，weixin平台则只需要.ttf)
	*/
	export function loadFont(name: string, url: string, fontweight = "normal", fontstyle = "normal") {
		if(PLATFORM == Platform.WeiXin) {
			fonts[name] = wx.loadFont(url + ".ttf");
			Log.info(`load font ${name}. alias: ${fonts[name]}`);
			if(fonts[name] == null)
				fonts[name] = "Arial";
		}
		else {
			var style = document.createElement("style");
			style.appendChild(document.createTextNode(
				`@font-face {
	font-family: '${name}';
	src: url('${url}.eot');
	src: url('${url}.woff') format('woff'), url('${url}.ttf') format('truetype');
	font-weight: ${fontweight};
    font-style: ${fontstyle};
}`));
			document.head.appendChild(style);
			var ctx = TextMetric._ctx;
			ctx.font = `10px ${name}`;
			ctx.fillText("a1", 0, 0, 10);
		}
	}
	/**
	* 文本测量行
	*/
	export interface TextMetricLine {
		width: number;
		text: string;
		newLine?: boolean;
	}
	/**
	* 富文本测量行
	*/
	export interface RichTextMetricLine extends TextMetricLine {
		x: number;
		color: string;
		font: string;
		underline?: boolean;
		strike?: boolean;
		href?: string;
		stroke?: { width: number, color: string };
		cache?: any;
	}

	/**
	* 文本布局测量对象
	*/
	export class TextMetric {
		/**
		* 文本行数据
		*/
		public lines: TextMetricLine[];
		/**
		* 富文本行数据
		*/
		public richLines: RichTextMetricLine[][];
		/**
		* 最大文本宽度
		*/
		public maxWidth: number;
		/**
		* 文本行高
		*/
		public lineHeight: number;

		protected _font: string;

		static EndBreak = {};
		static _ctx: CanvasRenderingContext2D;
		static DefaultFont = "24px Arial, Helvetica, sans-serif";

		static isFullWidth(ch: number): boolean {
			if(ch < 0x0080)
				return false;
			return (ch >= 0x4E00 && ch <= 0x9FFF || ch >= 0x3040 && ch <= 0x309F || ch >= 0x30A0 && ch <= 0x30FF || ch >= 0xAC00 && ch <= 0xD7A3);
		}

		static GetNextWordBreak(str: string, index: number): number {
			var i = index;
			var nonWhite = true;
			while(i < str.length) {
				var ch = str.charCodeAt(i);
				if(ch == 9 || ch == 0x20)
					return i + (nonWhite ? 1 : 0);
				if(TextMetric.isFullWidth(ch)) {
					if(!nonWhite)
						return i;
					if(i < str.length - 1 && TextMetric.EndBreak[str.charAt(i + 1)])
						return i + 2;
					return i + 1;
				}
				i++;
				nonWhite = false;
			}
			return i;
		}

		static textWidthLowerBound(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): number {
			var n1 = 0;
			var n2 = text.length;
			var n = (n2 + n1 + 1) >> 1;
			while(true) {
				var w = ctx.measureText(text.substring(0, n)).width;
				if(w == maxWidth)
					return n;
				else if(w < maxWidth)
					n1 = n;
				else
					n2 = n;
				if(n2 - n1 <= 1)
					return n1;
				n = (n2 + n1 + 1) >> 1;
			}
		}

		static measureLine(ctx: CanvasRenderingContext2D, text: string, x: number, maxWidth: number, wordBreak: boolean, single: boolean): Array<TextMetricLine> {
			if(text.length == 0)
				return [];
			var lines = [];
			if(wordBreak) {
				var idx = 0;
				var w1 = 0;
				var s1: string;
				while(true) {
					if(idx == 0) {
						var width = ctx.measureText(text).width;
						if(width <= maxWidth - x) {
							lines.push({ text: text, width: width });
							return lines;
						}
					}
					var end = TextMetric.GetNextWordBreak(text, idx);
					var str = text.substring(0, end);
					var w = ctx.measureText(str).width;
					if(w1 > 0 && w >= maxWidth - x) {
						lines.push({ text: s1, width: w1 });
						text = text.substring(idx);
						x = 0;
						idx = 0;
						w1 = 0;
					}
					else if(w1 == 0 && w >= maxWidth - x) {
						var i = TextMetric.textWidthLowerBound(ctx, str, maxWidth - x);// || 1;
						if(x == 0 && i == 0)
							i = 1;
						if(i > 0) {
							str = str.substring(0, i);
							lines.push({ text: str, width: ctx.measureText(str).width });
							text = text.substring(i);
							x = 0;
							idx = 0;
							w1 = 0;
						}
						else {
							lines.push({ text: "", width: 0 });
							idx = 0;
							x = 0;
						}
					}
					else {
						idx = end;
						w1 = w;
						s1 = str;
					}
					if(single && lines.length > 0)
						return lines;
				}
			}
			else {
				while(true) {
					var w = ctx.measureText(text).width;
					if(w < maxWidth - x) {
						lines.push({ text: text, width: w, newline: true });
						return lines;
					}
					var str = text;
					if(w > (maxWidth - x) * 2)
						str = text.substring(0, ((text.length * (maxWidth - x) * 2 / w) | 0) || 1);
					var idx = TextMetric.textWidthLowerBound(ctx, str, (maxWidth - x));
					if(x == 0 && idx == 0)
						idx = 1;
					if(idx > 0) {
						str = str.substring(0, idx);
						lines.push({ text: str, width: ctx.measureText(str).width });
						x = 0;
					}
					else {
						lines.push({ text: "", width: 0 });
						x = 0;
					}
					if(single && lines.length > 0)
						return lines;
					text = text.substring(idx);
				}
			}
		}


		/**
		* 富文本测量，支持的标签: 
	    *	<color=#颜色值></color>
	    *	<font=字体></font>
	    *	<stroke=描边宽度 #描边颜色></stroke>
	    *	<u>下划线</u>
	    *	<s>删除线</s>
	    *	<a href=链接>超链接</a>
		* @example <color=#ffffff>t1 <font=32px>t2<stroke=2 #00>t3</color>
	    */
		public measureRichText(text: any, width: number, height: number, format: TextFormat, color: string) {
			if(text == null)
				text = "";
			if(typeof text !== "string")
				text = text.toString();
			if(text === "") {
				this.maxWidth = 0;
				this.richLines = [];
				return;
			}
			var maxLine = Math.max(1, (height / this.lineHeight) | 0);
			text = text.replace("\r\n", "\n").replace("\n", "");
			var font = this._font;
			function parseRichText(text: string) {
				var start = 0;
				var i = 0;
				var richTexts = [];
				var colors = [color];
				var fonts = [font];
				var strokes = [];
				var underline = false;
				var strike = false;
				var href = null;
				function texseg(t) {
					var s = <any>{ color: colors[colors.length - 1], font: fonts[fonts.length - 1], stroke: stroke, text: t };
					if(underline)
						s.underline = true;
					if(strike)
						s.strike = true;
					if(href)
						s.href = href;
					return s;
				}
				while(true) {
					var tagBegin = text.indexOf("<", start);
					var stroke = strokes[strokes.length - 1];
					if(tagBegin < 0) {
						if(start < text.length)
							richTexts.push(texseg(text.substring(start)));
						break;
					}
					var tagEnd = text.indexOf(">", tagBegin + 1);
					if(tagEnd < 0) {
						if(start < text.length)
							richTexts.push(texseg(text.substring(start)));
						break;
					}
					if(tagBegin > start) {
						richTexts.push(texseg(text.substring(start, tagBegin)));
					}
					start = tagEnd + 1;
					var tag = text.substring(tagBegin + 1, tagEnd);
					if(tag === "/color" && colors.length > 1)
						colors.pop();
					else if(tag === "/font" && fonts.length > 1)
						fonts.pop();
					else if(tag === "/stroke")
						strokes.pop();
					else if(tag === "/a")
						href = null;
					else if(tag === "/u")
						underline = false;
					else if(tag === "/s")
						strike = false;
					else {
						if(tag === "br")
							richTexts.push(0);
						else if(tag === "u")
							underline = true;
						else if(tag === "s")
							strike = true;
						else if(tag.substr(0,2) == "a ") {
							let idx = tag.indexOf("=");
							if(idx > 0)
								href = tag.substr(idx + 1).trim();
						}
						else {
							let idx = tag.indexOf("=");
							if(idx > 0) {
								switch(tag.substr(0, idx)) {
									case "color":
										colors.push(tag.substr(idx + 1).trim());
										break;
									case "font":
										fonts.push(tag.substr(idx + 1));
										break;
									case "stroke":
										var s = tag.substring(idx + 1).trim().split(" ");
										strokes.push({ width: parseInt(s[0]), color: s[1] });
										break;
								}
							}
						}
					}
				}
				return richTexts;
			}

			var richText = parseRichText(text);
			var wordBreak = (format & TextFormat.WordBreak) != 0;
			var ellipse = !!(format & TextFormat.Ellipse);

			if(format & TextFormat.MultiLine) {
				this.richLines = [[]];
				var x = 0;
				var currLine = this.richLines[0];
				this.maxWidth = 0;
				for(let i = 0; i < richText.length; i++) {
					var t = richText[i];
					if(t === 0) {
						x = 0;
						currLine = [];
						this.richLines.push(currLine);
					}
					else {
						TextMetric._ctx.font = t.font;
						var l = TextMetric.measureLine(TextMetric._ctx, t.text, x, width, wordBreak, false);
						var end = false;
						if(this.richLines.length + l.length - 1 > maxLine) {
							l = l.splice(maxLine - this.richLines.length, l.length - maxLine + this.richLines.length);
							//var lines = this.lines.concat(l.slice(0, maxLine - this.richLines.length));
							if(ellipse) {
								let last = l[l.length - 1];
								if(last.text.length > 1)
									last.text = last.text.substring(0, last.text.length - 1);
								last.text += "...";
								last.width = TextMetric._ctx.measureText(last.text).width;
							}
							end = true;
						}
						for(let j = 0; j < l.length; j++) {
							if(j > 0) {
								currLine = [];
								this.richLines.push(currLine);
								x = 0;
							}
							var k = l[j];
							this.maxWidth = Math.max(this.maxWidth, k.width + x);
							var item = { width: k.width, text: "", x: x, color: color, font: this._font };
							for(var key in t)
								item[key] = t[key];
							item.text = k.text;
							currLine.push(item);
							x += k.width;
						}
						if(end)
							break;
					}
				}
			}
			else {
				var x = 0;
				this.richLines = [[]];
				for(let i = 0; i < richText.length; i++) {
					var t = richText[i];
					if(t === 0) {
						break;
					}
					else {
						TextMetric._ctx.font = t.font;
						var k = TextMetric.measureLine(TextMetric._ctx, t.text, x, width, false, true)[0];
						var end = false;
						if(k.text.length < t.text.length && ellipse) {
							if(k.text.length > 1)
								k.text = k.text.substring(0, k.text.length - 1);
							k.text += "...";
							k.width = TextMetric._ctx.measureText(k.text).width;
							end = true;
						}
						var item = { width: k.width, text: "", x: x, color: color, font: this._font };
						for(var key in t)
							item[key] = t[key];
						item.text = k.text;
						this.richLines[0].push(item);
						x += k.width;
						if(end)
							break;
					}
				}
				let last = this.richLines[0][this.richLines[0].length - 1];
				this.maxWidth = last.x + last.width;
			}
		}
		/**
		* 文本测量
	    * @param text 文本
	    * @param width 文本框宽度
	    * @param height 文本框高度
	    * @param format 格式控制
		*/
		public measureText(text: any, width: number, height: number, format: TextFormat) {
			if(text == null)
				text = "";
			if(typeof text !== "string")
				text = text.toString();
			if(text == "") {
				this.maxWidth = 0;
				this.lines = [];
				return;
			}
			this.lines = [];
			this.maxWidth = width;
			TextMetric._ctx.font = this._font;
			text = text.replace("\r\n", "\n");
			var lines = text.split("\n");
			var wordBreak = (format & TextFormat.WordBreak) != 0;
			var ellipse = !!(format & TextFormat.Ellipse);
			var shrink = !!(format & TextFormat.Shrink);
			var maxLine = Math.max(1, (height / this.lineHeight) | 0);

			if(format & TextFormat.MultiLine) {
				for(var i = 0; i < lines.length; i++) {
					var l = TextMetric.measureLine(TextMetric._ctx, lines[i], 0, width, wordBreak, false);
					if(this.lines.length + l.length > maxLine) {
						this.lines = this.lines.concat(l.slice(0, maxLine - this.lines.length));
						if(ellipse) {
							var last = this.lines[this.lines.length - 1];
							if(last.text.length > 1)
								last.text = last.text.substring(0, last.text.length - 1);
							last.text += "...";
							last.width = TextMetric._ctx.measureText(last.text).width;
						}
						break;
					}
					this.lines = this.lines.concat(l);
				}
				this.maxWidth = this.lines.reduce<number>((prev, line) => { return Math.max(prev, line.width) }, 0);
			}
			else {
				var k = TextMetric.measureLine(TextMetric._ctx, lines[0], 0, shrink ? 10000 : width, false, true)[0];
				if(k.text.length < lines[0].length && ellipse) {
					if(k.text.length > 1)
						k.text = k.text.substring(0, k.text.length - 1);
					k.text += "...";
					k.width = TextMetric._ctx.measureText(k.text).width;
				}
				this.lines.push(k);
				this.maxWidth = k.width;
			}
		}

		public static getFontHeight(font: string) {
			var px = /\d+px/.exec(font);
			if(px && px.length > 0)
				return parseInt(px[0].substring(0, px[0].indexOf("px")));
			else
				return 16;
		}

		public get font() {
			return this._font;
		}

		public constructor(font: string) {
			if(!font)
				font = "16px";
			font = font.trim();
			var idx = font.indexOf("px");
			if(idx == -1) {
				Log.warn("the font size is missing: " + font);
				return;
			}
			if(idx >= font.length - 3) {
				var def = TextMetric.DefaultFont;
				font += def.substring(def.indexOf("px") + 2);
			}
			if (PLATFORM == Platform.WeiXin)
				this._font = fontConv(font);
			else
				this._font = font;
			this.lineHeight = TextMetric.getFontHeight(this._font);
		}
	}

	var fonts = {};

	function fontConv(f) {
		var idx = f.indexOf("px ");
		var font = f.substring(idx + 3);
		if(fonts[font])
			return f.substring(0, idx + 3) + fonts[font];
		else
			return f;
	}

	initCall(function () {
		var a = [711, 713, 8758, 9588, 33, 37, 41, 44, 46, 58, 59, 62, 63, 93, 125, 168, 176, 183, 12289, 12290, 12291, 12293, 12297, 12299, 12301, 12303, 12305, 12309, 12311, 12318, 65072, 65073, 65075, 65076, 65078, 65080, 65082, 65084, 65086, 65088, 65090, 65092, 65103, 65104, 65105, 65106, 65108, 65109, 65110, 65111, 65114, 65116, 65118, 65281, 65282, 65285, 65287, 65289, 65292, 65293, 65294, 65306, 65307, 65310, 65311, 65341, 65372, 65373, 65374, 65377, 65379, 65380, 65438, 65439];
		for(var i = 0; i < a.length; i++)
			TextMetric.EndBreak[String.fromCharCode(a[i])] = true;
		var c = internal.createCanvas();
		c.width = 10;
		c.height = 10;
		TextMetric._ctx = c.getContext("2d");
	});
}