declare namespace ez {

    interface BMFontCharInfo {

        rect: Rect;

        xOff: number;

        yOff: number;

        advance: number;
	}

    interface BMFontDesc {

        src: string;

        size: number;

        lineHeight: number;

        baseline: number;

        chars: number[][];

        name?: string;

        dict?: Dictionary<BMFontCharInfo>;
	}

    interface BMFontTextMetricLine {

        width: number;

        height: number;

        text: string;

        newLine: boolean;
	}

    function registerBMFont(name: string, desc: BMFontDesc): void;

    class BMTextMetric extends TextMetric {

        _fnt: BMFontDesc;

        constructor(font: string);

        textWidth(text: string): number;

        measureLine(text: string, maxWidth: number, wordBreak: boolean): Array<TextMetricLine>;

        measureText(text: any, width: number, height: number, format: TextFormat): void;
	}

    /**
     * 图片文本对象
     */
    class BMFontLabelSprite extends LabelSprite {

        readonly textMetric: TextMetric;

        set lineHeight(val: number);

        font: string;

        static Type: string;

        getType(): string;

        _dispose(): void;

        constructor(parent: Stage, id?: string);

        protected _draw(rc: IRenderContext, opacity: number): boolean;
	}
}

declare namespace ez.ui {

    /**
    * 图片文本元素，包装BMFontLabelSprite
    */
    class BMFontLabel extends Visual {

        static ClassName: string;

        static instance: BMFontLabel;

        static Properties: PropDefine[];

        constructor(parent: Container);

        measureBound(width: number, height: number, force?: boolean): void;

        /** 获取sprite对象 */
        sprite: BMFontLabelSprite;

        text: string;

        font: string;

        format: TextFormat;

        lineHeight: number;

        align: AlignMode;

        margin: Number4;
	}
}