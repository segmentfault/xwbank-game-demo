declare type SkeletonDataHandle = number;

declare type AnimationHandle = number;

declare type StringHandle = number;

declare type AnimationStateDataHandle = number;

declare type AnimationStateHandle = number;

declare type SkeletonHandle = number;

declare type AttachmentHandle = number;

declare namespace spine {

    class Animation {

        /** 动画时间 */
        readonly duration: number;

        /**@ignore */
        handle: Handle;

        /** 动画名 */
        name: string;

        /**@ignore */
        constructor(handle: Handle);
	}

    interface AnimationEvent {

        name: string;

        intValue: number;

        floatValue: number;

        stringValue: string;
	}

    function aniEvent(id: number, name: number, intVal: number, floatVal: number, strVal: number): void;

    class AnimationState {

        skeloton: SkeletonData;

        handle: AnimationStateHandle;

        listener: (e: AnimationEvent) => void;

        constructor(skeleton: SkeletonData);

        dispose(): void;

        update(dt: number, skeleton: Skeleton): boolean;

        setAnimation(trackIndex: number, animationName: string, loop: boolean): void;

        addAnimation(trackIndex: number, animationName: string, loop: boolean, delay: number): void;

        clearTracks(): void;

        clearTrack(trackIndex: number): void;

        addEventListener(listener: (e: AnimationEvent) => void): void;
	}

    /** spine骨架对象 */
    class Skeleton {

        handle: SkeletonHandle;

        constructor(data: SkeletonData);

        dispose(): void;

        setSkinByName(skinName: string): void;
	}

    class SkeletonData {

        animations: Animation[];

        aniState: AnimationStateDataHandle;

        aniNames: string[];

        skinNames: string[];

        constructor(handle: SkeletonDataHandle);

        findAnimation(name: string): Animation;

        dispose(): void;
	}

    var DefVS: string;
}

declare namespace ez {

    /**
     * spine动画对象
     */
    class SpineSprite extends Sprite {

        /** spine骨骼对象 */
        readonly skeleton: spine.Skeleton;

        /** 动画状态 */
        readonly animationState: spine.AnimationState;

        readonly skeletonData: spine.SkeletonData;

        static Type: string;

        /** 动画播放速度 */
        timeScale: number;

        getType(): string;

        protected _dispose(): void;

        constructor(parent: Stage, id?: string);

        /**
         * 播放动画
         * @param track 轨道
         * @param ani 动画名
         * @param loop 是否需要循环
         */
        play(track: number, ani: string, loop?: boolean): void;

        /** 停止播放 */
        stop(): void;

        /** 加载动画数据 */
        load(name: string, imgPath?: string): Promise<void>;

        protected _draw(rc: IRenderContext, opacity: number): void;
	}
}