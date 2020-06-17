var ez;
(function (ez) {
    var effect;
    (function (effect) {
        var fs = "\n\tprecision mediump float;\n\tuniform sampler2D texture0;\n\tuniform float acos;\n\tuniform vec2 dir;\n\tvarying vec2 v_tc;\n\tvarying vec2 v_pos;\n\tvarying vec4 v_color;\n\tvoid main(){\n\t\tvec4 col = texture2D(texture0, v_tc) * v_color;\n\t\tvec2 p = normalize(v_pos - vec2(0.5, 0.5));\n\t\tfloat c = dot(dir, p);\n\t\tfloat a = step(c, acos);\n\t\tfloat s = p.y * dir.x - p.x * dir.y;\n\t\tgl_FragColor = col * step(c * step(0.0, s) + (-2.0 - c) * step(s, 0.0), acos);\n\t}";
        function initEffect() {
            var gl = ez.getGL();
            ez.Effect.register("fanmask", new ez.Effect(fs, {
                acos: gl.uniform1f,
                dir: gl.uniform2fv
            }));
        }
        var defDir = [0, -1];
        function fanMask(target, angle, dir) {
            if (!ez.Effect.has("fanmask"))
                initEffect();
            target.effect = "fanmask";
            angle = angle * Math.PI / 180;
            target.effectParams = { dir: dir || defDir, acos: angle > Math.PI ? -2 - Math.cos(angle) : Math.cos(angle) };
        }
        effect.fanMask = fanMask;
    })(effect = ez.effect || (ez.effect = {}));
})(ez || (ez = {}));

//# sourceMappingURL=fanEffect.js.map
