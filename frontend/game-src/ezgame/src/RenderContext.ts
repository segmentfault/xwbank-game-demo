/// <reference path="CommonTypes.ts"/>
/**
 * 渲染模块
 * @module Renderer
*/
namespace ez {

	var gl: WebGLRenderingContext = null;
	var MAX_QUAD = 30;

	export function getGL(): WebGLRenderingContext{
		return gl;
	}

	export interface IRenderContext {
		scale: number;
		//profile: WGLPerFrameProfiler | CanvasPerFrameProfiler;
		//isWGL: boolean;
		fillRect(width: number, height: number, transform: Handle);
		drawImage(texture: Texture, transform: Handle, width: number, height: number, srcRect?: Rect);
		drawImageRepeat(texture: Texture, transform: Handle, width: number, height: number, repeat: string);
		drawImageS9(texture: Texture, transform: Handle, s9: Number4, width: number, height: number, srcRect?: Rect);
		setAlphaBlend(value: number, blendMode: BlendMode);
		setFillColor(color: string);
		setFillGradient(gradient: GradientFill);
		pushClipRect(clip: Rect): boolean;
		popClipRect();
		endRender();
	}

	export interface IRenderContextWGL extends IRenderContext {
		//scale: number;
		width: number;
		height: number;
		invWidth: number;
		invHeight: number;
		profile: WGLPerFrameProfiler;
		beginRender(target: RenderTexture, profile?: WGLPerFrameProfiler);
		setShader(shader: Shader, params?: any);
		flush();

		createVAO(bindFunc: (gl: WebGLRenderingContext) => void): Function;
		drawTriangles(vaoBinder: Function, count:number);
		drawTextCache(x: number, y: number, cache: any, transform: Handle);
		bindTexture(tex: Texture, idx: number);
		begin3DRender(bound?: Rect): IRenderContext3D;

		beginRecorder();
		endRecorder():Object;
		replay(commands: Object);
	}

	export interface IRenderContextCanvas extends IRenderContext {
		beginRender(target: RenderTexture, profile?: CanvasPerFrameProfiler);

		getCanvasContext2D(): CanvasRenderingContext2D;
		drawText(content: TextMetric, transform: Handle, x: number, y: number, width: number, height: number, align: AlignMode, stroke?: StrokeStyle);
	}
	
	export declare function createCanvasRenderContext(): IRenderContextCanvas;

	export interface IRenderContext3D {
		width: number;
		height: number;
		lastPrimitive: any;
		gl: WebGLRenderingContext;
		profiler: WGLPerFrameProfiler;
		shader: Shader;
		setShader(shader: Shader);
		bindTexture(tex: Texture, idx: number);
		bindCubeTexture(tex: Texture, idx: number);
		defTexture: Texture;
		end();
	}


	/**
	* 渲染上下文
	*/
	export var RenderContext: IRenderContextCanvas | IRenderContextWGL = <any>{};

	var RC = <IRenderContextWGL>RenderContext;

