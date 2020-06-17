/**
 * @module Animation
*/
namespace ez {
	const enum Action {
		set = 1,
		move = 2,
		wait = 3,
		call = 4,
		target = 5,
		func = 6,
		dispose = 7
	}
	
	interface StepData {
		action: Action;
		duration?: number;
		ease?: (t: number) => number;
		props?: any;
		target?: any;
	}

	export class Ease {
        static get(amount): (t: number) => number {
            if (amount < -1)
                amount = -1;
            if (amount > 1)
                amount = 1;
            return function (t) {
                if (amount == 0)
                    return t;
                if (amount < 0)
                    return t * (t * -amount + 1 + amount);
                return t * ((2 - t) * amount + (1 - amount));
            }
        }

		static getPowIn(pow): (t: number) => number {
            return function (t) {
                return Math.pow(t, pow);
            }
        }

		static getPowOut(pow): (t: number) => number {
            return function (t) {
                return 1 - Math.pow(1 - t, pow);
            }
        }

		static getPowInOut(pow): (t: number) => number {
            return function (t) {
                if ((t *= 2) < 1)
					return 0.5 * Math.pow(t, pow);
                return 1 - 0.5 * Math.abs(Math.pow(2 - t, pow));
            }
        }

		static sineIn(t): number {
            return 1 - Math.cos(t * Math.PI / 2);
        }

		static sineOut(t): number {
            return Math.sin(t * Math.PI / 2);
        }

		static sineInOut(t): number {
            return -0.5 * (Math.cos(Math.PI * t) - 1)
        }

		static getBackIn(amount): (t: number) => number {
            return function (t) {
                return t * t * ((amount + 1) * t - amount);
            }
        }

		static getBackOut(amount): (t: number) => number {
            return function (t) {
                return (t * t * ((amount + 1) * t + amount) + 1);
            }
        }

		static getBackInOut(amount): (t: number) => number {
            amount *= 1.525;
            return function (t) {
                if ((t *= 2) < 1) return 0.5 * (t * t * ((amount + 1) * t - amount));
                return 0.5 * ((t -= 2) * t * ((amount + 1) * t + amount) + 2);
            }
        }

		static circIn(t): number {
            return -(Math.sqrt(1 - t * t) - 1);
        }

		static circOut(t): number {
            return Math.sqrt(1 - (--t) * t);
        }

		static circInOut(t): number {
            if ((t *= 2) < 1)
                return -0.5 * (Math.sqrt(1 - t * t) - 1);
            return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
        }

		static bounceIn(t): number {
            return 1 - Ease.bounceOut(1 - t);
        }

		static bounceOut(t): number {
            if (t < 1 / 2.75)
                return (7.5625 * t * t);
            else if (t < 2 / 2.75)
                return (7.5625 * (t -= 1.5 / 2.75) * t + 0.75);
            else if (t < 2.5 / 2.75)
                return (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375);
            else
                return (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375);
        }

		static bounceInOut(t): number {
            if (t < 0.5) return Ease.bounceIn(t * 2) * .5;
            return Ease.bounceOut(t * 2 - 1) * 0.5 + 0.5;
        }

		static getElasticIn(amplitude, period): (t: number) => number {
            var pi2 = Math.PI * 2;
            return function (t) {
                if (t == 0 || t == 1) return t;
                var s = period / pi2 * Math.asin(1 / amplitude);
                return -(amplitude * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * pi2 / period));
            }
        }

        static getElasticOut(amplitude, period): (t: number) => number {
            var pi2 = Math.PI * 2;
            return function (t) {
                if (t == 0 || t == 1) return t;
                var s = period / pi2 * Math.asin(1 / amplitude);
                return (amplitude * Math.pow(2, -10 * t) * Math.sin((t - s) * pi2 / period) + 1);
            }
        }

