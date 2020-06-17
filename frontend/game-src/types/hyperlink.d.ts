declare namespace ez.ui {

    /**
    * 超链接元素
    */
    class Hyperlink extends Control {

        readonly namedChilds: {
            label: Label;
        };

        static ClassName: string;

        static instance: Hyperlink;

        static States: Dictionary<ControlStateData>;

        static Properties: PropDefine[];

        _label: Label;

        constructor(parent: Container);

        onTouchBegin: (d: TouchData) => void;

        onTouchCancel: (id: number) => void;

        onTouchEnd: (d: TouchData) => void;

        href: string;
	}
}