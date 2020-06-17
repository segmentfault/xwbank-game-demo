var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ez;
(function (ez) {
    var ui;
    (function (ui) {
        var Hyperlink = (function (_super) {
            __extends(Hyperlink, _super);
            function Hyperlink(parent) {
                var _this = _super.call(this, parent) || this;
                _this.onTouchBegin = function (d) {
                    d.capture();
                    this.state = "down";
                };
                _this.onTouchCancel = function (id) {
                    if (this.state == "down")
                        this.state = "normal";
                };
                _this.onTouchEnd = function (d) {
                    if (this.state == "down") {
                        this.state = "normal";
                        var pt = this.screenToClient(d.screenX, d.screenY);
                        if (this.hitTest(pt.x, pt.y))
                            this.fireEvent("click", this.href);
                    }
                };
                _this._createChilds([
                    { class: "Label", id: "label", width: "100%", height: "100%" }
                ]);
                _this._init(Hyperlink);
                _this._initStates("normal", Hyperlink.States);
                _this._label = _this._namedChilds["label"];
                return _this;
            }
            Object.defineProperty(Hyperlink.prototype, "namedChilds", {
                get: function () {
                    return this._namedChilds;
                },
                enumerable: true,
                configurable: true
            });
            Hyperlink.ClassName = "Hyperlink";
            Hyperlink.States = { normal: {}, down: {} };
            Hyperlink.Properties = [
                { name: "href", type: "string" }
            ];
            return Hyperlink;
        }(ui.Control));
        ui.Hyperlink = Hyperlink;
        ui.initUIClass(Hyperlink, ui.Control);
        ui.addButtonEventHandler(Hyperlink, 0.9);
    })(ui = ez.ui || (ez.ui = {}));
})(ez || (ez = {}));

//# sourceMappingURL=hyperlink.js.map