	const enum QuadFlag {
		UV = 1,
		Color = 2,
		uvColor = 3
	}
	export namespace internal {
		export function createWGLRenderContext(wgl: WebGLRenderingContext) {
			Texture.init(wgl);
			gl = wgl;
			var currQuad = 0;
			var currTex = [];
			var currGrad: GradientFill;

			var vaoBind: Function;
			var VAOExt = gl.getExtension("OES_vertex_array_object");
			var vaoBinded = false;
			var defTex: RawTexture;
			var gradTex: RawTexture;
			var defTex3d: RawTexture;
			var fontTex: RawTexture;
			var profile: WGLPerFrameProfiler;
			var currShader: Shader;
			var currBlendMode: BlendMode;
			var fillColorStr: string;
			//var defShader: Shader;
			//var tilingShader: Shader;
			var currClip: Rect;
			var scissors: Rect[];
			var rtWidth = 0;
			var rtHeight = 0;
			var gradBuffer = new Uint8Array(16 * 4);
			var quads = ezasm.handleToFloatArray(ezasm.getQuadsBuffer(), MAX_QUAD * 16);
			var recorder: Function[];

			(function () {
				var vbo = gl.createBuffer();
				var ibo = gl.createBuffer();
				var maxQuad = 128;
				var numIndices = maxQuad * 6;
				var indices = new Uint16Array(numIndices);
				var vertices = new Float32Array(maxQuad * 12);
				for (let i = 0; i < maxQuad; i++) {
					vertices[i * 12] = 0;
					vertices[i * 12 + 1] = 0;
					vertices[i * 12 + 2] = i;

					vertices[i * 12 + 3] = 1;
					vertices[i * 12 + 4] = 0;
					vertices[i * 12 + 5] = i;

					vertices[i * 12 + 6] = 1;
					vertices[i * 12 + 7] = 1;
					vertices[i * 12 + 8] = i;

					vertices[i * 12 + 9] = 0;
					vertices[i * 12 + 10] = 1;
					vertices[i * 12 + 11] = i;
				}
				for (var i = 0, j = 0; i < numIndices; i += 6, j += 4) {
					indices[i + 0] = j;
					indices[i + 1] = j + 1;
					indices[i + 2] = j + 2;
					indices[i + 3] = j;
					indices[i + 4] = j + 2;
					indices[i + 5] = j + 3;
				}
				gl.bindBuffer(GL.ARRAY_BUFFER, vbo);
				gl.bufferData(GL.ARRAY_BUFFER, vertices, GL.STATIC_DRAW);

				gl.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, ibo);
				gl.bufferData(GL.ELEMENT_ARRAY_BUFFER, indices, GL.STATIC_DRAW);

				function bindVB() {
					gl.bindBuffer(GL.ARRAY_BUFFER, vbo);
					gl.enableVertexAttribArray(0);
					gl.enableVertexAttribArray(1);
					gl.vertexAttribPointer(0, 2, GL.FLOAT, false, 3 * 4, 0);
					gl.vertexAttribPointer(1, 1, GL.FLOAT, false, 3 * 4, 2 * 4);
					gl.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, ibo);
				}
				if (VAOExt) {
					var vao = VAOExt.createVertexArrayOES();
					VAOExt.bindVertexArrayOES(vao);
					bindVB();
					VAOExt.bindVertexArrayOES(null);
					vaoBind = VAOExt.bindVertexArrayOES.bind(VAOExt, vao);
				}
				else
					vaoBind = bindVB;
				defTex = RawTexture.create("_null", 1, 1, GL.RGBA, GL.CLAMP_TO_EDGE, GL.NEAREST, new Uint8Array([255, 255, 255, 255]));
				defTex3d = RawTexture.create("_empty", 1, 1, GL.RGBA, GL.CLAMP_TO_EDGE, GL.NEAREST, new Uint8Array([0, 0, 0, 0]));
				fontTex = RawTexture.create("_font", FontCache.Width, FontCache.Height, GL.RGBA, GL.CLAMP_TO_EDGE, GL.LINEAR, null);
				for (i = 0; i < 16 * 4; i++)
					gradBuffer[i] = 255;
				gradTex = RawTexture.create("_gradient", 16, 1, GL.RGBA, GL.CLAMP_TO_EDGE, GL.LINEAR, gradBuffer);

				//currShader = defShader;
				currBlendMode = BlendMode.Normal;
				//gl.useProgram(defShader.proc);
				gl.blendFunc(GL.ONE, GL.ONE_MINUS_SRC_ALPHA);
				gl.blendEquation(GL.FUNC_ADD);
				gl.cullFace(GL.BACK);
				gl.frontFace(GL.CCW);
				gl.disable(GL.CULL_FACE);
				gl.disable(GL.DEPTH_TEST);
				gl.enable(GL.BLEND);
				gl.enable(GL.SCISSOR_TEST);
				gl.blendFunc(GL.ONE, GL.ONE_MINUS_SRC_ALPHA);
				gl.blendEquation(GL.FUNC_ADD);
				gl.disable(GL.CULL_FACE);
			})();

			function addQuad(flags) {
				if (currQuad >= MAX_QUAD)
					RC.flush();
				ezasm.addQuad(currQuad, flags);
				currQuad++;
			}

