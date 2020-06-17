/// <reference path="CommonTypes.ts"/>
/**
 * @module GUI
*/
namespace ez.parse {
	var defGradientFill = { x0: 0, y0: 0, x1: 0, y1: 0, colors: ["#000000", "#ffffff"] };
	var defSeqFrame = { prefix: "", frames: "", from: 0, count: 0, fps: 30, loop: false };
	
	class JsObject {
		isJSON() { return true; }
		toString(){
			var r = '{ ';
			var f = true;
			for(let k in this) {
				if(!f)
					r += ' ,';
				r += `${k}:${typeof this[k] == "string" ? "'" + this[k] + "'" : this[k]}`;
				f = false;
			}
			r += ' }';
			return r;
		}
	}

	function parseObject(val, def): any {
		if(typeof val == "string")
			val = PLATFORM == Platform.WeiXin ? wx.eval(val) : eval("(" + val + ")");
		if(!val)
			return null;
		var obj = new JsObject();
		if(!def){
			for (var k in val)	
				obj[k] = val[k];
			return obj;
		}
		else{
			for(var k in def) {
				if (val[k] === undefined)
					Object.defineProperty(obj, k, { value: def[k], writable:true, enumerable: false, configurable: true });
				else
					obj[k] = val[k];
			}
			return obj;
		}
	}

	/**
	* 解析渐变填充
	*/
	export function GradientFill(val: string | ez.GradientFill): ez.GradientFill {
		if(!val)
			return undefined;
		return <ez.GradientFill>parseObject(val, defGradientFill);
	}

	/**
	* 解析Dimension
	*/
	export function Dimension(val: number | string | ez.Dimension): ez.Dimension {
		var t = typeof (val);
		if(t === "number")
			return new ez.Dimension(<number>val);
		if(t === "string")
			return val === "" ? undefined : new ez.Dimension(<string>val);
		if(t === "object")
			return <ez.Dimension>val;
		else
			return undefined;
	}

	export function Boolean(val: boolean | string): boolean {
		if(typeof (val) === "string") {
			var s = <any>val;
			return s.toLowerCase() == "true" || (s == true);
		}
		return !!val;
	}
	export function Float(val:number|string):number {
		if (typeof (val) == "string"){
			if(val == "")
				return undefined;
			return parseFloat(val);
		}
		else
			return val;
	}
	export function Int(val: number | string): number {
		if (typeof (val) == "string") {
			if (val == "")
				return undefined;
			return parseInt(val);
		}
		else
			return val;
	}

	/**
	* 解析序列帧动画描述
	*/
	export function SeqFrameDesc(val: ez.SeqFrameDesc | string): ez.SeqFrameDesc {
		if(!val)
			return undefined;
		return <ez.SeqFrameDesc>parseObject(val, defSeqFrame);
	}

	/** 
	* 解析图片资源名，如果资源是http://开头的则会解析为外部资源
	*/
	export function ImageSrc(val: string | ez.ImageRes): any {
		if(typeof (val) === "string") {
			if(/^http:\/\/.+/.test(<string>val)) {
				return ez.getExternalRes<ez.Texture>(<string>val, ez.ResType.image);
			}
			if(val == "")
				return undefined;
			var res = ez.getRes<ez.Texture>(<string>val);
			return res;
		}
		else
			return val;
	}

	/** 
	* 解析csv
	*/
	export function CSV(csv: string): string[][] {
		csv = csv.replace(new RegExp("\r\n", "gm"), "\n");
		if(csv[csv.length - 1] != "\n")
			csv += "\n";
		var lines = [];
		var line = [];
		var inQuote = false;
		var str = "";
		for(var i = 0; i < csv.length; ++i) {
			var c = csv[i];
			if(!inQuote) {
				if(c == ",") {
					line.push(str);
					str = "";
				}
				else if(c == "\r") {
					if(csv[i + 1] == "\n")
						i++;
					line.push(str);
					str = "";
					lines.push(line);
					line = [];
				}
				else if(c == "\n") {
					line.push(str);
					str = "";
					lines.push(line);
					line = [];
				}
				else if(c == "\"")
					inQuote = true;
				else
					str += c;
			} else {
				if(c == "\"") {
					if(i < csv.length - 1 && csv[i + 1] == "\"")
						str += c;
					inQuote = false;
				} else
					str += c;
			}
		}
		return lines;
	}
	/**
	* 解析number数组
	* @param s
	*/
	export function Numbers(s): number[] {
		if(Array.isArray(s))
			return <number[]>s;
		var args = s.split(",");
		return args.map(a => parseFloat(a));
	}
	/**
	* 解析Number4
	* @param s
	*/
	export function Number4(s): ez.Number4 {
		if(Array.isArray(s))
			return <ez.Number4>s;
		var args = s.split(",");
		return [parseFloat(args[0]), parseFloat(args[1]), parseFloat(args[2]), parseFloat(args[3])];
	}
	/**
	* 解析JS对象，和JSON的区别在于属性名可以不带双引号，简化写法
	* @param val 字符串
	*/
	export function JSObj(val) {
		if (typeof val == "string") {
			return PLATFORM == Platform.WeiXin ? wx.eval(val) : eval("(" + val + ")");
		}
		return val;
	}

	/**
	* 解析枚举值，多个枚举值可以用|组合
	* @param val
	* @param enumType
	*/
	export function Enums(val: string, enumType: Object): number {
		var args = val.split("|");
		var t = 0;
		for(var i = 0; i < args.length; i++)
			if(enumType[args[i]])
				t |= enumType[args[i]];
		return t;
	}

	/**
	* 获取某个枚举类型的解析器
	* @param enumType 枚举类型
	*/
	export function getEnumParser(enumType: Object): (val: any) => any {
		return function (val: string | number) {
			if(typeof val === "string")
				return Enums(val, enumType);
			else
				return val;
		}
	}
}