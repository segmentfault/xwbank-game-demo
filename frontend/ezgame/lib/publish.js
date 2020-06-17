var i18n = require("./i18n").i18n;
var fs = require("fs");
var getConfig = require("./readconfig").read;
var buildHandler = require("./build").build;
var md5 = require('md5');
var terser = require('terser');

exports.command = 'publish [config] [--jsonly] [--es5]'
exports.describe = i18n['publish the resource file to dist and generate the resource list embed in ts code.'] + "\n";
exports.builder = function (yargs) {
	return yargs
		.positional('config', {
			default: "dev",
			describe: i18n['config name define in ez.config.hjson']
		})
		.option("es5", {
			type: "boolean",
			default: false,
			describe: i18n["compile the ts code with ES5"]
		})
		.option("jsonly", {
			type: "boolean",
			alias: "j",
			default: false,
			describe: i18n["only publish the js file, no resource file output"]
		})
		.example("$0 publish browser", "\n" + i18n["publish the resource file for browser version."]);
}

function hashFile(fn) {
	var buf = fs.readFileSync(fn);
	var s = md5(buf, { asBytes:true });
	//console.log(s);
	var str = "ABCDEFGHIJKLM0123456789NOPQRSTUVWXYZ";
	s = s.map(t => str[t % str.length]).join("");
	//console.log(s);
	return s;
}
function copyFile(srcFile, distPath, type) {
	//
	if (type == "texture") {
		if (fs.existsSync(srcFile + ".png"))
			srcFile = srcFile + ".png";
		else if (fs.existsSync(srcFile + ".jpg"))
			srcFile = srcFile + ".jpg";
	}
	var hash = hashFile(srcFile);
	if(type == "image")
		hash += ".0";
	var dest = `${distPath}/${hash}`;
	if (!fs.existsSync(dest)){
		console.log(`copy ${srcFile} -> ${distPath}/${hash}`);
		fs.copyFileSync(srcFile, dest);
	}
	return hash;
}

var numTbl = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef";

