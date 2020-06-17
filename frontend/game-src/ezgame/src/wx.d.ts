/**
 * 微信小游戏平台相关API
 */
declare module wx {
	export interface IEventHandler {
		success?: (res?: any) => void;
		fail?: () => void;
		complete?: () => void;
	}
	export interface ShowKeyboardParam extends IEventHandler {
		defaultValue: string;	//	键盘输入框显示的默认值
		maxLength: number;		//	键盘中文本的最大长度	
		multiple: boolean;		//	是否为多行输入	
		confirmHold: boolean;	//	当点击完成时键盘是否收起	
		confirmType: string;	//	键盘右下角 confirm 按钮的类型，只影响按钮的文本内容: done,next,search,go,send
	}

	export interface SystemInfo {
		brand: string;			//	手机品牌	1.5.0
		model: string;			//	手机型号	
		pixelRatio: number;		//	设备像素比	
		screenWidth: number;	//	屏幕宽度	1.1.0
		screenHeight: number;	//	屏幕高度	1.1.0
		windowWidth: number;	//	可使用窗口宽度	
		windowHeight: number;	//	可使用窗口高度	
		language: string;		//	微信设置的语言	
		version: string;		//	微信版本号	
		system: string;			//	操作系统版本	
		platform: string;		//	客户端平台	
		fontSizeSetting: number;//	用户字体大小设置。以“我 - 设置 - 通用 - 字体大小”中的设置为准，单位 px。	1.5.0
		SDKVersion: string;		//	客户端基础库版本	1.1.0
		benchmarkLevel: number;	//	性能等级，-2 或 0：该设备无法运行小游戏，-1：性能未知，>=1 设备性能值，该值越高，设备性能越好(目前设备最高不到50)	1.8.0
		battery: number;		//	电量，范围 1 - 100	1.9.0
		wifiSignal: number;		//	wifi 信号强度，范围 0 - 4	 1.9.0
	}
	
	export interface InnerAudioContext {
		src: string;			//	音频资源的地址
		autoplay: boolean;		//	是否自动播放
		loop: boolean;			//	是否循环播放
		obeyMuteSwitch: boolean;//	是否遵循系统静音开关，当此参数为 false 时，即使用户打开了静音开关，也能继续发出声音
		duration: number;		//	前音频的长度，单位 s。只有在当前有合法的 src 时返回
		currentTime: number;	//	当前音频的播放位置，单位 s。只有在当前有合法的 src 时返回，时间不取整，保留小数点后 6 位
		paused: boolean;		//	当前是是否暂停或停止状态，true 表示暂停或停止，false 表示正在播放
		buffered: number;		//	音频缓冲的时间点，仅保证当前播放时间点到此时间点内容已缓冲
		volume: number;			//	音量。范围 0~1。


		play();					//	播放
		pause();				//	暂停。暂停后的音频再播放会从暂停处开始播放
		stop();					//	停止。停止后的音频再播放会从头开始播放
		seek(position: number);	//	跳转到指定位置，单位 s
		destroy();				//	销毁当前实例

		onCanplay(cb: Function);	//	监听音频进入可以播放状态的事件
		onPlay(cb: Function);		//	监听音频播放事件
		onPause(cb: Function);		//	监听音频暂停事件
		onStop(cb: Function);		//	监听音频停止事件
		onEnded(cb: Function);		//	监听音频自然播放至结束的事件
		onTimeUpdate(cb: Function);	//	监听音频播放进度更新事件
		onError(cb: (errCode: number) => void);		//	监听音频播放错误事件	10001:系统错误 10002:网络错误 10003:文件错误 10004:格式错误 -1:未知错误		
		onWaiting(cb: Function);	//	监听音频加载中事件，当音频因为数据不足，需要停下来加载时会触发
		onSeeking(cb: Function);	//	监听音频进行跳转操作的事件
		onSeeked(cb: Function);		//	监听音频完成跳转操作的事件

		offCanplay(cb: Function);	//	取消监听音频进入可以播放状态的事件
		offPlay(cb: Function);		//	取消监听音频播放事件
		offPause(cb: Function);		//	取消监听音频暂停事件
		offStop(cb: Function);		//	取消监听音频停止事件
		offEnded(cb: Function);		//	取消监听音频自然播放至结束的事件
		offTimeUpdate(cb: Function);//	取消监听音频播放进度更新事件
		offError(cb: Function);		//	取消监听音频播放错误事件
		offWaiting(cb: Function);	//	取消监听音频加载中事件，当音频因为数据不足，需要停下来加载时会触发
		offSeeking(cb: Function);	//	取消监听音频进行跳转操作的事件
		offSeeked(cb: Function);	//	取消监听音频完成跳转操作的事件
	}
	export function	createInnerAudioContext():any;
	export function createCanvas(): HTMLCanvasElement;
	export function loadFont(font: string): string;
	export function createWorker(scriptPath: string): Worker;
	export function createInnerAudioContext(): InnerAudioContext;
	export function setPreferredFramesPerSecond(fps: number);
	
	export function onTouchStart(cb: (e: { touches: Touch[], changedTouches: Touch[], timeStamp: number }) => void);
	export function onTouchMove(cb: (e: { touches: Touch[], changedTouches: Touch[], timeStamp: number }) => void);
	export function onTouchEnd(cb: (e: { touches: Touch[], changedTouches: Touch[], timeStamp: number }) => void);
	export function onTouchCancel(cb: (e: { touches: Touch[], changedTouches: Touch[], timeStamp: number }) => void);


	export function hideKeyboard(cb: IEventHandler);
	export function onKeyboardInput(cb: (value: string) => void);
	export function onKeyboardConfirm(cb: (value: any) => void);
	export function onKeyboardComplete(cb: (value: any) => void);
	export function offKeyboardInput(cb: (value: string) => void);
	export function offKeyboardConfirm(cb: (value: string) => void);
	export function offKeyboardComplete(cb: (value: string) => void);
	export function showKeyboard(obj: ShowKeyboardParam);

	export function getSystemInfoSync(): SystemInfo;
	
	/**
	 * 下载一个远程资源并缓存在本地文件中，返回文本或二进制数据
	 * @param url 
	 * @param isText 是否为utf8文本
	 * @param cb 
	 */
	export function downloadData(url: string, isText: boolean, cb: (data: any) => void);

	/**
	 * 获取一个远程资源并缓存在本地文件中，返回缓存后的资源地址
	 * @param url 
	 * @param cors 
	 * @param cb 
	 */
	export function fetchURL(url: string, cors: boolean, cb: (url: string) => void);

	/** 解析一个js对象 */
	export function eval(v: string): any;
}