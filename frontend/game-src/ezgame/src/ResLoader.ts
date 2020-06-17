/**
 * 资源管理模块
 * @module Resource
*/
namespace ez {
	/**
	* 下载资源类型
	*/
	export const enum DataType {
		Text = 0,
		Binary = 1,
		Image = 2,
		Sound = 3
	}

	/**
	* 资源类型
	*/
	export const enum ResType {
		text = 1,
		json = 2,
		csv = 3,
		image = 4,
		subimage = 5,
		binary = 6,
		sound = 7,
		gltf = 8,
		model = 9,
		empty = 10,
		texture = 11,
		spine = 12,
		ezm = 13
	}
	enum ResTypeTbl {
		text = 1,
		json = 2,
		csv = 3,
		image = 4,
		subimage = 5,
		binary = 6,
		sound = 7,
		gltf = 8,
		model = 9,
		empty = 10,
		texture = 11,
		spine = 12,
		ezm = 13
	}
	/**
	* 资源加载状态
	*/
	export const enum ResState {
		Unload = 1,
		Loading = 2,
		Ready = 3,
		Error = 4
	}

	/**
	* 资源描述信息
	*/
	export interface ResourceData {
		name: string;
		type: string;
		url: string;
		width?: number;
		height?: number;
		region?: string;
		margin?: string;
		parent?: string;
		s9?: string;
		format?: TextureFormat;
		/**
		* 图像是否转置(90°旋转存放)
		*/
		transpose?: boolean;
		/**
		* 图像点击判定mask
		*/
		hitMask?: string;
		/**
		* 压缩纹理类型
		*/
		types?: TextureFormat[];
		cubemap?: string[];
	}

	/**
	* 资源组
	*/
	export interface GroupData {
		name: string;
		keys: string;
	}
	/**
	* 资源包描述
	*/
	export interface PackageData {
		resources: ResourceData[];
		groups: GroupData[];
	}

	/**
	* 资源对象接口
	*/
	export interface Res<T> {
		/**
		* 名字hash后的id值
		*/
		id: string;
		/**
		* 资源名（资源名默认是资源目录下的相对路径加文件名，不带扩展名）,发布版不带资源名称信息
		*/
		name: string;
		/**
		* 载入状态
		*/
		state: ResState;
		/**
		* 资源附加描述信息
		*/
		args: any;
		/**
		* 资源地址
		*/
		url: string;
		/**
		* 资源类型
		*/
		type: ResType;
		width?: number;
		height?: number;
		bin?: ArrayBuffer;
		parentImage?: ImageRes;
		age?: number;
		cors?: boolean;
		hitMask?: { data: number[][], level: number };
		/**
		* 获取资源数据
		*/
		getData(): T;
		/**
		* await异步加载资源
	    * @param priority: 加载优先级，高优先级的将被提前加载
		*/
		loadAsync(priority?: number): Promise<T>;
		/**
		* 加载资源
	    * @param onLoad: 回调函数
	    * @param priority: 加载优先级，高优先级的将被提前加载
		*/
		load(onLoad?: (success: boolean) => void, thisObj?: any, priority?: number);
		/**
		* 释放资源
		*/
		release();
	}

	/**
	* 图像资源对象接口
	*/
	export type ImageRes = Res<Texture>;

	/**
	* 资源代理url地址（用于跨域资源的获取）
	*/
	export var getProxyUrl: Function;
	var tbl = "0123456789ABCDEFGHIJKLMNOPQRSTUVWX";
	var resDict: Dictionary<ResItem> = {};
	var extResDict: Dictionary<ExtResItem> = {};
	//var resRoot = "";

	function nameHash(s: string): string {
		s = s.toLowerCase();
		var n1 = 0x12345678;
		var n2 = 0x7654321;
		for (var i = 0; i < s.length; i++) {
			var c = s.charCodeAt(i);
			n1 = ((n1 + c) * 1033) & 0x7fffffff;
			n2 = ((n2 + c) * 65789) & 0x7fffffff;
		}
		var out = "";
		for (i = 0; i < 6; i++) {
			out += tbl.charAt(n1 & 31) + tbl.charAt(n2 & 31);
			n1 >>= 5;
			n2 >>= 5;
		}
		return out;
	}

	var ImageExt = ".0";
	var ResGroups: Dictionary<string[]> = {};
	var LocalResDict: Dictionary<string>;

	export namespace internal {
		export function setImageExt(ext) {
			ImageExt = ext;
		}
	}

	/**
	 * 检查浏览器对图像格式的支持
	 * @description	在载入资源前需要先检查浏览器支持的图像格式
	 * @return promise
	 */
	export function detectImageExt(): Promise<void> {
		return new Promise(function(resolver) {
			var webP = new Image();
			webP.onload = webP.onerror = function () {
				if (webP.height == 2) {
					Log.info("webp found");
					ImageExt = ".1";
					resolver();
				}
				else {
					var jp2 = new Image();
					jp2.onload = jp2.onerror = function () {
						if (jp2.height == 2) {
							Log.info("jp2 found");
							ImageExt = ".2";
							resolver();
						}
						else {
							var jxr = new Image();
							jxr.onload = jxr.onerror = function () {
								if (jxr.height == 2) {
									Log.info("jxr found");
									ImageExt = ".3";
								}
								else {
									Log.info("png found");
									ImageExt = ".0";
								}
								resolver();
							}
							jxr.src = 'data:image/vnd.ms-photo;base64,SUm8AQgAAAAFAAG8AQAQAAAASgAAAIC8BAABAAAAAQAAAIG8BAABAAAAAgAAAMC8BAABAAAAWgAAAMG8BAABAAAARgAAAAAAAAAkw91vA07+S7GFPXd2jckQV01QSE9UTwAZAMFxAAAAATAAoAAKAACgAAAQgCAIAAAEb/8AAQAAAQDCPwCAAAAAAAAAAAAAAAAAjkI/AIAAAAAAAAABIAA=';
						}
					}
					jp2.src = 'data:image/jp2;base64,/0//UQAyAAAAAAABAAAAAgAAAAAAAAAAAAAABAAAAAQAAAAAAAAAAAAEBwEBBwEBBwEBBwEB/1IADAAAAAEAAAQEAAH/XAAEQED/ZAAlAAFDcmVhdGVkIGJ5IE9wZW5KUEVHIHZlcnNpb24gMi4wLjD/kAAKAAAAAABYAAH/UwAJAQAABAQAAf9dAAUBQED/UwAJAgAABAQAAf9dAAUCQED/UwAJAwAABAQAAf9dAAUDQED/k8+kEAGvz6QQAa/PpBABr994EAk//9k=';
				}
			}
			webP.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoCAAIAAsBMJaQAA3AA/veMAAA=';
		});
	}