function numCode(n) {
	var r = "";
	do {
		var s = numTbl[n & 31];
		r = s + r;
		n >>= 5;
	} while (n > 0);
	return r;
}
function nameHash(s) {
	var tbl = "0123456789ABCDEFGHIJKLMNOPQRSTUVWX";
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
function numArrCode(n){
	return n.split(',').map(t => numCode(t)).join(",");
}
function publish(resPath, resFile, distPath, resTmplFile, resPublishFile) {
	if (!fs.existsSync(resFile)){
		console.error(`${resFile} is not exist`);
		return;
	}
	if(!fs.existsSync(distPath)){
		fs.mkdirSync(distPath, {recursive:true});
	}
	console.log(`发布资源文件...`);
	var logFile = [];
	var resList = [];
	var resJSON = JSON.parse(fs.readFileSync(resFile));
	var resources = resJSON.resources;

	function addres(...args){
		resList.push(args.join("|"));
	}
	function addNormalRes(name, type, url){
		resList.push([nameHash(name), type, url].join("|"));
	}

	for (var obj of resources){
		var name = obj.name;
		var type = obj.type;
		var urlCode = "";
		if (obj.url) {
			//urlCode = Copy(ref type, obj.url);
			urlCode = copyFile(`${resPath}/${obj.url}`, distPath, obj.type);
			logFile.push(`${type} ${name} id:${nameHash(name)} url: ${urlCode}`);
		}
		else
			logFile.push(`${type} ${name} id:${nameHash(name)}`);

		switch (type) {
			case "ezm":
				addres(
					nameHash(name),
					"w",
					urlCode,
					numCode(obj.width),
					numCode(obj.height),
					obj.s9 ? numArrCode(obj.s9) : "",
					obj.margin ? numArrCode(obj.margin) : "",
					obj.format ? numCode(obj.format) : "",
					obj.hitMask ? numCode(obj.hitMask) : "");
				break;
			case "image":
				addres(
					nameHash(name),
					'i',
					urlCode,
					numCode(obj.width),
					numCode(obj.height),
					obj.s9 ? numArrCode(obj.s9) : "",
					obj.margin ? numArrCode(obj.margin) : "",
					obj.format ? numCode(obj.format) : "",
					obj.hitMask ? numCode(obj.hitMask) : ""
				);
				break;
			case "texture":
				var cubemap = "";
				if(obj.cubemap)
					cubemap = obj.cubemap.map(n => nameHash(n)).join();
				addres(
					nameHash(name),
					'x',
					urlCode,
					numCode(obj.width),
					numCode(obj.height),
					numArrCode(obj.types.join()),
					cubemap
				);
				break;
			case "subimage":
				var region = obj.region.split(',');
				addres(
					nameHash(name),
					obj.transpose ? "P" : "p",
					nameHash(obj.parent),
					numArrCode(obj.region),
					obj.width == region[2] ? "" : numCode(obj.width),
					obj.height == region[3] ? "" : numCode(obj.height),
					obj.s9 ? numArrCode(obj.s9) : "",
					obj.margin ? numArrCode(obj.margin) : "",
					obj.format ? numCode(obj.format) : "",
					obj.hitMask ? numCode(obj.hitMask) : ""
				);
				break;
			case "empty":
				addres(
					nameHash(name),
					"e",
					numCode(obj.width),
					numCode(obj.height)
				);
				break;
			case "sound":
				addNormalRes(name, "s", urlCode);
				break;
			case "text":
				addNormalRes(name, "t", urlCode);
				//resList.push(`${nameHash(name)}|t|${urlCode}`);
				break;
			case "json":
				addNormalRes(name, "j", urlCode);
				//resList.push(`${nameHash(name)}|j|${urlCode}`);
				break;
			case "csv":
				addNormalRes(name, "c", urlCode);
				//resList.push(`${nameHash(name)}|c|${urlCode}`);
				break;
			case "binary":
				addNormalRes(name, "b", urlCode);
				//resList.push(`${nameHash(name)}|b|${urlCode}`);
				break;
			case "gltf":
				resList.push(`${nameHash(name)}|g|${urlCode}|${nameHash(obj.bin)}`);
				break;
			case "model":
				addNormalRes(name, "m", urlCode);
				//resList.push(`${nameHash(name)}|m|${urlCode}`);
				break;
			case "spine":
				resList.push(`${nameHash(name)}|n|${urlCode}|${obj.atlas ? nameHash(obj.atlas) : "" }`);
				break;
		}
	}
	var resTempl = fs.readFileSync(resTmplFile, {encoding: "utf-8"});
	resTempl = resTempl.replace("{res}", resList.join(";")).replace("{group}", "");

	var tsfile = resTmplFile.substring(0, resTmplFile.lastIndexOf(".") + 1) + "ts";
	console.log(`write ${tsfile}`);
	fs.writeFileSync(tsfile, resTempl, { encoding: "utf-8" });
	console.log(`write publish.log`);
	fs.writeFileSync("publish.log", logFile.join("\n"), { encoding: "utf-8" });

}
function padding(s, n) {
	s = "" + s;
	if (n <= s.length)
		return s;
	return "0".repeat(n - s.length) + s;
}
exports.handler = async function (argv) {
	var cfg = getConfig(argv.config);
	if (!cfg)
		return;
		console.log(cfg);
	if (!cfg.distPath) {
		console.error("distPath is not defined in ez.config.hjson");
		return;
	}
	if (!cfg.resPath) {
		console.error("resPath is not defined in ez.config.hjson");
		return;
	}
	if (!cfg.resFile) {
		console.error("resFile is not defined in ez.config.hjson");
		return;
	}
	if(!argv.jsonly)
		publish(cfg.resPath, cfg.resFile, cfg.distPath + "/res", cfg.resTmplFile, cfg.resPublishFile);
	cfg.pack = true;
	var date = new Date();
	var fn = `${date.getFullYear()}${padding(date.getMonth(), 2)}${padding(date.getDay(), 2)}${padding(Date.now()%100000, 5)}.js`;
	var file = await buildHandler(cfg);
	if (cfg.minifyJS){
		var defines = {
			PLATFORM: cfg.PLATFORM,
			DEBUG: !!cfg.DEBUG,
			PUBLISH: !!cfg.PUBLISH,
			PROFILING: !!cfg.PROFILING
		};
		console.log(`minify ${file}`);
		var code = fs.readFileSync(file, {encoding:"utf-8"});
		code = terser.minify(code, { compress: { global_defs: defines, dead_code: true, reduce_vars :true }, mangle: true }).code;
		console.log(`emit ${cfg.distPath}/${fn}`);
		fs.writeFileSync(`${cfg.distPath}/${fn}`, code, { encoding: "utf-8" });
	}
	else{
		fs.copyFileSync(file, `${cfg.distPath}/${fn}`);
		var sourcemap = JSON.parse(fs.readFileSync(file + ".map", {encoding:"utf-8"}));
		sourcemap.file = fn;
		fs.writeFileSync(`${cfg.distPath}/${file}.map`, JSON.stringify(sourcemap), { encoding: "utf-8" });
	}
	var indexPage = cfg.indexPage || "index.html";
	indexPage = fs.readFileSync(indexPage, {encoding: "utf-8"});
	indexPage = indexPage.replace("out.js", fn);
	fs.writeFileSync(`${cfg.distPath}/index.html`, indexPage, { encoding: "utf-8" });
}