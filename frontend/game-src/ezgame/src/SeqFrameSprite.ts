/// <reference path="Sprite.ts"/>
/**
 * @module Visual
*/
namespace ez {

	/** 
	* 动画序列帧数据定义
	*/
	export interface SeqFrameDesc {
		/** 序列帧图片名前缀 */
		prefix: string;
		/** 
		 * 用逗号分隔的序列帧图片名
		 * 	如果指定了frames则优先使用frames生成序列帧图片名字数组
		 */
		frames?: string;
		/** 
		 * 起始帧编号
		 * 	使用from,count自动生成序列帧图片名字数组
		 *  from可以使用数字，也可以使用带前导0的字符串，在生成序列帧时会自动填充前导0的个数
		 *  例如{ prefix:"f", form:"008", count:4 } 会生成出 ["f008","f009","f010","f011"]
		 */
		from?: number | string;
		/** 总帧数 */
		count?: number;
		/** 动画fps */
		fps?: number;
		/** 是否循环播放 */
		loop?: boolean;
	}
	
	/**
	 * 序列帧动画对象
	 */
	export class SeqFrameSprite extends Sprite {
		private _frameTimes: number[];
		private _frames: Texture[];
		private _interval: number = 0;
		private _index: number = 0;
		private _pos: number = 0;
		private _state: MediaState = MediaState.Stop;
		private _speedInv = 1;
		private _width: number;
		private _height: number;
		private _autoPlay: boolean;
		private static playTicker = null;
		private static playings: SeqFrameSprite[] = [];

		/**
		 * 将SeqFrameDesc转换成图片名字数组
		 * @param data 
		 * @returns frames 
		 */
		static toFrames(data: SeqFrameDesc): string[] {
			if (DEBUG) {
				if (!data.prefix || (!data.frames && (typeof data.from !== "number" || typeof data.count !== "number"))) {
					Log.error("invalid sequence frames format.");
					return;
				}
			}
			let a = [];
			function padding(i: number, n: number) {
				var s = i.toString();
				return "0".repeat(n - s.length) + s;
			}
			if (data.frames) {
				let frames = data.frames.split(',');
				for (let i = 0; i < frames.length; i++)
					a.push(data.prefix + frames[i]);
			}
			else {
				let from = data.from;
				if (typeof from == "string") {
					let n = from.length;
					let f = parseInt(from);
					for (let i = f, to = f + data.count; i < to; i++)
						a.push(data.prefix + padding(i, n));
				}
				else {
					for (let i = from, to = from + data.count; i < to; i++)
						a.push(data.prefix + i);
				}
			}
			return a;
		}


		public static Type = "SeqFrame";
		public getType(): string {
			return SeqFrameSprite.Type;
		}
		private static _update(dt: number) {
			var arr = SeqFrameSprite.playings.concat();
			for (var i = 0; i < arr.length; i++) {
				try {
					arr[i]._update(dt);
				}
				catch (e) {
					Log.error("seqframe update exception: " + e.message + "\ncall stack: " + e.stack);
				}
			}
			if (SeqFrameSprite.playings.length == 0) {
				removeTicker(SeqFrameSprite.playTicker);
				SeqFrameSprite.playTicker = undefined;
			}
		}
		private get currInterval(): number {
			if (this._frameTimes && this._frameTimes[this._index])
				return this._frameTimes[this._index] * this._speedInv;
			return this._interval * this._speedInv;
		}
		protected _draw(rc: IRenderContext, opacity: number): boolean {
			if (!this._frames)
				return;
			var f = this._frames[this._index];
			if(!f || f.empty)
				return;
			if(!f.ready) {
				f.load();
				return;
			}
			rc.setFillColor(this.color);
			opacity *= this.opacity;
			if(opacity < 0.01)
				return;
			if(useWGL)
				this.applyEffect(rc);
			rc.setAlphaBlend(opacity, this.blendMode);
			rc.drawImage(f, ezasm.getglobalTrans(this._handle), this.width, this.height, f.subRect);
		}
		private _update(dt: number) {
			if (this._state != MediaState.Play)
				return;
			if (!this._frames)
				return;
			this._pos += dt;
			while (this._pos > this.currInterval) {
				this._pos -= this.currInterval;
				this._index++;
				this.setDirty();
				if (this._index >= this._frames.length) {
					if (this.loop)
						this._index = 0;
					else {
						this._index = this._frames.length - 1;
						this.stop();
						return;
					}
				}
			}
		}
		public _dispose() {
			this.onStop = undefined;
			this._frames = undefined;
			if(this._state == MediaState.Play) {
				this._state = MediaState.Stop;
				var p = SeqFrameSprite.playings;
				var idx = p.indexOf(this);
				if(idx != -1)
					p.splice(idx, 1);
			}
			super._dispose();
		}
		public constructor(stage: Stage, name?:string) {
			super(stage, name);
			this.color = "#ffffff";
			this._interval = 33;
			//this._data = { width: 0, height: 0 };
		}
		private _setWidth(val: number) {
			var h = this._handle;
			if(!h)
				return;
			if(ezasm.setwidth(h, val))
				this.setDirty();
		}
		private _setHeight(val: number) {
			var h = this._handle;
			if(!h)
				return;
			if(ezasm.setheight(h, val))
				this.setDirty();
		}
		public get width(): number {
			return ezasm.getwidth(this._handle);
		}

