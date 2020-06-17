"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const conv_1 = require("./conv");
const SpriteDef = __importStar(require("./sprite.d"));
exports.BaseSpriteClass = getSpritePropDesc(SpriteDef.sprite);
exports.SpriteClasses = {};
function getSpritePropDesc(def) {
    let properties = {};
    for (const p in def) {
        const c = def[p][0];
        properties[p] = {
            desc: def[p][1],
            type: c,
            conv: typeof (c) == "function" ? c : conv_1.conv[c]
        };
    }
    return properties;
}
for (const k in SpriteDef.subclass) {
    exports.SpriteClasses[k] = getSpritePropDesc(SpriteDef.subclass[k]);
}
var ElementProperty;
(function (ElementProperty) {
    ElementProperty[ElementProperty["class"] = 0] = "class";
    ElementProperty[ElementProperty["props"] = 1] = "props";
    ElementProperty[ElementProperty["id"] = 2] = "id";
    ElementProperty[ElementProperty["left"] = 3] = "left";
    ElementProperty[ElementProperty["top"] = 4] = "top";
    ElementProperty[ElementProperty["right"] = 5] = "right";
    ElementProperty[ElementProperty["bottom"] = 6] = "bottom";
    ElementProperty[ElementProperty["width"] = 7] = "width";
    ElementProperty[ElementProperty["height"] = 8] = "height";
    ElementProperty[ElementProperty["x"] = 9] = "x";
    ElementProperty[ElementProperty["y"] = 10] = "y";
    ElementProperty[ElementProperty["opacity"] = 11] = "opacity";
    ElementProperty[ElementProperty["visible"] = 12] = "visible";
    ElementProperty[ElementProperty["scale"] = 13] = "scale";
    ElementProperty[ElementProperty["angle"] = 14] = "angle";
    ElementProperty[ElementProperty["anchorX"] = 15] = "anchorX";
    ElementProperty[ElementProperty["anchorY"] = 16] = "anchorY";
    ElementProperty[ElementProperty["zIndex"] = 17] = "zIndex";
    ElementProperty[ElementProperty["touchable"] = 18] = "touchable";
    ElementProperty[ElementProperty["_last"] = 19] = "_last";
})(ElementProperty = exports.ElementProperty || (exports.ElementProperty = {}));
;
function getNamedChilds(namedChilds, module, node) {
    var results = {};
    for (let k in namedChilds) {
        try {
            let type = namedChilds[k];
            let array = false;
            if (type.substring(type.length - 2) == "[]") {
                array = true;
                type = type.substring(0, type.length - 2);
            }
            let cls = UIClass.get(type, module);
            if (cls && !array)
                results[k] = cls;
            namedChilds[k] = cls.typeName + (array ? "[]" : "");
        }
        catch (e) {
            if (node)
                console.error(`${node.file.name}:${node.line} - error: ${e.message}`);
            else
                console.error(`error: ${e.message}`);
        }
    }
    return results;
}
class UIClass {
    constructor(meta) {
        if (!meta.name)
            throw new Error(`missing class name!`);
        this.name = meta.name;
        this.typeName = meta.typeName;
        this.properties = meta.properties;
        this.className = meta.className;
        this.hasChildElements = !!meta.hasChildElements;
        this._namedChilds = meta.namedChilds;
        this.namedChilds = {};
        this.baseclass = meta.baseclass;
        var name = this.name;
        if (UIClass.has(name)) {
            console.error(`the ui class '${meta.name}' name conflict!`);
        }
        UIClass.all[name] = this;
    }
    static clear() {
        UIClass.allTypes = [];
        UIClass.all = {};
    }
    static get(name, moduleName) {
        if (moduleName) {
            let n = `${moduleName}.${name}`;
            if (UIClass.all[n])
                return UIClass.all[n];
        }
        if (UIClass.all[name])
            return UIClass.all[name];
        throw new Error(`ui class ${name} is not exist!`);
    }
    static has(name) {
        return !!UIClass.all[name];
    }
    get compactName() {
        var idx = UIClass.allTypes.indexOf(this.name);
        if (idx < 0) {
            idx = UIClass.allTypes.length;
            UIClass.allTypes.push(this.name);
        }
        return `UI[${idx}]`;
    }
    remove() {
        delete UIClass.all[this.name];
    }
    hasProperty(propName) {
        return !!this.allProps[propName];
    }
    convProp2JS(propName, propVal) {
        if (propName == "style")
            return `"${propVal}"`;
        var p = this.allProps[propName];
        if (!p)
            throw new Error(`'${this.name}' has no property '${propName}'`);
        return p.convertToJS(propVal);
    }
    init() {
        function genConvJS(prop) {
            if (prop.validate) {
                prop.convertToJS = conv_1.conv[prop.validate];
            }
            prop.enums = conv_1.Enums[prop.type];
            if (!prop.convertToJS) {
                switch (prop.type) {
                    case "string":
                        prop.convertToJS = conv_1.conv.string;
                        break;
                    case "number":
                        prop.convertToJS = conv_1.conv.float;
                        break;
                    case "object":
                        prop.convertToJS = conv_1.conv.Object;
                        break;
                    case "boolean":
                        prop.convertToJS = conv_1.conv.boolean;
                        break;
                    default:
                        prop.convertToJS = conv_1.conv[prop.type] || conv_1.conv.string;
                        break;
                }
            }
        }
        if (this.allProps)
            return;
        this.allProps = {};
        var baseclass;
        if (this.baseclass) {
            try {
                baseclass = UIClass.get(this.baseclass, this.module);
                baseclass.init();
            }
            catch (e) {
                if (this.node)
                    console.error(`${this.node.file.name}:${this.node.line} - error: ${e.message}`);
                else
                    console.error(`error: ${e.message}`);
            }
        }
        if (baseclass) {
            for (var k in baseclass.allProps)
                this.allProps[k] = baseclass.allProps[k];
        }
        for (let i = 0; i < this.properties.length; i++) {
            var p = this.properties[i];
            genConvJS(p);
            this.allProps[p.name] = p;
        }
        if (this._namedChilds) {
            this.namedChilds = getNamedChilds(this._namedChilds, this.module, this.node);
        }
    }
}
exports.UIClass = UIClass;
UIClass.allTypes = [];
UIClass.all = {};
function loadUIClass(fn) {
    console.debug(`load ${fn}`);
    var data = fs.readFileSync(fn, "utf-8");
    var meta = JSON.parse(data);
    for (let i = 0; i < meta.length; i++)
        new UIClass(meta[i]);
}
exports.loadUIClass = loadUIClass;
function findChilds(childs, namedChilds) {
    function find(childs) {
        for (var i = 0; i < childs.length; i++) {
            var child = childs[i];
            var id = child.attributes["id"];
            if (id) {
                if (namedChilds[id.value])
                    console.error(`${child.file.name}:${id.valLine}:${id.valColumn} - error: id name conflict!`);
                if (child.name == "array") {
                    if (!child.attributes["class"]) {
                        console.error(`${child.file.name}:${child.line}:${child.column} - error: array is missing 'class' attribute!`);
                        continue;
                    }
                    namedChilds[id.value] = child.attributes["class"].value + "[]";
                }
                else
                    namedChilds[id.value] = child.name;
            }
            if (child.name != "UIStage")
                find(child.childs);
        }
    }
    find(childs);
}
class UITemplate {
    constructor(module, node) {
        this.module = module;
        this.node = node;
        this.name = node.name;
        this._namedChilds = {};
        findChilds(node.namedChilds.children, this._namedChilds);
    }
}
exports.UITemplate = UITemplate;
function loadUITemplates(module, templates) {
    var results = [];
    for (let i = 0; i < templates.length; i++) {
        var template = templates[i];
        if (!template.namedChilds.children) {
            console.error(`${template.file.name}:${template.line} - error: template '${template.name}' is missing children!`);
            continue;
        }
        results.push(new UITemplate(module, template));
    }
    return results;
}
exports.loadUITemplates = loadUITemplates;
function loadUIClassFromXml(root) {
    var module = root.attributes.module ? root.attributes.module.value : "";
    var namedChilds = {};
    var classes = [];
    for (let i = 0; i < root.childs.length; i++) {
        namedChilds = {};
        var node = root.childs[i];
        if (node.name.toLowerCase() == "textstyles" || node.name.toLowerCase() == "script" || node.name.toLowerCase() == "template")
            continue;
        var name = `${module}.${node.name}`;
        var properties = [];
        var baseclass = node.attributes.baseclass;
        var hasChildElements = !!node.attributes.childsContainer;
        var className = node.name;
        if (!baseclass) {
            baseclass = { value: "Container" };
        }
        if (node.attributes.customExt && node.attributes.customExt.value.toLowerCase() == "true")
            className = "_" + className;
        if (node.namedChilds.properties) {
            var props = node.namedChilds.properties.childs;
            for (let j = 0; j < props.length; j++) {
                var prop = props[j];
                if (!prop.attributes.name) {
                    console.error(`${root.file.name}:${prop.line} - error: property name is mssing.`);
                    continue;
                }
                if (!prop.attributes.type) {
                    console.error(`${root.file.name}:${prop.line} - error: property type is mssing.`);
                    continue;
                }
                var p = { name: prop.attributes.name.value, type: prop.attributes.type.value };
                if (prop.attributes.comment)
                    p.comment = prop.attributes.comment.value;
                if (prop.attributes.validate)
                    p.validate = prop.attributes.validate.value;
                if (prop.attributes.converter)
                    p.converter = prop.attributes.converter.value;
                if (prop.attributes.default)
                    p.default = prop.attributes.default.value;
                properties.push(p);
            }
        }
        if (node.namedChilds.styles && node.namedChilds.styles.childs.length > 0) {
            let styles = node.namedChilds.styles.childs.map(c => `"${c.name}"`);
            styles.push("string");
            properties.push({
                name: "style",
                type: "string",
                styles: styles,
                convertToJS: function (s) { return `"${s}"`; }
            });
        }
        if (node.namedChilds.children)
            findChilds(node.namedChilds.children.childs, namedChilds);
        var ui = new UIClass({
            name: name,
            typeName: name,
            className: className,
            baseclass: baseclass.value,
            namedChilds: namedChilds,
            hasChildElements: hasChildElements,
            properties: properties
        });
        ui.node = node;
        ui.module = module;
        classes.push(ui);
    }
    return classes;
}
exports.loadUIClassFromXml = loadUIClassFromXml;
