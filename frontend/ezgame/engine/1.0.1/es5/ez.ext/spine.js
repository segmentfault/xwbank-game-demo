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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var spasm;
var spine;
(function (spine) {
    var TextureAtlas = (function () {
        function TextureAtlas(atlasText, textureLoader) {
            this.pages = new Array();
            this.regions = {};
            if (textureLoader == null)
                throw new Error("textureLoader cannot be null.");
            var reader = new TextureAtlasReader(atlasText);
            var tuple = new Array(4);
            var page = null;
            while (true) {
                var line = reader.readLine();
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
                    var direction = reader.readValue();
                    page.texture = textureLoader(line);
                    page.width = page.texture.width;
                    page.height = page.texture.height;
                    this.pages.push(page);
                }
                else {
                    var region = new TextureAtlasRegion();
                    region.name = line;
                    region.page = page;
                    var rotateValue = reader.readValue();
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
                    var x = parseInt(tuple[0]);
                    var y = parseInt(tuple[1]);
                    reader.readTuple(tuple);
                    var width = parseInt(tuple[0]);
                    var height = parseInt(tuple[1]);
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
        TextureAtlas.prototype.findRegion = function (name) {
            return this.regions[name];
        };
        return TextureAtlas;
    }());
    var TextureAtlasReader = (function () {
        function TextureAtlasReader(text) {
            this.index = 0;
            this.lines = text.split(/\r\n|\r|\n/);
        }
        TextureAtlasReader.prototype.readLine = function () {
            if (this.index >= this.lines.length)
                return null;
            return this.lines[this.index++];
        };
        TextureAtlasReader.prototype.readValue = function () {
            var line = this.readLine();
            var colon = line.indexOf(":");
            if (colon == -1)
                throw new Error("Invalid line: " + line);
            return line.substring(colon + 1).trim();
        };
        TextureAtlasReader.prototype.readTuple = function (tuple) {
            var line = this.readLine();
            var colon = line.indexOf(":");
            if (colon == -1)
                throw new Error("Invalid line: " + line);
            var i = 0, lastMatch = colon + 1;
            for (; i < 3; i++) {
                var comma = line.indexOf(",", lastMatch);
                if (comma == -1)
                    break;
                tuple[i] = line.substr(lastMatch, comma - lastMatch).trim();
                lastMatch = comma + 1;
            }
            tuple[i] = line.substring(lastMatch).trim();
            return i + 1;
        };
        return TextureAtlasReader;
    }());
    var TextureAtlasPage = (function () {
        function TextureAtlasPage() {
        }
        return TextureAtlasPage;
    }());
    var TextureAtlasRegion = (function () {
        function TextureAtlasRegion() {
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
        return TextureAtlasRegion;
    }());
    var Animation = (function () {
        function Animation(handle) {
            this.handle = handle;
            this.name = spasm.getString(spasm.getAnimationName(handle));
        }
        Object.defineProperty(Animation.prototype, "duration", {
            get: function () {
                return spasm.getAnimationDuration(this.handle);
            },
            enumerable: true,
            configurable: true
        });
        return Animation;
    }());
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
    var AnimationState = (function () {
        function AnimationState(skeleton) {
            this.skeloton = skeleton;
            this.handle = spasm.createAnimationState(skeleton.aniState);
        }
        AnimationState.prototype.dispose = function () {
            spasm.disposeAnimationState(this.handle);
            this.handle = 0;
            if (this.listener) {
                var idx = eventPool.indexOf(this.listener);
                if (idx >= 0)
                    eventPool[idx] = null;
                this.listener = null;
            }
        };
        AnimationState.prototype.update = function (dt, skeleton) {
            return spasm.updateAnimationState(this.handle, dt, skeleton.handle);
        };
        AnimationState.prototype.setAnimation = function (trackIndex, animationName, loop) {
            var ani = this.skeloton.findAnimation(animationName);
            spasm.setAnimation(this.handle, trackIndex, ani.handle, loop ? 1 : 0);
        };
        AnimationState.prototype.addAnimation = function (trackIndex, animationName, loop, delay) {
            var ani = this.skeloton.findAnimation(animationName);
            spasm.addAnimation(this.handle, trackIndex, ani.handle, loop ? 1 : 0, delay);
        };
        AnimationState.prototype.clearTracks = function () {
            spasm.clearTracks(this.handle);
        };
        AnimationState.prototype.clearTrack = function (trackIndex) {
            spasm.clearTrack(this.handle, trackIndex);
        };
        AnimationState.prototype.addEventListener = function (listener) {
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
        };
        return AnimationState;
    }());
    spine.AnimationState = AnimationState;
    var Skeleton = (function () {
        function Skeleton(data) {
            this.handle = spasm.createSkeleton(data.handle);
        }
        Skeleton.prototype.dispose = function () {
            spasm.disposeSkeleton(this.handle);
            this.handle = 0;
        };
        Skeleton.prototype.setSkinByName = function (skinName) {
            var n = spasm.allocString(skinName);
            var r = spasm.setSkeletonSkinByName(this.handle, n);
            spasm.free(n);
            if (!r)
                throw new Error("skin " + skinName + " is not exist.");
        };
        return Skeleton;
    }());
    spine.Skeleton = Skeleton;
    var SkeletonData = (function () {
        function SkeletonData(handle) {
            this.handle = handle;
            this.aniState = spasm.createAnimationStateData(handle);
            this.animations = [];
            this.aniNames = [];
            this.skinNames = [];
            var count = spasm.getSkDataAniCount(handle);
            this.aniTbl = {};
            for (var i = 0; i < count; i++) {
                var ani = new Animation(spasm.getSkDataAni(handle, i));
                this.animations.push(ani);
                this.aniNames.push(ani.name);
                this.aniTbl[ani.name] = ani;
            }
            count = spasm.getSkDataSkinCount(handle);
            for (var i = 0; i < count; i++) {
                this.skinNames.push(spasm.getString(spasm.getSkDataSkinName(handle, i)));
            }
        }
        SkeletonData.prototype.findAnimation = function (name) {
            return this.aniTbl[name];
        };
        SkeletonData.prototype.dispose = function () {
            spasm.disposeSkeletonData(this.handle);
            spasm.disposeAnimationStateData(this.aniState);
            this.handle = 0;
            this.animations = null;
        };
        return SkeletonData;
    }());
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
    spine.DefVS = "\nattribute vec2 pos;\nattribute vec2 uv;\nattribute vec4 color;\nuniform vec2 invSize;\nuniform float trans[6];\nvarying vec2 v_tc;\nvarying vec2 v_pos;\nvarying vec4 v_color;\n\nvoid main(){\n\tgl_Position = vec4((pos.x * trans[0] + pos.y * trans[2] + trans[4]) * invSize.x - 1.0, (pos.x * trans[1] + pos.y * trans[3] + trans[5]) * invSize.y + 1.0, 0.0, 1.0);\n\tv_tc = uv;\n\tv_color = color;\n}";
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
            Log.error("not find renderobjectId:" + renderObject);
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
        var name = spasm.getString(path);
        if (texAtlas) {
            var region = texAtlas.findRegion(name);
            if (!region) {
                Log.error("not find region \"" + name + "\"");
                return 0;
            }
            spasm.updateAttachRegion(attachment, region.u, region.v, region.u2, region.v2, region.rotate, region.degrees, region.offsetX, region.offsetY, region.width, region.height, region.originalWidth, region.originalHeight);
            return region.page.texture["spine_renderObjIdx"];
        }
        else {
            var imgName = imgPath + "/" + name;
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
            texAtlas = new TextureAtlas(atlas, function (p) {
                var res = ez.getRes(path + p.substring(0, p.lastIndexOf('.')));
                if (res.state == 1)
                    res.load();
                var tex = res.getData();
                if (texPool.indexOf(tex.id) < 0)
                    texPool.push(tex.id);
                return tex;
            });
        }
        imgPath = path;
        var ptr = spasm.malloc(data.byteLength);
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
        return __awaiter(this, void 0, void 0, function () {
            var skeData, res, atlas, atlasRes, data, sig, path, ske, state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!shader)
                            init();
                        skeData = skeletonPool[name];
                        if (!!skeData) return [3, 6];
                        res = ez.getRes(name);
                        if (!res)
                            throw new Error(name + " is not exist.");
                        if (res.type != 12)
                            throw new Error(name + " is not spine file.");
                        if (!(res.state != 3)) return [3, 2];
                        return [4, res.loadAsync()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!res.args.atlas) return [3, 5];
                        atlasRes = ez.getRes(res.args.atlas);
                        if (!(atlasRes.state != 3)) return [3, 4];
                        return [4, atlasRes.loadAsync()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        atlas = atlasRes.getData();
                        _a.label = 5;
                    case 5:
                        if (res.state == 4)
                            return [2];
                        data = new Uint8Array(res.getData());
                        sig = data[0];
                        path = name.substring(0, name.lastIndexOf('.'));
                        if (imgPath)
                            path = imgPath;
                        else if (atlas && path.lastIndexOf('/') > 0)
                            path = path.substring(0, path.lastIndexOf('/') + 1);
                        skeData = loadSkeleton(path, data, sig == 0x1c, atlas);
                        skeletonPool[name] = skeData;
                        _a.label = 6;
                    case 6:
                        ske = new Skeleton(skeData);
                        state = new AnimationState(skeData);
                        return [2, { skeleton: ske, state: state, data: skeData }];
                }
            });
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
    var SpineSprite = (function (_super) {
        __extends(SpineSprite, _super);
        function SpineSprite(parent, id) {
            var _this = _super.call(this, parent, id) || this;
            _this.timeScale = 1;
            spine.init();
            return _this;
        }
        SpineSprite.prototype.getType = function () {
            return SpineSprite.Type;
        };
        SpineSprite.prototype._dispose = function () {
            this._skeleton.dispose();
            this._state.dispose();
            _super.prototype._dispose.call(this);
        };
        SpineSprite.prototype.play = function (track, ani, loop) {
            this._state.setAnimation(track, ani, loop);
            if (!this._ticker)
                this._ticker = ez.addTicker(this.update, this);
        };
        Object.defineProperty(SpineSprite.prototype, "skeleton", {
            get: function () {
                return this._skeleton;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpineSprite.prototype, "animationState", {
            get: function () {
                return this._state;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpineSprite.prototype, "skeletonData", {
            get: function () {
                return this._data;
            },
            enumerable: true,
            configurable: true
        });
        SpineSprite.prototype.stop = function () {
            if (!this._ticker)
                return;
            ez.removeTicker(this._ticker);
            this._ticker = null;
        };
        SpineSprite.prototype.load = function (name, imgPath) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, spine.load(name, imgPath)];
                        case 1:
                            data = _a.sent();
                            this._skeleton = data.skeleton;
                            this._state = data.state;
                            this._data = data.data;
                            return [2];
                    }
                });
            });
        };
        SpineSprite.prototype.update = function (dt) {
            ez.Profile.addCommand("spine update");
            var playing = this._state.update(dt * this.timeScale * 0.001, this._skeleton);
            this.setDirty();
            if (!playing) {
                Log.debug("stop");
                ez.removeTicker(this._ticker);
                this._ticker = null;
            }
        };
        SpineSprite.prototype._draw = function (rc, opacity) {
            if (!this._state)
                return;
            opacity *= this.opacity;
            if (opacity < 0.01)
                return;
            spine.draw(rc, ezasm.getglobalTrans(this._handle), this._skeleton, opacity);
        };
        SpineSprite.Type = "Spine";
        return SpineSprite;
    }(ez.Sprite));
    ez.SpineSprite = SpineSprite;
    ez.Sprite.register(SpineSprite.Type, function (p, id) { return new SpineSprite(p, id); });
})(ez || (ez = {}));

//# sourceMappingURL=spine.js.map