	interface DownloadTask {
		do: Function;
		priority: number;
	}

	/**
	* HTTP资源下载接口
	*/
	export class HTTP {
		/**
		* 最大资源并发载入数量
		*/
		public static maxLoadingTask = 4;
		private static pedingTasks: DownloadTask[] = [];
		private static runningTasks = 0;
		private static nextTask() {
			if (HTTP.runningTasks < HTTP.maxLoadingTask && HTTP.pedingTasks.length > 0) {
				HTTP.runningTasks++;
				var task = HTTP.pedingTasks.pop();
				task.do();
				//console.debug("add download task. running:%s pedding:%s", HTTP.runningTasks, HTTP.pedingTasks.length);
			}
		}
		private static taskFinish() {
			HTTP.runningTasks--;
			HTTP.nextTask();
		}
		private static getData(url: string, type: DataType, onFinish: (success: boolean, data?: any) => void, thisObj?: any) {
			if (PLATFORM == Platform.WeiXin) {
				wx.downloadData(url, type == DataType.Text, function(file){
					if (PROFILING && thisObj && thisObj.event)
						thisObj.event.addStep("download");
					HTTP.taskFinish();
					if(file)
						onFinish.call(thisObj, true, file);
					else
						onFinish.call(thisObj, false, { errCode: -1, errMsg: "download failed" });					
				});
			}
			else {
				let req = new XMLHttpRequest();
				req.onreadystatechange = function () {
					if (req.readyState == 4) {
						if (PROFILING && thisObj && thisObj.event)
							thisObj.event.addStep("download");
						HTTP.taskFinish();
						var data = type == DataType.Text ? req.responseText : req.response;
						if(req.status >= 400 || !data) {
							Log.error(`download ${url} failed. errCode: ${req.status} errMsg: ${req.statusText}`);
							onFinish.call(thisObj, false);
						}
						else {
							onFinish.call(thisObj, true, data);
						}
					}
				}
				req.open("GET", url, true);
				if(type == DataType.Binary)
					req.responseType = "arraybuffer";
				req.send();
			}
		}
		static getSound(url: string, onFinish: (success: boolean, data?: any) => void, thisObj?: any) {
			function onAudioLoaded(): void {
				removeListeners();
				onFinish.call(thisObj, true, audio);
			}
			function onAudioError(): void {
				Log.error(`load sound ${url} failed.`);
				removeListeners();
				onFinish.call(thisObj, false);
			}
			function removeListeners(): void {
				audio.removeEventListener("canplaythrough", onAudioLoaded);
				audio.removeEventListener("error", onAudioError);
				clearTimeout(timer);
				HTTP.taskFinish();
			}
			if (PLATFORM == Platform.WeiXin) {
				var c = wx.createInnerAudioContext();
				wx.fetchURL(url, false, function(newURL) {
					if (!newURL){
						HTTP.taskFinish();
						onFinish.call(thisObj, false);
					}
					c.src = newURL;
					HTTP.taskFinish();
					c.onCanplay(function () {
						onFinish.call(thisObj, true, c);
					});
					c.onError(function (r) {
						Log.error(`load sound ${url} failed. error: ${r}`);
						onFinish.call(thisObj, false);
					});
				});
			}
			else if (!WebAudio) {
				var audio = document.createElement('audio');
				if (audio.canPlayType("audio/mpeg")){
					audio.addEventListener("canplaythrough", onAudioLoaded);
					audio.addEventListener("error", onAudioError);
					var src = document.createElement("source");
					src.src = url;
					src.type = "audio/mpeg";
					audio.appendChild(src);
					var timer = setTimeout(onAudioError, 10000);
					audio.load();
				}
			}
			else {
				var xhr = new XMLHttpRequest(); //通过XHR下载音频文件  
				xhr.open('GET', url);
				xhr.responseType = 'arraybuffer';
				xhr.onload = function (e) {
					if (PROFILING && thisObj && thisObj.event)
						thisObj.event.addStep("download");
					if(xhr.response) {
						var t = Date.now();
						Log.debug("begin decode " + url);
						WebAudio.decodeAudioData(xhr.response, buf => {
							if (PROFILING && thisObj && thisObj.event)
								thisObj.event.addStep("mp3 decode");
							Log.debug(`end decode ${url} cost: + ${Date.now() - t}ms`);
							onFinish.call(thisObj, true, buf);
						}, function(){
							if (PROFILING && thisObj && thisObj.event)
								thisObj.event.addStep("decode failed");
							Log.error("decode sound failed.");
							onFinish.call(thisObj, false);
						});
					}
					else {
						Log.error(`download ${url} failed. errCode: ${xhr.status} errMsg: ${xhr.statusText}`);
						onFinish.call(thisObj, false);
					}
					HTTP.taskFinish();
				};
				xhr.send();
			}
		}
		static getImage(url: string, cors: boolean, onFinish: (success: boolean, data?: any) => void, thisObj?: any) {
			var img = new Image();
			img.onerror = function (e) {
				HTTP.taskFinish();
				img.onerror = null;
				img.onload = null;
				Log.error(`load image ${url} failed.`);
				onFinish.call(thisObj, false);
			}
			img.onload = function () {
				HTTP.taskFinish();
				img.onerror = null;
				img.onload = null;
				onFinish.call(thisObj, true, img);
			}
			if (PLATFORM == Platform.WeiXin) {
				wx.fetchURL(url, cors, function (fileUrl) {
					if (!fileUrl) {
						HTTP.taskFinish();
						onFinish.call(thisObj, false);
					}
					else
						img.src = fileUrl;
				});
            }
            else {
                if(useWGL)
                    img.crossOrigin = "anonymous";               
                img.onerror = function (e) {
                    HTTP.taskFinish();
                    img.onerror = null;
					img.onload = null;
					Log.error(`load image ${url} failed.`);
					onFinish.call(thisObj, false);
                }
                img.onload = function () {
                    HTTP.taskFinish();
                    img.onerror = null;
                    img.onload = null;
					onFinish.call(thisObj, true, img);
                }
                if (useWGL && cors && ez.getProxyUrl)
                    img.src = ez.getProxyUrl(url);
                else
                    img.src = url;
            }
		}
		/**
		* await方式通过http请求下载文件
		* @param url: 文件地址
		* @param type: 文件类型
		* @param cors: 是否需要跨域加载，如果为跨域则使用proxy方式获取，需要配置egl.getProxy函数
		* @param priority: 下载优先级，优先级大的在队列里提前加载
		*/
		public static downloadAsync(url: string, type: DataType, cors: boolean, priority: number): Promise<any> {
			return new Promise<any>((r, e) => {
				HTTP.download(url, type, cors, priority, (success: boolean, data: any) => {
					if (success)
						r(data);
					else
						e();
				}, null);
			});
		}
		/**
		* 通过http请求下载文件
		* @param url: 文件地址
		* @param type: 文件类型
		* @param cors: 是否需要跨域加载，如果跨域则使用proxy方式获取，需要配置{@link egl.getProxy}函数
		* @param priority: 下载优先级，优先级大的在队列里提前加载
		* @param onFinish: 回调函数
		*/
		public static download(url: string, type: DataType, cors: boolean, priority: number, onFinish: (success: boolean, data: any) => void, thisObj?: any) {
			var task;
			if(type == DataType.Text || type == DataType.Binary) {
				task = {
					priority: priority,
					do: function () { HTTP.getData(url, type, onFinish, thisObj); }
				};
			}
			else if(type == DataType.Sound) {
				task = {
					priority: priority,
					do: function () { HTTP.getSound(url, onFinish, thisObj); }
				};
			}
			else if(type == DataType.Image) {
				task = {
					priority: priority,
					do: function () { HTTP.getImage(url, cors, onFinish, thisObj); }
				};
			}
			var i = 0;
			while(true) {
				if(i >= HTTP.pedingTasks.length || priority > HTTP.pedingTasks[i].priority) {
					HTTP.pedingTasks.splice(i, 0, task);
					break;
				}
				i++;
			}
			HTTP.nextTask();
		}
	}
/*
	interface ResFinishCallback {
		onload: (success: boolean) => void;
		thisObj: any;
	}
*/
	const enum TextureType {
		image = 0,
		ezm = 4,
		etc = 5,
		pvr = 6,
		astc = 7,
		dxt = 8
	}