			function setTexture(texture: Texture, idx: number) {
				if (currTex[idx] != texture.id) {
					RC.flush();
					if (recorder)
						recorder.push(setTextureCmd(texture, idx));
					texture.bindTexture(idx);
					currTex[idx] = texture.id;
					if (PROFILING && profile) {
						profile.setTexture++;
						Profile.addCommand("setTexture" + idx + " " + texture.name);
					}
				}
			}

			function setTexture3d(texture: Texture, idx: number) {
				texture = texture || defTex3d;
				if (texture.empty)
					texture = defTex3d;
				if (currTex[idx] != texture.id) {
					texture.bindTexture(idx);
					currTex[idx] = texture.id;
					if (PROFILING && profile) {
						profile.setTexture++;
						Profile.addCommand("setTexture" + idx + " " + texture.name);
					}
				}
			}

			function setBlend(blendMode) {
				switch (blendMode) {
					case BlendMode.Normal:
						gl.blendFunc(GL.ONE, GL.ONE_MINUS_SRC_ALPHA);
						gl.blendEquation(GL.FUNC_ADD);
						break;
					case BlendMode.Add:
						gl.blendFunc(GL.ONE, GL.ONE);
						gl.blendEquation(GL.FUNC_ADD);
						break;
					case BlendMode.Multiply:
						gl.blendFunc(GL.BLEND_DST_RGB, GL.ZERO);
						gl.blendEquation(GL.FUNC_ADD);
						break;
					case BlendMode.Copy:
						gl.blendFunc(GL.ONE, GL.ZERO);
						gl.blendEquation(GL.FUNC_ADD);
						break;
					case BlendMode.Subtract:
						gl.blendFunc(GL.ONE, GL.ONE);
						gl.blendEquation(GL.FUNC_SUBTRACT);
						break;
				}
			}

			RC.createVAO = function (bindFunc: (gl: WebGLRenderingContext) => void): Function {
				if (VAOExt) {
					var vao = VAOExt.createVertexArrayOES();
					VAOExt.bindVertexArrayOES(vao);
					bindFunc(gl);
					VAOExt.bindVertexArrayOES(null);
					return VAOExt.bindVertexArrayOES.bind(VAOExt, vao);
				}
				else {
					return bindFunc.bind(null, gl);
				}
			}
			function drawTrianglesCmd(vaoBinder: Function, count: number) {
				//recorderDebug.push(`drawTrianglesCmd ${count}`);
				return function () {
					vaoBinded = false;
					vaoBinder();
					gl.drawElements(GL.TRIANGLES, count, GL.UNSIGNED_SHORT, 0);
				}
			}

			RC.drawTriangles = function (vaoBinder: Function, count: number) {
				RC.flush();
				vaoBinded = false;
				vaoBinder();
				gl.drawElements(GL.TRIANGLES, count, GL.UNSIGNED_SHORT, 0);
				if (PROFILING && profile) {
					profile.triangle += count;
					profile.drawcall++;
				}
				if (recorder)
					recorder.push(drawTrianglesCmd(vaoBinder, count));
			}

			function drawQuads(count: number) {
				if (PROFILING && profile) {
					profile.drawQuad += count;
					profile.flush++;
					Profile.addCommand("draw " + currQuad + " quad");
				}
				if (!vaoBinded) {
					vaoBind();
					vaoBinded = true;
				}
				gl.drawElements(GL.TRIANGLES, currQuad * 6, GL.UNSIGNED_SHORT, 0);
				if (PROFILING && profile) {
					profile.triangle += currQuad * 2;
					profile.drawcall++;
				}
			}

			function flushQuadsCmd(count) {
				//recorderDebug.push(`flushQuadsCmd ${count}`);
				var data = new Float32Array(count * 16);
				data.set(quads.slice(0, count * 16));
				return function () {
					quads.set(data);
					if (!vaoBinded) {
						vaoBind();
						vaoBinded = true;
					}
					currShader.bind("quads", quads, true);
					gl.drawElements(GL.TRIANGLES, count * 6, GL.UNSIGNED_SHORT, 0);
					currQuad = 0;
				}
			}
			RC.flush = function () {
				if (currQuad > 0) {
					currShader.bind("quads", quads, true);
					drawQuads(currQuad);
					if (recorder)
						recorder.push(flushQuadsCmd(currQuad));
					currQuad = 0;
				}
			}

