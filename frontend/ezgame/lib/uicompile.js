"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const xml = __importStar(require("./xml"));
const ui = __importStar(require("./uiclass"));
const conv_1 = require("./conv");
const fs = __importStar(require("fs"));
const glob = require("glob");
const stream_1 = require("./stream");
var compactMode = false;
var EnableFlags;
(function (EnableFlags) {
    EnableFlags[EnableFlags["Id"] = 1] = "Id";
    EnableFlags[EnableFlags["Expr"] = 2] = "Expr";
    EnableFlags[EnableFlags["ChildsProperty"] = 4] = "ChildsProperty";
})(EnableFlags || (EnableFlags = {}));
;
function writeTsCodeChildren(output, childs, moduleName) {
    function convExpression(s) {
        s = s.trim();
        if (/^\$\{.*\}$/.test(s)) {
            s = s.substring(2, s.length - 1);
            return `function(){return ${s};}`;
        }
        else
            return "";
    }
    function writeChildsProperty(childsProperty) {
        let childNames = Object.getOwnPropertyNames(childsProperty);
        if (childNames.length > 0) {
            output.write('childsProperty:{ ');
            for (let i = 0; i < childNames.length; i++) {
                let k2 = childNames[i];
                let c2 = childsProperty[k2];
                output.write(k2 + ":{ ");
                let r = [];
                for (let k3 in c2)
                    r.push(`${k3}: ${c2[k3]}`);
                output.write(r.join(", "));
                output.write(" },");
            }
            output.removeLastChars(",");
            output.write(' }, ');
        }
    }
    function writeAttributes(attributes, node, cls, flags) {
        let enableId = !!(flags & EnableFlags.Id);
        let enableExpr = !!(flags & EnableFlags.Expr);
        let childProp = !!(flags & EnableFlags.ChildsProperty);
        let childsProperty = {};
        if (childProp) {
            for (let i = 0; i < node.childs.length; i++) {
                let child = node.childs[i];
                let childCls = cls.namedChilds[child.name];
                if (!childCls) {
                    console.error(`${node.file.name}:${node.line} - error: '${child.name}' is not the child of ${cls.name}`);
                    continue;
                }
                childsProperty[child.name] = {};
                for (let k in child.attributes) {
                    let attr = child.attributes[k];
                    try {
                        childsProperty[child.name][k] = childCls.convProp2JS(k, attr.value);
                    }
                    catch (e) {
                        console.error(`${child.file.name}:${attr.valLine}:${attr.valColumn} - error: ${e.message}`);
                    }
                }
            }
        }
        for (let k in attributes) {
            let attr = attributes[k];
            if (k == "class")
                continue;
            if (k == "id") {
                if (enableId)
                    output.write(`${k}: "${attr.value}", `);
                else
                    console.error(`${node.file.name}:${attr.nameLine}:${attr.nameColumn} - error: can't has 'id' attribute.`);
            }
            else if (k.indexOf(".") < 0) {
                try {
                    let val = (enableExpr && convExpression(attr.value)) ? convExpression(attr.value) : cls.convProp2JS(k, attr.value);
                    output.write(`${k}:${val}, `);
                }
                catch (e) {
                    console.error(`${node.file.name}:${attr.valLine}:${attr.valColumn} - error: ${e.message}`);
                }
            }
            else {
                let args = k.split(".");
                if (args.length != 2) {
                    console.error(`${node.file.name}:${attr.nameLine}:${attr.nameColumn} - error: unknown property '${k}'`);
                    continue;
                }
                let id = args[0];
                let prop = args[1];
                let childCls = cls.namedChilds[id];
                if (cls.name == "ListView" && id == "item")
                    childCls = ui.UIClass.get(attributes["itemClass"].value, moduleName);
                if (!childCls) {
                    console.error(`${node.file.name}:${attr.valLine}:${attr.valColumn} - error: '${id}' is not the child of ${cls.name}`);
                }
                else {
                    if (!childsProperty[id])
                        childsProperty[id] = {};
                    try {
                        if (enableExpr && convExpression(attr.value))
                            childsProperty[id][prop] = convExpression(attr.value);
                        else
                            childsProperty[id][prop] = childCls.convProp2JS(prop, attr.value);
                    }
                    catch (e) {
                        console.error(`${node.file.name}:${attr.valLine}:${attr.valColumn} - error: ${e.message}`);
                    }
                }
            }
        }
        writeChildsProperty(childsProperty);
    }
    function createChildCompact(child) {
        let attributes = child.attributes;
        let clsName = child.name;
        let isArray = false;
        if (clsName == "array") {
            clsName = attributes["class"].value;
            if (!clsName) {
                console.error(`${child.file.name}:${child.line} - error: missing 'class' attribute!`);
                return;
            }
            isArray = true;
        }
        let childsProperty = {};
        var cls;
        try {
            cls = ui.UIClass.get(clsName, moduleName);
        }
        catch (e) {
            console.error(`${child.file.name}:${child.line} - error: ${e.message}`);
            return;
        }
        output.writeln(`[/*${cls.name}*/${cls.compactName},`);
        let elemProps = [];
        let props = {};
        for (let k in attributes) {
            var attr = attributes[k];
            if (k == "class")
                continue;
            if (k == "id")
                elemProps[ui.ElementProperty[k]] = `"${attr.value}"`;
            else if (k == "style")
                props[k] = `"${attr.value}"`;
            else if (k.indexOf(".") == -1) {
                try {
                    let val = cls.convProp2JS(k, attr.value);
                    if (ui.ElementProperty[k])
                        elemProps[ui.ElementProperty[k]] = val;
                    else
                        props[k] = val;
                }
                catch (e) {
                    console.error(`${child.file.name}:${attr.valLine}:${attr.valColumn} - error: ${e.message}`);
                }
            }
            else {
                let args = k.split(".");
                if (args.length != 2) {
                    console.error(`${child.file.name}:${attr.nameLine}:${attr.nameColumn} - error: invalid property ${k}`);
                    continue;
                }
                let childClass = cls.namedChilds[args[0]];
                if (cls.name == "ListView" && args[0] == "item")
                    childClass = ui.UIClass.get(attributes["itemClass"].value, moduleName);
                if (!childClass) {
                    console.error(`${child.file.name}:${attr.nameLine}:${attr.nameColumn} - error: '${args[0]}' is not the child of ${cls.name}`);
                    continue;
                }
                if (!childsProperty[args[0]])
                    childsProperty[args[0]] = {};
                try {
                    childsProperty[args[0]][args[1]] = childClass.convProp2JS(args[1], attr.value);
                }
                catch (e) {
                    console.error(`${child.file.name}:${attr.valLine}:${attr.valColumn} - error: ${e.message}`);
                }
            }
        }
        var propNames = Object.getOwnPropertyNames(props);
        if (propNames.length > 0) {
            output.write(` /*props:*/ {`);
            for (var i = 0; i < propNames.length; i++) {
                if (i > 0)
                    output.write(", ");
                var v = props[propNames[i]];
                if (typeof v !== "string")
                    v = JSON.stringify(v);
                output.write(`${propNames[i]}: ${v}`);
            }
            output.write("},");
        }
        else
            output.write(',');
        for (let i = 2; i < ui.ElementProperty._last; i++) {
            if (elemProps[i] !== undefined)
                output.write(` /*${ui.ElementProperty[i]}:*/ ${elemProps[i]}`);
            output.write(',');
        }
        if (Object.getOwnPropertyNames(childsProperty).length > 0) {
            output.write(" /*childsProperty*/{");
            for (let name in childsProperty) {
                let c2 = childsProperty[name];
                output.write(name + ": { ");
                var r = [];
                for (let k3 in c2)
                    r.push(`${k3}: ${c2[k3]}`);
                output.write(r.join(", "));
                output.write(" }, ");
            }
            output.removeLastChars(", ");
            output.write('},');
        }
        else
            output.write(',');
        let last = false;
        if (isArray) {
            output.write(` /*array*/[`);
            for (let j = 0; j < child.childs.length; j++) {
                let c = child.childs[j];
                if (c.name != "e") {
                    console.error(`${child.file.name}:${c.line} - error: the array node can only contain 'e' nodes.`);
                    continue;
                }
                attributes = c.attributes;
                output.writeln("	{ ");
                writeAttributes(c.attributes, c, cls);
                output.removeLastChars(", ");
                output.write(" },");
            }
            output.removeLastChars(",");
            output.writeln("]");
        }
        else if (child.childs.length > 0) {
            if (cls.name == "UIStage") {
                output.write(',/*childs*/ [');
                createStageChilds(child.childs);
                output.writeln("]");
            }
            else if (!cls.hasChildElements) {
                console.error(`${child.file.name}:${child.line} - error: '${cls.name}' can't contain child elements.`);
            }
            else {
                output.write(',/*childs*/ [');
                createChilds(child.childs);
                output.writeln("]");
            }
            last = true;
        }
        var line = output.lines[output.lines.length - 1];
        while (line[line.length - 1] == ',') {
            output.removeLastChars(',');
            line = output.lines[output.lines.length - 1];
        }
        output.write('],');
    }
    function createChild(child) {
        var attr = child.attributes;
        var clsName = child.name;
        var isArray = false;
        if (clsName == "array") {
            clsName = attr["class"] ? attr["class"].value : "";
            if (!clsName) {
                console.error(`${child.file.name}:${child.line} - error: missing 'class' attribute!`);
                return;
            }
            isArray = true;
        }
        var cls;
        try {
            cls = ui.UIClass.get(clsName, moduleName);
        }
        catch (e) {
            console.error(`${child.file.name}:${child.line} - error: ${e.message}`);
            return;
        }
        output.writeln(`{ class: "${cls.name}", `);
        writeAttributes(attr, child, cls, EnableFlags.Id);
        if (cls.typeName == "ListView" && child.value) {
            output.write('items:[ ');
            output.write(child.value);
            output.write('], ');
        }
        if (isArray) {
            output.write('_array:[');
            for (let j = 0; j < child.childs.length; j++) {
                let c = child.childs[j];
                if (c.name != "e") {
                    console.error(`${child.file.name}:${c.line} - error: the array node can only contain 'e' nodes.`);
                    continue;
                }
                attr = c.attributes;
                output.writeln("	{ ");
                writeAttributes(c.attributes, c, cls);
                output.removeLastChars(", ");
                output.write(" },");
            }
            output.removeLastChars(",");
            output.writeln("]");
        }
        else if (child.childs.length > 0) {
            if (cls.name == "UIStage") {
                output.write('_childs:[');
                createStageChilds(child.childs);
                output.writeln("]");
            }
            else if (!cls.hasChildElements) {
                console.error(`${child.file.name}:${child.line} - error: '${cls.name}' can't contain child elements.`);
            }
            else {
                output.write('_childs:[');
                createChilds(child.childs);
                output.writeln("]");
            }
        }
        output.removeLastChars(", ");
        output.write(' },');
    }
    function createStageChild(child) {
        var cls = ui.SpriteClasses[child.name];
        if (!cls) {
            console.error(`${child.file.name}:${child.line}:${child.startPos} - error: unknown sprite class '${child.name}'.`);
            return;
        }
        output.writeln(`{ type: "${child.name}"`);
        for (var k in child.attributes) {
            let attr = child.attributes[k];
            output.write(`, ${k}:`);
            var property = cls[k] || ui.BaseSpriteClass[k];
            if (property)
                output.write(`${property.conv(attr.value)}`);
            else {
                console.warn(`${attr.file.name}:${attr.valLine}:${attr.valColumn} - uicompile warn: unknown sprite property '${k}'`);
                output.write(`"${attr.value}"`);
            }
        }
        if (child.childs.length > 0) {
            if (child.name != "SubStage")
                console.error(`${child.file.name}:${child.line}:${child.startPos} - error: ${child.name} can't have childs.`);
            else {
                output.write(", childs:[");
                createStageChilds(child.childs);
                output.write("]");
            }
        }
        output.write(" },");
    }
    function createStageChilds(childs) {
        var ident = output.ident;
        output.ident = ident + 1;
        for (var j = 0; j < childs.length; j++) {
            var child = childs[j];
            createStageChild(child);
        }
        output.ident = ident;
    }
    function createChilds(childs) {
        var ident = output.ident;
        output.ident = ident + 1;
        for (var j = 0; j < childs.length; j++) {
            var child = childs[j];
            if (compactMode)
                createChildCompact(child);
            else
                createChild(child);
        }
        output.ident = ident;
    }
    createChilds(childs);
}
function getJsValue(type, value) {
    if (type == "string" && value != "null")
        return `"${value}"`;
    else
        return value;
}
function genClassCode(uiclass, output) {
    let baseclass = ui.UIClass.get(uiclass.baseclass, uiclass.module);
    let node = uiclass.node;
    let moduleName = uiclass.module;
    let namedChildTyps = uiclass._namedChilds;
    let childNames = Object.getOwnPropertyNames(namedChildTyps);
    var namedChildsTypeName;
    function convExpression(s) {
        s = s.trim();
        if (/^\$\{.*\}$/.test(s)) {
            s = s.substring(2, s.length - 1);
            return `function(){return ${s};}`;
        }
        else
            return "";
    }
    function writeChildsProperty(childsProperty) {
        let childNames = Object.getOwnPropertyNames(childsProperty);
        if (childNames.length > 0) {
            output.write('childsProperty:{ ');
            for (let i = 0; i < childNames.length; i++) {
                let k2 = childNames[i];
                let c2 = childsProperty[k2];
                output.write(k2 + ":{ ");
                let r = [];
                for (let k3 in c2)
                    r.push(`${k3}: ${c2[k3]}`);
                output.write(r.join(", "));
                output.write(" },");
            }
            output.removeLastChars(",");
            output.write(' }, ');
        }
    }
    function writeAttributes(attributes, node, cls, flags) {
        let enableId = !!(flags & EnableFlags.Id);
        let enableExpr = !!(flags & EnableFlags.Expr);
        let childProp = !!(flags & EnableFlags.ChildsProperty);
        let childsProperty = {};
        if (childProp) {
            for (let i = 0; i < node.childs.length; i++) {
                let child = node.childs[i];
                let childCls = cls.namedChilds[child.name];
                if (!childCls) {
                    console.error(`${node.file.name}:${node.line} - error: '${child.name}' is not the child of ${cls.name}`);
                    continue;
                }
                childsProperty[child.name] = {};
                for (let k in child.attributes) {
                    let attr = child.attributes[k];
                    try {
                        childsProperty[child.name][k] = childCls.convProp2JS(k, attr.value);
                    }
                    catch (e) {
                        console.error(`${child.file.name}:${attr.valLine}:${attr.valColumn} - error: ${e.message}`);
                    }
                }
            }
        }
        for (let k in attributes) {
            let attr = attributes[k];
            if (k == "class")
                continue;
            if (k == "id") {
                if (enableId)
                    output.write(`${k}: "${attr.value}", `);
                else
                    console.error(`${node.file.name}:${attr.nameLine}:${attr.nameColumn} - error: can't has 'id' attribute.`);
            }
            else if (k.indexOf(".") < 0) {
                try {
                    let val = (enableExpr && convExpression(attr.value)) ? convExpression(attr.value) : cls.convProp2JS(k, attr.value);
                    output.write(`${k}:${val}, `);
                }
                catch (e) {
                    console.error(`${node.file.name}:${attr.valLine}:${attr.valColumn} - error: ${e.message}`);
                }
            }
            else {
                let args = k.split(".");
                if (args.length != 2) {
                    console.error(`${node.file.name}:${attr.nameLine}:${attr.nameColumn} - error: unknown property '${k}'`);
                    continue;
                }
                let id = args[0];
                let prop = args[1];
                let childCls = cls.namedChilds[id];
                if (cls.name == "ListView" && id == "item")
                    childCls = ui.UIClass.get(attributes["itemClass"].value, moduleName);
                if (!childCls) {
                    console.error(`${node.file.name}:${attr.valLine}:${attr.valColumn} - error: '${id}' is not the child of ${cls.name}`);
                }
                else {
                    if (!childsProperty[id])
                        childsProperty[id] = {};
                    try {
                        if (enableExpr && convExpression(attr.value))
                            childsProperty[id][prop] = convExpression(attr.value);
                        else
                            childsProperty[id][prop] = childCls.convProp2JS(prop, attr.value);
                    }
                    catch (e) {
                        console.error(`${node.file.name}:${attr.valLine}:${attr.valColumn} - error: ${e.message}`);
                    }
                }
            }
        }
        writeChildsProperty(childsProperty);
    }
    if (node.attributes.namedChildsType && node.attributes.namedChildsType.value == "true") {
        let name = uiclass.className;
        if (name[0] == "_")
            name = name.substring(1);
        namedChildsTypeName = name + "NamedChilds";
    }
    if (namedChildsTypeName && childNames.length > 0) {
        output.writeln(`export interface ${namedChildsTypeName} { `);
        for (let j = 0; j < childNames.length; j++)
            output.writeln(`	${childNames[j]}: ${namedChildTyps[childNames[j]]},`);
        output.removeLastChars(",");
        output.writeln("}");
        output.writeln("");
    }
    output.writeln(`export class ${uiclass.className} extends ${baseclass.typeName} {`);
    output.writeln(`	static ClassName = "${uiclass.name}";`);
    output.writeln(`	static instance: ${uiclass.name};`);
    if (node.namedChilds.styles && node.namedChilds.styles.childs.length > 0) {
        var styleNodes = node.namedChilds.styles.childs;
        output.writeln("	static Styles = {");
        for (let j = 0; j < styleNodes.length; j++) {
            let style = styleNodes[j];
            let props = style.attributes;
            output.writeln(`		${style.name}:{ `);
            writeAttributes(props, style, uiclass, EnableFlags.ChildsProperty);
            output.removeLastChars(", ");
            output.write(` },`);
        }
        output.removeLastChars(",");
        output.writeln("	};");
    }
    if (uiclass.properties.length > 0) {
        let props = uiclass.properties;
        output.writeln("	static Properties: ui.PropDefine[] = [");
        for (let j = 0; j < props.length; j++) {
            let prop = props[j];
            output.writeln(`		{ name: "${prop.name}", type: "${prop.type}"`);
            if (prop.default)
                output.write(`, default: ${getJsValue(prop.type, prop.default)}`);
            if (prop.converter)
                output.write(`, converter: ${prop.converter}`);
            if (prop.name == "style")
                output.write(`, customProperty: true`);
            output.write(' },');
        }
        output.removeLastChars(",");
        output.writeln("	];");
    }
    let States = node.namedChilds.states;
    if (States) {
        let states = States.childs;
        output.writeln(`	static States = {`);
        for (let i = 0; i < states.length; i++) {
            let state = states[i];
            let props = {};
            for (let k in state.attributes)
                if (k !== "onEnter" && k !== "onLeave")
                    props[k] = state.attributes[k];
            output.writeln(`		${state.name}: { `);
            if (Object.getOwnPropertyNames(props).length > 0) {
                output.write(`props: { `);
                writeAttributes(props, state, uiclass, EnableFlags.Expr);
                output.removeLastChars(", ");
                output.write(` }, `);
            }
            else if (state.childs.length > 0) {
                output.write(`props: { `);
                let childsProperty = {};
                for (let j = 0; j < state.childs.length; j++) {
                    let e = state.childs[j];
                    let target = e.attributes.target ? e.attributes.target.value : "";
                    let targetProp = e.attributes.targetProp ? e.attributes.targetProp.value : "";
                    let value = "";
                    if (e.attributes.src && e.attributes.srcProp) {
                        let src = e.attributes.src.value;
                        if (src != "this")
                            src = `this.namedChilds.${src}`;
                        value = `function(){return ${src}.${e.attributes.srcProp.value}}`;
                    }
                    if (target == "this") {
                        if (!value && e.attributes.value) {
                            let v = e.attributes.value;
                            try {
                                value = uiclass.convProp2JS(targetProp, v.value);
                            }
                            catch (ex) {
                                console.error(`${node.file.name}:${v.valLine}:${v.valColumn} - error: ${ex.message}`);
                            }
                        }
                        output.write(`${targetProp}: ${value}, `);
                    }
                    else {
                        if (!childsProperty[target])
                            childsProperty[target] = {};
                        let childCls = uiclass.namedChilds[target];
                        if (childCls) {
                            let v = e.attributes.value;
                            try {
                                if (!value && v)
                                    value = childCls.convProp2JS(targetProp, v.value);
                                childsProperty[target][targetProp] = value;
                            }
                            catch (e) {
                                if (v)
                                    console.error(`${node.file.name}:${v.valLine}:${v.valColumn} - error: ${e.message}`);
                            }
                        }
                        else
                            console.error(`${node.file.name}:${node.line} - error: '${target}' is not the child of ${uiclass.name}`);
                    }
                }
                writeChildsProperty(childsProperty);
                output.removeLastChars(", ");
                output.write(` }, `);
            }
            if (state.attributes.onEnter)
                output.write(`onEnter: ${state.attributes.onEnter.value}, `);
            if (state.attributes.onLeave)
                output.write(`onLeave: ${state.attributes.onLeave.value}, `);
            output.removeLastChars(", ");
            output.write(` },`);
        }
        output.removeLastChars(",");
        output.writeln(`	};`);
    }
    if (node.namedChilds.children) {
        output.writeln(`	private static _childs = [`);
        output.ident++;
        writeTsCodeChildren(output, node.namedChilds.children.childs, uiclass.module);
        output.removeLastChars(",");
        output.ident--;
        output.writeln(`	];`);
    }
    output.writeln(`	constructor(parent: ui.Container, template?:ui.Template){`);
    output.writeln(`		super(parent);`);
	if (uiclass.properties.length > 0)
		output.writeln(`		this._init(${uiclass.className});`);
        //output.writeln(`		this._initProperties(${uiclass.className}.Properties);`);
    if (node.attributes.template)
        output.writeln(`		template = template || Templates.${node.attributes.template.value};`);
    output.writeln(`		if(template){`);
    output.writeln(`			this._createChilds(template.childs)`);
    output.writeln(`			template.init(this);`);
    output.writeln(`		}`);
    if (node.namedChilds.children) {
        output.writeln(`		else`);
        output.writeln(`			this._createChilds(${uiclass.className}._childs);`);
    }
    if (childNames.length > 0)
        output.writeln(`		const n = this.namedChilds;`);
    if (States)
        output.writeln(`		this._initStates("${States.attributes.default ? States.attributes.default.value : ""}", ${uiclass.className}.States);`);
    function writeDataBinder(src, srcProp, target, targetProp, is2way, item, converter) {
        if (!src || src == "this") {
            src = 'this';
            if (!uiclass.hasProperty(srcProp))
                console.warn(`${item.file.name}:${item.line} - warn: '${uiclass.className}' has no '${srcProp}' property.`);
        }
        else {
            let tCls = uiclass.namedChilds[src];
            if (!tCls)
                console.warn(`${item.file.name}:${item.line} - warn: child '${src}' is not find.`);
            else if (!tCls.hasProperty(srcProp))
                console.warn(`${item.file.name}:${item.line} - warn: child '${src}' has no '${srcProp}' property.`);
            src = "n." + src;
        }
        if (target != "this") {
            let tCls = uiclass.namedChilds[target];
            if (!tCls)
                console.warn(`${item.file.name}:${item.line} - warn: child '${target}' is not find.`);
            else if (!tCls.hasProperty(targetProp))
                console.warn(`${item.file.name}:${item.line} - warn: child '${target}' has no '${targetProp}' property.`);
            target = "n." + target;
        }
        if (is2way) {
            output.writeln(`		${src}.bind2way("${srcProp}", ${target}, "${targetProp}");`);
        }
        else {
            output.writeln(`		${src}.bind("${srcProp}", ${target}, "${targetProp}"`);
            if (converter)
                output.write(`, ${converter});`);
            else
                output.write(`);`);
        }
    }
    if (node.namedChilds.databinder) {
        let items = node.namedChilds.databinder.childs;
        for (let j = 0; j < items.length; j++) {
            let item = items[j];
            if (item.name !== "e") {
                console.error(`${item.file.name}:${item.line} - error: DataBinder child nodes must be 'e' Tag.`);
                continue;
            }
            let converter = item.attributes.converter ? item.attributes.converter.value : "";
            let is2way = item.attributes.is2way && item.attributes.is2way.value.toLowerCase() == "true";
            if (is2way && converter)
                console.warn(`${item.file.name}:${item.line} - warn: 2 way bind is not support converter.`);
            if (item.attributes.target && item.attributes.prop) {
                let src = item.attributes.src ? item.attributes.src.value : "";
                let prop = item.attributes.prop.value;
                let target = item.attributes.target.value;
                let targetProp = item.attributes.targetProp ? item.attributes.targetProp.value : "";
                writeDataBinder(src, prop, target, targetProp || prop, is2way, item, converter);
            }
            else {
                for (let target in item.attributes) {
                    if (target == "converter" || target == "is2way")
                        continue;
                    let targetInfo = target.split('.');
                    let src = item.attributes[target].value;
                    let srcInfo = src.split('.');
                    if (srcInfo.length == 1) {
                        srcInfo = ["this", srcInfo[0]];
                    }
                    if (targetInfo.length != 2) {
                        console.warn(`${item.file.name}:${item.line} - warn: target '${target}' is illegal.`);
                        continue;
                    }
                    if (srcInfo.length != 2) {
                        console.warn(`${item.file.name}:${item.line} - warn: source '${src}' is illegal.`);
                        continue;
                    }
                    writeDataBinder(srcInfo[0], srcInfo[1], targetInfo[0], targetInfo[1], is2way, item, converter);
                }
            }
        }
    }
    let classProps = {};
    for (let k in node.attributes) {
        if (k == "baseclass" || k == 'customExt' || k == 'namedChildsType' || k == 'template')
            continue;
        classProps[k] = node.attributes[k];
    }
    if (Object.getOwnPropertyNames(classProps).length > 0) {
        for (let k in classProps) {
            let prop = classProps[k];
            try {
                output.writeln(`		this.${k} = ${uiclass.convProp2JS(k, prop.value)};`);
            }
            catch (e) {
                console.error(`${node.file.name}:${prop.valLine}:${prop.valColumn} - error: ${e.message}`);
            }
        }
    }
    if (node.namedChilds.hasOwnProperty("constructor"))
        output.writeln(node.namedChilds.constructor.value);
    output.writeln(`	}`);
    if (uiclass.properties.length > 0) {
        for (var j = 0; j < uiclass.properties.length; j++) {
            var prop = uiclass.properties[j];
            if (prop.styles)
                output.writeln(`	public ${prop.name}:${prop.styles.join("|")};`);
            else
                output.writeln(`	public ${prop.name}:${prop.type};`);
        }
    }
    if (childNames.length > 0) {
        if (namedChildsTypeName) {
            output.writeln(`	public get namedChilds():${namedChildsTypeName} {`);
            output.writeln(`		return <any>this._namedChilds;`);
            output.writeln(`	}`);
        }
        else {
            output.writeln(`	public get namedChilds(): { `);
            for (let j = 0; j < childNames.length; j++)
                output.writeln(`		${childNames[j]}: ${namedChildTyps[childNames[j]]},`);
            output.removeLastChars(",");
            output.write(" }");
            output.writeln("	{ return <any>this._namedChilds; }");
        }
    }
    if (node.namedChilds.methods)
        output.writeln(node.namedChilds.methods.value);
    output.writeln("}");
    if (node.attributes.customExt && node.attributes.customExt.value.toLowerCase() == "true") {
        output.writeln(`ez.initCall(() => { ui.initUIClass(${uiclass.name}, ${baseclass.typeName}) });`);
    }
    else
        output.writeln(`ui.initUIClass(${uiclass.className}, ${baseclass.typeName});`);
    if (node.namedChilds.eventhandler) {
        var events = [];
        if (!Array.isArray(node.namedChilds.eventhandler))
            events.push(node.namedChilds.eventhandler);
        else
            events = node.namedChilds.eventhandler;
        for (var j = 0; j < events.length; j++) {
            var event = events[j];
            if (event.attributes.args) {
                output.writeln(`${event.value}(${uiclass.className}, ${event.attributes.args.value});`);
            }
            else
                output.writeln(`${event.value}(${uiclass.className});`);
        }
    }
    output.writeln("");
}
function genTemplateCode(template, output) {
    output.writeln(`	${template.name}:{
			name: "${template.module}.${template.name}",
			init: function(control) {
				
			},
			childs:[`);
    output.ident = 3;
    writeTsCodeChildren(output, template.node.namedChilds.children.childs, template.module);
    output.ident = 1;
    output.writeln(`		]
		},`);
}
function compile(inputs, options) {
    return new Promise((resolve, reject) => {
        compactMode = options.compact;
        var outputFile = options.output;
        ui.UIClass.clear();
        for (var idx = 0; idx < options.imports.length; idx++) {
            let uidef = options.imports[idx];
            if (uidef.substring(uidef.length - 5) !== ".json")
                uidef = uidef + ".d.json";
            if (fs.existsSync(uidef))
                ui.loadUIClass(uidef);
            else {
                console.error(`uicompile error: not found '${uidef}'`);
                reject();
            }
        }
        if (inputs.length == 0) {
            console.error("uicompile error: missing input files");
            reject();
        }
        conv_1.conv.compactMode = compactMode;
        var inputFiles = [];
        for (let path of inputs)
            inputFiles = inputFiles.concat(glob.sync(path));
        var textStyles = [];
        var templates = {};
        for (let i = 0; i < inputFiles.length; i++) {
            console.log(`uicompile: load ${inputFiles[i].replace(/\//g, '\\')}`);
            let root = xml.readFile(inputFiles[i]);
            let module = root.attributes.module.value;
            if (root.namedChilds.textstyles) {
                textStyles = textStyles.concat(root.namedChilds.textstyles.childs);
            }
            var nodes = [].concat(...root.childs.filter(c => c.name.toLowerCase() == "templates").map(c => c.childs));
            console.log(`templates: ${nodes.length}`);
            if (nodes.length > 0) {
                var t = templates[module];
                if (!t)
                    templates[module] = ui.loadUITemplates(module, nodes);
                else
                    t = t.concat(ui.loadUITemplates(module, nodes));
            }
            if (!ui.loadUIClassFromXml(root))
                return false;
        }
        var modules = [];
        var exportClasses = [];
        for (var k in ui.UIClass.all) {
            var cls = ui.UIClass.all[k];
            if (cls.module && modules.indexOf(cls.module) < 0)
                modules.push(cls.module);
            ui.UIClass.all[k].init();
            if (cls.node)
                exportClasses.push(cls);
        }
        ui.UIClass.textStyles = {};
        textStyles.forEach(v => ui.UIClass.textStyles[v.name] = v);
        var output = new stream_1.StreamWriter();
        for (let i = 0; i < modules.length; i++) {
            output.writeln(`namespace ${modules[i]}{`);
            output.ident = 1;
            output.writeln("import ui = ez.ui;");
            output.writeln("");
            if (i == 0 && textStyles.length > 0) {
                output.writeln(`ui.registerTextStyle([`);
                for (let i = 0; i < textStyles.length; i++) {
                    let item = textStyles[i];
                    output.writeln(`	{`);
                    output.write(` id:"${item.name}"`);
                    for (var k in item.attributes) {
                        let attr = item.attributes[k];
                        let v = attr.value;
                        if (k == "format") {
                            v = conv_1.conv.TextFormat(attr.value);
                        }
                        else if (k == "align") {
                            v = conv_1.conv.AlignMode(attr.value);
                        }
                        else if (k !== "strokeWidth" && k !== "lineHeight" && k !== "gradient") {
                            v = '"' + v + '"';
                        }
                        output.write(`, ${k}:${v}`);
                    }
                    output.write(" },");
                }
                output.writeln(`]);`);
            }
            output.writeln("");
            var uiTemplates = templates[modules[i]];
            if (uiTemplates) {
                output.writeln("var Templates = {");
                for (var t of uiTemplates)
                    genTemplateCode(t, output);
                output.writeln("}");
                output.writeln("ui.registerTemplates(Templates);");
            }
            exportClasses.filter(c => c.module == modules[i]).forEach(c => genClassCode(c, output));
            if (compactMode) {
                let arr = [];
                for (let k in conv_1.ResDict)
                    arr[conv_1.ResDict[k]] = '"' + k + '"';
                output.lines.splice(2, 0, `	var UI = [${ui.UIClass.allTypes.map(c => `"${c}"`).join(", ")}];`, `	var RES = [${arr.join()}];`);
            }
            output.ident = 0;
            output.writeln(`}`);
            output.writeln("");
        }
        console.log("uicompile: compile success!");
        fs.writeFileSync(outputFile, output.getAll(), { encoding: "utf-8" });
        resolve();
    });
}
exports.compile = compile;
