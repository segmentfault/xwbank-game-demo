var i18n = require("./i18n").i18n;
var fs = require("fs");
var imgSize = require('image-size').imageSize;
var getConfig = require("./readconfig").read;

function getExt(fn){
	var idx = fn.lastIndexOf(".");
	if(idx > 0)
		return fn.substring(idx + 1);
	else
		return "";
}

function enumFiles(path, root, files, metaFiles) {
	//console.log(`enumFiles ${path}`);
	var f = fs.readdirSync(path);
	var dirs = [];
	f.forEach(function (item) {
		var fn = path + '/' + item;
		var fn2 = root ? root + '/' + item : item;
		var state = fs.statSync(path + '/' + item);
		if (state.isFile()){
			var ext = getExt(item);
			if(ext){
				var name = fn2.substring(0, fn2.lastIndexOf(".")).toLowerCase();
				if(ext == "meta"){
					try {
						var meta = fs.readFileSync(fn, {encoding: "utf8" });
						metaFiles[name] = JSON.parse(meta);
					}
					catch(e){
						console.error(`read ${fn2} error: ${e.message}`);
					}
				}
				else
					files.push({ name: name, ext: ext.toLowerCase(), url: fn2 });
			}
		}
		else if (state.isDirectory()){
			//console.log(item);
			dirs.push([fn, fn2, files, metaFiles]);
		}
	});
	for (var k in dirs)
		enumFiles.call(null, ...dirs[k]);
}

var allRes = {};

function toJSON(res) {
	var obj = {};
	for(var k in res)
		if(k != "name" && k != "type")
			obj[k] = res[k];
	var r = JSON.stringify(obj);
	return `	{ "name":"${res.name}", "type":"${res.type}", ${r.substring(1)}`;
}

