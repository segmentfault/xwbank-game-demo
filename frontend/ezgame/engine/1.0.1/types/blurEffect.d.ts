declare namespace ez {

    /**
     * Blur特效对象
     * 	放置在这个容器中的元素将获得模糊效果
     */
    class BlurStageSprite extends SubStageSprite implements IPreRender {

        /**
         * 模糊半径
         */
        radius: number;

        ownerBuffer: boolean;

        static Type: string;

        getType(): string;

        constructor(parent: Stage, id?: string);

        protected destroyBuffer(): void;
	}

    module ui {

        /**
        * 带模糊特效的Group
        */
        class BlurGroup extends ui.Container {

            static ClassName: string;

            static instance: BlurGroup;

            static Properties: ui.PropDefine[];

            static HasChildElements: boolean;

            constructor(parent: ui.Container);

            setChilds(data: ElementData[]): void;

            /**
             * 模糊半径
             */
            radius: number;
		}
	}
}