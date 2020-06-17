namespace ez.effect {
	var fs = `
precision mediump float;
uniform sampler2D texture0;
uniform float offset;
uniform float width;
uniform float acos;
uniform float asin;
uniform vec3 color;
varying vec2 v_tc;
varying vec2 v_pos;
varying vec4 v_color;
void main(){
	vec4 col = texture2D(texture0, v_tc);
	float flow = 1.0 - (abs(v_pos.x * acos + v_pos.y * asin - offset) / width);
	flow = max(flow, 0.0);
	col *= v_color;
	col.rgb += color * flow * col.a;
	gl_FragColor = col;
}`;
	function initEffect() {
		var gl = getGL();
		Effect.register("highlight", new Effect(fs, {
			offset: gl.uniform1f,
			width: gl.uniform1f,
			acos: gl.uniform1f,
			asin: gl.uniform1f,
			color: gl.uniform3fv
		}));
	};

	/**
	 * 添加流动的高光效果
	 * @param target: 目标对象
	 * @param color: 光照颜色
	 * @param width: 宽度百分比(0~1)
	 * @param angle: 角度
	 * @param duration: 效果持续时间(ms)
	 * @param interval: 效果间隔时间(ms)
	 * @param loop: 效果次数，0表示无限循环
	 * @param range: 闪光范围，默认为[0,1]
	 * @returns 返回ticker对象，如果需要手动取消特效则调用ez.removeTicker(ticker)，否则将在对象dispose时自动取消
	 */
	export function highlight(target: ui.Visual | Sprite, color: Color,
		width: number, angle: number, duration: number, interval: number, loop?: number, range?: [number, number]): Object {
		if (!Effect.has("highlight"))
			initEffect();
		loop = loop || 0;
		range = range || [0, 1];
		var params = {
			offset: 0,
			width: width,
			acos: Math.cos(angle * Matrix.Deg2Rad),
			asin: Math.sin(angle * Matrix.Deg2Rad),
			color: color.toVec3()
		};
		target.effectParams = params;
		var time = 0;
		var ticker;
		var wait = 0;
		ticker = addTicker(dt => {
			if(target.disposed) {
				removeTicker(ticker);
				return;
			}
			if(wait > 0) {
				wait -= dt;
				return;
			}
			target.effect = "highlight";
			time += dt;
			if(time > duration) {
				loop--;
				if(loop == 0) {
					target.effect = null;
					removeTicker(ticker);
					return;
				}
				if(interval > 0) {
					wait = interval;
					target.effect = null;
				}
				time = 0;
			}
			params.offset = range[0] + (range[1] - range[0]) * time / duration;
			target.effectParams = params;
		});
		return ticker;
	}
}