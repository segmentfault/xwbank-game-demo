function getLang() {
	var locale = process.env.LC_ALL || process.env.LC_MESSAGES || process.env.LANG || process.env.LANGUAGE || 'en_US'
	locale = locale.replace(/[.:].*/, '');
	return locale.split('_')[0];
}

var i18n = {
	'run the project in browser.':
	{
		zh: '在浏览器中运行项目'
	},
	'build the project.':
	{
		zh: "构建项目"
	},
	'build the project':
	{
		zh: "构建项目"
	},
	'config name define in ez.config.hjson':
	{
		zh: "在ez.config.hjson中的配置"
	},
	"scan the resource files and generate the resouce manifest file.": 
	{
		zh: "扫描资源文件目录并更新资源文件清单"
	},
	"Create a new project in current folder.":
	{
		zh: "在当前目录中创建一个新工程"
	},
	'choose the version of EasyGame':
	{
		zh: "选择EasyGame的版本号"
	},
	'update the engine version':
	{
		zh: "更新EasyGame引擎版本"
	},
	'the version of EasyGame. if no version options it will update to the latest version': 
	{
		zh: "EasyGame版本号，如果不指定版本号则会更新到最新版本"
	},
	'publish the resource file to dist and generate the resource list embed in ts code.':
	{
		zh: "将资源文件发布到分发目录中，并将资源描述清单嵌入到ts代码中"
	},
	"publish the resource file for browser version.": 
	{
		zh: "将资源文件发布到browser版本中"
	},
	'set the web port':
	{
		zh: "设置服务监听端口"
	},
	'set the web host':
	{
		zh: "设置服务监听地址"
	},
	'watch the code and resource changed event and auto build to refresh':
	{
		zh: "后台检测项目变更，自动进行构建并刷新页面"
	},
	"only publish the js file, no resource file output":
	{
		zh: "仅输出js文件，不输出资源文件"
	}

}

var lang = getLang();
var i18nLang;

function setlang(lang) {
	i18nLang = new Proxy(i18n, {
		get(target, key) {
			if(!target[key]){
				console.error(`${key} is not defined in i18n`);
				return key;
			}
			return target[key][lang] || key;
		}
	});
}

setlang(lang);
exports.setlang = setlang;
exports.i18n = i18nLang;