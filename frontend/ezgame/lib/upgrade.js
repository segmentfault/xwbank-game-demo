var i18n = require("./i18n").i18n;
var fs = require('fs');
var glob = require('glob');
var copyFolder = require("./copyFolder").copyFolder;

exports.command = 'upgrade [version]'

exports.describe = i18n['update the engine version'] + "\n";

exports.builder = function (yargs) {
	return yargs
		.positional('version', {
			describe: i18n['the version of EasyGame. if no version options it will update to the latest version']
		})
		.example("$0 build android", "\nbuild the project for android");
}

exports.handler = function (argv) {
	var versions = glob.sync(`${__dirname}/../engine/**/version`);
	versions = versions.map(v => {
		var r = JSON.parse(fs.readFileSync(v));
		r.path = v.replace(/\\/g, "/");
		r.path = r.path.substring(0, r.path.lastIndexOf("/"));
		return r;
	});
	versions.sort((a, b) =>{
		a = a.version.split('.').map(t => parseInt(t));
		b = b.version.split('.').map(t => parseInt(t));
		for(let i = 0; i < 3; i++){
			if(a[i] > b[i])
				return -1;
			else if (a[i] < b[i])
				return 1;				
		}
		return 0;
	});
	//console.log(versions);
	var version = versions[0];
	console.log(`upgrade to ${version.version}`);
	copyFolder(version.path, "ezgame", ["types"]);
	copyFolder(version.path + "/types", "types", []);
	console.log("upgrade finished");
	//console.log("upgrade", argv);
}