        static getElasticInOut(amplitude, period): (t: number) => number {
            var pi2 = Math.PI * 2;
            return function (t) {
                var s = period / pi2 * Math.asin(1 / amplitude);
                if ((t *= 2) < 1) return -0.5 * (amplitude * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * pi2 / period));
                return amplitude * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - s) * pi2 / period) * 0.5 + 1;
            }
        }

		static quadIn = Ease.getPowIn(2);
        static quadOut = Ease.getPowOut(2);
        static quadInOut = Ease.getPowInOut(2);
        static cubicIn = Ease.getPowIn(3);
        static cubicOut = Ease.getPowOut(3);
        static cubicInOut = Ease.getPowInOut(3);
        static quartIn = Ease.getPowIn(4);
        static quartOut = Ease.getPowOut(4);
        static quartInOut = Ease.getPowInOut(4);
        static quintIn = Ease.getPowIn(5);
        static quintOut = Ease.getPowOut(5);
        static quintInOut = Ease.getPowInOut(5);
		static elasticIn = Ease.getElasticIn(1, 0.3);
        static elasticInOut = Ease.getElasticInOut(1, 0.3 * 1.5);
        static elasticOut = Ease.getElasticOut(1, 0.3);
        static backIn = Ease.getBackIn(1.7);
        static backOut = Ease.getBackOut(1.7);
        static backInOut = Ease.getBackInOut(1.7);

		static linear(t) {
			return t;
		}
    }

	/**
	* 缓动动画
    *@example 
    * ```javascript
	* //json模式
	*var tween = new Tween(this.icon, [
	*	{ move: [ { x: [10, 100], y: [30, 300] }, 1000] },
	*	{ to: [ { x: 30 , y: 0 } , 500] },
	*	{ wait: 500 },
	*	{ set: { x: 10,  y: 30 } },
	*	{ call: [this.onFinish, this] },
	*	{ target: target }
	*])
	* //调用链模式
    *var tween = new egl.Tween(icon)
	*	.move({ x: [10, 100], y: [30, 300] }, 1000)
	*	.to({ x: 30, y: 0 }, 500)
	*	.wait(500)
	*	.set({ x: 10, y: 30 })
	*	.call(onFinish).play();
	*```
    * 
	*/
	export class Tween {
        private steps: StepData[] = [];
        private _target: any;
        private _state: MediaState = MediaState.Stop;
		private stepPos: number = 0;
        private currStep: number = 0;
        private _promise: { resolve: Function, reject: Function };
		private static playings: Tween[] = [];
		private static playTicker = null;
		public static defaultEase = Ease.linear;

		public static add(target: Object, steps?: any[]): Tween {
			return new Tween(target, steps);
		}
		/**
		 * 清除某个对象上的tween动画
		 * @param target
		 */
		public static stopTweens(target: Object) {
			var arr = Tween.playings.concat();
			for (var i = 0; i < arr.length; i++) {
				var t = arr[i];
				if (t._target === target)
					t.stop();
			}
		}
		private static update(dt: number) {
			var arr = Tween.playings.concat();
			for (var i = 0; i < arr.length; i++)
				arr[i].advance(dt);
			if (Tween.playings.length == 0) {
				removeTicker(Tween.playTicker);
				Tween.playTicker = undefined;
			}
		}

		/** 是否循环播放
		 */
		public loop: boolean = false;

		public constructor(target: Object, steps?: any[]) {
			this._target = target;
			if (target)
				this.steps.push({ action: Action.target, target: target });
			if (!steps)
				return;
			for (var i = 0; i < steps.length; i++) {
				var s = steps[i];
				if (s.set) {
					this.steps.push({ action: Action.set, props: Array.isArray(s.set) ? s.set[0] : s.set });
				}
				else if (s.move) {
					this.steps.push({ action: Action.move, props: s.move[0], duration: s.move[1], ease: s.move[2] || Tween.defaultEase });
				}
				else if (s.wait) {
					this.steps.push({ action: Action.wait, duration: s.wait });
				}
				else if (s.call) {
					this.steps.push({ action: Action.call, props: { func: s.call[0], ctx: s.call[1] } });
				}
				else if (s.to) {
					this.to(s.to[0], s.to[1], s.to[2]);
				}
				else if (s.target) {
					this.steps.push({ action: Action.target, target: s.target });
				}
			}
		}
		/**
		 * 设置目标属性
		 * @param props
		 */
		public set(props: Object):Tween {
			//if (!this._target)
			//	throw new Error("no target");
			this.steps.push({ action: Action.set, props: props });
			return this;
		}
		/**
		 * 移动目标属性
		 * @param props  { 属性名: [start, end] }
		 * @param duration 持续时间
		 * @param ease 插值类型
		 */
		public move(props: Object, duration: number, ease?: (t: number) => number): Tween {
			if (DEBUG) {
				//if (!this._target)
				//	throw new Error("no target");
				for(var k in props) {
					var steps = props[k];
					if(steps.length < 2)
						Log.error(`props ${k} has no 2 positions.`);
					for(let i = 0; i < steps.length; i++)
						if(typeof steps[i] !== "number")
							Log.error(`props ${k} is not number.`);
				}
			}
			this.steps.push({ action: Action.move, props: props, duration: duration, ease: ease || Tween.defaultEase });
			return this;
		}
		/**
		 * 目标属性从当前值到目标值
		 * @param props  { 属性名: end }
		 * @param duration 持续时间
		 * @param ease 插值类型
		 */
		public to(props: Object, duration: number, ease?: (t: number) => number): Tween {
			var target = null;
			var p2 = {};
			for (var k in props) {
				var i;
				if (DEBUG) {
					if (typeof props[k] !== "number")
						Log.error(`props ${k} is not number.`);
				}
				for (i = this.steps.length - 1; i >= 0; i--) {
					var s = this.steps[i];
					if (s.target) {
						target = s.target;
						i = -1;
						break;
					}
					if (s.props){
						if (Array.isArray(s.props[k]))
							p2[k] = [s.props[k][1], props[k]];
						else if(typeof (s.props[k]) === "number")
							p2[k] = [s.props[k], props[k]];
						else
							continue;
						break;
					}
				}
				if (i < 0) {
					var p0 = target[k];
					if (typeof (p0) !== "number") {
						Log.warn(`Tween.to ${k} has no initial pos.`);
						p2[k] = [0, props[k]];
					}
					else
						p2[k] = [p0, props[k]];
				}
			}
			this.steps.push({ action: Action.move, props: p2, duration: duration, ease: ease || Tween.defaultEase });
			return this;
		}
		/**
		 * 重新设置动画作用的目标对象
		 * @param t 目标对象
		 */
		public target(t: any): Tween {
			if (!t)
				return this;
			this.steps.push({ action: Action.target, target: t });
			return this;
		}
		/**
		 * 等待一段时间
		 * @param duration 毫秒数
		 */
		public wait(duration: number): Tween {
			this.steps.push({ action: Action.wait, duration: duration });
			return this;
		}
		/**
		 * 调用一个事件回调
		 * @param func 回调函数
		 * @param thisObj
		 */
		public call(func: Function, thisObj?: any): Tween {
			this.steps.push({ action: Action.call, props: { func: func, ctx: thisObj } });
			return this;
		}

		/**
		 * 销毁target
		 */
		public disposeTarget(){
			this.steps.push({ action: Action.dispose });
			return this;
		}
		/**
		 * 用自定义函数设置动画
		 * @param duration 动画时间
		 * @param func 自定义动画函数 (target: any, t: number)=>void target为目标对象，t为该动画播放位置，归一化为(0 ~ 1)
		 * @param thisObj
		 * @param ease
		 * 
		 * @example
		 * ```
		 * //让目标对象绕圈转动
		 * new Tween(arrow).func(5000, (target, t) => {
		 *		target.x = Math.cos(t * Math.PI * 2) * 100;
		 *		target.y = Math.sin(t * Math.PI * 2) * 100;
		 *		target.angle = t * 360;
		 * }).config({ loop: true }).play();
		 * ```
		 */
		public func(duration: number, func: (target: any, t: number) => void, thisObj?: any, ease?: (t: number) => number): Tween {
			this.steps.push({ action: Action.func, duration: duration, props: { func: func, ctx: thisObj }, ease: ease || Tween.defaultEase } );
			return this;
		}
		/**
		 * 连接另一个tween动画到当前动画后面
		 * @param tween
		 */
		public append(tween: Tween): Tween {
			this.steps = this.steps.concat(tween.steps);
			return this;
		}
		/**
		 * 设置tween属性
		 * @param args
		 * @example
		 * ```
		 * new egl.Tween(icon).move({angle:[0,360]}, 1000).config({loop:true}).play();
		 * ```
		 */
		public config(args: any): Tween {
			for (var k in args)
				this[k] = args[k];
			return this;
		}
		/**
		 * 开始播放 */
        public play(): Tween {
			if (this._state == MediaState.Play)
				return;
			if (this._state == MediaState.Stop)
				Tween.playings.push(this);
			this._state = MediaState.Play;
			if (!Tween.playTicker)
                Tween.playTicker = addTicker(Tween.update);
            return this;
        }
		/**
		 * 返回一个Promise用于等待动画结束 */
        public waitForEnd(): Promise<void> {
			this.play();
            return new Promise<void>((resolve, reject) => {
                this._promise = { resolve: resolve, reject: reject };
            });
		}
		/**
	     * 停止播放 */
		public stop() {
			if (this._state == MediaState.Stop)
                return;
            var finished = this.currStep >= this.steps.length;
			this.stepPos = 0;
			this.currStep = 0;
			this._state = MediaState.Stop;
			var idx = Tween.playings.indexOf(this);
			if (idx != -1)
                Tween.playings.splice(idx, 1);
            if (this._promise) {
                var p = this._promise;
                this._promise = null;
                if (finished)
                    p.resolve();
                else
                    p.reject();
            }
		}
		/**
		* 暂停播放 */
		public pause() {
			if (this._state == MediaState.Stop)
				return;
			this._state = MediaState.Pause;
		}
		/**
	    * 播放状态 */
		public get state(): MediaState {
			return this._state;
		}
		private do(step: StepData) {
			switch (step.action) {
				case Action.set:
					for (var k in step.props)
						this._target[k] = step.props[k];
					break;
				case Action.move:
					for (var k in step.props)
						this._target[k] = step.props[k][1];
					break;
				case Action.call:
					step.props.func.call(step.props.ctx);
					break;
				case Action.target:
					this._target = step.target;
					break;
				case Action.func:
					step.props.func.call(step.props.ctx, this._target, 1);
					break;
				case Action.dispose:
					this._target.dispose();
					break;
			}
		}
		/**
		 * 前进一段时间
		 * @param dt 前进的毫秒数
		 */
		public advance(dt: number) {
			try {
				if (this._state != MediaState.Play)
					return;
				if (this._target && this._target.disposed) {
					this.stop();
					return;
				}
				if (this.currStep >= this.steps.length) {
					this.stop();
					if (this.loop)
						this.play();
					return;
				}
				var p = this.stepPos + dt;
				var step = this.steps[this.currStep];
				while (!step.duration || p >= step.duration) {
					this.currStep++;
					this.do(step);
					this.stepPos = p;
					if (this._state != MediaState.Play)
						return;
					if (this.currStep >= this.steps.length) {
						this.stop();
						if (this.loop)
							this.play();
						return;
					}
					if (step.duration)
						p -= step.duration;
					step = this.steps[this.currStep];
				}
				this.stepPos = p;
				if (step.action == Action.move) {
					var t = step.ease(p / step.duration);
					for (var k in step.props) {
						var v = step.props[k];
						this._target[k] = v[0] + (v[1] - v[0]) * t;
					}
				}
				else if (step.action == Action.func) {
					var t = step.ease(p / step.duration);
					step.props.func.call(step.props.ctx, this._target, t);
				}
			}
			catch (e) {
				Log.error("tween error: " + e.message);
				this.stop();
			}
		}
	}

    export interface TrackDesc {
        name?: string;
        target: string;
        steps: any[];
        loop?: boolean;
    }

    export class KeyframeAnimation {
        tracks: Tween[] = [];
        isLoop: boolean;
		_promise: any;
		
        private _onStop() {
			if (this.isLoop)
				callNextFrame(function () { this.play(true); }, this);
			else if (this._promise)
				this._promise.resolve();
        }

        public load(stage: Stage, data: TrackDesc[]) {
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                var target = stage.find(item.target);
                var t = new Tween(target, item.steps);
                if (item.loop && i > 0)
                    t.loop = true;
                this.tracks.push(t);
            }
            this.tracks[0].call(this._onStop, this);
		}
		public get state() {
			return this.tracks[0].state;
		}
		public waitForEnd() {
			return new Promise<void>((resolve, reject) => {
				this._promise = { resolve: resolve, reject: reject };
			});
		}
        public play(isLoop?: boolean) {
            for (var i = 0; i < this.tracks.length; i++)
                this.tracks[i].play();
			this.isLoop = !!isLoop;
        }

        public stop() {
            for (var i = 0, len = this.tracks.length; i < len; i++)
				this.tracks[i].stop();
			this.isLoop = false;
			if (this._promise)
				this._promise.reject();
        }

        public dispose() {
            this.stop();
            this.tracks = [];
		}
    }
}