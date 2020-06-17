/**
 * main函数是ezgame的主入口函数，在引擎和游戏代码加载完成后被调用
 */
async function main() {
	//初始化ezgame
	ez.initialize({
		width: 710,
		height: 1280,
		scaleMode: ez.ScreenAdaptMode.FixedWidth
	});
	//在发布模式下载入打包后的资源清单数据
	if (PUBLISH) {
		ez.loadResPackage({module}.resData, "res/", {module}.resGroups);
		{module}.run();
	}
	else {
	//在开发模式下载入资源清单文件
		await ez.loadJSONPackageAsync("assets/resource.json", "assets/res/");
		inspector.install();
		{module}.run();
	}
}

namespace {module} {

	export function run(){
		//root为ezgame的顶层元素，在这里创建你的游戏页面
		let root = ez.getRoot();
		let mainPage = root.createChild(MainPage);
	}
}