			RC.fillRect = function (w: number, h: number, transform: Handle) {
				ezasm.renderScaleTrans(w, h, transform);
				if (currTex[0] == gradTex.id) {
					ezasm.setUVGrad(currGrad.x0, currGrad.y0, currGrad.x1, currGrad.y1, w, h, currGrad.colors.length / 16);
					addQuad(QuadFlag.UV);
				}
				else {
					setTexture(defTex, 0);
					addQuad(QuadFlag.Color);
				}
			}

			RC.drawImage = function (tex: Texture, transform: Handle, w: number, h: number, srcRect?: Rect) {
				var m = tex.margin;
				if (m) {
					var sx = w / tex.width;
					var sy = h / tex.height;
					w = (tex.width - m[2] - m[0]) * sx;
					h = (tex.height - m[3] - m[1]) * sy;
					var tx = m[0] * sx;
					var ty = m[1] * sy;
					ezasm.renderScaleTranslateTrans(w, h, tx, ty, transform);
				}
				else {
					ezasm.renderScaleTrans(w, h, transform);
				}
				if (srcRect)
					ezasm.setUV(srcRect.left * tex.invWidth, srcRect.top * tex.invHeight, srcRect.width * tex.invWidth, srcRect.height * tex.invHeight);
				else
					ezasm.setUVIdentity();
				setTexture(tex, 0);
				addQuad(QuadFlag.uvColor);
			}

			RC.drawImageRepeat = function (texture: Texture, transform: Handle, width: number, height: number, repeat: string) {
				var srcRect = texture.subRect;
				var texWidth = texture.width;
				var texHeight = texture.height;
				setTexture(texture, 0);
				var u = 1;//[0, 1];
				var v = 1;//[0, 1];
				if (repeat === "repeat" || repeat === "repeat-x")
					u = width / texWidth;
				if (repeat === "repeat" || repeat === "repeat-y")
					v = height / texHeight;
				var tilingShader = Effect.get("tiling");
				RC.setShader(tilingShader);
				var iw = texture.invWidth;
				var ih = texture.invHeight;
				if (srcRect) {
					tilingShader.bind("tiling", [srcRect.left * iw, srcRect.top * ih, (srcRect.width - 1) * iw, (srcRect.height - 1) * ih], true);
				}
				else {
					tilingShader.bind("tiling", [0, 0, 1 - iw, 1 - ih], true);
				}
				ezasm.renderScaleTrans(width, height, transform);
				ezasm.setUV(0, 0, u, v);
				addQuad(QuadFlag.uvColor);
			}

