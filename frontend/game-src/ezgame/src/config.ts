/**
 * 运行平台
 * @category Global Config
 */
const enum Platform {
	/** 浏览器 */
	Browser,
	/** 基于WebView的手机app */
	App,
	/** 基于Native runtime的手机app */
	NativeApp,
	/** 微信小游戏 */
	WeiXin,
	/** QQ小游戏 */
	QQ
}

/**
 * 发布的运行平台
 * @category Global Config
 */
var PLATFORM: Platform;

/**
 * 日志接口
 * @category Global Config
 */
interface Logger {
	debug(format, ...args);
	info(format, ...args);
	warn(format, ...args);
	error(format, ...args);
}

/**
* 日志接口，如果项目没有定义日志接口则默认使用console输出log
 * @category Global Config
*/
var Log: Logger;

/**
 * 是否为调试模式
 * @category Global Config
 */
var DEBUG: boolean;

/**
 * 是否为发布模式
 * @category Global Config
 */
var PUBLISH: boolean;

/**
 * 是否需要性能分析
 * @category Global Config
 */
var PROFILING: boolean;

/**
 * WebGL版本
 * @category Global Config
 */
const enum WGLVersion {
	NoGL = 0,
	GL1 = 1,
	GL2 = 2
}

/** 
 * 当前使用的WebGL版本
 * @category Global Config
 */
var useWGL: WGLVersion;
