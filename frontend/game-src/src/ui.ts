namespace game{
	import ui = ez.ui;
	var UI = ["UIStage", "Control", "Group", "RectFill", "Image", "game.Button", "Label", "game.Checkbox", "game.StartPage", "game.RankPage", "ScrollView", "ListView"];
	var RES = ["R:JCF2OQOGMT7O","R:B0LVRU4VENJS","R:1EF948RMIQRD","R:HA8GLOB3BT28","R:4PGJIM7IPCOV","R:QJ204MMAGROF","R:LAO8Q29LE1TO","R:4LVSPIK3B203","R:S9IQLHG3U700","R:INH1T34JAHE4","R:G503ILGF8S28","R:O123T11GLFK9","R:CTDCID13AB9F","R:U7VJ9SGIHTNO","R:P637DGG88RRB","R:307B8VJHSQ38","R:O18PU18DTSMO","R:85GD560O0A62","R:RGDNTIFOJEJ1","R:PQF1C511M1BQ","R:5A1F5RDNRR3D","R:SPMG8J9324MB","R:6VBE1JLANTMV","R:UFGMTQLP3H5J","R:52OMU7AEFJE8","R:MFP4S2F9MF7F","R:F45FD2M7NRMS","R:EN6PH70VD7LV","R:M3F90V7UJL03","R:EJRRQ2IU0JS0","R:LMIPDLENLMJG","R:VCP8LGVCL71S"];
	
	ui.registerTextStyle([
		{ id:"normal", font:"28px", color:"#bbadfb" },
		{ id:"normalCenter", font:"28px", color:"#bbadfb", align:1 },
		{ id:"rankPage", font:"28px", color:"#757981" },
		{ id:"gameHead", font:"28px", color:"#fff" },
	]);
	
	var Templates = {
		GamePage:{
			name: "game.GamePage",
			init: function(control) {
				
			},
			childs:[
				[/*UIStage*/UI[0],, /*id:*/ "game", /*left:*/ 0, /*top:*/ 0,,, /*width:*/ 710, /*height:*/ 1280,,,,,,,,,,,,,/*childs*/ [
					{ type: "Image", src:/*image/bg*/ RES[0] },
					{ type: "Image", src:/*game/wall2*/ RES[1], anchorX:0.5, anchorY:0.5, x:242, y:920.5 },
					{ type: "Image", src:/*game/wall*/ RES[2], angle:-33, x:738, y:535, anchorX:0.5, anchorY:0.5 },
					{ type: "Image", src:/*game/wall*/ RES[2], angle:32, x:562, y:95, anchorX:0.5, anchorY:0.5 },
					{ type: "Image", src:/*game/hole*/ RES[3], anchorX:0.5, anchorY:0.5, x:318, y:578.5, width:246, height:119 },
				]],
				[/*Control*/UI[1],, /*id:*/ "touch",,,,, /*width:*/ "100%", /*height:*/ "100%"],
				[/*Group*/UI[2],, /*id:*/ "intro",,,,, /*width:*/ "100%", /*height:*/ "100%",,,,,,,,,,,,,/*childs*/ [
					[/*RectFill*/UI[3], /*props:*/ {color: "#000"},,,,,, /*width:*/ "100%", /*height:*/ "100%",,, /*opacity:*/ 0.3],
					[/*Group*/UI[2],,,,,,, /*width:*/ "100%", /*height:*/ 600,, /*y:*/ "50%",,,,,,,,,,,/*childs*/ [
						[/*Image*/UI[4], /*props:*/ {src: /*image/说明*/ RES[4]},,,,,,,, /*x:*/ "50%"],
						[/*game.Button*/UI[5], /*props:*/ {label: "确定"}, /*id:*/ "ok2Btn",, /*top:*/ 400,,, /*width:*/ 195, /*height:*/ 70, /*x:*/ "50%"],
					]],
				]],
				[/*Group*/UI[2],, /*id:*/ "helpPage",,,,, /*width:*/ "100%", /*height:*/ "100%",,,, /*visible:*/ false,,,,,,,,,/*childs*/ [
					[/*RectFill*/UI[3], /*props:*/ {color: "#000"},,,,,, /*width:*/ "100%", /*height:*/ "100%",,, /*opacity:*/ 0.3],
					[/*Image*/UI[4], /*props:*/ {src: /*image/活动规则*/ RES[5]},,, /*top:*/ 160,,,,, /*x:*/ "50%"],
					[/*Group*/UI[2],,,, /*top:*/ 900,, /*bottom:*/ 0, /*width:*/ "100%",,,,,,,,,,,,,,/*childs*/ [
						[/*game.Button*/UI[5], /*props:*/ {label: "已知晓"}, /*id:*/ "okBtn",, /*top:*/ "30%",,, /*width:*/ 195, /*height:*/ 70, /*x:*/ "50%"],
					]],
				]],
				[/*Group*/UI[2],, /*id:*/ "clock",,,,, /*width:*/ 66, /*height:*/ 66, /*x:*/ 611, /*y:*/ 127,, /*visible:*/ false,,,,,,,,,/*childs*/ [
					[/*Image*/UI[4], /*props:*/ {src: /*game/clock*/ RES[6]}],
					[/*Label*/UI[6], /*props:*/ {font: "34px", color: "#fff", align: 5}, /*id:*/ "time",,,,, /*width:*/ "100%", /*height:*/ "100%"],
				]],
				[/*Image*/UI[4], /*props:*/ {src: /*game/disk*/ RES[7]}, /*id:*/ "disk",,,,,,,,,, /*visible:*/ false],
				[/*Group*/UI[2], /*props:*/ {textStyle: "gameHead"},,,,,, /*width:*/ "100%", /*height:*/ 70,,,,,,,,,,,,,/*childs*/ [
					[/*RectFill*/UI[3], /*props:*/ {color: "#2c296e"},,,,,, /*width:*/ "100%", /*height:*/ 70],
					[/*RectFill*/UI[3], /*props:*/ {color: "#6854aa"},,, /*top:*/ 70,,, /*width:*/ "100%", /*height:*/ 2],
					[/*Image*/UI[4],, /*id:*/ "avatar", /*left:*/ 28, /*top:*/ 13,,, /*width:*/ 50, /*height:*/ 50],
					[/*Label*/UI[6], /*props:*/ {format: 8}, /*id:*/ "name", /*left:*/ 87, /*top:*/ 24,,, /*width:*/ 200, /*height:*/ 27],
					[/*Label*/UI[6], /*props:*/ {text: "得分 0"}, /*id:*/ "score", /*left:*/ 290, /*top:*/ 24,,, /*width:*/ 140, /*height:*/ 27],
					[/*Label*/UI[6], /*props:*/ {text: "机会 5"}, /*id:*/ "chance", /*left:*/ 430, /*top:*/ 24,,, /*width:*/ 120, /*height:*/ 27],
					[/*game.Button*/UI[5], /*props:*/ {label: "说明"}, /*id:*/ "help", /*left:*/ 510, /*top:*/ 24,,, /*width:*/ 130, /*height:*/ 30,,,,,,,,,,, /*childsProperty*/{bk: { src: "" }, label: { color: "#5186ff" }}],
					[/*game.Checkbox*/UI[7],, /*id:*/ "sound", /*left:*/ 630, /*top:*/ 8,,, /*width:*/ 56,,,,,,,,,,,, /*childsProperty*/{icon: { src: /*ui/btn/喇叭*/ RES[8] }, checkImg: { src: /*ui/btn/喇叭check*/ RES[9] }}],
				]],
			]
		},
	}
	ui.registerTemplates(Templates);
	export class Button extends ui.Control {
		static ClassName = "game.Button";
		static instance: game.Button;
		static Styles = {
			blue:{ childsProperty:{ bk:{ src: /*ui/btn/blue*/ RES[10] } } },
			purple:{ childsProperty:{ bk:{ src: /*ui/btn/purple*/ RES[11] } } },
			yellow:{ childsProperty:{ bk:{ src: /*ui/btn/yellow*/ RES[12] },label:{ gradient: { y0:0, y1:30, colors: ['#a54800', '#ce7300'] } } } }
		};
		static Properties: ui.PropDefine[] = [
			{ name: "label", type: "string" },
			{ name: "style", type: "string", customProperty: true }
		];
		static States = {
			normal: {  },
			down: {  }
		};
		private static _childs = [
			[/*Image*/UI[4], /*props:*/ {src: /*ui/btn/blue*/ RES[10]}, /*id:*/ "bk",,,,, /*width:*/ "100%", /*height:*/ "100%"],
			[/*Label*/UI[6], /*props:*/ {font: "30px", color: "#fff", align: 1}, /*id:*/ "label",,,,, /*width:*/ "100%", /*height:*/ 30,, /*y:*/ "50%"]
		];
		constructor(parent: ui.Container, template?:ui.Template){
			super(parent);
			this._init(Button);
			if(template){
				this._createChilds(template.childs)
				template.init(this);
			}
			else
				this._createChilds(Button._childs);
			const n = this.namedChilds;
			this._initStates("normal", Button.States);
			this.bind("label", n.label, "text");
			this.width = 194;
			this.height = 70;
		}
		public label:string;
		public style:"blue"|"purple"|"yellow"|string;
		public get namedChilds(): { 
			bk: ui.Image,
			label: ui.Label }
		{ return <any>this._namedChilds; }
	}
	ui.initUIClass(Button, ui.Control);
	ui.addButtonEventHandler(Button, 0.8);
	
	export class Checkbox extends ui.Control {
		static ClassName = "game.Checkbox";
		static instance: game.Checkbox;
		static States = {
			check: { props: { childsProperty:{ checkImg:{ visible: true } } } },
			uncheck: { props: { childsProperty:{ checkImg:{ visible: false } } } }
		};
		private static _childs = [
			[/*Image*/UI[4],, /*id:*/ "icon",,,,, /*width:*/ "100%", /*height:*/ "100%"],
			[/*Image*/UI[4],, /*id:*/ "checkImg",,,,, /*width:*/ "100%", /*height:*/ "100%"]
		];
		constructor(parent: ui.Container, template?:ui.Template){
			super(parent);
			if(template){
				this._createChilds(template.childs)
				template.init(this);
			}
			else
				this._createChilds(Checkbox._childs);
			const n = this.namedChilds;
			this._initStates("uncheck", Checkbox.States);
		}
		public get namedChilds(): { 
			icon: ui.Image,
			checkImg: ui.Image }
		{ return <any>this._namedChilds; }
	}
	ui.initUIClass(Checkbox, ui.Control);
	ui.addCheckboxEventHandler(Checkbox, 0.8);
	
	export class templates extends ui.Container {
		static ClassName = "game.templates";
		static instance: game.templates;
		constructor(parent: ui.Container, template?:ui.Template){
			super(parent);
			if(template){
				this._createChilds(template.childs)
				template.init(this);
			}
		}
	}
	ui.initUIClass(templates, ui.Container);
	
	export class _GamePage extends ui.Container {
		static ClassName = "game.GamePage";
		static instance: game.GamePage;
		private static _childs = [
			[/*UIStage*/UI[0],, /*id:*/ "game", /*left:*/ 0, /*top:*/ 0,,, /*width:*/ 710, /*height:*/ 1280,,,,,,,,,,,,,/*childs*/ [
				{ type: "Image", src:/*image/bg*/ RES[0] },
				{ type: "Image", src:/*game/wall2*/ RES[1], anchorX:0.5, anchorY:0.5, x:242, y:920.5 },
				{ type: "Image", src:/*game/wall*/ RES[2], angle:-33, x:738, y:535, anchorX:0.5, anchorY:0.5 },
				{ type: "Image", src:/*game/wall*/ RES[2], angle:32, x:562, y:95, anchorX:0.5, anchorY:0.5 },
				{ type: "Image", src:/*game/hole*/ RES[3], anchorX:0.5, anchorY:0.5, x:318, y:578.5, width:246, height:119 },
			]],
			[/*Control*/UI[1],, /*id:*/ "touch",,,,, /*width:*/ "100%", /*height:*/ "100%"],
			[/*Group*/UI[2],, /*id:*/ "intro",,,,, /*width:*/ "100%", /*height:*/ "100%",,,,,,,,,,,,,/*childs*/ [
				[/*RectFill*/UI[3], /*props:*/ {color: "#000"},,,,,, /*width:*/ "100%", /*height:*/ "100%",,, /*opacity:*/ 0.3],
				[/*Group*/UI[2],,,,,,, /*width:*/ "100%", /*height:*/ 600,, /*y:*/ "50%",,,,,,,,,,,/*childs*/ [
					[/*Image*/UI[4], /*props:*/ {src: /*image/说明*/ RES[4]},,,,,,,, /*x:*/ "50%"],
					[/*game.Button*/UI[5], /*props:*/ {label: "确定"}, /*id:*/ "ok2Btn",, /*top:*/ 400,,, /*width:*/ 195, /*height:*/ 70, /*x:*/ "50%"],
				]],
			]],
			[/*Group*/UI[2],, /*id:*/ "helpPage",,,,, /*width:*/ "100%", /*height:*/ "100%",,,, /*visible:*/ false,,,,,,,,,/*childs*/ [
				[/*RectFill*/UI[3], /*props:*/ {color: "#000"},,,,,, /*width:*/ "100%", /*height:*/ "100%",,, /*opacity:*/ 0.3],
				[/*Image*/UI[4], /*props:*/ {src: /*image/活动规则*/ RES[5]},,, /*top:*/ 160,,,,, /*x:*/ "50%"],
				[/*Group*/UI[2],,,, /*top:*/ 900,, /*bottom:*/ 0, /*width:*/ "100%",,,,,,,,,,,,,,/*childs*/ [
					[/*game.Button*/UI[5], /*props:*/ {label: "已知晓"}, /*id:*/ "okBtn",, /*top:*/ "30%",,, /*width:*/ 195, /*height:*/ 70, /*x:*/ "50%"],
				]],
			]],
			[/*Group*/UI[2],, /*id:*/ "clock",,,,, /*width:*/ 66, /*height:*/ 66, /*x:*/ 611, /*y:*/ 127,, /*visible:*/ false,,,,,,,,,/*childs*/ [
				[/*Image*/UI[4], /*props:*/ {src: /*game/clock*/ RES[6]}],
				[/*Label*/UI[6], /*props:*/ {font: "34px", color: "#fff", align: 5}, /*id:*/ "time",,,,, /*width:*/ "100%", /*height:*/ "100%"],
			]],
			[/*Image*/UI[4], /*props:*/ {src: /*game/disk*/ RES[7]}, /*id:*/ "disk",,,,,,,,,, /*visible:*/ false],
			[/*Group*/UI[2], /*props:*/ {textStyle: "gameHead"},,,,,, /*width:*/ "100%", /*height:*/ 70,,,,,,,,,,,,,/*childs*/ [
				[/*RectFill*/UI[3], /*props:*/ {color: "#2c296e"},,,,,, /*width:*/ "100%", /*height:*/ 70],
				[/*RectFill*/UI[3], /*props:*/ {color: "#6854aa"},,, /*top:*/ 70,,, /*width:*/ "100%", /*height:*/ 2],
				[/*Image*/UI[4],, /*id:*/ "avatar", /*left:*/ 28, /*top:*/ 13,,, /*width:*/ 50, /*height:*/ 50],
				[/*Label*/UI[6], /*props:*/ {format: 8}, /*id:*/ "name", /*left:*/ 87, /*top:*/ 24,,, /*width:*/ 200, /*height:*/ 27],
				[/*Label*/UI[6], /*props:*/ {text: "得分 0"}, /*id:*/ "score", /*left:*/ 290, /*top:*/ 24,,, /*width:*/ 140, /*height:*/ 27],
				[/*Label*/UI[6], /*props:*/ {text: "机会 5"}, /*id:*/ "chance", /*left:*/ 430, /*top:*/ 24,,, /*width:*/ 120, /*height:*/ 27],
				[/*game.Button*/UI[5], /*props:*/ {label: "说明"}, /*id:*/ "help", /*left:*/ 510, /*top:*/ 24,,, /*width:*/ 130, /*height:*/ 30,,,,,,,,,,, /*childsProperty*/{bk: { src: "" }, label: { color: "#5186ff" }}],
				[/*game.Checkbox*/UI[7],, /*id:*/ "sound", /*left:*/ 630, /*top:*/ 8,,, /*width:*/ 56,,,,,,,,,,,, /*childsProperty*/{icon: { src: /*ui/btn/喇叭*/ RES[8] }, checkImg: { src: /*ui/btn/喇叭check*/ RES[9] }}],
			]]
		];
		constructor(parent: ui.Container, template?:ui.Template){
			super(parent);
			template = template || Templates.GamePage;
			if(template){
				this._createChilds(template.childs)
				template.init(this);
			}
			else
				this._createChilds(_GamePage._childs);
			const n = this.namedChilds;
			this.width = "100%";
			this.height = "100%";
		}
		public get namedChilds(): { 
			game: ui.UIStage,
			touch: ui.Control,
			intro: ui.Group,
			ok2Btn: game.Button,
			helpPage: ui.Group,
			okBtn: game.Button,
			clock: ui.Group,
			time: ui.Label,
			disk: ui.Image,
			avatar: ui.Image,
			name: ui.Label,
			score: ui.Label,
			chance: ui.Label,
			help: game.Button,
			sound: game.Checkbox }
		{ return <any>this._namedChilds; }
			
		
	}
	ez.initCall(() => { ui.initUIClass(game.GamePage, ui.Container) });
	
	export class MainFrame extends ui.Container {
		static ClassName = "game.MainFrame";
		static instance: game.MainFrame;
		private static _childs = [
			[/*RectFill*/UI[3], /*props:*/ {gradient: { y1: 1280, colors:['#010036', '#4e004f'] }}, /*id:*/ "bg",,,,, /*width:*/ "100%", /*height:*/ "100%"],
			[/*Group*/UI[2],, /*id:*/ "frame",,,,, /*width:*/ "100%", /*height:*/ "100%",,,,,,,,,,,,,/*childs*/ [
				[/*game.StartPage*/UI[8]],
			]]
		];
		constructor(parent: ui.Container, template?:ui.Template){
			super(parent);
			if(template){
				this._createChilds(template.childs)
				template.init(this);
			}
			else
				this._createChilds(MainFrame._childs);
			const n = this.namedChilds;
			this.width = "100%";
			this.height = "100%";
		}
		public get namedChilds(): { 
			bg: ui.RectFill,
			frame: ui.Group }
		{ return <any>this._namedChilds; }
	}
	ui.initUIClass(MainFrame, ui.Container);
	
	export class ResultPage extends ui.Container {
		static ClassName = "game.ResultPage";
		static instance: game.ResultPage;
		private static _childs = [
			[/*Image*/UI[4], /*props:*/ {src: /*ui/img/奖杯*/ RES[13]},, /*left:*/ 198, /*top:*/ 77,,, /*width:*/ 336, /*height:*/ 322],
			[/*Label*/UI[6], /*props:*/ {text: "本局得分", align: 1},,, /*top:*/ 462,,, /*width:*/ 119, /*height:*/ 29, /*x:*/ "50%"],
			[/*Label*/UI[6], /*props:*/ {text: "1000", strokeWidth: 4, strokeColor: "#9b8ddd", font: "50px", gradient: {y1:50, colors:['#a995ff', '#8670f4']}}, /*id:*/ "score",, /*top:*/ 395,,, /*width:*/ 280, /*height:*/ 58, /*x:*/ "50%"],
			[/*Label*/UI[6],, /*id:*/ "info",, /*top:*/ 530,,, /*width:*/ 283, /*height:*/ 32, /*x:*/ "50%"],
			[/*Image*/UI[4], /*props:*/ {src: /*ui/img/line*/ RES[14]},, /*left:*/ 177, /*top:*/ 503,,, /*width:*/ 360, /*height:*/ 2],
			[/*Image*/UI[4], /*props:*/ {src: /*ui/img/line*/ RES[14]},, /*left:*/ 177, /*top:*/ 579,,, /*width:*/ 360, /*height:*/ 2],
			[/*game.Button*/UI[5], /*props:*/ {label: "查看排行榜", style: "blue"}, /*id:*/ "rank",, /*top:*/ 669,,, /*width:*/ 195, /*height:*/ 70, /*x:*/ "50%"],
			[/*game.Button*/UI[5], /*props:*/ {label: "生成成绩单", style: "blue"}, /*id:*/ "result",, /*top:*/ 769,,, /*width:*/ 195, /*height:*/ 70, /*x:*/ "50%"],
			[/*Group*/UI[2],,,, /*top:*/ 840,, /*bottom:*/ 0, /*width:*/ "100%",,,,,,,,,,,,,,/*childs*/ [
				[/*game.Button*/UI[5], /*props:*/ {label: "再玩一次", style: "purple"}, /*id:*/ "replay",,,,, /*width:*/ 195, /*height:*/ 70, /*x:*/ "50%", /*y:*/ "50%"],
			]],
			[/*game.RankPage*/UI[9],, /*id:*/ "rankPage",,,,,,,,,, /*visible:*/ false]
		];
		constructor(parent: ui.Container, template?:ui.Template){
			super(parent);
			if(template){
				this._createChilds(template.childs)
				template.init(this);
			}
			else
				this._createChilds(ResultPage._childs);
			const n = this.namedChilds;
			this.width = "100%";
			this.height = "100%";
			this.textStyle = "normalCenter";
		}
		public get namedChilds(): { 
			score: ui.Label,
			info: ui.Label,
			rank: game.Button,
			result: game.Button,
			replay: game.Button,
			rankPage: game.RankPage }
		{ return <any>this._namedChilds; }
	}
	ui.initUIClass(ResultPage, ui.Container);
	
	export class SharePage extends ui.Container {
		static ClassName = "game.SharePage";
		static instance: game.SharePage;
		private static _childs = [
			[/*RectFill*/UI[3], /*props:*/ {gradient: { y1: 1280, colors:['#010036', '#4e004f'] }}, /*id:*/ "bg",,,,, /*width:*/ "100%", /*height:*/ "100%"],
			[/*Image*/UI[4], /*props:*/ {src: /*share/logo*/ RES[15]},, /*left:*/ 64, /*top:*/ 92,,, /*width:*/ 323, /*height:*/ 46],
			[/*Image*/UI[4], /*props:*/ {src: /*share/rect*/ RES[16]},, /*left:*/ 81, /*top:*/ 300,,, /*width:*/ 522, /*height:*/ 231],
			[/*Label*/UI[6], /*props:*/ {text: "姓名："}, /*id:*/ "name", /*left:*/ 114, /*top:*/ 337,,, /*width:*/ 383, /*height:*/ 37],
			[/*Label*/UI[6], /*props:*/ {text: "成绩：10000"}, /*id:*/ "score", /*left:*/ 114, /*top:*/ 387,,, /*width:*/ 383, /*height:*/ 37],
			[/*Label*/UI[6],, /*id:*/ "info", /*left:*/ 114, /*top:*/ 439,,, /*width:*/ 383, /*height:*/ 37],
			[/*Image*/UI[4], /*props:*/ {src: /*share/text猪望仔大战蝙蝠侠*/ RES[17]},, /*left:*/ 65, /*top:*/ 165,,, /*width:*/ 477, /*height:*/ 57],
			[/*Label*/UI[6], /*props:*/ {font: "28px", color: "#bbadfb", lineHeight: 48, format: 2, text: "2020“创青春 交子杯”新网银行金融科技挑战赛\n47万奖金池，最高 10 万奖金等你来拿！\n是时候展现你真正的技术了！"},, /*left:*/ 68, /*top:*/ 575,,, /*width:*/ 585, /*height:*/ 137],
			[/*Group*/UI[2],,,, /*top:*/ 700,, /*bottom:*/ 0, /*width:*/ 300,, /*x:*/ "50%",,,,,,,,,,,,/*childs*/ [
				[/*Group*/UI[2],,,,,,, /*width:*/ 300, /*height:*/ 332,, /*y:*/ "50%",,,,,,,,,,,/*childs*/ [
					[/*Image*/UI[4], /*props:*/ {src: /*share/二维码*/ RES[18]}, /*id:*/ "share",,,,, /*width:*/ 300, /*height:*/ 332],
				]],
			]]
		];
		constructor(parent: ui.Container, template?:ui.Template){
			super(parent);
			if(template){
				this._createChilds(template.childs)
				template.init(this);
			}
			else
				this._createChilds(SharePage._childs);
			const n = this.namedChilds;
			this.width = "100%";
			this.height = "100%";
			this.textStyle = "normal";
			this.ownerBuffer = true;
		}
		public get namedChilds(): { 
			bg: ui.RectFill,
			name: ui.Label,
			score: ui.Label,
			info: ui.Label,
			share: ui.Image }
		{ return <any>this._namedChilds; }
	}
	ui.initUIClass(SharePage, ui.Container);
	
	export class Splash extends ui.Container {
		static ClassName = "game.Splash";
		static instance: game.Splash;
		private static _childs = [
			[/*Image*/UI[4], /*props:*/ {src: /*logo*/ RES[19]},,,,,,,, /*x:*/ "50%", /*y:*/ "50%"]
		];
		constructor(parent: ui.Container, template?:ui.Template){
			super(parent);
			if(template){
				this._createChilds(template.childs)
				template.init(this);
			}
			else
				this._createChilds(Splash._childs);
			this.width = "100%";
			this.height = "100%";
		}
	}
	ui.initUIClass(Splash, ui.Container);
	
	export class _RankItem extends ui.Container {
		static ClassName = "game.RankItem";
		static instance: game.RankItem;
		private static _childs = [
			[/*Label*/UI[6], /*props:*/ {color: "#42464d", align: 1, format: 8}, /*id:*/ "name", /*left:*/ 217, /*top:*/ 24,,, /*width:*/ 180, /*height:*/ 25],
			[/*Label*/UI[6], /*props:*/ {color: "#42464d", align: 1}, /*id:*/ "rank", /*left:*/ 20, /*top:*/ 23,,, /*width:*/ 50, /*height:*/ 17,,,, /*visible:*/ false],
			[/*Label*/UI[6], /*props:*/ {color: "#e04f00", align: 1}, /*id:*/ "score", /*left:*/ 409, /*top:*/ 24,,, /*width:*/ 112, /*height:*/ 25],
			[/*Image*/UI[4], /*props:*/ {effect: "mask", effectParams: {mask: 'mask'}}, /*id:*/ "avatar", /*left:*/ 127, /*top:*/ 7,,, /*width:*/ 74, /*height:*/ 74],
			[/*RectFill*/UI[3], /*props:*/ {color: "#F0F0F0"},, /*left:*/ 0, /*top:*/ 86,,, /*width:*/ 530, /*height:*/ 2],
			[/*Image*/UI[4], /*props:*/ {src: /*ui/icon/1st*/ RES[20]}, /*id:*/ "rankIcon", /*left:*/ 27, /*top:*/ 15,,, /*width:*/ 44, /*height:*/ 48]
		];
		constructor(parent: ui.Container, template?:ui.Template){
			super(parent);
			if(template){
				this._createChilds(template.childs)
				template.init(this);
			}
			else
				this._createChilds(_RankItem._childs);
			const n = this.namedChilds;
			this.width = 530;
			this.height = 88;
		}
		public get namedChilds(): { 
			name: ui.Label,
			rank: ui.Label,
			score: ui.Label,
			avatar: ui.Image,
			rankIcon: ui.Image }
		{ return <any>this._namedChilds; }
	}
	ez.initCall(() => { ui.initUIClass(game.RankItem, ui.Container) });
	
	export class RankPage extends ui.Container {
		static ClassName = "game.RankPage";
		static instance: game.RankPage;
		private static _childs = [
			[/*Image*/UI[4], /*props:*/ {src: /*ui/img/rectbk*/ RES[21]},, /*left:*/ 0, /*top:*/ 0,,, /*width:*/ 640, /*height:*/ 1300],
			[/*Image*/UI[4], /*props:*/ {src: /*ui/img/rectwh*/ RES[22]},, /*left:*/ 45, /*top:*/ 219,,, /*width:*/ 540, /*height:*/ 806],
			[/*game.Button*/UI[5],, /*id:*/ "closeRank", /*left:*/ 566, /*top:*/ 200,,, /*width:*/ 39, /*height:*/ 38,,,,,,,,,,, /*childsProperty*/{bk: { src: /*ui/btn/close*/ RES[23] }}],
			[/*RectFill*/UI[3], /*props:*/ {color: "#F2F2F4"},, /*left:*/ 45, /*top:*/ 319,,, /*width:*/ 540, /*height:*/ 78],
			[/*Label*/UI[6], /*props:*/ {text: "排行"},, /*left:*/ 74, /*top:*/ 344,,, /*width:*/ 58, /*height:*/ 28],
			[/*Label*/UI[6], /*props:*/ {text: "头像"},, /*left:*/ 190, /*top:*/ 344,,, /*width:*/ 58, /*height:*/ 28],
			[/*Label*/UI[6], /*props:*/ {text: "昵称"},, /*left:*/ 334, /*top:*/ 344,,, /*width:*/ 58, /*height:*/ 28],
			[/*Label*/UI[6], /*props:*/ {text: "成绩"},, /*left:*/ 478, /*top:*/ 344,,, /*width:*/ 58, /*height:*/ 28],
			[/*Label*/UI[6], /*props:*/ {font: "32px", text: "排行榜TOP100", color: "#494b59"},, /*left:*/ 246, /*top:*/ 253,,, /*width:*/ 220, /*height:*/ 34],
			[/*Image*/UI[4], /*props:*/ {src: /*ui/icon/cup*/ RES[24]},, /*left:*/ 187, /*top:*/ 246,,, /*width:*/ 44, /*height:*/ 49],
			[/*ScrollView*/UI[10], /*props:*/ {scrollMode: 2},, /*left:*/ 50, /*top:*/ 402,,, /*width:*/ 532, /*height:*/ 617,,,,,,,,,,,,,/*childs*/ [
				[/*ListView*/UI[11], /*props:*/ {itemClass: "game.RankItem", culling: true}, /*id:*/ "rankList",,,,, /*width:*/ 532],
			]]
		];
		constructor(parent: ui.Container, template?:ui.Template){
			super(parent);
			if(template){
				this._createChilds(template.childs)
				template.init(this);
			}
			else
				this._createChilds(RankPage._childs);
			const n = this.namedChilds;
			this.width = 640;
			this.height = 1300;
			this.left = 33;
			this.top = 0;
			this.textStyle = "rankPage";
		}
		public get namedChilds(): { 
			closeRank: game.Button,
			rankList: ui.ListView }
		{ return <any>this._namedChilds; }
	}
	ui.initUIClass(RankPage, ui.Container);
	
	export class _StartPage extends ui.Container {
		static ClassName = "game.StartPage";
		static instance: game.StartPage;
		private static _childs = [
			[/*Image*/UI[4], /*props:*/ {src: /*image/bg*/ RES[0]}],
			[/*Group*/UI[2],, /*id:*/ "mainPage",,,,, /*width:*/ "100%", /*height:*/ "100%",,,,,,,,,,,,,/*childs*/ [
				[/*UIStage*/UI[0],, /*id:*/ "stage",,,,, /*width:*/ "100%", /*height:*/ 1280,, /*y:*/ "50%",,,,,,,,,,,/*childs*/ [
					{ type: "Image", id:"蝙蝠侠", src:/*start/蝙蝠侠*/ RES[25], x:515, y:812, anchorX:0.5, anchorY:0.5 },
					{ type: "Image", id:"猪", src:/*start/猪*/ RES[26], x:38, y:112 },
					{ type: "Image", src:/*start/txt蝙蝠侠*/ RES[27], x:132, y:538 },
					{ type: "Image", src:/*start/txt猪望仔*/ RES[28], x:103, y:402 },
				]],
				[/*Image*/UI[4], /*props:*/ {src: /*start/logo*/ RES[29]},,,,, /*bottom:*/ "10%", /*width:*/ 237, /*height:*/ 34, /*x:*/ "50%"],
				[/*game.Button*/UI[5],, /*id:*/ "help", /*left:*/ 80,,, /*bottom:*/ "15%", /*width:*/ 218, /*height:*/ 85,,,,,,,,,,, /*childsProperty*/{bk: { src: /*start/活动规则*/ RES[30] }}],
				[/*game.Button*/UI[5],, /*id:*/ "start",,, /*right:*/ 80, /*bottom:*/ "15%", /*width:*/ 218, /*height:*/ 85,,,,,,,,,,, /*childsProperty*/{bk: { src: /*start/开始游戏*/ RES[31] }}],
				[/*game.Button*/UI[5], /*props:*/ {style: "yellow", label: "排行榜"}, /*id:*/ "rank", /*left:*/ 44, /*top:*/ 92,,, /*width:*/ 146, /*height:*/ 54],
			]],
			[/*game.Checkbox*/UI[7],, /*id:*/ "sound", /*left:*/ 570, /*top:*/ 92,,, /*width:*/ 56, /*height:*/ 59,,,,,,,,,,, /*childsProperty*/{icon: { src: /*ui/btn/喇叭*/ RES[8] }, checkImg: { src: /*ui/btn/喇叭check*/ RES[9] }}],
			[/*Group*/UI[2],, /*id:*/ "helpPage",,,,, /*width:*/ "100%", /*height:*/ "100%",,,, /*visible:*/ false,,,,,,,,,/*childs*/ [
				[/*Image*/UI[4], /*props:*/ {src: /*image/活动规则*/ RES[5]},,, /*top:*/ 160,,,,, /*x:*/ "50%"],
				[/*Group*/UI[2],,,, /*top:*/ 900,, /*bottom:*/ 0, /*width:*/ "100%",,,,,,,,,,,,,,/*childs*/ [
					[/*game.Button*/UI[5], /*props:*/ {label: "已知晓"}, /*id:*/ "okBtn",, /*top:*/ "30%",,, /*width:*/ 195, /*height:*/ 70, /*x:*/ "50%"],
				]],
			]],
			[/*game.RankPage*/UI[9],, /*id:*/ "rankPage",,,,,,,,,, /*visible:*/ false]
		];
		constructor(parent: ui.Container, template?:ui.Template){
			super(parent);
			if(template){
				this._createChilds(template.childs)
				template.init(this);
			}
			else
				this._createChilds(_StartPage._childs);
			const n = this.namedChilds;
			this.width = "100%";
			this.height = "100%";
		}
		public get namedChilds(): { 
			mainPage: ui.Group,
			stage: ui.UIStage,
			help: game.Button,
			start: game.Button,
			rank: game.Button,
			sound: game.Checkbox,
			helpPage: ui.Group,
			okBtn: game.Button,
			rankPage: game.RankPage }
		{ return <any>this._namedChilds; }
	}
	ez.initCall(() => { ui.initUIClass(game.StartPage, ui.Container) });
	
}
