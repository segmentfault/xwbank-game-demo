/// <reference path="wglDefines.ts"/>
/**
 * @module Texture
*/
namespace ez {
	var gl: WebGLRenderingContext = null;
	var activeTextueres: TextureData[] = [];
	var permanentTextures: TextureData[] = [];

	/**
	 * 纹理格式
	 */
	export const enum TextureFormat {
		RGBA = 0,
		RGB565 = 1,
		RGBA4 = 2,
		L8 = 3,
		L8A8 = 4,
		ETC1,
		PVR,
		ASTC,
		DXT
	}
	
	/**
	 * 纹理使用统计
	 */
	export interface TextureProfile {
		totalMemory: number;
		activeTextueres: { name: string, size: number, width: number, height: number, age: number }[];
		permanentTextures: { name: string, size: number, width: number, height: number }[];
	}

	/** @ignore */
	export interface TextureData {
		id: string;
		name: string;
		width: number;
		height: number;
		memSize: number;
		state?: ResState;
		maxAge?: number;
		age?: number;
		invWidth?: number;
		invHeight?: number;
		format?: number;
		tex?: WebGLTexture;
		img?: HTMLImageElement;
		canvas?: HTMLCanvasElement;
		fb?: WebGLFramebuffer;
		load?: Function;
		release?: Function;
		isCube?: boolean;
	}

