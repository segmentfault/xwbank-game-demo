/// <reference path="Sprite.ts"/>

/**
 * @module Visual
*/
namespace ez {
	/**
	 * 矩形填充对象
	 */
	export class RectFillSprite extends Sprite {
		private _gradient: GradientFill;

		public static Type = "RectFill";

		protected _draw(rc: IRenderContext, opacity: number) {
			opacity *= this.opacity;
			if(opacity < 0.01)
				return;
			if(useWGL)
				this.applyEffect(rc);
			rc.setAlphaBlend(opacity, this.blendMode);
			if((<any>rc).setZ)
				(<any>rc).setZ(this.zIndex);
			if(this._gradient)
				rc.setFillGradient(this._gradient);
			else
				rc.setFillColor(this._color);
			rc.fillRect(this.width, this.height, ezasm.getglobalTrans(this._handle));
		}

		public getType(): string {
			return RectFillSprite.Type;
		}

		public constructor(stage: Stage, id?: string) {
			super(stage, id);
		}

		/**
		 * 设置渐变填充
		 */
		public get gradient(): string | GradientFill {
			return this._gradient;
		}
		public set gradient(g: string | GradientFill) {
			this.setDirty();
			if(!g) {
				this._gradient = null;
				return;
			}
			var v = <GradientFill>g;
			if(typeof (g) === "string")
				v = parse.GradientFill(g);
			v.x0 = v.x0 || 0;
			v.y0 = v.y0 || 0;
			v.y1 = v.y1 || 0;
			v.x1 = v.x1 || 0;
			this._gradient = v;
		}
	} 

	Sprite.register(RectFillSprite.Type, (p, id) => new RectFillSprite(p, id));
}