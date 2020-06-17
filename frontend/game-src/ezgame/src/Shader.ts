/**
 * @module Renderer
*/
namespace ez {
	var gl: WebGLRenderingContext = null;

	function codeHash(s: string): string {
		var n1 = 0x12345678;
		var n2 = 0x76543210;
		for(var i = 0; i < s.length; i++) {
			var c = s.charCodeAt(i)|0;
			n1 = ((n1 + c) * 1033) & 0xffffffff;
			n2 = ((n2 + c) * 65789) & 0xffffffff;
		}
		return n1.toString(16) + n2.toString(16);
	}
	var vsCache = <any>{};
	var fsCache = <any>{};

	/**
	* shader对象
	*/
	export class Shader {
		public proc: WebGLProgram;
		public uniforms: Dictionary<{ location: WebGLUniformLocation, bind: (loc: WebGLUniformLocation, ...args: any[]) => void, matrix: boolean }>;
		public texUniforms: Dictionary<number>;
		public name: string;
		public sortKey: number;

		private vs: WebGLShader;
		private fs: WebGLShader;
		private _cache: any;
		/**
		 * 构造函数
		 * @param vsCode: vertex shader 代码
		 * @param fsCode: fragment shader 代码
		 * @param attribs: 顶点属性名列表，名字索引对应属性索引
		 * @param uniforms: uniform绑定函数表
		 * @param textures: unifrom表中的附加纹理参数(不包含texture0，2d effect中使用)
		 */
		public constructor(vsCode: string, fsCode: string, attribs: string[],
				uniforms: Dictionary<(loc: WebGLUniformLocation, ...args: any[]) => void>, textures?: string[]) {
			if(!gl)
				gl = getGL();
			var vs, fs;
			var vsHash = codeHash(vsCode);
			var fsHash = codeHash(fsCode);
			if(vsCache[vsHash])
				vs = vsCache[vsHash];
			else {
				vs = gl.createShader(GL.VERTEX_SHADER);
				gl.shaderSource(vs, vsCode);
				gl.compileShader(vs);
				if(!gl.getShaderParameter(vs, GL.COMPILE_STATUS)) {
					Log.error("compile vertex shader failed:" + gl.getShaderInfoLog(vs), vsCode);
					throw new Error("compile vertex shader failed");
				}
				vsCache[vsHash] = vs;
			}
			if(fsCache[fsHash])
				fs = fsCache[fsHash];
			else {
				fs = gl.createShader(GL.FRAGMENT_SHADER);
				gl.shaderSource(fs, fsCode);
				gl.compileShader(fs);
				if(!gl.getShaderParameter(fs, GL.COMPILE_STATUS)) {
					Log.error("compile fragment shader failed:" + gl.getShaderInfoLog(fs), fsCode);
					throw new Error("compile fragment shader failed");
				}
				fsCache[fsHash] = fs;
			}
			this.vs = vs;
			this.fs = fs;
			this.proc = gl.createProgram();
			gl.attachShader(this.proc, vs);
			gl.attachShader(this.proc, fs);
			for(var i = 0; i < attribs.length; i++)
				if(attribs[i])
					gl.bindAttribLocation(this.proc, i, attribs[i]);

			gl.linkProgram(this.proc);
			this.uniforms = {};
			this._cache = {};
			for(var k in uniforms) {
				var loc = gl.getUniformLocation(this.proc, k);
				if(loc) {
					this.uniforms[k] = {
						location: loc,
						bind: uniforms[k],
						matrix: uniforms[k] === gl.uniformMatrix2fv ||
							uniforms[k] === gl.uniformMatrix3fv ||
							uniforms[k] === gl.uniformMatrix4fv
					};
				}
				else
					Log.warn(`not found uniform ${k}`);
			}
			if (textures) {
				this.texUniforms = {};
				for (let i = 0; i < textures.length; i++) {
					var loc = gl.getUniformLocation(this.proc, textures[i]);
					if (!loc) {
						Log.warn(`not found texture uniform ${textures[i]}`);
						continue;
					}
					this.uniforms[textures[i]] = {
						location: loc,
						bind: gl.uniform1i,
						matrix: false
					}
					this.texUniforms[textures[i]] = i + 1;
				}
			}

			if(!gl.getProgramParameter(this.proc, GL.LINK_STATUS)) {
				Log.error("link program failed:" + gl.getProgramInfoLog(this.proc));
				throw new Error("compile fragment shader failed");
			}
		}
		/**
		 * 清除uniform缓存 
		 */
		public clearCache() {
			this._cache = {};
		}
		/**
		 * shader中是否有该unifrom值
		 * @param name uniform name
		 */
		public hasUniform(name: string) {
			return !!this.uniforms[name];
		}
		/**
		 * 绑定uniform
		 *	shader默认会缓存uniform值，在下次绑定时判断值是否有改变，只有在发生改变时才调用API进行绑定
		 * @param name uniform name
		 * @param value uniform value
		 * @param noCache 不对该uniform进行缓存，如果该uniform值在运行时频繁改变则不要进行缓存
		 */
		public bind(name: string, value: any, noCache?: boolean) {
			var u = this.uniforms[name];
			if(!u) {
				//Log.warn("unknown uniform name: " + name);
				return;
			}
			if(!noCache) {
				var cache = this._cache;
				if (cache[name] === value)
					return;
				if (Array.isArray(value)) {
					let equal = true;
					let v = cache[name];
					if (!v)
						equal = false;
					else {
						for (let i = 0; i < value.length; i++) {
							if (value[i] !== v[i]) {
								equal = false;
								break;
							}
						}
					}
					if (equal)
						return;
				}
				cache[name] = value;
			}
			if(u.matrix)
				u.bind.call(gl, u.location, false, value);
			else
				u.bind.call(gl, u.location, value);
		}
	}
}