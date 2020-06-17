var glob = require('glob');
var fs = require('fs');

exports.copyFolder = function(src, dest, excludes) {
	var files = glob.sync(`${src}/**`);
	for (var file of files) {
		var fn = file.substring(src.length + 1);
		var excluded = false;
		if (excludes.findIndex(e => fn.toLowerCase().startsWith(e)) < 0) {
			var destFile = `${dest}/${fn}`;
			if (fs.statSync(file).isDirectory()) {
				if (!fs.existsSync(destFile))
					fs.mkdirSync(destFile, { recursive: true }); 
			}
			else
				fs.writeFileSync(destFile, fs.readFileSync(file));
		}
	}
}