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
const sax = __importStar(require("./sax"));
var iconv = require('iconv-lite');
class Node {
    constructor() {
        this.childs = [];
        this.namedChilds = {};
    }
}
exports.Node = Node;
function readXml(fn, data) {
    var fileInfo = { name: fn, content: data };
    var saxparser = sax.parser(true);
    var rootobject = new Node();
    var object = rootobject;
    var error = null;
    saxparser.onerror = function (err) {
        err.message = `${fn}:${saxparser.line + 1}:${saxparser.column} - error: ${err.message}`;
        error = err;
    };
    saxparser.onopentag = function (node) {
        var n = new Node();
        n.line = saxparser.line + 1;
        n.column = saxparser.column + 1;
        n.position = saxparser.position;
        while (fileInfo.content[saxparser.startTagPosition] != "<")
            saxparser.startTagPosition--;
        n.startPos = saxparser.startTagPosition;
        n.endPos = saxparser.position;
        n.attributes = node.attrs || {};
        n.file = fileInfo;
        n.name = node.name;
        n.parent = object;
        object.childs.push(n);
        var name = node.name.toLowerCase();
        if (object.namedChilds[name]) {
            var o = object.namedChilds[name];
            if (Array.isArray(o))
                o.push(n);
            else
                object.namedChilds[name] = [o, n];
        }
        else
            object.namedChilds[name] = n;
        object = n;
    };
    saxparser.oncdata = function (cdata) {
        object.value = cdata;
    };
    saxparser.ontext = function (text) {
        if (!object.value)
            object.value = text;
    };
    saxparser.onattribute = function (attr) {
        var node = saxparser.tag;
        if (!node.attrs)
            node.attrs = {};
        var a = node.attrs[attr.name] = {
            name: attr.name,
            value: attr.value,
            nameStart: saxparser.attrNameStart - 1,
            nameLine: saxparser.attrNameLine + 1,
            nameColumn: saxparser.attrNameColumn,
            valStart: saxparser.attrValStart,
            valEnd: saxparser.attrValEnd - 1,
            valLine: saxparser.attrValLine + 1,
            valColumn: saxparser.attrValColumn,
            file: fileInfo
        };
    };
    saxparser.onclosetag = function (node) {
        object.endPos = saxparser.position;
        object = object.parent;
    };
    try {
        saxparser.write(data).close();
    }
    catch (e) {
    }
    if (error)
        console.error(`${fn} - error: xml parse error. ${error}`);
    return rootobject.childs[0];
}
exports.readXml = readXml;
function readFile(fn) {
    var data = fs.readFileSync(fn, "utf-8");
    var idx = data.indexOf('encoding="');
    if (idx > 0) {
        idx += 'encoding="'.length;
        var encoding = data.substring(idx, data.indexOf('"', idx));
        if (encoding != "utf-8") {
            data = iconv.decode(fs.readFileSync(fn), encoding);
        }
    }
    return readXml(fn, data);
}
exports.readFile = readFile;
