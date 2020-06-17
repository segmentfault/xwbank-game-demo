var i18n = require("./i18n").i18n;
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var inquirer = require("inquirer");
var copyFolder = require("./copyFolder").copyFolder;

exports.command = 'init [version]'
exports.describe = i18n["Create a new project in current folder."] + "\n";;

exports.builder = function (yargs){
	return yargs.positional('version', {
		type: 'string',
		describe: i18n['choose the version of EasyGame']
	});
}
exports.handler = function (argv) {
	//console.log(`${__dirname}/../engine/**/version`);
	var files = glob.sync("./*");
	if(files.length > 0){
		console.log(files);
		console.error("error: 请选择一个空的文件夹创建项目");
		return;
	}
		//console.log(files);
	var versions = glob.sync(`${__dirname}/../engine/**/version`);
	versions = versions.map(v =>{
		var r = JSON.parse(fs.readFileSync(v));
		r.path = v.replace(/\\/g, "/");
		r.path = r.path.substring(0, r.path.lastIndexOf("/"));
		return r;
	});
	let questions = [
		{
			type: "input",
			name: "title",
			message: "input the project title: ",
			default: "ezgame-test"
		},
		{
			type: "input",
			name: "namespace",
			message: "input the namespace of the project: ",
			default: "game"
		},
		{
			type: "confirm",
			name: "need3d",
			message: "support 3d: "
		}];
	//versions.push({ version: "1.0", stage: "beta", publishdate:"2020-1-1" });
	//console.log(versions);

	if(versions.length > 1)
		questions.push({
			type: "list",
			name: "version",
			message: "choose the engine version: ",
			choices: versions.map(v => {
				return { value: v.version, name: `${v.version}-${v.stage}	publish date: ${v.publishdate}` }
			})
		});

	//console.log("init", argv);

	function replaceTemplte(fn, search, replace){
		var c = fs.readFileSync(fn, {encoding: "utf-8"});
		c = c.replace(search, replace);
		fs.writeFileSync(fn, c, { encoding: "utf-8" });;
	}
	inquirer.prompt(questions).then(function(a){
		//fs.readSync
		//console.log(a);
		var version = versions[0];
		if (versions.length > 1){
			version = versions[versions.findIndex(v => v.version == a.version)];
		}
		//"".replace
		console.log("项目配置: ", a);
		copyFolder(version.path, "ezgame", ["types"]);
		copyFolder(version.path + "/types", "types", []);
		let template = path.normalize(`${__dirname}/../template`);
		copyFolder(template, ".", []);
		replaceTemplte("index.html", "{title}", a.title);
		replaceTemplte("publish.html", "{title}", a.title);
		replaceTemplte("src/main.ts", /\{module\}/g, a.namespace);
		replaceTemplte("ui/MainPage.uiml", /\{module\}/g, a.namespace);
		replaceTemplte("src/res.ts", /\{module\}/g, a.namespace);
		replaceTemplte("src/res.tmpl", /\{module\}/g, a.namespace);
		var imports = "";
		var tsimports = "";
		if (a.need3d){
			imports = "ez.3d"
			tsimports = '\n		"types/ez.3d.d.ts",';
		}
		replaceTemplte("ez.config.hjson", /\{imports\}/g, imports);
		
		replaceTemplte("tsconfig.json", /\{imports\}/g, tsimports);
		console.log("项目创建完成");
	})
}