	/**
	 * 纹理及图片对象
	 */
	export class Texture {
		static addTextureAge() {
			activeTextueres.forEach(v => v.age++);
		}
		static errorFallback: TextureData;
		static compressFormat: TextureFormat;
		static TEXTURE_MAX_ANISOTROPY_EXT: number;
		static anisotropicMax:number;
		static CompressTextureType: any = {
			dxt1: 0,
			astc4x4: 0,
			astc5x5: 0,
			astc6x6: 0,
			astc8x8: 0,
			etc1: 0,
			pvr4: 0
		}
		/** @inernal */
		static init(wgl) {
			gl = wgl;
			var img = new Image();
			img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAB3RJTUUH3wUYDBYenXyFigAAAYZJREFUeJy11sHKgkAUhuFTCyGI2gaVEQiCIAlCEHSdbVtEd1CbVt1EEASCICiCEHQB37+Y+bXSGY9lZ9Pg4PuYStQBQL+crvzc7ShJWqsmCR2Pcg0A2y2I4DiIY3w/cQzHgWHgcABA8pBtSyNNW6gTwbbF5ZLciKIWjDQt6lEkjlGx/aVRVX8FhGFZIILrNjMU9RLwmaGuVwFNjbxuWeW6AhDGfA4ieJ7OSFO4rqauBjgGo64F3ows+6BeBwAIwwqDXWcAZaNJnQcIwzRBhMVCvjPzOafOBoQxmYAIRJjNmHUAXe3P7tP0ejQYyPVwSP0+90TWZaQpPA9EmE4xHoMIvo/7nXMqA8jr4r4HgXwePKMOeKuLCQL5PZbLWkMLZFlRD8OXLbahBjT1JoYCqK2Lud2ksVqpjCqAWecZJaBRvWw8Hlogr5smty7melUZT0CWwfc/qWuNf+DLem6MRiDCep0b1FpdYRAAnM8wjBbqb8Z+j+IWnU7t1MVcLthsxLKDH/99/wOjNVTQK+4QyQAAAABJRU5ErkJggg==";
			Texture.errorFallback = { id: "_fallback", name: "fallback", width: img.width, height: img.height,
					memSize: 0, maxAge: -1, invWidth: 1 / img.width, invHeight: 1 / img.height
			};
			if(useWGL) {
				img.onload = function () {
					Texture.errorFallback.tex = Texture.createGLTextureFromImage(img, GL.CLAMP_TO_EDGE, false);
				}
			}
			else {
				Texture.errorFallback.img = img;
				return;
			}
			var anisotropic = gl.getExtension('EXT_texture_filter_anisotropic');
			if (anisotropic){
				Texture.TEXTURE_MAX_ANISOTROPY_EXT = anisotropic.TEXTURE_MAX_ANISOTROPY_EXT;
				Texture.anisotropicMax = gl.getParameter(anisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
			}
			var dxt = gl.getExtension("WEBGL_compressed_texture_s3tc") || gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc") || gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc");
			var astc = gl.getExtension("WEBGL_compressed_texture_astc");
			var etc1 = gl.getExtension('WEBGL_compressed_texture_etc1');
			var pvr = gl.getExtension("WEBGL_compressed_texture_pvrtc") || gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
			if(etc1) {
				Texture.CompressTextureType.etc1 = etc1.COMPRESSED_RGB_ETC1_WEBGL;
				Texture.compressFormat = TextureFormat.ETC1;
			}
			if(dxt) {
				Texture.CompressTextureType.dxt1 = dxt.COMPRESSED_RGB_S3TC_DXT1_EXT;
				Texture.compressFormat = TextureFormat.DXT;
			}
			if(pvr) {
				Texture.CompressTextureType.pvr4 = pvr.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
				Texture.compressFormat = TextureFormat.PVR;
			}
			if(astc) {
				Texture.CompressTextureType.astc4x4 = astc.COMPRESSED_RGBA_ASTC_4x4_KHR;
				Texture.CompressTextureType.astc5x5 = astc.COMPRESSED_RGBA_ASTC_5x5_KHR;
				Texture.CompressTextureType.astc6x6 = astc.COMPRESSED_RGBA_ASTC_6x6_KHR;
				Texture.CompressTextureType.astc8x8 = astc.COMPRESSED_RGBA_ASTC_8x8_KHR;
				Texture.compressFormat = TextureFormat.ASTC;
			}
			if(!Texture.compressFormat)
				Texture.compressFormat = TextureFormat.RGB565;

			Log.info(`compressFormat: ${Texture.compressFormat}`);
		}
		/** @inernal */
		static addTextureData(t: TextureData) {
			if(t.maxAge < 0)
				permanentTextures.push(t);
			else {
				t.age = 0;
				activeTextueres.push(t);
			}
		}
		/**
		 * 获取纹理使用统计数据 */
		static profile(): TextureProfile {
			var memSize = 0;
			activeTextueres.forEach(t => memSize += t.memSize);
			permanentTextures.forEach(t => memSize += t.memSize);
			return {
				activeTextueres: activeTextueres.map(t => { return { name: t.name, width: t.width, height:t.height, size: t.memSize, age: t.age } }),
				permanentTextures: permanentTextures.map(t => { return { name: t.name, width: t.width, height: t.height, size: t.memSize } }),
				totalMemory: memSize
			}
		}

		/**
		 * 释放长期未使用的WGL纹理
		 *   在当前加载的纹理中，每帧未被使用的age会加1，被使用的age设为0
		 * @param maxAge 超过maxAge的纹理释放
		 * ```
		 * //设置全局资源管理策略，每秒检测并释放掉60帧内没有被使用过的纹理
		 * setInterval(() => egl.Texture.releaseUnusedTexture(60), 1000);
		 * ```
		 */
		static releaseUnusedTexture(maxAge: number) {
			for (let i = 0; i < permanentTextures.length; i++) {
				let t = permanentTextures[i];
				if(!t.tex && !t.img){
					permanentTextures.splice(i, 1);
					i--;
				}
			}
			for (let i = 0; i < activeTextueres.length; i++){
				const t = activeTextueres[i];
				if (t.age >= (t.maxAge || maxAge)){
					if (DEBUG)
						Log.debug(`release texture: ${t.name}`);
					t.release();
					activeTextueres.splice(i, 1);
					i--;
				}
			}
		}