		public set width(val: number) {
			this._setWidth(val);
			this._width = val;
		}

		public get height(): number {
			return ezasm.getheight(this._handle);
		}

		public set height(val: number) {
			this._setHeight(val);			
			this._height = val;
		}
		/**
		 * 是否循环播放
		 */
		public loop:boolean;
		/**
		 * 播放完成事件通知
		 */
		public onStop: Function;
		/**
		* 是否在播放完成后自动从stage中移除
		*/
		public autoRemove: boolean;
		/**
		 * 序列帧数据
		 *	set frames可以为序列帧(string,Texture)数组或者SeqFrameDesc描述，get为Texture数组
		 */
		public get frames(): Texture[]|string[]|SeqFrameDesc {
			return this._frames;
		}
		public set frames(vals: Texture[]|string[]|SeqFrameDesc) {
			this.stop();
			if(!vals)
				this._frames = undefined;
			if(!Array.isArray(vals)) {
				var data = <SeqFrameDesc>vals;
				vals = SeqFrameSprite.toFrames(data);
				if(data.fps)
					this.fps = data.fps;
				if(data.loop)
					this.loop = data.loop;
			}
			this.loadFrames(<Texture[]|string[]>vals);
		}
		private loadFrames(frames: Texture[]|string[]) {
			var arr = [];
			var setSize = function (d) {
				if(this._width === undefined)
					this._setWidth(r.width);
				if(this._height === undefined)
					this._setHeight(r.height);
			}.bind(this);
			for (var i = 0; i < frames.length; i++) {
				if (!frames[i]) {
					arr[i] = null;
					continue;
				}
				if (typeof (frames[i]) === "string") {
					var r = getRes<Texture>(<string>frames[i]).getData();
					if(setSize) {
						setSize(r);
						setSize = null;
					}
					arr[i] = r;
					if (!r.ready)
						r.load();
				}
				else {
					arr[i] = frames[i];
					if(setSize) {
						setSize(r);
						setSize = null;
					}
				}			
			}
			this._frames = <Texture[]>arr;
			if (this._autoPlay)
				this.play();
		}

		/**
		 * 加载后自动播放
		 */
		public get autoPlay() {
			return this._autoPlay;
		}
		public set autoPlay(v: boolean) {
			this._autoPlay = v;
			if (v && this._frames && this.state == MediaState.Stop)
				this.play();
		}
		/**
		 * 当前帧索引
		 */
		public get frameIndex() {
			return this._index;
		}
		/**
		 * 播放位置，单位为毫秒
		 */
		public set position(val: number) {
			if (this._pos == val)
				return;
			this._pos = val;
			this.setDirty();
		}
		public get position(): number {
			return this._pos;
		}
		/**
		 * 动画长度，单位为毫秒
		 */
		public get length(): number {
			var t = 0;
			for (var i = 0; i < this._frames.length; i++) {
				if (this._frameTimes && this._frameTimes[i])
					t += this._frameTimes[i];
				else
					t += this._interval;
			}
			return t * this._speedInv;
		}
		/**
		 * 设置播放帧率
		 */
		public set fps(val: number) {
			this._interval = 1000 / val;
		}
		public get fps(): number {
			return 1000 / this._interval;
		}
		/**
		 * 播放状态
		 */
		public get state(): MediaState {
			return this._state;
		}

		/**
		 * 开始播放
		 */
		public play() {
			if (this._state == MediaState.Play)
				return;
			var s = SeqFrameSprite;
			if (this._state == MediaState.Stop) {
				this._pos = 0;
				this._index = 0;
				s.playings.push(this);
			}
			this._state = MediaState.Play;
			if (!s.playTicker)
				s.playTicker = addTicker(s._update);
		}
		/**
		 * 暂停
		 */
		public pause() {
			if (this._state != MediaState.Play)
				return;
			this._state = MediaState.Pause;
		}
		/**
		 * 停止
		 */
		public stop() {
			if (this._state == MediaState.Stop)
				return;
			this._state = MediaState.Stop;
			var p = SeqFrameSprite.playings;
			var idx = p.indexOf(this);
			if (idx != -1)
				p.splice(idx, 1);

			if(this.onStop)
				this.onStop();

			if(this.autoRemove)
				this.dispose();
		}

		/**
		* 播放速度
		*/
		public set speed(v: number) {
			this._speedInv = 1 / v;
		}
		/**
		 * 设置指定帧的持续时间
		 *	可用于非固定帧率的动画
		 */
		public setFrameDuration(i: number, time: number) {
			this._frameTimes = this._frameTimes || [];
			this._frameTimes[i] = time;
		}
		/**
		 * 设置每帧帧的持续时间
		 *	可用于非固定帧率的动画
		 */
		public set framesDuration(frames: number[]) {
			this._frameTimes = frames;
		}
	}

	Sprite.register(SeqFrameSprite.Type, (p, id) => new SeqFrameSprite(p, id));
}