function scan(folder, outfile) {
	allRes = {};
	if (!fs.existsSync(folder)){
		console.error(`${folder} is not exist`);
		return;
	}
	var path = fs.realpathSync(folder);
	path = path.replace(/\\/g, "/");
	
	console.log(path);
	var files = [];
	var metaFiles = {};
	enumFiles(path, "", files, metaFiles);
	for(var file of files)	{
		var name = file.name;
		var ext = file.ext;
		var url = `${file.url}`;
		var resProps = metaFiles[name] || {};
		type = resProps.type;
		if (ext == "png" || ext == "jpg" || ext == "jpeg") {
			if(!type)
				type = "image";
			if (allRes[name]) {
				type = allRes[name].type;
				if (type == "subimage")
					continue;
				else {
					console.error(`name conflict: ${allRes[name]["url"]}, ${url}`);
					continue;
				}
			}
			var size = imgSize(path + "/" + file.url);
			if(!size){
				console.error(`can't read image size from ${path}/${file.url}`);
				continue;
			}
			var width = size.width;
			var height = size.height;
			if (resProps.subImages) {
				var subImages = resProps.subImages;
				delete resProps.subImages;
				for(var img of subImages)
					allRes[img.name] = img;
			}
			if (resProps.margin) {
				var m = resProps.margin.split(',');
				width += parseFloat(m[0]) + parseFloat(m[2]);
				height += parseFloat(m[1]) + parseFloat(m[3]);
			}		
			if (fs.existsSync(`${path}/${name}.ezm`)) {
				type = "ezm";
				url = `${name}.ezm`;
			}
			var hitMask = `${path}/${name}.mask`;
			if (fs.existsSync(hitMask)) {
				var maskName = name + ".mask";
				resProps.hitMask = maskName;
				allRes.Add(maskName, { name: maskName, type: "binary", url: `${name}.mask`});
			}
			resProps.type = type;
			if (!resProps.width)
				resProps.width = width;
			if (!resProps.height)
				resProps.height = height;
			resProps.name = name;
			if (resProps.type == "texture") {
				var types = [];
				for (var k = 1; k < 6; k++)
					if (fs.existsSync(`${path}/${name}.${k}`))
						types.push(k);
				resProps.types = types;
				fs.copyFileSync(`${path}/${url}`, `${path}/${name}.0`, fs.constants.COPYFILE_EXCL);
				url = url.substring(0, url.lastIndexOf('.'));
			}
			resProps.url = url;
			allRes[name] = resProps;
		}
		else{
			switch (ext) {
				case "mp3":
					type = "sound";
					break;
				case "txt":
					type = "text";
					break;
				case "json":
				case "csv":
				case "gltf":
				case "model":
				case "binary":
				case "spine":
					type = ext;
					break;
			}
			if (!type)
				continue;
			if (allRes[name]) {
				console.error(`name conflict: ${allRes[name].url}, ${url}`);
				continue;
			}
			resProps.name = name;
			resProps.type = type;
			resProps.url = url;
			if (type == "spine") {
				if (fs.existsSync(`${path}/${name}.atlas`)) {
					var atlastName = `${name}.atlas`;
					resProps["atlas"] = atlastName;
					allRes[atlastName] = { name: atlastName, type: "text", url: `${path}/${name}.atlas` };
				}
			}
			if (type == "gltf") {
				var fn = `${path}/${url}`;
				var gltf = JSON.parse(fs.readFileSync(fn));
				var prefix = url.substring(0, url.lastIndexOf("/") + 1);
				var bin = prefix + gltf.buffers[0].uri;
				if (!fs.existsSync(`${path}/${bin}`)) {
					console.error("bin file ${path}/${bin} is not exist");
					continue;
				}
				resProps.bin = bin;
				allRes[bin] = { name: bin, url: bin, type: "binary" };
			}
			allRes[name] = resProps;
		}
	}
	var lines = [];
	var resList = [];
	var resTypes = {};
	for(var k in allRes){
		lines.push(toJSON(allRes[k]));
		var t = allRes[k].type;
		if (!resTypes[t])
			resTypes[t] = 1;
		else
			resTypes[t]++;
		if (t != "subimage" && t != "empty")
			resList.push(allRes[k]);
	}
	lines = [`{ "resources":[`, lines.join(",\n")];
	var groups = {};

	function addGroups(name){
		var idx = name.lastIndexOf();
		if(idx > 0){
			var p = name.substring(0, idx);
			var n = name.substring(idx + 1);
			if(groups[p].indexOf(n) < 0){
				groups[p].push(n);
				addGroup(p);
			}			
		}
	}
	function take(list, n){
		var s = list[0];
		for(var i = 1; i < n; i++)
			s += '/' + list[i];
		return s;
	}
	for(var r of resList) {
		var n = r.name;
		var paths = n.split('/');
		for (var i = 1; i < paths.length; i++) {
			var p = take(paths, i);
			if (!groups[p])
				groups[p] = [];
		}
		if (paths.length > 1) {
			var p = n.substring(0, n.lastIndexOf("/"));
			groups[p].push(n.substring(n.lastIndexOf("/") + 1));
			addGroups(p);
		}
	}
	lines.push(` ],`);
	lines.push(` "groups":[`);
	var g = [];
	for(var k in groups)
		g.push(`	{ "name":"${k}", "keys":"${groups[k].join()}" }`);
	lines.push(g.join(",\n"));
	lines.push(" ]}");

	fs.writeFileSync(outfile, lines.join("\n"), { encoding: "utf8" });
	console.info("scan resource success!");
	for (var k in resTypes)
		console.info(`    ${k}: ${resTypes[k]}`);
	console.info(`save to ${outfile}`);
}

exports.command = 'scan [config]'

exports.describe = i18n["scan the resource files and generate the resouce manifest file."] + "\n";

exports.builder = function (yargs) {
	return yargs.positional('config', {
		default: "dev",
		describe: i18n['config name define in ez.config.hjson']
	});
}

exports.handler = function (argv) {
	var cfg = getConfig(argv.config);
	if(!cfg)
		return;
	if (!cfg.resPath) {
		console.error("resPath is not defined in ez.config.hjson");
		return;
	}
	if (!cfg.resFile) {
		console.error("resFile is not defined in ez.config.hjson");
		return;
	}
	scan(cfg.resPath, cfg.resFile);
}