var fs = require("fs");
var hjson = require("hjson");


exports.read = function (cfg) {
	if (!fs.existsSync("ez.config.hjson")) {
		console.error("not found ez.config.hjson");
		return;
	}
	var data = hjson.parse(fs.readFileSync("ez.config.hjson", { encoding: 'utf8' }));

	if (!data.build || cfg && !data.build[cfg]){
		console.error(`${cfg} is not exist in ez.config.hjson`);
		return;
	}
	var b = data.build[cfg];
	for(var k in b)
		data[k] = b[k];
	if(!data.ezgame) {
		//find ezgame path..
		var path = "ezgame";
		if (fs.existsSync("ezgame"))
			data.ezgame = "ezgame";
		else if (fs.existsSync("../ezgame"))
			data.ezgame = "../ezgame";
		else if (fs.existsSync("../../ezgame"))
			data.ezgame = "../../ezgame";
	}
	delete data.build;
	return data;
}