			RC.drawImageS9 = function (tex: Texture, trans: Handle, s9: Number4, width: number, height: number, srcRect?: Rect) {
				var i, j;
				var m = tex.margin;
				var ml = 0, mt = 0, mr = 0, mb = 0;
				if (m) {
					ml = m[0];
					mt = m[1];
					mr = m[2];
					mb = m[3];
				}
				width -= mr;
				height -= mb;
				if (width <= ml || height <= mt)
					return;
				setTexture(tex, 0);
				var x = srcRect ? srcRect.left : 0;
				var y = srcRect ? srcRect.top : 0;
				var r = x + (srcRect ? srcRect.width : tex.width - ml - mr);
				var b = y + (srcRect ? srcRect.height : tex.height - mt - mb);
				var sl = s9[0] - ml;
				var st = s9[1] - mt;
				var sr = s9[2] - mr;
				var sb = s9[3] - mb;
				/*var x = -ml;
				var y = -mt;
				var r = tex.width - mr;
				var b = tex.height - mb;*/

				var xPos = [ml];
				var yPos = [mt];
				var uPos = [x];
				var vPos = [y];
				if (sl > 0) {
					var w = Math.min(width, sl);
					xPos.push(w);
					uPos.push(x + w);
				}
				if (st > 0) {
					var h = Math.min(height, st);
					yPos.push(h);
					vPos.push(y + h);
				}
				if (sr > 0 && width > sl) {
					xPos.push(width - sr);
					uPos.push(r - sr);
				}
				if (sb > 0 && height > st) {
					yPos.push(height - sb);
					vPos.push(b - sb);
				}
				if (sl + sr < width) {
					xPos.push(width);
					uPos.push(r);
				}
				if (st + sb < height) {
					yPos.push(height);
					vPos.push(b);
				}

				for (i = 0; i < uPos.length; i++)
					uPos[i] *= tex.invWidth;
				for (i = 0; i < vPos.length; i++)
					vPos[i] *= tex.invHeight;

				var cnt = xPos.length;
				for (i = 0; i < yPos.length - 1; i++) {
					for (j = 0; j < cnt - 1; j++) {
						ezasm.renderScaleTranslateTrans(xPos[j + 1] - xPos[j], yPos[i + 1] - yPos[i], xPos[j], yPos[i], trans);
						ezasm.setUV(uPos[j], vPos[i], uPos[j + 1] - uPos[j], vPos[i + 1] - vPos[i]);
						addQuad(QuadFlag.uvColor);
						//var q = quads;
					}
				}
			}
			function setBlendCmd(blendMode) {
				//recorderDebug.push(`setBlendCmd ${blendMode}`);
				return function () {
					currBlendMode = blendMode;
					setBlend(blendMode);
				}
			}
			RC.setAlphaBlend = function (value: number, blendMode: BlendMode) {
				ezasm.setOpacity(value);
				if (currBlendMode != blendMode) {
					RC.flush();
					if (PROFILING && profile) {
						profile.blendChange++;
						Profile.addCommand("set blendMode " + BlendMode[blendMode]);
					}
					currBlendMode = blendMode;
					setBlend(blendMode);
					if (recorder)
						recorder.push(setBlendCmd(blendMode));
				}
			}

			RC.setFillColor = function (color: string) {
				if (fillColorStr != color) {
					fillColorStr = color;
					var c;
					if (color[0] == "#") {
						var s = color.substring(1);
						if (s.length == 3)
							s = s[0] + "0" + s[1] + "0" + s[2] + "0";
						c = parseInt(s, 16);
					}
					else
						c = parseInt(fillColorStr);
					var b = (c & 0xff) * 0.00392156862745;
					var g = (c & 0xff00) * 1.5259021e-5;
					var r = (c & 0xff0000) * 5.960555428e-8;
					ezasm.setFillColor(r, g, b);
				}
			}
			function setFillGradientCmd(b) {
				//recorderDebug.push(` setFillGradientCmd `);
				var data = new Uint8Array(16 * 4);
				data.set(b);
				return function () {
					setTexture(gradTex, 0);
					gl.texSubImage2D(GL.TEXTURE_2D, 0, 0, 0, 16, 1, GL.RGBA, GL.UNSIGNED_BYTE, data);
				}
			}
			RC.setFillGradient = function (grad: GradientFill) {
				RC.flush();
				currGrad = grad;
				var b = gradBuffer;
				var colors = grad.colors;
				for (var i = 0; i < colors.length; i++) {
					var s = colors[i].substring(1);
					if (s.length == 3)
						s = s[0] + '0' + s[1] + '0' + s[2] + '0';
					var c = parseInt(s, 16);
					b[i * 4] = (c & 0xff0000) >> 16;
					b[i * 4 + 1] = (c & 0xff00) >> 8;
					b[i * 4 + 2] = c & 0xff;
					b[i * 4 + 3] = s.length > 6 ? (c >> 24) & 0xff : 0xff;
				}
				for (i = colors.length; i < 16; i++) {
					var j = i * 4;
					b[j] = b[j - 4];
					b[j + 1] = b[j - 3];
					b[j + 2] = b[j - 2];
					b[j + 3] = b[j - 1];
				}
				setTexture(gradTex, 0);
				gl.texSubImage2D(GL.TEXTURE_2D, 0, 0, 0, 16, 1, GL.RGBA, GL.UNSIGNED_BYTE, b);
				if (recorder)
					recorder.push(setFillGradientCmd(b));
			}

