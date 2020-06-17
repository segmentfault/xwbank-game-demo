module ez.effect {
	var fs = `
	precision mediump float;
	uniform sampler2D texture0;
	uniform float acos;
	uniform vec2 dir;
	varying vec2 v_tc;
	varying vec2 v_pos;
	varying vec4 v_color;
	void main(){
		vec4 col = texture2D(texture0, v_tc) * v_color;
		vec2 p = normalize(v_pos - vec2(0.5, 0.5));
		float c = dot(dir, p);
		float a = step(c, acos);
		float s = p.y * dir.x - p.x * dir.y;
		gl_FragColor = col * step(c * step(0.0, s) + (-2.0 - c) * step(s, 0.0), acos);
	}`;

	function initEffect() {
		var gl = getGL();
		Effect.register("fanmask", new Effect(fs, {
			acos: gl.uniform1f,
			dir: gl.uniform2fv
		}));
	}

	var defDir = [0, -1];

	/**
	 * 使用一个扇形蒙板剪切目标对象
	 * @remark 可用于冷却倒计时特效
	 * @param target 目标对象，可以是image,rectfill等可视对象
	 * @param angle  扇形角度(0~360)
	 * @param dir 初始剪切方向，默认为(0,-1) 12点方向
	 */
	export function fanMask(target: Sprite | ui.Visual, angle: number, dir?: ez.Number2) {
		if (!Effect.has("fanmask"))
			initEffect();
		target.effect = "fanmask";
		angle = angle * Math.PI / 180;
		target.effectParams = { dir: dir || defDir, acos: angle > Math.PI ? -2 - Math.cos(angle) : Math.cos(angle) };
	}
}