"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResDict = {};
var tbl = "0123456789ABCDEFGHIJKLMNOPQRSTUVWX";
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
function convRes(s) {
    if (!conv.compactMode)
        return `"${s}"`;
    s = s.trim();
    if (s.length == 0)
        return '""';
    let r = s;
    s = "R:" + nameHash(s);
    if (exports.ResDict[s] === undefined) {
        var idx = Object.getOwnPropertyNames(exports.ResDict).length;
        exports.ResDict[s] = idx;
    }
    return `/*${r}*/ RES[${exports.ResDict[s]}]`;
}
var TextFormat;
(function (TextFormat) {
    TextFormat[TextFormat["SingleLine"] = 0] = "SingleLine";
    TextFormat[TextFormat["WordBreak"] = 1] = "WordBreak";
    TextFormat[TextFormat["MultiLine"] = 2] = "MultiLine";
    TextFormat[TextFormat["Ellipse"] = 4] = "Ellipse";
    TextFormat[TextFormat["Shrink"] = 8] = "Shrink";
    TextFormat[TextFormat["RichText"] = 16] = "RichText";
})(TextFormat || (TextFormat = {}));
var AlignMode;
(function (AlignMode) {
    AlignMode[AlignMode["Left"] = 0] = "Left";
    AlignMode[AlignMode["Center"] = 1] = "Center";
    AlignMode[AlignMode["Right"] = 2] = "Right";
    AlignMode[AlignMode["Top"] = 0] = "Top";
    AlignMode[AlignMode["VCenter"] = 4] = "VCenter";
    AlignMode[AlignMode["Bottom"] = 8] = "Bottom";
})(AlignMode || (AlignMode = {}));
var LayoutMode;
(function (LayoutMode) {
    LayoutMode[LayoutMode["Horizontal"] = 0] = "Horizontal";
    LayoutMode[LayoutMode["Vertical"] = 1] = "Vertical";
    LayoutMode[LayoutMode["Wrap"] = 2] = "Wrap";
})(LayoutMode || (LayoutMode = {}));
var ScrollMode;
(function (ScrollMode) {
    ScrollMode[ScrollMode["Horizontal"] = 1] = "Horizontal";
    ScrollMode[ScrollMode["Vertical"] = 2] = "Vertical";
    ScrollMode[ScrollMode["All"] = 3] = "All";
})(ScrollMode || (ScrollMode = {}));
var BlendMode;
(function (BlendMode) {
    BlendMode[BlendMode["Normal"] = 0] = "Normal";
    BlendMode[BlendMode["Add"] = 1] = "Add";
    BlendMode[BlendMode["Copy"] = 2] = "Copy";
    BlendMode[BlendMode["Subtract"] = 3] = "Subtract";
    BlendMode[BlendMode["Multiply"] = 4] = "Multiply";
    BlendMode[BlendMode["Screen"] = 5] = "Screen";
})(BlendMode || (BlendMode = {}));
var SlideMode;
(function (SlideMode) {
    SlideMode[SlideMode["Horizental"] = 0] = "Horizental";
    SlideMode[SlideMode["Vertical"] = 1] = "Vertical";
})(SlideMode || (SlideMode = {}));
exports.Enums = {
    TextFormat: TextFormat,
    SlideMode: SlideMode,
    BlendMode: BlendMode,
    ScrollMode: ScrollMode,
    LayoutMode: LayoutMode,
    AlignMode: AlignMode
};
function getEnum(e, s) {
    if (!e.hasOwnProperty(s))
        throw new Error(`invalid enum value: '${s}'`);
    if (typeof e[s] == "number")
        return e[s];
    else
        return e[e[s]];
}
class conv {
    static dimension(s) {
        if (/^(-?\d+)(\.\d+)?$/.test(s))
            return s;
        else if (/^(-?\d+)(\.\d+)?%$/.test(s))
            return `"${s}"`;
        else
            throw new Error(`invalid dimension value: '${s}'`);
    }
    static opacity(s) {
        if (!/^\d+(\.\d+)?$/.test(s))
            throw new Error(`invalid opacity value: '${s}'`);
        var p = parseFloat(s);
        if (p < 0 || p > 1)
            throw new Error(`opacity value '${s}' out of range. should be [0, 1]`);
        return s;
    }
    static scale(s) {
        if (!/^\d+(\.\d+)?$/.test(s))
            throw new Error(`invalid scale value: '${s}'`);
        return s;
    }
    static angle(s) {
        if (!/^(-?\d+)(\.\d+)?$/.test(s))
            throw new Error(`invalid angle value: '${s}'`);
        var p = parseFloat(s);
        if (p < -360 || p > 360)
            throw new Error(`angle value '${s}' out of range. should be [-360, 360]`);
        return s;
    }
    static float(s) {
        if (!/^(-?\d+)(\.\d+)?$/.test(s))
            throw new Error(`invalid value: '${s}'`);
        return s;
    }
    static int(s) {
        if (!/^-?\d+$/.test(s))
            throw new Error(`invalid value: '${s}'`);
        return s;
    }
    static string(s) {
        return `"${s}"`;
    }
    static Object(s) {
        try {
            var obj = eval(`(${s})`);
        }
        catch (e) {
            throw new Error(`invalid value: '${s}', error:${e.message}`);
        }
        return s;
    }
    static UIClass(s) {
        if (s.indexOf('.') < 0)
            return "ui." + s;
        return s;
    }
    static boolean(s) {
        var v = s.toLowerCase();
        if (v == "0" || v == "false")
            return "false";
        if (v == "1" || v == "true")
            return "true";
        throw new Error(`invalid value: '${s}'`);
    }
    static intArray(count) {
        return function (s) {
            var args = s.split(',');
            if (args.length != count)
                throw new Error(`invalid value: '${s}'`);
            return `[${args.map(a => conv.int(a)).join(',')}]`;
        };
    }
    static int2(s) {
        return conv.intArray(2)(s);
    }
    static int4(s) {
        return conv.intArray(4)(s);
    }
    static color(s) {
        if (!/^#(([a-fA-F0-9]{3})|([a-fA-F0-9]{6}))$/.test(s))
            throw new Error(`invalid color: '${s}'`);
        return `"${s}"`;
    }
    static GradientFill(s) {
        var grad = eval(`(${s})`);
        if (!Array.isArray(grad.colors))
            throw new Error(`invalid GradientFill: '${s}'`);
        for (var i = 0; i < grad.colors.length; i++)
            conv.color(grad.colors[i]);
        return s;
    }
    static font(s) {
        if (s.indexOf('px') < 0)
            throw new Error(`invalid font: '${s}'`);
        return `"${s}"`;
    }
    static SeqFrameDesc(s) {
        var f = eval(`(${s})`);
        if (!f.count && !f.frames)
            throw new Error(`invalid SeqFrame: '${s}'`);
        return s;
    }
    static TextFormat(s) {
        var t = 0;
        var args = s.split('|');
        for (var i = 0; i < args.length; i++)
            t |= getEnum(TextFormat, args[i]);
        return t;
    }
    static AlignMode(s) {
        var t = 0;
        var args = s.split('|');
        for (var i = 0; i < args.length; i++)
            t |= getEnum(AlignMode, args[i]);
        return t;
    }
    static LayoutMode(s) {
        return getEnum(LayoutMode, s);
    }
    static ScrollMode(s) {
        return getEnum(ScrollMode, s);
    }
    static BlendMode(s) {
        return getEnum(BlendMode, s);
    }
    static SlideMode(s) {
        return getEnum(SlideMode, s);
    }
    static resource(s) {
        return convRes(s);
    }
    static Enum(e, union) {
        if (union) {
            return function (s) {
                var t = 0;
                var args = s.split('|');
                for (var i = 0; i < args.length; i++)
                    t |= getEnum(e, args[i]);
                return t;
            };
        }
        else
            return getEnum;
    }
    static textStyle(s) {
        return `"${s}"`;
    }
    static pattern(s) {
        if (s !== "repeat" && s !== "repeat-x" && s !== "repeat-y")
            throw new Error(`invalid pattern value: '${s}', should be: "repeat-y", "repeat-x" or "repeat"`);
        return `"${s}"`;
    }
}
exports.conv = conv;
conv.compactMode = false;