	function TextureFormat2Type(format: TextureFormat) {
		switch(format) {
			case TextureFormat.RGBA4:
			case TextureFormat.RGBA:
			case TextureFormat.L8:
			case TextureFormat.L8A8:
			case TextureFormat.RGB565: return TextureType.ezm;
			case TextureFormat.ETC1: return TextureType.etc;
			case TextureFormat.DXT:  return TextureType.dxt;
			case TextureFormat.ASTC: return TextureType.astc;
			case TextureFormat.PVR: return TextureType.pvr;
			default: return TextureType.ezm;
		}		
	}

	function getPixelSize(format: TextureFormat) {
		switch(format) {
			case TextureFormat.RGBA: return 4;
			case TextureFormat.RGB565: return 2;
			case TextureFormat.RGBA4 : return 2;
			case TextureFormat.L8: return 1;
			case TextureFormat.L8A8: return 2;
			case TextureFormat.ETC1: return 0.5;
			case TextureFormat.DXT: return 0.5;
			case TextureFormat.ASTC: return 0.45;
			case TextureFormat.PVR: return 0.5;
			default: return 1;
		}
	}

	class TextureObject implements TextureData {
		id: string;
		name: string;
		width: number;
		height: number;
		maxAge: number;
		memSize: number;
		age?: number;
		invWidth?: number;
		invHeight?: number;
		format: TextureFormat;
		tex?: WebGLTexture;
		img?: HTMLImageElement;
		url: string;
		type: TextureType;
		isCube: boolean;
		cubemap: string[];
        res: Res<Texture>;
		cors:boolean;

		constructor(res: Res<Texture>) {
			this.id = res.id;
			this.name = res.args.name || res.url;
			this.width = res.args.width;
			this.height = res.args.height;
            this.url = res.url;
            if(res.cors)
                this.cors = true;
			if (res.args.cubemap) {
				this.isCube = true;
				this.cubemap = res.args.cubemap;
			}
			this.maxAge = res.age || 0;
			this.format = res.args.format || TextureFormat.RGBA;
			this.memSize = 0;
			this.res = res;
			if(res.type == ResType.image)
				this.type = TextureType.image;
			else if(res.type == ResType.ezm)
				this.type = TextureType.ezm;
			else if(res.type == ResType.texture) {
				var types = res.args.types || [];
				var type = TextureFormat2Type(Texture.compressFormat);
				if(types.indexOf(type) < 0) {
					if(types.indexOf(TextureType.ezm) < 0) {
						this.type = TextureType.image;
						this.format = TextureFormat.RGBA;
					}
					else {
						this.format = TextureFormat.RGB565;
						this.type = TextureType.ezm;
					}
				}
				else {
					this.format = Texture.compressFormat;
					this.type = type;
				}
				if(this.type != TextureType.image)
					this.url = this.url + "." + this.type;
			}
			else
				Log.error("not texture resource.");
		}

