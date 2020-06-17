/// <reference path="RenderContext.ts"/>
/**  
 * @module ezgame
*/
namespace ez {
	export namespace internal {
		export interface IEZDecodeResult {
			id: number;
			status: number;
			error: string;
			width: number;
			height: number;
			subImg?: { top: number, height: number, data: Uint8Array };
			subsets?: { top: number, height: number, data: Uint8Array }[];
			format: number;
			time?: number;
			data: Uint8Array;
		}
		export var ezmDecoder: { load: (url: string, format: number, size: number, event:Profile.IEvent, onResult: (r: IEZDecodeResult) => void) => void };
	}

	/**
	 * 加载ezm图像格式解码器
	 * @param url 解码器url，用于创建worker
	 * @param [thread] 解码线程数，默认为2个线程
	 */
	export function loadEZMDecoder(url: string, thread = 2) {
		if (!url)
			return null;
		function singleThread() {
			var worker = new Worker(url);
			var tasks = [];
			var queue = [];
			worker.onmessage = function (e) {
				if (queue) {
					Log.debug(`ezmDecoder ready`);
					for (let i = 0; i < queue.length; i++)
						worker.postMessage(queue[i]);
					queue = undefined;
					return;
				}
				var r = <internal.IEZDecodeResult>e.data;
				var task = tasks[r.id];
				if (r.subImg) {
					if (!task.subsets)
						task.subsets = [];
					if (PROFILING && task.event)
						task.event.addStep(`decode ${task.subsets.length}`);
					task.subsets.push(r.subImg);
				}
				if (r.status <= 0) {
					if (task.subsets)
						r.subsets = task.subsets;
					else if (PROFILING && task.event)
						task.event.addStep("decode");
					task.onResult(r);
					tasks[r.id] = null;
				}
				else if (PROFILING && r.status == 2 && task.event){
					task.event.addStep("download");
				}
			}

			function load(url: string, format: number, size: number, event: Profile.IEvent, onResult: (r: internal.IEZDecodeResult) => void) {
				var id = tasks.indexOf(null);
				var task = { id: id, event: event, onResult: onResult };
				if (id < 0) {
					task.id = tasks.length;
					tasks.push(task);
				}
				else
					tasks[id] = task;
				let t = { id: task.id, url: url, format: format, profile: !!event };
				if (queue)
					queue.push(t);
				else
					worker.postMessage(t);
			}
			return { load: load };
		}

		function multiThread() {
			var threads = [];
			for (let i = 0; i < thread; i++) {
				threads[i] = { id: i, worker: new Worker(url), tasks: [], load: 0, queue: [] };
				threads[i].worker.onmessage = (function (e) {
					if (this.queue) {
						Log.debug(`thread${this.id} ready`);
						for (let i = 0; i < this.queue.length; i++)
							this.worker.postMessage(this.queue[i]);
						this.queue = undefined;
						return;
					}
					var r = <internal.IEZDecodeResult>e.data;
					var task = this.tasks[r.id];
					if (r.subImg) {
						if (!task.subsets)
							task.subsets = [];
						if (PROFILING && task.event)
							task.event.addStep(`decode ${task.subsets.length}`);
						task.subsets.push(r.subImg);
					}
					if (r.status <= 0) {
						if (task.subsets)
							r.subsets = task.subsets;
						else if (PROFILING && task.event)
							task.event.addStep("decode");
						this.load -= task.load;
						if (r.status)
							Log.error(`decode [${task.url}] failed.`);
						else
							Log.debug(`thread:${this.id} [${task.url}] decode time: ${r.time}`);
						task.onResult(r);
						r.data = null;
						r.subImg = null;
						r.subsets = null;
						this.tasks[r.id] = null;
					}
					else if (PROFILING && r.status == 2 && task.event) {
						task.event.addStep("download");
					}
				}).bind(threads[i]);
			}

			function load(url: string, format: number, size: number, event: Profile.IEvent, onResult: (r: internal.IEZDecodeResult) => void) {
				var minLoad = 100000000;
				var thread;
				for (let i = 0; i < threads.length; i++) {
					if (threads[i].load < minLoad) {
						minLoad = threads[i].load;
						thread = threads[i];
					}
				}
				thread.load += size;
				let tasks = thread.tasks;
				let id = tasks.indexOf(null);
				let task = { id: id, url: url, onResult: onResult, load: size };
				if (id < 0) {
					task.id = tasks.length;
					tasks.push(task);
				}
				else
					tasks[id] = task;
				Log.debug(`thread:${thread.id} begin load image[${url}]. format:${format} workload:${thread.load}`);
				let t = { id: task.id, url: url, format: format };
				if (thread.queue)
					thread.queue.push(t);
				else
					thread.worker.postMessage(t);
			}
			return { load: load };
		}
		if (thread > 1)
			internal.ezmDecoder = multiThread();
		else
			internal.ezmDecoder = singleThread();
	}
}