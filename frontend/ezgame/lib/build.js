var i18n = require("./i18n").i18n;
var tsc = require("typescript");
var fs = require("fs");
var hjson = require("hjson");
var getConfig = require("./readconfig").read;
var uicompile = require("./uicompile").compile;
var colors = require('colors');
var path = require('path');
var sourceMapMerge = require('./sourcemap').merge;

exports.command = 'build [config]'
exports.describe = i18n['build the project'] + "\n";

exports.builder = function (yargs) {
	return yargs
		.positional('config', {
			default: "dev",
			describe: i18n['config name define in ez.config.hjson']
		})
		.example("$0 build android", "\nbuild the project for android");
}

function readFile(fn){
	return fs.readFileSync(fn, { encoding: "utf-8" });
}

var lastProgram;

function tscompile(cfg) {
	return new Promise((resolve, reject) => {
		var startTime = Date.now();
		var tsconfigfile = cfg.tsconfig || "tsconfig.json";
		console.log(`\n编译 ${tsconfigfile}...`);
		var configFile = "";
		if (cfg.pack && cfg.wrapJS){
			if (!cfg.autoRun)
				configFile += "var main=(function(){";
			else
				configFile += "(function(){";
		}
		configFile += `var PLATFORM = ${cfg.PLATFORM};
var DEBUG = ${!!cfg.DEBUG};
var PUBLISH = ${!!cfg.PUBLISH};
var PROFILING = ${!!cfg.PROFILING};
`
		var tsconfig = tsc.readConfigFile(tsconfigfile, readFile);
		var configFileName = __dirname + "/out.tmpl";
		if (!fs.existsSync(configFileName)){
			console.error(`${configFileName} is not exist!`);
			reject();
			return;
		}
		
		if (tsconfig.error) {
			console.error(tsconfig.error.messageText);
			reject();
			return;
		}
		const { options, fileNames } = tsc.parseJsonConfigFileContent(tsconfig.config, tsc.sys, ".");
		var host = tsc.createCompilerHost(options);

		var program;
		if (options.incremental) {
			program = tsc.createIncrementalProgram({
				rootNames: fileNames, options, host: tsc.createIncrementalCompilerHost(options, tsc.sys)
			});
		}
		else{
			program = tsc.createProgram(fileNames, options, host, lastProgram);
			lastProgram = program;
		}

		const optionErrors = program.getOptionsDiagnostics();
		const syntaxErrors = program.getSyntacticDiagnostics();
		const globalErrors = program.getGlobalDiagnostics();
		const semanticErrors = program.getSemanticDiagnostics();
		let declarationErrors = [];
		/*if (options.declaration) {
			declarationErrors = program.getDeclarationDiagnostics();
			result.declarationErrors = declarationErrors.length;
		}*/
		const preEmitDiagnostics = [...optionErrors, ...syntaxErrors, ...globalErrors, ...semanticErrors, ...declarationErrors];

		var emitFiles = cfg.ES5 ? [`${cfg.ezgame}/ezasm.js`, `${cfg.ezgame}/es5/ez.core.js`] : [`${cfg.ezgame}/ezasm.js`, `${cfg.ezgame}/ez.core.js`];
		if (cfg.modules)
			emitFiles = emitFiles.concat(...cfg.modules.map(m => `${cfg.ezgame}/${(cfg.ES5 ? "es5/" : "") + m}.js`));

		var result = program.emit(undefined, (fileName, content, writeByteOrderMark, onError, sourceFiles) => {
			console.log(`emit ${fileName}`);
			if (sourceFiles === undefined) {
				fs.writeFileSync(fileName, content, { encoding: "utf-8" });
				return;
			}
			if (sourceFiles.length !== 1) {
				throw new Error("Failure: sourceFiles in WriteFileCallback should have length 1, got " + sourceFiles.length);
			}
			if (fileName.substring(fileName.length - 2) == "js")
				emitFiles.push(`${fileName}`);
			fs.writeFileSync(fileName, content, { encoding: "utf-8" });
		});

		const diagnostics = tsc.sortAndDeduplicateDiagnostics([...preEmitDiagnostics, ...result.diagnostics]);

		function getLinePos(lineMap, start) {
			if(!lineMap)
				return {};
			for (var i = 0; i < lineMap.length; i++)
				if (start <= lineMap[i + 1])
					break;
			return { line: i + 1, pos: start - lineMap[i] + 1 };//`${i + 1}:${start - lineMap[i] + 1}`;
		}
		if (diagnostics.length > 0) {
			/*const formattedDiagnostics = tsc.formatDiagnosticsWithColorAndContext(
				diagnostics,
				{
					getCurrentDirectory: () => tsc.sys.getCurrentDirectory(),
					getNewLine: () => tsc.sys.newLine,
					getCanonicalFileName: filename =>
						tsc.sys.useCaseSensitiveFileNames ? filename : filename.toLowerCase()
				}
			);
			console.error(tsc.formatDiagnostics(diagnostics, formatDiagnosticsHost));*/		
			for (const diag of diagnostics) {
				const file = diag.file;
				if(!file)
					console.error(`${"error".red} TS${diag.code}: ${diag.messageText}`);
				else{
					var p = getLinePos(file.lineMap, diag.start);
					
					var fn =  path.resolve(file.fileName);
					var content = file.text.substring(diag.start, diag.start + diag.length);
					console.error(`${fn.green}:${p.line}:${p.pos} - ${"error".red} TS${diag.code}: ${diag.messageText}`);
					console.error(`${p.line}  ${content}`);
					console.error(`   ${"~".repeat(content.length)}\n`.red);
				}
			}
			reject();
			return;
		}
		
		console.log("build success! time cost: " + (Date.now() - startTime));
		if(cfg.pack) {
			//console.log(process.cwd());
			var mergeData = sourceMapMerge(configFile.split("\n"), emitFiles);
			if (cfg.autoRun)
				mergeData.lines.push("main();");
			if (cfg.wrapJS) {
				if(!cfg.autoRun)
					mergeData.lines.push("return main;");
				mergeData.lines.push("})();");
			}
			mergeData.lines.push(`//# sourceMappingURL=out.js.map`);
			mergeData.map.file = "out.js";
			fs.writeFileSync("out.js.map", JSON.stringify(mergeData.map), { encoding: "utf8" });
			//allLines.push(`//# sourceMappingURL=${output}.map`);
			//var output = configFile + emitFiles.map(f => fs.readFileSync(f, { encoding: "utf-8" })).join("\n");
			//output += "\nmain();"
			fs.writeFileSync("out.js", mergeData.lines.join("\n"), { encoding: "utf-8" });
			resolve("out.js");
		}
		else {
			configFile += fs.readFileSync(configFileName, { encoding: "utf-8" }).replace("{IMPORTS}", emitFiles.map(f => `"${f}"`).join(",\n"));
			fs.writeFileSync("out.js", configFile, { encoding: "utf-8" });
			resolve(emitFiles);
		}		
	});
}

exports.build = async function(cfg) {
	if (cfg.uiTmpl) {
		console.log("编译ui模板...");
		var imports = [];
		if(fs.existsSync("types/ui.d.json"))
			imports.push("types/ui");
		if (cfg.uiImports){
			for (var m of cfg.uiImports){
				if (fs.existsSync(m + ".d.json"))
					imports.push(m);
				else
					imports.push("types/" + m);
			}
		}
		await uicompile([`${cfg.uiTmpl}/**/*.uiml`], {
			compact: cfg.uiCompact,
			output: cfg.uiOutput,
			verbose: false,
			imports: imports
		});
		return await tscompile(cfg);
	}
	else
		return await tscompile(cfg);
}

exports.handler = function (argv) {
	var cfg = getConfig(argv.config);
	if (!cfg)
		return;
	exports.build(cfg);
}