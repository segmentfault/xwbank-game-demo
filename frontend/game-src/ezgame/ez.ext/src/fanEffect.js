var ez;
(function (ez) {
    var effect;
    (function (effect) {
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
        function registerShader() {
            var gl = ez.getGL();
            ez.Shader.register("fanmask", new ez.Shader(ez.Shader.DefVS2D, fs, ["pos", "quad"], {
                quads: gl.uniform4fv,
                acos: gl.uniform1f,
                dir: gl.uniform2fv
            }));
        }
        var defDir = [0, -1];
        function fanMask(target, angle, dir) {
            if (!ez.Shader.has("fanmask"))
                registerShader();
            angle = angle * Math.PI / 180;
            target.effectParams = { dir: dir || defDir, acos: angle > Math.PI ? -2 - Math.cos(angle) : Math.cos(angle) };
        }
        effect.fanMask = fanMask;
    })(effect = ez.effect || (ez.effect = {}));
})(ez || (ez = {}));
//# sourceMappingURL=fanEffect.js.map