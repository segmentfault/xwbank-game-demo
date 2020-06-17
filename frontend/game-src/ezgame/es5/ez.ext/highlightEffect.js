var ez;
(function (ez) {
    var effect;
    (function (effect) {
        var fs = "\nprecision mediump float;\nuniform sampler2D texture0;\nuniform float offset;\nuniform float width;\nuniform float acos;\nuniform float asin;\nuniform vec3 color;\nvarying vec2 v_tc;\nvarying vec2 v_pos;\nvarying vec4 v_color;\nvoid main(){\n\tvec4 col = texture2D(texture0, v_tc);\n\tfloat flow = 1.0 - (abs(v_pos.x * acos + v_pos.y * asin - offset) / width);\n\tflow = max(flow, 0.0);\n\tcol *= v_color;\n\tcol.rgb += color * flow * col.a;\n\tgl_FragColor = col;\n}";
        function initEffect() {
            var gl = ez.getGL();
            ez.Effect.register("highlight", new ez.Effect(fs, {
                offset: gl.uniform1f,
                width: gl.uniform1f,
                acos: gl.uniform1f,
                asin: gl.uniform1f,
                color: gl.uniform3fv
            }));
        }
        ;
        function highlight(target, color, width, angle, duration, interval, loop, range) {
            if (!ez.Effect.has("highlight"))
                initEffect();
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
            ticker = ez.addTicker(function (dt) {
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