		setError() {
			this.id = Texture.errorFallback.id;
			this.tex = Texture.errorFallback.tex;
			this.width = Texture.errorFallback.width;
			this.height = Texture.errorFallback.height;
			this.invWidth = Texture.errorFallback.invWidth;
			this.invHeight = Texture.errorFallback.invHeight;
			this.res.state = ResState.Error;
		}

		load(onload: Function) {
			if(this.res.state != ResState.Unload)
				return;
			var event: Profile.IEvent;
			this.res.state = ResState.Loading;

			async function loadcubes() {
				if (PROFILING)
					event = Profile.newEvent("load cubemap", this.name || this.id);
				let maps = [];
				for (let i = 0; i < this.cubemap.length; i++) {
					var res = getRes<Texture>(this.cubemap[i]);
					maps[i] = await HTTP.downloadAsync(res.url, DataType.Image, false, 1);
					if (PROFILING && event)
						event.addStep(`download map ${i}`);
				}
				this.tex = Texture.createCubeTextureFromImage(maps);
				this.invWidth = 1 / this.width;
				this.invHeight = 1 / this.height;
				this.memSize = this.width * this.height * 4 * 6;
				//Texture.addTextureData(this);
				if (PROFILING && event) {
					event.addStep("upload texture");
					event.end();
				}
				onload();
			}
			if (this.type == TextureType.image) {
				if (this.cubemap) {					
					loadcubes.call(this);
					return;
				}
				if(PROFILING)
					event = Profile.newEvent("load image", this.name||this.id);
				HTTP.download(this.url, DataType.Image, this.cors, 1, function (success, img: HTMLImageElement) {
					if(success) {
						if (PROFILING && event)
							event.addStep("download");
						this.res.state = ResState.Ready;
						if (useWGL) {
							if (this.res.type == ResType.texture)
								this.tex = Texture.createGLTextureFromImage(img, GL.REPEAT, true);
							else
								this.tex = Texture.createGLTextureFromImage(img, GL.CLAMP_TO_EDGE, false);
							this.invWidth = 1 / img.width;
							this.invHeight = 1 / img.height;
							if (PROFILING && event)
								event.addStep("upload texture");
						}
						else
							this.img = img;
						this.width = img.width;
						this.height = img.height;
						this.memSize = img.width * img.height * 4;
						//Texture.addTextureData(this);
						onload();
						if (PROFILING && event)
							event.end();
					}
					else {
						Log.error(`download ${this.url} failed.`);
						this.setError();
						if (PROFILING && this.event){
							this.event.addStep("failed");
							this.event.end();
							this.event = null;
						}
					}
				}, this);
			}
			else if(this.type == TextureType.ezm) {
				if (PROFILING)
					event = Profile.newEvent("load ezm", this.name || this.id);
				internal.ezmDecoder.load(this.url, this.format, this.width * this.height, event, (function (r: internal.IEZDecodeResult) {
					if(r.status) {
						if (PROFILING && event){
							event.addStep("failed: " + r.error);
							event.end();
						}
						Log.error(r.error);
						this.setError();
						onload();
					}
					else {
						this.res.state = ResState.Ready;
						var pixels: ArrayBufferView = r.data||null;
						if(pixels && (this.format == TextureFormat.RGB565 || this.format == TextureFormat.RGBA4))
							pixels = new Uint16Array(r.data.buffer, r.data.byteOffset, r.data.byteLength >> 1);
						this.tex = Texture.createGLTexture(r.width, r.height, this.format, 
							this.res.type == ResType.texture ? GL.REPEAT : GL.CLAMP_TO_EDGE,
							GL.LINEAR, false, this.res.type == ResType.texture && !!pixels, pixels);
						this.width = r.width;
						this.height = r.height;
						this.invWidth = 1 / r.width;
						this.invHeight = 1 / r.height;
						this.memSize = r.width * r.height * getPixelSize(this.format);
						let gl = getGL();
						if(r.subsets) {
							for(let i = 0; i < r.subsets.length; i++) {
								let subImg = r.subsets[i];
								if(this.format == TextureFormat.RGBA)
									gl.texSubImage2D(GL.TEXTURE_2D, 0, 0, subImg.top, r.width, subImg.height, GL.RGBA, GL.UNSIGNED_BYTE, subImg.data);
								else if(this.format == TextureFormat.RGB565)
									gl.texSubImage2D(GL.TEXTURE_2D, 0, 0, subImg.top, r.width, subImg.height, GL.RGB, GL.UNSIGNED_SHORT_5_6_5, new Uint16Array(subImg.data.buffer, subImg.data.byteOffset, subImg.data.byteLength >> 1));
								else if(this.format == TextureFormat.RGBA4)
									gl.texSubImage2D(GL.TEXTURE_2D, 0, 0, subImg.top, r.width, subImg.height, GL.RGBA, GL.UNSIGNED_SHORT_4_4_4_4, new Uint16Array(subImg.data.buffer, subImg.data.byteOffset, subImg.data.byteLength >> 1));
								else if(this.format == TextureFormat.L8)
									gl.texSubImage2D(GL.TEXTURE_2D, 0, 0, subImg.top, r.width, subImg.height, GL.LUMINANCE, GL.UNSIGNED_BYTE, subImg.data);
								else if(this.format == TextureFormat.L8A8)
									gl.texSubImage2D(GL.TEXTURE_2D, 0, 0, subImg.top, r.width, subImg.height, GL.LUMINANCE_ALPHA, GL.UNSIGNED_BYTE, subImg.data);
							}
						}
						if(this.res.type == ResType.texture)
							gl.generateMipmap(gl.TEXTURE_2D);
						//Texture.addTextureData(this);
						if (PROFILING && event) {
							event.addStep("upload texture");
							event.end();
						}
						onload();
					}
				}).bind(this));
			}
			else {
				if (PROFILING)
					event = Profile.newEvent("load compress texture", this.name || this.id);
				HTTP.download(this.url, DataType.Binary, this.cors, 1, function (success, data: ArrayBuffer) {
					if(!success) {
						if (PROFILING && event){
							event.addStep("failed");
							event.end();
						}
						this.setError();
						if(onload)
							onload();
						return;
					}
					if (PROFILING && event)
						event.addStep("download");					
                    var headData = data.slice(0, data.byteLength & ~3);
					var head = new Uint16Array(headData, 0);
					var type = head[0] & 0xff;
					var isCube = !!(head[0] >> 8);
					var width = head[1];
					var height = head[2];
					var level = head[3] >> 8;
					var n = head[3] & 0xff;
					var cubes: Uint8Array[][];
					var mipmaps: Uint8Array[];
					var offset = 8;
					var i, len;
					if(type != this.type) {
						Log.error("texture type mismatch!");
						this.setError();
						if(onload)
							onload();
						return;
					}
					this.width = width;
					this.height = height;
					this.invWidth = 1 / width;
					this.invHeight = 1 / height;
					if (isCube) {
						this.isCube = true;
						cubes = [];
						for (var j = 0; j < 6; j++) {
							mipmaps = [];
							cubes.push(mipmaps);
							for (i = 0; i < level; i++) {
								len = new Uint32Array(headData, offset)[0];
								offset += 4;
								mipmaps[i] = new Uint8Array(data, offset, len);
								offset += len;
							}
						}
					}
					else {
						mipmaps = [];
						for (i = 0; i < level; i++) {
							len = new Uint32Array(headData, offset)[0];
							offset += 4;
							mipmaps[i] = new Uint8Array(data, offset, len);
							offset += len;
						}
					}
					var compFormat = 0;
					switch(this.format) {
						case TextureFormat.PVR:
							compFormat = Texture.CompressTextureType.pvr4; break;
						case TextureFormat.ETC1:
							compFormat = Texture.CompressTextureType.etc1; break;
						case TextureFormat.ASTC:
							switch(n) {
								case 4: compFormat = Texture.CompressTextureType.astc4x4; break;
								case 5: compFormat = Texture.CompressTextureType.astc5x5; break;
								case 6: compFormat = Texture.CompressTextureType.astc6x6; break;
								case 8: compFormat = Texture.CompressTextureType.astc8x8; break;
								default: Log.error("bpp error"); break;
							}
							break;
						case TextureFormat.DXT:
							compFormat = Texture.CompressTextureType.dxt1; break;
					}
					this.res.state = ResState.Ready;
					if (isCube) {
						Log.debug(`load cube texture ${this.name} ${this.width}x${this.height}`);
						this.tex = Texture.createCompressCubeTexture(width, height, compFormat, GL.LINEAR, cubes);
					}
					else {
						Log.debug(`load texture ${this.name} ${this.width}x${this.height}`);
						this.tex = Texture.createCompressTexture(width, height, compFormat, GL.REPEAT, GL.LINEAR, mipmaps);
					}
					this.memSize = offset;
					//Texture.addTextureData(this);
					if (PROFILING && event){
						event.addStep("upload texture");
						event.end();
					}
					if(onload)
						onload();
				}, this);
			}
		}

