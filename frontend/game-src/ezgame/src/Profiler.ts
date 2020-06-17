/**
 * 性能采集和分析
 * @module Profiling
*/
namespace ez {

	/**
	* WebGL渲染模式下逐帧性能分析数据
	*/
	export class WGLPerFrameProfiler {
		public frame: number;
		public startTime: number;
		public endTime: number;
		public updateTime: number;
		public renderTime: number;
		public flush = 0;
		public setClip = 0;
		public setTexture = 0;
		public setShader = 0;
		public drawQuad = 0;
		public drawcall = 0;
		public triangle = 0;
		public blendChange = 0;
		public fontCache = 0;
		public fontCacheSize: string[] = [];
		public commands: [number, string][];
	}
	/**
	 * Canvas渲染模式下逐帧性能分析数据
	 */
	export class CanvasPerFrameProfiler {
		public frame: number;
		public startTime: number;
		public endTime: number;
		public updateTime: number;
		public renderTime: number;
		public fillRect: number = 0;
		public drawImage: number = 0;
		public drawText: number = 0;
		public transfromChange: number = 0;
		public commands: [number, string][];
	}

	export namespace Profile {
		/**
		 * 开始逐帧性能分析
		 * @detail detail 是否需要包含详细的命令列表数据
		 * @param onData 每帧性能数据回调
		 */
		export function beginFrameProfiling(detail: boolean, onData?: (data: WGLPerFrameProfiler | CanvasPerFrameProfiler) => void) {
			if (!PROFILING)
				throw new Error("no profiling");
			commandDetail = detail;
			profileCB = onData;
			frameCounter = 0;
		}

		/**
		 * 停止逐帧性能分析
		 */
		export function endFrameProfiling() {
			if (!PROFILING)
				return;
			profileCB = null;
		}

		/**@ignore */
		export interface EventData {
			type: string;
			args: string;
			steps: { name: string, time: number }[];
			start: number;
			time: number;
		}
		
		/**
		* 开始事件采集分析
		*/
		export function beginEventProfiling() {
			events = [];
		}
		/**
		* 停止事件采集分析
		*/
		export function endEventProfiling(): EventData[] {
			if (!events)
				throw new Error("no profiling");
			let r = events;
			events = null;
			return r;
		}

		/**
		 * 获取当前毫秒数
		 */
		export function now() {
			return timer.now();
		}

		/**@ignore */
		export function newFrame(): WGLPerFrameProfiler | CanvasPerFrameProfiler{
			if (!profileCB)
				return null;
			if (useWGL)
				frameProfiler = new WGLPerFrameProfiler();
			else
				frameProfiler = new CanvasPerFrameProfiler();
			if (commandDetail)
				frameProfiler.commands = [];
			frameProfiler.frame = frameCounter++;
			frameProfiler.updateTime = frameProfiler.startTime = Profile.now();
			return frameProfiler;
		}

		/**@ignore */
		export function endFrame(){
			if (!profileCB)
				return;
			frameProfiler.renderTime = Profile.now() - frameProfiler.renderTime;
			frameProfiler.endTime = Profile.now();
			profileCB(frameProfiler);
			frameProfiler = null;
		}

		/**
		 * 在frameprofiling中添加一条渲染命令
		 */
		export function addCommand(cmd: string) {
			if (!frameProfiler || !frameProfiler.commands)
				return;
			var t = now() - frameProfiler.updateTime;
			frameProfiler.commands.push([t, cmd]);
		}

		/**@ignore */
		export interface IEvent {
			addStep(name: string);
			end();
		}

		/**
		 * 添加一个事件
		 * @param type 
		 * @param args 
		 */
		export function newEvent(type: string, parameter: string): IEvent {
			if (!events)
				return null;
			var e = new Event(type, parameter);
			events.push(e);
			return e;
		}

		var events: Event[];
		var timer: { now: () => number } = Date;
		if (typeof performance != "undefined")
			timer = performance;

		class Event implements IEvent {
			type: string;
			args: string;
			steps: { name: string, time: number }[];
			start: number;
			time: number;

			constructor(type: string, args: string) {
				this.type = type;
				this.args = args;
				this.start = now();
			}
			addStep(name: string) {
				if (!this.steps)
					this.steps = [];
				this.steps.push({ name: name, time: now() - this.start });
			}
			end() {
				this.time = now() - this.start;
			}
		}
	}

	var frameCounter = 0;
	var frameProfiler: WGLPerFrameProfiler | CanvasPerFrameProfiler;
	var commandDetail: boolean;
	var profileCB: (data: WGLPerFrameProfiler | CanvasPerFrameProfiler) => void;
}