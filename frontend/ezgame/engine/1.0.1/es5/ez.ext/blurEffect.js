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
    var fs = "\nprecision mediump float;\nuniform float PixelSize;\nuniform sampler2D texture0;\nuniform float BlendWeights[LENGTH];\nvarying vec2 v_tc;\n\nvoid main(){\n\tvec4 color = vec4(0.0);\n\tfor(int i = 0; i < LENGTH; i++){\n#ifdef HORIZENTAL\n\t\tfloat p = v_tc.x + float(i - OFFSET) * PixelSize;\n\t\tp = abs(p);\n\t\tp = min(2.0 - p, p);\n\t\tvec2 uv = vec2(p, v_tc.y);\n#else\n\t\tfloat p = v_tc.y + float(i - OFFSET) * PixelSize;\n\t\tp = abs(p);\n\t\tp = min(2.0 - p, p);\n\t\tvec2 uv = vec2(v_tc.x, p);\n#endif\n\t\tcolor += texture2D(texture0, uv) * BlendWeights[i];\n\t}\n\tgl_FragColor = color;\n}";
    function getEffect(horn, radius) {
        var name = "blur_" + (horn ? 'h' : 'v') + radius;
        if (ez.Effect.has(name))
            return ez.Effect.get(name);
        var define = "";
        if (horn)
            define += "#define HORIZENTAL\n";
        define += "#define OFFSET " + radius + "\n";
        define += "#define LENGTH " + (radius * 2 + 1) + "\n";
        var gl = ez.getGL();
        ez.Effect.register(name, new ez.Effect(define + fs, { PixelSize: gl.uniform1f, BlendWeights: gl.uniform1fv }));
        return ez.Effect.get(name);
    }
    var BlurStageSprite = (function (_super) {
        __extends(BlurStageSprite, _super);
        function BlurStageSprite(parent, id) {
            var _this = _super.call(this, parent, id) || this;
            _this.width = _this.height = 1;
            _this.radius = 0;
            return _this;
        }
        BlurStageSprite.prototype.getType = function () {
            return BlurStageSprite.Type;
        };
        Object.defineProperty(BlurStageSprite.prototype, "radius", {
            get: function () {
                return this._radius;
            },
            set: function (val) {
                if (val === this._radius)
                    return;
                this._radius = val;
                if (val <= 0)
                    return;
                var sigma = val * 0.5;
                val = val | 0;
                var length = val * 2 + 1;
                this._blendWeights = new Float32Array(length);
                var p1 = 1 / (Math.sqrt(2 * Math.PI) * sigma);
                var p2 = 1 / (2 * sigma * sigma);
                var sum = 0;
                for (var i = 0; i < length; i++) {
                    var t = (i - val);
                    this._blendWeights[i] = p1 * Math.exp(-t * t * p2);
                    sum += this._blendWeights[i];
                }
                sum = 1 / sum;
                for (i = 0; i < length; i++)
                    this._blendWeights[i] *= sum;
                this._hornShader = getEffect(true, val);
                this._vertShader = getEffect(false, val);
                this._hornShader.bind("BlendWeights", this._blendWeights);
                this._vertShader.bind("BlendWeights", this._blendWeights);
                this.setDirty();
            },
            enumerable: true,
            configurable: true
        });
        BlurStageSprite.prototype.preRender = function (profile) {
            if (!this._rtBuffer) {
                this._rtBuffer = ez.RenderTexture.create(this.width, this.height);
                this._tmpBuffer = ez.RenderTexture.create(this.width, this.height);
            }
            if (this.dirty) {
                _super.prototype.preRender.call(this);
                if (this.radius <= 0)
                    return;
                ez.Profile.addCommand("blur effect");
                var rc = ez.RenderContext;
                rc.beginRender(this._tmpBuffer, rc.profile);
                rc.setFillColor("#ffffff");
                rc.setShader(this._hornShader);
                this._hornShader.bind("PixelSize", 1 / this.width);
                ez.RenderContext.drawImage(this._rtBuffer, 0, this.width, this.height);
                ez.RenderContext.endRender();
                rc.beginRender(this._rtBuffer, rc.profile);
                rc.setShader(this._vertShader);
                this._vertShader.bind("PixelSize", 1 / this.width);
                rc.drawImage(this._tmpBuffer, 0, this.width, this.height);
                rc.endRender();
            }
        };
        BlurStageSprite.prototype.destroyBuffer = function () {
            if (this._rtBuffer) {
                this._rtBuffer.dispose();
                this._rtBuffer = null;
                this._tmpBuffer.dispose();
                this._tmpBuffer = null;
            }
        };
        Object.defineProperty(BlurStageSprite.prototype, "ownerBuffer", {
            get: function () { return true; },
            set: function (val) { },
            enumerable: true,
            configurable: true
        });
        BlurStageSprite.Type = "BlurStage";
        return BlurStageSprite;
    }(ez.SubStageSprite));
    ez.BlurStageSprite = BlurStageSprite;
    ez.Sprite.register(BlurStageSprite.Type, function (p, id) { return new BlurStageSprite(p, id); });
    var ui;
    (function (ui) {
        var BlurGroup = (function (_super) {
            __extends(BlurGroup, _super);
            function BlurGroup(parent) {
                var _this = _super.call(this, parent, new BlurStageSprite(parent._displayStage)) || this;
                _this._init(BlurGroup);
                _this.bind("radius", _this._stage);
                return _this;
            }
            BlurGroup.prototype.setChilds = function (data) {
                this.clearChilds();
                this._setChilds(data);
            };
            BlurGroup.ClassName = "BlurGroup";
            BlurGroup.Properties = [
                { name: "radius", default: 0, type: "number", converter: parseFloat }
            ];
            BlurGroup.HasChildElements = true;
            return BlurGroup;
        }(ui.Container));
        ui.BlurGroup = BlurGroup;
        ui.initUIClass(BlurGroup, ui.Container);
    })(ui = ez.ui || (ez.ui = {}));
})(ez || (ez = {}));

//# sourceMappingURL=blurEffect.js.map
