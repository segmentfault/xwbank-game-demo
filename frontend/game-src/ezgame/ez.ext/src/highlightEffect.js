var ez;
(function (ez) {
    var effect;
    (function (effect) {
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
        function registerShader() {
            var gl = ez.getGL();
            ez.Shader.register("highlight", new ez.Shader(ez.Shader.DefVS2D, fs, ["pos", "quad"], {
                texture0: gl.uniform1i,
                quads: gl.uniform4fv,
                offset: gl.uniform1f,
                width: gl.uniform1f,
                acos: gl.uniform1f,
                asin: gl.uniform1f,
                color: gl.uniform3fv
            }));
        }
        ;
        function highlight(target, color, width, angle, duration, interval, loop, range) {
            if (!ez.Shader.has("highlight"))
                registerShader();
            loop = loop || 0;
            range = range || [0, 1];
            var params = {
                offset: 0,
                width: width,
                acos: Math.cos(angle * ez.Matrix.Deg2Rad),
                asin: Math.sin(angle * ez.Matrix.Deg2Rad),
                color: color.toVec3()
            };
            target.effectParams = params;
            var time = 0;
            var ticker;
            var wait = 0;
            ticker = ez.addTicker(dt => {
                if (target.disposed) {
                    ez.removeTicker(ticker);
                    return;
                }
                if (wait > 0) {
                    wait -= dt;
                    return;
                }
                target.effect = "highlight";
                time += dt;
                if (time > duration) {
                    loop--;
                    if (loop == 0) {
                        target.effect = null;
                        ez.removeTicker(ticker);
                        return;
                    }
                    if (interval > 0) {
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
        effect.highlight = highlight;
    })(effect = ez.effect || (ez.effect = {}));
})(ez || (ez = {}));
//# sourceMappingURL=highlightEffect.js.map