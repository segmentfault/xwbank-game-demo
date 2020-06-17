"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StreamWriter {
    constructor() {
        this._identStr = "";
        this._ident = 0;
        this.lines = [];
    }
    get ident() {
        return this._ident;
    }
    set ident(v) {
        this._ident = v;
        this._identStr = "";
        for (var i = 0; i < v; i++)
            this._identStr += "	";
    }
    write(text) {
        if (this.lines.length == 0)
            this.lines.push("");
        this.lines[this.lines.length - 1] = this.lines[this.lines.length - 1] + text;
    }
    removeLastChars(c) {
        var line = this.lines[this.lines.length - 1];
        if (line.length > c.length && line.substring(line.length - c.length) == c)
            this.lines[this.lines.length - 1] = line.substr(0, line.length - c.length);
    }
    writeln(text) {
        this.lines.push(this._identStr + text);
    }
    getAll() {
        return this.lines.join("\r\n");
    }
}
exports.StreamWriter = StreamWriter;
