var i18n = require("./i18n").i18n;
var express = require("express");
var watch = require("watch");
var scanHandler = require("./scan").handler;
var buildHandler = require("./build").build;
var getConfig = require("./readconfig").read;
var path = require('path');

exports.command = 'run [config] [-u host] [-p port]'

exports.describe = i18n['run the project in browser.'] + "\n";

exports.builder = function (yargs) {
	return yargs.positional('config', {
		default: "dev",
		describe: i18n['config name define in ez.config.hjson']
	})
	.option("port",{
		default: 8001,
		alias: "p",
		type: 'number',
		describe: i18n['set the web port']
	})
	.option("host",{
		default: "localhost",
		alias: "u",
		type: 'string',
		describe: i18n['set the web host']
	})
	.option("devtools", {
		default: "../EasyGame-inspector/out",
		type: 'string',
		describe: "devtool panel"
	})
	.option("verbose", {
		type: "boolean"
	})
	.option("watch",{
		type: "boolean",
		alias: "w",
		describe: i18n['watch the code and resource changed event and auto build to refresh']
	});
}

var rev = 0;
var revRequests = [];

function onChanged(req, res) {
	var r = req.params["rev"];
	if(r == -1)
		res.send({ rev: rev });
	else
		revRequests.push(res);
}
function updateRev(){
	for (var i = 0; i < revRequests.length; i++){
		try{
			revRequests[i].send({ rev: rev });
		}
		catch(e){
			console.error(e.message);
		}
	}
	revRequests = [];
}

function watchProj(argv){
	if (!argv.watch){
		rev = -1;
		return;
	}
	console.log("begin to watch the porject change...");
	setInterval(updateRev, 60000);
	var buildCfg = getConfig("dev");
	if (argv.verbose)
		console.log(buildCfg);
	var uitmplChanged = false;

	async function rebuild(){
		buildTimer = 0;
		var cfg = getConfig("dev");
		if (!uitmplChanged)
			cfg.uiTmpl = null;
		try{
			uitmplChanged = false;
			await buildHandler(cfg);
			rev++;
			console.log(`update rev: ${rev}`);
			updateRev();
		}
		catch(e){
			console.error("build failed: " + e.message);
		}
	}
	var scanTimer = 0;
	var buildTimer = 0;

	if (buildCfg.uiTmpl){
		if (argv.verbose)
			console.log(`watch ${buildCfg.uiTmpl}...`);
		watch.watchTree(buildCfg.uiTmpl, function (f, curr, prev) {
			if (curr == null && prev == null)
				return;
			if (argv.verbose)
				console.log(`${buildCfg.uiTmpl} changed...`, f);
			uitmplChanged = true;
			buildTimer = setTimeout(rebuild, 500);
		});
	}

	if (argv.verbose)
		console.log(`watch src...`);
	watch.watchTree("src", { interval: 1 }, function(f, curr, prev){
		if (curr == null && prev == null)
			return;
		//if (argv.verbose)
			console.log(`src changed...`, f);
		if (path.resolve(f) == path.resolve(buildCfg.uiOutput)){
			return;
		}
		if (buildTimer)
			clearTimeout(buildTimer);
		buildTimer = setTimeout(rebuild, 500);
	});

	watch.watchTree("assets/res", function (f, curr, prev) {
		if(curr == null && prev == null)
			return;
		if (scanTimer)
			clearTimeout(scanTimer);
		console.log("res changed...");
		scanTimer = setTimeout(function(){
			scanTimer = 0;
			console.log("scan res...");
			scanHandler({ config: "dev" });
			rev++;
			console.log(`update rev: ${rev}`);
			updateRev();
		}, 500);
	});
}
exports.handler = function (argv) {
	//console.log(argv);
	var app = express();
	var expressWs = require('express-ws')(app);
	var hostName = argv.host;
	var port = argv.port;

	var inspector;
	var devpanel;

	app .use(express.static("./", { lastModified: true }))
		.get("/", function (req, res) {
			res.redirect("/index.html");
		})
		.ws('/__inspector', function (ws, req) {
			ws.on('message', function (msg) {
				try{
					if (msg == "connect"){
						if (inspector){
							inspector.removeAllListeners("close");
							inspector.close();
						}
						console.log("inspector connect");
						inspector = ws;
						msg = '"connect"';
					}
					if(devpanel)
						devpanel.send(msg);
				}
				catch(e){
					console.error("inspector error: ", e);
				}
			});
			ws.on("close", function(){
				console.log("inspector close");
				if (devpanel)
					devpanel.send('"close"');
				inspector = null;
			})
		})
		.ws('/__devtools', function (ws, req) {
			ws.on('message', function (msg) {
				try {
					if (msg == "connect") {
						if (devpanel){
							devpanel.removeAllListeners('"close"');
							devpanel.close();
						}
						console.log("devpanel connect");
						devpanel = ws;
					}
					else if (inspector)
						inspector.send(msg);
				}
				catch (e) {
					console.error("devtools error: ", e);
				}
			});

			ws.on("close", function () {
				console.log("devtools close");
				if (inspector)
					inspector.send('"close"');
				devpanel = null;
			})
		})
		.get("/__changed", onChanged)
		.use(function onerror(err, req, res, next) {
			console.error(err);
			next();
		});
	if (argv.devtools){
		app.use("/devtools", express.static(argv.devtools));
	}

	watchProj(argv);

	console.log(`run web server on http://${argv.host}:${argv.port}`);
	app.listen(argv.port, argv.host);
}