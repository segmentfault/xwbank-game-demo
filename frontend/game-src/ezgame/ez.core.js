var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var PLATFORM;
var Log;
var DEBUG;
var PUBLISH;
var PROFILING;
var useWGL;
var ez;
(function (ez) {
    function removeThis() {
        if (this._p) {
            this.disposed = true;
            this._p.remove(this);
            this._p = null;
        }
    }
    class DataCollection {
        constructor(items) {
            this._items = [];
            this.addItems(items);
        }
        remove(t) {
            if (this._observers == t) {
                this._observers = null;
                return;
            }
            if (Array.isArray(this._observers)) {
                var idx = this._observers.indexOf(t);
                if (idx != -1)
                    this._observers.splice(idx, 1);
            }
        }
        static dataChangeNotify(observers, type, index, item) {
            if (!observers)
                return;
            if (Array.isArray(observers)) {
                for (var i = 0; i < observers.length; i++) {
                    var o = observers[i];
                    o.func.call(o.ctx, type, index, item);
                }
            }
            else
                observers.func.call(observers.ctx, type, index, item);
        }
        get items() {
            return this._items;
        }
        getItem(index) {
            return this._items[index];
        }
        insertItem(idx, item) {
            if (idx < 0 || idx >= this._items.length)
                throw new Error("out of range.");
            this._items.splice(idx, 0, item);
            DataCollection.dataChangeNotify(this._observers, 0, idx, item);
        }
        addItems(items) {
            if (!items)
                return;
            for (var i = 0; i < items.length; i++) {
                var len = this._items.push(items[i]);
                DataCollection.dataChangeNotify(this._observers, 3, len - 1, items[i]);
            }
        }
        setItems(items) {
            if (!items)
                items = [];
            this._items = items;
            DataCollection.dataChangeNotify(this._observers, 3, 0, items);
        }
        addItem(item) {
            var len = this._items.push(item);
            DataCollection.dataChangeNotify(this._observers, 0, len - 1, item);
        }
        removeIndex(idx) {
            if (idx < 0 || idx >= this.items.length)
                throw new RangeError();
            var item = this._items[idx];
            this._items.splice(idx, 1);
            DataCollection.dataChangeNotify(this._observers, 2, idx, item);
        }
        removeItem(item) {
            var idx = this._items.indexOf(item);
            if (idx == -1)
                throw new Error("item not exist!");
            this._items.splice(idx, 1);
            DataCollection.dataChangeNotify(this._observers, 2, idx, item);
        }
        updateItem(idx, item) {
            if (idx < 0 || idx >= this.items.length)
                throw new RangeError();
            this._items[idx] = item;
            DataCollection.dataChangeNotify(this._observers, 1, idx, item);
        }
        clear() {
            this._items = [];
            DataCollection.dataChangeNotify(this._observers, 4);
        }
        addObserver(func, thisArg) {
            var t = { func: func, ctx: thisArg, _p: this, disposed: false, dispose: removeThis };
            if (!this._observers)
                this._observers = t;
            else {
                if (Array.isArray(this._observers))
                    this._observers.push(t);
                else
                    this._observers = [this._observers, t];
            }
            return t;
        }
        clearObservers() {
            this._observers = null;
        }
        dispose() {
            this._items = null;
            this._observers = null;
        }
        get disposed() {
            return this._items == null;
        }
    }
    ez.DataCollection = DataCollection;
    class DataModel {
        constructor(data) {
            this._props = {};
            this._observers = {};
            this._converters = null;
            this._defaults = null;
            this._settingProp = "";
            for (var k in data)
                this.setProp(k, data[k]);
        }
        remove(t) {
            var name = t.name;
            var n = this._observers[name];
            if (Array.isArray(n)) {
                var arr = n;
                var idx = arr.indexOf(t);
                if (idx != -1)
                    arr.splice(idx, 1);
            }
            else if (n == t)
                delete this._observers[name];
        }
        setDefaults(vals) {
            this._defaults = vals;
        }
        setPropConverters(conterters) {
            this._converters = conterters;
        }
        getProp(name) {
            let v = this._props[name];
            if (v === undefined && this._defaults)
                return this._defaults[name];
            return v;
        }
        hasProp(name) {
            return this._props.hasOwnProperty(name);
        }
        setProp(name, val) {
            var _a;
            var conv = (_a = this._converters) === null || _a === void 0 ? void 0 : _a[name];
            if (conv && val !== undefined)
                val = conv.call(this, val);
            var old = this._props[name];
            if (old === val)
                return;
            this._props[name] = val;
            if (this._settingProp === name)
                return;
            if (val === undefined && this._defaults)
                val = this._defaults[name];
            this._settingProp = name;
            var t = this._observers[name];
            if (t) {
                if (Array.isArray(t)) {
                    for (let i = 0; i < t.length; i++) {
                        let n = t[i];
                        n(val, old);
                        if (n != t[i])
                            i--;
                    }
                }
                else
                    t(val, old);
            }
            this._settingProp = "";
        }
        setData(source) {
            for (var p in this._props) {
                if (source[p] !== undefined)
                    this.setProp(p, source[p]);
            }
        }
        removeProp(name) {
            var old = this._props[name];
            if (old === undefined)
                return;
            this.setProp(name, undefined);
            delete this._props[name];
        }
        addObserver(name, func, thisArg) {
            var f = func.bind(thisArg);
            var ctx = this;
            f.dispose = function () {
                if (!ctx)
                    return;
                var n = ctx._observers[name];
                if (Array.isArray(n)) {
                    var idx = n.indexOf(this);
                    if (idx != -1)
                        n.splice(idx, 1);
                }
                else if (n == this)
                    delete ctx._observers[name];
                ctx = undefined;
                if (this.onDispose)
                    this.onDispose();
            };
            Object.defineProperty(f, "disposed", {
                get: function () { return !ctx; },
                enumerable: true,
                configurable: false
            });
            var t = ctx._observers[name];
            if (!t)
                ctx._observers[name] = f;
            else {
                if (Array.isArray(t))
                    t.push(f);
                else
                    t = [t, f];
            }
            return f;
        }
        bind(propName, target, targetProp, converter) {
            var srcOb;
            targetProp = targetProp || propName;
            function valChanged(newVal) {
                if (target.disposed) {
                    srcOb.dispose();
                    srcOb = undefined;
                    return;
                }
                if (converter)
                    newVal = converter(newVal);
                if (target.setProp)
                    target.setProp(targetProp, newVal);
                else
                    target[targetProp] = newVal;
            }
            srcOb = this.addObserver(propName, valChanged);
            if (this.hasProp(propName))
                valChanged(this.getProp(propName));
            return srcOb;
        }
        bind2way(propName, target, targetProp) {
            var srcOb;
            var targetOb;
            var srcChange;
            var src = this;
            function dispose() {
                if (srcOb) {
                    srcOb.dispose();
                    srcOb = undefined;
                }
                if (targetOb) {
                    targetOb.dispose();
                    targetOb = undefined;
                }
                src = undefined;
                target = undefined;
            }
            function srcChanged(newVal) {
                if (srcChange)
                    return;
                if (target.disposed) {
                    dispose();
                    return;
                }
                srcChange = true;
                target.setProp(targetProp, newVal);
                srcChange = false;
            }
            function targetChanged(newVal) {
                if (srcChange)
                    return;
                if (src.disposed) {
                    dispose();
                    return;
                }
                srcChange = true;
                src.setProp(propName, newVal);
                srcChange = false;
            }
            srcOb = src.addObserver(propName, srcChanged);
            targetOb = target.addObserver(targetProp, targetChanged);
            if (src.hasProp(propName))
                srcChanged(src.getProp(propName));
            var o = { dispose: dispose };
            Object.defineProperty(o, "disposed", {
                get: function () { return !srcOb; },
                enumerable: true,
                configurable: false
            });
            return o;
        }
        clearObserver(name) {
            delete this._observers[name];
        }
        get disposed() {
            return this._props == null;
        }
        dispose() {
            this._props = null;
            this._converters = null;
            this._observers = null;
            if (this.onDispose)
                this.onDispose();
        }
    }
    ez.DataModel = DataModel;
})(ez || (ez = {}));
var ez;
(function (ez) {
    var initFuncs = [];
    var initAfterFuncs = [];
    let internal;
    (function (internal) {
        function init() {
            for (var i = 0; i < initFuncs.length; i++)
                initFuncs[i]();
            initFuncs = null;
        }
        internal.init = init;
        function afterInit() {
            for (var i = 0; i < initAfterFuncs.length; i++)
                initAfterFuncs[i]();
            initAfterFuncs = null;
        }
        internal.afterInit = afterInit;
    })(internal = ez.internal || (ez.internal = {}));
    function initCall(func, afterInit = false) {
        if (afterInit)
            initAfterFuncs.push(func);
        else
            initFuncs.push(func);
    }
    ez.initCall = initCall;
})(ez || (ez = {}));
(function (ez) {
    class Dimension {
        constructor(val) {
            if (typeof (val) === "number") {
                this.value = val;
                this.isPercent = false;
            }
            else if (typeof (val) === "string") {
                var s = val;
                s = s.trim();
                if (/^-?\d+\.?\d*%$/.test(s)) {
                    this.value = parseFloat(s.substring(0, s.length - 1)) * 0.01;
                    this.isPercent = true;
                }
                else if (/^(-?\d+)(\.\d+)?$/.test(s)) {
                    this.value = parseFloat(s);
                    this.isPercent = false;
                }
                else
                    throw new Error(`${val} is not a number or percent.`);
            }
        }
        toString() {
            if (this.isPercent)
                return (this.value * 100).toString() + "%";
            else
                return this.value.toString();
        }
        calcSize(size) {
            return this.isPercent ? this.value * size : this.value;
        }
    }
    ez.Dimension = Dimension;
    class Point {
        constructor(x, y) {
            this.x = x || 0;
            this.y = y || 0;
        }
        clone() {
            return new Point(this.x, this.y);
        }
        toString() {
            return "" + this.x + "," + this.y;
        }
        equals(pt) {
            return this.x == pt.x && this.y == pt.y;
        }
        static add(p1, p2) {
            return new Point(p1.x + p2.x, p1.y + p2.y);
        }
        static sub(p1, p2) {
            return new Point(p1.x - p2.x, p1.y - p2.y);
        }
        static mul(p1, v) {
            return new Point(p1.x * v, p1.y * v);
        }
        static parse(val) {
            var args = val.split(",");
            return new Point(parseFloat(args[0]), parseFloat(args[1]));
        }
        static distance(p1, p2) {
            return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
        }
    }
    ez.Point = Point;
    class Rect {
        constructor(l, t, w, h) {
            this.left = l || 0;
            this.top = t || 0;
            this.width = w || 0;
            this.height = h || 0;
        }
        get right() {
            return this.left + this.width;
        }
        set right(value) {
            this.width = value - this.left;
        }
        get bottom() {
            return this.top + this.height;
        }
        set bottom(value) {
            this.height = value - this.top;
        }
        clone() {
            return new Rect(this.left, this.top, this.width, this.height);
        }
        toString() {
            return "" + this.left + "," + this.top + "," + this.width + "," + this.height;
        }
        static parse(val) {
            var args = val.split(",");
            return new Rect(parseFloat(args[0]), parseFloat(args[1]), parseFloat(args[2]), parseFloat(args[3]));
        }
        contains(x, y) {
            return this.left <= x &&
                this.left + this.width >= x &&
                this.top <= y &&
                this.top + this.height >= y;
        }
        containsPt(pt) {
            return this.contains(pt.x, pt.y);
        }
        static equal(r1, r2) {
            if (!r1 || !r2)
                return false;
            return r1.top === r2.top && r1.left === r2.width && r1.left === r2.width && r1.height === r2.height;
        }
        static intersect(r1, r2) {
            var l = Math.max(r1.left, r2.left);
            var t = Math.max(r1.top, r2.top);
            return new Rect(l, t, Math.max(0, Math.min(r1.right, r2.right) - l), Math.max(0, Math.min(r1.bottom, r2.bottom) - t));
        }
    }
    ez.Rect = Rect;
    class Color {
        constructor(r = 0, g = 0, b = 0, a = 255) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }
        get rgba() {
            return (this.a << 24) | (this.b << 16) | (this.g << 8) | this.r;
        }
        toVec3() {
            var f = 1 / 255;
            return [this.r * f, this.g * f, this.b * f];
        }
        toVec4() {
            var f = 1 / 255;
            return [this.r * f, this.g * f, this.b * f, this.a * f];
        }
    }
    ez.Color = Color;
    class Matrix {
        constructor(a, b, c, d, tx, ty) {
            this._11 = (typeof a === "number") ? a : 1;
            this._12 = b || 0;
            this._21 = c || 0;
            this._22 = (typeof d === "number") ? d : 1;
            this.tx = tx || 0;
            this.ty = ty || 0;
        }
        static rotate(angle) {
            var a = Matrix.Deg2Rad * angle;
            var c = Math.cos(a);
            var s = Math.sin(a);
            return new Matrix(c, s, -s, c, 0, 0);
        }
        static scale(sx, sy) {
            return new Matrix(sx, 0, 0, sy, 0, 0);
        }
        static translate(x, y) {
            return new Matrix(1, 0, 0, 1, x, y);
        }
        clone() {
            return new Matrix(this._11, this._12, this._21, this._22, this.tx, this.ty);
        }
        identity() {
            this._11 = 1;
            this._12 = 0;
            this._21 = 0;
            this._22 = 1;
            this.tx = 0;
            this.ty = 0;
            return this;
        }
        rotate(a) {
            a *= Matrix.Deg2Rad;
            var c = Math.cos(a);
            var s = Math.sin(a);
            var _11 = this._11;
            var _21 = this._21;
            var tx = this.tx;
            this._11 = _11 * c - this._12 * s;
            this._12 = _11 * s + this._12 * c;
            this._21 = _21 * c - this._22 * s;
            this._22 = _21 * s + this._22 * c;
            this.tx = tx * c - this.ty * s;
            this.ty = tx * s + this.ty * c;
            return this;
        }
        scale(sx, sy) {
            this._11 *= sx;
            this._12 *= sx;
            this.tx *= sx;
            this._21 *= sy;
            this._22 *= sy;
            this.ty *= sy;
            return this;
        }
        translate(x, y) {
            this.tx += x;
            this.ty += y;
            return this;
        }
        append(m) {
            var _11 = this._11;
            var _12 = this._12;
            var _21 = this._21;
            var _22 = this._22;
            var tx = this.tx;
            this._11 = _11 * m._11 + _12 * m._21;
            this._12 = _11 * m._12 + _12 * m._22;
            this._21 = _21 * m._11 + _22 * m._21;
            this._22 = _21 * m._12 + _22 * m._22;
            this.tx = tx * m._11 + this.ty * m._21 + m.tx;
            this.ty = tx * m._12 + this.ty * m._22 + m.ty;
            return this;
        }
        invert() {
            var _11 = this._11;
            var _12 = this._12;
            var _21 = this._21;
            var _22 = this._22;
            var a = 1 / (_11 * _22 - _12 * _21);
            var tx = this.tx;
            this._11 = _22 * a;
            this._12 = -_12 * a;
            this._21 = -_21 * a;
            this._22 = _11 * a;
            this.tx = (_21 * this.ty - _22 * tx) * a;
            this.ty = (_12 * tx - _11 * this.ty) * a;
            return this;
        }
        transformPt(pt) {
            var r = new Point();
            r.x = this._11 * pt.x + this._21 * pt.y + this.tx;
            r.y = this._12 * pt.x + this._22 * pt.y + this.ty;
            return r;
        }
        transform(pt) {
            var x = this._11 * pt[0] + this._21 * pt[1] + this.tx;
            pt[1] = this._12 * pt[0] + this._22 * pt[1] + this.ty;
            pt[0] = x;
        }
        static multiply(m1, m2) {
            return new Matrix(m1._11 * m2._11 + m1._12 * m2._21, m1._11 * m2._12 + m1._12 * m2._22, m1._21 * m2._11 + m1._22 * m2._21, m1._21 * m2._12 + m1._22 * m2._22, m1.tx * m2._11 + m1.ty * m2._21 + m2.tx, m1.tx * m2._12 + m1.ty * m2._22 + m2.ty);
        }
    }
    Matrix.Deg2Rad = Math.PI / 180;
    Matrix.Identity = new Matrix();
    ez.Matrix = Matrix;
    let AlignMode;
    (function (AlignMode) {
        AlignMode[AlignMode["Left"] = 0] = "Left";
        AlignMode[AlignMode["Center"] = 1] = "Center";
        AlignMode[AlignMode["Right"] = 2] = "Right";
        AlignMode[AlignMode["Top"] = 0] = "Top";
        AlignMode[AlignMode["VCenter"] = 4] = "VCenter";
        AlignMode[AlignMode["Bottom"] = 8] = "Bottom";
    })(AlignMode = ez.AlignMode || (ez.AlignMode = {}));
    ;
    let TextFormat;
    (function (TextFormat) {
        TextFormat[TextFormat["SingleLine"] = 0] = "SingleLine";
        TextFormat[TextFormat["WordBreak"] = 1] = "WordBreak";
        TextFormat[TextFormat["MultiLine"] = 2] = "MultiLine";
        TextFormat[TextFormat["Ellipse"] = 4] = "Ellipse";
        TextFormat[TextFormat["Shrink"] = 8] = "Shrink";
        TextFormat[TextFormat["RichText"] = 16] = "RichText";
    })(TextFormat = ez.TextFormat || (ez.TextFormat = {}));
    let BlendMode;
    (function (BlendMode) {
        BlendMode[BlendMode["Normal"] = 0] = "Normal";
        BlendMode[BlendMode["Add"] = 1] = "Add";
        BlendMode[BlendMode["Copy"] = 2] = "Copy";
        BlendMode[BlendMode["Subtract"] = 3] = "Subtract";
        BlendMode[BlendMode["Multiply"] = 4] = "Multiply";
        BlendMode[BlendMode["Screen"] = 5] = "Screen";
    })(BlendMode = ez.BlendMode || (ez.BlendMode = {}));
})(ez || (ez = {}));
var ez;
(function (ez) {
    ez.WebAudio = null;
    var tracks = [];
    var bgmGain;
    var sfxGain;
    var started = false;
    var musicAudio;
    var sfxVolume = 1;
    var bgmVolume = 1;
    var nativeAudio;
    ez.bgmEnable = true;
    ez.sfxEnable = true;
    if (typeof NativeAudio != "undefined")
        nativeAudio = NativeAudio;
    if (!nativeAudio && PLATFORM != 3) {
        ez.initCall(function () {
            var c = window.AudioContext || window["webkitAudioContext"];
            if (c) {
                ez.WebAudio = new c();
                sfxGain = ez.WebAudio.createGain();
                sfxGain.gain.value = 1;
                sfxGain.connect(ez.WebAudio.destination);
                bgmGain = ez.WebAudio.createGain();
                bgmGain.gain.value = 1;
                bgmGain.connect(ez.WebAudio.destination);
            }
        });
    }
    let internal;
    (function (internal) {
        function startAudio() {
            if (nativeAudio || started || !ez.WebAudio)
                return;
            started = true;
            var buf = ez.WebAudio.createBuffer(1, 4410, 44100);
            var src = ez.WebAudio.createBufferSource();
            src.buffer = buf;
            src.connect(sfxGain);
            src.start(0);
        }
        internal.startAudio = startAudio;
    })(internal = ez.internal || (ez.internal = {}));
    function setBGMVolume(val) {
        if (musicAudio)
            musicAudio.volume = val;
        bgmVolume = val;
        if (nativeAudio) {
            nativeAudio.setMusicVolume(0, val);
            return;
        }
        if (!ez.WebAudio)
            return;
        bgmGain.gain.value = val;
    }
    ez.setBGMVolume = setBGMVolume;
    function setSFXVolume(val) {
        sfxVolume = val;
        if (nativeAudio) {
            nativeAudio.setSFXVolume(val);
            return;
        }
        if (!ez.WebAudio)
            return;
        sfxGain.gain.value = val;
    }
    ez.setSFXVolume = setSFXVolume;
    function playSFX(name) {
        if (!ez.sfxEnable)
            return;
        var res = ez.getRes(name);
        if (!res)
            return;
        if (nativeAudio) {
            nativeAudio.playSFX(getUrl(res.url));
            return;
        }
        else if (ez.WebAudio) {
            function play(buf) {
                var src = ez.WebAudio.createBufferSource();
                src.buffer = buf;
                src.connect(sfxGain);
                src.start(0);
            }
            if (res.state == 3)
                play(res.getData());
            else if (res.state != 4) {
                res.load(r => {
                    if (r)
                        play(res.getData());
                }, null);
            }
        }
        else {
            function playAudio(audio) {
                audio.currentTime = 0;
                audio.volume = sfxVolume;
                audio.play();
            }
            if (res.state == 3)
                playAudio(res.getData());
            else {
                res.load(r => {
                    if (r)
                        playAudio(res.getData());
                }, null);
            }
        }
    }
    ez.playSFX = playSFX;
    function stopMusic(track, fadeOut) {
        if (!ez.bgmEnable)
            return;
        if (nativeAudio) {
            nativeAudio.stopMusic(track, fadeOut);
            return;
        }
        if (ez.WebAudio) {
            if (!tracks[track] || !tracks[track].node)
                return;
            var t = tracks[track];
            if (fadeOut) {
                var node = t.node;
                t.gain.gain.linearRampToValueAtTime(0, ez.WebAudio.currentTime + fadeOut * 0.001);
                ez.setTimer(fadeOut + 10, () => {
                    node.stop(0);
                    node.disconnect();
                });
            }
            else {
                try {
                    t.node.stop(0);
                    t.node.disconnect();
                }
                catch (e) {
                    Log.error("stop music error: %o", e);
                }
                t.node = null;
            }
        }
        else {
            if (!musicAudio)
                return;
            if (fadeOut) {
                var audio = musicAudio;
                musicAudio = null;
                audio.volume = 0.7;
                ez.setTimer(fadeOut * 0.5, () => {
                    audio.volume = 0.3;
                    ez.setTimer(fadeOut * 0.5, () => {
                        audio.currentTime = 10000;
                        audio.volume = 0;
                        audio.loop = false;
                        audio.pause();
                        audio.volume = 0;
                    });
                });
            }
            else {
                musicAudio.currentTime = 10000;
                musicAudio.volume = 0;
                musicAudio.loop = false;
                musicAudio.pause();
                musicAudio = null;
            }
        }
    }
    ez.stopMusic = stopMusic;
    function getUrl(url) {
        var prefix = url.substring(0, 4);
        if (prefix != "http" && prefix != "file") {
            var href = window.location.href;
            url = href.substring(0, href.lastIndexOf("/") + 1) + url;
        }
        return url;
    }
    function playMusic(track, name, loop, volume, fadeIn) {
        if (!ez.bgmEnable)
            return;
        volume = volume || 1;
        loop = !!loop;
        var res = ez.getRes(name);
        if (!res)
            return;
        if (nativeAudio) {
            nativeAudio.playMusic(track, getUrl(res.url), volume, loop, fadeIn || 0);
            return;
        }
        stopMusic(track);
        if (ez.WebAudio) {
            function play(buf) {
                stopMusic(track);
                if (!tracks[track]) {
                    tracks[track] = { gain: ez.WebAudio.createGain(), node: null };
                    tracks[track].gain.connect(bgmGain);
                }
                var t = tracks[track];
                t.node = ez.WebAudio.createBufferSource();
                t.node.buffer = buf;
                if (loop)
                    t.node.loop = true;
                if (fadeIn) {
                    var gain = t.gain.gain;
                    gain.value = 0;
                    gain.linearRampToValueAtTime(volume, ez.WebAudio.currentTime + fadeIn * 0.001);
                }
                else
                    t.gain.gain.value = volume;
                t.node.connect(t.gain);
                t.node.start(0);
            }
            if (res.state == 3)
                play(res.getData());
            else if (res.state != 4) {
                res.load(r => {
                    if (r)
                        play(res.getData());
                }, null);
            }
        }
        else {
            function playAudio(audio) {
                musicAudio = audio;
                audio.currentTime = 0;
                audio.volume = bgmVolume;
                audio.loop = !!loop;
                audio.play();
            }
            if (res.state == 3)
                playAudio(res.getData());
            else {
                res.load(r => {
                    if (r)
                        playAudio(res.getData());
                }, null);
            }
        }
    }
    ez.playMusic = playMusic;
})(ez || (ez = {}));
var ez;
(function (ez) {
    var gl = null;
    var MAX_QUAD = 30;
    function getGL() {
        return gl;
    }
    ez.getGL = getGL;
    ez.RenderContext = {};
    var RC = ez.RenderContext;
    let internal;
    (function (internal) {
        function createWGLRenderContext(wgl) {
            ez.Texture.init(wgl);
            gl = wgl;
            var currQuad = 0;
            var currTex = [];
            var currGrad;
            var vaoBind;
            var VAOExt = gl.getExtension("OES_vertex_array_object");
            var vaoBinded = false;
            var defTex;
            var gradTex;
            var defTex3d;
            var fontTex;
            var profile;
            var currShader;
            var currBlendMode;
            var fillColorStr;
            var currClip;
            var scissors;
            var rtWidth = 0;
            var rtHeight = 0;
            var gradBuffer = new Uint8Array(16 * 4);
            var quads = ezasm.handleToFloatArray(ezasm.getQuadsBuffer(), MAX_QUAD * 16);
            var recorder;
            (function () {
                var vbo = gl.createBuffer();
                var ibo = gl.createBuffer();
                var maxQuad = 128;
                var numIndices = maxQuad * 6;
                var indices = new Uint16Array(numIndices);
                var vertices = new Float32Array(maxQuad * 12);
                for (let i = 0; i < maxQuad; i++) {
                    vertices[i * 12] = 0;
                    vertices[i * 12 + 1] = 0;
                    vertices[i * 12 + 2] = i;
                    vertices[i * 12 + 3] = 1;
                    vertices[i * 12 + 4] = 0;
                    vertices[i * 12 + 5] = i;
                    vertices[i * 12 + 6] = 1;
                    vertices[i * 12 + 7] = 1;
                    vertices[i * 12 + 8] = i;
                    vertices[i * 12 + 9] = 0;
                    vertices[i * 12 + 10] = 1;
                    vertices[i * 12 + 11] = i;
                }
                for (var i = 0, j = 0; i < numIndices; i += 6, j += 4) {
                    indices[i + 0] = j;
                    indices[i + 1] = j + 1;
                    indices[i + 2] = j + 2;
                    indices[i + 3] = j;
                    indices[i + 4] = j + 2;
                    indices[i + 5] = j + 3;
                }
                gl.bindBuffer(34962, vbo);
                gl.bufferData(34962, vertices, 35044);
                gl.bindBuffer(34963, ibo);
                gl.bufferData(34963, indices, 35044);
                function bindVB() {
                    gl.bindBuffer(34962, vbo);
                    gl.enableVertexAttribArray(0);
                    gl.enableVertexAttribArray(1);
                    gl.vertexAttribPointer(0, 2, 5126, false, 3 * 4, 0);
                    gl.vertexAttribPointer(1, 1, 5126, false, 3 * 4, 2 * 4);
                    gl.bindBuffer(34963, ibo);
                }
                if (VAOExt) {
                    var vao = VAOExt.createVertexArrayOES();
                    VAOExt.bindVertexArrayOES(vao);
                    bindVB();
                    VAOExt.bindVertexArrayOES(null);
                    vaoBind = VAOExt.bindVertexArrayOES.bind(VAOExt, vao);
                }
                else
                    vaoBind = bindVB;
                defTex = ez.RawTexture.create("_null", 1, 1, 6408, 33071, 9728, new Uint8Array([255, 255, 255, 255]));
                defTex3d = ez.RawTexture.create("_empty", 1, 1, 6408, 33071, 9728, new Uint8Array([0, 0, 0, 0]));
                fontTex = ez.RawTexture.create("_font", ez.FontCache.Width, ez.FontCache.Height, 6408, 33071, 9729, null);
                for (i = 0; i < 16 * 4; i++)
                    gradBuffer[i] = 255;
                gradTex = ez.RawTexture.create("_gradient", 16, 1, 6408, 33071, 9729, gradBuffer);
                currBlendMode = ez.BlendMode.Normal;
                gl.blendFunc(1, 771);
                gl.blendEquation(32774);
                gl.cullFace(1029);
                gl.frontFace(2305);
                gl.disable(2884);
                gl.disable(2929);
                gl.enable(3042);
                gl.enable(3089);
                gl.blendFunc(1, 771);
                gl.blendEquation(32774);
                gl.disable(2884);
            })();
            function addQuad(flags) {
                if (currQuad >= MAX_QUAD)
                    RC.flush();
                ezasm.addQuad(currQuad, flags);
                currQuad++;
            }
            function setTexture(texture, idx) {
                if (currTex[idx] != texture.id) {
                    RC.flush();
                    if (recorder)
                        recorder.push(setTextureCmd(texture, idx));
                    texture.bindTexture(idx);
                    currTex[idx] = texture.id;
                    if (PROFILING && profile) {
                        profile.setTexture++;
                        ez.Profile.addCommand("setTexture" + idx + " " + texture.name);
                    }
                }
            }
            function setTexture3d(texture, idx) {
                texture = texture || defTex3d;
                if (texture.empty)
                    texture = defTex3d;
                if (currTex[idx] != texture.id) {
                    texture.bindTexture(idx);
                    currTex[idx] = texture.id;
                    if (PROFILING && profile) {
                        profile.setTexture++;
                        ez.Profile.addCommand("setTexture" + idx + " " + texture.name);
                    }
                }
            }
            function setBlend(blendMode) {
                switch (blendMode) {
                    case ez.BlendMode.Normal:
                        gl.blendFunc(1, 771);
                        gl.blendEquation(32774);
                        break;
                    case ez.BlendMode.Add:
                        gl.blendFunc(1, 1);
                        gl.blendEquation(32774);
                        break;
                    case ez.BlendMode.Multiply:
                        gl.blendFunc(32968, 0);
                        gl.blendEquation(32774);
                        break;
                    case ez.BlendMode.Copy:
                        gl.blendFunc(1, 0);
                        gl.blendEquation(32774);
                        break;
                    case ez.BlendMode.Subtract:
                        gl.blendFunc(1, 1);
                        gl.blendEquation(32778);
                        break;
                }
            }
            RC.createVAO = function (bindFunc) {
                if (VAOExt) {
                    var vao = VAOExt.createVertexArrayOES();
                    VAOExt.bindVertexArrayOES(vao);
                    bindFunc(gl);
                    VAOExt.bindVertexArrayOES(null);
                    return VAOExt.bindVertexArrayOES.bind(VAOExt, vao);
                }
                else {
                    return bindFunc.bind(null, gl);
                }
            };
            function drawTrianglesCmd(vaoBinder, count) {
                return function () {
                    vaoBinded = false;
                    vaoBinder();
                    gl.drawElements(4, count, 5123, 0);
                };
            }
            RC.drawTriangles = function (vaoBinder, count) {
                RC.flush();
                vaoBinded = false;
                vaoBinder();
                gl.drawElements(4, count, 5123, 0);
                if (PROFILING && profile) {
                    profile.triangle += count;
                    profile.drawcall++;
                }
                if (recorder)
                    recorder.push(drawTrianglesCmd(vaoBinder, count));
            };
            function drawQuads(count) {
                if (PROFILING && profile) {
                    profile.drawQuad += count;
                    profile.flush++;
                    ez.Profile.addCommand("draw " + currQuad + " quad");
                }
                if (!vaoBinded) {
                    vaoBind();
                    vaoBinded = true;
                }
                gl.drawElements(4, currQuad * 6, 5123, 0);
                if (PROFILING && profile) {
                    profile.triangle += currQuad * 2;
                    profile.drawcall++;
                }
            }
            function flushQuadsCmd(count) {
                var data = new Float32Array(count * 16);
                data.set(quads.slice(0, count * 16));
                return function () {
                    quads.set(data);
                    if (!vaoBinded) {
                        vaoBind();
                        vaoBinded = true;
                    }
                    currShader.bind("quads", quads, true);
                    gl.drawElements(4, count * 6, 5123, 0);
                    currQuad = 0;
                };
            }
            RC.flush = function () {
                if (currQuad > 0) {
                    currShader.bind("quads", quads, true);
                    drawQuads(currQuad);
                    if (recorder)
                        recorder.push(flushQuadsCmd(currQuad));
                    currQuad = 0;
                }
            };
            RC.fillRect = function (w, h, transform) {
                ezasm.renderScaleTrans(w, h, transform);
                if (currTex[0] == gradTex.id) {
                    ezasm.setUVGrad(currGrad.x0, currGrad.y0, currGrad.x1, currGrad.y1, w, h, currGrad.colors.length / 16);
                    addQuad(1);
                }
                else {
                    setTexture(defTex, 0);
                    addQuad(2);
                }
            };
            RC.drawImage = function (tex, transform, w, h, srcRect) {
                var m = tex.margin;
                if (m) {
                    var sx = w / tex.width;
                    var sy = h / tex.height;
                    w = (tex.width - m[2] - m[0]) * sx;
                    h = (tex.height - m[3] - m[1]) * sy;
                    var tx = m[0] * sx;
                    var ty = m[1] * sy;
                    ezasm.renderScaleTranslateTrans(w, h, tx, ty, transform);
                }
                else {
                    ezasm.renderScaleTrans(w, h, transform);
                }
                if (srcRect)
                    ezasm.setUV(srcRect.left * tex.invWidth, srcRect.top * tex.invHeight, srcRect.width * tex.invWidth, srcRect.height * tex.invHeight);
                else
                    ezasm.setUVIdentity();
                setTexture(tex, 0);
                addQuad(3);
            };
            RC.drawImageRepeat = function (texture, transform, width, height, repeat) {
                var srcRect = texture.subRect;
                var texWidth = texture.width;
                var texHeight = texture.height;
                setTexture(texture, 0);
                var u = 1;
                var v = 1;
                if (repeat === "repeat" || repeat === "repeat-x")
                    u = width / texWidth;
                if (repeat === "repeat" || repeat === "repeat-y")
                    v = height / texHeight;
                var tilingShader = ez.Effect.get("tiling");
                RC.setShader(tilingShader);
                var iw = texture.invWidth;
                var ih = texture.invHeight;
                if (srcRect) {
                    tilingShader.bind("tiling", [srcRect.left * iw, srcRect.top * ih, (srcRect.width - 1) * iw, (srcRect.height - 1) * ih], true);
                }
                else {
                    tilingShader.bind("tiling", [0, 0, 1 - iw, 1 - ih], true);
                }
                ezasm.renderScaleTrans(width, height, transform);
                ezasm.setUV(0, 0, u, v);
                addQuad(3);
            };
            RC.drawImageS9 = function (tex, trans, s9, width, height, srcRect) {
                var i, j;
                var m = tex.margin;
                var ml = 0, mt = 0, mr = 0, mb = 0;
                if (m) {
                    ml = m[0];
                    mt = m[1];
                    mr = m[2];
                    mb = m[3];
                }
                width -= mr;
                height -= mb;
                if (width <= ml || height <= mt)
                    return;
                setTexture(tex, 0);
                var x = srcRect ? srcRect.left : 0;
                var y = srcRect ? srcRect.top : 0;
                var r = x + (srcRect ? srcRect.width : tex.width - ml - mr);
                var b = y + (srcRect ? srcRect.height : tex.height - mt - mb);
                var sl = s9[0] - ml;
                var st = s9[1] - mt;
                var sr = s9[2] - mr;
                var sb = s9[3] - mb;
                var xPos = [ml];
                var yPos = [mt];
                var uPos = [x];
                var vPos = [y];
                if (sl > 0) {
                    var w = Math.min(width, sl);
                    xPos.push(w);
                    uPos.push(x + w);
                }
                if (st > 0) {
                    var h = Math.min(height, st);
                    yPos.push(h);
                    vPos.push(y + h);
                }
                if (sr > 0 && width > sl) {
                    xPos.push(width - sr);
                    uPos.push(r - sr);
                }
                if (sb > 0 && height > st) {
                    yPos.push(height - sb);
                    vPos.push(b - sb);
                }
                if (sl + sr < width) {
                    xPos.push(width);
                    uPos.push(r);
                }
                if (st + sb < height) {
                    yPos.push(height);
                    vPos.push(b);
                }
                for (i = 0; i < uPos.length; i++)
                    uPos[i] *= tex.invWidth;
                for (i = 0; i < vPos.length; i++)
                    vPos[i] *= tex.invHeight;
                var cnt = xPos.length;
                for (i = 0; i < yPos.length - 1; i++) {
                    for (j = 0; j < cnt - 1; j++) {
                        ezasm.renderScaleTranslateTrans(xPos[j + 1] - xPos[j], yPos[i + 1] - yPos[i], xPos[j], yPos[i], trans);
                        ezasm.setUV(uPos[j], vPos[i], uPos[j + 1] - uPos[j], vPos[i + 1] - vPos[i]);
                        addQuad(3);
                    }
                }
            };
            function setBlendCmd(blendMode) {
                return function () {
                    currBlendMode = blendMode;
                    setBlend(blendMode);
                };
            }
            RC.setAlphaBlend = function (value, blendMode) {
                ezasm.setOpacity(value);
                if (currBlendMode != blendMode) {
                    RC.flush();
                    if (PROFILING && profile) {
                        profile.blendChange++;
                        ez.Profile.addCommand("set blendMode " + ez.BlendMode[blendMode]);
                    }
                    currBlendMode = blendMode;
                    setBlend(blendMode);
                    if (recorder)
                        recorder.push(setBlendCmd(blendMode));
                }
            };
            RC.setFillColor = function (color) {
                if (fillColorStr != color) {
                    fillColorStr = color;
                    var c;
                    if (color[0] == "#") {
                        var s = color.substring(1);
                        if (s.length == 3)
                            s = s[0] + "0" + s[1] + "0" + s[2] + "0";
                        c = parseInt(s, 16);
                    }
                    else
                        c = parseInt(fillColorStr);
                    var b = (c & 0xff) * 0.00392156862745;
                    var g = (c & 0xff00) * 1.5259021e-5;
                    var r = (c & 0xff0000) * 5.960555428e-8;
                    ezasm.setFillColor(r, g, b);
                }
            };
            function setFillGradientCmd(b) {
                var data = new Uint8Array(16 * 4);
                data.set(b);
                return function () {
                    setTexture(gradTex, 0);
                    gl.texSubImage2D(3553, 0, 0, 0, 16, 1, 6408, 5121, data);
                };
            }
            RC.setFillGradient = function (grad) {
                RC.flush();
                currGrad = grad;
                var b = gradBuffer;
                var colors = grad.colors;
                for (var i = 0; i < colors.length; i++) {
                    var s = colors[i].substring(1);
                    if (s.length == 3)
                        s = s[0] + '0' + s[1] + '0' + s[2] + '0';
                    var c = parseInt(s, 16);
                    b[i * 4] = (c & 0xff0000) >> 16;
                    b[i * 4 + 1] = (c & 0xff00) >> 8;
                    b[i * 4 + 2] = c & 0xff;
                    b[i * 4 + 3] = s.length > 6 ? (c >> 24) & 0xff : 0xff;
                }
                for (i = colors.length; i < 16; i++) {
                    var j = i * 4;
                    b[j] = b[j - 4];
                    b[j + 1] = b[j - 3];
                    b[j + 2] = b[j - 2];
                    b[j + 3] = b[j - 1];
                }
                setTexture(gradTex, 0);
                gl.texSubImage2D(3553, 0, 0, 0, 16, 1, 6408, 5121, b);
                if (recorder)
                    recorder.push(setFillGradientCmd(b));
            };
            function clipCmd(clip) {
                return function () {
                    gl.scissor((clip.left * RC.scale) | 0, ((rtHeight - clip.bottom) * RC.scale) | 0, (clip.width * RC.scale) | 0, (clip.height * RC.scale) | 0);
                };
            }
            RC.pushClipRect = function (bound) {
                RC.flush();
                var clip = bound.clone();
                if (PROFILING && profile) {
                    profile.setClip++;
                    ez.Profile.addCommand(`pushClipRect [${clip.left}, ${clip.top}, ${clip.width}, ${clip.height}]`);
                }
                currClip = scissors[scissors.length - 1];
                clip.left = Math.max(clip.left, currClip.left);
                clip.top = Math.max(clip.top, currClip.top);
                clip.width = Math.max(0, Math.min(clip.right, currClip.right) - clip.left);
                clip.height = Math.max(0, Math.min(clip.bottom, currClip.bottom) - clip.top);
                if (recorder)
                    recorder.push(clipCmd(clip));
                scissors.push(clip);
                gl.scissor((clip.left * RC.scale) | 0, ((rtHeight - clip.bottom) * RC.scale) | 0, (clip.width * RC.scale) | 0, (clip.height * RC.scale) | 0);
                return clip.width > 0 && clip.height > 0;
            };
            RC.popClipRect = function () {
                RC.flush();
                scissors.pop();
                currClip = scissors[scissors.length - 1];
                if (PROFILING && profile) {
                    profile.setClip++;
                    ez.Profile.addCommand(`popClipRect [${currClip.left}, ${currClip.top}, ${currClip.width}, ${currClip.height}]`);
                }
                if (recorder)
                    recorder.push(clipCmd(currClip));
                gl.scissor((currClip.left * RC.scale) | 0, ((rtHeight - currClip.bottom) * RC.scale) | 0, (currClip.width * RC.scale) | 0, (currClip.height * RC.scale) | 0);
            };
            function setShaderCmd(shader) {
                return function () {
                    gl.useProgram(shader.proc);
                    currShader = shader;
                };
            }
            function setShaderParams(shader, params) {
                var unis = shader.uniforms;
                for (var k in unis) {
                    var v = params[k];
                    if (v !== undefined) {
                        if (shader.texUniforms && shader.texUniforms[k]) {
                            var idx = shader.texUniforms[k];
                            shader.bind(k, idx);
                            if (typeof (v) == "string")
                                v = ez.getRes(v);
                            if (v.getData().ready)
                                RC.bindTexture(v.getData(), idx);
                            else {
                                v.load();
                                RC.bindTexture(defTex, idx);
                            }
                        }
                        else
                            shader.bind(k, params[k]);
                    }
                }
            }
            function setShaderParamsCmd(shader, params) {
                return function () {
                    setShaderParams(shader, params);
                };
            }
            RC.setShader = function (shader, params) {
                if (!shader)
                    shader = ez.Effect.default;
                if (shader !== currShader) {
                    RC.flush();
                    if (PROFILING && profile) {
                        ez.Profile.addCommand(`setShader ${shader.name}`);
                        profile.setShader++;
                    }
                    gl.useProgram(shader.proc);
                    currShader = shader;
                    if (recorder)
                        recorder.push(setShaderCmd(shader));
                }
                if (params) {
                    RC.flush();
                    if (recorder)
                        recorder.push(setShaderParamsCmd(shader, params));
                    setShaderParams(shader, params);
                }
            };
            function setTextureCmd(tex, idx) {
                return function () {
                    tex.bindTexture(idx);
                    currTex[idx] = tex.id;
                };
            }
            RC.bindTexture = function bindTexture(tex, idx) {
                setTexture(tex, idx);
            };
            RC.drawTextCache = function (x, y, cache, trans) {
                var r = cache.region;
                setTexture(fontTex, 0);
                ezasm.renderScaleTranslateTrans(cache.w, cache.h, x, y, trans);
                ezasm.setUV(r[0], r[1], r[2], r[3]);
                addQuad(1);
            };
            RC.begin3DRender = function (bound) {
                if (PROFILING && profile)
                    ez.Profile.addCommand("begin3DRender");
                RC.flush();
                gl.disable(3042);
                gl.enable(2884);
                gl.enable(2929);
                if (bound)
                    gl.viewport((bound.left * RC.scale) | 0, ((rtHeight - bound.bottom) * RC.scale) | 0, (bound.width * RC.scale) | 0, (bound.height * RC.scale) | 0);
                if (VAOExt)
                    VAOExt.bindVertexArrayOES(null);
                if (recorder)
                    recorder = null;
                return {
                    width: rtWidth,
                    height: rtHeight,
                    gl: gl,
                    profiler: profile,
                    shader: null,
                    setShader: function (shader) {
                        if (this.shader != shader) {
                            if (PROFILING && profile) {
                                ez.Profile.addCommand(`setShader ${shader.name}`);
                                profile.setShader++;
                            }
                            shader.clearCache();
                            gl.useProgram(shader.proc);
                            this.shader = shader;
                        }
                    },
                    defTexture: defTex3d,
                    bindTexture: function (tex, idx) {
                        setTexture3d(tex, idx);
                    },
                    bindCubeTexture: function (tex, idx) {
                        currTex[idx] = "_cube";
                        gl.activeTexture(33984 + idx);
                        gl.bindTexture(34067, tex.glTex);
                    },
                    lastPrimitive: 0,
                    end: function () {
                        gl.enable(3042);
                        gl.disable(2884);
                        gl.disable(32926);
                        gl.disable(2929);
                        setBlend(currBlendMode);
                        currShader = null;
                        vaoBinded = false;
                        if (PROFILING && profile)
                            ez.Profile.addCommand("end3drender");
                        if (bound)
                            gl.viewport(0, 0, (rtWidth * RC.scale) | 0, (rtHeight * RC.scale) | 0);
                    }
                };
            };
            RC.beginRender = function (target, profileData) {
                ez.FontCache.updateFontTexture(gl, fontTex, profileData);
                RC.profile = profileData;
                RC.width = rtWidth = target.width;
                RC.height = rtHeight = target.height;
                RC.invWidth = 2 / rtWidth;
                RC.invHeight = -2 / rtHeight;
                RC.scale = target.scale;
                ezasm.setFrameBufferSize(target.width, target.height);
                profile = profileData;
                gl.bindFramebuffer(36160, target.framebuffer);
                gl.clear(16384);
                gl.viewport(0, 0, (rtWidth * RC.scale) | 0, (rtHeight * RC.scale) | 0);
                gl.scissor(0, 0, (rtWidth * RC.scale) | 0, (rtHeight * RC.scale) | 0);
                currShader = null;
                currClip = new ez.Rect(0, 0, rtWidth, rtHeight);
                currTex = [];
                currQuad = 0;
                scissors = [currClip];
                vaoBinded = false;
            };
            RC.endRender = function () {
                RC.flush();
                if (VAOExt)
                    VAOExt.bindVertexArrayOES(null);
                profile = null;
                if (recorder) {
                    Log.error("missing end recorder.");
                    recorder = null;
                }
                ez.Texture.addTextureAge();
            };
            RC.beginRecorder = function () {
                RC.flush();
                if (recorder)
                    return false;
                recorder = [];
                currTex = [];
                return true;
            };
            RC.endRecorder = function () {
                RC.flush();
                var r = recorder;
                if (r)
                    r.fontRev = ez.FontCache.rev;
                recorder = null;
                return r;
            };
            RC.replay = function (r) {
                RC.flush();
                var cmds = r;
                if (recorder)
                    recorder = recorder.concat(cmds);
                for (let i = 0; i < cmds.length; i++)
                    cmds[i]();
            };
        }
        internal.createWGLRenderContext = createWGLRenderContext;
    })(internal = ez.internal || (ez.internal = {}));
})(ez || (ez = {}));
var ez;
(function (ez) {
    class WGLPerFrameProfiler {
        constructor() {
            this.flush = 0;
            this.setClip = 0;
            this.setTexture = 0;
            this.setShader = 0;
            this.drawQuad = 0;
            this.drawcall = 0;
            this.triangle = 0;
            this.blendChange = 0;
            this.fontCache = 0;
            this.fontCacheSize = [];
        }
    }
    ez.WGLPerFrameProfiler = WGLPerFrameProfiler;
    class CanvasPerFrameProfiler {
        constructor() {
            this.fillRect = 0;
            this.drawImage = 0;
            this.drawText = 0;
            this.transfromChange = 0;
        }
    }
    ez.CanvasPerFrameProfiler = CanvasPerFrameProfiler;
    let Profile;
    (function (Profile) {
        function beginFrameProfiling(detail, onData) {
            if (!PROFILING)
                throw new Error("no profiling");
            commandDetail = detail;
            profileCB = onData;
            frameCounter = 0;
        }
        Profile.beginFrameProfiling = beginFrameProfiling;
        function endFrameProfiling() {
            if (!PROFILING)
                return;
            profileCB = null;
        }
        Profile.endFrameProfiling = endFrameProfiling;
        function beginEventProfiling() {
            events = [];
        }
        Profile.beginEventProfiling = beginEventProfiling;
        function endEventProfiling() {
            if (!events)
                throw new Error("no profiling");
            let r = events;
            events = null;
            return r;
        }
        Profile.endEventProfiling = endEventProfiling;
        function now() {
            return timer.now();
        }
        Profile.now = now;
        function newFrame() {
            if (!profileCB)
                return null;
            if (useWGL)
                frameProfiler = new WGLPerFrameProfiler();
            else
                frameProfiler = new CanvasPerFrameProfiler();
            if (commandDetail)
                frameProfiler.commands = [];
            frameProfiler.frame = frameCounter++;
            frameProfiler.updateTime = frameProfiler.startTime = Profile.now();
            return frameProfiler;
        }
        Profile.newFrame = newFrame;
        function endFrame() {
            if (!profileCB)
                return;
            frameProfiler.renderTime = Profile.now() - frameProfiler.renderTime;
            frameProfiler.endTime = Profile.now();
            profileCB(frameProfiler);
            frameProfiler = null;
        }
        Profile.endFrame = endFrame;
        function addCommand(cmd) {
            if (!frameProfiler || !frameProfiler.commands)
                return;
            var t = now() - frameProfiler.updateTime;
            frameProfiler.commands.push([t, cmd]);
        }
        Profile.addCommand = addCommand;
        function newEvent(type, parameter) {
            if (!events)
                return null;
            var e = new Event(type, parameter);
            events.push(e);
            return e;
        }
        Profile.newEvent = newEvent;
        var events;
        var timer = Date;
        if (typeof performance != "undefined")
            timer = performance;
        class Event {
            constructor(type, args) {
                this.type = type;
                this.args = args;
                this.start = now();
            }
            addStep(name) {
                if (!this.steps)
                    this.steps = [];
                this.steps.push({ name: name, time: now() - this.start });
            }
            end() {
                this.time = now() - this.start;
            }
        }
    })(Profile = ez.Profile || (ez.Profile = {}));
    var frameCounter = 0;
    var frameProfiler;
    var commandDetail;
    var profileCB;
})(ez || (ez = {}));
var ez;
(function (ez) {
    let internal;
    (function (internal) {
        function createCanvas() {
            if (PLATFORM == 3)
                return wx.createCanvas();
            else
                return document.createElement("canvas");
        }
        internal.createCanvas = createCanvas;
    })(internal = ez.internal || (ez.internal = {}));
    class TouchDataImpl {
        constructor(id, type, x, y, e) {
            this.bubble = true;
            this.id = id;
            this.type = type;
            this.screenX = x;
            this.screenY = y;
            this.rawEvent = e;
            this.time = Date.now();
        }
        capture() {
            root.capture(this.id, this.target);
        }
        excludeCapture() {
            root.cancelTouch(this.id, this.target);
        }
    }
    var gl = null;
    function getLocation(e, div, invScale) {
        var doc = document.documentElement;
        var body = document.body;
        var l = 0, t = 0, x, y;
        if (div.getBoundingClientRect) {
            var box = div.getBoundingClientRect();
            l = box.left;
            t = box.top;
        }
        l += window.pageXOffset - doc.clientLeft;
        t += window.pageYOffset - doc.clientTop;
        if (e.pageX != null) {
            x = e.pageX;
            y = e.pageY;
        }
        else {
            l -= body.scrollLeft;
            t -= body.scrollTop;
            x = e.clientX;
            y = e.clientY;
        }
        var id = -1;
        if (typeof e.identifier == "number")
            id = e.identifier;
        else if (typeof e.pointerId == "number")
            id = e.pointerId;
        return {
            id: id,
            x: (x - l) * invScale,
            y: (y - t) * invScale
        };
    }
    class UIRootBase extends ez.DataModel {
        constructor() {
            super(...arguments);
            this.touchEvents = [];
            this._sizeDirty = false;
            this._childs = [];
            this._sizeChanged = false;
            this.touchCaptures = {};
            this._namedChilds = {};
        }
        isCaptured(id) {
            return !!this.touchCaptures[id];
        }
        capture(id, ctrl) {
            if (this.touchCaptures[id]) {
                if (this.touchCaptures[id].indexOf(ctrl) == -1)
                    this.touchCaptures[id].push(ctrl);
            }
            else
                this.touchCaptures[id] = [ctrl];
        }
        cancelTouch(id, ctrl) {
            if (this.touchCaptures[id]) {
                var arr = this.touchCaptures[id];
                this.touchCaptures[id] = [ctrl];
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] != ctrl && arr[i].onTouchCancel)
                        arr[i].onTouchCancel(id);
                }
            }
        }
        screenToClient(x, y) {
            return new ez.Point(x, y);
        }
        clientToScreen(x, y) {
            return new ez.Point(x, y);
        }
        get _displayStage() {
            return this._stage;
        }
        createChild(uiclass, props) {
            var klass = ez.ui.getGuiClass(uiclass.ClassName);
            if (!klass)
                throw new Error(`${uiclass.ClassName} is not registered.`);
            let c = new klass(this);
            this._childs.push(c);
            this.childSizeChanged();
            if (props) {
                c._setProps(props);
                if (props.id) {
                    var childs = this._namedChilds;
                    var id = props.id;
                    if (childs[id])
                        Log.warn("control id conflict.", id);
                    childs[id] = c;
                    c._id = id;
                }
            }
            return c;
        }
        clear() {
            var arr = this._childs.concat();
            for (var i = 0; i < arr.length; i++)
                arr[i].dispose();
        }
        renderImpl(frameProfiler) {
            if (PROFILING) {
                ez.Profile.addCommand("begin render");
            }
            this._stage.render(this._screenBuffer, frameProfiler);
        }
        find(id, recursive) {
            for (var i = 0; i < this._childs.length; i++) {
                var c = this._childs[i];
                if (c.id == id)
                    return c;
                if (typeof c.find === "function") {
                    var k = c.find(id, recursive);
                    if (k)
                        return k;
                }
            }
            return null;
        }
        _fireEvent() {
        }
        _removeChild(child) {
            var idx = this._childs.indexOf(child);
            if (idx == -1)
                throw new Error("child not exist!");
            this._childs.splice(idx, 1);
        }
        childSizeChanged() {
            this._sizeDirty = true;
        }
        get width() {
            return this.getProp("width");
        }
        set width(v) {
            this.setProp("width", v);
        }
        get height() {
            return this.getProp("height");
        }
        set height(v) {
            this.setProp("height", v);
        }
        addScreenResizeListener(func, ctx) {
            func = ctx ? func.bind(ctx) : func;
            if (!this._onScreenResize)
                this._onScreenResize = [];
            this._onScreenResize.push(func);
        }
        render(frameProfiler) {
            if (!this._stage.dirty)
                return;
            this.renderImpl(frameProfiler);
        }
        checkSizeMeasure() {
            if (!this._sizeDirty && !this._sizeChanged)
                return;
            var w = this.width;
            var h = this.height;
            for (var i = 0; i < this._childs.length; i++) {
                var child = this._childs[i];
                child.measureBound(w, h, this._sizeChanged);
            }
            this._sizeChanged = false;
            this._sizeDirty = false;
        }
        findControls(x, y) {
            if (x < 0 || x >= this.width || y < 0 || y >= this.height)
                return null;
            for (var i = this._childs.length - 1; i >= 0; i--) {
                var r = this._childs[i].findControls(x, y);
                if (r != null)
                    return r;
            }
            return [];
        }
        findElements(x, y) {
            var r = [];
            for (var i = this._childs.length - 1; i >= 0; i--)
                this._childs[i].findElements(x, y, r);
            return r;
        }
        resize(w, h) {
            this.width = w;
            this.height = h;
            if (useWGL) {
                this._canvas.width = w;
                this._canvas.height = h;
            }
            this.onResize();
        }
        dispatchTouchEvents() {
            var ctrls;
            var i;
            var touchs = this.touchEvents;
            this.touchEvents = [];
            for (var j = 0; j < touchs.length; j++) {
                var e = touchs[j];
                switch (e.type) {
                    case 1:
                        ctrls = this.findControls(e.screenX, e.screenY);
                        if (!ctrls)
                            break;
                        for (i = 0; i < ctrls.length; i++) {
                            e.target = ctrls[i];
                            if (ctrls[i].onTouchBegin)
                                ctrls[i].onTouchBegin.call(e.target, e);
                            if (!e.bubble)
                                break;
                        }
                        break;
                    case 2:
                        var a = this.touchCaptures[e.id];
                        if (a) {
                            for (i = 0; i < a.length; i++) {
                                e.target = a[i];
                                if (!a[i].disposed && a[i].onTouchMove)
                                    a[i].onTouchMove.call(e.target, e);
                            }
                            break;
                        }
                        ctrls = this.findControls(e.screenX, e.screenY);
                        if (!ctrls)
                            break;
                        for (i = 0; i < ctrls.length; i++) {
                            e.target = ctrls[i];
                            if (ctrls[i].onTouchMove)
                                ctrls[i].onTouchMove.call(e.target, e);
                            if (!e.bubble)
                                break;
                        }
                        break;
                    case 3:
                        var a = this.touchCaptures[e.id];
                        if (a) {
                            delete this.touchCaptures[e.id];
                            for (i = 0; i < a.length; i++) {
                                e.target = a[i];
                                if (!a[i].disposed && a[i].onTouchEnd)
                                    a[i].onTouchEnd.call(e.target, e);
                            }
                            break;
                        }
                        ctrls = this.findControls(e.screenX, e.screenY);
                        if (!ctrls)
                            break;
                        for (i = 0; i < ctrls.length; i++) {
                            e.target = ctrls[i];
                            if (ctrls[i].onTouchEnd)
                                ctrls[i].onTouchEnd.call(e.target, e);
                            if (!e.bubble)
                                break;
                        }
                        break;
                }
            }
        }
    }
    class UIRootHtml extends UIRootBase {
        constructor(data) {
            super();
            this._inputting = false;
            this.isIOS = false;
            var ua = navigator.userAgent.toLowerCase();
            this.isIOS = ua.indexOf("iphone") >= 0 || ua.indexOf("ipad") >= 0 || ua.indexOf("ipod") >= 0;
            this._launchData = data;
            var div = this.div = data.div;
            this._stage = ez.createStage();
            var ctx = this;
            if (data.canvasMode == 2)
                useWGL = 0;
            else
                useWGL = 1;
            if (useWGL) {
                var c = internal.createCanvas();
                c.style.left = "0px";
                c.style.top = "0px";
                var options = {
                    alpha: false,
                    preserveDrawingBuffer: false,
                    depth: !!data.render3D,
                    stencil: !!data.render3D,
                    antialias: true
                };
                if (data.wglOptions) {
                    for (var k in data.wglOptions)
                        options[k] = data.wglOptions[k];
                }
                gl = c.getContext("experimental-webgl", options);
                if (!gl) {
                    if (data.canvasMode == 1)
                        useWGL = 0;
                    else
                        throw new Error("your browser doesn't support WebGL!");
                }
                else {
                    this._canvas = c;
                    div.appendChild(c);
                    internal.createWGLRenderContext(gl);
                    let data = { width: 0, height: 0, memSize: 0, fb: null };
                    this._screenBuffer = new ez.RenderTexture(data, 0, 0);
                }
            }
            if (!useWGL) {
                ez.createCanvasRenderContext();
                var c = document.createElement("canvas");
                div.appendChild(c);
                this._canvas = c;
            }
            this.onResize();
            var isTouch = false;
            function prevent(e) {
                e.stopPropagation();
                e.preventDefault();
            }
            div.oncontextmenu = function () {
                return false;
            };
            var mouseDown = false;
            div.onpointerdown = function (e) {
                if (ctx._inputting)
                    return;
                prevent(e);
                mouseDown = true;
                div.setPointerCapture(e.pointerId);
                ctx.onTouchBegin(e);
            };
            div.onpointermove = function (e) {
                if (ctx._inputting)
                    return;
                prevent(e);
                ctx.onTouchMove(e);
                if (!mouseDown)
                    ctx.mouseMove(e);
            };
            div.onpointerup = function (e) {
                if (ctx._inputting)
                    return;
                prevent(e);
                mouseDown = false;
                div.releasePointerCapture(e.pointerId);
                ctx.onTouchEnd(e);
            };
            div.addEventListener("touchstart", function (e) {
                if (!isTouch) {
                    div.onpointerdown = null;
                    div.onpointermove = null;
                    div.onpointerup = null;
                    isTouch = true;
                }
                if (ctx._inputting)
                    return;
                e.stopPropagation();
                e.preventDefault();
                var l = e.changedTouches.length;
                for (var i = 0; i < l; i++)
                    ctx.onTouchBegin(e.changedTouches[i]);
            }, { passive: false });
            div.addEventListener("touchmove", function (e) {
                if (ctx._inputting)
                    return;
                e.stopPropagation();
                e.preventDefault();
                var l = e.changedTouches.length;
                for (var i = 0; i < l; i++)
                    ctx.onTouchMove(e.changedTouches[i]);
            }, { passive: false });
            div.addEventListener("touchend", function (e) {
                if (ctx._inputting)
                    return;
                e.stopPropagation();
                e.preventDefault();
                var l = e.changedTouches.length;
                for (var i = 0; i < l; i++)
                    ctx.onTouchEnd(e.changedTouches[i]);
            }, { passive: false });
            div.addEventListener("touchcancel", function (e) {
                if (ctx._inputting)
                    return;
                e.stopPropagation();
                e.preventDefault();
                var l = e.changedTouches.length;
                for (var i = 0; i < l; i++)
                    ctx.onTouchEnd(e.changedTouches[i]);
            }, { passive: false });
        }
        cancelInput() {
            this._inputCtrl = null;
            this._inputting = false;
            window.scrollTo(0, 0);
            if (this._input) {
                this.div.removeChild(this._input);
                this._input = null;
            }
        }
        startInput(ctrl) {
            if (this._inputting) {
                Log.error("the last inputting is not end.");
                return;
            }
            var bound = ctrl.getBound();
            var start = ctrl.clientToScreen(0, 0);
            bound = new ez.Rect(start.x, start.y, bound.width, bound.height);
            bound.left *= this.scale;
            bound.top *= this.scale;
            if (this._input) {
                this.div.removeChild(this._input);
                this._input = null;
            }
            if (ctrl.multiLine) {
                this._input = document.createElement("textarea");
            }
            else {
                this._input = document.createElement("input");
                this._input.type = ctrl.type || "text";
            }
            var ctx = this._input;
            this.div.appendChild(this._input);
            if (ctx.scrolltoView) {
                setTimeout(function () { ctx.scrolltoView({ block: 'start' }); }, 100);
            }
            this._inputting = true;
            this._inputCtrl = ctrl;
            var style = ctx.style;
            ctx.value = ctrl.text;
            ctrl.visible = false;
            var font = ctrl._label.font;
            style.font = font;
            style.transform = "scale(" + this.scale + ")";
            style.color = ctrl._label.color;
            if (ctrl.maxLength)
                ctx.maxLength = ctrl.maxLength;
            style.left = bound.left + "px";
            style.top = bound.top + "px";
            style.overflow = "hidden";
            style.width = (bound.width | 0).toString() + "px";
            style.height = (bound.height | 0).toString() + "px";
            style.visibility = "visible";
            ctx.focus();
            var That = this;
            ctx.onblur = ev => { That.endInputHandler(false); };
            if (!ctrl.multiLine || ctrl.submitOnReturn) {
                if (this.isIOS) {
                    ctx.oninput = function (ev) {
                        var v = ctx.value;
                        if (v.indexOf("\n") >= 0) {
                            ctx.value = v.replace("\n", "");
                            That.endInputHandler(true);
                        }
                    };
                }
                else {
                    ctx.onkeydown = ev => {
                        if (ev.key == "Enter")
                            That.endInputHandler(true);
                    };
                }
            }
        }
        endInputHandler(enter) {
            var val = "";
            if (!this._inputCtrl)
                return;
            var c = this._inputCtrl;
            val = this._input.value;
            if (this._input) {
                this.div.removeChild(this._input);
                this._input = null;
            }
            c.visible = true;
            c.state = "normal";
            c.text = val;
            c.fireEvent("input", enter);
            this._inputting = false;
            window.scrollTo(0, 0);
        }
        setHighDPI(enable) {
            if (this._launchData.highDPI != enable) {
                this._launchData.highDPI = enable;
                this.onResize(true);
            }
        }
        onResize(force) {
            if (this._inputting)
                return;
            var launchData = this._launchData;
            var div = this.div;
            var canvas = this._canvas;
            var parent = div.parentElement;
            if (parent == document.body)
                parent = document.documentElement;
            var screenWidth = parent.clientWidth;
            var screenHeight = parent.clientHeight;
            if (force || !this._lastSize || this._lastSize[0] != screenWidth || this._lastSize[1] != screenHeight)
                this._lastSize = [screenWidth, screenHeight];
            else
                return;
            var width, height;
            var scale = 1;
            if (launchData.scaleMode == 4) {
                height = launchData.height;
                scale = height / screenHeight;
                width = scale * screenWidth;
                if (launchData.maxWidth)
                    width = Math.min(width, launchData.maxWidth);
                if (launchData.minWidth && width < launchData.minWidth) {
                    scale = launchData.minWidth / screenWidth;
                    width = launchData.minWidth;
                }
            }
            else if (launchData.scaleMode == 3) {
                width = launchData.width;
                scale = width / screenWidth;
                height = scale * screenHeight;
                if (launchData.maxHeight)
                    height = Math.min(height, launchData.maxHeight);
                if (launchData.minHeight && height < launchData.minHeight) {
                    scale = launchData.minHeight / screenHeight;
                    height = launchData.minHeight;
                }
            }
            else if (launchData.scaleMode == 5) {
                scale = window.devicePixelRatio;
                width = screenWidth * scale;
                height = screenHeight * scale;
            }
            else if (launchData.scaleMode == 2) {
                width = launchData.width;
                height = launchData.height;
                scale = 1;
            }
            else if (launchData.scaleMode == 1) {
                width = launchData.width;
                height = launchData.height;
                scale = Math.max(width / screenWidth, height / screenHeight);
            }
            else if (launchData.scaleMode == 0) {
                width = screenWidth;
                height = screenHeight;
                var ratio = width / height;
                if (launchData.minRatio && ratio < launchData.minRatio)
                    height = width / launchData.minRatio;
                if (launchData.maxRatio && ratio > launchData.maxRatio)
                    width = height * launchData.maxRatio;
                if (launchData.minWidth && width < launchData.minWidth || launchData.minHeight && height < launchData.minHeight)
                    scale = Math.max(launchData.minWidth ? launchData.minWidth / width : 1, launchData.minHeight ? launchData.minHeight / height : 1);
                if (launchData.maxWidth && width > launchData.maxWidth || launchData.maxHeight && height > launchData.maxHeight)
                    scale = Math.min(launchData.maxWidth ? launchData.maxWidth / width : 1, launchData.maxHeight ? launchData.maxHeight / height : 1);
                width = scale * width;
                height = scale * height;
            }
            else if (launchData.scaleMode == 6) {
                var r = launchData.onScreenAdapt(screenWidth, screenHeight);
                width = r.width;
                height = r.height;
                scale = r.scale;
            }
            this.invScale = scale;
            scale = 1 / scale;
            var w = round(width * scale);
            var h = round(height * scale);
            if (force || this.width != width || this.height != height || this.scale != scale) {
                this.scale = scale;
                this.width = width;
                this.height = height;
                this._sizeChanged = true;
                this._stage.makeDirty(false);
                if (this._onScreenResize) {
                    for (let func of this._onScreenResize)
                        func(width, height);
                }
                if (!useWGL) {
                    canvas.width = width;
                    canvas.height = height;
                    this._screenBuffer = ez.RenderTexture.createFromCanvas(canvas);
                    canvas.style.width = w + "px";
                    canvas.style.height = h + "px";
                }
                else {
                    canvas.style.width = w + "px";
                    canvas.style.height = h + "px";
                    if (launchData.highDPI) {
                        var s = scale * window.devicePixelRatio;
                        canvas.width = (width * s) | 0;
                        canvas.height = (height * s) | 0;
                        this._screenBuffer.scale = s;
                    }
                    else {
                        canvas.width = width | 0;
                        canvas.height = height | 0;
                        this._screenBuffer.scale = 1;
                    }
                    this._screenBuffer.resize(width, height);
                }
            }
            var x = 0;
            var y = 0;
            var va = launchData.alignMode & 3;
            var ha = launchData.alignMode >> 2;
            if (ha == 1)
                x = round((screenWidth - w) * 0.5);
            else if (ha == 2)
                x = screenWidth - w;
            if (va == 1)
                y = round((screenHeight - h) * 0.5);
            else if (va == 2)
                y = screenHeight - h;
            div.style.left = Math.max(0, x) + "px";
            div.style.top = Math.max(0, y) + "px";
            div.style.width = Math.min(screenWidth, w) + "px";
            div.style.height = Math.min(screenHeight, h) + "px";
        }
        onTouchBegin(e) {
            internal.startAudio();
            var l = getLocation(e, this.div, this.invScale);
            this.touchEvents.push(new TouchDataImpl(l.id, 1, l.x, l.y, e));
        }
        onTouchMove(e) {
            var l = getLocation(e, this.div, this.invScale);
            this.touchEvents.push(new TouchDataImpl(l.id, 2, l.x, l.y, e));
        }
        onTouchEnd(e) {
            var l = getLocation(e, this.div, this.invScale);
            this.touchEvents.push(new TouchDataImpl(l.id, 3, l.x, l.y, e));
        }
        mouseMove(e) {
        }
        dispatchTouchEvents() {
            if (this._inputting)
                return;
            super.dispatchTouchEvents();
        }
    }
    class UIRootWX extends UIRootBase {
        constructor(data) {
            super();
            this._launchData = data;
            this._canvas = data.canvas;
            this._stage = ez.createStage();
            var ctx = this;
            internal.createWGLRenderContext(gl);
            this._screenBuffer = new ez.RenderTexture({ width: 0, height: 0, memSize: 0, fb: null });
            this.onResize();
            var ctx = this;
            function getPos(e) {
                return {
                    id: e.identifier, x: e.clientX * ctx.invScale, y: e.clientY * ctx.invScale
                };
            }
            wx.onTouchStart(function (e) {
                var l = e.changedTouches.length;
                Log.info(`touch start `, e.changedTouches[0]);
                for (var i = 0; i < l; i++)
                    ctx.onTouchBegin(getPos(e.changedTouches[i]));
            });
            wx.onTouchMove(function (e) {
                var l = e.changedTouches.length;
                for (var i = 0; i < l; i++)
                    ctx.onTouchMove(getPos(e.changedTouches[i]));
            });
            wx.onTouchEnd(function (e) {
                var l = e.changedTouches.length;
                for (var i = 0; i < l; i++)
                    ctx.onTouchEnd(getPos(e.changedTouches[i]));
            });
            wx.onTouchCancel(function (e) {
                var l = e.changedTouches.length;
                for (var i = 0; i < l; i++)
                    ctx.onTouchEnd(getPos(e.changedTouches[i]));
            });
            wx.onKeyboardConfirm(function (v) {
                Log.info("input:", v);
                var ctrl = ctx._inputCtrl;
                if (!ctrl)
                    return;
                ctrl.state = "normal";
                ctrl.text = v.value;
                ctrl.fireEvent("input", true);
                ctx._inputCtrl = null;
            });
        }
        setHighDPI(enable) {
            if (this._launchData.highDPI != enable) {
                this._launchData.highDPI = enable;
                this.onResize(true);
            }
        }
        startInput(ctrl) {
            wx.showKeyboard({
                defaultValue: ctrl.text,
                maxLength: ctrl.maxLength,
                multiple: ctrl.multiLine,
                confirmHold: false,
                confirmType: "done",
            });
            this._inputCtrl = ctrl;
        }
        cancelInput() {
            this._inputCtrl = null;
            wx.hideKeyboard({});
        }
        render(frameProfiler) {
            if (!this._stage.dirty)
                return;
            this.renderImpl(frameProfiler);
        }
        onResize(force) {
            var launchData = this._launchData;
            var info = wx.getSystemInfoSync();
            var screenWidth = info.windowWidth;
            var screenHeight = info.windowHeight;
            Log.info(`onresize:${screenWidth} ${screenHeight}`);
            if (force || !this._lastSize || this._lastSize[0] != screenWidth || this._lastSize[1] != screenHeight)
                this._lastSize = [screenWidth, screenHeight];
            else
                return;
            var width, height;
            var scale = 1;
            if (launchData.scaleMode == 4) {
                height = launchData.height;
                scale = height / screenHeight;
                width = scale * screenWidth;
            }
            else if (launchData.scaleMode == 3) {
                width = launchData.width;
                scale = width / screenWidth;
                height = scale * screenHeight;
            }
            else if (launchData.scaleMode == 5) {
                scale = 1;
                width = screenWidth;
                height = screenHeight;
            }
            else if (launchData.scaleMode == 6) {
                var r = launchData.onScreenAdapt(screenWidth, screenHeight);
                width = r.width;
                height = r.height;
                scale = r.scale;
            }
            else {
                scale = 1;
                width = screenWidth;
                height = screenHeight;
                Log.error(`not support in wx`);
            }
            if (force || this.width != width || this.height != height || this.invScale != scale) {
                this.invScale = scale;
                this.scale = 1 / scale;
                this.width = width;
                this.height = height;
                this._sizeChanged = true;
                this._stage.makeDirty(false);
                if (this._onScreenResize) {
                    for (let func of this._onScreenResize)
                        func(width, height);
                }
                if (!launchData.highDPI) {
                    this._canvas.width = width | 0;
                    this._canvas.height = height | 0;
                }
                else {
                    screenWidth = Math.min(2048, info.windowWidth * info.pixelRatio);
                    screenHeight = Math.min(2048, info.windowHeight * info.pixelRatio);
                    scale = Math.min(screenWidth / width, screenHeight / height);
                    this._canvas.width = (width * scale) | 0;
                    this._canvas.height = (height * scale) | 0;
                    this._screenBuffer.scale = scale;
                }
                this._screenBuffer.resize(width, height);
            }
        }
        onTouchBegin(e) {
            this.touchEvents.push(new TouchDataImpl(e.id || -1, 1, e.x, e.y, e));
        }
        onTouchMove(e) {
            this.touchEvents.push(new TouchDataImpl(e.id || -1, 2, e.x, e.y, e));
        }
        onTouchEnd(e) {
            this.touchEvents.push(new TouchDataImpl(e.id || -1, 3, e.x, e.y, e));
        }
    }
    function round(val) {
        return (val + 0.5) | 0;
    }
    var root;
    var frameTime;
    var lastUpdateTime;
    var tickers = [];
    var nextFrameCallers = [];
    var timers = {};
    var timerIdx = 0;
    var timeScale = 1;
    function callNextFrame(func, thisObj) {
        nextFrameCallers.push({ func: func, ctx: thisObj });
    }
    ez.callNextFrame = callNextFrame;
    function setTimer(delay, func, thisObj) {
        var data = { func: func, ctx: thisObj, delay: delay };
        timers[++timerIdx] = data;
        return timerIdx;
    }
    ez.setTimer = setTimer;
    function removeTimer(id) {
        delete timers[id];
    }
    ez.removeTimer = removeTimer;
    function addTicker(func, thisObj) {
        var ticker = { func: func, ctx: thisObj };
        tickers.push(ticker);
        return ticker;
    }
    ez.addTicker = addTicker;
    function getTick() {
        return Date.now() * timeScale;
    }
    ez.getTick = getTick;
    function removeTicker(ticker) {
        var idx = tickers.indexOf(ticker);
        if (idx != -1)
            tickers.splice(idx, 1);
    }
    ez.removeTicker = removeTicker;
    ez.fps = 0;
    function timeShift(scale) {
        timeScale = scale;
    }
    ez.timeShift = timeShift;
    function getRoot() {
        return root;
    }
    ez.getRoot = getRoot;
    var gamePause = false;
    function pause() {
        gamePause = true;
    }
    ez.pause = pause;
    function resume() {
        gamePause = false;
    }
    ez.resume = resume;
    function delay(ms) {
        return new Promise(r => ez.setTimer(ms, r));
    }
    ez.delay = delay;
    function nextFrame() {
        return new Promise(r => { ez.callNextFrame(r); });
    }
    ez.nextFrame = nextFrame;
    function initialize(data) {
        if (typeof Log === "undefined")
            Log = console;
        ez.ui.registerTextStyle({ id: "default", font: ez.TextMetric.DefaultFont, color: "#ffffff" });
        internal.init();
        if (PLATFORM == 3) {
            if (wx.getSystemInfoSync().platform == "ios")
                internal.setImageExt(".2");
            else
                internal.setImageExt(".1");
            if (!data.canvas)
                data.canvas = wx.createCanvas();
        }
        else {
            var style = document.createElement("style");
            document.body.appendChild(style);
            style.appendChild(document.createTextNode(`
.ezgame div{display:block;margin:0 auto;padding:0;border:0;position:absulute;}
.ezgame canvas{display:block;position:absulute;}
.ezgame input, textarea{background: none;padding: 0px;outline: thin;border:0 none;padding: 0;position:absolute;z-index: 1000;display: block;font-size-adjust: none;transform-origin:0 0;}
.ezgame textarea{word-break: break-all;}`));
            if (typeof data.alignMode !== "number")
                data.alignMode = 5;
            if (typeof data.scaleMode !== "number")
                data.scaleMode = 0;
            if (!data.div)
                data.div = document.getElementById("game");
            data.div.setAttribute("class", "ezgame");
            root = new UIRootHtml(data);
        }
        var reqFrame;
        if (typeof requestAnimationFrame == "function")
            reqFrame = requestAnimationFrame;
        else {
            reqFrame = window.webkitRequestAnimationFrame || window["mozRequestAnimationFrame"] || window["oRequestAnimationFrame"] || window["msRequestAnimationFrame"];
            if (!reqFrame)
                reqFrame = function (callback) { return window.setTimeout(callback, frameTime); };
        }
        frameTime = data.fps ? 1000 / data.fps : 0;
        lastUpdateTime = Date.now();
        var frames = 0;
        var startTime = Date.now();
        var upaditing = false;
        setInterval(() => {
            var t = Date.now() - lastUpdateTime;
            if (t > 200 && !upaditing && !gamePause) {
                upaditing = true;
                Log.debug("%d: more than %d ms no update. force to update", lastUpdateTime, t);
                frameUpdate(false);
                lastUpdateTime = Date.now();
                upaditing = false;
            }
        }, 1000);
        function frameUpdate(request) {
            if (request)
                reqFrame(frameUpdate);
            var dt = Date.now() - lastUpdateTime;
            if (dt < frameTime || gamePause)
                return;
            if (dt > 1000)
                dt = 1000;
            var frameProfiler;
            if (PROFILING)
                frameProfiler = ez.Profile.newFrame();
            lastUpdateTime = Date.now();
            root.onResize();
            if (nextFrameCallers.length > 0) {
                var q = nextFrameCallers.splice(0, nextFrameCallers.length);
                for (var i = 0; i < q.length; i++) {
                    if (DEBUG) {
                        q[i].func.call(q[i].ctx);
                    }
                    else {
                        try {
                            q[i].func.call(q[i].ctx);
                        }
                        catch (e) {
                            Log.error("nextFrame caller exception: " + e.message + "\ncall tack: " + e.stack);
                        }
                    }
                }
            }
            for (var i = 0; i < tickers.length; i++) {
                var ticker = tickers[i];
                if (DEBUG) {
                    ticker.func.call(ticker.ctx, dt * timeScale);
                }
                else {
                    try {
                        ticker.func.call(ticker.ctx, dt * timeScale);
                    }
                    catch (e) {
                        Log.error("ticker exception: " + e.message + "\ncall stack: " + e.stack);
                        tickers.splice(i, 1);
                    }
                }
            }
            for (var k in timers) {
                var data = timers[k];
                data.delay -= dt * timeScale;
                if (data.delay <= 0) {
                    delete timers[k];
                    if (DEBUG) {
                        data.func.apply(data.ctx);
                    }
                    else {
                        try {
                            data.func.apply(data.ctx);
                        }
                        catch (e) {
                            Log.error("timer exception: " + e.message + "\ncall stack: " + e.stack);
                        }
                    }
                }
            }
            root.dispatchTouchEvents();
            root.checkSizeMeasure();
            if (PROFILING && frameProfiler) {
                frameProfiler.updateTime = ez.Profile.now() - frameProfiler.updateTime;
                frameProfiler.renderTime = ez.Profile.now();
            }
            if (request) {
                if (DEBUG) {
                    root.render(frameProfiler);
                }
                else {
                    try {
                        root.render(frameProfiler);
                    }
                    catch (e) {
                        Log.error("render exception: " + e.message + "\ncall stack: " + e.stack);
                    }
                }
            }
            if (PROFILING && frameProfiler) {
                ez.Profile.endFrame();
                frameProfiler = null;
            }
            frames++;
            var dt = Date.now() - startTime;
            if (dt > 1000) {
                startTime = Date.now();
                ez.fps = frames * 1000 / dt;
                frames = 0;
            }
        }
        reqFrame(frameUpdate);
        startTime = Date.now();
        internal.afterInit();
    }
    ez.initialize = initialize;
})(ez || (ez = {}));
var ez;
(function (ez) {
    var gl = null;
    function codeHash(s) {
        var n1 = 0x12345678;
        var n2 = 0x76543210;
        for (var i = 0; i < s.length; i++) {
            var c = s.charCodeAt(i) | 0;
            n1 = ((n1 + c) * 1033) & 0xffffffff;
            n2 = ((n2 + c) * 65789) & 0xffffffff;
        }
        return n1.toString(16) + n2.toString(16);
    }
    var vsCache = {};
    var fsCache = {};
    class Shader {
        constructor(vsCode, fsCode, attribs, uniforms, textures) {
            if (!gl)
                gl = ez.getGL();
            var vs, fs;
            var vsHash = codeHash(vsCode);
            var fsHash = codeHash(fsCode);
            if (vsCache[vsHash])
                vs = vsCache[vsHash];
            else {
                vs = gl.createShader(35633);
                gl.shaderSource(vs, vsCode);
                gl.compileShader(vs);
                if (!gl.getShaderParameter(vs, 35713)) {
                    Log.error("compile vertex shader failed:" + gl.getShaderInfoLog(vs), vsCode);
                    throw new Error("compile vertex shader failed");
                }
                vsCache[vsHash] = vs;
            }
            if (fsCache[fsHash])
                fs = fsCache[fsHash];
            else {
                fs = gl.createShader(35632);
                gl.shaderSource(fs, fsCode);
                gl.compileShader(fs);
                if (!gl.getShaderParameter(fs, 35713)) {
                    Log.error("compile fragment shader failed:" + gl.getShaderInfoLog(fs), fsCode);
                    throw new Error("compile fragment shader failed");
                }
                fsCache[fsHash] = fs;
            }
            this.vs = vs;
            this.fs = fs;
            this.proc = gl.createProgram();
            gl.attachShader(this.proc, vs);
            gl.attachShader(this.proc, fs);
            for (var i = 0; i < attribs.length; i++)
                if (attribs[i])
                    gl.bindAttribLocation(this.proc, i, attribs[i]);
            gl.linkProgram(this.proc);
            this.uniforms = {};
            this._cache = {};
            for (var k in uniforms) {
                var loc = gl.getUniformLocation(this.proc, k);
                if (loc) {
                    this.uniforms[k] = {
                        location: loc,
                        bind: uniforms[k],
                        matrix: uniforms[k] === gl.uniformMatrix2fv ||
                            uniforms[k] === gl.uniformMatrix3fv ||
                            uniforms[k] === gl.uniformMatrix4fv
                    };
                }
                else
                    Log.warn(`not found uniform ${k}`);
            }
            if (textures) {
                this.texUniforms = {};
                for (let i = 0; i < textures.length; i++) {
                    var loc = gl.getUniformLocation(this.proc, textures[i]);
                    if (!loc) {
                        Log.warn(`not found texture uniform ${textures[i]}`);
                        continue;
                    }
                    this.uniforms[textures[i]] = {
                        location: loc,
                        bind: gl.uniform1i,
                        matrix: false
                    };
                    this.texUniforms[textures[i]] = i + 1;
                }
            }
            if (!gl.getProgramParameter(this.proc, 35714)) {
                Log.error("link program failed:" + gl.getProgramInfoLog(this.proc));
                throw new Error("compile fragment shader failed");
            }
        }
        clearCache() {
            this._cache = {};
        }
        hasUniform(name) {
            return !!this.uniforms[name];
        }
        bind(name, value, noCache) {
            var u = this.uniforms[name];
            if (!u) {
                return;
            }
            if (!noCache) {
                var cache = this._cache;
                if (cache[name] === value)
                    return;
                if (Array.isArray(value)) {
                    let equal = true;
                    let v = cache[name];
                    if (!v)
                        equal = false;
                    else {
                        for (let i = 0; i < value.length; i++) {
                            if (value[i] !== v[i]) {
                                equal = false;
                                break;
                            }
                        }
                    }
                    if (equal)
                        return;
                }
                cache[name] = value;
            }
            if (u.matrix)
                u.bind.call(gl, u.location, false, value);
            else
                u.bind.call(gl, u.location, value);
        }
    }
    ez.Shader = Shader;
})(ez || (ez = {}));
var ez;
(function (ez) {
    var gl = null;
    var defUniforms;
    function defaultUniform(uniforms) {
        if (!uniforms)
            uniforms = defUniforms;
        else
            uniforms.quads = defUniforms.quads;
        return uniforms;
    }
    class Effect extends ez.Shader {
        constructor(fsCode, uniforms, textures) {
            super(Effect.DefVS2D, fsCode, ["pos", "quad"], defaultUniform(uniforms), textures);
        }
        static register(name, effect) {
            effect.name = name;
            Effect.lib[name] = effect;
        }
        static has(name) {
            return !name || !!Effect.lib[name];
        }
        static get(name) {
            if (!name)
                return Effect.default;
            if (!Effect.lib[name]) {
                Log.error(`effect ${name} is not exist!`);
                return Effect.default;
            }
            return Effect.lib[name];
        }
    }
    Effect.lib = {};
    ez.Effect = Effect;
    Effect.DefVS2D = `
#define MAX_QUAD 30
attribute vec2 pos;
attribute float quad;
uniform vec4 quads[MAX_QUAD * 4];
varying vec2 v_tc;
varying vec2 v_pos;
varying vec4 v_color;

void main(){
	int idx = int(quad) * 4;
	vec4 p0 = quads[idx];
	vec4 p1 = quads[idx + 1];
	vec4 p2 = quads[idx + 2];
	vec4 p3 = quads[idx + 3];
	gl_Position = vec4(pos.x * p0.x + pos.y * p0.z + p1.x - 1.0, pos.x * p0.y + pos.y * p0.w + p1.y + 1.0, 0.0, 1.0);
	v_tc = vec2(pos.x * p2.x + pos.y * p2.z + p1.z, pos.x * p2.y + pos.y * p2.w + p1.w);
	v_pos = pos;
	v_color = p3;
}`;
    Effect.DefFS2D = `
precision mediump float;
uniform sampler2D texture0;
varying vec2 v_tc;
varying vec4 v_color;
void main(void){
	vec4 col = texture2D(texture0, v_tc);
	gl_FragColor = col * v_color;
}`;
    ez.initCall(function () {
        if (!useWGL)
            return;
        var tiling = `
precision mediump float;
uniform sampler2D texture0;
uniform vec4 tiling;
varying vec2 v_tc;
varying vec4 v_color;
void main(void){
	vec4 col = texture2D(texture0, fract(v_tc) * tiling.zw + tiling.xy);
	gl_FragColor = col * v_color;
}`;
        var mono = `
precision mediump float;
uniform sampler2D texture0;
varying vec2 v_tc;
varying vec4 v_color;
void main(void){
	vec4 col = texture2D(texture0, v_tc);
	float l = col.r * 0.3 + col.g * 0.6 + col.b * 0.1;
	gl_FragColor = vec4(l,l,l,col.a) * v_color;
}`;
        var mask = `
precision mediump float;
uniform sampler2D texture0;
uniform sampler2D mask;
varying vec2 v_tc;
varying vec2 v_pos;
varying vec4 v_color;
void main(void){
	vec4 col = texture2D(texture0, v_tc) * texture2D(mask, v_pos);
	gl_FragColor = col * v_color;
}`;
        gl = ez.getGL();
        defUniforms = { quads: gl.uniform4fv };
        Effect.default = new Effect(Effect.DefFS2D);
        Effect.register("default", Effect.default);
        Effect.register("tiling", new Effect(tiling));
        Effect.register("mono", new Effect(mono));
        Effect.register("mask", new Effect(mask, null, ["mask"]));
    }, true);
})(ez || (ez = {}));
var ez;
(function (ez) {
    let FontCache;
    (function (FontCache) {
        FontCache.Width = 1024;
        FontCache.Height = 1024;
        FontCache.rev = 1;
        var fontLines = [];
        var textObjs = [];
        var logFontObjects = false;
        var emptyFontBuf;
        var caches = {};
        function fontHash(hash, s) {
            var n1 = 0x12345678;
            var n2 = 0x7654321;
            if (hash) {
                var args = hash.split(".");
                n1 = parseInt(args[0], 16);
                n2 = parseInt(args[0], 16);
            }
            for (var i = 0; i < s.length; i++) {
                var c = s.charCodeAt(i);
                n1 = ((n1 + c) * 1033) & 0x7fffffff;
                n2 = ((n2 + c) * 65789) & 0x7fffffff;
            }
            return n1.toString(16) + "." + n2.toString(16);
        }
        function fontAlloc(w, h) {
            if (fontLines.length == 0) {
                fontLines.push({ x: w, y: 0, h: h });
                return [0, 0];
            }
            var idx = -1;
            var minH = FontCache.Height;
            for (var i = 0; i < fontLines.length; i++) {
                var l = fontLines[i];
                if (l.x + w <= FontCache.Width) {
                    if (l.h == h) {
                        l.x += w;
                        return [l.x - w, l.y];
                    }
                    else if (h < l.h && l.h < minH) {
                        idx = i;
                        minH = l.h;
                    }
                }
            }
            l = fontLines[fontLines.length - 1];
            if (l.y + l.h + h < FontCache.Height) {
                fontLines.push({ x: w, y: l.y + l.h, h: h });
                return [0, l.y + l.h];
            }
            if (idx >= 0) {
                l = fontLines[idx];
                l.x += w;
                return [l.x - w, l.y];
            }
            if (PROFILING)
                Log.debug(`reset the font pool, w:${w} h:${h}`, fontLines);
            return null;
        }
        function getTextCacheOrKey(font, fill, stroke, scale, text) {
            var key = fontHash("", font);
            key = fontHash(key, fill);
            if (stroke)
                key = fontHash(key, stroke);
            key = fontHash(key, scale);
            key = fontHash(key, text);
            return caches[key] ? caches[key] : key;
        }
        FontCache.getTextCacheOrKey = getTextCacheOrKey;
        function setTextCache(key, cache) {
            caches[key] = cache;
        }
        FontCache.setTextCache = setTextCache;
        function log() {
            console.log(caches);
        }
        FontCache.log = log;
        function addTextCache(cache) {
            cache.use = 0;
            textObjs.push(cache);
        }
        FontCache.addTextCache = addTextCache;
        function updateFontTexture(gl, fontTex, profileData) {
            var su = 1 / FontCache.Width;
            var sv = 1 / FontCache.Height;
            var reset = false;
            if (logFontObjects) {
                var area = 0;
                for (var i = 0; i < textObjs.length; i++) {
                    var img = textObjs[i].img;
                    area += img.width * img.height;
                }
                Log.info(`font objects, area: ${area}`, textObjs);
                logFontObjects = false;
            }
            for (var i = 0; i < textObjs.length; i++) {
                var obj = textObjs[i];
                if (!obj.region || obj.rev != FontCache.rev) {
                    var img = obj.img;
                    if (PROFILING && profileData) {
                        ez.Profile.addCommand(`alloc text region w:${img.width} h:${img.height} text:${obj.text}`);
                    }
                    var r = fontAlloc(img.width, img.height);
                    if (!r) {
                        reset = true;
                        break;
                    }
                    obj.rev = FontCache.rev;
                    obj.r = r;
                    var u = r[0];
                    var v = r[1];
                    obj.region = [u * su, v * sv, img.width * su, img.height * sv];
                }
            }
            if (reset) {
                FontCache.rev++;
                fontLines = [];
                for (var i = 0; i < textObjs.length; i++) {
                    var obj = textObjs[i];
                    var img = obj.img;
                    var r = fontAlloc(img.width, img.height);
                    obj.rev = FontCache.rev;
                    obj.r = r;
                    if (r) {
                        var u = r[0];
                        var v = r[1];
                        obj.region = [u * su, v * sv, img.width * su, img.height * sv];
                    }
                    else {
                        obj.region = [0, 0, 0, 0];
                        Log.error(`not enough space for text allocator. width:${img.width} height:${img.height}. please set the bigger FontCacheWidth and FontCacheHeight`);
                        Log.info(textObjs);
                    }
                }
            }
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, fontTex.glTex);
            if (reset) {
                var t = 8;
                var h = FontCache.Height / t;
                if (!emptyFontBuf)
                    emptyFontBuf = new Uint8Array(FontCache.Width * h * 4);
                for (var i = 0; i < t; i++)
                    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, i * h, FontCache.Width, h, gl.RGBA, gl.UNSIGNED_BYTE, emptyFontBuf);
            }
            gl.pixelStorei(37441, 1);
            for (var i = 0; i < textObjs.length; i++) {
                var obj = textObjs[i];
                if (obj.r) {
                    if (PLATFORM == 3) {
                        let img = obj.img;
                        let buf = new Uint8Array(img.data.length);
                        buf.set(img.data);
                        gl.texSubImage2D(gl.TEXTURE_2D, 0, obj.r[0], obj.r[1], img.width, img.height, gl.RGBA, gl.UNSIGNED_BYTE, buf);
                    }
                    else
                        gl.texSubImage2D(gl.TEXTURE_2D, 0, obj.r[0], obj.r[1], gl.RGBA, gl.UNSIGNED_BYTE, obj.img);
                }
                obj.r = null;
            }
            textObjs = [];
            for (var k in caches) {
                var use = caches[k].use--;
                if (use < -1000)
                    delete caches[k];
            }
        }
        FontCache.updateFontTexture = updateFontTexture;
    })(FontCache = ez.FontCache || (ez.FontCache = {}));
})(ez || (ez = {}));
var ez;
(function (ez) {
    function makeMatrix(h) {
        var f = ezasm.handleToFloatArray(h, 6);
        return new ez.Matrix(f[0], f[1], f[2], f[3], f[4], f[5]);
    }
    class Sprite {
        constructor(stage, id) {
            if (!stage)
                throw new Error("the stage can't be null");
            this._handle = ezasm.newSpriteData();
            this._rev = -1;
            this._parent = stage;
            this._color = "#ffffff";
            if (id)
                this._id = id;
            this._parent.addChild(this, id);
        }
        static create(type, parent, id) {
            if (!Sprite.types[type])
                throw new Error(`${type}Sprite is not exist!`);
            return Sprite.types[type](parent, id);
        }
        static register(type, creator) {
            Sprite.types[type] = creator;
        }
        _dispose() {
            ezasm.poolFree(this._handle);
            this._parent = undefined;
            this._handle = 0;
            ez.Tween.stopTweens(this);
            if (this.onDispose)
                this.onDispose();
        }
        get culled() {
            return ezasm.getCulled(this._handle);
        }
        set culled(v) {
            ezasm.setCulled(this._handle, v);
        }
        applyEffect(rc) {
            if (!useWGL)
                return;
            rc.setShader(ez.Effect.get(this._effect), this._effectParams);
        }
        _buildTransform() {
            if (this._target && this._target.disposed)
                this._target = null;
            var parentTrans = 0;
            var changed = false;
            if (this._target) {
                this._target._buildTransform();
                parentTrans = ezasm.getlocalTrans(this._target._handle);
                changed = this._targetRev != this._target._rev;
                this._targetRev = this._target._rev;
            }
            var h = this._handle;
            var t = ezasm.getlocalTrans(h);
            if (!t || changed) {
                var rev = ezasm.buildLocalTrans(h, parentTrans);
                if (this._rev != rev) {
                    this._transform = null;
                    this._rev = rev;
                }
            }
        }
        _prepare(bound, transfrom, transChanged) {
            var handle = this._handle;
            this._buildTransform();
            if (transChanged || !ezasm.getglobalTrans(handle))
                ezasm.buildGlobalTrans(handle, transfrom);
            this.culled = this._parent.culling && ezasm.cullingTest(handle, bound.left, bound.top, bound.right, bound.bottom);
        }
        get disposed() {
            return this._handle === 0;
        }
        dispose() {
            if (this._parent)
                this._parent.remove(this);
            else
                Log.warn("the sprite has been disposed");
        }
        setDirty(needSort = false) {
            if (!this._parent)
                return;
            if (this.visible)
                this._parent.makeDirty(needSort);
        }
        get localTransform() {
            this._buildTransform();
            if (!this._transform)
                this._transform = makeMatrix(ezasm.getlocalTrans(this._handle));
            return this._transform;
        }
        get globalTransform() {
            var t = ezasm.getglobalTrans(this._handle);
            if (t)
                return makeMatrix(t);
            else {
                var v = this.localTransform.clone();
                var p = this._parent.globalTransform;
                if (p)
                    v.append(p);
                return v;
            }
        }
        get visible() {
            return ezasm.getVisible(this._handle);
        }
        set visible(v) {
            if (this._parent)
                this._parent.makeDirty(false);
            ezasm.setVisible(this._handle, v);
        }
        get effect() {
            return this._effect;
        }
        set effect(val) {
            if (!ez.Effect.has(val)) {
                Log.error(`effect ${name} is not exist!`);
                return;
            }
            if (this._effect == val)
                return;
            this.setDirty();
            this._effect = val;
        }
        set effectParams(params) {
            this._effectParams = params;
            this.setDirty();
        }
        get color() {
            return this._color;
        }
        set color(val) {
            if (!val)
                val = "#ffffff";
            if (val == this._color)
                return;
            this.setDirty();
            this._color = val;
        }
        get zIndex() {
            return this._zIndex === undefined ? 0 : this._zIndex;
        }
        set zIndex(val) {
            if (val === this._zIndex)
                return;
            this._zIndex = val;
            this.setDirty(true);
        }
        hitTest(x, y) {
            return (x >= 0 && y >= 0 && x < this.width && y < this.height);
        }
        setParent(stage) {
            if (this.disposed)
                throw new Error("the sprite has been disposed");
            stage.addChild(this, this.id);
            this._parent._remove(this);
            this._parent = stage;
        }
        get id() {
            return this._id;
        }
        link(target) {
            this._target = target;
            this._targetRev = -1;
        }
        unlink() {
            this._target = undefined;
        }
        get opacity() {
            return this._opacity === undefined ? 1 : this._opacity;
        }
        set opacity(v) {
            if (this._opacity === v)
                return;
            this._opacity = v;
            this.setDirty();
        }
        get blendMode() {
            return this._blendMode === undefined ? ez.BlendMode.Normal : this._blendMode;
        }
        set blendMode(v) {
            if (this._blendMode === v)
                return;
            this._blendMode = v;
            this.setDirty();
        }
    }
    Sprite.types = {};
    ez.Sprite = Sprite;
    ez.initCall(function () {
        function setProp(name, getFunc, setFunc) {
            Object.defineProperty(Sprite.prototype, name, {
                get: function () {
                    var h = this._handle;
                    if (!h)
                        return;
                    return getFunc(h);
                },
                set: function (v) {
                    var h = this._handle;
                    if (!h)
                        return;
                    if (setFunc(h, v))
                        this.setDirty();
                },
                enumerable: true,
                configurable: true
            });
        }
        let props = ["x", "y", "scaleX", "scaleY", "scale", "width", "height",
            "anchorX", "anchorY", "angle", "skew"];
        for (let i = 0; i < props.length; i++) {
            let n = props[i];
            setProp(n, ezasm["get" + n], ezasm["set" + n]);
        }
        setProp("mirrorH", ezasm.getMirrorH, ezasm.setMirrorH);
        setProp("mirrorV", ezasm.getMirrorV, ezasm.setMirrorV);
    });
})(ez || (ez = {}));
var ez;
(function (ez) {
    var parse;
    (function (parse) {
        var defGradientFill = { x0: 0, y0: 0, x1: 0, y1: 0, colors: ["#000000", "#ffffff"] };
        var defSeqFrame = { prefix: "", frames: "", from: 0, count: 0, fps: 30, loop: false };
        class JsObject {
            isJSON() { return true; }
            toString() {
                var r = '{ ';
                var f = true;
                for (let k in this) {
                    if (!f)
                        r += ' ,';
                    r += `${k}:${typeof this[k] == "string" ? "'" + this[k] + "'" : this[k]}`;
                    f = false;
                }
                r += ' }';
                return r;
            }
        }
        function parseObject(val, def) {
            if (typeof val == "string")
                val = PLATFORM == 3 ? wx.eval(val) : eval("(" + val + ")");
            if (!val)
                return null;
            var obj = new JsObject();
            if (!def) {
                for (var k in val)
                    obj[k] = val[k];
                return obj;
            }
            else {
                for (var k in def) {
                    if (val[k] === undefined)
                        Object.defineProperty(obj, k, { value: def[k], writable: true, enumerable: false, configurable: true });
                    else
                        obj[k] = val[k];
                }
                return obj;
            }
        }
        function GradientFill(val) {
            if (!val)
                return undefined;
            return parseObject(val, defGradientFill);
        }
        parse.GradientFill = GradientFill;
        function Dimension(val) {
            var t = typeof (val);
            if (t === "number")
                return new ez.Dimension(val);
            if (t === "string")
                return val === "" ? undefined : new ez.Dimension(val);
            if (t === "object")
                return val;
            else
                return undefined;
        }
        parse.Dimension = Dimension;
        function Boolean(val) {
            if (typeof (val) === "string") {
                var s = val;
                return s.toLowerCase() == "true" || (s == true);
            }
            return !!val;
        }
        parse.Boolean = Boolean;
        function Float(val) {
            if (typeof (val) == "string") {
                if (val == "")
                    return undefined;
                return parseFloat(val);
            }
            else
                return val;
        }
        parse.Float = Float;
        function Int(val) {
            if (typeof (val) == "string") {
                if (val == "")
                    return undefined;
                return parseInt(val);
            }
            else
                return val;
        }
        parse.Int = Int;
        function SeqFrameDesc(val) {
            if (!val)
                return undefined;
            return parseObject(val, defSeqFrame);
        }
        parse.SeqFrameDesc = SeqFrameDesc;
        function ImageSrc(val) {
            if (typeof (val) === "string") {
                if (/^http:\/\/.+/.test(val)) {
                    return ez.getExternalRes(val, 4);
                }
                if (val == "")
                    return undefined;
                var res = ez.getRes(val);
                return res;
            }
            else
                return val;
        }
        parse.ImageSrc = ImageSrc;
        function CSV(csv) {
            csv = csv.replace(new RegExp("\r\n", "gm"), "\n");
            if (csv[csv.length - 1] != "\n")
                csv += "\n";
            var lines = [];
            var line = [];
            var inQuote = false;
            var str = "";
            for (var i = 0; i < csv.length; ++i) {
                var c = csv[i];
                if (!inQuote) {
                    if (c == ",") {
                        line.push(str);
                        str = "";
                    }
                    else if (c == "\r") {
                        if (csv[i + 1] == "\n")
                            i++;
                        line.push(str);
                        str = "";
                        lines.push(line);
                        line = [];
                    }
                    else if (c == "\n") {
                        line.push(str);
                        str = "";
                        lines.push(line);
                        line = [];
                    }
                    else if (c == "\"")
                        inQuote = true;
                    else
                        str += c;
                }
                else {
                    if (c == "\"") {
                        if (i < csv.length - 1 && csv[i + 1] == "\"")
                            str += c;
                        inQuote = false;
                    }
                    else
                        str += c;
                }
            }
            return lines;
        }
        parse.CSV = CSV;
        function Numbers(s) {
            if (Array.isArray(s))
                return s;
            var args = s.split(",");
            return args.map(a => parseFloat(a));
        }
        parse.Numbers = Numbers;
        function Number4(s) {
            if (Array.isArray(s))
                return s;
            var args = s.split(",");
            return [parseFloat(args[0]), parseFloat(args[1]), parseFloat(args[2]), parseFloat(args[3])];
        }
        parse.Number4 = Number4;
        function JSObj(val) {
            if (typeof val == "string") {
                return PLATFORM == 3 ? wx.eval(val) : eval("(" + val + ")");
            }
            return val;
        }
        parse.JSObj = JSObj;
        function Enums(val, enumType) {
            var args = val.split("|");
            var t = 0;
            for (var i = 0; i < args.length; i++)
                if (enumType[args[i]])
                    t |= enumType[args[i]];
            return t;
        }
        parse.Enums = Enums;
        function getEnumParser(enumType) {
            return function (val) {
                if (typeof val === "string")
                    return Enums(val, enumType);
                else
                    return val;
            };
        }
        parse.getEnumParser = getEnumParser;
    })(parse = ez.parse || (ez.parse = {}));
})(ez || (ez = {}));
var ez;
(function (ez) {
    var ui;
    (function (ui_1) {
        var parse = ez.parse;
        var fontStyles = {};
        var templates = {};
        function registerTemplates(temps) {
            for (let k in temps)
                templates[temps[k].name] = temps[k];
        }
        ui_1.registerTemplates = registerTemplates;
        function getTemplate(name) {
            var t = templates[name];
            if (!t)
                Log.warn(`not find template ${name}`);
            return t;
        }
        ui_1.getTemplate = getTemplate;
        function registerTextStyle(style) {
            if (Array.isArray(style)) {
                for (var i = 0; i < style.length; i++) {
                    registerTextStyle(style[i]);
                }
            }
            else {
                if (DEBUG && fontStyles.hasOwnProperty(style.id) && style.id != "default")
                    Log.warn(`the textstyle ${style.id} is already registered.`);
                fontStyles[style.id] = style;
                style.toString = function () { return this.id; };
            }
        }
        ui_1.registerTextStyle = registerTextStyle;
        function getTextStyle(style) {
            if (DEBUG && !fontStyles.hasOwnProperty(style))
                Log.warn(`the textstyle ${style} is not registered.`);
            return fontStyles[style];
        }
        ui_1.getTextStyle = getTextStyle;
        function getTextStyleNames() {
            return Object.getOwnPropertyNames(fontStyles);
        }
        ui_1.getTextStyleNames = getTextStyleNames;
        var _uiClasses = {};
        function getAllGuiClassNames() {
            return Object.getOwnPropertyNames(_uiClasses);
        }
        ui_1.getAllGuiClassNames = getAllGuiClassNames;
        function getGuiClass(name) {
            return _uiClasses[name];
        }
        ui_1.getGuiClass = getGuiClass;
        function createUIElement(name, parent) {
            var cls = _uiClasses[name];
            if (!cls)
                throw new Error(`the ui class:'${name}' is not exist!`);
            var c = new cls(parent);
            return c;
        }
        ui_1.createUIElement = createUIElement;
        function setObjProp(prototype, name) {
            Object.defineProperty(prototype, name, {
                get: function () { return this.getProp(name); },
                set: function (val) { this.setProp(name, val); },
                enumerable: true,
                configurable: true
            });
        }
        function initUIClass(uiClass, baseClass, abstract) {
            var cls = uiClass;
            cls.baseclass = baseClass;
            cls._properties = {};
            cls._propDefaults = {};
            cls._propConverters = {};
            function copyVals(d, b) {
                for (let k in b)
                    d[k] = b[k];
            }
            if (baseClass) {
                let base = baseClass;
                copyVals(cls._properties, base._properties);
                copyVals(cls._propDefaults, base._propDefaults);
                copyVals(cls._propConverters, base._propConverters);
            }
            if (cls.Properties) {
                let props = cls.Properties;
                for (let i = 0; i < props.length; i++) {
                    let prop = props[i];
                    if (!prop.customProperty)
                        setObjProp(cls.prototype, prop.name);
                    cls._properties[props[i].name] = "";
                    if (prop.default !== undefined)
                        cls._propDefaults[prop.name] = prop.default;
                    if (prop.converter)
                        cls._propConverters[prop.name] = prop.converter;
                }
            }
            if (!abstract) {
                var name = cls.ClassName;
                if (_uiClasses.hasOwnProperty(name))
                    throw new Error("the gui class name conflict! name=" + name);
                _uiClasses[name] = cls;
            }
        }
        ui_1.initUIClass = initUIClass;
        function calcDimension(dim, size) {
            return dim ? dim.calcSize(size) : undefined;
        }
        function hasValue(x) {
            return typeof (x) === "number";
        }
        function calcDim(width, height) {
            var dim = {};
            dim.left = calcDimension(this.left, width);
            dim.right = calcDimension(this.right, width);
            dim.top = calcDimension(this.top, height);
            dim.bottom = calcDimension(this.bottom, height);
            dim.x = calcDimension(this.x, width);
            dim.y = calcDimension(this.y, height);
            if (hasValue(dim.left) && hasValue(dim.right))
                dim.width = Math.max(0, width - dim.right - dim.left);
            else
                dim.width = calcDimension(this.width, width);
            if (hasValue(dim.top) && hasValue(dim.bottom))
                dim.height = Math.max(0, height - dim.bottom - dim.top);
            else
                dim.height = calcDimension(this.height, height);
            return dim;
        }
        function toRect(width, height, dim) {
            if (!hasValue(dim.left)) {
                if (hasValue(dim.right))
                    dim.left = width - dim.right - dim.width;
                else if (hasValue(dim.x))
                    dim.left = dim.x - this.anchorX * dim.width;
                else
                    dim.left = 0;
            }
            if (!hasValue(dim.top)) {
                if (hasValue(dim.bottom))
                    dim.top = height - dim.bottom - dim.height;
                else if (hasValue(dim.y))
                    dim.top = dim.y - this.anchorY * dim.height;
                else
                    dim.top = 0;
            }
            return new ez.Rect(dim.left, dim.top, dim.width, dim.height);
        }
        function removeEvent() {
            if (this._p) {
                this.disposed = true;
                var events = this._p._events;
                this._p = null;
                var name = this.name;
                var n = events[name];
                if (Array.isArray(n)) {
                    var idx = n.indexOf(this);
                    if (idx != -1)
                        n.splice(idx, 1);
                }
                else if (n == this)
                    delete events[name];
            }
        }
        function childSizeChanged() {
            if (this.childSizeChanged) {
                this.childSizeChanged();
                return;
            }
            if (!this._sizeDirty) {
                childSizeChanged.call(this._parent);
            }
            this._sizeDirty = true;
        }
        function convPropArray(clsName, props, id, left, top, right, bottom, width, height, x, y, opacity, visible, scale, angle, anchorX, anchorY, zIndex, touchable, childsProperty, array, childs) {
            var c = {};
            c.class = clsName;
            if (undefined !== x)
                c.x = x;
            if (undefined !== y)
                c.y = y;
            if (undefined !== left)
                c.left = left;
            if (undefined !== top)
                c.top = top;
            if (undefined !== right)
                c.right = right;
            if (undefined !== bottom)
                c.bottom = bottom;
            if (undefined !== width)
                c.width = width;
            if (undefined !== height)
                c.height = height;
            if (undefined !== opacity)
                c.opacity = opacity;
            if (undefined !== visible)
                c.visible = visible;
            if (undefined !== scale)
                c.scale = scale;
            if (undefined !== angle)
                c.angle = angle;
            if (undefined !== anchorX)
                c.anchorX = anchorX;
            if (undefined !== anchorY)
                c.anchorY = anchorY;
            if (undefined !== zIndex)
                c.zIndex = zIndex;
            if (undefined !== touchable)
                c.touchable = touchable;
            if (undefined !== id)
                c.id = id;
            if (props)
                for (var k in props)
                    c[k] = props[k];
            if (array)
                c._array = array;
            if (childsProperty)
                c.childsProperty = childsProperty;
            if (childs)
                c._childs = childs;
            return c;
        }
        var g_parentChilds;
        class Element extends ez.DataModel {
            constructor(parent) {
                super();
                this._bound = null;
                this._events = {};
                this._init(Element);
                var sizeProperties = ["left", "top", "right", "bottom", "width",
                    "height", "x", "y", "anchorX", "anchorY"];
                function f() {
                    this._bound = null;
                    childSizeChanged.call(this._parent);
                }
                for (var p in sizeProperties)
                    this.addObserver(sizeProperties[p], f, this);
                this._parent = parent;
                if (this.onCreate)
                    ez.callNextFrame(function () {
                        if (!this.disposed)
                            this.onCreate();
                    }, this);
            }
            static hasProperty(prop) {
                return this._properties.hasOwnProperty(prop);
            }
            _setProps(props) {
                for (let k in props) {
                    if (k === "class" || k === "id" || k === "_array") {
                        continue;
                    }
                    else if (k === "childsProperty" || k === "_childs") {
                        Log.error(`${this.class.ClassName} can't have childs`);
                    }
                    else if (k === "style") {
                        this[k] = props[k];
                    }
                    else {
                        if (DEBUG && !this.class.hasProperty(k))
                            Log.error(`The ${this.class.ClassName} has no '${k}' property!`);
                        this[k] = props[k];
                    }
                }
            }
            _init(uiClass) {
                this.setDefaults(uiClass._propDefaults);
                this.setPropConverters(uiClass._propConverters);
            }
            _fireEvent(e) {
                if (this.disposed)
                    return;
                var h = this._events[e.name];
                let parent = this.parent;
                if (h) {
                    if (Array.isArray(h)) {
                        for (var i = 0; i < h.length; i++)
                            h[i].func.call(h[i].ctx, e);
                    }
                    else
                        h.func.call(h.ctx, e);
                    if (e.bubble)
                        parent._fireEvent(e);
                }
                else
                    parent._fireEvent(e);
            }
            fireEvent(event, arg, bubble) {
                if (bubble === undefined)
                    bubble = false;
                this._fireEvent({
                    name: event,
                    arg: arg,
                    bubble: bubble,
                    sender: this
                });
            }
            addEventHandler(event, func, ctx) {
                var t = { name: event, func: func, ctx: ctx, _p: this, disposed: false, dispose: removeEvent };
                if (!this._events[event]) {
                    this._events[event] = t;
                }
                else {
                    var o = this._events[event];
                    if (Array.isArray(o))
                        o.push(t);
                    else
                        this._events[event] = [o, t];
                }
                return t;
            }
            dispose() {
                if (this.disposed) {
                    Log.error("the element has been disposed.");
                    return;
                }
                this._parent._removeChild(this);
                this._parent = null;
                this._bound = null;
                ez.Tween.stopTweens(this);
                super.dispose();
            }
            get class() { return this.constructor; }
            get id() { return this._id; }
            get parent() {
                return this._parent;
            }
            textStyleChanged() {
            }
            get parentStage() {
                return this._parent._displayStage;
            }
            getBound() {
                return this._bound;
            }
            screenToClient(x, y) {
                if (this._bound) {
                    x -= this._bound.left;
                    y -= this._bound.top;
                }
                return this.parent.screenToClient(x, y);
            }
            clientToScreen(x, y) {
                if (this._bound) {
                    x += this._bound.left;
                    y += this._bound.top;
                }
                return this.parent.clientToScreen(x, y);
            }
            setBound(bound) {
                this._bound = bound;
                this.fireEvent("boundChange", bound, false);
            }
            measureBound(w, h, force = false) {
                if (!force && this._bound)
                    return;
                var dim = calcDim.call(this, w, h);
                dim.width = dim.width || 0;
                dim.height = dim.height || 0;
                this._bound = toRect.call(this, w, h, dim);
                this.fireEvent("boundChange", this._bound, false);
            }
            ptInBound(x, y) {
                return this._bound && this.touchable && this.visible && this._bound.contains(x, y);
            }
            hitTest(x, y) {
                return false;
            }
            findControls(x, y) {
                if (!this.ptInBound(x, y))
                    return null;
                x -= this._bound.left;
                y -= this._bound.top;
                return this.hitTest(x, y) ? [] : null;
            }
            findElements(x, y, results) {
                if (!this.ptInBound(x, y))
                    return;
                x -= this._bound.left;
                y -= this._bound.top;
                if (this.hitTest(x, y))
                    results.push(this);
            }
        }
        Element.ClassName = "Element";
        Element.Properties = [
            { name: "x", type: "number|string|Dimension", converter: parse.Dimension, validate: "dimension" },
            { name: "y", type: "number|string|Dimension", converter: parse.Dimension, validate: "dimension" },
            { name: "left", type: "number|string|Dimension", converter: parse.Dimension, validate: "dimension" },
            { name: "top", type: "number|string|Dimension", converter: parse.Dimension, validate: "dimension" },
            { name: "right", type: "number|string|Dimension", converter: parse.Dimension, validate: "dimension" },
            { name: "bottom", type: "number|string|Dimension", converter: parse.Dimension, validate: "dimension" },
            { name: "width", type: "number|string|Dimension", converter: parse.Dimension, validate: "dimension" },
            { name: "height", type: "number|string|Dimension", converter: parse.Dimension, validate: "dimension" },
            { name: "opacity", default: 1, type: "number", converter: parse.Float, validate: "opacity" },
            { name: "visible", default: true, type: "boolean", converter: parse.Boolean },
            { name: "scaleX", default: 1, type: "number", converter: parse.Float, validate: "scale" },
            { name: "scaleY", default: 1, type: "number", converter: parse.Float, validate: "scale" },
            { name: "scale", default: 1, type: "number", converter: parse.Float, validate: "scale" },
            { name: "angle", default: 0, type: "number", converter: parse.Float, validate: "angle" },
            { name: "anchorX", default: 0.5, type: "number", converter: parse.Float, validate: "float" },
            { name: "anchorY", default: 0.5, type: "number", converter: parse.Float, validate: "float" },
            { name: "zIndex", default: 0, type: "number", converter: parse.Int, validate: "int" },
            { name: "touchable", default: true, type: "boolean", converter: parse.Boolean }
        ];
        ui_1.Element = Element;
        initUIClass(Element, null, true);
        class Container extends Element {
            constructor(parent, stage) {
                super(parent);
                this._childs = [];
                this._sizeDirty = false;
                this._namedChilds = {};
                this.setDefaults(Container._propDefaults);
                this.setPropConverters(Container._propConverters);
                stage = stage || new ez.SubStageSprite(this.parentStage);
                this._stage = stage;
                this.bind("culling", stage);
                this.bind("opacity", stage);
                this.bind("visible", stage);
                this.bind("scaleX", stage);
                this.bind("scaleY", stage);
                this.bind("scale", stage);
                this.bind("angle", stage);
                this.bind("clip", stage);
                this.bind("zIndex", stage);
                this.bind("ownerBuffer", stage);
                this.bind("drawCache", stage);
                this.bind("batchMode", stage);
                this.addObserver("textStyle", this.textStyleChanged, this);
                this.addEventHandler("boundChange", function (e) {
                    var b = this._bound;
                    if (!b)
                        return;
                    stage.width = b.width;
                    stage.height = b.height;
                    stage.anchorX = this.anchorX;
                    stage.anchorY = this.anchorY;
                    stage.x = b.left + stage.anchorX * b.width;
                    stage.y = b.top + stage.anchorY * b.height;
                }, this);
            }
            _removeChild(child) {
                var idx = this._childs.indexOf(child);
                if (idx == -1)
                    throw new Error("child not exist!");
                this._childs.splice(idx, 1);
            }
            _setChilds(data) {
                for (var i = 0; i < data.length; i++) {
                    var props = data[i];
                    if (Array.isArray(props))
                        props = convPropArray.apply(null, props);
                    let klass = _uiClasses[props.class];
                    if (!klass)
                        throw new Error(`${props.class} is not exist!`);
                    if (props._array) {
                        let a = [];
                        if (g_parentChilds && props.id)
                            g_parentChilds[props.id] = a;
                        let p = {};
                        for (let k in props)
                            if (k !== "_array")
                                p[k] = props[k];
                        for (let j = 0; j < props._array.length; j++) {
                            if (props.id)
                                p.id = props.id + j;
                            var c = this.createChild(klass, p);
                            c._setProps(props._array[j]);
                            a.push(c);
                        }
                    }
                    else
                        this.createChild(klass, props);
                }
            }
            _setProps(props) {
                for (let k in props) {
                    if (k === "class" || k === "id" || k === "_array") {
                        continue;
                    }
                    else if (k === "_childs") {
                        if (!this.class.HasChildElements)
                            Log.error(`The ${this.class.ClassName} can't has childs!`);
                        else
                            this.setChilds(props[k]);
                    }
                    else if (k === "childsProperty" || k === "style") {
                        this[k] = props[k];
                    }
                    else {
                        if (DEBUG && !this.class.hasProperty(k))
                            Log.error(`The ${this.class.ClassName} has no '${k}' property!`);
                        this[k] = props[k];
                    }
                }
            }
            _createChilds(data) {
                var parentChilds = g_parentChilds;
                g_parentChilds = this._namedChilds;
                this._setChilds(data);
                g_parentChilds = parentChilds;
            }
            find(id, recursive) {
                if (this._namedChilds[id])
                    return this._namedChilds[id];
                if (!recursive)
                    return null;
                for (var i = 0; i < this._childs.length; i++) {
                    var c = this._childs[i];
                    if (typeof c.find === "function") {
                        var k = c.find(id, recursive);
                        if (k)
                            return k;
                    }
                }
                return null;
            }
            clearChilds() {
                var childs = this._childs.concat();
                for (var i = 0; i < childs.length; i++)
                    childs[i].dispose();
            }
            dispose() {
                if (this.disposed) {
                    Log.error("the control has been disposed!");
                    return;
                }
                this.clearChilds();
                this._childs = null;
                this._stage.dispose();
                this._stage = null;
                super.dispose();
            }
            get childCount() {
                return this._childs.length;
            }
            getChild(idx) {
                if (idx < 0 || idx >= this._childs.length)
                    throw new RangeError();
                return this._childs[idx];
            }
            get _displayStage() {
                return this._stage;
            }
            textStyleChanged() {
                for (var i in this._childs) {
                    var c = this._childs[i];
                    c.textStyleChanged();
                }
            }
            createChild(uiclass, props) {
                var klass = _uiClasses[uiclass.ClassName];
                if (!klass)
                    throw new Error(`${uiclass.ClassName} is not registered.`);
                var tname = props === null || props === void 0 ? void 0 : props.template;
                var template;
                if (tname) {
                    template = templates[tname];
                    if (!template)
                        Log.error(`template '${tname}' is not exist!`);
                }
                let c = new klass(this, template);
                this._childs.push(c);
                childSizeChanged.call(this);
                if (props) {
                    c._setProps(props);
                    if (props.id) {
                        if (this._namedChilds[props.id])
                            Log.warn("child id conflict.", this._namedChilds, props.id);
                        this._namedChilds[props.id] = c;
                        if (g_parentChilds && g_parentChilds != this._namedChilds) {
                            if (g_parentChilds[props.id])
                                Log.warn("child id conflict.", g_parentChilds, props.id);
                            g_parentChilds[props.id] = c;
                        }
                        c._id = props.id;
                    }
                }
                return c;
            }
            measureBound(w, h, force = false) {
                if (force || !this._bound) {
                    const dim = calcDim.call(this, w, h);
                    if ((dim.width === undefined) || (dim.height === undefined)) {
                        let w1 = dim.width || 0, h1 = dim.height || 0;
                        let w2 = 0, h2 = 0;
                        for (let i = 0; i < this._childs.length; i++) {
                            const c = this._childs[i];
                            c.measureBound(w1, w2, false);
                            const r = c.getBound();
                            w2 = Math.max(w2, r.right);
                            h2 = Math.max(h2, r.bottom);
                        }
                        dim.width = dim.width || w2;
                        dim.height = dim.height || h2;
                    }
                    this._bound = toRect.call(this, w, h, dim);
                    this.fireEvent("boundChange", this._bound, false);
                }
                if (!this._lastBound ||
                    this._lastBound.width != this._bound.width ||
                    this._lastBound.height != this._bound.height) {
                    let lastBound = this._lastBound;
                    this._lastBound = this._bound;
                    for (let i = 0; i < this._childs.length; i++) {
                        const child = this._childs[i];
                        child.measureBound(this._bound.width, this._bound.height, true);
                    }
                }
                else if (this._sizeDirty) {
                    for (let i = 0; i < this._childs.length; i++) {
                        const child = this._childs[i];
                        child.measureBound(this._bound.width, this._bound.height, false);
                    }
                }
                this._sizeDirty = false;
            }
            findControls(x, y) {
                if (!this.ptInBound(x, y))
                    return null;
                x -= this._bound.left;
                y -= this._bound.top;
                for (var i = this._childs.length - 1; i >= 0; i--) {
                    var r = this._childs[i].findControls(x, y);
                    if (r)
                        return r;
                }
                return this.hitTest(x, y) ? [] : null;
            }
            findElements(x, y, results) {
                if (!this.ptInBound(x, y))
                    return;
                x -= this._bound.left;
                y -= this._bound.top;
                for (var i = this._childs.length - 1; i >= 0; i--)
                    this._childs[i].findElements(x, y, results);
                if (this.hitTest(x, y))
                    results.push(this);
            }
            _setStyle(style) {
                for (var k in style) {
                    if (k == "childsProperty") {
                        this.childsProperty = style[k];
                    }
                    else {
                        if (DEBUG && !this.class.hasProperty(k))
                            Log.error(`The ${this.class.ClassName} has no '${k}' property!`);
                        else
                            this[k] = style[k];
                    }
                }
            }
            set style(style) {
                if (!style)
                    return;
                if (!this.class.Styles || !this.class.Styles[style])
                    throw new Error(`style ${style} is not exist in ${this.class.ClassName}.`);
                this._setStyle(this.class.Styles[style]);
                this._style = style;
            }
            get style() {
                return this._style;
            }
            set childsProperty(properties) {
                for (var k in properties) {
                    var child = this._namedChilds[k];
                    if (!child) {
                        Log.warn(`namedChild '${k}' is not exist.`);
                        continue;
                    }
                    var props = properties[k];
                    for (var n in props) {
                        if (n !== "style" && !child.class.hasProperty(n))
                            Log.warn(`The UI[${child.class.ClassName}] has no '${n}' property!`);
                        else
                            child[n] = props[n];
                    }
                }
            }
        }
        Container.ClassName = "Container";
        Container.Properties = [
            { name: "culling", default: false, type: "boolean", converter: parse.Boolean },
            { name: "clip", default: false, type: "boolean", converter: parse.Boolean },
            { name: "drawCache", default: false, type: "boolean", converter: parse.Boolean },
            { name: "batchMode", default: false, type: "boolean", converter: parse.Boolean },
            { name: "ownerBuffer", default: false, type: "boolean", converter: parse.Boolean },
            { name: "textStyle", type: "string", validate: "textStyle" }
        ];
        ui_1.Container = Container;
        initUIClass(Container, Element, true);
        class Group extends Container {
            constructor(parent) {
                super(parent);
            }
            setChilds(data) {
                this.clearChilds();
                this._setChilds(data);
            }
        }
        Group.ClassName = "Group";
        Group.Properties = [];
        Group.HasChildElements = true;
        ui_1.Group = Group;
        initUIClass(Group, Container);
        class Control extends Container {
            constructor(parent) {
                super(parent);
            }
            static mixins(eventHander) {
                let b = eventHander.prototype;
                let p = this.prototype;
                let names = Object.getOwnPropertyNames(b);
                for (var k of names) {
                    if (k == "constructor")
                        continue;
                    p[k] = b[k];
                }
            }
            static checkStates(...states) {
                if (!this.States)
                    throw new Error("the control has no states table.");
                for (var i = 0; i < states.length; i++) {
                    var s = states[i];
                    if (!this.States[s])
                        throw new Error(`states[${s}] is missing!`);
                }
            }
            hitTest(x, y) {
                if (this.hittable)
                    return true;
                return super.hitTest(x, y);
            }
            _setStyle(style) {
                for (var k in style) {
                    if (k === "childsProperty") {
                        this.childsProperty = style[k];
                    }
                    else if (k === "States") {
                        this._states = style["States"];
                        this._stateChange(this.state, this.state);
                    }
                    else {
                        if (DEBUG && !this.class.hasProperty(k))
                            Log.error(`The ${this.class.ClassName} has no '${k}' property!`);
                        else
                            this[k] = style[k];
                    }
                }
            }
            findControls(x, y) {
                if (!this.ptInBound(x, y))
                    return null;
                x -= this._bound.left;
                y -= this._bound.top;
                var childs = this._childs;
                for (var i = childs.length - 1; i >= 0; i--) {
                    var r = childs[i].findControls(x, y);
                    if (r) {
                        r.push(this);
                        return r;
                    }
                }
                var p = this.hitTest(x, y) ? [this] : null;
                return p;
            }
            _stateChange(newState, oldState) {
                var s1 = this._states[oldState];
                var s2 = this._states[newState];
                if (!s1 || !s2)
                    throw new Error("unknown state.");
                var props = s2.props;
                if (s1.onLeave)
                    s1.onLeave(this, newState);
                if (props) {
                    for (let k in props) {
                        if (k === "childsProperty") {
                            var childs = props[k];
                            for (let n in childs) {
                                let child = this._namedChilds[n];
                                if (!child) {
                                    Log.warn(`namedChild '${k}' is not exist.`);
                                    continue;
                                }
                                let cprops = childs[n];
                                for (let p in cprops) {
                                    if (p !== "style" && !child.class.hasProperty(p))
                                        Log.warn(`The UI[${child.class.ClassName}] has no '${n}' property!`);
                                    else {
                                        let v = cprops[p];
                                        child[p] = typeof (v) == "function" ? v.call(this) : v;
                                    }
                                }
                            }
                        }
                        else {
                            let v = props[k];
                            this[k] = typeof (v) == "function" ? v.call(this) : v;
                        }
                    }
                }
                if (s2.onEnter)
                    s2.onEnter(this, oldState);
            }
            _initStates(s, states) {
                this._states = states;
                this.state = s;
                this.addObserver("state", this._stateChange, this);
                this._stateChange(s, s);
            }
        }
        Control.ClassName = "Control";
        Control.Properties = [
            { name: "state", default: null, type: "string" },
            { name: "hittable", type: "boolean" }
        ];
        ui_1.Control = Control;
        initUIClass(Control, Container);
        let ScrollMode;
        (function (ScrollMode) {
            ScrollMode[ScrollMode["Horizontal"] = 1] = "Horizontal";
            ScrollMode[ScrollMode["Vertical"] = 2] = "Vertical";
            ScrollMode[ScrollMode["All"] = 3] = "All";
        })(ScrollMode = ui_1.ScrollMode || (ui_1.ScrollMode = {}));
        class ScrollView extends Control {
            constructor(parent) {
                super(parent);
                this._init(ScrollView);
                this._scrollStage = new ez.SubStageSprite(this._stage);
                this.bind("xScroll", this._scrollStage, "x", ScrollView.convScroll);
                this.bind("yScroll", this._scrollStage, "y", ScrollView.convScroll);
                this.clip = true;
            }
            static convScroll(p) {
                return -p;
            }
            dispose() {
                super.dispose();
                if (this._ticker) {
                    ez.removeTicker(this._ticker);
                    this._ticker = null;
                }
            }
            getScrollRange() {
                var b = this.getBound() || new ez.Rect(0, 0, 1, 1);
                var b2 = b;
                var r = [this.scrollWidth, this.scrollHeight];
                if (!r[0] || !r[1]) {
                    r[0] = r[0] || b.width;
                    r[1] = r[1] || b.height;
                    for (var i = 0; i < this._childs.length; i++) {
                        var c = this._childs[i];
                        b = c.getBound();
                        if (!b) {
                            c.measureBound(b2.width, b2.height);
                            b = c.getBound();
                        }
                        r[0] = Math.max(r[0], b.right);
                        r[1] = Math.max(r[1], b.bottom);
                    }
                    r[0] = this.scrollWidth || r[0];
                    r[1] = this.scrollHeight || r[1];
                }
                return r;
            }
            screenToClient(x, y) {
                var b = this._bound;
                if (b) {
                    x -= b.left - this.xScroll;
                    y -= b.top - this.yScroll;
                }
                return this.parent.screenToClient(x, y);
            }
            clientToScreen(x, y) {
                var b = this._bound;
                if (b) {
                    x += b.left - this.xScroll;
                    y += b.top - this.yScroll;
                }
                return this.parent.clientToScreen(x, y);
            }
            findControls(x, y) {
                if (!this.ptInBound(x, y))
                    return null;
                x -= this._bound.left - this.xScroll;
                y -= this._bound.top - this.yScroll;
                for (var i = this._childs.length - 1; i >= 0; i--) {
                    var r = this._childs[i].findControls(x, y);
                    if (r != null) {
                        r.push(this);
                        return r;
                    }
                }
                return [this];
            }
            get _displayStage() {
                return this._scrollStage;
            }
            setChilds(data) {
                this.clearChilds();
                this._setChilds(data);
            }
        }
        ScrollView.ClassName = "ScrollView";
        ScrollView.HasChildElements = true;
        ScrollView.Properties = [
            { name: "xScroll", default: 0, type: "number", converter: parse.Float, validate: "float" },
            { name: "yScroll", default: 0, type: "number", converter: parse.Float, validate: "float" },
            { name: "scrollWidth", default: 0, type: "number", converter: parse.Float, validate: "float" },
            { name: "scrollHeight", default: 0, type: "number", converter: parse.Float, validate: "float" },
            { name: "scrollMode", default: ScrollMode.All, type: "ScrollMode", converter: parse.getEnumParser(ScrollMode) }
        ];
        ui_1.ScrollView = ScrollView;
        function addScrollEventHandler(uiClass) {
            uiClass.prototype.onTouchBegin = function (d) {
                if (this._startPos)
                    return;
                if (this._ticker) {
                    ez.removeTicker(this._ticker);
                    this._ticker = null;
                }
                this._touchId = d.id;
                this._lastPos = new ez.Point(d.screenX, d.screenY);
                this._startPos = new ez.Point(d.screenX, d.screenY);
                this._lastVol = new ez.Point(0, 0);
                this._startScrollPos = new ez.Point(this.xScroll, this.yScroll);
                ez.Tween.stopTweens(this);
                d.capture();
                d.bubble = false;
            };
            uiClass.prototype.onTouchMove = function (d) {
                if (!this._startPos || this._touchId != d.id)
                    return;
                var dx = d.screenX - this._startPos.x;
                var dy = d.screenY - this._startPos.y;
                var px = this._startScrollPos.x - dx;
                var py = this._startScrollPos.y - dy;
                var mode = this.scrollMode;
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5)
                    d.excludeCapture();
                var dt = 1 / (d.time - this._lastMoveTime + 1);
                var vx = (d.screenX - this._lastPos.x) * dt;
                var vy = (d.screenY - this._lastPos.y) * dt;
                if (Math.abs(vx) > Math.abs(this._lastVol.x))
                    this._lastVol.x = vx * 0.5 + this._lastVol.x * 0.5;
                else
                    this._lastVol.x = vx;
                if (Math.abs(vy) > Math.abs(this._lastVol.y))
                    this._lastVol.y = vy * 0.5 + this._lastVol.y * 0.5;
                else
                    this._lastVol.y = vy;
                this._lastMoveTime = d.time;
                this._lastPos.x = d.screenX;
                this._lastPos.y = d.screenY;
                if (px < 0)
                    px *= 0.4;
                if (py < 0)
                    py *= 0.4;
                var range = this.getScrollRange();
                var w = range[0] - this._bound.width;
                var h = range[1] - this._bound.height;
                if (px > w)
                    px = w + (px - w) * 0.4;
                if (py > h)
                    py = h + (py - h) * 0.4;
                if (mode & ScrollMode.Horizontal)
                    this.xScroll = px;
                if (mode & ScrollMode.Vertical)
                    this.yScroll = py;
            };
            uiClass.prototype.onTouchEnd = function (d) {
                if (!this._startPos || this._touchId != d.id)
                    return;
                this._startPos = undefined;
                this._startScrollPos = undefined;
                var x = this.xScroll;
                var y = this.yScroll;
                var prop = {};
                var mode = this.scrollMode;
                var range = this.getScrollRange();
                var w = range[0] - this._bound.width;
                var h = range[1] - this._bound.height;
                var sh = mode & ScrollMode.Horizontal;
                var sv = mode & ScrollMode.Vertical;
                var ani = ez.Tween.add(this);
                if (x < 0 && sh)
                    prop.xScroll = [x, 0];
                if (y < 0 && sv)
                    prop.yScroll = [y, 0];
                if (x > w && sh)
                    prop.xScroll = [x, w];
                if (y > h && sv)
                    prop.yScroll = [y, h];
                if ((prop.yScroll !== undefined) || (prop.xScroll !== undefined)) {
                    ani.move(prop, 100);
                    ani.play();
                }
                else {
                    var vx = this._lastVol.x;
                    var vy = this._lastVol.y;
                    var sp = {};
                    if (!sh)
                        vx = 0;
                    if (!sv)
                        vy = 0;
                    var sx = vx < 0 ? -1 : 1;
                    var sy = vy < 0 ? -1 : 1;
                    vx = Math.min(5, Math.abs(vx));
                    vy = Math.min(5, Math.abs(vy));
                    function tick() {
                        var y = this.yScroll;
                        var x = this.xScroll;
                        if (vx > 0) {
                            x -= vx * 16 * sx;
                            if (x < 0 || x > w)
                                vx = Math.max(0, vx - 0.5);
                            else
                                vx = Math.max(0, vx - 0.02);
                            this.xScroll -= vx * 16 * sx;
                            x = this.xScroll;
                        }
                        if (vy > 0) {
                            y -= vy * 16 * sy;
                            if (y < 0 || y > h)
                                vy = Math.max(0, vy - 0.5);
                            else
                                vy = Math.max(0, vy - 0.02);
                            this.yScroll -= vy * 16 * sy;
                            y = this.yScroll;
                        }
                        if (vx == 0 && vy == 0) {
                            var prop = {};
                            if (x < 0 && sh)
                                prop.xScroll = [x, 0];
                            if (y < 0 && sv)
                                prop.yScroll = [y, 0];
                            if (x > w && sh)
                                prop.xScroll = [x, w];
                            if (y > h && sv)
                                prop.yScroll = [y, h];
                            if (prop.yScroll !== undefined || prop.xScroll !== undefined) {
                                ani.move(prop, 100);
                                ani.play();
                            }
                            return false;
                        }
                        return true;
                    }
                    this._ticker = ez.addTicker(dt => {
                        for (var i = 0; i < dt; i += 16) {
                            if (!tick.call(this)) {
                                ez.removeTicker(this._ticker);
                                break;
                            }
                        }
                    }, this);
                }
            };
        }
        initUIClass(ScrollView, Control);
        addScrollEventHandler(ScrollView);
        class ScaleScrollView extends ScrollView {
            constructor(parent) {
                super(parent);
            }
            getScrollRange() {
                return [this.scrollWidth * this.scale, this.scrollHeight * this.scale];
            }
            screenToClient(x, y) {
                var b = this._bound;
                if (b) {
                    x -= b.left - this.xScroll;
                    y -= b.top - this.yScroll;
                }
                var s = this.scale;
                x *= s;
                y *= s;
                return this.parent.screenToClient(x, y);
            }
            clientToScreen(x, y) {
                var b = this._bound;
                if (b) {
                    x += b.left - this.xScroll;
                    y += b.top - this.yScroll;
                }
                var s = 1 / this.scale;
                x *= s;
                y *= s;
                return this.parent.clientToScreen(x, y);
            }
            findControls(x, y) {
                if (!this.ptInBound(x, y))
                    return null;
                x -= this._bound.left - this.xScroll;
                y -= this._bound.top - this.yScroll;
                var s = this.scale;
                x *= s;
                y *= s;
                for (var i = this._childs.length - 1; i >= 0; i--) {
                    var r = this._childs[i].findControls(x, y);
                    if (r != null) {
                        r.push(this);
                        return r;
                    }
                }
                return [this];
            }
        }
        ScaleScrollView.ClassName = "ScaleScrollView";
        ScaleScrollView.HasChildElements = true;
        ScaleScrollView.Properties = [
            { name: "scaleRange", default: [1, 2], type: "Number2", converter: parse.Numbers, validate: "int2" },
            { name: "scaleRamp", default: 0.1, type: "number", converter: parse.Float, validate: "float" },
        ];
        ui_1.ScaleScrollView = ScaleScrollView;
        function addScaleScrollEventHandler(uiClass) {
            function findPt(ctx, id) {
                if (ctx._pt1 && ctx._pt1.id == id)
                    return ctx._pt1;
                if (ctx._pt2 && ctx._pt2.id == id)
                    return ctx._pt2;
                return null;
            }
            uiClass.prototype.onTouchBegin = function (d) {
                if (this._pt2)
                    return;
                if (!this._pt1 && this._ticker) {
                    ez.removeTicker(this._ticker);
                    this._ticker = null;
                }
                if (!this._pt1) {
                    this._pt1 = { id: d.id, x: d.screenX, y: d.screenY };
                    this._startScrollPos = new ez.Point(this.xScroll, this.yScroll);
                }
                else {
                    d.excludeCapture();
                    this._pt2 = { id: d.id, x: d.screenX, y: d.screenY };
                    var dx = this._pt1.x - this._pt2.x;
                    var dy = this._pt1.y - this._pt2.y;
                    this._startScale = this.scale / Math.sqrt(dx * dx + dy * dy);
                }
                ez.Tween.stopTweens(this);
                d.capture();
                d.bubble = false;
            };
            uiClass.prototype.onTouchMove = function (d) {
                var pt = findPt(this, d.id);
                if (!pt)
                    return;
                if (this._pt2) {
                    pt.x = d.screenX;
                    pt.y = d.screenY;
                    var dx = this._pt1.x - this._pt2.x;
                    var dy = this._pt1.y - this._pt2.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    var scale = this._startScale * dist;
                    var range = this.scaleRange;
                    if (scale < range[0])
                        scale = range[0] + (scale - range[0]) * this.scaleRamp;
                    else if (scale > range[1])
                        scale = range[1] + (scale - range[1]) * this.scaleRamp;
                    this.scale = scale;
                }
                else {
                    var dx = d.screenX - this._pt1.x;
                    var dy = d.screenY - this._pt1.y;
                    var px = this._startScrollPos.x - dx;
                    var py = this._startScrollPos.y - dy;
                    if (Math.abs(dx) > 5 || Math.abs(dy) > 5)
                        d.excludeCapture();
                    var dt = 1 / (d.time - this._lastMoveTime + 1);
                    var vx = (d.screenX - this._lastPos.x) * dt;
                    var vy = (d.screenY - this._lastPos.y) * dt;
                    if (Math.abs(vx) > Math.abs(this._lastVol.x))
                        this._lastVol.x = vx * 0.5 + this._lastVol.x * 0.5;
                    else
                        this._lastVol.x = vx;
                    if (Math.abs(vy) > Math.abs(this._lastVol.y))
                        this._lastVol.y = vy * 0.5 + this._lastVol.y * 0.5;
                    else
                        this._lastVol.y = vy;
                    this._lastMoveTime = d.time;
                    this._lastPos.x = d.screenX;
                    this._lastPos.y = d.screenY;
                    if (px < 0)
                        px *= 0.4;
                    if (py < 0)
                        py *= 0.4;
                    var range = this.getScrollRange();
                    var w = range[0] - this._bound.width;
                    var h = range[1] - this._bound.height;
                    if (px > w)
                        px = w + (px - w) * 0.4;
                    if (py > h)
                        py = h + (py - h) * 0.4;
                    this.xScroll = px;
                    this.yScroll = py;
                }
            };
            uiClass.prototype.onTouchEnd = function (d) {
                if (!this._pt1)
                    return;
                if (this._pt2) {
                    this._pt2 = null;
                }
                else {
                    this._startPos = undefined;
                    this._startScrollPos = undefined;
                    var x = this.xScroll;
                    var y = this.yScroll;
                    var prop = {};
                    var range = this.getScrollRange();
                    var w = range[0] - this._bound.width;
                    var h = range[1] - this._bound.height;
                    var ani = ez.Tween.add(this);
                    if (x < 0)
                        prop.xScroll = [x, 0];
                    if (y < 0)
                        prop.yScroll = [y, 0];
                    if (x > w)
                        prop.xScroll = [x, w];
                    if (y > h)
                        prop.yScroll = [y, h];
                    if ((prop.yScroll !== undefined) || (prop.xScroll !== undefined)) {
                        ani.move(prop, 100);
                        ani.play();
                    }
                    else {
                        var vx = this._lastVol.x;
                        var vy = this._lastVol.y;
                        var sp = {};
                        var sx = vx < 0 ? -1 : 1;
                        var sy = vy < 0 ? -1 : 1;
                        vx = Math.min(5, Math.abs(vx));
                        vy = Math.min(5, Math.abs(vy));
                        function tick() {
                            var y = this.yScroll;
                            var x = this.xScroll;
                            if (vx > 0) {
                                x -= vx * 16 * sx;
                                if (x < 0 || x > w)
                                    vx = Math.max(0, vx - 0.5);
                                else
                                    vx = Math.max(0, vx - 0.02);
                                this.xScroll -= vx * 16 * sx;
                                x = this.yScroll;
                            }
                            if (vy > 0) {
                                y -= vy * 16 * sy;
                                if (y < 0 || y > h)
                                    vy = Math.max(0, vy - 0.5);
                                else
                                    vy = Math.max(0, vy - 0.02);
                                this.yScroll -= vy * 16 * sy;
                                y = this.yScroll;
                            }
                            if (vx == 0 && vy == 0) {
                                var prop = {};
                                if (x < 0)
                                    prop.xScroll = [x, 0];
                                if (y < 0)
                                    prop.yScroll = [y, 0];
                                if (x > w)
                                    prop.xScroll = [x, w];
                                if (y > h)
                                    prop.yScroll = [y, h];
                                if (prop.yScroll !== undefined || prop.xScroll !== undefined) {
                                    ani.move(prop, 100);
                                    ani.play();
                                }
                                return false;
                            }
                            return true;
                        }
                        this._ticker = ez.addTicker(dt => {
                            for (var i = 0; i < dt; i += 16) {
                                if (!tick.call(this)) {
                                    ez.removeTicker(this._ticker);
                                    break;
                                }
                            }
                        }, this);
                    }
                }
            };
        }
        initUIClass(ScaleScrollView, ScrollView);
        addScaleScrollEventHandler(ScaleScrollView);
        let LayoutMode;
        (function (LayoutMode) {
            LayoutMode[LayoutMode["Horizontal"] = 0] = "Horizontal";
            LayoutMode[LayoutMode["Vertical"] = 1] = "Vertical";
            LayoutMode[LayoutMode["Wrap"] = 2] = "Wrap";
        })(LayoutMode = ui_1.LayoutMode || (ui_1.LayoutMode = {}));
        class ListView extends Container {
            constructor(parent) {
                super(parent);
                this._childChange = false;
                this._init(ListView);
                this.addEventHandler("boundChange", function (e) {
                    this.calcLayout();
                }, this);
            }
            HornLayout() {
                var padding = this.itemPadding;
                var x = padding ? padding[0] : 0;
                var y = padding ? padding[1] : 0;
                var px = padding ? padding[2] : 0;
                for (var i = 0; i < this._childs.length; i++) {
                    var c = this._childs[i];
                    if (!c.visible)
                        continue;
                    var r = c.getBound();
                    r.left = x;
                    r.top = y;
                    x += r.width + px;
                    c.setBound(r);
                }
            }
            VertLayout() {
                var padding = this.itemPadding;
                var x = padding ? padding[0] : 0;
                var y = padding ? padding[1] : 0;
                var py = padding ? padding[3] : 0;
                for (var i = 0; i < this._childs.length; i++) {
                    var c = this._childs[i];
                    if (!c.visible)
                        continue;
                    var r = c.getBound();
                    r.left = x;
                    r.top = y;
                    y += r.height + py;
                    c.setBound(r);
                }
            }
            WrapLayout() {
                var w = this._bound.width;
                var padding = this.itemPadding;
                var x0 = padding ? padding[0] : 0;
                var y = padding ? padding[1] : 0;
                var px = padding ? padding[2] : 0;
                var py = padding ? padding[3] : 0;
                var x = x0;
                for (var i = 0; i < this._childs.length; i++) {
                    var c = this._childs[i];
                    if (!c.visible)
                        continue;
                    var r = c.getBound();
                    if (x > x0 && x + r.width > w) {
                        x = x0;
                        y += r.height + py;
                    }
                    r.left = x;
                    r.top = y;
                    x += r.width + px;
                    c.setBound(r);
                }
            }
            calcLayout() {
                if (!this._bound)
                    return;
                switch (this.layoutMode) {
                    case LayoutMode.Vertical:
                        this.VertLayout();
                        break;
                    case LayoutMode.Horizontal:
                        this.HornLayout();
                        break;
                    case LayoutMode.Wrap:
                        this.WrapLayout();
                        break;
                }
            }
            childSizeChanged() {
                this._sizeDirty = true;
                this._childChange = true;
                childSizeChanged.call(this.parent);
            }
            _createChild() {
                var c = super.createChild(_uiClasses[this.itemClass]);
                c.addObserver("visible", () => {
                    this._childChange = true;
                    childSizeChanged.call(this._parent);
                }, this);
                return c;
            }
            measureBound(width, height, force = false) {
                var i;
                var dim = calcDim.call(this, width, height);
                if (this._sizeDirty) {
                    for (i = 0; i < this._childs.length; i++) {
                        var child = this._childs[i];
                        child.measureBound(dim.width || width, dim.height || height, force);
                    }
                }
                if (force || !this._bound || this._childChange) {
                    var oldBound = this._bound;
                    if (!dim.width || !dim.height) {
                        this._bound = new ez.Rect(0, 0, dim.width || width, dim.height || height);
                        this.calcLayout();
                        dim.width = dim.width || 0;
                        dim.height = dim.height || 0;
                        for (i = 0; i < this._childs.length; i++) {
                            var c = this._childs[i];
                            if (!c.visible)
                                continue;
                            var b = c.getBound();
                            dim.width = Math.max(dim.width, (b.right + (this.itemPadding ? this.itemPadding[2] : 0)));
                            dim.height = Math.max(dim.height, (b.bottom + (this.itemPadding ? this.itemPadding[3] : 0)));
                        }
                    }
                    this._bound = toRect.call(this, width, height, dim);
                    if (!ez.Rect.equal(oldBound, this._bound))
                        this.fireEvent("boundChange", this._bound, false);
                }
                this._sizeDirty = false;
            }
            dispose() {
                super.dispose();
                this._source = null;
            }
            createChild(uiclass, props) {
                throw new Error("List view can't create child element.");
            }
            _createItem(item) {
                var c = this._createChild();
                c.dataSource = item;
                if (this.item) {
                    for (let k in this.item) {
                        if (k === "style")
                            c.style = this.item[k];
                        else {
                            if (DEBUG && !c.class.hasProperty(k))
                                Log.error(`The ${c.class.ClassName} has no '${k}' property!`);
                            else
                                c[k] = this.item[k];
                        }
                    }
                }
                return c;
            }
            _onSrcChange(type, idx, item) {
                var c;
                switch (type) {
                    case 4:
                        this.clearChilds();
                        break;
                    case 0:
                        c = this._createItem(item);
                        this._childs.pop();
                        this._childs.splice(idx, 0, c);
                        break;
                    case 2:
                        c = this._childs[idx];
                        c.dispose();
                        break;
                    case 1:
                        this._childs[idx].dataSource = item;
                        break;
                }
                this._bound = null;
                childSizeChanged.call(this._parent);
            }
            set childsProperty(properties) {
                if (!properties["item"]) {
                    Log.warn(`not find item properties.`);
                    return;
                }
                this.item = properties["item"];
            }
            set items(source) {
                if (!this.itemClass)
                    throw new Error("itemClass is missing");
                if (Array.isArray(source)) {
                    if (!this._source)
                        this._source = new ez.DataCollection();
                    this._source.clear();
                    this._source.addItems(source);
                }
                else
                    this._source = source;
                if (this._srcOb)
                    this._srcOb.dispose();
                this.clearChilds();
                var items = this._source.items;
                for (let i = 0; i < items.length; i++)
                    this._createItem(items[i]);
                this._srcOb = this._source.addObserver(this._onSrcChange, this);
                this._bound = null;
                childSizeChanged.call(this._parent);
            }
            get items() {
                if (!this._source)
                    this.items = new ez.DataCollection();
                return this._source;
            }
        }
        ListView.ClassName = "ListView";
        ListView.Properties = [
            { name: "itemClass", default: "", type: "string" },
            { name: "layoutMode", default: LayoutMode.Vertical, type: "LayoutMode", converter: parse.getEnumParser(LayoutMode) },
            { name: "itemPadding", type: "Number4", converter: parse.Number4, validate: "int4" },
            { name: "item", type: "Object", converter: parse.JSObj }
        ];
        ui_1.ListView = ListView;
        initUIClass(ListView, Container);
        class StackView extends Control {
            constructor(parent) {
                super(parent);
                this._init(StackView);
                this.addObserver("activePage", this.indexChanged, this);
            }
            indexChanged(newVal, oldVal) {
                if (this._slideTween) {
                    var c = this._childs[newVal];
                    c.left = 0;
                    c.top = 0;
                    this._slideTween.stop();
                }
                for (var i = 0; i < this._childs.length; i++)
                    this._childs[i].visible = (newVal == i);
            }
            touchBegin(e) {
            }
            touchMove(e) {
            }
            touchEnd(e) {
            }
            addPage(uiclass, props) {
                var idx = this._childs.length;
                var p = this.createChild(uiclass, props);
                p.visible = idx == this.activePage;
                return p;
            }
            getPage(index) {
                return this._childs[index];
            }
            setChilds(data) {
                this.clearChilds();
                this._setChilds(data);
                for (var i = 0; i < this._childs.length; i++)
                    this._childs[i].visible = (this.activePage == i);
            }
            touchSlide(mode) {
                this.onTouchBegin = this.touchBegin;
                this.onTouchEnd = this.touchEnd;
                this.onTouchMove = this.touchMove;
            }
            slide(activePage, aniCB) {
                if (activePage < 0 || activePage >= this._childs.length)
                    throw new Error("page index out of range.");
                var prevPage = this._childs[this.activePage];
                this.activePage = activePage;
                var currPage = this._childs[activePage];
                prevPage.visible = true;
                this._slideTween = aniCB(prevPage, currPage).target(prevPage).set({ visible: false }).play();
            }
        }
        StackView.ClassName = "StackView";
        StackView.HasChildElements = true;
        StackView.Properties = [
            { name: "activePage", default: 0, type: "number", converter: parse.Int, validate: "int" }
        ];
        ui_1.StackView = StackView;
        initUIClass(StackView, Container);
        class Visual extends Element {
            constructor(parent, sprite) {
                super(parent);
                this._sprite = sprite;
                this._init(Visual);
                this.bind("opacity", this._sprite);
                this.bind("visible", this._sprite);
                this.bind("angle", this._sprite);
                this.bind("blendMode", this._sprite);
                this.bind("scaleX", this._sprite);
                this.bind("scaleY", this._sprite);
                this.bind("scale", this._sprite);
                this.bind("zIndex", this._sprite);
                this.bind("mirrorH", this._sprite);
                this.bind("mirrorV", this._sprite);
                this.bind("effect", this._sprite);
                this.addEventHandler("boundChange", function (e) {
                    var b = this._bound;
                    if (!b)
                        return;
                    var s = this._sprite;
                    s.width = b.width;
                    s.height = b.height;
                    s.anchorX = this.anchorX;
                    s.anchorY = this.anchorY;
                    s.x = b.left + s.anchorX * b.width;
                    s.y = b.top + s.anchorY * b.height;
                }, this);
            }
            get sprite() { return this._sprite; }
            get effectParams() {
                return this._sprite.effectParams;
            }
            set effectParams(v) {
                this._sprite.effectParams = v;
            }
            dispose() {
                this._sprite.dispose();
                this._sprite = null;
                super.dispose();
            }
            hitTest(x, y) {
                return true;
            }
        }
        Visual.ClassName = "Visual";
        Visual.Properties = [
            { name: "effect", default: null, type: "string" },
            { name: "effectParams", default: null, type: "Object", converter: parse.JSObj, customProperty: true },
            { name: "blendMode", default: ez.BlendMode.Normal, type: "BlendMode", converter: parse.getEnumParser(ez.BlendMode) },
            { name: "mirrorH", default: false, type: "boolean", converter: parse.Boolean },
            { name: "mirrorV", default: false, type: "boolean", converter: parse.Boolean },
        ];
        ui_1.Visual = Visual;
        initUIClass(Visual, Element, true);
        class RectFill extends Visual {
            constructor(parent) {
                super(parent, new ez.RectFillSprite(parent._displayStage));
                this._init(RectFill);
                this.bind("color", this._sprite);
                this.bind("gradient", this._sprite);
            }
        }
        RectFill.ClassName = "RectFill";
        RectFill.Properties = [
            { name: "color", default: "#000000", type: "string", validate: "color" },
            { name: "gradient", default: null, type: "GradientFill", converter: parse.GradientFill, validate: "GradientFill" }
        ];
        ui_1.RectFill = RectFill;
        initUIClass(RectFill, Visual);
        class Image extends Visual {
            constructor(parent) {
                super(parent, new ez.ImageSprite(parent._displayStage));
                this._init(Image);
                this.bind("color", this._sprite);
                this.bind("src", this._sprite);
                this.bind("pattern", this._sprite);
                this.addObserver("src", function () {
                    this._bound = null;
                    childSizeChanged.call(this._parent);
                }, this);
            }
            set image(v) {
                this._sprite.src = v;
            }
            hitTest(x, y) {
                return this._sprite.hitTest(x, y);
            }
            measureBound(width, height, force) {
                if (!force && this._bound)
                    return;
                var dim = calcDim.call(this, width, height);
                var src = this.src;
                if (dim.width === undefined)
                    dim.width = src ? src.getData().width : 0;
                if (dim.height === undefined)
                    dim.height = src ? src.getData().height : 0;
                this._bound = toRect.call(this, width, height, dim);
                this.fireEvent("boundChange", this._bound, false);
            }
        }
        Image.ClassName = "Image";
        Image.Properties = [
            { name: "src", default: null, type: "string|ImageRes", converter: parse.ImageSrc, validate: "resource" },
            { name: "color", default: "#ffffff", type: "string", validate: "color" },
            { name: "pattern", default: null, type: "string", validate: "pattern" }
        ];
        ui_1.Image = Image;
        initUIClass(Image, Visual);
        class SeqFrame extends Visual {
            constructor(parent) {
                super(parent, new ez.SeqFrameSprite(parent._displayStage));
                this._init(SeqFrame);
                this.bind("color", this._sprite);
                this.bind("frames", this._sprite);
                this.bind("fps", this._sprite);
                this.bind("autoPlay", this._sprite);
                this.addObserver("frames", function (v) {
                    this._bound = null;
                    childSizeChanged.call(this._parent);
                }, this);
            }
            play() {
                this.sprite.play();
            }
            stop() {
                this.sprite.stop();
            }
            pause() {
                this.sprite.pause();
            }
            get state() {
                return this.sprite.state;
            }
            hitTest(x, y) {
                return this._sprite.hitTest(x, y);
            }
            measureBound(width, height, force) {
                if (!force && this._bound)
                    return;
                var dim = calcDim.call(this, width, height);
                if (this.frames) {
                    var img = ez.getRes(this.frames.prefix + this.frames.from);
                    if (dim.width === undefined)
                        dim.width = img ? img.getData().width : 0;
                    if (dim.height === undefined)
                        dim.height = img ? img.getData().height : 0;
                }
                this._bound = toRect.call(this, width, height, dim);
                this.fireEvent("boundChange", this._bound, false);
            }
        }
        SeqFrame.ClassName = "SeqFrame";
        SeqFrame.Properties = [
            { name: "frames", default: null, type: "SeqFrameDesc", converter: parse.SeqFrameDesc, validate: "SeqFrameDesc" },
            { name: "color", default: "#ffffff", type: "string", validate: "color" },
            { name: "loop", default: false, type: "boolean" },
            { name: "autoPlay", default: false, type: "boolean" },
            { name: "fps", default: 30, type: "number", validate: "float" },
        ];
        ui_1.SeqFrame = SeqFrame;
        initUIClass(SeqFrame, Visual);
        class UIStage extends Visual {
            constructor(parent) {
                super(parent, new ez.SubStageSprite(parent._displayStage));
                this.setProp("childs", null);
                this.bind("clip", this._sprite);
            }
            _setProps(props) {
                for (let k in props) {
                    if (k === "class" || k === "id" || k === "_array") {
                        continue;
                    }
                    else if (k === "childsProperty") {
                        Log.error(`${this.class.ClassName} can't have childs`);
                    }
                    else if (k === "_childs") {
                        this.setChilds(props[k]);
                    }
                    else if (k === "style") {
                        this[k] = props[k];
                    }
                    else {
                        if (DEBUG && !this.class.hasProperty(k))
                            Log.error(`The ${this.class.ClassName} has no '${k}' property!`);
                        this[k] = props[k];
                    }
                }
            }
            find(id) {
                return this.sprite.find(id);
            }
            get stage() {
                return this._sprite;
            }
            setChilds(val) {
                this.stage.clear();
                this.stage.load(val);
            }
        }
        UIStage.ClassName = "UIStage";
        UIStage.HasChildElements = true;
        UIStage.Properties = [
            { name: "clip", default: false, type: "boolean", converter: parse.Boolean }
        ];
        ui_1.UIStage = UIStage;
        initUIClass(UIStage, Visual);
        class Label extends Visual {
            constructor(parent) {
                super(parent, new ez.LabelSprite(parent._displayStage));
                this._init(Label);
                this.addObserver("textStyle", this.textStyleChanged, this);
                this.bind("text", this._sprite);
                this.bind("font", this._sprite);
                this.bind("format", this._sprite);
                this.bind("strokeColor", this._sprite);
                this.bind("strokeWidth", this._sprite);
                this.bind("color", this._sprite);
                this.bind("bkColor", this._sprite);
                this.bind("lineHeight", this._sprite);
                this.bind("align", this._sprite);
                this.bind("margin", this._sprite);
                this.bind("gradient", this._sprite);
                this.textStyleChanged();
            }
            textStyleChanged() {
                this._textStyleCache = { id: "" };
                var c = this;
                do {
                    var s = c.textStyle;
                    if (s) {
                        var style = getTextStyle(s);
                        if (style) {
                            for (var k in style)
                                if (!this._textStyleCache.hasOwnProperty(k))
                                    this._textStyleCache[k] = style[k];
                        }
                    }
                    c = c.parent;
                } while (c);
                var props = ["font", "strokeColor", "format", "strokeWidth", "color", "bkColor", "lineHeight", "align", "margin"];
                var sp = this._sprite;
                for (var i in props) {
                    var p = props[i];
                    sp[p] = this.getProp(p) || this._textStyleCache[p];
                }
            }
            get textMetric() {
                return this._sprite.textMetric;
            }
            measureBound(width, height, force) {
                if (!force && this._bound)
                    return;
                var sprite = this._sprite;
                var dim = calcDim.call(this, width, height);
                if (!dim.width || !dim.height) {
                    sprite.width = dim.width || 1024;
                    sprite.height = dim.height || 1024;
                    if (!dim.width)
                        dim.width = sprite.textMetric.maxWidth + (this.hasProp("margin") ? this.margin[0] + this.margin[2] : 0);
                    if (!dim.height)
                        dim.height = sprite.textMetric.lineHeight * Math.max(1, sprite.textMetric.lines.length) + (this.hasProp("margin") ? this.margin[1] + this.margin[3] : 0);
                }
                this._bound = toRect.call(this, width, height, dim);
                this.fireEvent("boundChange", this._bound, false);
            }
            get font() {
                return this.getProp("font") || this._textStyleCache.font;
            }
            set font(v) {
                this.setProp("font", v);
            }
            get format() {
                return this.getProp("format") || this._textStyleCache.format;
            }
            set format(v) {
                this.setProp("format", v);
            }
        }
        Label.ClassName = "Label";
        Label.Properties = [
            { name: "text", default: "", type: "string" },
            { name: "font", type: "string", customProperty: true, validate: "font" },
            { name: "format", type: "TextFormat", converter: parse.getEnumParser(ez.TextFormat), customProperty: true },
            { name: "strokeColor", type: "string", validate: "color" },
            { name: "strokeWidth", type: "number", converter: parse.Int, validate: "int" },
            { name: "color", type: "string", validate: "color" },
            { name: "bkColor", type: "string", validate: "color" },
            { name: "lineHeight", type: "number", converter: parse.Int, validate: "int" },
            { name: "align", type: "AlignMode", converter: parse.getEnumParser(ez.AlignMode) },
            { name: "margin", type: "Number4", converter: parse.Number4, validate: "int4" },
            { name: "textStyle", type: "string" },
            { name: "gradient", default: null, type: "GradientFill", converter: parse.GradientFill, validate: "GradientFill" }
        ];
        ui_1.Label = Label;
        initUIClass(Label, Visual);
        class RichTextWithHyperlink extends Control {
            constructor(parent) {
                super(parent);
                this.onTouchBegin = function (d) {
                    var pt = this.screenToClient(d.screenX, d.screenY);
                    var href = this.findHyperlink(pt);
                    if (!href)
                        return;
                    this._href = href;
                    d.capture();
                    this.state = "down";
                };
                this.onTouchCancel = function (id) {
                    if (this.state == "down")
                        this.state = "normal";
                };
                this.onTouchEnd = function (d) {
                    if (this.state == "down") {
                        this.state = "normal";
                        var pt = this.screenToClient(d.screenX, d.screenY);
                        var href = this.findHyperlink(pt);
                        if (this._href == href)
                            this.fireEvent("click", href.href);
                        this._href = null;
                    }
                };
                this._init(RichTextWithHyperlink);
                this._createChilds([
                    { class: "Label", id: "label", width: "100%", height: "100%" }
                ]);
                this._initStates("normal", { normal: {}, down: {} });
                this._label = this._namedChilds["label"];
                this._label.format = ez.TextFormat.MultiLine | ez.TextFormat.WordBreak | ez.TextFormat.RichText;
                this._label.align = ez.AlignMode.Left | ez.AlignMode.Top;
                this.bind("text", this._label);
                this.bind("font", this._label);
                this.bind("color", this._label);
                this.bind("lineHeight", this._label);
            }
            get namedChilds() {
                return this._namedChilds;
            }
            get textMetric() {
                return this._label.textMetric;
            }
            findHyperlink(pt) {
                let metric = this._label.textMetric;
                let line = (pt.y / metric.lineHeight) | 0;
                if (line >= metric.richLines.length)
                    return null;
                var items = metric.richLines[line];
                for (let i = 0; i < items.length; i++) {
                    let item = items[i];
                    if (item.href && pt.x >= item.x && pt.x < item.x + item.width)
                        return item;
                }
                return null;
            }
            get font() {
                if (this.hasProp("font"))
                    return this.getProp("font");
                else
                    return this._label.font;
            }
            set font(v) {
                this.setProp("font", v);
            }
        }
        RichTextWithHyperlink.ClassName = "RichTextWithHyperlink";
        RichTextWithHyperlink.Properties = [
            { name: "text", default: "", type: "string" },
            { name: "font", type: "string", customProperty: true },
            { name: "color", type: "string" },
            { name: "lineHeight", type: "number", converter: parse.Int }
        ];
        ui_1.RichTextWithHyperlink = RichTextWithHyperlink;
        initUIClass(RichTextWithHyperlink, Control);
        class TextInput extends Control {
            constructor(parent) {
                super(parent);
                var ctx = this;
                this._label = new ez.LabelSprite(this.parentStage);
                var lb = this._label;
                lb.format = ez.TextFormat.Ellipse;
                this._init(TextInput);
                this.bind("text", lb, "text", c => {
                    if (ctx.type === "password")
                        c = c.replace(/./g, "●");
                    return c;
                });
                this.bind("font", lb);
                this.bind("color", lb);
                this.bind("bkColor", lb);
                this.bind("lineHeight", lb);
                this.bind("opacity", lb);
                this.bind("visible", lb);
                this.bind("angle", lb);
                this.bind("scaleX", lb);
                this.bind("scaleY", lb);
                this.bind("scale", lb);
                this.bind("zIndex", lb);
                this._label.align = ez.AlignMode.Left | ez.AlignMode.VCenter;
                this.addObserver("multiLine", function (v) {
                    lb.format = v ? ez.TextFormat.WordBreak | ez.TextFormat.MultiLine : ez.TextFormat.Ellipse;
                    lb.align = v ? ez.AlignMode.Left | ez.AlignMode.Top : ez.AlignMode.Left | ez.AlignMode.VCenter;
                }, this);
                this.bind("margin", lb);
                this._initStates("normal", TextInput.States);
                this.addEventHandler("boundChange", function (e) {
                    var b = this._bound;
                    if (!b)
                        return;
                    var s = this._label;
                    s.width = b.width;
                    s.height = b.height;
                    s.anchorX = this.anchorX;
                    s.anchorY = this.anchorY;
                    s.x = b.left + s.anchorX * b.width;
                    s.y = b.top + s.anchorY * b.height;
                }, this);
                this.addObserver("textStyle", this.textStyleChanged, this);
            }
            dispose() {
                if (this.state == "inputing") {
                    ez.getRoot().cancelInput();
                }
                this._label.dispose();
                this._label = null;
                super.dispose();
            }
            textStyleChanged() {
                var s = this.textStyle;
                var parent = this.parent;
                while (!s && parent) {
                    s = parent.textStyle;
                    parent = parent.parent;
                }
                if (s) {
                    var props = ["font", "color", "bkColor", "lineHeight", "margin"];
                    var sp = this._label;
                    for (var i in props) {
                        var p = props[i];
                        if (s[p] !== undefined && !this.hasProp(p))
                            sp[p] = s[p];
                    }
                }
            }
            beginInput() {
                this.state = "inputing";
                ez.getRoot().startInput(this);
            }
            createChild(uiclass, props) {
                throw new Error("TextInput can't create child element.");
            }
            findControls(x, y) {
                if (!this.ptInBound(x, y) || !this.touchable)
                    return null;
                return [this];
            }
        }
        TextInput.ClassName = "TextInput";
        TextInput.Properties = [
            { name: "text", default: "", type: "string" },
            { name: "font", type: "string", validate: "font" },
            { name: "color", type: "string", validate: "color" },
            { name: "bkColor", type: "string", validate: "color" },
            { name: "lineHeight", type: "number", converter: parse.Int, validate: "int" },
            { name: "multiLine", type: "boolean", converter: parse.Boolean },
            { name: "submitOnReturn", type: "boolean", converter: parse.Boolean },
            { name: "margin", type: "Number4", converter: parse.Number4, validate: "int4" },
            { name: "maxLength", type: "number", converter: parse.Int, validate: "int" },
            { name: "type", default: "text", type: "string" }
        ];
        TextInput.States = { normal: {}, inputing: {}, disable: {} };
        ui_1.TextInput = TextInput;
        initUIClass(TextInput, Control);
        TextInput.prototype.onTouchBegin = function (e) {
            if (this.state == "normal") {
                e.bubble = false;
                this.beginInput();
            }
        };
        class TabGroup extends Container {
            constructor(parent) {
                super(parent);
                this._tabs = [];
                this._init(TabGroup);
                this.addObserver("activeIndex", this._selectChange, this);
            }
            _selectChange(newVal, oldVal) {
                if (oldVal >= 0 && oldVal < this._tabs.length)
                    this._tabs[oldVal].state = "unselect";
                if (newVal >= 0 && newVal < this._tabs.length)
                    this._tabs[newVal].state = "select";
                else
                    Log.warn("tab index out of range.");
            }
            select(tab) {
                const idx = this._tabs.indexOf(tab);
                if (idx == -1)
                    throw new Error("tab is not exist!");
                this.activeIndex = idx;
            }
            addTabBtn(btn, props) {
                const idx = this._childs.length;
                let tab;
                if (typeof (btn) === "string") {
                    let klass = _uiClasses[btn];
                    if (!klass)
                        throw new Error(`${btn} is not exist!`);
                    tab = this.createChild(klass, props);
                }
                else
                    tab = btn;
                tab.group = this;
                tab.state = idx == this.activeIndex ? "select" : "unselect";
                this._tabs.push(tab);
                return tab;
            }
            setChilds(items) {
                this.clearChilds();
                this._setChilds(items);
                for (var i = 0; i < this._childs.length; i++)
                    this.addTabBtn(this._childs[i]);
                var idx = this.activeIndex;
                if (idx >= 0 && idx < this._tabs.length)
                    this._tabs[idx].state = "select";
            }
        }
        TabGroup.ClassName = "TabGroup";
        TabGroup.HasChildElements = true;
        TabGroup.Properties = [
            { name: "activeIndex", default: -1, type: "number", converter: parse.Int, validate: "int" },
        ];
        ui_1.TabGroup = TabGroup;
        initUIClass(TabGroup, Container);
    })(ui = ez.ui || (ez.ui = {}));
})(ez || (ez = {}));
var ez;
(function (ez) {
    var ui;
    (function (ui) {
        class EventHandlerBase {
        }
        ui.EventHandlerBase = EventHandlerBase;
        class TabBtnEventHandler extends EventHandlerBase {
            onTouchBegin(d) {
                if (this.state == "unselect") {
                    this.state = "down";
                    d.capture();
                }
                else if (this.state == "select") {
                    this.state = "selectDown";
                    d.capture();
                }
            }
            onTouchMove(d) {
            }
            onTouchCancel(id) {
                if (this.state == "down")
                    this.state = "unselect";
                else if (this.state == "selectDown")
                    this.state = "select";
            }
            onTouchEnd(d) {
                if (this.state == "down") {
                    var pt = this.parent.screenToClient(d.screenX, d.screenY);
                    if (this.group && this._bound && this._bound.containsPt(pt)) {
                        this.state = "select";
                        this.group.select(this);
                    }
                    else
                        this.state = "unselect";
                }
                else if (this.state == "selectDown")
                    this.state = "select";
            }
        }
        function addTabBtnEventHandler(uiClass) {
            uiClass.checkStates("unselect", "down", "select", "selectDown");
            uiClass.mixins(TabBtnEventHandler);
        }
        ui.addTabBtnEventHandler = addTabBtnEventHandler;
        class ButtonEventHandler extends EventHandlerBase {
            onCreate() {
                this._initScale = this.scale || 1;
            }
            stopAni() {
                if (this._ani) {
                    this._ani.stop();
                    this._ani = undefined;
                }
            }
            onTouchBegin(d) {
                if (this.state == "normal") {
                    this.state = "down";
                    this.stopAni();
                    this._ani = ez.Tween.add(this).move({ scale: [this._initScale, this._initScale * this.btnScale] }, 100).play();
                    d.capture();
                }
            }
            onTouchMove(d) {
                if (this.state == "down") {
                    var pt = this.parent.screenToClient(d.screenX, d.screenY);
                    if (this._bound && !this._bound.containsPt(pt)) {
                        this.stopAni();
                        if (this.scale)
                            this._ani = ez.Tween.add(this).move({ scale: [this.scale, this._initScale] }, 100, ez.Ease.sineOut).play();
                    }
                    else if (!this._ani || this._ani.state == 0) {
                        this._ani = undefined;
                        this.scale = this._initScale * this.btnScale;
                    }
                }
            }
            onTouchEnd(d) {
                if (this.state == "down") {
                    this.state = "normal";
                    this.stopAni();
                    this._ani = ez.Tween.add(this).move({ scale: [this.scale, this._initScale] }, 100, ez.Ease.sineOut);
                    this._ani.play();
                    var pt = this.parent.screenToClient(d.screenX, d.screenY);
                    if (this._bound && this._bound.containsPt(pt)) {
                        if (this.sfx)
                            ez.playSFX(this.sfx);
                        this.fireEvent("click");
                    }
                }
            }
            onTouchCancel(id) {
                if (this.state == "down") {
                    this.stopAni();
                    this.scale = undefined;
                    this.state = "normal";
                }
            }
        }
        function addButtonEventHandler(uiClass, btnScale, snd) {
            if (!uiClass.prototype.hasOwnProperty("btnScale"))
                uiClass.prototype.btnScale = btnScale || 0.85;
            if (snd)
                uiClass.prototype.sfx = snd;
            uiClass.checkStates("normal", "down");
            uiClass.mixins(ButtonEventHandler);
        }
        ui.addButtonEventHandler = addButtonEventHandler;
        class CheckboxEventHandler extends EventHandlerBase {
            constructor() {
                super(...arguments);
                this._push = false;
            }
            onCreate() {
                this._initScale = this.scale || 1;
            }
            stopAni() {
                if (this._ani) {
                    this._ani.stop();
                    this._ani = undefined;
                }
            }
            onTouchBegin(d) {
                if (!this._push) {
                    this._push = true;
                    this.stopAni();
                    this._ani = ez.Tween.add(this).move({ scale: [this._initScale, this._initScale * this.btnScale] }, 100).play();
                    d.capture();
                }
            }
            onTouchCancel(id) {
                if (this._push) {
                    this.stopAni();
                    this.scale = undefined;
                }
                this._push = false;
            }
            onTouchMove(d) {
                if (this._push) {
                    var pt = this.parent.screenToClient(d.screenX, d.screenY);
                    if (this._bound && !this._bound.containsPt(pt)) {
                        this.stopAni();
                        if (this.scale)
                            this._ani = ez.Tween.add(this).move({ scale: [this.scale, this._initScale] }, 100, ez.Ease.sineOut).play();
                    }
                    else if (!this._ani || this._ani.state == 0) {
                        this._ani = undefined;
                        this.scale = this._initScale * this.btnScale;
                    }
                }
            }
            onTouchEnd(d) {
                if (this._push) {
                    this.stopAni();
                    this._ani = ez.Tween.add(this).move({ scale: [this.scale, this._initScale] }, 100, ez.Ease.sineOut);
                    this._ani.play();
                    var pt = this.parent.screenToClient(d.screenX, d.screenY);
                    if (this._bound && this._bound.containsPt(pt)) {
                        if (this.state == "check")
                            this.state = "uncheck";
                        else
                            this.state = "check";
                        if (this.sfx)
                            ez.playSFX(this.sfx);
                        this.fireEvent("click");
                    }
                }
                this._push = false;
            }
        }
        function addCheckboxEventHandler(uiClass, btnScale, snd) {
            if (!uiClass.prototype.hasOwnProperty("btnScale"))
                uiClass.prototype.btnScale = btnScale || 0.85;
            if (snd)
                uiClass.prototype.sfx = snd;
            uiClass.checkStates("uncheck", "check");
            uiClass.mixins(CheckboxEventHandler);
        }
        ui.addCheckboxEventHandler = addCheckboxEventHandler;
    })(ui = ez.ui || (ez.ui = {}));
})(ez || (ez = {}));
var ez;
(function (ez) {
    function loadHitMask(mask) {
        var data = new Int8Array(mask, 10);
        var info = new Int16Array(mask, 0, 5);
        var sig = info[0] + (info[1] << 16);
        if (sig != 0x4B53414D) {
            Log.error('mask file error.');
            return null;
        }
        var w = info[2];
        var h = info[3];
        var level = info[4];
        var lines = [];
        var line = [];
        var last = 0;
        for (var i = 0; i < mask.byteLength - 10; i++) {
            var len = data[i];
            if (len == -128) {
                if (line.length > 0)
                    Log.error(`mask data error`);
                var d = data[++i];
                var l = lines[lines.length - d - 1];
                lines.push(l);
                continue;
            }
            if (len == 0) {
                if (last)
                    line.push(last);
                lines.push(line.length > 0 ? line : null);
                line = [];
                last = 0;
            }
            else if (last * len < 0) {
                line.push(last);
                last = len;
            }
            else
                last += len;
        }
        if (lines.length != h)
            Log.error("mask data error");
        Log.debug(`load mask sig=${sig} width=${w} height=${w} level=${level} lines=${lines.length}`);
        return { level: level, data: lines };
    }
    class ImageSprite extends ez.Sprite {
        constructor(stage, id) {
            super(stage, id);
            this._data = null;
            this._color = "#ffffff";
        }
        _dispose() {
            this._texture = null;
            this._data = null;
            this._parent = null;
            super._dispose();
        }
        getType() {
            return ImageSprite.Type;
        }
        _draw(rc, opacity) {
            var tex = this._texture;
            if (!tex || tex.empty)
                return;
            if (!tex.ready) {
                tex.load(this.setDirty.bind(this));
                return;
            }
            rc.setFillColor(this.color);
            opacity *= this.opacity;
            if (opacity < 0.01)
                return;
            if (useWGL)
                this.applyEffect(rc);
            rc.setAlphaBlend(opacity, this.blendMode);
            if (rc.setZ)
                rc.setZ(this.zIndex);
            var transform = ezasm.getglobalTrans(this._handle);
            if (!transform) {
                Log.error("global transfrom is null", tex.name);
            }
            if (this._pattern)
                rc.drawImageRepeat(tex, transform, this.width, this.height, this._pattern);
            else if (tex.s9)
                rc.drawImageS9(tex, transform, tex.s9, this.width, this.height, tex.subRect);
            else
                rc.drawImage(tex, transform, this.width, this.height, tex.subRect);
        }
        _setWidth(val) {
            var h = this._handle;
            if (!h)
                return;
            if (ezasm.setwidth(h, val))
                this.setDirty();
        }
        _setHeight(val) {
            var h = this._handle;
            if (!h)
                return;
            if (ezasm.setheight(h, val))
                this.setDirty();
        }
        get width() {
            return ezasm.getwidth(this._handle);
        }
        set width(val) {
            this._setWidth(val);
            this._width = val;
        }
        get height() {
            return ezasm.getheight(this._handle);
        }
        set height(val) {
            this._setHeight(val);
            this._height = val;
        }
        get src() {
            return this._data;
        }
        set src(img) {
            if (typeof img === "string")
                img = ez.parse.ImageSrc(img);
            if (this._data == img)
                return;
            this.setDirty();
            this._data = img;
            this._hitMask = null;
            if (!img) {
                this._texture = null;
                return;
            }
            var imgRes = img;
            if (imgRes.getData) {
                this._texture = imgRes.getData();
                if (imgRes.hitMask) {
                    this._hitMask = imgRes.hitMask;
                }
                else if (imgRes.args.hitMask) {
                    let mask = ez.getRes(imgRes.args.hitMask);
                    mask.load(r => {
                        if (r)
                            this._hitMask = imgRes.hitMask = loadHitMask(mask.getData());
                    }, this);
                }
                else
                    this._hitMask = null;
            }
            else
                this._texture = img;
            if (this._width === undefined)
                this._setWidth(this._texture.width);
            if (this._height === undefined)
                this._setHeight(this._texture.height);
        }
        get pattern() {
            return this._pattern;
        }
        set pattern(pattern) {
            if (this._pattern == pattern)
                return;
            this._pattern = pattern;
            this.setDirty();
        }
        get clipRect() {
            return this._clipRect;
        }
        set clipRect(r) {
            this._clipRect = r;
            this.setDirty();
        }
        hitTest(x, y) {
            if (!this._texture)
                return false;
            if (x < 0 || y < 0 || x >= this.width || y >= this.height)
                return false;
            if (!this._hitMask)
                return true;
            let t = this._texture;
            x = (x * t.width / this.width) >> this._hitMask.level;
            y = (y * t.height / this.height) >> this._hitMask.level;
            var line = this._hitMask.data[y];
            if (!line)
                return false;
            let idx = 0;
            while (idx < line.length) {
                var l = Math.abs(line[idx]);
                if (x < l)
                    return line[idx] > 0;
                else
                    x -= l, idx++;
            }
            return false;
        }
    }
    ImageSprite.Type = "Image";
    ez.ImageSprite = ImageSprite;
    ez.Sprite.register(ImageSprite.Type, function (p, id) { return new ImageSprite(p, id); });
})(ez || (ez = {}));
var ez;
(function (ez) {
    function loadFont(name, url, fontweight = "normal", fontstyle = "normal") {
        if (PLATFORM == 3) {
            fonts[name] = wx.loadFont(url + ".ttf");
            Log.info(`load font ${name}. alias: ${fonts[name]}`);
            if (fonts[name] == null)
                fonts[name] = "Arial";
        }
        else {
            var style = document.createElement("style");
            style.appendChild(document.createTextNode(`@font-face {
	font-family: '${name}';
	src: url('${url}.eot');
	src: url('${url}.woff') format('woff'), url('${url}.ttf') format('truetype');
	font-weight: ${fontweight};
    font-style: ${fontstyle};
}`));
            document.head.appendChild(style);
            var ctx = TextMetric._ctx;
            ctx.font = `10px ${name}`;
            ctx.fillText("a1", 0, 0, 10);
        }
    }
    ez.loadFont = loadFont;
    class TextMetric {
        constructor(font) {
            if (!font)
                font = "16px";
            font = font.trim();
            var idx = font.indexOf("px");
            if (idx == -1) {
                Log.warn("the font size is missing: " + font);
                return;
            }
            if (idx >= font.length - 3) {
                var def = TextMetric.DefaultFont;
                font += def.substring(def.indexOf("px") + 2);
            }
            if (PLATFORM == 3)
                this._font = fontConv(font);
            else
                this._font = font;
            this.lineHeight = TextMetric.getFontHeight(this._font);
        }
        static isFullWidth(ch) {
            if (ch < 0x0080)
                return false;
            return (ch >= 0x4E00 && ch <= 0x9FFF || ch >= 0x3040 && ch <= 0x309F || ch >= 0x30A0 && ch <= 0x30FF || ch >= 0xAC00 && ch <= 0xD7A3);
        }
        static GetNextWordBreak(str, index) {
            var i = index;
            var nonWhite = true;
            while (i < str.length) {
                var ch = str.charCodeAt(i);
                if (ch == 9 || ch == 0x20)
                    return i + (nonWhite ? 1 : 0);
                if (TextMetric.isFullWidth(ch)) {
                    if (!nonWhite)
                        return i;
                    if (i < str.length - 1 && TextMetric.EndBreak[str.charAt(i + 1)])
                        return i + 2;
                    return i + 1;
                }
                i++;
                nonWhite = false;
            }
            return i;
        }
        static textWidthLowerBound(ctx, text, maxWidth) {
            var n1 = 0;
            var n2 = text.length;
            var n = (n2 + n1 + 1) >> 1;
            while (true) {
                var w = ctx.measureText(text.substring(0, n)).width;
                if (w == maxWidth)
                    return n;
                else if (w < maxWidth)
                    n1 = n;
                else
                    n2 = n;
                if (n2 - n1 <= 1)
                    return n1;
                n = (n2 + n1 + 1) >> 1;
            }
        }
        static measureLine(ctx, text, x, maxWidth, wordBreak, single) {
            if (text.length == 0)
                return [];
            var lines = [];
            if (wordBreak) {
                var idx = 0;
                var w1 = 0;
                var s1;
                while (true) {
                    if (idx == 0) {
                        var width = ctx.measureText(text).width;
                        if (width <= maxWidth - x) {
                            lines.push({ text: text, width: width });
                            return lines;
                        }
                    }
                    var end = TextMetric.GetNextWordBreak(text, idx);
                    var str = text.substring(0, end);
                    var w = ctx.measureText(str).width;
                    if (w1 > 0 && w >= maxWidth - x) {
                        lines.push({ text: s1, width: w1 });
                        text = text.substring(idx);
                        x = 0;
                        idx = 0;
                        w1 = 0;
                    }
                    else if (w1 == 0 && w >= maxWidth - x) {
                        var i = TextMetric.textWidthLowerBound(ctx, str, maxWidth - x);
                        if (x == 0 && i == 0)
                            i = 1;
                        if (i > 0) {
                            str = str.substring(0, i);
                            lines.push({ text: str, width: ctx.measureText(str).width });
                            text = text.substring(i);
                            x = 0;
                            idx = 0;
                            w1 = 0;
                        }
                        else {
                            lines.push({ text: "", width: 0 });
                            idx = 0;
                            x = 0;
                        }
                    }
                    else {
                        idx = end;
                        w1 = w;
                        s1 = str;
                    }
                    if (single && lines.length > 0)
                        return lines;
                }
            }
            else {
                while (true) {
                    var w = ctx.measureText(text).width;
                    if (w < maxWidth - x) {
                        lines.push({ text: text, width: w, newline: true });
                        return lines;
                    }
                    var str = text;
                    if (w > (maxWidth - x) * 2)
                        str = text.substring(0, ((text.length * (maxWidth - x) * 2 / w) | 0) || 1);
                    var idx = TextMetric.textWidthLowerBound(ctx, str, (maxWidth - x));
                    if (x == 0 && idx == 0)
                        idx = 1;
                    if (idx > 0) {
                        str = str.substring(0, idx);
                        lines.push({ text: str, width: ctx.measureText(str).width });
                        x = 0;
                    }
                    else {
                        lines.push({ text: "", width: 0 });
                        x = 0;
                    }
                    if (single && lines.length > 0)
                        return lines;
                    text = text.substring(idx);
                }
            }
        }
        measureRichText(text, width, height, format, color) {
            if (text == null)
                text = "";
            if (typeof text !== "string")
                text = text.toString();
            if (text === "") {
                this.maxWidth = 0;
                this.richLines = [];
                return;
            }
            var maxLine = Math.max(1, (height / this.lineHeight) | 0);
            text = text.replace("\r\n", "\n").replace("\n", "");
            var font = this._font;
            function parseRichText(text) {
                var start = 0;
                var i = 0;
                var richTexts = [];
                var colors = [color];
                var fonts = [font];
                var strokes = [];
                var underline = false;
                var strike = false;
                var href = null;
                function texseg(t) {
                    var s = { color: colors[colors.length - 1], font: fonts[fonts.length - 1], stroke: stroke, text: t };
                    if (underline)
                        s.underline = true;
                    if (strike)
                        s.strike = true;
                    if (href)
                        s.href = href;
                    return s;
                }
                while (true) {
                    var tagBegin = text.indexOf("<", start);
                    var stroke = strokes[strokes.length - 1];
                    if (tagBegin < 0) {
                        if (start < text.length)
                            richTexts.push(texseg(text.substring(start)));
                        break;
                    }
                    var tagEnd = text.indexOf(">", tagBegin + 1);
                    if (tagEnd < 0) {
                        if (start < text.length)
                            richTexts.push(texseg(text.substring(start)));
                        break;
                    }
                    if (tagBegin > start) {
                        richTexts.push(texseg(text.substring(start, tagBegin)));
                    }
                    start = tagEnd + 1;
                    var tag = text.substring(tagBegin + 1, tagEnd);
                    if (tag === "/color" && colors.length > 1)
                        colors.pop();
                    else if (tag === "/font" && fonts.length > 1)
                        fonts.pop();
                    else if (tag === "/stroke")
                        strokes.pop();
                    else if (tag === "/a")
                        href = null;
                    else if (tag === "/u")
                        underline = false;
                    else if (tag === "/s")
                        strike = false;
                    else {
                        if (tag === "br")
                            richTexts.push(0);
                        else if (tag === "u")
                            underline = true;
                        else if (tag === "s")
                            strike = true;
                        else if (tag.substr(0, 2) == "a ") {
                            let idx = tag.indexOf("=");
                            if (idx > 0)
                                href = tag.substr(idx + 1).trim();
                        }
                        else {
                            let idx = tag.indexOf("=");
                            if (idx > 0) {
                                switch (tag.substr(0, idx)) {
                                    case "color":
                                        colors.push(tag.substr(idx + 1).trim());
                                        break;
                                    case "font":
                                        fonts.push(tag.substr(idx + 1));
                                        break;
                                    case "stroke":
                                        var s = tag.substring(idx + 1).trim().split(" ");
                                        strokes.push({ width: parseInt(s[0]), color: s[1] });
                                        break;
                                }
                            }
                        }
                    }
                }
                return richTexts;
            }
            var richText = parseRichText(text);
            var wordBreak = (format & ez.TextFormat.WordBreak) != 0;
            var ellipse = !!(format & ez.TextFormat.Ellipse);
            if (format & ez.TextFormat.MultiLine) {
                this.richLines = [[]];
                var x = 0;
                var currLine = this.richLines[0];
                this.maxWidth = 0;
                for (let i = 0; i < richText.length; i++) {
                    var t = richText[i];
                    if (t === 0) {
                        x = 0;
                        currLine = [];
                        this.richLines.push(currLine);
                    }
                    else {
                        TextMetric._ctx.font = t.font;
                        var l = TextMetric.measureLine(TextMetric._ctx, t.text, x, width, wordBreak, false);
                        var end = false;
                        if (this.richLines.length + l.length - 1 > maxLine) {
                            l = l.splice(maxLine - this.richLines.length, l.length - maxLine + this.richLines.length);
                            if (ellipse) {
                                let last = l[l.length - 1];
                                if (last.text.length > 1)
                                    last.text = last.text.substring(0, last.text.length - 1);
                                last.text += "...";
                                last.width = TextMetric._ctx.measureText(last.text).width;
                            }
                            end = true;
                        }
                        for (let j = 0; j < l.length; j++) {
                            if (j > 0) {
                                currLine = [];
                                this.richLines.push(currLine);
                                x = 0;
                            }
                            var k = l[j];
                            this.maxWidth = Math.max(this.maxWidth, k.width + x);
                            var item = { width: k.width, text: "", x: x, color: color, font: this._font };
                            for (var key in t)
                                item[key] = t[key];
                            item.text = k.text;
                            currLine.push(item);
                            x += k.width;
                        }
                        if (end)
                            break;
                    }
                }
            }
            else {
                var x = 0;
                this.richLines = [[]];
                for (let i = 0; i < richText.length; i++) {
                    var t = richText[i];
                    if (t === 0) {
                        break;
                    }
                    else {
                        TextMetric._ctx.font = t.font;
                        var k = TextMetric.measureLine(TextMetric._ctx, t.text, x, width, false, true)[0];
                        var end = false;
                        if (k.text.length < t.text.length && ellipse) {
                            if (k.text.length > 1)
                                k.text = k.text.substring(0, k.text.length - 1);
                            k.text += "...";
                            k.width = TextMetric._ctx.measureText(k.text).width;
                            end = true;
                        }
                        var item = { width: k.width, text: "", x: x, color: color, font: this._font };
                        for (var key in t)
                            item[key] = t[key];
                        item.text = k.text;
                        this.richLines[0].push(item);
                        x += k.width;
                        if (end)
                            break;
                    }
                }
                let last = this.richLines[0][this.richLines[0].length - 1];
                this.maxWidth = last.x + last.width;
            }
        }
        measureText(text, width, height, format) {
            if (text == null)
                text = "";
            if (typeof text !== "string")
                text = text.toString();
            if (text == "") {
                this.maxWidth = 0;
                this.lines = [];
                return;
            }
            this.lines = [];
            this.maxWidth = width;
            TextMetric._ctx.font = this._font;
            text = text.replace("\r\n", "\n");
            var lines = text.split("\n");
            var wordBreak = (format & ez.TextFormat.WordBreak) != 0;
            var ellipse = !!(format & ez.TextFormat.Ellipse);
            var shrink = !!(format & ez.TextFormat.Shrink);
            var maxLine = Math.max(1, (height / this.lineHeight) | 0);
            if (format & ez.TextFormat.MultiLine) {
                for (var i = 0; i < lines.length; i++) {
                    var l = TextMetric.measureLine(TextMetric._ctx, lines[i], 0, width, wordBreak, false);
                    if (this.lines.length + l.length > maxLine) {
                        this.lines = this.lines.concat(l.slice(0, maxLine - this.lines.length));
                        if (ellipse) {
                            var last = this.lines[this.lines.length - 1];
                            if (last.text.length > 1)
                                last.text = last.text.substring(0, last.text.length - 1);
                            last.text += "...";
                            last.width = TextMetric._ctx.measureText(last.text).width;
                        }
                        break;
                    }
                    this.lines = this.lines.concat(l);
                }
                this.maxWidth = this.lines.reduce((prev, line) => { return Math.max(prev, line.width); }, 0);
            }
            else {
                var k = TextMetric.measureLine(TextMetric._ctx, lines[0], 0, shrink ? 10000 : width, false, true)[0];
                if (k.text.length < lines[0].length && ellipse) {
                    if (k.text.length > 1)
                        k.text = k.text.substring(0, k.text.length - 1);
                    k.text += "...";
                    k.width = TextMetric._ctx.measureText(k.text).width;
                }
                this.lines.push(k);
                this.maxWidth = k.width;
            }
        }
        static getFontHeight(font) {
            var px = /\d+px/.exec(font);
            if (px && px.length > 0)
                return parseInt(px[0].substring(0, px[0].indexOf("px")));
            else
                return 16;
        }
        get font() {
            return this._font;
        }
    }
    TextMetric.EndBreak = {};
    TextMetric.DefaultFont = "24px Arial, Helvetica, sans-serif";
    ez.TextMetric = TextMetric;
    var fonts = {};
    function fontConv(f) {
        var idx = f.indexOf("px ");
        var font = f.substring(idx + 3);
        if (fonts[font])
            return f.substring(0, idx + 3) + fonts[font];
        else
            return f;
    }
    ez.initCall(function () {
        var a = [711, 713, 8758, 9588, 33, 37, 41, 44, 46, 58, 59, 62, 63, 93, 125, 168, 176, 183, 12289, 12290, 12291, 12293, 12297, 12299, 12301, 12303, 12305, 12309, 12311, 12318, 65072, 65073, 65075, 65076, 65078, 65080, 65082, 65084, 65086, 65088, 65090, 65092, 65103, 65104, 65105, 65106, 65108, 65109, 65110, 65111, 65114, 65116, 65118, 65281, 65282, 65285, 65287, 65289, 65292, 65293, 65294, 65306, 65307, 65310, 65311, 65341, 65372, 65373, 65374, 65377, 65379, 65380, 65438, 65439];
        for (var i = 0; i < a.length; i++)
            TextMetric.EndBreak[String.fromCharCode(a[i])] = true;
        var c = ez.internal.createCanvas();
        c.width = 10;
        c.height = 10;
        TextMetric._ctx = c.getContext("2d");
    });
})(ez || (ez = {}));
var ez;
(function (ez) {
    var fontPools;
    function scanFontText() {
        fontPools = {};
    }
    ez.scanFontText = scanFontText;
    function outputFontText() {
        for (var k in fontPools) {
            console.log(k + ": " + fontPools[k]);
        }
    }
    ez.outputFontText = outputFontText;
    function updateFontPool(font, text) {
        if (!DEBUG)
            return;
        font = font.trim();
        font = font.substring(font.indexOf("px") + 2);
        font.trim();
        if (!fontPools[font]) {
            fontPools[font] = "OUT";
        }
        if (fontPools[font].indexOf(text) < 0)
            fontPools[font] = fontPools[font] + text;
    }
    var textCanvas;
    ez.initCall(function () {
        textCanvas = ez.internal.createCanvas();
        textCanvas.width = 240;
        textCanvas.height = 80;
        var ctx = textCanvas.getContext("2d");
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
    });
    function formatStroke(stroke) {
        return stroke ? stroke.color + stroke.width : null;
    }
    function formatGrad(grad) {
        return "" + (grad.x0 || "0") +
            (grad.y0 || "0") +
            (grad.x1 || "0") +
            (grad.y1 || "0") + grad.colors.join();
    }
    const SCALE_FACTOR = 64;
    class LabelSprite extends ez.Sprite {
        constructor(parent, id) {
            super(parent, id);
            this._format = ez.TextFormat.Ellipse;
            this._text = "";
            this._strokeColor = "#000000";
            this._strokeWidth = 0;
            this._lineHeight = 0;
            this._margin = null;
            this._align = ez.AlignMode.Left | ez.AlignMode.Top;
            this._color = "#ffffff";
        }
        getType() {
            return LabelSprite.Type;
        }
        _prepare(bound, transfrom, transChanged) {
            super._prepare(bound, transfrom, transChanged);
            if (!useWGL || this.text == "")
                return;
            var textScale = Math.max(1, (ez.RenderContext.scale * SCALE_FACTOR) | 0);
            var invTScale;
            if (textScale != SCALE_FACTOR)
                invTScale = SCALE_FACTOR / textScale;
            if (this._lastTextScale != textScale) {
                this._lastTextScale = textScale;
                this._caches = null;
            }
            var scaleStr = this._lastTextScale.toString();
            textScale = this._lastTextScale / SCALE_FACTOR;
            var textMetric = this.textMetric;
            var lineHeight = ez.TextMetric.getFontHeight(textMetric.font);
            var padding = this._strokeWidth | 0;
            if (!this._caches) {
                if (!textMetric.maxWidth)
                    return;
                this._caches = [];
                if (padding > 0)
                    padding += 1;
                var w = Math.min(ez.FontCache.Width, textMetric.maxWidth + padding * 2 + 2);
                var h = Math.min(ez.FontCache.Height, 2 + (lineHeight + padding * 2) | 0);
                var iw = (w * textScale + 0.5) | 0;
                var ih = (h * textScale + 0.5) | 0;
                if (textCanvas.width < iw)
                    textCanvas.width = iw;
                if (textCanvas.height < ih)
                    textCanvas.height = ih;
                var ctx = textCanvas.getContext("2d");
                ctx.textAlign = "left";
                ctx.textBaseline = "middle";
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                if (textScale != 1)
                    ctx.scale(textScale, textScale);
                if (DEBUG && fontPools) {
                    updateFontPool(textMetric.font, this.text);
                }
                if (this.format & ez.TextFormat.RichText) {
                    for (let i = 0; i < textMetric.richLines.length; i++) {
                        let line = textMetric.richLines[i];
                        for (let j = 0; j < line.length; j++) {
                            let item = line[j];
                            if (item.width <= 0) {
                                item.cache = null;
                            }
                            else {
                                var c = ez.FontCache.getTextCacheOrKey(item.font, item.color, formatStroke(item.stroke), scaleStr, item.text);
                                if (typeof c === "string") {
                                    let offX = 0;
                                    let offY = ((lineHeight + 1) * 0.5) | 0;
                                    let width = item.width + padding * 2 + 1;
                                    let w1 = width;
                                    let h1 = h;
                                    ctx.font = item.font;
                                    ctx.fillStyle = item.color;
                                    if (item.stroke) {
                                        offX = item.stroke.width;
                                        offY += item.stroke.width;
                                        w1 += item.stroke.width * 2 + 1;
                                        h1 += item.stroke.width * 2 + 1;
                                        ctx.strokeStyle = item.stroke.color;
                                        ctx.lineWidth = item.stroke.width;
                                    }
                                    ctx.clearRect(0, 0, w1 + 1, h1);
                                    if (item.stroke)
                                        ctx.strokeText(item.text, offX, offY + 1, item.width + offX * 2 + 2);
                                    ctx.fillText(item.text, offX, offY + 1, item.width + offX * 2 + 2);
                                    if (textScale != 1) {
                                        var w2 = (w1 * textScale + 0.5) | 0;
                                        var h2 = (h1 * textScale + 0.5) | 0;
                                        var img = ctx.getImageData(0, 0, w2, h2);
                                        var cache = { img: img, w: w2 * invTScale, h: h2 * invTScale, region: null, text: item.text };
                                    }
                                    else {
                                        img = ctx.getImageData(0, 0, w1, h1);
                                        cache = { img: img, w: w1, h: h1, region: null, text: item.text };
                                    }
                                    ez.FontCache.setTextCache(c, cache);
                                    c = cache;
                                }
                                item.cache = c;
                                this._caches.push(c);
                                ez.FontCache.addTextCache(c);
                            }
                        }
                    }
                }
                else {
                    var fill = this._gradient ? formatGrad(this._gradient) : this._color;
                    var stroke = this._strokeWidth > 0 ? this._strokeColor + this._strokeWidth : "";
                    if (this._gradient) {
                        let g = this._gradient;
                        let grad = ctx.createLinearGradient(g.x0 || 0, g.y0 || 0, g.x1 || 0, g.y1 || 0);
                        for (let i = 0; i < g.colors.length; i++)
                            grad.addColorStop(i / (g.colors.length - 1), g.colors[i]);
                        ctx.fillStyle = grad;
                    }
                    else
                        ctx.fillStyle = this._color;
                    ctx.font = textMetric.font;
                    if (this._strokeWidth > 0) {
                        ctx.strokeStyle = this._strokeColor;
                        ctx.lineWidth = this._strokeWidth;
                    }
                    var y = (((lineHeight + 1) * 0.5) | 0) + padding + 1;
                    for (var i = 0; i < textMetric.lines.length; i++) {
                        var l = textMetric.lines[i];
                        if (l.width <= 0) {
                            this._caches.push(null);
                            continue;
                        }
                        var c = ez.FontCache.getTextCacheOrKey(textMetric.font, fill, stroke, scaleStr, l.text);
                        if (typeof c === "string") {
                            ctx.clearRect(0, 0, w + 1, h);
                            if (padding > 0)
                                ctx.strokeText(l.text, padding, y, w + padding * 2 + 2);
                            ctx.fillText(l.text, padding, y, w + padding * 2 + 2);
                            var width = l.width + padding * 2 + 2;
                            if (textScale != 1) {
                                var w1 = (width * textScale + 0.5) | 0;
                                var h1 = (h * textScale + 0.5) | 0;
                                var img = ctx.getImageData(0, 0, w1, h1);
                                var cache = { img: img, w: w1 * invTScale, h: h1 * invTScale, region: null, text: l.text };
                            }
                            else {
                                img = ctx.getImageData(0, 0, width, h);
                                cache = { img: img, w: width, h: h, region: null, text: l.text };
                            }
                            ez.FontCache.setTextCache(c, cache);
                            c = cache;
                        }
                        this._caches.push(c);
                        ez.FontCache.addTextCache(c);
                    }
                }
                ctx = null;
            }
            else {
                for (var i = 0; i < this._caches.length; i++)
                    if (this._caches[i])
                        ez.FontCache.addTextCache(this._caches[i]);
            }
        }
        clearCache() {
            this.setDirty();
            if (this._caches)
                this._caches = null;
        }
        clear() {
            this._textMetric = null;
            this.setDirty();
            if (this._caches)
                this._caches = null;
        }
        dispose() {
            super.dispose();
            this.clear();
        }
        get textMetric() {
            if (!this._textMetric) {
                var w = this.width || 1024;
                var h = this.height || ez.TextMetric.getFontHeight(this.font);
                if (this._margin) {
                    w -= this._margin[0] + this._margin[2];
                    h -= this._margin[1] + this._margin[3];
                }
                this._textMetric = new ez.TextMetric(this.font);
                if (this._format & ez.TextFormat.RichText)
                    this._textMetric.measureRichText(this._text, w, h, this._format, this.color);
                else
                    this._textMetric.measureText(this._text, w, h, this._format);
                if (this._lineHeight)
                    this._textMetric.lineHeight = this._lineHeight;
            }
            return this._textMetric;
        }
        get width() {
            return ezasm.getwidth(this._handle);
        }
        set width(val) {
            ezasm.setwidth(this._handle, val);
            this.clear();
        }
        get height() {
            return ezasm.getheight(this._handle);
        }
        set height(val) {
            ezasm.setheight(this._handle, val);
            this.clear();
        }
        get gradient() {
            return this._gradient;
        }
        set gradient(val) {
            this._gradient = val;
            this.clear();
        }
        get font() {
            return this._font || ez.TextMetric.DefaultFont;
        }
        set font(val) {
            if (val == this._font)
                return;
            this._font = val;
            this.clear();
        }
        get format() {
            return this._format;
        }
        set format(val) {
            if (val == this._format)
                return;
            this._format = val;
            this.clear();
        }
        get text() {
            return this._text;
        }
        set text(val) {
            if (val == null)
                val = "";
            else
                val = val.toString();
            if (val == this._text)
                return;
            this._text = val;
            this.clear();
        }
        get strokeColor() {
            return this._strokeColor;
        }
        set strokeColor(val) {
            if (val == this._strokeColor)
                return;
            this._strokeColor = val;
            this.clearCache();
        }
        get strokeWidth() {
            return this._strokeWidth;
        }
        set strokeWidth(val) {
            val = val || 0;
            if (val == this._strokeWidth)
                return;
            this._strokeWidth = val;
            this.clearCache();
        }
        get color() {
            return this._color;
        }
        set color(val) {
            if (!val)
                val = "#ffffff";
            if (val == this._color)
                return;
            this.setDirty();
            this._color = val;
            this.clearCache();
        }
        get lineHeight() {
            return this._lineHeight;
        }
        set lineHeight(val) {
            if (val == this._lineHeight)
                return;
            this._lineHeight = val;
            if (!this._textMetric)
                return;
            if (val && val > 0)
                this._textMetric.lineHeight = val;
            else
                this._textMetric.lineHeight = ez.TextMetric.getFontHeight(this.font);
            this.setDirty();
        }
        get align() {
            return this._align;
        }
        set align(val) {
            if (val == this._align)
                return;
            this._align = val;
            this.setDirty();
        }
        get margin() {
            return this._margin;
        }
        set margin(val) {
            this._margin = val;
            this.clear();
        }
        get bkColor() {
            return this._bkColor;
        }
        set bkColor(val) {
            if (val == this._bkColor)
                return;
            this._bkColor = val;
            this.setDirty();
        }
        _draw(rc, opacity) {
            opacity *= this.opacity;
            if (opacity < 0.01)
                return;
            if (useWGL)
                this.applyEffect(rc);
            rc.setAlphaBlend(opacity, this.blendMode);
            var transform = ezasm.getglobalTrans(this._handle);
            if (this._bkColor) {
                rc.setFillColor(this._bkColor);
                rc.fillRect(this.width, this.height, transform);
            }
            if (this.text == "")
                return;
            if (!this._caches)
                return;
            var padding = this._strokeWidth | 0;
            var textMetric = this.textMetric;
            var scale = 1;
            if (rc.setZ)
                rc.setZ(this.zIndex);
            ezasm.saveTempStack();
            var w = this.width || textMetric.maxWidth;
            if ((this._format & ez.TextFormat.Shrink) && textMetric.maxWidth > w) {
                scale = w / textMetric.maxWidth;
                w = textMetric.maxWidth;
                var t = ezasm.tempAllocMat2x3(scale, 0, 0, scale, 0, 0);
                ezasm.mat2x3Append(t, transform);
                transform = t;
            }
            var s = textMetric.lineHeight * scale;
            var h = (this.height || s * textMetric.lines.length);
            var x = this._margin ? this._margin[0] : 0;
            var y = this._margin ? this._margin[1] : 0;
            if (this._margin) {
                w -= this._margin[0] + this._margin[2];
                h -= this._margin[1] + this._margin[3];
            }
            if (useWGL) {
                var a = this._align;
                x -= padding;
                y -= padding;
                rc.setFillColor("#ffffff");
                if (this.format & ez.TextFormat.RichText) {
                    if ((a & ez.AlignMode.VCenter) == ez.AlignMode.VCenter)
                        y += (h - (textMetric.richLines.length + 0.4) * s) * 0.5;
                    else if ((a & ez.AlignMode.Bottom) == ez.AlignMode.Bottom)
                        y += h - (textMetric.richLines.length + 0.4) * s;
                    for (let i = 0; i < textMetric.richLines.length; i++) {
                        let line = textMetric.richLines[i];
                        var x0 = x;
                        if (line.length == 0) {
                            y += s;
                            continue;
                        }
                        var last = line[line.length - 1];
                        if ((a & ez.AlignMode.Center) == ez.AlignMode.Center)
                            x0 += (w - last.x - last.width) * 0.5;
                        else if ((a & ez.AlignMode.Right) == ez.AlignMode.Right)
                            x0 += w - last.width - last.x;
                        for (let j = 0; j < line.length; j++) {
                            let item = line[j];
                            let c = item.cache;
                            if (!c)
                                continue;
                            if (item.underline) {
                                var t = ezasm.tempAllocMat2x3(1, 0, 0, 1, x0 + item.x, textMetric.lineHeight + y);
                                ezasm.mat2x3Append(t, transform);
                                rc.setFillColor(item.color);
                                rc.fillRect(item.width, s * 0.0625, t);
                            }
                            if (item.strike) {
                                var t = ezasm.tempAllocMat2x3(1, 0, 0, 1, x0 + item.x, textMetric.lineHeight * 0.5 + y);
                                rc.setFillColor(item.color);
                                ezasm.mat2x3Append(t, transform);
                                rc.fillRect(item.width, s * 0.0625, t);
                            }
                            let offY = item.stroke ? item.stroke.width : 0;
                            rc.drawTextCache(x0 + item.x, y - offY, c, transform);
                        }
                        y += s;
                    }
                }
                else {
                    if ((a & ez.AlignMode.VCenter) == ez.AlignMode.VCenter)
                        y += (h - textMetric.lines.length * s) * 0.5;
                    else if ((a & ez.AlignMode.Bottom) == ez.AlignMode.Bottom)
                        y += h - textMetric.lines.length * s;
                    for (var i = 0; i < this._caches.length; i++) {
                        var c = this._caches[i];
                        if (c) {
                            var x0 = x;
                            if ((a & ez.AlignMode.Center) == ez.AlignMode.Center)
                                x0 += (w - textMetric.lines[i].width) * 0.5;
                            else if ((a & ez.AlignMode.Right) == ez.AlignMode.Right)
                                x0 += w - textMetric.lines[i].width;
                            rc.drawTextCache(x0, y / scale, c, transform);
                        }
                        y += s;
                    }
                }
            }
            else {
                var stroke;
                if (this._strokeWidth > 0 && this._strokeColor)
                    stroke = { width: this._strokeWidth, color: this._strokeColor };
                if (this._gradient)
                    rc.setFillGradient(this._gradient);
                else
                    rc.setFillColor(this._color);
                rc.drawText(this._textMetric, transform, x, y, w, h, this.align, stroke);
            }
            ezasm.restoreTempStack();
        }
    }
    LabelSprite.Type = "Label";
    ez.LabelSprite = LabelSprite;
    ez.Sprite.register(LabelSprite.Type, function (p, id) { return new LabelSprite(p, id); });
})(ez || (ez = {}));
var ez;
(function (ez) {
    class RectFillSprite extends ez.Sprite {
        constructor(stage, id) {
            super(stage, id);
        }
        _draw(rc, opacity) {
            opacity *= this.opacity;
            if (opacity < 0.01)
                return;
            if (useWGL)
                this.applyEffect(rc);
            rc.setAlphaBlend(opacity, this.blendMode);
            if (rc.setZ)
                rc.setZ(this.zIndex);
            if (this._gradient)
                rc.setFillGradient(this._gradient);
            else
                rc.setFillColor(this._color);
            rc.fillRect(this.width, this.height, ezasm.getglobalTrans(this._handle));
        }
        getType() {
            return RectFillSprite.Type;
        }
        get gradient() {
            return this._gradient;
        }
        set gradient(g) {
            this.setDirty();
            if (!g) {
                this._gradient = null;
                return;
            }
            var v = g;
            if (typeof (g) === "string")
                v = ez.parse.GradientFill(g);
            v.x0 = v.x0 || 0;
            v.y0 = v.y0 || 0;
            v.y1 = v.y1 || 0;
            v.x1 = v.x1 || 0;
            this._gradient = v;
        }
    }
    RectFillSprite.Type = "RectFill";
    ez.RectFillSprite = RectFillSprite;
    ez.Sprite.register(RectFillSprite.Type, (p, id) => new RectFillSprite(p, id));
})(ez || (ez = {}));
var ez;
(function (ez) {
    let ResTypeTbl;
    (function (ResTypeTbl) {
        ResTypeTbl[ResTypeTbl["text"] = 1] = "text";
        ResTypeTbl[ResTypeTbl["json"] = 2] = "json";
        ResTypeTbl[ResTypeTbl["csv"] = 3] = "csv";
        ResTypeTbl[ResTypeTbl["image"] = 4] = "image";
        ResTypeTbl[ResTypeTbl["subimage"] = 5] = "subimage";
        ResTypeTbl[ResTypeTbl["binary"] = 6] = "binary";
        ResTypeTbl[ResTypeTbl["sound"] = 7] = "sound";
        ResTypeTbl[ResTypeTbl["gltf"] = 8] = "gltf";
        ResTypeTbl[ResTypeTbl["model"] = 9] = "model";
        ResTypeTbl[ResTypeTbl["empty"] = 10] = "empty";
        ResTypeTbl[ResTypeTbl["texture"] = 11] = "texture";
        ResTypeTbl[ResTypeTbl["spine"] = 12] = "spine";
        ResTypeTbl[ResTypeTbl["ezm"] = 13] = "ezm";
    })(ResTypeTbl || (ResTypeTbl = {}));
    var tbl = "0123456789ABCDEFGHIJKLMNOPQRSTUVWX";
    var resDict = {};
    var extResDict = {};
    function nameHash(s) {
        s = s.toLowerCase();
        var n1 = 0x12345678;
        var n2 = 0x7654321;
        for (var i = 0; i < s.length; i++) {
            var c = s.charCodeAt(i);
            n1 = ((n1 + c) * 1033) & 0x7fffffff;
            n2 = ((n2 + c) * 65789) & 0x7fffffff;
        }
        var out = "";
        for (i = 0; i < 6; i++) {
            out += tbl.charAt(n1 & 31) + tbl.charAt(n2 & 31);
            n1 >>= 5;
            n2 >>= 5;
        }
        return out;
    }
    var ImageExt = ".0";
    var ResGroups = {};
    var LocalResDict;
    let internal;
    (function (internal) {
        function setImageExt(ext) {
            ImageExt = ext;
        }
        internal.setImageExt = setImageExt;
    })(internal = ez.internal || (ez.internal = {}));
    function detectImageExt() {
        return new Promise(function (resolver) {
            var webP = new Image();
            webP.onload = webP.onerror = function () {
                if (webP.height == 2) {
                    Log.info("webp found");
                    ImageExt = ".1";
                    resolver();
                }
                else {
                    var jp2 = new Image();
                    jp2.onload = jp2.onerror = function () {
                        if (jp2.height == 2) {
                            Log.info("jp2 found");
                            ImageExt = ".2";
                            resolver();
                        }
                        else {
                            var jxr = new Image();
                            jxr.onload = jxr.onerror = function () {
                                if (jxr.height == 2) {
                                    Log.info("jxr found");
                                    ImageExt = ".3";
                                }
                                else {
                                    Log.info("png found");
                                    ImageExt = ".0";
                                }
                                resolver();
                            };
                            jxr.src = 'data:image/vnd.ms-photo;base64,SUm8AQgAAAAFAAG8AQAQAAAASgAAAIC8BAABAAAAAQAAAIG8BAABAAAAAgAAAMC8BAABAAAAWgAAAMG8BAABAAAARgAAAAAAAAAkw91vA07+S7GFPXd2jckQV01QSE9UTwAZAMFxAAAAATAAoAAKAACgAAAQgCAIAAAEb/8AAQAAAQDCPwCAAAAAAAAAAAAAAAAAjkI/AIAAAAAAAAABIAA=';
                        }
                    };
                    jp2.src = 'data:image/jp2;base64,/0//UQAyAAAAAAABAAAAAgAAAAAAAAAAAAAABAAAAAQAAAAAAAAAAAAEBwEBBwEBBwEBBwEB/1IADAAAAAEAAAQEAAH/XAAEQED/ZAAlAAFDcmVhdGVkIGJ5IE9wZW5KUEVHIHZlcnNpb24gMi4wLjD/kAAKAAAAAABYAAH/UwAJAQAABAQAAf9dAAUBQED/UwAJAgAABAQAAf9dAAUCQED/UwAJAwAABAQAAf9dAAUDQED/k8+kEAGvz6QQAa/PpBABr994EAk//9k=';
                }
            };
            webP.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoCAAIAAsBMJaQAA3AA/veMAAA=';
        });
    }
    ez.detectImageExt = detectImageExt;
    class HTTP {
        static nextTask() {
            if (HTTP.runningTasks < HTTP.maxLoadingTask && HTTP.pedingTasks.length > 0) {
                HTTP.runningTasks++;
                var task = HTTP.pedingTasks.pop();
                task.do();
            }
        }
        static taskFinish() {
            HTTP.runningTasks--;
            HTTP.nextTask();
        }
        static getData(url, type, onFinish, thisObj) {
            if (PLATFORM == 3) {
                wx.downloadData(url, type == 0, function (file) {
                    if (PROFILING && thisObj && thisObj.event)
                        thisObj.event.addStep("download");
                    HTTP.taskFinish();
                    if (file)
                        onFinish.call(thisObj, true, file);
                    else
                        onFinish.call(thisObj, false, { errCode: -1, errMsg: "download failed" });
                });
            }
            else {
                let req = new XMLHttpRequest();
                req.onreadystatechange = function () {
                    if (req.readyState == 4) {
                        if (PROFILING && thisObj && thisObj.event)
                            thisObj.event.addStep("download");
                        HTTP.taskFinish();
                        var data = type == 0 ? req.responseText : req.response;
                        if (req.status >= 400 || !data) {
                            Log.error(`download ${url} failed. errCode: ${req.status} errMsg: ${req.statusText}`);
                            onFinish.call(thisObj, false);
                        }
                        else {
                            onFinish.call(thisObj, true, data);
                        }
                    }
                };
                req.open("GET", url, true);
                if (type == 1)
                    req.responseType = "arraybuffer";
                req.send();
            }
        }
        static getSound(url, onFinish, thisObj) {
            function onAudioLoaded() {
                removeListeners();
                onFinish.call(thisObj, true, audio);
            }
            function onAudioError() {
                Log.error(`load sound ${url} failed.`);
                removeListeners();
                onFinish.call(thisObj, false);
            }
            function removeListeners() {
                audio.removeEventListener("canplaythrough", onAudioLoaded);
                audio.removeEventListener("error", onAudioError);
                clearTimeout(timer);
                HTTP.taskFinish();
            }
            if (PLATFORM == 3) {
                var c = wx.createInnerAudioContext();
                wx.fetchURL(url, false, function (newURL) {
                    if (!newURL) {
                        HTTP.taskFinish();
                        onFinish.call(thisObj, false);
                    }
                    c.src = newURL;
                    HTTP.taskFinish();
                    c.onCanplay(function () {
                        onFinish.call(thisObj, true, c);
                    });
                    c.onError(function (r) {
                        Log.error(`load sound ${url} failed. error: ${r}`);
                        onFinish.call(thisObj, false);
                    });
                });
            }
            else if (!ez.WebAudio) {
                var audio = document.createElement('audio');
                if (audio.canPlayType("audio/mpeg")) {
                    audio.addEventListener("canplaythrough", onAudioLoaded);
                    audio.addEventListener("error", onAudioError);
                    var src = document.createElement("source");
                    src.src = url;
                    src.type = "audio/mpeg";
                    audio.appendChild(src);
                    var timer = setTimeout(onAudioError, 10000);
                    audio.load();
                }
            }
            else {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.responseType = 'arraybuffer';
                xhr.onload = function (e) {
                    if (PROFILING && thisObj && thisObj.event)
                        thisObj.event.addStep("download");
                    if (xhr.response) {
                        var t = Date.now();
                        Log.debug("begin decode " + url);
                        ez.WebAudio.decodeAudioData(xhr.response, buf => {
                            if (PROFILING && thisObj && thisObj.event)
                                thisObj.event.addStep("mp3 decode");
                            Log.debug(`end decode ${url} cost: + ${Date.now() - t}ms`);
                            onFinish.call(thisObj, true, buf);
                        }, function () {
                            if (PROFILING && thisObj && thisObj.event)
                                thisObj.event.addStep("decode failed");
                            Log.error("decode sound failed.");
                            onFinish.call(thisObj, false);
                        });
                    }
                    else {
                        Log.error(`download ${url} failed. errCode: ${xhr.status} errMsg: ${xhr.statusText}`);
                        onFinish.call(thisObj, false);
                    }
                    HTTP.taskFinish();
                };
                xhr.send();
            }
        }
        static getImage(url, cors, onFinish, thisObj) {
            var img = new Image();
            img.onerror = function (e) {
                HTTP.taskFinish();
                img.onerror = null;
                img.onload = null;
                Log.error(`load image ${url} failed.`);
                onFinish.call(thisObj, false);
            };
            img.onload = function () {
                HTTP.taskFinish();
                img.onerror = null;
                img.onload = null;
                onFinish.call(thisObj, true, img);
            };
            if (PLATFORM == 3) {
                wx.fetchURL(url, cors, function (fileUrl) {
                    if (!fileUrl) {
                        HTTP.taskFinish();
                        onFinish.call(thisObj, false);
                    }
                    else
                        img.src = fileUrl;
                });
            }
            else {
                if (useWGL)
                    img.crossOrigin = "anonymous";
                img.onerror = function (e) {
                    HTTP.taskFinish();
                    img.onerror = null;
                    img.onload = null;
                    Log.error(`load image ${url} failed.`);
                    onFinish.call(thisObj, false);
                };
                img.onload = function () {
                    HTTP.taskFinish();
                    img.onerror = null;
                    img.onload = null;
                    onFinish.call(thisObj, true, img);
                };
                if (useWGL && cors && ez.getProxyUrl)
                    img.src = ez.getProxyUrl(url);
                else
                    img.src = url;
            }
        }
        static downloadAsync(url, type, cors, priority) {
            return new Promise((r, e) => {
                HTTP.download(url, type, cors, priority, (success, data) => {
                    if (success)
                        r(data);
                    else
                        e();
                }, null);
            });
        }
        static download(url, type, cors, priority, onFinish, thisObj) {
            var task;
            if (type == 0 || type == 1) {
                task = {
                    priority: priority,
                    do: function () { HTTP.getData(url, type, onFinish, thisObj); }
                };
            }
            else if (type == 3) {
                task = {
                    priority: priority,
                    do: function () { HTTP.getSound(url, onFinish, thisObj); }
                };
            }
            else if (type == 2) {
                task = {
                    priority: priority,
                    do: function () { HTTP.getImage(url, cors, onFinish, thisObj); }
                };
            }
            var i = 0;
            while (true) {
                if (i >= HTTP.pedingTasks.length || priority > HTTP.pedingTasks[i].priority) {
                    HTTP.pedingTasks.splice(i, 0, task);
                    break;
                }
                i++;
            }
            HTTP.nextTask();
        }
    }
    HTTP.maxLoadingTask = 4;
    HTTP.pedingTasks = [];
    HTTP.runningTasks = 0;
    ez.HTTP = HTTP;
    function TextureFormat2Type(format) {
        switch (format) {
            case 2:
            case 0:
            case 3:
            case 4:
            case 1: return 4;
            case 5: return 5;
            case 8: return 8;
            case 7: return 7;
            case 6: return 6;
            default: return 4;
        }
    }
    function getPixelSize(format) {
        switch (format) {
            case 0: return 4;
            case 1: return 2;
            case 2: return 2;
            case 3: return 1;
            case 4: return 2;
            case 5: return 0.5;
            case 8: return 0.5;
            case 7: return 0.45;
            case 6: return 0.5;
            default: return 1;
        }
    }
    class TextureObject {
        constructor(res) {
            this.id = res.id;
            this.name = res.args.name || res.url;
            this.width = res.args.width;
            this.height = res.args.height;
            this.url = res.url;
            if (res.cors)
                this.cors = true;
            if (res.args.cubemap) {
                this.isCube = true;
                this.cubemap = res.args.cubemap;
            }
            this.maxAge = res.age || 0;
            this.format = res.args.format || 0;
            this.memSize = 0;
            this.res = res;
            if (res.type == 4)
                this.type = 0;
            else if (res.type == 13)
                this.type = 4;
            else if (res.type == 11) {
                var types = res.args.types || [];
                var type = TextureFormat2Type(ez.Texture.compressFormat);
                if (types.indexOf(type) < 0) {
                    if (types.indexOf(4) < 0) {
                        this.type = 0;
                        this.format = 0;
                    }
                    else {
                        this.format = 1;
                        this.type = 4;
                    }
                }
                else {
                    this.format = ez.Texture.compressFormat;
                    this.type = type;
                }
                if (this.type != 0)
                    this.url = this.url + "." + this.type;
            }
            else
                Log.error("not texture resource.");
        }
        setError() {
            this.id = ez.Texture.errorFallback.id;
            this.tex = ez.Texture.errorFallback.tex;
            this.width = ez.Texture.errorFallback.width;
            this.height = ez.Texture.errorFallback.height;
            this.invWidth = ez.Texture.errorFallback.invWidth;
            this.invHeight = ez.Texture.errorFallback.invHeight;
            this.res.state = 4;
        }
        load(onload) {
            if (this.res.state != 1)
                return;
            var event;
            this.res.state = 2;
            function loadcubes() {
                return __awaiter(this, void 0, void 0, function* () {
                    if (PROFILING)
                        event = ez.Profile.newEvent("load cubemap", this.name || this.id);
                    let maps = [];
                    for (let i = 0; i < this.cubemap.length; i++) {
                        var res = getRes(this.cubemap[i]);
                        maps[i] = yield HTTP.downloadAsync(res.url, 2, false, 1);
                        if (PROFILING && event)
                            event.addStep(`download map ${i}`);
                    }
                    this.tex = ez.Texture.createCubeTextureFromImage(maps);
                    this.invWidth = 1 / this.width;
                    this.invHeight = 1 / this.height;
                    this.memSize = this.width * this.height * 4 * 6;
                    if (PROFILING && event) {
                        event.addStep("upload texture");
                        event.end();
                    }
                    onload();
                });
            }
            if (this.type == 0) {
                if (this.cubemap) {
                    loadcubes.call(this);
                    return;
                }
                if (PROFILING)
                    event = ez.Profile.newEvent("load image", this.name || this.id);
                HTTP.download(this.url, 2, this.cors, 1, function (success, img) {
                    if (success) {
                        if (PROFILING && event)
                            event.addStep("download");
                        this.res.state = 3;
                        if (useWGL) {
                            if (this.res.type == 11)
                                this.tex = ez.Texture.createGLTextureFromImage(img, 10497, true);
                            else
                                this.tex = ez.Texture.createGLTextureFromImage(img, 33071, false);
                            this.invWidth = 1 / img.width;
                            this.invHeight = 1 / img.height;
                            if (PROFILING && event)
                                event.addStep("upload texture");
                        }
                        else
                            this.img = img;
                        this.width = img.width;
                        this.height = img.height;
                        this.memSize = img.width * img.height * 4;
                        onload();
                        if (PROFILING && event)
                            event.end();
                    }
                    else {
                        Log.error(`download ${this.url} failed.`);
                        this.setError();
                        if (PROFILING && this.event) {
                            this.event.addStep("failed");
                            this.event.end();
                            this.event = null;
                        }
                    }
                }, this);
            }
            else if (this.type == 4) {
                if (PROFILING)
                    event = ez.Profile.newEvent("load ezm", this.name || this.id);
                internal.ezmDecoder.load(this.url, this.format, this.width * this.height, event, (function (r) {
                    if (r.status) {
                        if (PROFILING && event) {
                            event.addStep("failed: " + r.error);
                            event.end();
                        }
                        Log.error(r.error);
                        this.setError();
                        onload();
                    }
                    else {
                        this.res.state = 3;
                        var pixels = r.data || null;
                        if (pixels && (this.format == 1 || this.format == 2))
                            pixels = new Uint16Array(r.data.buffer, r.data.byteOffset, r.data.byteLength >> 1);
                        this.tex = ez.Texture.createGLTexture(r.width, r.height, this.format, this.res.type == 11 ? 10497 : 33071, 9729, false, this.res.type == 11 && !!pixels, pixels);
                        this.width = r.width;
                        this.height = r.height;
                        this.invWidth = 1 / r.width;
                        this.invHeight = 1 / r.height;
                        this.memSize = r.width * r.height * getPixelSize(this.format);
                        let gl = ez.getGL();
                        if (r.subsets) {
                            for (let i = 0; i < r.subsets.length; i++) {
                                let subImg = r.subsets[i];
                                if (this.format == 0)
                                    gl.texSubImage2D(3553, 0, 0, subImg.top, r.width, subImg.height, 6408, 5121, subImg.data);
                                else if (this.format == 1)
                                    gl.texSubImage2D(3553, 0, 0, subImg.top, r.width, subImg.height, 6407, 33635, new Uint16Array(subImg.data.buffer, subImg.data.byteOffset, subImg.data.byteLength >> 1));
                                else if (this.format == 2)
                                    gl.texSubImage2D(3553, 0, 0, subImg.top, r.width, subImg.height, 6408, 32819, new Uint16Array(subImg.data.buffer, subImg.data.byteOffset, subImg.data.byteLength >> 1));
                                else if (this.format == 3)
                                    gl.texSubImage2D(3553, 0, 0, subImg.top, r.width, subImg.height, 6409, 5121, subImg.data);
                                else if (this.format == 4)
                                    gl.texSubImage2D(3553, 0, 0, subImg.top, r.width, subImg.height, 6410, 5121, subImg.data);
                            }
                        }
                        if (this.res.type == 11)
                            gl.generateMipmap(gl.TEXTURE_2D);
                        if (PROFILING && event) {
                            event.addStep("upload texture");
                            event.end();
                        }
                        onload();
                    }
                }).bind(this));
            }
            else {
                if (PROFILING)
                    event = ez.Profile.newEvent("load compress texture", this.name || this.id);
                HTTP.download(this.url, 1, this.cors, 1, function (success, data) {
                    if (!success) {
                        if (PROFILING && event) {
                            event.addStep("failed");
                            event.end();
                        }
                        this.setError();
                        if (onload)
                            onload();
                        return;
                    }
                    if (PROFILING && event)
                        event.addStep("download");
                    var headData = data.slice(0, data.byteLength & ~3);
                    var head = new Uint16Array(headData, 0);
                    var type = head[0] & 0xff;
                    var isCube = !!(head[0] >> 8);
                    var width = head[1];
                    var height = head[2];
                    var level = head[3] >> 8;
                    var n = head[3] & 0xff;
                    var cubes;
                    var mipmaps;
                    var offset = 8;
                    var i, len;
                    if (type != this.type) {
                        Log.error("texture type mismatch!");
                        this.setError();
                        if (onload)
                            onload();
                        return;
                    }
                    this.width = width;
                    this.height = height;
                    this.invWidth = 1 / width;
                    this.invHeight = 1 / height;
                    if (isCube) {
                        this.isCube = true;
                        cubes = [];
                        for (var j = 0; j < 6; j++) {
                            mipmaps = [];
                            cubes.push(mipmaps);
                            for (i = 0; i < level; i++) {
                                len = new Uint32Array(headData, offset)[0];
                                offset += 4;
                                mipmaps[i] = new Uint8Array(data, offset, len);
                                offset += len;
                            }
                        }
                    }
                    else {
                        mipmaps = [];
                        for (i = 0; i < level; i++) {
                            len = new Uint32Array(headData, offset)[0];
                            offset += 4;
                            mipmaps[i] = new Uint8Array(data, offset, len);
                            offset += len;
                        }
                    }
                    var compFormat = 0;
                    switch (this.format) {
                        case 6:
                            compFormat = ez.Texture.CompressTextureType.pvr4;
                            break;
                        case 5:
                            compFormat = ez.Texture.CompressTextureType.etc1;
                            break;
                        case 7:
                            switch (n) {
                                case 4:
                                    compFormat = ez.Texture.CompressTextureType.astc4x4;
                                    break;
                                case 5:
                                    compFormat = ez.Texture.CompressTextureType.astc5x5;
                                    break;
                                case 6:
                                    compFormat = ez.Texture.CompressTextureType.astc6x6;
                                    break;
                                case 8:
                                    compFormat = ez.Texture.CompressTextureType.astc8x8;
                                    break;
                                default:
                                    Log.error("bpp error");
                                    break;
                            }
                            break;
                        case 8:
                            compFormat = ez.Texture.CompressTextureType.dxt1;
                            break;
                    }
                    this.res.state = 3;
                    if (isCube) {
                        Log.debug(`load cube texture ${this.name} ${this.width}x${this.height}`);
                        this.tex = ez.Texture.createCompressCubeTexture(width, height, compFormat, 9729, cubes);
                    }
                    else {
                        Log.debug(`load texture ${this.name} ${this.width}x${this.height}`);
                        this.tex = ez.Texture.createCompressTexture(width, height, compFormat, 10497, 9729, mipmaps);
                    }
                    this.memSize = offset;
                    if (PROFILING && event) {
                        event.addStep("upload texture");
                        event.end();
                    }
                    if (onload)
                        onload();
                }, this);
            }
        }
        release() {
            if (useWGL) {
                var gl = ez.getGL();
                if (this.tex) {
                    gl.deleteTexture(this.tex);
                    this.tex = null;
                }
            }
            else
                this.img = null;
            this.memSize = 0;
            this.res.state = 1;
        }
    }
    class ExtResItem {
        constructor(url, resType, args) {
            this.state = 1;
            this._callbacks = [];
            this.name = this.id = this.url = url;
            this.type = resType;
            this._dataType = RawTypeMap[ResTypeTbl[this.type]];
            this.args = args || {};
            this.cors = true;
            if (this.isTexture()) {
                this.data = new ez.Texture(new TextureObject(this));
            }
        }
        isTexture() {
            return this.type == 4 || this.type == 13 || this.type == 11;
        }
        toString() {
            return this.url;
        }
        onload(success, data) {
            if (success) {
                this.state = 3;
                this.data = data;
                switch (this.type) {
                    case 3:
                        this.data = ez.parse.CSV(data);
                        this.rawData = data;
                        break;
                    case 2:
                        this.data = JSON.parse(data);
                        this.rawData = data;
                        break;
                }
            }
            else {
                Log.error(`load res ${this.url} failed!`);
                this.data = ResItem.Fallbacks[ResTypeTbl[this.type]];
                this.state = 4;
            }
            let cb = this._callbacks;
            for (let i = 0; i < this._callbacks.length; i++)
                cb[i](success);
            this._callbacks = [];
        }
        getData() {
            if (this.data)
                return this.data;
            return this.data;
        }
        release() {
            if (this.isTexture()) {
                if (this.data)
                    this.data.release();
            }
            this.state = 1;
            this.data = null;
        }
        loadAsync() {
            var ctx = this;
            return new Promise((r, e) => {
                ctx.load(succ => {
                    if (succ)
                        r(ctx.getData());
                    else
                        e();
                });
            });
        }
        load(func, thisObj) {
            if (this.state == 1 || this.state == 2) {
                if (func)
                    this._callbacks.push(thisObj ? func.bind(thisObj) : func);
                if (this.state == 1) {
                    if (this.isTexture())
                        this.data.load();
                    else {
                        this.state = 2;
                        HTTP.download(this.url, this._dataType, true, 10, this.onload, this);
                    }
                }
            }
            else if (func)
                func.call(thisObj, this.state == 3);
        }
    }
    var RawTypeMap = {
        image: 2,
        binary: 1,
        text: 0,
        json: 0,
        csv: 0,
        sound: 3,
        gltf: 0,
        model: 1,
        spine: 1,
        texture: 1
    };
    class ResItem {
        constructor(id, args) {
            this._state = 1;
            this._callbacks = [];
            this.id = id;
            this.name = args.name || id;
            this.url = args.url;
            this.type = args.type;
            this.args = args;
            this._dataType = RawTypeMap[ResTypeTbl[this.type]];
            this.width = args.width;
            this.height = args.height;
            if (this.type == 10) {
                this.state = 3;
                this.data = new ez.Texture({ id: this.id, name: args.name, width: args.width, height: args.height, memSize: 0 }, args.width, args.height);
                this.data.empty = true;
            }
        }
        createImg() {
            var args = this.args;
            var t = new ez.Texture(new TextureObject(this), args.width, args.height);
            if (args.margin)
                t.margin = typeof (args.margin) === "string" ? ez.parse.Number4(args.margin) : args.margin;
            if (args.s9)
                t.s9 = typeof (args.s9) === "string" ? ez.parse.Number4(args.s9) : args.s9;
            this.data = t;
        }
        createTex() {
            var args = this.args;
            this.data = new ez.Texture(new TextureObject(this), args.width, args.height);
        }
        createSub() {
            var args = this.args;
            var parentTex = this.parentImage.getData();
            var r = ez.parse.Number4(args.region);
            var tex = parentTex.createSubTexture(new ez.Rect(r[0], r[1], r[2], r[3]), args.width, args.height);
            if (args.margin)
                tex.margin = typeof (args.margin) === "string" ? ez.parse.Number4(args.margin) : args.margin;
            if (args.s9)
                tex.s9 = typeof (args.s9) === "string" ? ez.parse.Number4(args.s9) : args.s9;
            if (args.transpose)
                tex.transpose = true;
            this.data = tex;
        }
        init() {
            if (this.type == 5) {
                var args = this.args;
                if (!args.region)
                    Log.error(`the res ${this.name} has no region argument!`);
                this.parentImage = resDict[args.parent];
                if (!this.parentImage)
                    Log.error(`the parent ${this.args.parentName} is not exist!`);
            }
        }
        toString() {
            return this.name;
        }
        set state(v) {
            this._state = v;
            if (v == 3 || v == 4) {
                let success = v == 3;
                let cb = this._callbacks;
                for (let i = 0; i < this._callbacks.length; i++)
                    cb[i](success);
                this._callbacks = [];
            }
        }
        get state() {
            if (this.type == 5)
                return this.parentImage.state;
            return this._state;
        }
        onload(success, data) {
            if (success) {
                this.data = data;
                switch (this.type) {
                    case 3:
                        this.rawData = data;
                        this.data = ez.parse.CSV(data);
                        break;
                    case 2:
                        this.rawData = data;
                        this.data = JSON.parse(data);
                        break;
                }
                if (PROFILING && this.event) {
                    this.event.end();
                    this.event = null;
                }
                this.state = 3;
            }
            else {
                Log.error(`load res ${this.url} failed!`);
                this.data = ResItem.Fallbacks[ResTypeTbl[this.type]];
                this.state = 4;
                if (PROFILING && this.event) {
                    this.event.addStep("failed");
                    this.event.end();
                    this.event = null;
                }
            }
        }
        getData() {
            if (this.data)
                return this.data;
            if (this.type == 4 || this.type == 13)
                this.createImg();
            else if (this.type == 11)
                this.createTex();
            else if (this.type == 5)
                this.createSub();
            return this.data;
        }
        release() {
            if (this.type == 11 || this.type == 13 || this.type == 4) {
                this.data.release();
                this.state = 1;
            }
            else if (this.type == 5 || this.type == 10)
                return;
            else {
                this.state = 1;
                if (this.rawData)
                    this.rawData = null;
                this.data = null;
                this._callbacks = [];
            }
        }
        loadAsync() {
            var ctx = this;
            return new Promise((r, e) => {
                ctx.load(succ => {
                    if (succ)
                        r(ctx.getData());
                    else
                        e();
                });
            });
        }
        load(func, thisObj, priority) {
            if (func) {
                if (this.type != 5 && (this.state == 1 || this.state == 2))
                    this._callbacks.push(thisObj ? func.bind(thisObj) : func);
                else
                    func.call(thisObj, this.state == 3);
            }
            if (this.state == 1) {
                if (this.type == 4 || this.type == 13 || this.type == 11) {
                    this.getData().load();
                }
                else if (this.type == 5) {
                    this.parentImage.load(func, thisObj, priority);
                }
                else {
                    this.state = 2;
                    if (this.type == 8) {
                        if (PROFILING)
                            this.event = ez.Profile.newEvent("load gltf", this.name || this.id);
                        HTTP.download(this.url, 0, false, priority || 7, function (succ, data) {
                            if (succ) {
                                this.data = JSON.parse(data);
                                this.rawData = data;
                                var res = getRes(this.args.bin);
                                if (!res) {
                                    Log.error(`bin not exist`);
                                    this.onload(false, null);
                                }
                                else {
                                    HTTP.download(res.url, 1, false, priority || 7, function (succ, data) {
                                        if (succ)
                                            this.bin = data;
                                        this.onload(succ, this.data);
                                    }, this);
                                }
                            }
                            else {
                                this.onload(succ, data);
                            }
                        }, this);
                    }
                    else {
                        if (PROFILING)
                            this.event = ez.Profile.newEvent("load res", this.name || this.id);
                        HTTP.download(this.url, this._dataType, false, priority || 9, this.onload, this);
                    }
                }
            }
        }
    }
    ResItem.Fallbacks = {
        image: null,
        binary: new ArrayBuffer(0),
        text: "",
        json: {},
        sound: null
    };
    function loadPackage(data, resRoot) {
        var length = data.resources.length;
        for (var i = 0; i < length; i++) {
            var item = data.resources[i];
            var id = nameHash(item.name);
            if (resDict[id] != null) {
                Log.warn("id duplicated: " + resDict[id].name);
            }
            if (item.url !== undefined) {
                if (LocalResDict && LocalResDict[item.url]) {
                    Log.debug("set local url: " + LocalResDict[item.url]);
                    item.url = LocalResDict[item.url];
                }
                else
                    item.url = resRoot + item.url;
            }
            item.type = ResTypeTbl[item.type];
            resDict[id] = new ResItem(id, item);
            if (item.parent) {
                resDict[id].args.parentName = item.parent;
                resDict[id].args.parent = nameHash(item.parent);
            }
        }
        for (let k in resDict)
            resDict[k].init();
        function addGroup(name) {
            let idx = name.lastIndexOf("/");
            if (idx < 0)
                return;
            let path = name.substring(0, idx);
            if (!ResGroups[path])
                ResGroups[path] = [];
            ResGroups[path].push(name);
        }
        let groups = data.groups;
        length = groups.length;
        for (let h = 0; h < length; h++) {
            let name = groups[h].name;
            if (!ResGroups[name])
                ResGroups[name] = [];
            addGroup(name);
        }
        for (let h = 0; h < length; h++) {
            let g = groups[h];
            if (g.keys == "")
                continue;
            let group = ResGroups[g.name];
            let path = g.name + "/";
            let keys = g.keys.split(',');
            for (let j = 0; j < keys.length; j++)
                group.push(nameHash(path + keys[j]));
        }
    }
    ez.loadPackage = loadPackage;
    function loadJSONPackage(pkgUrl, root, onComplete, thisObj) {
        HTTP.download(pkgUrl, 0, false, 20, (success, data) => {
            if (!success) {
                Log.error("load res pack failed.");
                onComplete.call(thisObj, false);
                return;
            }
            loadPackage(JSON.parse(data), root);
            onComplete.call(thisObj, true);
        }, null);
    }
    ez.loadJSONPackage = loadJSONPackage;
    function loadJSONPackageAsync(pkgUrl, root) {
        return new Promise((r, e) => {
            HTTP.download(pkgUrl, 0, false, 20, (success, data) => {
                if (success) {
                    loadPackage(JSON.parse(data), root);
                    r();
                }
                else
                    e();
            }, null);
        });
    }
    ez.loadJSONPackageAsync = loadJSONPackageAsync;
    function setLocalResList(root, resList) {
        LocalResDict = {};
        for (var k in resList) {
            var n = resList[k];
            LocalResDict[n] = root + n;
        }
    }
    ez.setLocalResList = setLocalResList;
    function loadResPackage(resPak, root, groups) {
        var typeTbl = {
            i: 4,
            w: 13,
            x: 11,
            p: 5,
            P: 5,
            s: 7,
            t: 1,
            j: 2,
            c: 3,
            b: 6,
            e: 10,
            g: 8,
            m: 9,
            n: 12
        };
        var numTbl = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef";
        function parseNum(s) {
            var n = 0;
            for (var i = 0; i < s.length; i++) {
                n <<= 5;
                n += numTbl.indexOf(s[i]);
            }
            return n;
        }
        function parseNumbers(s) {
            return s.split(",").map(v => parseNum(v));
        }
        function getUrl(name) {
            return LocalResDict && LocalResDict[name] ? LocalResDict[name] : root + name;
        }
        function parseItem(data) {
            var item = {};
            var args = data.split("|");
            if (args.length < 3)
                return;
            var type = typeTbl[args[1]];
            var transpose = args[1] == "P";
            var id = args[0];
            item.type = type;
            if (type == 5) {
                item.parent = args[2];
                item.region = parseNumbers(args[3]);
                item.width = args[4] ? parseNum(args[4]) : item.region[2];
                item.height = args[5] ? parseNum(args[5]) : item.region[3];
                if (args[6])
                    item.s9 = parseNumbers(args[6]);
                if (args[7])
                    item.margin = parseNumbers(args[7]);
                if (args[7])
                    item.format = parseNum(args[7]);
                if (args[8])
                    item.hitMask = args[8];
                if (transpose)
                    item.transpose = true;
            }
            else if (type == 8) {
                item.url = getUrl(args[2]);
                item.bin = "R:" + args[3];
            }
            else if (type == 12) {
                item.url = getUrl(args[2]);
                item.atlas = "R:" + args[3];
            }
            else {
                if (type == 4 || type == 13) {
                    item.url = getUrl(args[2]);
                    if (type == 4)
                        item.url += ImageExt;
                    item.width = parseNum(args[3]);
                    item.height = parseNum(args[4]);
                    if (args[5])
                        item.s9 = parseNumbers(args[5]);
                    if (args[6])
                        item.margin = parseNumbers(args[6]);
                    if (args[7])
                        item.format = parseNum(args[7]);
                    if (args[8])
                        item.hitMask = args[8];
                }
                else if (type == 11) {
                    item.url = getUrl(args[2]);
                    item.width = parseNum(args[3]);
                    item.height = parseNum(args[4]);
                    item.types = parseNumbers(args[5]);
                }
                else if (type == 10) {
                    item.width = parseNum(args[2]);
                    item.height = parseNum(args[3]);
                }
                else
                    item.url = getUrl(args[2]);
            }
            resDict[id] = new ResItem(id, item);
        }
        let items = resPak.split(";");
        for (let i = 0; i < items.length; i++)
            parseItem(items[i]);
        for (let j in resDict)
            resDict[j].init();
        function addGroup(name) {
            let idx = name.lastIndexOf("/");
            if (idx < 0)
                return;
            let path = name.substring(0, idx);
            if (!ResGroups[path])
                ResGroups[path] = [];
            ResGroups[path].push(name);
        }
        for (let k in groups) {
            if (!ResGroups[k])
                ResGroups[k] = [];
            addGroup(k);
            ResGroups[k].concat(groups[k].split(','));
        }
    }
    ez.loadResPackage = loadResPackage;
    function addGroup(grpName, resources) {
        var keys = [];
        for (var j = 0; j < resources.length; j++)
            keys[j] = nameHash(resources[j]);
        ResGroups[grpName] = keys;
    }
    ez.addGroup = addGroup;
    function getId(name) {
        if (!name)
            return "";
        if (name.length == 14 && name.indexOf("R:") == 0)
            return name.substr(2);
        else
            return nameHash(name);
    }
    function hasRes(name) {
        return !!resDict[getId(name)];
    }
    ez.hasRes = hasRes;
    function getExternalRes(url, resType, args) {
        if (extResDict[url])
            return extResDict[url];
        else {
            extResDict[url] = new ExtResItem(url, resType, args);
            return extResDict[url];
        }
    }
    ez.getExternalRes = getExternalRes;
    function getRes(name, type) {
        if (!name)
            return null;
        if (name.indexOf("ext:") == 0)
            return getExternalRes(name.substring(4), type || 4);
        if (name.indexOf("http:") == 0)
            return getExternalRes(name, type || 4);
        if (name.indexOf("https:") == 0)
            return getExternalRes(name, type || 4);
        var id = getId(name);
        if (DEBUG) {
            if (resDict[id] == null)
                Log.error(`the res ${name} is not exist!`);
        }
        return resDict[id];
    }
    ez.getRes = getRes;
    function allRes() {
        var r = [];
        for (var k in resDict)
            r.push(resDict[k]);
        return r;
    }
    ez.allRes = allRes;
    function groupForEach(group, func) {
        function f(grp) {
            if (!ResGroups[grp])
                return;
            let g = ResGroups[grp];
            for (let i = 0; i < g.length; i++) {
                let t = g[i];
                if (ResGroups[t])
                    f(f);
                else
                    func(resDict[g[i]]);
            }
        }
        if (Array.isArray(group))
            for (var i = 0; i < group.length; i++)
                f(group[i]);
        else
            f(group);
    }
    ez.groupForEach = groupForEach;
    function addGroupToKeys(keys, resOrGroup) {
        var group = ResGroups[resOrGroup];
        if (group) {
            for (let i = 0; i < group.length; i++)
                addGroupToKeys(keys, group[i]);
        }
        else {
            if (!resDict[resOrGroup]) {
                var id = nameHash(resOrGroup);
                if (resDict[id])
                    keys.push(id);
            }
            else
                keys.push(resOrGroup);
        }
    }
    function loadGroup(resOrGroups, onProgress, thisObj) {
        var keys = [];
        if (Array.isArray(resOrGroups)) {
            for (var i = 0; i < resOrGroups.length; i++)
                addGroupToKeys(keys, resOrGroups[i]);
        }
        else
            addGroupToKeys(keys, resOrGroups);
        var total = 0;
        var progress = 0;
        var resolve = null;
        function onLoad() {
            Log.debug(`${this.name} loaded`);
            if (onProgress)
                onProgress.call(thisObj, ++progress, total);
            if (progress >= total && resolve)
                resolve();
        }
        for (var k in keys) {
            var res = resDict[keys[k]];
            if (res && (res.state == 1 || res.state == 2)) {
                total++;
                res.load(onLoad, res, 1);
            }
        }
        if (onProgress)
            onProgress.call(thisObj, progress, total);
        return new Promise((r, e) => {
            resolve = r;
        });
    }
    ez.loadGroup = loadGroup;
})(ez || (ez = {}));
var ez;
(function (ez) {
    class SeqFrameSprite extends ez.Sprite {
        constructor(stage, name) {
            super(stage, name);
            this._interval = 0;
            this._index = 0;
            this._pos = 0;
            this._state = 0;
            this._speedInv = 1;
            this.color = "#ffffff";
            this._interval = 33;
        }
        static toFrames(data) {
            if (DEBUG) {
                if (!data.prefix || (!data.frames && (typeof data.from !== "number" || typeof data.count !== "number"))) {
                    Log.error("invalid sequence frames format.");
                    return;
                }
            }
            let a = [];
            function padding(i, n) {
                var s = i.toString();
                return "0".repeat(n - s.length) + s;
            }
            if (data.frames) {
                let frames = data.frames.split(',');
                for (let i = 0; i < frames.length; i++)
                    a.push(data.prefix + frames[i]);
            }
            else {
                let from = data.from;
                if (typeof from == "string") {
                    let n = from.length;
                    let f = parseInt(from);
                    for (let i = f, to = f + data.count; i < to; i++)
                        a.push(data.prefix + padding(i, n));
                }
                else {
                    for (let i = from, to = from + data.count; i < to; i++)
                        a.push(data.prefix + i);
                }
            }
            return a;
        }
        getType() {
            return SeqFrameSprite.Type;
        }
        static _update(dt) {
            var arr = SeqFrameSprite.playings.concat();
            for (var i = 0; i < arr.length; i++) {
                try {
                    arr[i]._update(dt);
                }
                catch (e) {
                    Log.error("seqframe update exception: " + e.message + "\ncall stack: " + e.stack);
                }
            }
            if (SeqFrameSprite.playings.length == 0) {
                ez.removeTicker(SeqFrameSprite.playTicker);
                SeqFrameSprite.playTicker = undefined;
            }
        }
        get currInterval() {
            if (this._frameTimes && this._frameTimes[this._index])
                return this._frameTimes[this._index] * this._speedInv;
            return this._interval * this._speedInv;
        }
        _draw(rc, opacity) {
            if (!this._frames)
                return;
            var f = this._frames[this._index];
            if (!f || f.empty)
                return;
            if (!f.ready) {
                f.load();
                return;
            }
            rc.setFillColor(this.color);
            opacity *= this.opacity;
            if (opacity < 0.01)
                return;
            if (useWGL)
                this.applyEffect(rc);
            rc.setAlphaBlend(opacity, this.blendMode);
            rc.drawImage(f, ezasm.getglobalTrans(this._handle), this.width, this.height, f.subRect);
        }
        _update(dt) {
            if (this._state != 1)
                return;
            if (!this._frames)
                return;
            this._pos += dt;
            while (this._pos > this.currInterval) {
                this._pos -= this.currInterval;
                this._index++;
                this.setDirty();
                if (this._index >= this._frames.length) {
                    if (this.loop)
                        this._index = 0;
                    else {
                        this._index = this._frames.length - 1;
                        this.stop();
                        return;
                    }
                }
            }
        }
        _dispose() {
            this.onStop = undefined;
            this._frames = undefined;
            if (this._state == 1) {
                this._state = 0;
                var p = SeqFrameSprite.playings;
                var idx = p.indexOf(this);
                if (idx != -1)
                    p.splice(idx, 1);
            }
            super._dispose();
        }
        _setWidth(val) {
            var h = this._handle;
            if (!h)
                return;
            if (ezasm.setwidth(h, val))
                this.setDirty();
        }
        _setHeight(val) {
            var h = this._handle;
            if (!h)
                return;
            if (ezasm.setheight(h, val))
                this.setDirty();
        }
        get width() {
            return ezasm.getwidth(this._handle);
        }
        set width(val) {
            this._setWidth(val);
            this._width = val;
        }
        get height() {
            return ezasm.getheight(this._handle);
        }
        set height(val) {
            this._setHeight(val);
            this._height = val;
        }
        get frames() {
            return this._frames;
        }
        set frames(vals) {
            this.stop();
            if (!vals)
                this._frames = undefined;
            if (!Array.isArray(vals)) {
                var data = vals;
                vals = SeqFrameSprite.toFrames(data);
                if (data.fps)
                    this.fps = data.fps;
                if (data.loop)
                    this.loop = data.loop;
            }
            this.loadFrames(vals);
        }
        loadFrames(frames) {
            var arr = [];
            var setSize = function (d) {
                if (this._width === undefined)
                    this._setWidth(r.width);
                if (this._height === undefined)
                    this._setHeight(r.height);
            }.bind(this);
            for (var i = 0; i < frames.length; i++) {
                if (!frames[i]) {
                    arr[i] = null;
                    continue;
                }
                if (typeof (frames[i]) === "string") {
                    var r = ez.getRes(frames[i]).getData();
                    if (setSize) {
                        setSize(r);
                        setSize = null;
                    }
                    arr[i] = r;
                    if (!r.ready)
                        r.load();
                }
                else {
                    arr[i] = frames[i];
                    if (setSize) {
                        setSize(r);
                        setSize = null;
                    }
                }
            }
            this._frames = arr;
            if (this._autoPlay)
                this.play();
        }
        get autoPlay() {
            return this._autoPlay;
        }
        set autoPlay(v) {
            this._autoPlay = v;
            if (v && this._frames && this.state == 0)
                this.play();
        }
        get frameIndex() {
            return this._index;
        }
        set position(val) {
            if (this._pos == val)
                return;
            this._pos = val;
            this.setDirty();
        }
        get position() {
            return this._pos;
        }
        get length() {
            var t = 0;
            for (var i = 0; i < this._frames.length; i++) {
                if (this._frameTimes && this._frameTimes[i])
                    t += this._frameTimes[i];
                else
                    t += this._interval;
            }
            return t * this._speedInv;
        }
        set fps(val) {
            this._interval = 1000 / val;
        }
        get fps() {
            return 1000 / this._interval;
        }
        get state() {
            return this._state;
        }
        play() {
            if (this._state == 1)
                return;
            var s = SeqFrameSprite;
            if (this._state == 0) {
                this._pos = 0;
                this._index = 0;
                s.playings.push(this);
            }
            this._state = 1;
            if (!s.playTicker)
                s.playTicker = ez.addTicker(s._update);
        }
        pause() {
            if (this._state != 1)
                return;
            this._state = 2;
        }
        stop() {
            if (this._state == 0)
                return;
            this._state = 0;
            var p = SeqFrameSprite.playings;
            var idx = p.indexOf(this);
            if (idx != -1)
                p.splice(idx, 1);
            if (this.onStop)
                this.onStop();
            if (this.autoRemove)
                this.dispose();
        }
        set speed(v) {
            this._speedInv = 1 / v;
        }
        setFrameDuration(i, time) {
            this._frameTimes = this._frameTimes || [];
            this._frameTimes[i] = time;
        }
        set framesDuration(frames) {
            this._frameTimes = frames;
        }
    }
    SeqFrameSprite.playTicker = null;
    SeqFrameSprite.playings = [];
    SeqFrameSprite.Type = "SeqFrame";
    ez.SeqFrameSprite = SeqFrameSprite;
    ez.Sprite.register(SeqFrameSprite.Type, (p, id) => new SeqFrameSprite(p, id));
})(ez || (ez = {}));
var ez;
(function (ez) {
    function makeIdentMat2D() {
        return ezasm.tempAllocMat2x3(1, 0, 0, 1, 0, 0);
    }
    var batchQueue;
    function batchCommit() {
        function isEqual(s1, s2) {
            return s1.blendMode === s2.blendMode && s1.gradient === s2.gradient && s1.texture === s2.texture && s1.shader === s2.shader && !s1.params && !s2.params;
        }
        if (batchQueue.length == 0)
            return;
        insertSort(batchQueue, cmpZIndex);
        var idx = 0;
        while (idx < batchQueue.length) {
            for (var i = idx + 1; i < batchQueue.length; i++) {
                if (batchQueue[idx].zIndex < batchQueue[i].zIndex)
                    break;
                if (isEqual(batchQueue[idx], batchQueue[i])) {
                    var t = batchQueue[i];
                    for (var j = i; j > idx; j--)
                        batchQueue[j] = batchQueue[j - 1];
                    batchQueue[++idx] = t;
                }
            }
            idx++;
        }
        idx = 0;
        var rs = batchQueue[idx];
        if (rs.color) {
            ez.RenderContext.setFillColor(rs.color);
        }
        ez.RenderContext.setAlphaBlend(rs.alpha, rs.blendMode);
        if (rs.gradient)
            ez.RenderContext.setFillGradient(rs.gradient);
        ez.RenderContext.setShader(rs.shader, rs.params);
        rs.commit();
        for (i = 1; i < batchQueue.length; i++) {
            var rs2 = batchQueue[i];
            if (rs.alpha != rs2.alpha || rs.blendMode != rs2.blendMode)
                ez.RenderContext.setAlphaBlend(rs2.alpha, rs2.blendMode);
            if (rs2.gradient)
                ez.RenderContext.setFillGradient(rs2.gradient);
            else if (rs.color != rs2.color) {
                ez.RenderContext.setFillColor(rs2.color);
            }
            if (rs.shader !== rs2.shader)
                ez.RenderContext.setShader(rs2.shader, rs2.params);
            rs2.commit();
            rs = rs2;
        }
    }
    var BatchRC = {
        color: "",
        gradent: null,
        shader: null,
        alpha: 0,
        blendMode: ez.BlendMode.Normal,
        zIndex: 0,
        toRS: function () {
            return {
                zIndex: this.zIndex,
                color: this.color,
                gradent: this.gradent,
                shader: this.shader,
                alpha: this.alpha,
                blendMode: this.blendMode
            };
        },
        setZ: function (zIndex) {
            this.zIndex = zIndex;
        },
        fillRect: function (width, height, transform) {
            var rs = this.toRS();
            rs.commit = function () {
                ez.RenderContext.fillRect(width, height, transform);
            };
            batchQueue.push(rs);
        },
        drawImage: function (texture, transform, width, height, srcRect) {
            var rs = this.toRS();
            rs.texture = texture.id;
            rs.commit = function () {
                ez.RenderContext.drawImage(texture, transform, width, height, srcRect);
            };
            batchQueue.push(rs);
        },
        drawImageRepeat: function (texture, transform, width, height, repeat) {
            var rs = this.toRS();
            rs.texture = texture.id;
            rs.commit = function () {
                ez.RenderContext.drawImageRepeat(texture, transform, width, height, repeat);
            };
            batchQueue.push(rs);
        },
        drawImageS9: function (texture, transform, s9, width, height, srcRect) {
            var rs = this.toRS();
            rs.texture = texture.id;
            rs.commit = function () {
                ez.RenderContext.drawImageS9(texture, transform, s9, width, height, srcRect);
            };
            batchQueue.push(rs);
        },
        setAlphaBlend: function (value, blendMode) {
            this.alpha = value;
            this.blendMode = blendMode;
        },
        setFillColor: function (color) {
            this.color = color;
            this.gradient = null;
        },
        setFillGradient: function (gradient) {
            this.gradient = gradient;
        },
        setShader: function (shader, params) {
            this.shader = shader;
            this.params = params;
        },
        drawText: function (content, transform, x, y, width, height, align, stroke) {
            var rs = this.toRS();
            rs.texture = "_font";
            rs.commit = function () {
                ez.RenderContext.drawText(content, transform, x, y, width, height, align, stroke);
            };
            batchQueue.push(rs);
        },
        drawTextCache: function (x, y, cache, transform) {
            var rs = this.toRS();
            rs.texture = "_font";
            rs.commit = function () {
                ez.RenderContext.drawTextCache(x, y, cache, transform);
            };
            batchQueue.push(rs);
        },
        bindTexture: function (tex, idx) {
            throw new Error("unsupport bindTexture in bacth mode");
        },
    };
    function upperBound(arr, start, end, val, cmp) {
        var n = end - start;
        while (n > 0) {
            var mid = n >> 1;
            if (cmp(arr[start + mid], val) <= 0) {
                start += mid + 1;
                n -= mid + 1;
            }
            else
                n = mid;
        }
        return start;
    }
    function cmpZIndex(t1, t2) {
        t1 = t1.zIndex;
        t2 = t2.zIndex;
        return t1 > t2 ? 1 : (t1 == t2 ? 0 : -1);
    }
    function insertSort(arr, cmp) {
        var tmp = [];
        var sorted = arr.length;
        for (var i = 0; i < arr.length - 1; i++) {
            if (cmp(arr[i + 1], arr[i]) < 0) {
                sorted = i + 1;
                break;
            }
        }
        while (sorted < arr.length) {
            var index = 0;
            tmp[index++] = arr[sorted];
            for (i = sorted; i < arr.length - 1; i++) {
                if (cmp(arr[i + 1], arr[i]) != 0)
                    break;
                tmp[index++] = arr[i + 1];
            }
            var insert = upperBound(arr, 0, sorted, tmp[0], cmp);
            for (i = sorted - 1; i >= insert; i--)
                arr[i + index] = arr[i];
            for (i = 0; i < index; i++)
                arr[insert + i] = tmp[i];
            sorted += index;
            while (sorted < arr.length) {
                if (cmp(arr[sorted], arr[sorted - 1]) < 0)
                    break;
                ++sorted;
            }
        }
    }
    class SubStageSprite extends ez.Sprite {
        constructor(parent, id) {
            super(parent, id);
            this._namedItems = {};
            this._items = [];
            this._isDirty = true;
            this._needSort = true;
            this._bound = null;
        }
        _dispose() {
            super._dispose();
            this.clear();
            this.destroyBuffer();
        }
        setDirty(needSort = false) {
            if (!this._parent)
                return;
            this._isDirty = true;
            if (this.visible) {
                this._parent.makeDirty(needSort);
                if (this.ownerBuffer)
                    this._parent.needPreRender(this);
            }
        }
        getType() { return SubStageSprite.Type; }
        preRender(profile) {
            if (this.disposed || !this.ownerBuffer || this.width <= 0 || this.height <= 0)
                return;
            if (!this._rtBuffer)
                this._rtBuffer = ez.RenderTexture.create(this.width, this.height);
            ez.RenderContext._textScale = 1;
            ezasm.setGlobalTransform(ezasm.getglobalTrans(this._handle));
            ez.RenderContext.beginRender(this._rtBuffer, profile);
            var rc = ez.RenderContext;
            if (this.batchMode) {
                rc = BatchRC;
                batchQueue = [];
            }
            this._render(rc, 1);
            if (this.batchMode) {
                batchCommit();
                batchQueue = null;
            }
            ez.RenderContext.endRender();
            ezasm.setGlobalTransform(0);
        }
        _prepare(bound, transfrom, transChanged) {
            var handle = this._handle;
            var noChange = true;
            this._buildTransform();
            if (transChanged || !ezasm.getglobalTrans(handle)) {
                transChanged = true;
                ezasm.buildGlobalTrans(handle, transfrom);
                if (this.width > 0) {
                    var b = ezasm.handleToFloatArray(ezasm.calcBound(handle), 4);
                    this._bound = new ez.Rect(b[0], b[1], b[2] - b[0], b[3] - b[1]);
                }
                else
                    this._bound = bound;
                if (this._cachedCommands)
                    this._cachedCommands = null;
                noChange = false;
            }
            if (this._isDirty) {
                noChange = false;
                if (this._cachedCommands)
                    this._cachedCommands = null;
            }
            if (this.drawCache)
                this._noChange = noChange;
            this.culled = this._parent.culling && this.width > 0 && (this._bound.left >= bound.right || this._bound.right <= bound.left || this._bound.top >= bound.bottom || this._bound.bottom <= bound.top);
            if (!this.culled)
                this._prepareRender(this.clip ? ez.Rect.intersect(this._bound, bound) : bound, ezasm.getglobalTrans(handle), transChanged);
        }
        _draw(rc, opacity) {
            opacity *= this.opacity;
            if (opacity < 0.01)
                return;
            if (this._rtBuffer) {
                if (useWGL)
                    this.applyEffect(rc);
                rc.setAlphaBlend(opacity, this.blendMode);
                rc.setFillColor(this.color);
                ezasm.saveTempStack();
                var m;
                if (useWGL) {
                    m = ezasm.tempAllocMat2x3(1, 0, 0, -1, 0, this.height);
                    ezasm.mat2x3Append(m, ezasm.getglobalTrans(this._handle));
                }
                else
                    m = ezasm.getglobalTrans(this._handle);
                rc.drawImage(this._rtBuffer, m, this.width, this.height);
                ezasm.restoreTempStack();
            }
            else if (!this.ownerBuffer) {
                if (this._cachedCommands) {
                    if (this._cachedCommands.fontRev != ez.FontCache.rev)
                        this._cachedCommands = null;
                    else {
                        ez.RenderContext.replay(this._cachedCommands);
                        return;
                    }
                }
                var drawCache = useWGL && this.drawCache && rc == ez.RenderContext && this._noChange;
                if (drawCache)
                    drawCache = rc.beginRecorder();
                var render = true;
                if (this.clip)
                    render = rc.pushClipRect(this._bound);
                if (render) {
                    if (this.batchMode) {
                        if (rc != ez.RenderContext) {
                            Log.error("batch mode can't be nested!");
                        }
                        else {
                            rc = BatchRC;
                            batchQueue = [];
                        }
                    }
                    this._render(rc, opacity);
                    if (this.batchMode) {
                        rc = ez.RenderContext;
                        batchCommit();
                        batchQueue = null;
                    }
                }
                if (this.clip)
                    rc.popClipRect();
                if (drawCache) {
                    this._cachedCommands = ez.RenderContext.endRecorder();
                    if (this._cachedCommands) {
                        Log.debug(`geneate draw cache cmd:${this._cachedCommands.length}`);
                    }
                }
            }
        }
        destroyBuffer() {
            if (this._rtBuffer) {
                this._rtBuffer.dispose();
                this._rtBuffer = null;
            }
        }
        get clip() {
            return ezasm.getClip(this._handle);
        }
        set clip(val) {
            if (this.clip == val)
                return;
            ezasm.setClip(this._handle, val);
            this.setDirty();
        }
        get width() {
            return ezasm.getwidth(this._handle);
        }
        set width(val) {
            if (this.width == val)
                return;
            this.destroyBuffer();
            ezasm.setwidth(this._handle, val);
        }
        get height() {
            return ezasm.getheight(this._handle);
        }
        set height(val) {
            if (this.height == val)
                return;
            this.destroyBuffer();
            ezasm.setheight(this._handle, val);
        }
        get ownerBuffer() {
            return ezasm.getOwnerBuffer(this._handle);
        }
        set ownerBuffer(val) {
            if (val == this.ownerBuffer)
                return;
            ezasm.setOwnerBuffer(this._handle, val);
            this.setDirty();
            if (!val)
                this.destroyBuffer();
        }
        saveToCanvas() {
            if (!this._rtBuffer)
                return null;
            var canvas = ez.internal.createCanvas();
            var w = canvas.width = this._rtBuffer.width;
            var h = canvas.height = this._rtBuffer.height;
            var ctx = canvas.getContext("2d");
            if (useWGL) {
                var img = ctx.createImageData(w, h);
                var gl = ez.getGL();
                gl.bindFramebuffer(36160, this._rtBuffer.framebuffer);
                gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, img.data);
                gl.bindFramebuffer(36160, null);
                var stride = w * 4;
                var tmp = new Uint8ClampedArray(stride);
                var h1 = h >> 1;
                for (let i = 0; i < h1; i++) {
                    var s = img.data.subarray(i * stride, (i + 1) * stride);
                    var d = img.data.subarray((h - i - 1) * stride, (h - i) * stride);
                    tmp.set(d);
                    d.set(s);
                    s.set(tmp);
                }
                ctx.putImageData(img, 0, 0);
            }
            else {
                ctx.drawImage(this._rtBuffer.canvas, 0, 0);
            }
            return canvas;
        }
        makeDirty(needSort) {
            this._needSort = needSort || this._needSort;
            if (this._isDirty)
                return;
            this._isDirty = true;
            this.setDirty(false);
        }
    }
    SubStageSprite.Type = "SubStage";
    ez.SubStageSprite = SubStageSprite;
    class StageImpl {
        constructor() {
            this._namedItems = {};
            this._items = [];
            this._isDirty = true;
            this._needSort = true;
            this._preRenderList = [];
        }
        _render(rc, opacity) {
            this._isDirty = false;
            for (var i = 0; i < this._items.length; i++) {
                var item = this._items[i];
                if (item.visible && !item.culled)
                    item._draw(rc, opacity);
            }
        }
        _prepareRender(bound, transform, transChanged) {
            if (this._needSort) {
                insertSort(this._items, cmpZIndex);
                this._needSort = false;
            }
            for (var i = 0; i < this._items.length; i++) {
                var item = this._items[i];
                if (item.visible)
                    item._prepare(bound, transform, transChanged);
            }
        }
        needPreRender(node) {
            if (this._preRenderList)
                this._preRenderList.push(node);
            else
                this._parent.needPreRender(node);
        }
        render(target, profile) {
            ez.RenderContext.scale = target.scale;
            ezasm.saveTempStack();
            this._prepareRender(new ez.Rect(0, 0, target.width, target.height), makeIdentMat2D(), false);
            ezasm.restoreTempStack();
            if (this._preRenderList && this._preRenderList.length > 0) {
                for (var i = 0; i < this._preRenderList.length; i++) {
                    this._preRenderList[i].preRender(profile);
                }
                this._preRenderList = [];
            }
            ez.RenderContext.beginRender(target, profile);
            this._render(ez.RenderContext, 1);
            ez.RenderContext.endRender();
        }
        addChild(item, id) {
            if (id) {
                if (this._namedItems[id])
                    throw new Error("id conflict! id:" + id);
                else
                    this._namedItems[id] = item;
            }
            this._needSort = true;
            this._items.push(item);
        }
        makeDirty(needSort) {
            this._needSort = needSort || this._needSort;
            this._isDirty = true;
        }
        get count() {
            return this._items.length;
        }
        get dirty() {
            return this._isDirty;
        }
        getItem(index) {
            return this._items[index];
        }
        _remove(sprite) {
            var idx = this._items.indexOf(sprite);
            if (idx == -1)
                throw new Error("this sprite is not exist in stage!");
            this._items.splice(idx, 1);
            if (sprite.id)
                delete this._namedItems[sprite.id];
            this.makeDirty(false);
        }
        remove(sprite) {
            this._remove(sprite);
            sprite._dispose();
        }
        bringToTop(sprite) {
            var idx = this._items.indexOf(sprite);
            if (idx == -1)
                throw new Error("this sprite is not exist in stage!");
            for (var i = 0; i < idx; i++)
                this._items[i + 1] = this._items[i];
            this._items[0] = sprite;
            this.makeDirty(true);
        }
        bringToBottom(sprite) {
            var idx = this._items.indexOf(sprite);
            if (idx == -1)
                throw new Error("this sprite is not exist in stage!");
            for (var i = idx; i < this._items.length - 1; i++)
                this._items[i] = this._items[i + 1];
            this._items[this._items.length - 1] = sprite;
            this.makeDirty(true);
        }
        load(items) {
            var sprites = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var sprite = ez.Sprite.create(item.type, this, item.id);
                sprites.push(sprite);
                for (var k in item) {
                    if (k === "id" || k === "type" || k === "onLoad")
                        continue;
                    sprite[k] = item[k];
                }
                if (item.type == "SubStage" && item.childs)
                    sprite.load(item.childs);
                if (item.onLoad)
                    item.onLoad.call(sprite);
            }
            return sprites;
        }
        find(id) {
            if (this._namedItems[id])
                return this._namedItems[id];
            else {
                for (var i = 0; i < this._items.length; i++) {
                    var t = this._items[i];
                    if (!t.stage)
                        continue;
                    var s = t.stage.find(id);
                    if (s)
                        return s;
                }
            }
            return null;
        }
        clear() {
            this._namedItems = {};
            if (this._items.length > 0) {
                var items = this._items.concat();
                for (var i = 0; i < items.length; i++)
                    items[i]._dispose();
            }
            this._items = [];
        }
        hitFind(x, y, allHitTargets) {
            if (this._needSort) {
                insertSort(this._items, cmpZIndex);
                this._needSort = false;
            }
            if (allHitTargets) {
                var r = [];
                for (var i = this._items.length - 1; i >= 0; i--) {
                    var item = this._items[i];
                    if (item.visible) {
                        let m = item.localTransform.clone();
                        m.invert();
                        var pt = [x, y];
                        m.transform(pt);
                        if (item.hitTest(pt[0], pt[1]))
                            r.push(item);
                    }
                }
                return r;
            }
            else {
                for (var i = this._items.length - 1; i >= 0; i--) {
                    var item = this._items[i];
                    if (item.visible) {
                        let m = item.localTransform.clone();
                        m.invert();
                        var pt = [x, y];
                        m.transform(pt);
                        if (item.hitTest(pt[0], pt[1]))
                            return item;
                    }
                }
                return null;
            }
        }
    }
    function createStage() {
        return new StageImpl();
    }
    ez.createStage = createStage;
    Object.getOwnPropertyNames(StageImpl.prototype).forEach(name => {
        if (SubStageSprite.prototype[name])
            return;
        var desc = Object.getOwnPropertyDescriptor(StageImpl.prototype, name);
        if (desc.value)
            SubStageSprite.prototype[name] = StageImpl.prototype[name];
        else
            Object.defineProperty(SubStageSprite.prototype, name, desc);
    });
    ez.Sprite.register(SubStageSprite.Type, (p, id) => new SubStageSprite(p, id));
})(ez || (ez = {}));
var ez;
(function (ez) {
    var gl = null;
    var activeTextueres = [];
    var permanentTextures = [];
    class Texture {
        constructor(data, width, height) {
            this._data = data;
            this._width = width;
            this._height = height;
            if ((data.tex || data.img) && data.maxAge < 0)
                Texture.addTextureData(data);
        }
        static addTextureAge() {
            activeTextueres.forEach(v => v.age++);
        }
        static init(wgl) {
            gl = wgl;
            var img = new Image();
            img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAB3RJTUUH3wUYDBYenXyFigAAAYZJREFUeJy11sHKgkAUhuFTCyGI2gaVEQiCIAlCEHSdbVtEd1CbVt1EEASCICiCEHQB37+Y+bXSGY9lZ9Pg4PuYStQBQL+crvzc7ShJWqsmCR2Pcg0A2y2I4DiIY3w/cQzHgWHgcABA8pBtSyNNW6gTwbbF5ZLciKIWjDQt6lEkjlGx/aVRVX8FhGFZIILrNjMU9RLwmaGuVwFNjbxuWeW6AhDGfA4ieJ7OSFO4rqauBjgGo64F3ows+6BeBwAIwwqDXWcAZaNJnQcIwzRBhMVCvjPzOafOBoQxmYAIRJjNmHUAXe3P7tP0ejQYyPVwSP0+90TWZaQpPA9EmE4xHoMIvo/7nXMqA8jr4r4HgXwePKMOeKuLCQL5PZbLWkMLZFlRD8OXLbahBjT1JoYCqK2Lud2ksVqpjCqAWecZJaBRvWw8Hlogr5smty7melUZT0CWwfc/qWuNf+DLem6MRiDCep0b1FpdYRAAnM8wjBbqb8Z+j+IWnU7t1MVcLthsxLKDH/99/wOjNVTQK+4QyQAAAABJRU5ErkJggg==";
            Texture.errorFallback = { id: "_fallback", name: "fallback", width: img.width, height: img.height,
                memSize: 0, maxAge: -1, invWidth: 1 / img.width, invHeight: 1 / img.height
            };
            if (useWGL) {
                img.onload = function () {
                    Texture.errorFallback.tex = Texture.createGLTextureFromImage(img, 33071, false);
                };
            }
            else {
                Texture.errorFallback.img = img;
                return;
            }
            var anisotropic = gl.getExtension('EXT_texture_filter_anisotropic');
            if (anisotropic) {
                Texture.TEXTURE_MAX_ANISOTROPY_EXT = anisotropic.TEXTURE_MAX_ANISOTROPY_EXT;
                Texture.anisotropicMax = gl.getParameter(anisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
            }
            var dxt = gl.getExtension("WEBGL_compressed_texture_s3tc") || gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc") || gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc");
            var astc = gl.getExtension("WEBGL_compressed_texture_astc");
            var etc1 = gl.getExtension('WEBGL_compressed_texture_etc1');
            var pvr = gl.getExtension("WEBGL_compressed_texture_pvrtc") || gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
            if (etc1) {
                Texture.CompressTextureType.etc1 = etc1.COMPRESSED_RGB_ETC1_WEBGL;
                Texture.compressFormat = 5;
            }
            if (dxt) {
                Texture.CompressTextureType.dxt1 = dxt.COMPRESSED_RGB_S3TC_DXT1_EXT;
                Texture.compressFormat = 8;
            }
            if (pvr) {
                Texture.CompressTextureType.pvr4 = pvr.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
                Texture.compressFormat = 6;
            }
            if (astc) {
                Texture.CompressTextureType.astc4x4 = astc.COMPRESSED_RGBA_ASTC_4x4_KHR;
                Texture.CompressTextureType.astc5x5 = astc.COMPRESSED_RGBA_ASTC_5x5_KHR;
                Texture.CompressTextureType.astc6x6 = astc.COMPRESSED_RGBA_ASTC_6x6_KHR;
                Texture.CompressTextureType.astc8x8 = astc.COMPRESSED_RGBA_ASTC_8x8_KHR;
                Texture.compressFormat = 7;
            }
            if (!Texture.compressFormat)
                Texture.compressFormat = 1;
            Log.info(`compressFormat: ${Texture.compressFormat}`);
        }
        static addTextureData(t) {
            if (t.maxAge < 0)
                permanentTextures.push(t);
            else {
                t.age = 0;
                activeTextueres.push(t);
            }
        }
        static profile() {
            var memSize = 0;
            activeTextueres.forEach(t => memSize += t.memSize);
            permanentTextures.forEach(t => memSize += t.memSize);
            return {
                activeTextueres: activeTextueres.map(t => { return { name: t.name, width: t.width, height: t.height, size: t.memSize, age: t.age }; }),
                permanentTextures: permanentTextures.map(t => { return { name: t.name, width: t.width, height: t.height, size: t.memSize }; }),
                totalMemory: memSize
            };
        }
        static releaseUnusedTexture(maxAge) {
            for (let i = 0; i < permanentTextures.length; i++) {
                let t = permanentTextures[i];
                if (!t.tex && !t.img) {
                    permanentTextures.splice(i, 1);
                    i--;
                }
            }
            for (let i = 0; i < activeTextueres.length; i++) {
                const t = activeTextueres[i];
                if (t.age >= (t.maxAge || maxAge)) {
                    if (DEBUG)
                        Log.debug(`release texture: ${t.name}`);
                    t.release();
                    activeTextueres.splice(i, 1);
                    i--;
                }
            }
        }
        get isCube() {
            return this._data.isCube;
        }
        release() {
            this._data.release();
        }
        get name() {
            return this._data.name;
        }
        get id() {
            return this._data.id;
        }
        get width() {
            return this._width;
        }
        get height() {
            return this._height;
        }
        get scaleX() {
            var w = this._width;
            if (this.margin)
                w -= this.margin[0] + this.margin[2];
            if (this.subRect)
                return w / this.subRect.width;
            else
                return w / this._data.width;
        }
        get scaleY() {
            var h = this._height;
            if (this.margin)
                h -= this.margin[1] + this.margin[3];
            if (this.subRect)
                return h / this.subRect.height;
            else
                return h / this._data.height;
        }
        get memSize() {
            return this._data.memSize;
        }
        get ready() {
            return useWGL ? !!this._data.tex : !!this._data.img;
        }
        get invWidth() {
            return this._data.invWidth;
        }
        get invHeight() {
            return this._data.invHeight;
        }
        load(onload) {
            var t = this._data;
            this._data.load(function () {
                Texture.addTextureData(t);
                if (onload)
                    onload();
            });
        }
        get image() {
            return this._data.img;
        }
        bindTexture(idx) {
            if (!this._data.tex) {
                Log.error(`the texture ${this.name} is not loaded.`);
                return;
            }
            this._data.age = 0;
            gl.activeTexture(33984 + idx);
            if (this._data.isCube)
                gl.bindTexture(34067, this._data.tex);
            else
                gl.bindTexture(3553, this._data.tex);
        }
        createSubTexture(rect, w, h) {
            if (rect.left < 0 || rect.top < 0 || rect.right > this.width || rect.bottom > this.height)
                Log.warn(`subrect(${rect.left},${rect.top},${rect.right},${rect.bottom}) out of bound of '${this.name}'.`);
            if (this.subRect) {
                rect.left += this.subRect.left;
                rect.top += this.subRect.top;
            }
            var tex = new Texture(this._data, w || rect.width, h || rect.height);
            tex.subRect = rect;
            return tex;
        }
        static createFromImage(img) {
            if (useWGL) {
                let tex = Texture.createGLTextureFromImage(img, 33071, false);
                let id = "image" + Date.now();
                let data = {
                    id: id, name: id,
                    maxAge: -1,
                    width: img.width, height: img.height,
                    memSize: img.width * img.height * 4,
                    invWidth: 1 / img.width, invHeight: 1 / img.height,
                    tex: tex,
                    release: function () {
                        gl.deleteTexture(this.tex);
                        this.tex = null;
                    }
                };
                return new Texture(data, data.width, data.height);
            }
            else {
                let id = "image" + Date.now();
                let data = {
                    id: id, name: id, maxAge: -1,
                    width: img.width, height: img.height,
                    memSize: img.width * img.height * 4,
                    img: img
                };
                data.release = function () {
                    this.img = null;
                };
                return new Texture(data, data.width, data.height);
            }
        }
        static createGLTextureFromImage(img, wrapMode, mipmap) {
            var tex = gl.createTexture();
            gl.bindTexture(3553, tex);
            gl.pixelStorei(37441, 1);
            gl.texImage2D(3553, 0, 6408, 6408, 5121, img);
            gl.texParameteri(3553, 10242, wrapMode);
            gl.texParameteri(3553, 10243, wrapMode);
            gl.texParameteri(3553, 10240, 9729);
            if (mipmap) {
                gl.texParameteri(3553, 10241, 9987);
                gl.generateMipmap(3553);
            }
            else
                gl.texParameteri(3553, 10241, 9729);
            return tex;
        }
        static createCompressTexture(width, height, compressFormat, wrapMode, filterMode, mipmaps) {
            var tex = gl.createTexture();
            gl.bindTexture(3553, tex);
            for (var i = 0; i < mipmaps.length; i++) {
                gl.compressedTexImage2D(3553, i, compressFormat, width, height, 0, mipmaps[i]);
                width = Math.max(1, width >> 1);
                height = Math.max(1, height >> 1);
            }
            gl.texParameteri(3553, 10242, wrapMode);
            gl.texParameteri(3553, 10243, wrapMode);
            gl.texParameteri(3553, 10240, filterMode);
            gl.texParameteri(3553, 10241, mipmaps.length > 1 ? 9985 : filterMode);
            return tex;
        }
        static createCubeTextureFromImage(imgs) {
            var tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
            for (let i = 0; i < 6; i++)
                gl.texImage2D(34069 + i, 0, 6408, 6408, 5121, imgs[i]);
            gl.texParameteri(34067, 10240, 9729);
            gl.texParameteri(34067, 10241, 9729);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
            return tex;
        }
        static createCompressCubeTexture(width, height, compressFormat, filterMode, cubes) {
            var tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
            for (var j = 0; j < 6; j++) {
                var mipmaps = cubes[j];
                let w = width;
                let h = height;
                for (var i = 0; i < mipmaps.length; i++) {
                    gl.compressedTexImage2D(34069 + j, i, compressFormat, w, h, 0, mipmaps[i]);
                    w = Math.max(1, w >> 1);
                    h = Math.max(1, h >> 1);
                }
            }
            gl.texParameteri(34067, 10240, filterMode);
            gl.texParameteri(34067, 10241, mipmaps.length > 1 ? 9985 : filterMode);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
            return tex;
        }
        static createGLTexture(width, height, format, wrapMode, filterMode, mulAlpha, genMipmap, pixels) {
            var tex = gl.createTexture();
            gl.bindTexture(3553, tex);
            gl.pixelStorei(37441, mulAlpha ? 1 : 0);
            gl.pixelStorei(3317, 1);
            if (format == 0)
                gl.texImage2D(3553, 0, 6408, width, height, 0, 6408, 5121, pixels);
            else if (format == 1)
                gl.texImage2D(3553, 0, 6407, width, height, 0, 6407, 33635, pixels);
            else if (format == 2)
                gl.texImage2D(3553, 0, 6408, width, height, 0, 6408, 32819, pixels);
            else if (format == 3)
                gl.texImage2D(3553, 0, 6409, width, height, 0, 6409, 5121, pixels);
            else if (format == 4)
                gl.texImage2D(3553, 0, 6410, width, height, 0, 6410, 5121, pixels);
            gl.texParameteri(3553, 10242, wrapMode);
            gl.texParameteri(3553, 10243, wrapMode);
            gl.texParameteri(3553, 10240, filterMode);
            if (genMipmap)
                gl.texParameteri(3553, 10241, 9987);
            else
                gl.texParameteri(3553, 10241, filterMode);
            if (genMipmap)
                gl.generateMipmap(gl.TEXTURE_2D);
            return tex;
        }
    }
    Texture.CompressTextureType = {
        dxt1: 0,
        astc4x4: 0,
        astc5x5: 0,
        astc6x6: 0,
        astc8x8: 0,
        etc1: 0,
        pvr4: 0
    };
    ez.Texture = Texture;
    class RawTexture extends Texture {
        constructor(data, width, height) {
            super(data, width, height);
        }
        get glTex() {
            return this._data.tex;
        }
        static create(id, width, height, pixFormat, wrapMode, filterMode, data) {
            var tex = gl.createTexture();
            gl.activeTexture(33984);
            gl.bindTexture(3553, tex);
            gl.pixelStorei(37441, 1);
            gl.texImage2D(3553, 0, pixFormat, width, height, 0, pixFormat, 5121, data);
            gl.texParameteri(3553, 10242, wrapMode);
            gl.texParameteri(3553, 10243, wrapMode);
            gl.texParameteri(3553, 10240, filterMode);
            gl.texParameteri(3553, 10241, filterMode);
            var t = { id: id, name: id, width: width, height: height, memSize: width * height * 4, maxAge: -1, tex: tex, invWidth: 1 / width, invHeight: 1 / height };
            return new RawTexture(t, width, height);
        }
        release() {
            gl.deleteTexture(this._data.tex);
            this._data.tex = null;
        }
    }
    ez.RawTexture = RawTexture;
    class RenderTexture extends Texture {
        constructor(tex, width, height) {
            super(tex, width, height);
            this.scale = 1;
        }
        dispose() {
            if (DEBUG)
                Log.debug(`dispose render texture: ${this.id}`);
            this._data.release();
        }
        get framebuffer() {
            return this._data.fb;
        }
        get canvas() {
            return this._data.canvas;
        }
        resize(w, h) {
            if (this._width == w && this._height == h)
                return;
            if (useWGL) {
                if (this._data.tex) {
                    gl.bindTexture(3553, this._data.tex);
                    gl.texImage2D(3553, 0, 6408, w, h, 0, 6408, 5121, null);
                }
                this._data.width = w;
                this._data.height = h;
            }
            else {
                this._data.canvas.width = w;
                this._data.canvas.height = h;
            }
            this._width = w;
            this._height = h;
        }
        static createFromCanvas(canvas) {
            RenderTexture.allocId++;
            var id = "_rt" + RenderTexture.allocId;
            let data = {
                id: id, name: id,
                width: canvas.width, height: canvas.height,
                memSize: canvas.width * canvas.height * 4,
                img: canvas, canvas: canvas
            };
            data.release = function () {
                this.img = null;
                this.canvas.width = 0;
                this.canvas.height = 0;
                this.canvas = null;
            };
            return new RenderTexture(data);
        }
        static create(width, height, needDepth = false) {
            RenderTexture.allocId++;
            var id = "_rt" + RenderTexture.allocId;
            width = width | 0;
            height = height | 0;
            if (DEBUG)
                Log.debug(`create render texture: ${id} size: ${width} x ${height}`);
            if (!useWGL) {
                var canvas = ez.internal.createCanvas();
                canvas.width = width;
                canvas.height = height;
                let data = { id: id, name: id, width: width, height: height, memSize: width * height * 4, maxAge: -1, canvas: canvas, invWidth: 1 / width, invHeight: 1 / height };
                return new RenderTexture(data, width, height);
            }
            else {
                let data = { id: id, name: id, width: width, height: height, memSize: width * height * 4, maxAge: -1, invWidth: 1 / width, invHeight: 1 / height };
                data.tex = gl.createTexture();
                data.fb = gl.createFramebuffer();
                data.release = function () {
                    gl.deleteTexture(this.tex);
                    gl.deleteFramebuffer(this.fb);
                    if (this.depth)
                        gl.deleteRenderbuffer(this.depth);
                    this.tex = null;
                    this.fb = null;
                };
                gl.bindTexture(3553, data.tex);
                gl.pixelStorei(37441, 1);
                gl.texParameteri(3553, 10242, 33071);
                gl.texParameteri(3553, 10243, 33071);
                gl.texParameteri(3553, 10240, 9729);
                gl.texParameteri(3553, 10241, 9729);
                gl.texImage2D(3553, 0, 6408, width, height, 0, 6408, 5121, null);
                gl.bindFramebuffer(36160, data.fb);
                gl.framebufferTexture2D(36160, 36064, 3553, data.tex, 0);
                if (needDepth) {
                    data.depth = gl.createRenderbuffer();
                    gl.bindRenderbuffer(36161, data.depth);
                    gl.renderbufferStorage(36161, 34041, width, height);
                    gl.framebufferRenderbuffer(36160, 33306, 36161, data.depth);
                }
                if (gl.checkFramebufferStatus(36160) != 36053) {
                    Log.error(`create framebuffer failed. status: ${gl.checkFramebufferStatus(36160)}`);
                    data.release();
                    throw new Error("create frame buffer failed!");
                }
                gl.bindTexture(3553, null);
                gl.bindFramebuffer(36160, null);
                return new RenderTexture(data, width, height);
            }
        }
    }
    RenderTexture.allocId = 0;
    ez.RenderTexture = RenderTexture;
})(ez || (ez = {}));
var ez;
(function (ez) {
    class Ease {
        static get(amount) {
            if (amount < -1)
                amount = -1;
            if (amount > 1)
                amount = 1;
            return function (t) {
                if (amount == 0)
                    return t;
                if (amount < 0)
                    return t * (t * -amount + 1 + amount);
                return t * ((2 - t) * amount + (1 - amount));
            };
        }
        static getPowIn(pow) {
            return function (t) {
                return Math.pow(t, pow);
            };
        }
        static getPowOut(pow) {
            return function (t) {
                return 1 - Math.pow(1 - t, pow);
            };
        }
        static getPowInOut(pow) {
            return function (t) {
                if ((t *= 2) < 1)
                    return 0.5 * Math.pow(t, pow);
                return 1 - 0.5 * Math.abs(Math.pow(2 - t, pow));
            };
        }
        static sineIn(t) {
            return 1 - Math.cos(t * Math.PI / 2);
        }
        static sineOut(t) {
            return Math.sin(t * Math.PI / 2);
        }
        static sineInOut(t) {
            return -0.5 * (Math.cos(Math.PI * t) - 1);
        }
        static getBackIn(amount) {
            return function (t) {
                return t * t * ((amount + 1) * t - amount);
            };
        }
        static getBackOut(amount) {
            return function (t) {
                return (t * t * ((amount + 1) * t + amount) + 1);
            };
        }
        static getBackInOut(amount) {
            amount *= 1.525;
            return function (t) {
                if ((t *= 2) < 1)
                    return 0.5 * (t * t * ((amount + 1) * t - amount));
                return 0.5 * ((t -= 2) * t * ((amount + 1) * t + amount) + 2);
            };
        }
        static circIn(t) {
            return -(Math.sqrt(1 - t * t) - 1);
        }
        static circOut(t) {
            return Math.sqrt(1 - (--t) * t);
        }
        static circInOut(t) {
            if ((t *= 2) < 1)
                return -0.5 * (Math.sqrt(1 - t * t) - 1);
            return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
        }
        static bounceIn(t) {
            return 1 - Ease.bounceOut(1 - t);
        }
        static bounceOut(t) {
            if (t < 1 / 2.75)
                return (7.5625 * t * t);
            else if (t < 2 / 2.75)
                return (7.5625 * (t -= 1.5 / 2.75) * t + 0.75);
            else if (t < 2.5 / 2.75)
                return (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375);
            else
                return (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375);
        }
        static bounceInOut(t) {
            if (t < 0.5)
                return Ease.bounceIn(t * 2) * .5;
            return Ease.bounceOut(t * 2 - 1) * 0.5 + 0.5;
        }
        static getElasticIn(amplitude, period) {
            var pi2 = Math.PI * 2;
            return function (t) {
                if (t == 0 || t == 1)
                    return t;
                var s = period / pi2 * Math.asin(1 / amplitude);
                return -(amplitude * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * pi2 / period));
            };
        }
        static getElasticOut(amplitude, period) {
            var pi2 = Math.PI * 2;
            return function (t) {
                if (t == 0 || t == 1)
                    return t;
                var s = period / pi2 * Math.asin(1 / amplitude);
                return (amplitude * Math.pow(2, -10 * t) * Math.sin((t - s) * pi2 / period) + 1);
            };
        }
        static getElasticInOut(amplitude, period) {
            var pi2 = Math.PI * 2;
            return function (t) {
                var s = period / pi2 * Math.asin(1 / amplitude);
                if ((t *= 2) < 1)
                    return -0.5 * (amplitude * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * pi2 / period));
                return amplitude * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - s) * pi2 / period) * 0.5 + 1;
            };
        }
        static linear(t) {
            return t;
        }
    }
    Ease.quadIn = Ease.getPowIn(2);
    Ease.quadOut = Ease.getPowOut(2);
    Ease.quadInOut = Ease.getPowInOut(2);
    Ease.cubicIn = Ease.getPowIn(3);
    Ease.cubicOut = Ease.getPowOut(3);
    Ease.cubicInOut = Ease.getPowInOut(3);
    Ease.quartIn = Ease.getPowIn(4);
    Ease.quartOut = Ease.getPowOut(4);
    Ease.quartInOut = Ease.getPowInOut(4);
    Ease.quintIn = Ease.getPowIn(5);
    Ease.quintOut = Ease.getPowOut(5);
    Ease.quintInOut = Ease.getPowInOut(5);
    Ease.elasticIn = Ease.getElasticIn(1, 0.3);
    Ease.elasticInOut = Ease.getElasticInOut(1, 0.3 * 1.5);
    Ease.elasticOut = Ease.getElasticOut(1, 0.3);
    Ease.backIn = Ease.getBackIn(1.7);
    Ease.backOut = Ease.getBackOut(1.7);
    Ease.backInOut = Ease.getBackInOut(1.7);
    ez.Ease = Ease;
    class Tween {
        constructor(target, steps) {
            this.steps = [];
            this._state = 0;
            this.stepPos = 0;
            this.currStep = 0;
            this.loop = false;
            this._target = target;
            if (target)
                this.steps.push({ action: 5, target: target });
            if (!steps)
                return;
            for (var i = 0; i < steps.length; i++) {
                var s = steps[i];
                if (s.set) {
                    this.steps.push({ action: 1, props: Array.isArray(s.set) ? s.set[0] : s.set });
                }
                else if (s.move) {
                    this.steps.push({ action: 2, props: s.move[0], duration: s.move[1], ease: s.move[2] || Tween.defaultEase });
                }
                else if (s.wait) {
                    this.steps.push({ action: 3, duration: s.wait });
                }
                else if (s.call) {
                    this.steps.push({ action: 4, props: { func: s.call[0], ctx: s.call[1] } });
                }
                else if (s.to) {
                    this.to(s.to[0], s.to[1], s.to[2]);
                }
                else if (s.target) {
                    this.steps.push({ action: 5, target: s.target });
                }
            }
        }
        static add(target, steps) {
            return new Tween(target, steps);
        }
        static stopTweens(target) {
            var arr = Tween.playings.concat();
            for (var i = 0; i < arr.length; i++) {
                var t = arr[i];
                if (t._target === target)
                    t.stop();
            }
        }
        static update(dt) {
            var arr = Tween.playings.concat();
            for (var i = 0; i < arr.length; i++)
                arr[i].advance(dt);
            if (Tween.playings.length == 0) {
                ez.removeTicker(Tween.playTicker);
                Tween.playTicker = undefined;
            }
        }
        set(props) {
            this.steps.push({ action: 1, props: props });
            return this;
        }
        move(props, duration, ease) {
            if (DEBUG) {
                for (var k in props) {
                    var steps = props[k];
                    if (steps.length < 2)
                        Log.error(`props ${k} has no 2 positions.`);
                    for (let i = 0; i < steps.length; i++)
                        if (typeof steps[i] !== "number")
                            Log.error(`props ${k} is not number.`);
                }
            }
            this.steps.push({ action: 2, props: props, duration: duration, ease: ease || Tween.defaultEase });
            return this;
        }
        to(props, duration, ease) {
            var target = null;
            var p2 = {};
            for (var k in props) {
                var i;
                if (DEBUG) {
                    if (typeof props[k] !== "number")
                        Log.error(`props ${k} is not number.`);
                }
                for (i = this.steps.length - 1; i >= 0; i--) {
                    var s = this.steps[i];
                    if (s.target) {
                        target = s.target;
                        i = -1;
                        break;
                    }
                    if (s.props) {
                        if (Array.isArray(s.props[k]))
                            p2[k] = [s.props[k][1], props[k]];
                        else if (typeof (s.props[k]) === "number")
                            p2[k] = [s.props[k], props[k]];
                        else
                            continue;
                        break;
                    }
                }
                if (i < 0) {
                    var p0 = target[k];
                    if (typeof (p0) !== "number") {
                        Log.warn(`Tween.to ${k} has no initial pos.`);
                        p2[k] = [0, props[k]];
                    }
                    else
                        p2[k] = [p0, props[k]];
                }
            }
            this.steps.push({ action: 2, props: p2, duration: duration, ease: ease || Tween.defaultEase });
            return this;
        }
        target(t) {
            if (!t)
                return this;
            this.steps.push({ action: 5, target: t });
            return this;
        }
        wait(duration) {
            this.steps.push({ action: 3, duration: duration });
            return this;
        }
        call(func, thisObj) {
            this.steps.push({ action: 4, props: { func: func, ctx: thisObj } });
            return this;
        }
        disposeTarget() {
            this.steps.push({ action: 7 });
            return this;
        }
        func(duration, func, thisObj, ease) {
            this.steps.push({ action: 6, duration: duration, props: { func: func, ctx: thisObj }, ease: ease || Tween.defaultEase });
            return this;
        }
        append(tween) {
            this.steps = this.steps.concat(tween.steps);
            return this;
        }
        config(args) {
            for (var k in args)
                this[k] = args[k];
            return this;
        }
        play() {
            if (this._state == 1)
                return;
            if (this._state == 0)
                Tween.playings.push(this);
            this._state = 1;
            if (!Tween.playTicker)
                Tween.playTicker = ez.addTicker(Tween.update);
            return this;
        }
        waitForEnd() {
            this.play();
            return new Promise((resolve, reject) => {
                this._promise = { resolve: resolve, reject: reject };
            });
        }
        stop() {
            if (this._state == 0)
                return;
            var finished = this.currStep >= this.steps.length;
            this.stepPos = 0;
            this.currStep = 0;
            this._state = 0;
            var idx = Tween.playings.indexOf(this);
            if (idx != -1)
                Tween.playings.splice(idx, 1);
            if (this._promise) {
                var p = this._promise;
                this._promise = null;
                if (finished)
                    p.resolve();
                else
                    p.reject();
            }
        }
        pause() {
            if (this._state == 0)
                return;
            this._state = 2;
        }
        get state() {
            return this._state;
        }
        do(step) {
            switch (step.action) {
                case 1:
                    for (var k in step.props)
                        this._target[k] = step.props[k];
                    break;
                case 2:
                    for (var k in step.props)
                        this._target[k] = step.props[k][1];
                    break;
                case 4:
                    step.props.func.call(step.props.ctx);
                    break;
                case 5:
                    this._target = step.target;
                    break;
                case 6:
                    step.props.func.call(step.props.ctx, this._target, 1);
                    break;
                case 7:
                    this._target.dispose();
                    break;
            }
        }
        advance(dt) {
            try {
                if (this._state != 1)
                    return;
                if (this._target && this._target.disposed) {
                    this.stop();
                    return;
                }
                if (this.currStep >= this.steps.length) {
                    this.stop();
                    if (this.loop)
                        this.play();
                    return;
                }
                var p = this.stepPos + dt;
                var step = this.steps[this.currStep];
                while (!step.duration || p >= step.duration) {
                    this.currStep++;
                    this.do(step);
                    this.stepPos = p;
                    if (this._state != 1)
                        return;
                    if (this.currStep >= this.steps.length) {
                        this.stop();
                        if (this.loop)
                            this.play();
                        return;
                    }
                    if (step.duration)
                        p -= step.duration;
                    step = this.steps[this.currStep];
                }
                this.stepPos = p;
                if (step.action == 2) {
                    var t = step.ease(p / step.duration);
                    for (var k in step.props) {
                        var v = step.props[k];
                        this._target[k] = v[0] + (v[1] - v[0]) * t;
                    }
                }
                else if (step.action == 6) {
                    var t = step.ease(p / step.duration);
                    step.props.func.call(step.props.ctx, this._target, t);
                }
            }
            catch (e) {
                Log.error("tween error: " + e.message);
                this.stop();
            }
        }
    }
    Tween.playings = [];
    Tween.playTicker = null;
    Tween.defaultEase = Ease.linear;
    ez.Tween = Tween;
    class KeyframeAnimation {
        constructor() {
            this.tracks = [];
        }
        _onStop() {
            if (this.isLoop)
                ez.callNextFrame(function () { this.play(true); }, this);
            else if (this._promise)
                this._promise.resolve();
        }
        load(stage, data) {
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                var target = stage.find(item.target);
                var t = new Tween(target, item.steps);
                if (item.loop && i > 0)
                    t.loop = true;
                this.tracks.push(t);
            }
            this.tracks[0].call(this._onStop, this);
        }
        get state() {
            return this.tracks[0].state;
        }
        waitForEnd() {
            return new Promise((resolve, reject) => {
                this._promise = { resolve: resolve, reject: reject };
            });
        }
        play(isLoop) {
            for (var i = 0; i < this.tracks.length; i++)
                this.tracks[i].play();
            this.isLoop = !!isLoop;
        }
        stop() {
            for (var i = 0, len = this.tracks.length; i < len; i++)
                this.tracks[i].stop();
            this.isLoop = false;
            if (this._promise)
                this._promise.reject();
        }
        dispose() {
            this.stop();
            this.tracks = [];
        }
    }
    ez.KeyframeAnimation = KeyframeAnimation;
})(ez || (ez = {}));
var ez;
(function (ez) {
    let internal;
    (function (internal) {
    })(internal = ez.internal || (ez.internal = {}));
    function loadEZMDecoder(url, thread = 2) {
        if (!url)
            return null;
        function singleThread() {
            var worker = new Worker(url);
            var tasks = [];
            var queue = [];
            worker.onmessage = function (e) {
                if (queue) {
                    Log.debug(`ezmDecoder ready`);
                    for (let i = 0; i < queue.length; i++)
                        worker.postMessage(queue[i]);
                    queue = undefined;
                    return;
                }
                var r = e.data;
                var task = tasks[r.id];
                if (r.subImg) {
                    if (!task.subsets)
                        task.subsets = [];
                    if (PROFILING && task.event)
                        task.event.addStep(`decode ${task.subsets.length}`);
                    task.subsets.push(r.subImg);
                }
                if (r.status <= 0) {
                    if (task.subsets)
                        r.subsets = task.subsets;
                    else if (PROFILING && task.event)
                        task.event.addStep("decode");
                    task.onResult(r);
                    tasks[r.id] = null;
                }
                else if (PROFILING && r.status == 2 && task.event) {
                    task.event.addStep("download");
                }
            };
            function load(url, format, size, event, onResult) {
                var id = tasks.indexOf(null);
                var task = { id: id, event: event, onResult: onResult };
                if (id < 0) {
                    task.id = tasks.length;
                    tasks.push(task);
                }
                else
                    tasks[id] = task;
                let t = { id: task.id, url: url, format: format, profile: !!event };
                if (queue)
                    queue.push(t);
                else
                    worker.postMessage(t);
            }
            return { load: load };
        }
        function multiThread() {
            var threads = [];
            for (let i = 0; i < thread; i++) {
                threads[i] = { id: i, worker: new Worker(url), tasks: [], load: 0, queue: [] };
                threads[i].worker.onmessage = (function (e) {
                    if (this.queue) {
                        Log.debug(`thread${this.id} ready`);
                        for (let i = 0; i < this.queue.length; i++)
                            this.worker.postMessage(this.queue[i]);
                        this.queue = undefined;
                        return;
                    }
                    var r = e.data;
                    var task = this.tasks[r.id];
                    if (r.subImg) {
                        if (!task.subsets)
                            task.subsets = [];
                        if (PROFILING && task.event)
                            task.event.addStep(`decode ${task.subsets.length}`);
                        task.subsets.push(r.subImg);
                    }
                    if (r.status <= 0) {
                        if (task.subsets)
                            r.subsets = task.subsets;
                        else if (PROFILING && task.event)
                            task.event.addStep("decode");
                        this.load -= task.load;
                        if (r.status)
                            Log.error(`decode [${task.url}] failed.`);
                        else
                            Log.debug(`thread:${this.id} [${task.url}] decode time: ${r.time}`);
                        task.onResult(r);
                        r.data = null;
                        r.subImg = null;
                        r.subsets = null;
                        this.tasks[r.id] = null;
                    }
                    else if (PROFILING && r.status == 2 && task.event) {
                        task.event.addStep("download");
                    }
                }).bind(threads[i]);
            }
            function load(url, format, size, event, onResult) {
                var minLoad = 100000000;
                var thread;
                for (let i = 0; i < threads.length; i++) {
                    if (threads[i].load < minLoad) {
                        minLoad = threads[i].load;
                        thread = threads[i];
                    }
                }
                thread.load += size;
                let tasks = thread.tasks;
                let id = tasks.indexOf(null);
                let task = { id: id, url: url, onResult: onResult, load: size };
                if (id < 0) {
                    task.id = tasks.length;
                    tasks.push(task);
                }
                else
                    tasks[id] = task;
                Log.debug(`thread:${thread.id} begin load image[${url}]. format:${format} workload:${thread.load}`);
                let t = { id: task.id, url: url, format: format };
                if (thread.queue)
                    thread.queue.push(t);
                else
                    thread.worker.postMessage(t);
            }
            return { load: load };
        }
        if (thread > 1)
            internal.ezmDecoder = multiThread();
        else
            internal.ezmDecoder = singleThread();
    }
    ez.loadEZMDecoder = loadEZMDecoder;
})(ez || (ez = {}));
if (typeof module !== "undefined")
    module.exports = ez;

//# sourceMappingURL=ez.core.js.map