			function clipCmd(clip) {
				//recorderDebug.push(`clipCmd `);
				return function () {
					gl.scissor((clip.left * RC.scale) | 0, ((rtHeight - clip.bottom) * RC.scale) | 0, (clip.width * RC.scale) | 0, (clip.height * RC.scale) | 0);
				}
			}
			RC.pushClipRect = function (bound: Rect) {
				RC.flush();
				var clip = bound.clone();
				if (PROFILING && profile) {
					profile.setClip++;
					Profile.addCommand(`pushClipRect [${clip.left}, ${clip.top}, ${clip.width}, ${clip.height}]`);
				}
				currClip = scissors[scissors.length - 1];
				clip.left = Math.max(clip.left, currClip.left);
				clip.top = Math.max(clip.top, currClip.top);
				clip.width = Math.max(0, Math.min(clip.right, currClip.right) - clip.left);
				clip.height = Math.max(0, Math.min(clip.bottom, currClip.bottom) - clip.top);
				if (recorder)
					recorder.push(clipCmd(clip));
				scissors.push(clip);
				gl.scissor((clip.left * RC.scale) | 0, ((rtHeight - clip.bottom) * RC.scale) | 0, (clip.width * RC.scale) | 0, (clip.height * RC.scale) | 0);
				return clip.width > 0 && clip.height > 0;
			}

			RC.popClipRect = function () {
				RC.flush();
				scissors.pop();
				currClip = scissors[scissors.length - 1];
				if (PROFILING && profile) {
					profile.setClip++;
					Profile.addCommand(`popClipRect [${currClip.left}, ${currClip.top}, ${currClip.width}, ${currClip.height}]`);
				}
				if (recorder)
					recorder.push(clipCmd(currClip));
				gl.scissor((currClip.left * RC.scale) | 0, ((rtHeight - currClip.bottom) * RC.scale) | 0, (currClip.width * RC.scale) | 0, (currClip.height * RC.scale) | 0);
			}
			function setShaderCmd(shader:Shader) {
				//recorderDebug.push(`setShaderCmd ${shader.name}`);
				return function () {
					gl.useProgram(shader.proc);
					currShader = shader;
				}
			}
			function setShaderParams(shader, params) {
				var unis = shader.uniforms;
				for (var k in unis) {
					var v = params[k];
					if (v !== undefined) {
						if (shader.texUniforms && shader.texUniforms[k]) {
							var idx = shader.texUniforms[k];
							shader.bind(k, idx);
							if (typeof (v) == "string")
								v = getRes<Texture>(v);
							if (v.getData().ready)
								RC.bindTexture(v.getData(), idx);
							else {
								v.load();
								RC.bindTexture(defTex, idx);
							}
						}
						else
							shader.bind(k, params[k]);
					}
				}
			}
			function setShaderParamsCmd(shader, params) {
				//recorderDebug.push(`setShaderParamsCmd ${shader.name}`);
				return function () {
					setShaderParams(shader, params);
				}
			}
			RC.setShader = function (shader: Shader, params?: any) {
				if(!shader)
					shader = Effect.default;
				if (shader !== currShader) {
					RC.flush();
					if (PROFILING && profile) {
						Profile.addCommand(`setShader ${shader.name}`);
						profile.setShader++;
					}
					gl.useProgram(shader.proc);
					currShader = shader;
					if (recorder)
						recorder.push(setShaderCmd(shader));
				}
				if (params) {
					RC.flush();
					if (recorder)
						recorder.push(setShaderParamsCmd(shader, params));
					setShaderParams(shader, params);
				}
			}

			function setTextureCmd(tex, idx) {
				//recorderDebug.push(`setTextureCmd ${tex.name} ${idx}`);
				return function () {
					tex.bindTexture(idx);
					currTex[idx] = tex.id;
				}
			}
			RC.bindTexture = function bindTexture(tex: Texture, idx: number) {
				setTexture(tex, idx);
			}

			RC.drawTextCache = function (x: number, y: number, cache: any, trans: Handle) {
				var r = cache.region;
				setTexture(fontTex, 0);
				ezasm.renderScaleTranslateTrans(cache.w, cache.h, x, y, trans);
				ezasm.setUV(r[0], r[1], r[2], r[3]);
				addQuad(QuadFlag.UV);
			}

