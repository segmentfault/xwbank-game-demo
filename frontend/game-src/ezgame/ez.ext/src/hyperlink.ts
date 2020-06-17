namespace ez.ui{
	/** 
	* 超链接元素
	*/
	export class Hyperlink extends Control {
		static ClassName = "Hyperlink";
		static instance: Hyperlink;
		static States: Dictionary<ControlStateData> = { normal: {}, down: {} };
		static Properties: PropDefine[] = [
			{ name: "href", type: "string" }
		];
		_label: Label;

		constructor(parent: Container) {
			super(parent);
			this._createChilds([
				{ class: "Label", id: "label", width: "100%", height: "100%" }
			]);
			this._init(Hyperlink);
			this._initStates("normal", Hyperlink.States);
			this._label = <Label>this._namedChilds["label"];
		}
		public get namedChilds(): { label: Label } {
			return <any>this._namedChilds;
		}
		onTouchBegin = function (d: TouchData) {
			d.capture();
			this.state = "down";
		}
		onTouchCancel = function (id: number) {
			if (this.state == "down")
				this.state = "normal";
		}
		onTouchEnd = function (d: TouchData) {
			if (this.state == "down") {
				this.state = "normal";
				var pt = this.screenToClient(d.screenX, d.screenY);
				if (this.hitTest(pt.x, pt.y))
					this.fireEvent("click", this.href);
			}
		}
		public href: string;
	}
	initUIClass(Hyperlink, Control);
	addButtonEventHandler(Hyperlink, 0.9);
}