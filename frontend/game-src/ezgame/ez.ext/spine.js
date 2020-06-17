var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var spasm;
var spine;
(function (spine) {
    class TextureAtlas {
        constructor(atlasText, textureLoader) {
            this.pages = new Array();
            this.regions = {};
            if (textureLoader == null)
                throw new Error("textureLoader cannot be null.");
            let reader = new TextureAtlasReader(atlasText);
            let tuple = new Array(4);
            let page = null;
            while (true) {
                let line = reader.readLine();
                if (line == null)
                    break;
                line = line.trim();
                if (line.length == 0)
                    page = null;
                else if (!page) {
                    page = new TextureAtlasPage();
                    page.name = line;
                    if (reader.readTuple(tuple) == 2) {
                        page.width = parseInt(tuple[0]);
                        page.height = parseInt(tuple[1]);
                        reader.readTuple(tuple);
                    }
                    reader.readTuple(tuple);
                    let direction = reader.readValue();
                    page.texture = textureLoader(line);
                    page.width = page.texture.width;
                    page.height = page.texture.height;
                    this.pages.push(page);
                }
                else {
                    let region = new TextureAtlasRegion();
                    region.name = line;
                    region.page = page;
                    let rotateValue = reader.readValue();
                    if (rotateValue.toLocaleLowerCase() == "true") {
                        region.degrees = 90;
                    }
                    else if (rotateValue.toLocaleLowerCase() == "false") {
                        region.degrees = 0;
                    }
                    else {
                        region.degrees = parseFloat(rotateValue);
                    }
                    region.rotate = region.degrees == 90;
                    reader.readTuple(tuple);
                    let x = parseInt(tuple[0]);
                    let y = parseInt(tuple[1]);
                    reader.readTuple(tuple);
                    let width = parseInt(tuple[0]);
                    let height = parseInt(tuple[1]);
                    region.u = x / page.width;
                    region.v = y / page.height;
                    if (region.rotate) {
                        region.u2 = (x + height) / page.width;
                        region.v2 = (y + width) / page.height;
                    }
                    else {
                        region.u2 = (x + width) / page.width;
                        region.v2 = (y + height) / page.height;
                    }
                    region.x = x;
                    region.y = y;
                    region.width = Math.abs(width);
                    region.height = Math.abs(height);
                    if (reader.readTuple(tuple) == 4) {
                        if (reader.readTuple(tuple) == 4) {
                            reader.readTuple(tuple);
                        }
                    }
                    region.originalWidth = parseInt(tuple[0]);
                    region.originalHeight = parseInt(tuple[1]);
                    reader.readTuple(tuple);
                    region.offsetX = parseInt(tuple[0]);
                    region.offsetY = parseInt(tuple[1]);
                    region.index = parseInt(reader.readValue());
                    region.renderObject = page.texture;
                    this.regions[region.name] = region;
                }
            }
        }
        findRegion(name) {
            return this.regions[name];
        }
    }
    class TextureAtlasReader {
        constructor(text) {
            this.index = 0;
            this.lines = text.split(/\r\n|\r|\n/);
        }
        readLine() {
            if (this.index >= this.lines.length)
                return null;
            return this.lines[this.index++];
        }
        readValue() {
            let line = this.readLine();
            let colon = line.indexOf(":");
            if (colon == -1)
                throw new Error("Invalid line: " + line);
            return line.substring(colon + 1).trim();
        }
        readTuple(tuple) {
            let line = this.readLine();
            let colon = line.indexOf(":");
            if (colon == -1)
                throw new Error("Invalid line: " + line);
            let i = 0, lastMatch = colon + 1;
            for (; i < 3; i++) {
                let comma = line.indexOf(",", lastMatch);
                if (comma == -1)
                    break;
                tuple[i] = line.substr(lastMatch, comma - lastMatch).trim();
                lastMatch = comma + 1;
            }
            tuple[i] = line.substring(lastMatch).trim();
            return i + 1;
        }
    }
    class TextureAtlasPage {
    }
    class TextureAtlasRegion {
        constructor() {
            this.u = 0;
            this.v = 0;
            this.u2 = 0;
            this.v2 = 0;
            this.width = 0;
            this.height = 0;
            this.rotate = false;
            this.offsetX = 0;
            this.offsetY = 0;
            this.originalWidth = 0;
            this.originalHeight = 0;
        }
    }
    class Animation {
        constructor(handle) {
            this.handle = handle;
            this.name = spasm.getString(spasm.getAnimationName(handle));
        }
        get duration() {
            return spasm.getAnimationDuration(this.handle);
        }
    }
    spine.Animation = Animation;
    var eventPool = [];
    function aniEvent(id, name, intVal, floatVal, strVal) {
        var l = eventPool[id];
        if (!l)
            return;
        var e = {
            name: spasm.getString(name),
            intValue: intVal,
            floatValue: floatVal,
            stringValue: ""
        };
        if (strVal)
            e.stringValue = spasm.getString(strVal);
        l(e);
    }
    spine.aniEvent = aniEvent;
    class AnimationState {
        constructor(skeleton) {
            this.skeloton = skeleton;
            this.handle = spasm.createAnimationState(skeleton.aniState);
        }
        dispose() {
            spasm.disposeAnimationState(this.handle);
            this.handle = 0;
            if (this.listener) {
                var idx = eventPool.indexOf(this.listener);
                if (idx >= 0)
                    eventPool[idx] = null;
                this.listener = null;
            }
        }
        update(dt, skeleton) {
            return spasm.updateAnimationState(this.handle, dt, skeleton.handle);
        }
        setAnimation(trackIndex, animationName, loop) {
            var ani = this.skeloton.findAnimation(animationName);
            spasm.setAnimation(this.handle, trackIndex, ani.handle, loop ? 1 : 0);
        }
        addAnimation(trackIndex, animationName, loop, delay) {
            var ani = this.skeloton.findAnimation(animationName);
            spasm.addAnimation(this.handle, trackIndex, ani.handle, loop ? 1 : 0, delay);
        }
        clearTracks() {
            spasm.clearTracks(this.handle);
        }
        clearTrack(trackIndex) {
            spasm.clearTrack(this.handle, trackIndex);
        }
        addEventListener(listener) {
            var id = -1;
            for (var i = 0; i < eventPool.length; i++) {
                if (eventPool[i] == null)
                    id = i;
            }
            if (id < 0) {
                eventPool.push(listener);
                id = eventPool.length - 1;
            }
            spasm.setAnimationEventListener(this.handle, id);
        }
    }
    spine.AnimationState = AnimationState;
    class Skeleton {
        constructor(data) {
            this.handle = spasm.createSkeleton(data.handle);
        }
        dispose() {
            spasm.disposeSkeleton(this.handle);
            this.handle = 0;
        }
        setSkinByName(skinName) {
            var n = spasm.allocString(skinName);
            var r = spasm.setSkeletonSkinByName(this.handle, n);
            spasm.free(n);
            if (!r)
                throw new Error(`skin ${skinName} is not exist.`);
        }
    }
    spine.Skeleton = Skeleton;
    class SkeletonData {
        constructor(handle) {
            this.handle = handle;
            this.aniState = spasm.createAnimationStateData(handle);
            this.animations = [];
            this.aniNames = [];
            this.skinNames = [];
            var count = spasm.getSkDataAniCount(handle);
            this.aniTbl = {};
            for (let i = 0; i < count; i++) {
                var ani = new Animation(spasm.getSkDataAni(handle, i));
                this.animations.push(ani);
                this.aniNames.push(ani.name);
                this.aniTbl[ani.name] = ani;
            }
            count = spasm.getSkDataSkinCount(handle);
            for (let i = 0; i < count; i++) {
                this.skinNames.push(spasm.getString(spasm.getSkDataSkinName(handle, i)));
            }
        }
        findAnimation(name) {
            return this.aniTbl[name];
        }
        dispose() {
            spasm.disposeSkeletonData(this.handle);
            spasm.disposeAnimationStateData(this.aniState);
            this.handle = 0;
            this.animations = null;
        }
    }
    spine.SkeletonData = SkeletonData;
    var imgPath = "";
    var texAtlas;
    var texPool = [null];
    var rc;
    var shader;
    var currSkeleton;
    var skeletonPool = {};
    var vbo;
    var ibo;
    var vao;
    spine.DefVS = `
attribute vec2 pos;
attribute vec2 uv;
attribute vec4 color;
uniform vec2 invSize;
uniform float trans[6];
varying vec2 v_tc;
varying vec2 v_pos;
varying vec4 v_color;

void main(){
	gl_Position = vec4((pos.x * trans[0] + pos.y * trans[2] + trans[4]) * invSize.x - 1.0, (pos.x * trans[1] + pos.y * trans[3] + trans[5]) * invSize.y + 1.0, 0.0, 1.0);
	v_tc = uv;
	v_color = color;
}`;
    var inited = false;
    function init() {
        if (inited)
            return;
        inited = true;
        spasm.init();
        var gl = ez.getGL();
        vbo = gl.createBuffer();
        ibo = gl.createBuffer();
        vao = ez.RenderContext.createVAO(function (gl) {
            gl.bindBuffer(34963, ibo);
            gl.bindBuffer(34962, vbo);
            gl.enableVertexAttribArray(0);
            gl.enableVertexAttribArray(1);
            gl.enableVertexAttribArray(2);
            gl.vertexAttribPointer(0, 2, 5126, false, 5 * 4, 0);
            gl.vertexAttribPointer(1, 2, 5126, false, 5 * 4, 2 * 4);
            gl.vertexAttribPointer(2, 4, 5121, true, 5 * 4, 4 * 4);
        });
        shader = new ez.Shader(spine.DefVS, ez.Effect.DefFS2D, ["pos", "uv", "color"], { texture0: gl.uniform1i, trans: gl.uniform1fv, invSize: gl.uniform2fv });
    }
    spine.init = init;
    function drawMesh(vertBuffer, vertCount, indexBuffer, count, renderObject) {
        var res = texPool[renderObject];
        if (!res) {
            Log.error(`not find renderobjectId:${renderObject}`);
            return;
        }
        var vb = new Float32Array(spasm.buffer, vertBuffer, vertCount * 5);
        var ib = new Uint16Array(spasm.buffer, indexBuffer, count);
        if (res.state != 3)
            return;
        rc.bindTexture(res.getData(), 0);
        var gl = ez.getGL();
        gl.bindBuffer(34962, vbo);
        gl.bufferData(34962, vb, 35040);
        gl.bindBuffer(34963, ibo);
        gl.bufferData(34963, ib, 35040);
        rc.drawTriangles(vao, count);
    }
    spine.drawMesh = drawMesh;
    function onLoadTexture(path, attachment) {
        let name = spasm.getString(path);
        if (texAtlas) {
            let region = texAtlas.findRegion(name);
            if (!region) {
                Log.error(`not find region "${name}"`);
                return 0;
            }
            spasm.updateAttachRegion(attachment, region.u, region.v, region.u2, region.v2, region.rotate, region.degrees, region.offsetX, region.offsetY, region.width, region.height, region.originalWidth, region.originalHeight);
            return region.page.texture["spine_renderObjIdx"];
        }
        else {
            let imgName = imgPath + "/" + name;
            var res = ez.getRes(imgName);
            var tex = res.getData();
            var m0 = 0, m1 = 0, m2 = 0, m3 = 0;
            if (tex.margin) {
                m0 = tex.margin[0];
                m1 = tex.margin[1];
                m2 = tex.margin[2];
                m3 = tex.margin[3];
            }
            var u = 0, v = 0, u2 = 1, v2 = 1;
            if (tex.subRect) {
                var invW = 1 / res.parentImage.width;
                var invH = 1 / res.parentImage.height;
                u = tex.subRect.left * invW;
                v = tex.subRect.top * invH;
                u2 = tex.subRect.right * invW;
                v2 = tex.subRect.bottom * invH;
            }
            spasm.updateAttachment(attachment, m0, m1, m2, m3, u, v, u2, v2, res.width, res.height);
            if (res.state == 1)
                res.load();
            if (!tex["spine_renderObjIdx"]) {
                tex["spine_renderObjIdx"] = texPool.length;
                texPool.push(tex);
            }
            return tex["spine_renderObjIdx"];
        }
    }
    spine.onLoadTexture = onLoadTexture;
    function loadSkeleton(path, data, isBinary, atlas) {
        if (atlas) {
            texAtlas = new TextureAtlas(atlas, p => {
                let res = ez.getRes(path + p.substring(0, p.lastIndexOf('.')));
                if (res.state == 1)
                    res.load();
                var tex = res.getData();
                if (texPool.indexOf(tex.id) < 0)
                    texPool.push(tex.id);
                return tex;
            });
        }
        imgPath = path;
        let ptr = spasm.malloc(data.byteLength);
        spasm.copyByteArray(ptr, data);
        var s;
        if (isBinary)
            s = spasm.loadSkeletonBin(ptr, data.byteLength);
        else
            s = spasm.loadSkeletonJson(ptr);
        spasm.free(ptr);
        texAtlas = null;
        if (!s) {
            Log.error(spasm.lastError());
            throw new Error(spasm.lastError());
        }
        return new SkeletonData(s);
    }
    function load(name, imgPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!shader)
                init();
            var skeData = skeletonPool[name];
            if (!skeData) {
                var res = ez.getRes(name);
                if (!res)
                    throw new Error(`${name} is not exist.`);
                if (res.type != 12)
                    throw new Error(`${name} is not spine file.`);
                if (res.state != 3)
                    yield res.loadAsync();
                var atlas;
                if (res.args.atlas) {
                    var atlasRes = ez.getRes(res.args.atlas);
                    if (atlasRes.state != 3)
                        yield atlasRes.loadAsync();
                    atlas = atlasRes.getData();
                }
                if (res.state == 4)
                    return;
                var data = new Uint8Array(res.getData());
                var sig = data[0];
                let path = name.substring(0, name.lastIndexOf('.'));
                if (imgPath)
                    path = imgPath;
                else if (atlas && path.lastIndexOf('/') > 0)
                    path = path.substring(0, path.lastIndexOf('/') + 1);
                skeData = loadSkeleton(path, data, sig == 0x1c, atlas);
                skeletonPool[name] = skeData;
            }
            var ske = new Skeleton(skeData);
            var state = new AnimationState(skeData);
            return { skeleton: ske, state: state, data: skeData };
        });
    }
    spine.load = load;
    function draw(ctx, transform, skeleton, opacity) {
        rc = ctx;
        rc.setShader(shader);
        currSkeleton = skeleton;
        var trans = ezasm.handleToFloatArray(transform, 6);
        shader.bind("trans", trans, true);
        shader.bind("invSize", [rc.invWidth, rc.invHeight]);
        spasm.drawSkeleton(skeleton.handle, opacity);
    }
    spine.draw = draw;
})(spine || (spine = {}));
var ez;
(function (ez) {
    class SpineSprite extends ez.Sprite {
        constructor(parent, id) {
            super(parent, id);
            this.timeScale = 1;
            spine.init();
        }
        getType() {
            return SpineSprite.Type;
        }
        _dispose() {
            this._skeleton.dispose();
            this._state.dispose();
            super._dispose();
        }
        play(track, ani, loop) {
            this._state.setAnimation(track, ani, loop);
            if (!this._ticker)
                this._ticker = ez.addTicker(this.update, this);
        }
        get skeleton() {
            return this._skeleton;
        }
        get animationState() {
            return this._state;
        }
        get skeletonData() {
            return this._data;
        }
        stop() {
            if (!this._ticker)
                return;
            ez.removeTicker(this._ticker);
            this._ticker = null;
        }
        load(name, imgPath) {
            return __awaiter(this, void 0, void 0, function* () {
                let data = yield spine.load(name, imgPath);
                this._skeleton = data.skeleton;
                this._state = data.state;
                this._data = data.data;
            });
        }
        update(dt) {
            ez.Profile.addCommand("spine update");
            var playing = this._state.update(dt * this.timeScale * 0.001, this._skeleton);
            this.setDirty();
            if (!playing) {
                Log.debug("stop");
                ez.removeTicker(this._ticker);
                this._ticker = null;
            }
        }
        _draw(rc, opacity) {
            if (!this._state)
                return;
            opacity *= this.opacity;
            if (opacity < 0.01)
                return;
            spine.draw(rc, ezasm.getglobalTrans(this._handle), this._skeleton, opacity);
        }
    }
    SpineSprite.Type = "Spine";
    ez.SpineSprite = SpineSprite;
    ez.Sprite.register(SpineSprite.Type, function (p, id) { return new SpineSprite(p, id); });
})(ez || (ez = {}));

//# sourceMappingURL=spine.js.map
