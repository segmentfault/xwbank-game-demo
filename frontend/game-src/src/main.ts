/// <reference path="res.ts"/>

declare var startTime;

var PlayerInfo: {
	openid:string;
	nickname: string;
	sex: string;
	headimgurl: string;
} = <any>{};

function ajax(url, cb) {
	var x = new XMLHttpRequest();
	x.open("GET", url);
	x.onload = function () {
		var is_error = x.status >= 400 || (!x.status && !x.responseText);
		if (is_error){
			alert(`failed: ${x.status} ${x.responseText}`);
			cb(false);
		}
		else
			cb(true, JSON.parse(x.responseText));
	}
	try{
		x.send();
	}catch{
		cb(false);
	}
}

var mainFrame: game.MainFrame;
window.onmessage = function (ev) {
	console.log(ev.data);
	var data = ev.data;
	if(data.msg == "login" && data.info)
		PlayerInfo = JSON.parse(data.info);
	if(data.msg == "back"){
		mainFrame.clearChilds();
		mainFrame.createChild(game.GamePage);
	}
}
async function main() {
	window.parent.postMessage({ msg: "login" }, "*");
	ez.initialize({
		width: 710,
		height: 1280,
		minHeight: 1100,
		maxHeight: 1400,
		highDPI: true,
		wglOptions: { preserveDrawingBuffer: true },
		scaleMode: ez.ScreenAdaptMode.FixedWidth
	});
	ez.loadEZMDecoder(typeof (WebAssembly) === "undefined" ? "ezm.asm.js" : "ezm.wasm.js", 1);
	if (PUBLISH) {
		ez.loadResPackage(game.resData, "res/", game.resGroups);
		ez.loadGroup(["ui", "start", "image/bg"], function(progress, total){
			if (progress >= total){
				var t = Date.now() - startTime;
				//ajax(`http://chenshuwei.free.idcfengye.com/openapi/statistics/add?openid=${PlayerInfo.openid}&loadTime=${t}`, function () { });
				mainFrame = ez.getRoot().createChild(game.MainFrame);
				var loading = document.getElementById("loading");
				if (loading)
					document.body.removeChild(loading);
				ez.loadGroup(["game", "image/活动规则", "image/说明", "share"]);
			}
		});
	}
	else {
		await ez.loadJSONPackageAsync("assets/resource.json", "assets/res/");
		ez.loadGroup(["ui", "start", "image/bg"], function (progress, total) {
			if (progress >= total) {
				var t = Date.now() - startTime;
				//ajax(`http://chenshuwei.free.idcfengye.com/openapi/statistics/add?openid=${PlayerInfo.openid}&loadTime=${t}`, function () { });
				mainFrame = ez.getRoot().createChild(game.MainFrame);
				var loading = document.getElementById("loading");
				if (loading)
					document.body.removeChild(loading);
				ez.loadGroup(["game", "image/活动规则", "image/说明", "share"]);
			}
		});

		//mainFrame = ez.getRoot().createChild(game.MainFrame);
		//inspector.install();
	}
}