		release() {
			if(useWGL) {
				var gl = getGL();
				if(this.tex) {
					gl.deleteTexture(this.tex);
					this.tex = null;
				}
			}
			else
				this.img = null;
			this.memSize = 0;
			this.res.state = ResState.Unload;
		}
	}

	class ExtResItem {
		public id: string;
		public state: ResState = ResState.Unload;
		public args: any;
		public type: ResType;
		public url: string;
		private _dataType: DataType;
		private data: any;
        public rawData: any;
        cors: boolean;
		private _callbacks: Function[] = [];
		//public width: number;
		//public height: number;
		public name: string;

		private isTexture() {
			return this.type == ResType.image || this.type == ResType.ezm || this.type == ResType.texture;
		}

		public constructor(url: string, resType: ResType, args?:any) {
			this.name = this.id = this.url = url;			
			this.type = resType;
			this._dataType = RawTypeMap[ResTypeTbl[this.type]];
            this.args = args || {};
            this.cors = true;
            if (this.isTexture()) {
				this.data = new Texture(new TextureObject(this));
			}
		}
		public toString() {
			return this.url;
		}
		onload(success: boolean, data: any) {
			if (success) {
				this.state = ResState.Ready;
				this.data = data;
				switch (this.type) {
					case ResType.csv:
						this.data = parse.CSV(data);
						this.rawData = data;
						break;
					case ResType.json:
						this.data = JSON.parse(data);
						this.rawData = data;
						break;
				}
			}
			else {
				Log.error(`load res ${this.url} failed!`);
				this.data = ResItem.Fallbacks[ResTypeTbl[this.type]];
				this.state = ResState.Error;
			}
			let cb = this._callbacks;
			for (let i = 0; i < this._callbacks.length; i++)
				cb[i](success);
			this._callbacks = [];
		}

		public getData(): any {
			if (this.data)
				return this.data;			
			return this.data;
		}

		public release() {
			if (this.isTexture()) {
				if (this.data)
					this.data.release();
			}
			this.state = ResState.Unload;
			this.data = null;
		}

		public loadAsync(): Promise<any> {
			var ctx = this;
			return new Promise<any>((r, e) => {
				ctx.load(succ => {
					if (succ)
						r(ctx.getData());
					else
						e();
				});
			});
		}
		public load(func?: (success: boolean) => void, thisObj?: any) {
			if(this.state == ResState.Unload || this.state == ResState.Loading) {
				if(func)
					this._callbacks.push(thisObj ? func.bind(thisObj) : func);
				if (this.state == ResState.Unload) {
					if (this.isTexture())
						this.data.load();
					else {
						this.state = ResState.Loading;
						HTTP.download(this.url, this._dataType, true, 10, this.onload, this);
					}
				}
			}
			else if(func)
				func.call(thisObj, this.state == ResState.Ready);
		}
	}

