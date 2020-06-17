var ez;
(function (ez) {
    var fs = `
precision mediump float;
uniform float PixelSize;
uniform sampler2D texture0;
uniform float BlendWeights[LENGTH];
varying vec2 v_tc;

void main(){
	vec4 color = vec4(0.0);
	for(int i = 0; i < LENGTH; i++){
#ifdef HORIZENTAL
		float p = v_tc.x + float(i - OFFSET) * PixelSize;
		p = abs(p);
		p = min(2.0 - p, p);
		vec2 uv = vec2(p, v_tc.y);
#else
		float p = v_tc.y + float(i - OFFSET) * PixelSize;
		p = abs(p);
		p = min(2.0 - p, p);
		vec2 uv = vec2(v_tc.x, p);
#endif
		color += texture2D(texture0, uv) * BlendWeights[i];
	}
	gl_FragColor = color;
}`;
    function getEffect(horn, radius) {
        var name = `blur_${horn ? 'h' : 'v'}${radius}`;
        if (ez.Effect.has(name))
            return ez.Effect.get(name);
        var define = "";
        if (horn)
            define += "#define HORIZENTAL\n";
        define += `#define OFFSET ${radius}\n`;
        define += `#define LENGTH ${radius * 2 + 1}\n`;
        var gl = ez.getGL();
        ez.Effect.register(name, new ez.Effect(define + fs, { PixelSize: gl.uniform1f, BlendWeights: gl.uniform1fv }));
        return ez.Effect.get(name);
    }
    class BlurStageSprite extends ez.SubStageSprite {
        constructor(parent, id) {
            super(parent, id);
            this.width = this.height = 1;
            this.radius = 0;
        }
        getType() {
            return BlurStageSprite.Type;
        }
        get radius() {
            return this._radius;
        }
        set radius(val) {
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
        }
        preRender(profile) {
            if (!this._rtBuffer) {
                this._rtBuffer = ez.RenderTexture.create(this.width, this.height);
                this._tmpBuffer = ez.RenderTexture.create(this.width, this.height);
            }
            if (this.dirty) {
                super.preRender();
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
        }
        destroyBuffer() {
            if (this._rtBuffer) {
                this._rtBuffer.dispose();
                this._rtBuffer = null;
                this._tmpBuffer.dispose();
                this._tmpBuffer = null;
            }
        }
        get ownerBuffer() { return true; }
        set ownerBuffer(val) { }
    }
    BlurStageSprite.Type = "BlurStage";
    ez.BlurStageSprite = BlurStageSprite;
    ez.Sprite.register(BlurStageSprite.Type, (p, id) => new BlurStageSprite(p, id));
    let ui;
    (function (ui) {
        class BlurGroup extends ui.Container {
            constructor(parent) {
                super(parent, new BlurStageSprite(parent._displayStage));
                this._init(BlurGroup);
                this.bind("radius", this._stage);
            }
            setChilds(data) {
                this.clearChilds();
                this._setChilds(data);
            }
        }
        BlurGroup.ClassName = "BlurGroup";
        BlurGroup.Properties = [
            { name: "radius", default: 0, type: "number", converter: parseFloat }
        ];
        BlurGroup.HasChildElements = true;
        ui.BlurGroup = BlurGroup;
        ui.initUIClass(BlurGroup, ui.Container);
    })(ui = ez.ui || (ez.ui = {}));
})(ez || (ez = {}));

//# sourceMappingURL=blurEffect.js.map
