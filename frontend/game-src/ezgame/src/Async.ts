/**
 * 异步助手函数
*/
namespace Async {
	/**
	 * 等待一段事件
	 * @param ms 毫秒数
	*/
	export function delay(ms: number): Promise<void> {
		return new Promise<void>(r => ez.setTimer(ms, r));
	}
	/**
	 * 等待下一帧开始
	*/
	export function nextFrame(): Promise<void> {
        return new Promise<void>(r => { ez.callNextFrame(r); });
	}
}