	var RawTypeMap = {
		image: DataType.Image,
		binary: DataType.Binary,
		text: DataType.Text,
		json: DataType.Text,
		csv: DataType.Text,
		sound: DataType.Sound,
		gltf: DataType.Text,
		model: DataType.Binary,
		spine: DataType.Binary,
		texture: DataType.Binary
	};

	class ResItem {
		id: string;
		name: string;
		public url: string;
		public type: ResType;
		public _state: ResState = ResState.Unload;
		private data: any;
		public rawData: any;
		public parentImage: Res<Texture>;
		private _callbacks: Function[] = [];
		private _dataType: DataType;
		public args: any;
		public width?: number;
		public height?: number;
		private event: Profile.IEvent;

		static Fallbacks = {
			image: null,
			binary: new ArrayBuffer(0),
			text: "",
			json: {},
			sound: null
		}
		
		private createImg() {
			var args = this.args;
			var t = new Texture(new TextureObject(this), args.width, args.height);
			if (args.margin)
				t.margin = typeof (args.margin) === "string" ? parse.Number4(args.margin) : args.margin;
			if (args.s9)
				t.s9 = typeof (args.s9) === "string" ? parse.Number4(args.s9) : args.s9;
			this.data = t;
		}
		private createTex() {
			var args = this.args;
			this.data = new Texture(new TextureObject(this), args.width, args.height);
		}
		private createSub() {
			var args = this.args;
			var parentTex = this.parentImage.getData();
			var r = parse.Number4(args.region);
			var tex = parentTex.createSubTexture(new Rect(r[0], r[1], r[2], r[3]), args.width, args.height);
			if (args.margin)
				tex.margin = typeof (args.margin) === "string" ? parse.Number4(args.margin) : args.margin;
			if (args.s9)
				tex.s9 = typeof (args.s9) === "string" ? parse.Number4(args.s9) : args.s9;
			if (args.transpose)
				tex.transpose = true;
			this.data = tex;
		}
		public constructor(id: string, args: any) {
			this.id = id;
			this.name = args.name||id;
			this.url = args.url;
			this.type = args.type;
			this.args = args;
			this._dataType = RawTypeMap[ResTypeTbl[this.type]];
			this.width = args.width;
			this.height = args.height;
			if (this.type == ResType.empty) {
				this.state = ResState.Ready;
				this.data = new Texture({ id: this.id, name: args.name, width: args.width, height: args.height, memSize: 0 }, args.width, args.height);
				this.data.empty = true;
			}
		}
		public init() {
			if(this.type == ResType.subimage) {
				var args = this.args;
				if(!args.region)
					Log.error(`the res ${this.name} has no region argument!`);
				this.parentImage = resDict[args.parent];
				if (!this.parentImage)
					Log.error(`the parent ${this.args.parentName} is not exist!`);
			}
		}
		public toString() {
			return this.name;
		}
		public set state(v: ResState) {
			this._state = v;
			if(v == ResState.Ready || v == ResState.Error) {
				let success = v == ResState.Ready;
				let cb = this._callbacks;
				for (let i = 0; i < this._callbacks.length; i++)
					cb[i](success);
				this._callbacks = [];
			}
		}
		public get state(): ResState {
			if(this.type == ResType.subimage)
				return this.parentImage.state;
			return this._state;
		}
		
		onload(success: boolean, data: any) {
			if(success) {
				this.data = data;
				switch (this.type) {
					case ResType.csv:
						this.rawData = data;
						this.data = parse.CSV(data);
						break;
					case ResType.json:
						this.rawData = data;
						this.data = JSON.parse(data);
						break;
				}
				if (PROFILING && this.event){
					this.event.end();
					this.event = null;
				}
				this.state = ResState.Ready;
			}
			else {
				Log.error(`load res ${this.url} failed!`);
				this.data = ResItem.Fallbacks[ResTypeTbl[this.type]];
				this.state = ResState.Error;
				if (PROFILING && this.event) {
					this.event.addStep("failed");
					this.event.end();
					this.event = null;
				}
			}
		}

		public getData(): any {
			if (this.data)
				return this.data;
			if (this.type == ResType.image || this.type == ResType.ezm)
				this.createImg();
			else if (this.type == ResType.texture)
				this.createTex();
			else if (this.type == ResType.subimage)
				this.createSub();
			return this.data;
		}

		public release() {
			if(this.type == ResType.texture || this.type == ResType.ezm || this.type == ResType.image) {
				this.data.release();
				this.state = ResState.Unload;
			}
			else if(this.type == ResType.subimage || this.type == ResType.empty)
				return;
			else {
				this.state = ResState.Unload;
				if (this.rawData)
					this.rawData = null;
				this.data = null;
				this._callbacks = [];
			}
		}
		
		public loadAsync(): Promise<any> {
			var ctx = this;
			return new Promise<any>((r, e) => {
				ctx.load(succ => {
					if (succ)
						r(ctx.getData());
					else
						e();
				});
			});
		}
		public load(func?: (success: boolean) => void, thisObj?: any, priority?: number) {
			if(func) {
				if(this.type != ResType.subimage && (this.state == ResState.Unload || this.state == ResState.Loading))
					this._callbacks.push(thisObj ? func.bind(thisObj) : func);
				else
					func.call(thisObj, this.state == ResState.Ready);
			}
			if(this.state == ResState.Unload) {
				if (this.type == ResType.image || this.type == ResType.ezm || this.type == ResType.texture) {
					this.getData().load();
				}
				else if(this.type == ResType.subimage) {
					this.parentImage.load(func, thisObj, priority);
				}
				else {
					this.state = ResState.Loading;					
					if(this.type == ResType.gltf) {
						if (PROFILING)
							this.event = Profile.newEvent("load gltf", this.name || this.id);
						HTTP.download(this.url, DataType.Text, false, priority || 7, function (succ, data) {
							if(succ) {
								this.data = JSON.parse(data);
								this.rawData = data;
								var res = getRes(this.args.bin);
								if(!res) {
									Log.error(`bin not exist`);
									this.onload(false, null);
								}
								else {
									HTTP.download(res.url, DataType.Binary, false, priority || 7, function (succ, data) {
										if(succ)
											this.bin = data;
										this.onload(succ, this.data);
									}, this);
								}
							}
							else {
								this.onload(succ, data);
							}
						}, this);
					}
					else{
						if (PROFILING)
							this.event = Profile.newEvent("load res", this.name || this.id);
						HTTP.download(this.url, this._dataType, false, priority || 9, this.onload, this);
					}
				}
			}
		}
	}

