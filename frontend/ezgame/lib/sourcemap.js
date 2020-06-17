var sourcemap = require('sourcemap-codec');
var fs = require("fs");
var path = require("path");

function getPath(fn) {
	var path = fs.realpathSync(fn);
	return path.substring(0, path.lastIndexOf("\\") + 1);
}


exports.merge = function(lines, files) {
	var allMappings = [];
	var allLines = lines;
	var currLine = 0;
	var sourceFiles = [];

	function loadJS(fn) {
		var cwd = process.cwd();
		var lines = fs.readFileSync(fn, { encoding: "utf8" }).split("\n");
		while (lines.length > 0){
			if (lines[lines.length - 1].trim() == "")
				lines.pop();
			else
				break;
		}
		if (lines.length == 0)
			return;
		var lastLine = lines[lines.length - 1];
		if (!lastLine.startsWith("//# sourceMappingURL")){
			allLines = allLines.concat(lines);
			while(allMappings.length < allLines.length)
				allMappings.push([]);
			return;
		}
		lines.pop();
		if (lines.length == 0)
			return;

		allLines = allLines.concat(lines);
		if (!fs.existsSync(fn + ".map")){
			while (allMappings.length < allLines.length)
				allMappings.push([]);
			return;
		}
		var sourceMap = fs.readFileSync(fn + ".map", { encoding: "utf8" });
		var sourceMapData = JSON.parse(sourceMap);
		var sourceIdx = sourceFiles.length;
		for (var i = 0; i < sourceMapData.sources.length; i++) {
			var sourceFile = sourceMapData.sources[i];
			if (sourceMapData.sourceRoot)
				sourceFile = sourceMapData.sourceRoot + "/" + sourceFile;
			var filepath = path.resolve(fn + ".map").replace(/\\/g, "/");
			filepath = filepath.substring(0, filepath.lastIndexOf("/") + 1);
			sourceFile = path.resolve(filepath + sourceFile);
			sourceFile = path.relative(cwd, sourceFile).replace(/\\/g, "/");
			sourceFiles.push(sourceFile);
		}
		var mapLines = sourcemap.decode(sourceMapData.mappings);
		for (var i = 0; i < mapLines.length; i++) {
			var mapSegments = mapLines[i];
			for (var j = 0; j < mapSegments.length; j++) {
				var args = mapSegments[j];
				args[1] = sourceIdx + args[1];
			}
			if (allMappings.length < allLines.length)
				allMappings.push(mapSegments);
		}
		while (allMappings.length < allLines.length)
			allMappings.push([]);
	}

	for (var i = 0; i < files.length; i++) {
		loadJS(files[i]);
	}
	return {
		lines: allLines, 
		map: { version: 3, sourceRoot: "", sources: sourceFiles, names: [], mappings: sourcemap.encode(allMappings) }
	};
}