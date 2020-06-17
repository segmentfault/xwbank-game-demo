var inspector;
(function (inspector_1) {
    var connected = false;
    var allTestcase = {};
    class Inspector {
        constructor() {
            this.border = document.createElement("div");
            this.activeFrame = document.createElement("div");
            var div = document.getElementById("game");
            div.appendChild(this.border);
            div.appendChild(this.activeFrame);
            this.border.setAttribute("style", "zIndex:10000;border:2px dashed;border-color:#f00;user-select:none;background:transparent;position:absolute;visibility:hidden;");
            this.activeFrame.setAttribute("style", "color:#fff;zIndex:10001;border:1px solid;border-color:#ff0;user-select:none;background:RGB(128,128,255,0.5);position:absolute;visibility:hidden;");
            this.activeFrame.innerHTML = '<div style="font:12px Consolas;"></div>';
            ez.getRoot().addScreenResizeListener(function () {
                ez.callNextFrame(function () {
                    if (this.selected) {
                        var b = this.selected.getBound();
                        if (b)
                            this.setBound(b);
                    }
                }, this);
            }, this);
        }
        setBound(b) {
            var style = this.border.style;
            var scale = ez.getRoot().scale;
            var pos = this.selected.clientToScreen(0, 0);
            style.left = `${pos.x * scale}px`;
            style.top = `${pos.y * scale}px`;
            style.width = `${b.width * scale - 1}px`;
            style.height = `${b.height * scale - 1}px`;
        }
        close() {
            console.log("devtools panel closed.");
            connected = false;
        }
        getFPS() {
            connected = true;
            function s() {
                if (!connected)
                    return;
                sendMsgToDevtools("fps", ez.fps);
                setTimeout(s, 1000);
            }
            s();
        }
        beginPickElement() {
            console.log("beginPickElement");
            var game = document.getElementById("game");
            var div = document.createElement("div");
            var e;
            var ctx = this;
            game.appendChild(div);
            div.setAttribute("style", "position:absolute;width:100%;height:100%;z-index:100;top:0px;left:0px;color:#fff;");
            var root = ez.getRoot();
            var activeFrame = this.activeFrame;
            var txtNode = activeFrame.firstChild;
            txtNode.innerText = "";
            function mousemove(ev) {
                var x = ev.x / root.scale;
                var y = ev.y / root.scale;
                var elements = root.findElements(x, y);
                if (elements.length > 0) {
                    e = elements[0];
                    var name = `${e.class.ClassName}`;
                    if (e.id)
                        name += `:${e.id}`;
                    txtNode.innerText = name;
                    var bound = e.getBound();
                    var pos = e.clientToScreen(0, 0);
                    console.log("find", pos.x, pos.y);
                    var style = activeFrame.style;
                    style.visibility = "visible";
                    style.left = `${pos.x * root.scale}px`;
                    style.top = `${pos.y * root.scale}px`;
                    style.width = `${bound.width * root.scale}px`;
                    style.height = `${bound.height * root.scale}px`;
                }
                else {
                    txtNode.innerText = "";
                    activeFrame.style.visibility = "hidden";
                }
            }
            function mousedown(ev) {
                console.log("mousedown");
                activeFrame.style.visibility = "hidden";
                var idx = ctx.elements.indexOf(e);
                if (idx < 0)
                    idx = 0;
                sendMsgToDevtools("onPickElement", idx);
                ev.stopPropagation();
                game.removeChild(div);
            }
            div.addEventListener("mousemove", mousemove);
            div.addEventListener("mousedown", mousedown);
            div.addEventListener("pointerdown", mousedown);
        }
        getTextStyles() {
            sendMsgToDevtools("onTextStyles", ez.ui.getTextStyleNames());
        }
        getEffectNames() {
            sendMsgToDevtools("onEffectNames", Object.getOwnPropertyNames(ez.Shader["lib"]));
        }
        getImageResources() {
            sendMsgToDevtools("onImageResources", ez.allRes().filter(v => v.type == 4 || v.type == 5 || v.type == 13).map(v => v.name));
        }
        getElementData(idx) {
            var _a;
            var e = this.elements[idx];
            if (!e) {
                sendMsgToDevtools("onElementData", null);
                return;
            }
            if (this.selected != e) {
                if (this.boundListener)
                    this.boundListener.dispose();
                this.selected = e;
                if (idx == 0) {
                    this.setBound(new ez.Rect(0, 0, e.width, e.height));
                }
                else {
                    var b = e.getBound();
                    if (b)
                        this.setBound(b);
                    this.boundListener = e.addObserver("boundChange", function (b) {
                        this.setBound(b);
                    }, this);
                }
            }
            var properties = [];
            function getProps(cls) {
                if (cls.baseclass)
                    getProps(cls.baseclass);
                if (cls.Properties)
                    properties = properties.concat(cls.Properties.map(function (p) { return { name: p.name, type: p.type, validate: p.validate, default: p.default }; }));
            }
            var data = {};
            var styles;
            if (e.class) {
                getProps(e.class);
                if (e.class.Styles) {
                    data.style = e.style;
                    styles = Object.getOwnPropertyNames(e.class.Styles);
                }
            }
            for (var i = 0; i < properties.length; i++) {
                var p = properties[i];
                if (e.hasProp(p.name)) {
                    var t = e[p.name];
                    if (t == null)
                        data[p.name] = "";
                    else if (typeof (t) == "object")
                        data[p.name] = t.toString();
                    else
                        data[p.name] = t;
                }
            }
            var element = {
                idx: idx,
                properties: properties,
                data: data
            };
            if (styles)
                element.styles = styles;
            data.class = ((_a = e.class) === null || _a === void 0 ? void 0 : _a.ClassName) || "root";
            data.id = e.id;
            if (e.getBound) {
                var b = e.getBound();
                if (b)
                    data.bound = [b.left, b.top, b.width, b.height];
                else
                    data.bound = [];
            }
            else
                data.bound = [0, 0, e.width, e.height];
            console.log("ElementData", element);
            sendMsgToDevtools("onElementData", element);
        }
        setElementProp(idx, name, val) {
            console.log("setElementProp", idx, name, val);
            var e = this.elements[idx];
            e[name] = val;
        }
        getUITree() {
            var elements = this.elements = [];
            var root = ez.getRoot();
            var rootNode = { idx: elements.length, type: "Root", visible: true, childs: [], expand: true };
            elements.push(root);
            enumChilds(rootNode, root);
            function isExpand(cls) {
                if (cls.ClassName == "Container")
                    return true;
                else if (cls.ClassName == "Visual" || cls.ClassName == "Control" || cls.ClassName == "Element")
                    return false;
                else
                    return isExpand(cls.baseclass);
            }
            function enumChilds(node, parent) {
                var childs = parent["_childs"];
                for (var i = 0; i < childs.length; i++) {
                    var child = childs[i];
                    if (!child)
                        continue;
                    var childNode = { idx: elements.length, type: child.class.ClassName, visible: child.visible, childs: child["_childs"] ? [] : null };
                    elements.push(child);
                    if (child.id)
                        childNode.id = child.id;
                    if (childNode.childs) {
                        childNode.expand = isExpand(child.class);
                        enumChilds(childNode, child);
                    }
                    node.childs.push(childNode);
                }
            }
            sendMsgToDevtools("UITree", rootNode);
        }
        showBorder(show) {
            console.log("showBorder");
            this.border.style.visibility = show ? "visible" : "hidden";
        }
        setElementVisible(idx, v) {
            var e = this.elements[idx];
            if (!e)
                return;
            e.visible = v;
        }
        recordDetailProfile() {
            ez.Profile.beginEventProfiling();
            ez.Profile.beginFrameProfiling(true, data => {
                sendMsgToDevtools("onFrameProfileData", data);
            });
        }
        stodRecordProfile() {
            var events = ez.Profile.endEventProfiling();
            ez.Profile.endFrameProfiling();
            sendMsgToDevtools("onEventProfileData", events);
        }
        endProfile() {
            ez.Profile.endFrameProfiling();
        }
        beginProfile() {
            var minData;
            var maxData;
            var avgData;
            var count = 0;
            var lastUpdate = Date.now();
            ez.Profile.beginFrameProfiling(false, data => {
                if (count == 0) {
                    minData = {};
                    maxData = {};
                    avgData = {};
                    for (var k in data) {
                        if (typeof (data[k]) != "number" || k == "frame")
                            continue;
                        minData[k] = maxData[k] = avgData[k] = data[k];
                    }
                }
                else {
                    for (var k in data) {
                        if (typeof (data[k]) != "number" || k == "frame")
                            continue;
                        minData[k] = Math.min(minData[k], data[k]);
                        maxData[k] = Math.max(maxData[k], data[k]);
                        avgData[k] += data[k];
                    }
                }
                count++;
                if (Date.now() - lastUpdate >= 1000) {
                    var profile = {};
                    var t = 1 / count;
                    for (var k in minData)
                        profile[k] = [minData[k], maxData[k], avgData[k] * t];
                    sendMsgToDevtools("onProfileData", profile);
                    count = 0;
                    lastUpdate = Date.now();
                }
            });
        }
        getTextureStats() {
            function formatSize(size) {
                if (size < 1500)
                    return `${size} B`;
                if (size < 10000)
                    return `${(size / 1024).toFixed(2)} K`;
                if (size < 100000)
                    return `${(size / 1024).toFixed(1)} K`;
                if (size < 1200000)
                    return `${size >> 10} K`;
                else
                    return `${(size / (1024 * 1024)).toFixed(1)} M`;
            }
            var data = ez.Texture.profile();
            data.permanentTextures.forEach(t => {
                t.size = formatSize(t.size);
                t.age = "permanent";
            });
            data.activeTextueres.forEach(t => {
                t.size = formatSize(t.size);
            });
            sendMsgToDevtools("onTextureStats", data.permanentTextures.concat(data.activeTextueres), formatSize(data.totalMemory));
        }
        updateStage(idx) {
            if (!idx) {
                if (!this.elements)
                    this.getUITree();
                idx = [];
                for (let i = 0; i < this.elements.length; i++) {
                    if (this.elements[i].class.ClassName == "UIStage")
                        idx.push(i);
                }
            }
            if (!Array.isArray(idx))
                idx = [idx];
            function convNode(s) {
                var n = {};
                n.id = s.id;
            }
            var nodes = [];
            for (let i of idx) {
                let e = this.elements[i];
                if (e.class.ClassName != "UIStage") {
                    console.error("element is not UIStage", e);
                    continue;
                }
            }
        }
    }
    var inspector;
    var sendMsgToDevtools;
    function onMessage(args) {
        if (typeof args == "string") {
            if (!inspector[args]) {
                console.error("unkown message", args);
                return;
            }
            inspector[args].call(inspector);
        }
        else if (Array.isArray(args)) {
            var fn = args.shift();
            if (!inspector[fn]) {
                console.error("unkown message", args);
                return;
            }
            inspector[fn].apply(inspector, args);
        }
        else
            console.error("unkown message", args);
    }
    function installAsDevtools() {
        console.log("install inspector to devtools");
        sendMsgToDevtools = function (fn, ...args) {
            if (args.length > 0)
                window.postMessage({ source: 'ezgame-inspector', body: [fn, ...args] }, "*");
            else
                window.postMessage({ source: 'ezgame-inspector', body: fn }, "*");
        };
        window.onmessage = function (ev) {
            var data = ev.data;
            if (data.source == 'ezgame-devtools-proxy') {
                onMessage(data.body);
            }
        };
        window.postMessage({ source: 'ezgame-inspector', body: "connect" }, "*");
    }
    function installWithWebServer() {
        var l = window.location;
        console.log("install inspector to websocket");
        var ws = new WebSocket(`ws://${l.hostname}:${l.port}/__inspector`);
        ws.onmessage = function (e) {
            onMessage(JSON.parse(e.data));
        };
        ws.onopen = function () {
            ws.send("connect");
        };
        ws.onclose = function () {
            console.log('inspector disconnect');
        };
        sendMsgToDevtools = function (fn, ...args) {
            if (args.length > 0)
                ws.send(JSON.stringify([fn, ...args]));
            else
                ws.send(JSON.stringify(fn));
        };
    }
    function install() {
        inspector = new Inspector();
        if (window["__easygame_devtools"])
            installAsDevtools();
        else
            installWithWebServer();
    }
    inspector_1.install = install;
    function addTestcase(testcases) {
        for (var k in testcases) {
            var t = testcases[k];
            if (!t.Arguments) {
                var proto = t.toString();
                var args = proto.substring(proto.indexOf('(') + 1, proto.indexOf(')')).split(",");
                t.Arguments = args.map(arg => {
                    var t = arg.split("=");
                    var desc = { name: t[0] };
                    if (t.length > 1)
                        desc.default = t[1];
                    return desc;
                });
            }
        }
        allTestcase = testcases;
    }
    inspector_1.addTestcase = addTestcase;
})(inspector || (inspector = {}));

//# sourceMappingURL=inspector.js.map