	/**
	* 加载资源包
	* @param packData: 资源包数据
	* @param root: 资源根路径
	*/
	export function loadPackage(data: PackageData, resRoot: string) {
		var length = data.resources.length;
		for (var i = 0; i < length; i++) {
			var item = data.resources[i];
			var id = nameHash(item.name);
			if (resDict[id] != null) {
				Log.warn("id duplicated: " + resDict[id].name);
			}
			if(item.url !== undefined) {
				if(LocalResDict && LocalResDict[item.url]) {
					Log.debug("set local url: " + LocalResDict[item.url]);
					item.url = LocalResDict[item.url];
				}
				else
					item.url = resRoot + item.url;
			}
			item.type = ResTypeTbl[item.type];
			resDict[id] = new ResItem(id, item);
			if (item.parent) {
				resDict[id].args.parentName = item.parent;
				resDict[id].args.parent = nameHash(item.parent);
			}
		}
		for (let k in resDict)
			resDict[k].init();
		function addGroup(name:string){
			let idx = name.lastIndexOf("/");
			if(idx < 0)
				return;
			let path = name.substring(0, idx);
			if (!ResGroups[path])
				ResGroups[path] = [];
			ResGroups[path].push(name);
		}
		let groups = data.groups;
		length = groups.length;
		for(let h = 0; h < length; h++){
			let name = groups[h].name;
			if (!ResGroups[name])
				ResGroups[name] = [];
			addGroup(name);
		}
		for(let h = 0; h < length; h++) {
			let g = groups[h];
			if (g.keys == "")
				continue;
			let group = ResGroups[g.name];
			let path = g.name + "/";
			let keys = g.keys.split(',');
			for(let j = 0; j < keys.length; j++)
				group.push(nameHash(path + keys[j]));
		}
	}

	/**
	* 加载外部JSON文件资源包
    * @param pkgUrl: 文件路径
    * @param root: 资源根路径
    * @param onComplete: 回调函数
	*/
	export function loadJSONPackage(pkgUrl: string, root: string, onComplete: (success:boolean) => void, thisObj?: any) {
		HTTP.download(pkgUrl, DataType.Text, false, 20, (success, data) => {
			if (!success) {
				Log.error("load res pack failed.");
				onComplete.call(thisObj, false);
				return;
			}
			loadPackage(JSON.parse(data), root);
			onComplete.call(thisObj, true);
		}, null);
	}

	/**
	* 从外部加载JSON格式资源包
	* @param pkgUrl 文件路径
	* @param root 资源根路径
	*/
	export function loadJSONPackageAsync(pkgUrl: string, root: string): Promise<void> {
		return new Promise<void>((r, e) => {
			HTTP.download(pkgUrl, DataType.Text, false, 20, (success, data) => {
				if (success) {
					loadPackage(JSON.parse(data), root);
					r();
				}
				else
					e();
			}, null);
		}); 
	}

	/** 
	* 设置本地资源加载列表（APP打包用，当资源存在本地时优先从本地加载）
	* @param root 资源本地根路径
	* @param resList 资源文件名列表
	*/
	export function setLocalResList(root:string, resList:string[]) {
		LocalResDict = {};
		for (var k in resList) {
			var n = resList[k];
			LocalResDict[n] = root + n;
		}
	}
	
	/**
	* 加载发布后的资源描述
	*	当使用publish工具发布后，资源包将被转化成混淆后的字符串嵌入到代码中(也可从外部文件加载)
	* @param resPak 混淆后的资源包描述
	* @param root 资源根路径
	* @param groups 资源组
	*/
	export function loadResPackage(resPak: string, root: string, groups: any) {
		var typeTbl = {
			i: ResType.image,
			w: ResType.ezm,
			x: ResType.texture,
			p: ResType.subimage,
			P: ResType.subimage,
			s: ResType.sound,
			t: ResType.text,
			j: ResType.json,
			c: ResType.csv,
			b: ResType.binary,
			e: ResType.empty,
			g: ResType.gltf,
			m: ResType.model,
			n: ResType.spine
		};
		var numTbl = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef";
		function parseNum(s: string) {
			var n = 0;
			for(var i = 0; i < s.length; i++) {
				n <<= 5;
				n += numTbl.indexOf(s[i]);
			}
			return n;
		}
		function parseNumbers(s: string) {
			return s.split(",").map(v => parseNum(v));
		}
		function getUrl(name: string) {
			return LocalResDict && LocalResDict[name] ? LocalResDict[name] : root + name;
		}

		function parseItem(data: string) {
			var item: any = {};
			var args = data.split("|");
			if(args.length < 3)
				return;
			var type = typeTbl[args[1]];
			var transpose = args[1] == "P";
			var id = args[0];
			item.type = type;

			if(type == ResType.subimage) {
				item.parent = args[2];
				item.region = parseNumbers(args[3]);
				item.width = args[4] ? parseNum(args[4]) : item.region[2];
				item.height = args[5] ? parseNum(args[5]) : item.region[3];
				if(args[6])
					item.s9 = parseNumbers(args[6]);
				if(args[7])
					item.margin = parseNumbers(args[7]);
				if(args[7])
					item.format = parseNum(args[7]);
				if(args[8])
					item.hitMask = args[8];
				if(transpose)
					item.transpose = true;
			}
			else if(type == ResType.gltf) {
				item.url = getUrl(args[2]);
				item.bin = "R:" + args[3];
			}
			else if(type == ResType.spine) {
				item.url = getUrl(args[2]);
				item.atlas = "R:" + args[3];
			}
			else {
				if(type == ResType.image || type == ResType.ezm) {
					item.url = getUrl(args[2]);
					if (type == ResType.image)
						item.url += ImageExt;
					item.width = parseNum(args[3]);
					item.height = parseNum(args[4]);
					if(args[5])
						item.s9 = parseNumbers(args[5]);
					if(args[6])
						item.margin = parseNumbers(args[6]);
					if (args[7])
						item.format = parseNum(args[7]);
					if (args[8])
						item.hitMask = args[8];
				}
				else if(type == ResType.texture) {
					item.url = getUrl(args[2]);
					item.width = parseNum(args[3]);
					item.height = parseNum(args[4]);
					item.types = parseNumbers(args[5]);
				}
				else if(type == ResType.empty) {
					item.width = parseNum(args[2]);
					item.height = parseNum(args[3]);
				}
				else
					item.url = getUrl(args[2]);
			}
			resDict[id] = new ResItem(id, item);
		}

		let items = resPak.split(";");
		for(let i = 0; i < items.length; i++)
			parseItem(items[i]);

		for (let j in resDict)
			resDict[j].init();

		function addGroup(name: string) {
			let idx = name.lastIndexOf("/");
			if (idx < 0)
				return;
			let path = name.substring(0, idx);
			if (!ResGroups[path])
				ResGroups[path] = [];
			ResGroups[path].push(name);
		}
		for (let k in groups){
			if (!ResGroups[k])
				ResGroups[k] = [];
			addGroup(k);
			ResGroups[k].concat(groups[k].split(','));
		}
	}

