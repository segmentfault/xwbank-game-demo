declare namespace ez {

    /**
     * 2D粒子系统对象
     */
    class ParticleSprite extends Sprite {

        static Type: string;

        protected _draw(rc: IRenderContext, opacity: number): void;

        getType(): string;

        constructor(stage: Stage, id?: string);
	}
}