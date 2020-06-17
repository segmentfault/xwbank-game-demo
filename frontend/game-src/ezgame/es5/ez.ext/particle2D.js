var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ez;
(function (ez) {
    var singleVS = "\nattribute vec2 pos;\nattribute float quad;\nuniform vec4 tc;\t//xoff,yoff,width,height\nuniform float t[8];\t//mat2d,width,height\nuniform vec4 quads[MAX_QUAD * 2];//x,y,angle,size,color\nvarying vec2 v_tc;\nvarying vec2 v_pos;\nvarying vec4 v_color;\n\nvoid main(){\n\tint idx = int(quad) * 2;\n\tvec4 p0 = quads[idx];\n\tfloat c = cos(p0.z) * p0.w;\n\tfloat s = sin(p0.z) * p0.w;\n\tv_tc = vec2(pos.x * tc.z + tc.x, pos.y * tc.w + tc.y);\n\tpos -= vec2(0.5, 0.5);\n\tfloat x = pos.x * t[6] * c - pos.y * t[7] * s + p0.x;\n\tfloat y = pos.x * t[6] * s + pos.y * t[7] * c + p0.y;\n\tgl_Position = vec4(x * t[0] + y * t[2] + t[4] - 1.0, x * t[1] + y * t[3] + t[5] + 1.0, 0.0, 1.0);\t\n\tv_pos = pos;\n\tv_color = quads[idx + 1];\n}";
    var framesVS = "\nattribute vec2 pos;\nattribute float quad;\nuniform float t[8];\nuniform vec4 tc;\t//uoff,voff,width,height\nuniform vec4 quads[MAX_QUAD * 2];\nuniform vec2 frames[MAX_QUAD]; //uoff,voff\nvarying vec2 v_tc;\nvarying vec2 v_pos;\nvarying vec4 v_color;\nvoid main(){\n\tint idx = int(quad) * 2;\n\tvec4 p0 = quads[idx];\n\tvec2 frame = frames[int(quad)];\n\tfloat c = cos(p0.z) * p0.w;\n\tfloat s = sin(p0.z) * p0.w;\n\tv_tc = vec2(pos.x * tc.z + frame.x + tc.x, pos.y * tc.w + frame.y + tc.y);\n\tpos -= vec2(0.5, 0.5);\n\tfloat x = pos.x * t[6] * c - pos.y * t[7] * s + p0.x;\n\tfloat y = pos.x * t[6] * s + pos.y * t[7] * c + p0.y;\n\tgl_Position = vec4(x * t[0] + y * t[2] + t[4] - 1.0, x * t[1] + y * t[3] + t[5] + 1.0, 0.0, 1.0);\n\tv_pos = pos;\n\tv_color = quads[idx + 1];\n}";
    var MaxQuads;
    var MaxFramesQuads;
    function getShader(frames) {
        var gl = ez.getGL();
        if (!MaxQuads) {
            var limit = gl.getParameter(36347);
            MaxQuads = Math.min(128, (limit - 3) >> 1);
            MaxFramesQuads = Math.min(128, ((limit - 2) / 3) | 0);
        }
        if (frames) {
            var name = "particle2d_Seq";
            if (ez.Effect.has(name))
                return ez.Effect.get(name);
            ez.Effect.register(name, new ez.Shader("#define MAX_QUAD " + MaxFramesQuads + "\n" + framesVS, ez.Effect.DefFS2D, ["pos", "quad"], { texture0: gl.uniform1i, quads: gl.uniform4fv, t: gl.uniform1fv }));
            return ez.Effect.get(name);
        }
        else {
            var name = "particle2d";
            if (ez.Effect.has(name))
                return ez.Effect.get(name);
            ez.Effect.register(name, new ez.Shader("#define MAX_QUAD " + MaxFramesQuads + "\n" + singleVS, ez.Effect.DefFS2D, ["pos", "quad"], { texture0: gl.uniform1i, quads: gl.uniform4fv, t: gl.uniform1fv }));
            return ez.Effect.get(name);
        }
    }
    var ParticleSprite = (function (_super) {
        __extends(ParticleSprite, _super);
        function ParticleSprite(stage, id) {
            return _super.call(this, stage, id) || this;
        }
        ParticleSprite.prototype._draw = function (rc, opacity) {
        };
        ParticleSprite.prototype.getType = function () {
            return ParticleSprite.Type;
        };
        ParticleSprite.Type = "Particle";
        return ParticleSprite;
    }(ez.Sprite));
    ez.ParticleSprite = ParticleSprite;
})(ez || (ez = {}));

//# sourceMappingURL=particle2D.js.map