	/** 添加一个资源组 */
	export function addGroup(grpName: string, resources: string[]) {
		var keys = [];
		for(var j = 0; j < resources.length; j++)
			keys[j] = nameHash(resources[j]);
		ResGroups[grpName] = keys;
	}

	function getId(name:string): string {
		if(!name)
			return "";
		if (name.length == 14 && name.indexOf("R:") == 0)
			return name.substr(2);
		else
			return nameHash(name);
	}

	/**
 	 * 检查是否存在这个资源
	 * @param name 资源名
	 * @returns true if exist
	 */
	export function hasRes(name: string): boolean {
		return !!resDict[getId(name)];
    }

	/** 
	* 获取外链资源，外链资源是以http://或https://开头的存放于其他网站的资源文件，比如用户头像
	*/
	export function getExternalRes<T>(url: string, resType: ResType, args?:any): Res<T> {
		if (extResDict[url])
			return extResDict[url];
		else {
			extResDict[url] = new ExtResItem(url, resType, args);
			return extResDict[url];
		}
	}
	
	/** 
	* 获取资源对象
    * @param name 资源名 资源名为资源文件root中的相对路径，不带文件扩展名，使用/分隔目录，不区分大小写
    * 资源名前缀为ext: http: https:的则当作外部资源加载
    * 资源前缀为R:的则直接使用hash后的资源id加载
	* @param type 如果为外部资源则需要指定type，若不指定则当image来加载
	* @returns 资源对象	
	*/
	export function getRes<T>(name: string, type?: ResType): Res<T> {
		if (!name)
			return null;
		if(name.indexOf("ext:") == 0)
			return getExternalRes<T>(name.substring(4), type || ResType.image);
		if (name.indexOf("http:") == 0)
			return getExternalRes<T>(name, type || ResType.image);
		if (name.indexOf("https:") == 0)
			return getExternalRes<T>(name, type || ResType.image);
		var id = getId(name);
		if (DEBUG) {
			if (resDict[id] == null)
				Log.error(`the res ${name} is not exist!`);
		}
		return resDict[id];
	}
	/**
	* 获取全部资源对象
    */
	export function allRes(): Res<{}>[] {
		var r = [];
		for(var k in resDict)
			r.push(resDict[k]);
		return r;
	}
	/**
	 * 遍历资源组内的资源
	 */
	export function groupForEach(group: string | string[], func: (res: Res<{}>) => void) {
		function f(grp) {
			if(!ResGroups[grp])
				return;
			let g = ResGroups[grp];
			for(let i = 0; i < g.length; i++){
				let t = g[i];
				if (ResGroups[t])
					f(f);
				else
					func(resDict[g[i]]);
			}
		}

		if(Array.isArray(group))
			for(var i = 0; i < group.length; i++)
				f(group[i]);
		else
			f(group);
	}

	function addGroupToKeys(keys: string[], resOrGroup: string) {
		var group = ResGroups[resOrGroup];
		if(group) {
			for(let i = 0; i < group.length; i++)
				addGroupToKeys(keys, group[i]);
		}
		else {
			if(!resDict[resOrGroup]) {
				var id = nameHash(resOrGroup);
				if(resDict[id])
					keys.push(id);
			}
			else
				keys.push(resOrGroup);
		}
	}

	/**
	* 预加载资源
    * @param resOrGroups 可以是字符串或数组，可以是资源名或资源组名
    * @param onProgress 载入进度回调函数
	*/
	export function loadGroup(resOrGroups: string | string[], onProgress?: (progress: number, total: number) => void, thisObj?: any): Promise<{}> {
		var keys = [];
		if(Array.isArray(resOrGroups)) {
			for(var i = 0; i < resOrGroups.length; i++)
				addGroupToKeys(keys, resOrGroups[i]);
		}
		else
			addGroupToKeys(keys, resOrGroups);
		var total = 0;
		var progress = 0;
		var resolve: Function = null;
		function onLoad() {
			Log.debug(`${this.name} loaded`);
			if (onProgress)
				onProgress.call(thisObj, ++progress, total);
			if(progress >= total && resolve)
				resolve();
		}
		for (var k in keys) {
			var res = resDict[keys[k]];
			if(res && (res.state == ResState.Unload || res.state == ResState.Loading)) {
				total++;
				res.load(onLoad, res, 1);
			}
		}
		if (onProgress)
			onProgress.call(thisObj, progress, total);

		return new Promise<{}>((r, e) => {
			resolve = r;
		});
	}
} 