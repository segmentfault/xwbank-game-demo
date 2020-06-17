/// <reference path="Shader.ts"/>
/**
 * @module Renderer
*/
namespace ez {
	var gl: WebGLRenderingContext = null;
	var defUniforms;
	function defaultUniform(uniforms?: Dictionary<(loc: WebGLUniformLocation, ...args: any[]) => void>){
		if (!uniforms)
			uniforms = defUniforms;
		else
			uniforms.quads = defUniforms.quads;
		return uniforms;
	}
	/**
	* 2d渲染特效
	*/
	export class Effect extends Shader {
		/**
		 * 默认2D四边形绘制的vertex shader
		 */
		static DefVS2D: string;
		/**
		 * 默认2D绘制Fragment shader
		 */
		static DefFS2D: string;

		static default: Effect;

		public constructor(fsCode: string, uniforms?: Dictionary<(loc: WebGLUniformLocation, ...args: any[]) => void>, textures?: string[]){
			super(Effect.DefVS2D, fsCode, ["pos", "quad"], defaultUniform(uniforms), textures);
		}

		private static lib = {};
		/**
		 * 注册effect
		 * @param name effect名
		 * @param shader shader对象
		 */
		public static register(name: string, effect: Effect) {
			effect.name = name;
			Effect.lib[name] = effect;
		}
		/**
		 * 是否有该effect
		 * @param name
		 */
		public static has(name: string) {
			return !name || !!Effect.lib[name];
		}
		/**
		 * 获取effect
		 * @param name
		 */
		public static get(name: string): Effect {
			if(!name)
				return Effect.default;
			if (!Effect.lib[name]) {
				Log.error(`effect ${name} is not exist!`);
				return Effect.default;
			}
			return Effect.lib[name];
		}
	}

	Effect.DefVS2D = `
#define MAX_QUAD 30
attribute vec2 pos;
attribute float quad;
uniform vec4 quads[MAX_QUAD * 4];
varying vec2 v_tc;
varying vec2 v_pos;
varying vec4 v_color;

void main(){
	int idx = int(quad) * 4;
	vec4 p0 = quads[idx];
	vec4 p1 = quads[idx + 1];
	vec4 p2 = quads[idx + 2];
	vec4 p3 = quads[idx + 3];
	gl_Position = vec4(pos.x * p0.x + pos.y * p0.z + p1.x - 1.0, pos.x * p0.y + pos.y * p0.w + p1.y + 1.0, 0.0, 1.0);
	v_tc = vec2(pos.x * p2.x + pos.y * p2.z + p1.z, pos.x * p2.y + pos.y * p2.w + p1.w);
	v_pos = pos;
	v_color = p3;
}`;
	Effect.DefFS2D = `
precision mediump float;
uniform sampler2D texture0;
varying vec2 v_tc;
varying vec4 v_color;
void main(void){
	vec4 col = texture2D(texture0, v_tc);
	gl_FragColor = col * v_color;
}`;

	initCall(function(){
		if(!useWGL)
			return;

		var tiling = `
precision mediump float;
uniform sampler2D texture0;
uniform vec4 tiling;
varying vec2 v_tc;
varying vec4 v_color;
void main(void){
	vec4 col = texture2D(texture0, fract(v_tc) * tiling.zw + tiling.xy);
	gl_FragColor = col * v_color;
}`;
		var mono = `
precision mediump float;
uniform sampler2D texture0;
varying vec2 v_tc;
varying vec4 v_color;
void main(void){
	vec4 col = texture2D(texture0, v_tc);
	float l = col.r * 0.3 + col.g * 0.6 + col.b * 0.1;
	gl_FragColor = vec4(l,l,l,col.a) * v_color;
}`;
		var mask = `
precision mediump float;
uniform sampler2D texture0;
uniform sampler2D mask;
varying vec2 v_tc;
varying vec2 v_pos;
varying vec4 v_color;
void main(void){
	vec4 col = texture2D(texture0, v_tc) * texture2D(mask, v_pos);
	gl_FragColor = col * v_color;
}`;
		gl = getGL();
		defUniforms = { quads: gl.uniform4fv };
		Effect.default = new Effect(Effect.DefFS2D);
		Effect.register("default", Effect.default);
		Effect.register("tiling", new Effect(tiling));
		Effect.register("mono", new Effect(mono));
		Effect.register("mask", new Effect(mask, null, ["mask"]));
	}, true);
}