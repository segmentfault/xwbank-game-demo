var ez;
(function (ez) {
    var ui;
    (function (ui) {
        class Hyperlink extends ui.Control {
            constructor(parent) {
                super(parent);
                this.onTouchBegin = function (d) {
                    d.capture();
                    this.state = "down";
                };
                this.onTouchCancel = function (id) {
                    if (this.state == "down")
                        this.state = "normal";
                };
                this.onTouchEnd = function (d) {
                    if (this.state == "down") {
                        this.state = "normal";
                        var pt = this.screenToClient(d.screenX, d.screenY);
                        if (this.hitTest(pt.x, pt.y))
                            this.fireEvent("click", this.href);
                    }
                };
                this._createChilds([
                    { class: "Label", id: "label", width: "100%", height: "100%" }
                ]);
                this._init(Hyperlink);
                this._initStates("normal", Hyperlink.States);
                this._label = this._namedChilds["label"];
            }
            get namedChilds() {
                return this._namedChilds;
            }
        }
        Hyperlink.ClassName = "Hyperlink";
        Hyperlink.States = { normal: {}, down: {} };
        Hyperlink.Properties = [
            { name: "href", type: "string" }
        ];
        ui.Hyperlink = Hyperlink;
        ui.initUIClass(Hyperlink, ui.Control);
        ui.addButtonEventHandler(Hyperlink, 0.9);
    })(ui = ez.ui || (ez.ui = {}));
})(ez || (ez = {}));

//# sourceMappingURL=hyperlink.js.map