			RC.begin3DRender = function (bound?: Rect): IRenderContext3D {
				if (PROFILING && profile)
					Profile.addCommand("begin3DRender");
				RC.flush();
				gl.disable(GL.BLEND);
				gl.enable(GL.CULL_FACE);
				gl.enable(GL.DEPTH_TEST);
				if (bound)
					gl.viewport((bound.left * RC.scale) | 0, ((rtHeight - bound.bottom) * RC.scale) | 0, (bound.width * RC.scale) | 0, (bound.height * RC.scale) | 0);
				if (VAOExt)
					VAOExt.bindVertexArrayOES(null);

				if (recorder)
					recorder = null;

				return {
					width: rtWidth,
					height: rtHeight,
					gl: gl,
					profiler: profile,
					shader: null,
					setShader: function (shader: Shader) {
						if (this.shader != shader) {
							if (PROFILING && profile) {
								Profile.addCommand(`setShader ${shader.name}`);
								profile.setShader++;
							}
							shader.clearCache();
							gl.useProgram(shader.proc);
							this.shader = shader;
						}
					},
					defTexture: defTex3d,
					bindTexture: function (tex: Texture, idx: number) {
						setTexture3d(tex, idx);
					},
					bindCubeTexture: function (tex: RawTexture, idx: number) {
						currTex[idx] = "_cube";
						gl.activeTexture(GL.TEXTURE0 + idx);
						gl.bindTexture(GL.TEXTURE_CUBE_MAP, tex.glTex);
					},
					lastPrimitive: 0,
					end: function () {
						gl.enable(GL.BLEND);
						gl.disable(GL.CULL_FACE);
						//gl.enable(GL.SCISSOR_TEST);
						gl.disable(GL.SAMPLE_ALPHA_TO_COVERAGE);
						gl.disable(GL.DEPTH_TEST);
						setBlend(currBlendMode);
						currShader = null;
						vaoBinded = false;
						if (PROFILING && profile)
							Profile.addCommand("end3drender");
						if (bound)
							gl.viewport(0, 0, (rtWidth * RC.scale) | 0, (rtHeight * RC.scale) | 0);
					}
				}
			}

			RC.beginRender = function (target: RenderTexture, profileData?: WGLPerFrameProfiler) {
				FontCache.updateFontTexture(gl, fontTex, profileData);
				RC.profile = profileData;
				RC.width = rtWidth = target.width;
				RC.height = rtHeight = target.height;
				RC.invWidth = 2 / rtWidth;
				RC.invHeight = -2 / rtHeight;
				RC.scale = target.scale;
				ezasm.setFrameBufferSize(target.width, target.height);
				profile = <WGLPerFrameProfiler>profileData;
				gl.bindFramebuffer(GL.FRAMEBUFFER, target.framebuffer);
				gl.clear(GL.COLOR_BUFFER_BIT);
				gl.viewport(0, 0, (rtWidth * RC.scale) | 0, (rtHeight * RC.scale) | 0);
				gl.scissor(0, 0, (rtWidth * RC.scale) | 0, (rtHeight * RC.scale) | 0);

				currShader = null;
				currClip = new Rect(0, 0, rtWidth, rtHeight);
				currTex = [];
				currQuad = 0;
				scissors = [currClip];
				vaoBinded = false;
			}

			RC.endRender = function () {
				RC.flush();
				if (VAOExt)
					VAOExt.bindVertexArrayOES(null);
				profile = null;
				if (recorder) {
					Log.error("missing end recorder.");
					recorder = null;
				}
				Texture.addTextureAge();
			}

			RC.beginRecorder = function () {
				RC.flush();
				if (recorder)
					return false;
				recorder = [];
				currTex = [];
				return true;
			}

			RC.endRecorder = function (): Object {
				RC.flush();
				var r = <any>recorder;
				if (r)
					r.fontRev = FontCache.rev;
				recorder = null;
				return r;
			}

			RC.replay = function (r: Object) {
				RC.flush();
				var cmds = <Function[]>r;
				if (recorder)
					recorder = recorder.concat(cmds);
				for (let i = 0; i < cmds.length; i++)
					cmds[i]();
			}
		}
	}
}
