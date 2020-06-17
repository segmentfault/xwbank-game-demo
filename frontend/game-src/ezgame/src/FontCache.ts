namespace ez {
	
	/** @ignore */
	export module FontCache {
		export var Width = 1024;
		export var Height = 1024;
		export var rev = 1;

		export interface TextCacheObject {
			img: any;
			w: number;
			h: number;
			text: string;
			use?: number;
			r?: number[];
			region?: number[];
			rev?: number;
		}
		interface FontCacheLine {
			x: number;
			y: number;
			h: number;
		}
		var fontLines: FontCacheLine[] = [];
		var textObjs: TextCacheObject[] = [];
		var logFontObjects = false;
		var emptyFontBuf;
		var caches = {};

		function fontHash(hash: string, s: string): string {
			var n1 = 0x12345678;
			var n2 = 0x7654321;
			if(hash) {
				var args = hash.split(".");
				n1 = parseInt(args[0], 16);
				n2 = parseInt(args[0], 16);
			}
			for(var i = 0; i < s.length; i++) {
				var c = s.charCodeAt(i);
				n1 = ((n1 + c) * 1033) & 0x7fffffff;
				n2 = ((n2 + c) * 65789) & 0x7fffffff;
			}
			return n1.toString(16) + "." + n2.toString(16);
		}

		function fontAlloc(w: number, h: number): Number2 {
			if(fontLines.length == 0) {
				fontLines.push({ x: w, y: 0, h: h });
				return [0, 0];
			}
			var idx = -1;
			var minH = Height;
			for(var i = 0; i < fontLines.length; i++) {
				var l = fontLines[i];
				if(l.x + w <= Width) {
					if(l.h == h) {
						l.x += w;
						return [l.x - w, l.y];
					}
					else if(h < l.h && l.h < minH) {
						idx = i;
						minH = l.h;
					}
				}
			}
			l = fontLines[fontLines.length - 1];
			if(l.y + l.h + h < Height) {
				fontLines.push({ x: w, y: l.y + l.h, h: h });
				return [0, l.y + l.h];
			}
			if(idx >= 0) {
				l = fontLines[idx];
				l.x += w;
				return [l.x - w, l.y];
			}
			if(PROFILING)
				Log.debug(`reset the font pool, w:${w} h:${h}`, fontLines);
			return null;
		}

		/** @internal */
		export function getTextCacheOrKey(font: string, fill: string, stroke: string, scale:string, text: string): string | TextCacheObject {
			var key = fontHash("", font);
			key = fontHash(key, fill);
			if(stroke)
				key = fontHash(key, stroke);
			key = fontHash(key, scale);
			key = fontHash(key, text);
			return caches[key] ? caches[key] : key;
		}

		/** @internal */
		export function setTextCache(key: string, cache: TextCacheObject) {
			caches[key] = cache;
		}
		
		export function log() {
			console.log(caches);
		}
		/** @internal */
		export function addTextCache(cache: TextCacheObject) {
			cache.use = 0;
			textObjs.push(cache);
		}
		/** @internal */
		export function updateFontTexture(gl: WebGLRenderingContext, fontTex: RawTexture, profileData?: WGLPerFrameProfiler | CanvasPerFrameProfiler) {
			var su = 1 / Width;
			var sv = 1 / Height;
			var reset = false;
			if(logFontObjects) {
				var area = 0;
				for(var i = 0; i < textObjs.length; i++) {
					var img = textObjs[i].img;
					area += img.width * img.height;
				}
				Log.info(`font objects, area: ${area}`, textObjs);
				logFontObjects = false;
			}
			for(var i = 0; i < textObjs.length; i++) {
				var obj = textObjs[i];
				if (!obj.region || obj.rev != rev) {
					var img = obj.img;
					if(PROFILING && profileData) {
						Profile.addCommand(`alloc text region w:${img.width} h:${img.height} text:${obj.text}`);
					}
					var r = fontAlloc(img.width, img.height);
					if(!r) {
						reset = true;
						break;
					}
					obj.rev = rev;
					obj.r = r;
					var u = r[0];
					var v = r[1];
					obj.region = [u * su, v * sv, img.width * su, img.height * sv];
				}
			}
			if(reset) {
				//Log.debug("reset the font pool", fontLines, fontObjs);
				rev++;
				fontLines = [];
				for(var i = 0; i < textObjs.length; i++) {
					var obj = textObjs[i];
					var img = obj.img;
					var r = fontAlloc(img.width, img.height);
					obj.rev = rev;
					obj.r = r;
					if(r) {
						var u = r[0];
						var v = r[1];
						obj.region = [u * su, v * sv, img.width * su, img.height * sv];
					}
					else {
						obj.region = [0, 0, 0, 0];
						Log.error(`not enough space for text allocator. width:${img.width} height:${img.height}. please set the bigger FontCacheWidth and FontCacheHeight`);
						Log.info(textObjs);
					}
				}
			}
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, fontTex.glTex);
			if(reset) {
				var t = 8;
				var h = Height / t;
				if(!emptyFontBuf)
					emptyFontBuf = new Uint8Array(Width * h * 4);
				for(var i = 0; i < t; i++)
					gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, i * h, Width, h, gl.RGBA, gl.UNSIGNED_BYTE, emptyFontBuf);
			}
			gl.pixelStorei(GL.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
			for(var i = 0; i < textObjs.length; i++) {
				var obj = textObjs[i];
				if (obj.r) {
					if (PLATFORM == Platform.WeiXin) {
						let img: ImageData = obj.img;
						let buf = new Uint8Array(img.data.length);
						buf.set(img.data);
						gl.texSubImage2D(gl.TEXTURE_2D, 0, obj.r[0], obj.r[1], img.width, img.height, gl.RGBA, gl.UNSIGNED_BYTE, buf);
					}
					else
						gl.texSubImage2D(gl.TEXTURE_2D, 0, obj.r[0], obj.r[1], gl.RGBA, gl.UNSIGNED_BYTE, obj.img);
				}
				obj.r = null;
			}
			textObjs = [];
			for(var k in caches) {
				var use = caches[k].use--;
				if(use < -1000)
					delete caches[k];
			}
		}
	}
}