		protected _data: TextureData;
		protected _width: number;
		protected _height: number;
		/**
		* 空白边距
		*/
		public margin?: Number4;
		/**
		* 9宫格拉伸
		*/
		public s9?: Number4;
		/**
		* 子区域
		*/
		public subRect?: Rect;
		/**
		* 像素格式
		*/
		public format?: TextureFormat;
        /**
         * 是否在纹理atlas中旋转90°存放
        */
		public transpose: boolean;
        /**
        * 是否为空白纹理
        */
		public empty: boolean;
		/**
		* 是否为Cube map
		*/
		public get isCube(): boolean {
			return this._data.isCube;
		}
		/**
		* 释放资源
		*/
		public release() {
			this._data.release();
		}
		public constructor(data: TextureData, width?:number, height?:number) {
			this._data = data;
			this._width = width;
			this._height = height;
			if((data.tex || data.img) && data.maxAge < 0)
				Texture.addTextureData(data);
		}
		/**
		* 资源名
		*/
		public get name(): string {
			return this._data.name;
		}
		/**
		* 资源id
		*/
		public get id(): string {
			return this._data.id;
		}
		/**
		* 纹理宽度
		*/
		public get width(): number {
			return this._width;
		}
		/**
		* 纹理高度
		*/
		public get height(): number {
			return this._height;
		}
		/**
		* 水平缩放
		*/
		public get scaleX() {
			var w = this._width;
			if(this.margin)
				w -= this.margin[0] + this.margin[2];
			if(this.subRect)
				return w / this.subRect.width;
			else
				return w / this._data.width;
		}
		/**
		* 垂直缩放
		*/
		public get scaleY() {
			var h = this._height;
			if(this.margin)
				h -= this.margin[1] + this.margin[3];
			if(this.subRect)
				return h / this.subRect.height;
			else
				return h / this._data.height;
		}
		/**
		* 内存占用大小
		*/
		public get memSize() {
			return this._data.memSize;
		}
		/**
		* 纹理是否已加载
		*/
		public get ready(): boolean {
			return useWGL ? !!this._data.tex : !!this._data.img;
		}
		/**@ignore */
		public get invWidth(): number {
			return this._data.invWidth;
		}
		/**@ignore */
		public get invHeight(): number {
			return this._data.invHeight;
		}
		/**
		* 加载纹理到内存
		*/
		public load(onload?: Function) {
			var t = this._data;
			this._data.load(function(){
				Texture.addTextureData(t);
				if(onload)
					onload();
			});
		}
		/** 
		 * 获取Image对象
		 * 	仅在canvas渲染模式下有效
		 */
		public get image():HTMLImageElement{
			return this._data.img;
		}
		/** @ignore */
		public bindTexture(idx: number) {
			if(!this._data.tex) {
				Log.error(`the texture ${this.name} is not loaded.`);
				return;
			}
			this._data.age = 0;
			gl.activeTexture(GL.TEXTURE0 + idx);
			if (this._data.isCube)
				gl.bindTexture(GL.TEXTURE_CUBE_MAP, this._data.tex);
			else
				gl.bindTexture(GL.TEXTURE_2D, this._data.tex);			
		}
		/**
		 * 创建子图
		 * @param rect 子图区域
		 * @param w 子图宽度
		 * @param h 子图高度
		 */
		public createSubTexture(rect: Rect, w?: number, h?: number): Texture {
			if(rect.left < 0 || rect.top < 0 || rect.right > this.width || rect.bottom > this.height)
				Log.warn(`subrect(${rect.left},${rect.top},${rect.right},${rect.bottom}) out of bound of '${this.name}'.`);
				//throw new Error("out of bound.");
			if(this.subRect) {
				rect.left += this.subRect.left;
				rect.top += this.subRect.top;
			}
			var tex = new Texture(this._data, w || rect.width, h || rect.height);
			tex.subRect = rect;
			return tex;
		}
		/**
		 * 从image/canvascanvas元素创建Texture
		 * @param img 图片元素
		 */
		public static createFromImage(img: HTMLImageElement | HTMLCanvasElement | ImageData) {
			if(useWGL){
				let tex = Texture.createGLTextureFromImage(img, GL.CLAMP_TO_EDGE, false);
				let id = "image" + Date.now();
				let data: TextureData = {
					id: id, name: id,
					maxAge: -1,
					width: img.width, height: img.height,
					memSize: img.width * img.height * 4,
					invWidth: 1 / img.width, invHeight: 1 / img.height,
					tex: tex,
					release: function () {
						gl.deleteTexture(this.tex);
						this.tex = null;
					}
				};
				return new Texture(data, data.width, data.height);
			}
			else{
				let id = "image" + Date.now();
				let data: TextureData = {
					id: id, name: id, maxAge: -1,
					width: img.width, height: img.height,
					memSize: img.width * img.height * 4,
					img: <HTMLImageElement>img
				};
				data.release = function(){
					this.img = null;
				}
				return new Texture(data, data.width, data.height); 
			}
		}
		/** @inernal */
		public static createGLTextureFromImage(img: HTMLImageElement | HTMLCanvasElement | ImageData, wrapMode:number, mipmap:boolean): WebGLTexture {
			var tex = gl.createTexture();
			//gl.activeTexture(GL.TEXTURE0);
			gl.bindTexture(GL.TEXTURE_2D, tex);
			gl.pixelStorei(GL.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
			gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, img);
			gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, wrapMode);
			gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, wrapMode);
			gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
			if (mipmap) {
				gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR);
				gl.generateMipmap(GL.TEXTURE_2D);
			}
			else
				gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
			return tex;
		}
		/** @inernal */
		public static createCompressTexture(width: number, height: number,
			compressFormat: number, wrapMode: number, filterMode: number, mipmaps: ArrayBufferView[]): WebGLTexture {
			var tex = gl.createTexture();
			//gl.activeTexture(GL.TEXTURE0);
			gl.bindTexture(GL.TEXTURE_2D, tex);
			for(var i = 0; i < mipmaps.length; i++) {
				//console.log(`compressedTexImage2D ${width} ${height} ${mipmaps[i].byteLength}`);
				gl.compressedTexImage2D(GL.TEXTURE_2D, i, compressFormat, width, height, 0, mipmaps[i]);
				width = Math.max(1, width >> 1);
				height = Math.max(1, height >> 1);
			}
			//gl.compressedTexImage2D(GL.TEXTURE_2D, 0, compressFormat, width, height, 0, mipmaps[0]);
			gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, wrapMode);
			gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, wrapMode);
			gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, filterMode);
			gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, mipmaps.length > 1 ? GL.LINEAR_MIPMAP_NEAREST : filterMode);
			return tex;
		}
		/** @inernal */
		public static createCubeTextureFromImage(imgs: HTMLImageElement[] | HTMLCanvasElement[] | ImageData[]): WebGLTexture {
			var tex = gl.createTexture();
			//gl.activeTexture(GL.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
			for(let i = 0; i < 6; i++)
				gl.texImage2D(GL.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, imgs[i]);
			gl.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
			gl.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
			gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
			return tex;
		}
		/** @inernal */
		public static createCompressCubeTexture(width: number, height: number,
			compressFormat: number, filterMode: number, cubes: ArrayBufferView[][]): WebGLTexture {
			var tex = gl.createTexture();
			//gl.activeTexture(GL.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
			for (var j = 0; j < 6; j++) {
				var mipmaps = cubes[j];
				let w = width;
				let h = height;
				for (var i = 0; i < mipmaps.length; i++) {
					gl.compressedTexImage2D(GL.TEXTURE_CUBE_MAP_POSITIVE_X + j, i, compressFormat, w, h, 0, mipmaps[i]);
					w = Math.max(1, w >> 1);
					h = Math.max(1, h >> 1);
				}
			}
			gl.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MAG_FILTER, filterMode);
			gl.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MIN_FILTER, mipmaps.length > 1 ? GL.LINEAR_MIPMAP_NEAREST : filterMode);
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
			return tex;
		}
		/** @inernal */
		public static createGLTexture(width: number, height: number, format: TextureFormat, wrapMode: number,
								filterMode: number, mulAlpha:boolean, genMipmap:boolean, pixels: ArrayBufferView): WebGLTexture {
			var tex = gl.createTexture();
			//gl.activeTexture(GL.TEXTURE0);
			gl.bindTexture(GL.TEXTURE_2D, tex);
			gl.pixelStorei(GL.UNPACK_PREMULTIPLY_ALPHA_WEBGL, mulAlpha ? 1 : 0);
			gl.pixelStorei(GL.UNPACK_ALIGNMENT, 1);
			if(format == TextureFormat.RGBA)
				gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, width, height, 0, GL.RGBA, GL.UNSIGNED_BYTE, pixels);
			else if(format == TextureFormat.RGB565)
				gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGB, width, height, 0, GL.RGB, GL.UNSIGNED_SHORT_5_6_5, pixels);
			else if(format == TextureFormat.RGBA4)
				gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, width, height, 0, GL.RGBA, GL.UNSIGNED_SHORT_4_4_4_4, pixels);
			else if(format == TextureFormat.L8)
				gl.texImage2D(GL.TEXTURE_2D, 0, GL.LUMINANCE, width, height, 0, GL.LUMINANCE, GL.UNSIGNED_BYTE, pixels);
			else if(format == TextureFormat.L8A8)
				gl.texImage2D(GL.TEXTURE_2D, 0, GL.LUMINANCE_ALPHA, width, height, 0, GL.LUMINANCE_ALPHA, GL.UNSIGNED_BYTE, pixels);
			gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, wrapMode);
			gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, wrapMode);
			gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, filterMode);
			if (genMipmap)
				gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR);
			else
				gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, filterMode);
			if (genMipmap)
				gl.generateMipmap(gl.TEXTURE_2D);
			return tex;
		}
	}

	/**
	 * 原生WebGL纹理
	 */
	export class RawTexture extends Texture {
		public constructor(data:TextureData, width: number, height: number) {
			super(data, width, height);
		}
		/** webGL纹理 */
		public get glTex(): WebGLTexture {
			return this._data.tex;
		}
		/**
		 *  创建webGL纹理
		 */
		public static create(id: string, width: number, height: number, pixFormat: number,
					wrapMode: number, filterMode: number, data: ArrayBufferView): RawTexture {
			var tex = gl.createTexture();
			gl.activeTexture(GL.TEXTURE0);
			gl.bindTexture(GL.TEXTURE_2D, tex);
			gl.pixelStorei(GL.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
			gl.texImage2D(GL.TEXTURE_2D, 0, pixFormat, width, height, 0, pixFormat, GL.UNSIGNED_BYTE, data);
			gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, wrapMode);
			gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, wrapMode);
			gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, filterMode);
			gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, filterMode);
			var t = { id: id, name: id, width: width, height: height, memSize: width * height * 4, maxAge: -1, tex: tex, invWidth: 1 / width, invHeight: 1 / height };
			return new RawTexture(t, width, height);
		}
		/** 
		 * 释放纹理
		 */
		public release() {
			gl.deleteTexture(this._data.tex);
			this._data.tex = null;
		}
	}

	/**
	* 可渲染纹理
	*/
	export class RenderTexture extends Texture {
		public constructor(tex:TextureData, width?: number, height?: number) {
			super(tex, width, height);
		}
		public dispose() {
			if(DEBUG)
				Log.debug(`dispose render texture: ${this.id}`);
			this._data.release();
		}
		private static allocId: number = 0;

		public get framebuffer(): WebGLFramebuffer {
			return this._data.fb;
		}

		/** 获取canvas接口（仅canvas渲染模式下有效） */
		public get canvas(): HTMLCanvasElement{
			return this._data.canvas;
		}
		/*
		 * 缩放比率
		 * */
		public scale = 1;

		/**
		 * 重置纹理尺寸
		 */
		public resize(w: number, h: number) {
			if(this._width == w && this._height == h)
				return;
			if(useWGL) {
				if(this._data.tex) {
					gl.bindTexture(GL.TEXTURE_2D, this._data.tex);
					gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, w, h, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
				}
				this._data.width = w;
				this._data.height = h;
			}
			else {
				this._data.canvas.width = w;
				this._data.canvas.height = h;
			}
			this._width = w;
			this._height = h;
		}

		/**
		 * 将canvas元素包装成可渲染纹理
		 * @param canvas 
		 */
		public static createFromCanvas(canvas: HTMLCanvasElement) {
			RenderTexture.allocId++;
			var id = "_rt" + RenderTexture.allocId;
			let data: TextureData = {
				id: id, name: id,
				width: canvas.width, height: canvas.height,
				memSize: canvas.width * canvas.height * 4,
				img: <any>canvas, canvas: canvas
			};
			data.release = function () {
				this.img = null;
				this.canvas.width = 0;
				this.canvas.height = 0;
				this.canvas = null;
			}
			return new RenderTexture(data);
		}

		/**
		 * 创建可渲染纹理
		 * @param width 宽度
		 * @param height 高度
		 * @param needDepth 是否需要创建z-buffer
		 */
		public static create(width: number, height: number, needDepth = false): RenderTexture {
			RenderTexture.allocId++;
			var id = "_rt" + RenderTexture.allocId;
			width = width | 0;
			height = height | 0;
			if (DEBUG)
				Log.debug(`create render texture: ${id} size: ${width} x ${height}`);
			if(!useWGL) {
				var canvas = internal.createCanvas();
				canvas.width = width;
				canvas.height = height;
				let data = { id: id, name: id, width: width, height: height, memSize: width * height * 4, maxAge: -1, canvas: canvas, invWidth: 1 / width, invHeight: 1 / height };
				return new RenderTexture(data, width, height);
			}
			else {
				let data: any = { id: id, name: id, width: width, height: height, memSize: width * height * 4, maxAge: -1, invWidth: 1 / width, invHeight: 1 / height };
				data.tex = gl.createTexture();
				data.fb = gl.createFramebuffer();
				data.release = function () {
					gl.deleteTexture(this.tex);
					gl.deleteFramebuffer(this.fb);
					if (this.depth)
						gl.deleteRenderbuffer(this.depth);
					this.tex = null;
					this.fb = null;
				}
				gl.bindTexture(GL.TEXTURE_2D, data.tex);
				gl.pixelStorei(GL.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
				gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
				gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
				gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
				gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);

				gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, width, height, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
				gl.bindFramebuffer(GL.FRAMEBUFFER, data.fb);
				gl.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, data.tex, 0);
				if(needDepth) {
					data.depth = gl.createRenderbuffer();
					gl.bindRenderbuffer(GL.RENDERBUFFER, data.depth);
					// make a depth buffer and the same size as the targetTexture
					gl.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH_STENCIL, width, height);
					gl.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_STENCIL_ATTACHMENT, GL.RENDERBUFFER, data.depth);
				}

				if(gl.checkFramebufferStatus(GL.FRAMEBUFFER) != GL.FRAMEBUFFER_COMPLETE) {
					Log.error(`create framebuffer failed. status: ${gl.checkFramebufferStatus(GL.FRAMEBUFFER)}`);
					data.release();
					throw new Error("create frame buffer failed!");
				}
				gl.bindTexture(GL.TEXTURE_2D, null);
				gl.bindFramebuffer(GL.FRAMEBUFFER, null);
				return new RenderTexture(data, width, height);
			}
		}
	}
}