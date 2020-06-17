var yargs = require('yargs');
var fs = require("fs");

var package = fs.readFileSync(__dirname + "/../package.json", { encoding: "utf8" });
package = JSON.parse(package);

var parser = yargs
	.usage(`Usage:
  $0 <command> [options]`)
	.help('h')
	.alias('h', 'help')
	.version("v", package.version)
	.command(require('./init'))
	.command(require('./scan'))
	.command(require('./build'))
	.command(require('./publish'))
	.command(require('./run'))
	.command(require('./upgrade'))
	.demandCommand(1, "")
	.strict()
	.epilog('EasyGame copyright 2020');

var opts = parser.argv._;