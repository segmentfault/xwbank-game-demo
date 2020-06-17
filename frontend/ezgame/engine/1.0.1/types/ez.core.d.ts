/**
 * 运行平台
 * @category Global Config
 */
declare const enum Platform {
    /** 浏览器 */
    Browser = 0,
    /** 基于WebView的手机app */
    App = 1,
    /** 基于Native runtime的手机app */
    NativeApp = 2,
    /** 微信小游戏 */
    WeiXin = 3,
    /** QQ小游戏 */
    QQ = 4
}

/**
 * 发布的运行平台
 * @category Global Config
 */
declare var PLATFORM: Platform;

/**
 * 日志接口
 * @category Global Config
 */
interface Logger {

    debug(format: any, ...args: any[]): any;

    info(format: any, ...args: any[]): any;

    warn(format: any, ...args: any[]): any;

    error(format: any, ...args: any[]): any;
}

/**
* 日志接口，如果项目没有定义日志接口则默认使用console输出log
 * @category Global Config
*/
declare var Log: Logger;

/**
 * 是否为调试模式
 * @category Global Config
 */
declare var DEBUG: boolean;

/**
 * 是否为发布模式
 * @category Global Config
 */
declare var PUBLISH: boolean;

/**
 * 是否需要性能分析
 * @category Global Config
 */
declare var PROFILING: boolean;

/**
 * WebGL版本
 * @category Global Config
 */
declare const enum WGLVersion {
    NoGL = 0,
    GL1 = 1,
    GL2 = 2
}

/**
 * 当前使用的WebGL版本
 * @category Global Config
 */
declare var useWGL: WGLVersion;

/**
 * 基础类型
 * @module CommonTypes
 */
declare namespace ez {

    /**
     * 可销毁对象接口
    */
    interface IDispose {

        /**
         * 销毁对象
        */
        dispose(): void;

        /**
         * 对象是否已被销毁
        */
        disposed: boolean;

        /**
        * 销毁时回调函数
        */
        onDispose?: Function;
	}

    /**
    * 集合改变事件
    */
    const enum CollectionChangeType {
        add = 0,
        update = 1,
        remove = 2,
        set = 3,
        clear = 4
    }

    /**
    * 集合数据源
    * @remark 在集合数据源上可以获取数据项添加/删除/修改的通知
    */
    class DataCollection implements IDispose {

        /**
        * 所有的数据项
        * @remark 只读属性，对数据集进行的直接修改将不会产生通知事件
        */
        readonly items: any[];

        readonly disposed: boolean;

        constructor(items?: any[]);

        /**
        * 获取数据项
        * @param index: 索引下标
        */
        getItem(index: number): any;

        /**
        * 在idx位置前插入一个数据项
        * @param idx: 插入位置
        * @param item: 数据项
        */
        insertItem(idx: number, item: any): void;

        /**
        * 添加一批数据集到数据源中
        * @param items: 数据集
        */
        addItems(items: any[]): void;

        /**
        * 重新设置数据集合
        * @param items 数据集合
        */
        setItems(items: any[]): void;

        /**
        * 添加一个数据项
        * @param item 数据项
        */
        addItem(item: any): void;

        /**
        * 删除idx位置的数据项
        * @param idx 要删除的数据项索引
        */
        removeIndex(idx: number): void;

        /**
        * 删除一个数据项
        * @param item 要删除的数据项
        */
        removeItem(item: any): void;

        /**
        * 更新idx位置的数据项
        * @param idx 索引下标
        * @param item 数据项
        */
        updateItem(idx: number, item: any): void;

        /**
        * 清除数据集
        */
        clear(): void;

        /**
        * 添加一个观察者，监听增删改事件
        * @param func: 事件通知处理函数
        */
        addObserver(func: (type: CollectionChangeType, index?: number, item?: any) => void, thisArg?: any): IDispose;

        /**
        * 清除所有观察者
        */
        clearObservers(): void;

        /**
        * 销毁数据集
        */
        dispose(): void;
	}

    /**
    * 数据模型对象
    * @remark 可以动态添加/删除/修改属性，属性的修改可以添加观察者来获得通知，可以添加数据绑定来同步2个对象间的属性值
    */
    class DataModel implements IDispose {

        /**
         * 对象是否已销毁
         */
        readonly disposed: boolean;

        constructor(data?: Object);

        /**
         * 设置属性默认值，当属性值不存在或为undefined时使用default中的值
         */
        setDefaults(vals: Dictionary<any>): void;

        /**
        * 设置一组属性转换器，当设置属性值时会先经过转换器转换
        */
        setPropConverters(conterters: Dictionary<(val: any) => any>): void;

        /**
        * 获取属性
        * @param name 属性名
        */
        getProp(name: string): any;

        /**
        * 是否具有某个属性
        * @param name 属性名
        */
        hasProp(name: string): boolean;

        /**
        * 设置属性
        * @remark 当属性发生改变时observer将会得到通知
        * @param name 属性名
        * @param val 属性值
        */
        setProp(name: string, val: any): void;

        /**
         * 将source里的所有属性设置到DataModel上
         */
        setData(source: Dictionary<any>): void;

        /**
         * 删除属性
         * @param name 属性名
         */
        removeProp(name: string): void;

        /**
        * 在属性上添加一个观察者获取属性变化通知
        * @param name 属性名
        * @param func 属性变更处理函数
        */
        addObserver(name: string, func: (newVal: any, oldVal?: any) => void, thisArg?: any): IDispose;

        /**
        * 属性绑定
        * @remark 当DataModel的属性变化时自动将目标对象的属性更新为最新的值，通过转换器可以将值进行相应的修改后在设置到目标对象上
        * @param propName 属性名
        * @param target 目标对象，目标对象可以为DataModel或者普通JS对象
        * @param targetProp 目标对象的属性
        * @param converter 属性转换器
        * @returns 绑定对象，可调用dispose()方法解除绑定
        */
        bind(propName: string, target: DataModel | Object, targetProp?: string, converter?: (val: any) => any): IDispose;

        /**
        * 两个DataModel双向属性绑定
        * @param propName 属性名
        * @param target 目标对象
        * @param targetProp 目标对象的属性
        * @returns 绑定对象，可调用对象的dispose()方法解除绑定
        */
        bind2way(propName: string, target: DataModel, targetProp?: string): IDispose;

        /**
        * 清除这个属性上的所有观察者
        */
        clearObserver(name: string): void;

        /**
        * 销毁时回调函数
        */
        onDispose: Function;

        /**
        * 销毁对象
        */
        dispose(): void;
	}
}

/**
 * @module ezgame
 */
declare namespace ez {

    /**
     * 初始化事件注册，在egl初始化前被调用
     * @param func 回调函数
     * @param afterInit 默认在ez.initialize前调用，设置为true的话则在ez.initialize()之后调用
     */
    function initCall(func: Function, afterInit?: boolean): void;
}

/**
 * 基础类型
 * @module CommonTypes
 */
declare namespace ez {

    /**
    * 4个数字的元组
    */
    type Number4 = [number, number, number, number];

    /**
    * 3个数字的元组
    */
    type Number3 = [number, number, number];

    /**
    * 2个数字的元组
    */
    type Number2 = [number, number];

    /**
    * 字典类型
    */
    type Dictionary<T> = {
        [key: string]: T;
    };

    /**
    * 定义UI位置坐标用的对象，支持像素和百分比
    */
    class Dimension {

        value: number;

        isPercent: boolean;

        constructor(val: number | string);

        toString(): string;

        /**
        * 转换为像素坐标值
        */
        calcSize(size: number): number;
	}

    /**
     * 2D点对象
     */
    class Point {

        constructor(x?: number, y?: number);

        x: number;

        y: number;

        clone(): Point;

        toString(): string;

        equals(pt: Point): boolean;

        static add(p1: Point, p2: Point): Point;

        static sub(p1: Point, p2: Point): Point;

        static mul(p1: Point, v: number): Point;

        static parse(val: string): Point;

        static distance(p1: Point, p2: Point): number;
	}

    /**
     * 2D矩形对象
     */
    class Rect {

        right: number;

        bottom: number;

        constructor(l?: number, t?: number, w?: number, h?: number);

        left: number;

        top: number;

        width: number;

        height: number;

        clone(): Rect;

        toString(): string;

        static parse(val: string): Rect;

        contains(x: number, y: number): boolean;

        containsPt(pt: Point): boolean;

        static equal(r1: Rect, r2: Rect): boolean;

        static intersect(r1: Rect, r2: Rect): Rect;
	}

    class Color {

        readonly rgba: number;

        r: number;

        g: number;

        b: number;

        a: number;

        constructor(r?: number, g?: number, b?: number, a?: number);

        toVec3(): Number3;

        toVec4(): Number4;
	}

    /**
     * 2D矩阵对象
     */
    class Matrix {

        constructor(a?: number, b?: number, c?: number, d?: number, tx?: number, ty?: number);

        _11: number;

        _12: number;

        _21: number;

        _22: number;

        tx: number;

        ty: number;

        static Deg2Rad: number;

        static Identity: Matrix;

        static rotate(angle: any): Matrix;

        static scale(sx: any, sy: any): Matrix;

        static translate(x: any, y: any): Matrix;

        clone(): Matrix;

        identity(): Matrix;

        rotate(a: any): Matrix;

        scale(sx: any, sy: any): Matrix;

        translate(x: any, y: any): Matrix;

        append(m: Matrix): Matrix;

        invert(): Matrix;

        transformPt(pt: Point): Point;

        transform(pt: Number2): void;

        static multiply(m1: Matrix, m2: Matrix): Matrix;
	}

    /**
    * 渐变填充信息
    */
    interface GradientFill {

        x0?: number;

        y0?: number;

        x1?: number;

        y1?: number;

        colors: Array<string>;
	}

    /**
    * 文本描边信息
    */
    interface StrokeStyle {

        width: number;

        color: string;
	}

    /**
    * 播放状态
    */
    const enum MediaState {
        Stop = 0,
        Play = 1,
        Pause = 2
    }

    /**
    * 对齐模式
    */
    enum AlignMode {
        Left = 0,
        Center = 1,
        Right = 2,
        Top = 0,
        VCenter = 4,
        Bottom = 8
    }

    /**
    * 文本文本布局方式
    */
    enum TextFormat {
        SingleLine = 0,
        /**
        * 按词来换行
        */
        WordBreak = 1,
        /**
        * 多行
        */
        MultiLine = 2,
        /**
        * 超出范围的文字用...代替
        */
        Ellipse = 4,
        /**
        * 宽度超出范围时缩小显示
        */
        Shrink = 8,
        /**
        * 富文本格式
        * 支持<color #fff></color> <font 22px></font> <stroke 2 #fff></stroke> <br>
        */
        RichText = 16
    }

    /**
    * 混合模式
    */
    enum BlendMode {
        Normal = 0,
        Add = 1,
        Copy = 2,
        Subtract = 3,
        Multiply = 4,
        Screen = 5
    }

    /**
    * 触摸事件数据
    */
    interface TouchData {

        /**
        * 触摸点的id
        */
        id: number;

        /**
        * 屏幕坐标，可以使用screenToClient转换为UI元素的局部坐标
        */
        screenX: number;

        screenY: number;

        /**
        * 是否向上冒泡，默认为：true
        */
        bubble: boolean;

        /**
        * 事件发起时间
        */
        time: number;

        /**
        * 捕获该点事件，使得后续事件不管是否在该控件内都向该控件发送
        */
        capture(): any;

        /**
        * 取消控件对该触摸点的捕获
        */
        excludeCapture(): any;
	}
}

/**
 * 声音模块
 * @module Audio
 */
declare namespace ez {

    /**
     * 是否允许背景音乐播放
    */
    var bgmEnable: boolean;

    /**
     * 是否允许音效播放
     * @category Audio
    */
    var sfxEnable: boolean;

    /**
    * 设置音乐的音量
    * @param val 音量 0 ~ 1
    */
    function setBGMVolume(val: number): void;

    /**
    * 设置音效的音量
    * @param val 音量 0 ~ 1
    */
    function setSFXVolume(val: number): void;

    /**
    * 播放音效
    * @param name 资源名
    */
    function playSFX(name: string): void;

    /**
    * 音乐播放停止
    * @param fadeOut 设置音乐淡出效果的时间
    */
    function stopMusic(track: number, fadeOut?: number): void;

    /**
    * 音乐播放
    * @param track 音轨号
    * @param name 资源名
    * @param loop 是否循环播放，默认false
    * @param volume 音量, 默认1
    * @param fadeIn 设置音乐淡入效果的时间(ms)
    */
    function playMusic(track: number, name: string, loop?: boolean, volume?: number, fadeIn?: number): void;
}

/**
 * 渲染模块
 * @module Renderer
*/
declare namespace ez {

    function getGL(): WebGLRenderingContext;

    interface IRenderContext {

        scale: number;

        fillRect(width: number, height: number, transform: Handle): any;

        drawImage(texture: Texture, transform: Handle, width: number, height: number, srcRect?: Rect): any;

        drawImageRepeat(texture: Texture, transform: Handle, width: number, height: number, repeat: string): any;

        drawImageS9(texture: Texture, transform: Handle, s9: Number4, width: number, height: number, srcRect?: Rect): any;

        setAlphaBlend(value: number, blendMode: BlendMode): any;

        setFillColor(color: string): any;

        setFillGradient(gradient: GradientFill): any;

        pushClipRect(clip: Rect): boolean;

        popClipRect(): any;

        endRender(): any;
	}

    interface IRenderContextWGL extends IRenderContext {

        width: number;

        height: number;

        invWidth: number;

        invHeight: number;

        profile: WGLPerFrameProfiler;

        beginRender(target: RenderTexture, profile?: WGLPerFrameProfiler): any;

        setShader(shader: Shader, params?: any): any;

        flush(): any;

        createVAO(bindFunc: (gl: WebGLRenderingContext) => void): Function;

        drawTriangles(vaoBinder: Function, count: number): any;

        drawTextCache(x: number, y: number, cache: any, transform: Handle): any;

        bindTexture(tex: Texture, idx: number): any;

        begin3DRender(bound?: Rect): IRenderContext3D;

        beginRecorder(): any;

        endRecorder(): Object;

        replay(commands: Object): any;
	}

    interface IRenderContextCanvas extends IRenderContext {

        beginRender(target: RenderTexture, profile?: CanvasPerFrameProfiler): any;

        getCanvasContext2D(): CanvasRenderingContext2D;

        drawText(content: TextMetric, transform: Handle, x: number, y: number, width: number, height: number, align: AlignMode, stroke?: StrokeStyle): any;
	}

    function createCanvasRenderContext(): IRenderContextCanvas;

    interface IRenderContext3D {

        width: number;

        height: number;

        lastPrimitive: any;

        gl: WebGLRenderingContext;

        profiler: WGLPerFrameProfiler;

        shader: Shader;

        setShader(shader: Shader): any;

        bindTexture(tex: Texture, idx: number): any;

        bindCubeTexture(tex: Texture, idx: number): any;

        defTexture: Texture;

        end(): any;
	}

    /**
    * 渲染上下文
    */
    var RenderContext: IRenderContextCanvas | IRenderContextWGL;
}

/**
 * 性能采集和分析
 * @module Profiling
*/
declare namespace ez {

    /**
    * WebGL渲染模式下逐帧性能分析数据
    */
    class WGLPerFrameProfiler {

        frame: number;

        startTime: number;

        endTime: number;

        updateTime: number;

        renderTime: number;

        flush: number;

        setClip: number;

        setTexture: number;

        setShader: number;

        drawQuad: number;

        drawcall: number;

        triangle: number;

        blendChange: number;

        fontCache: number;

        fontCacheSize: string[];

        commands: [number, string][];
	}

    /**
     * Canvas渲染模式下逐帧性能分析数据
     */
    class CanvasPerFrameProfiler {

        frame: number;

        startTime: number;

        endTime: number;

        updateTime: number;

        renderTime: number;

        fillRect: number;

        drawImage: number;

        drawText: number;

        transfromChange: number;

        commands: [number, string][];
	}

    namespace Profile {

        /**
         * 开始逐帧性能分析
         * @detail detail 是否需要包含详细的命令列表数据
         * @param onData 每帧性能数据回调
         */
        function beginFrameProfiling(detail: boolean, onData?: (data: WGLPerFrameProfiler | CanvasPerFrameProfiler) => void): void;

        /**
         * 停止逐帧性能分析
         */
        function endFrameProfiling(): void;

        /**@ignore */
        interface EventData {

            type: string;

            args: string;

            steps: {
                name: string;
                time: number;
            }[];

            start: number;

            time: number;
		}

        /**
        * 开始事件采集分析
        */
        function beginEventProfiling(): void;

        /**
        * 停止事件采集分析
        */
        function endEventProfiling(): EventData[];

        /**
         * 获取当前毫秒数
         */
        function now(): number;

        /**@ignore */
        function newFrame(): WGLPerFrameProfiler | CanvasPerFrameProfiler;

        /**@ignore */
        function endFrame(): void;

        /**
         * 在frameprofiling中添加一条渲染命令
         */
        function addCommand(cmd: string): void;

        /**@ignore */
        interface IEvent {

            addStep(name: string): any;

            end(): any;
		}

        /**
         * 添加一个事件
         * @param type
         * @param args
         */
        function newEvent(type: string, parameter: string): IEvent;
	}
}

/**
 * @module ezgame
*/
declare namespace ez {

    /**
    * 使用canvas渲染
    */
    const enum CanvasSupport {
        /**
         *不支持canvas模式
        */
        NotSupport = 0,
        /**
         * 如果没有WebGL，退回canvas模式
        */
        Fallback = 1,
        /**
         * 只用canvas模式
        */
        Prefer = 2
    }

    /**
    * 引擎启动参数
    */
    interface LaunchData {

        /**
        * 游戏窗口宽度
        */
        width?: number;

        /**
        * 游戏窗口高度
        */
        height?: number;

        /**
        * 窗口最小宽度
        */
        minWidth?: number;

        /**
        * 窗口最大宽度
        */
        maxWidth?: number;

        /**
        * 窗口最小高度
        */
        minHeight?: number;

        /**
        * 窗口最大高度
        */
        maxHeight?: number;

        /**
        * 窗口最小宽高比
        */
        minRatio?: number;

        /**
        * 窗口最大宽高比
        */
        maxRatio?: number;

        /**
        * 窗口根元素
        * 如果不指定的话，默认寻找id为game的元素
        */
        div?: HTMLElement;

        /**
        * 微信小游戏主屏canvas
        */
        canvas?: HTMLCanvasElement;

        /**
        * 窗口适配策略
        *
        * 微信小游戏平台上只支持FixedHeight,FixedWidth,ScreenSize三种模式
        */
        scaleMode: ScreenAdaptMode;

        /**
        * 自定义窗口适配策略
        */
        onScreenAdapt?: (screenWidth: number, screenHeight: number) => {
            width: number;
            height: number;
            scale: number;
        };

        /**
        * 游戏窗口对齐模式
        */
        alignMode?: ScreenAlignMode;

        /**
        * 期望的fps，default: 60
        */
        fps?: number;

        /**
        * WebGL创建附加参数
        */
        wglOptions?: WebGLContextAttributes;

        /**
        * 是否在高分屏上启用高清渲染
        */
        highDPI?: boolean;

        /**
        * 是否开启3D渲染功能
        */
        render3D?: boolean;

        /**
        * canvas模式支持
        */
        canvasMode?: CanvasSupport;
	}

    /**
    * 在下一帧渲染时调用，常用于循环刷新
    */
    function callNextFrame(func: () => void, thisObj?: any): void;

    /**
    * 添加一个timer
    */
    function setTimer(delay: number, func: () => void, thisObj?: any): number;

    /**
    * 删除一个timer
    */
    function removeTimer(id: number): void;

    /**
    * 添加每帧循环调用，常用于循环刷新
    */
    function addTicker(func: (dt: number) => void, thisObj?: any): Object;

    /**
    * 获取当前游戏时间(ms)
    */
    function getTick(): number;

    /**
    * 删除一个ticker
    */
    function removeTicker(ticker: Object): void;

    /**
     * 当前游戏运行的fps
     */
    var fps: number;

    /**
    * 时间加速/减速(加速齿轮)，对timer起作用
    * @scale 时间缩放系数，例如：0.5表示时间加速一倍，2表示时间减慢一倍
    */
    function timeShift(scale: number): void;

    /**
    * 获得根对象
    */
    function getRoot(): UIRoot;

    /**
     * 暂停游戏
     */
    function pause(): void;

    /**
     * 继续运行
     */
    function resume(): void;

    /**
     * 等待一段事件
     * @param ms 毫秒数
    */
    function delay(ms: number): Promise<void>;

    /**
     * 等待下一帧开始
    */
    function nextFrame(): Promise<void>;

    /**
    * 引擎初始化
    */
    function initialize(data: LaunchData): void;
}

/**
 * @module Renderer
*/
declare namespace ez {

    /**
    * shader对象
    */
    class Shader {

        proc: WebGLProgram;

        uniforms: Dictionary<{
            location: WebGLUniformLocation;
            bind: (loc: WebGLUniformLocation, ...args: any[]) => void;
            matrix: boolean;
        }>;

        texUniforms: Dictionary<number>;

        name: string;

        sortKey: number;

        /**
         * 构造函数
         * @param vsCode: vertex shader 代码
         * @param fsCode: fragment shader 代码
         * @param attribs: 顶点属性名列表，名字索引对应属性索引
         * @param uniforms: uniform绑定函数表
         * @param textures: unifrom表中的附加纹理参数(不包含texture0，2d effect中使用)
         */
        constructor(vsCode: string, fsCode: string, attribs: string[], uniforms: Dictionary<(loc: WebGLUniformLocation, ...args: any[]) => void>, textures?: string[]);

        /**
         * 清除uniform缓存
         */
        clearCache(): void;

        /**
         * shader中是否有该unifrom值
         * @param name uniform name
         */
        hasUniform(name: string): boolean;

        /**
         * 绑定uniform
         *	shader默认会缓存uniform值，在下次绑定时判断值是否有改变，只有在发生改变时才调用API进行绑定
         * @param name uniform name
         * @param value uniform value
         * @param noCache 不对该uniform进行缓存，如果该uniform值在运行时频繁改变则不要进行缓存
         */
        bind(name: string, value: any, noCache?: boolean): void;
	}
}

/**
 * @module Renderer
*/
declare namespace ez {

    /**
    * 2d渲染特效
    * @remark 当使用WebGL渲染模式时Sprite可以使用shader特效，设置sprite.effect和对应的effectParams即可。
    * 核心库中默认提供了mono(黑白特效)和mask(模板剪切特效)，更多的特效可以加载扩展库获得
    */
    class Effect extends Shader {

        /**
         * 默认2D四边形绘制的vertex shader
         */
        static DefVS2D: string;

        /**
         * 默认2D绘制Fragment shader
         */
        static DefFS2D: string;

        static default: Effect;

        constructor(fsCode: string, uniforms?: Dictionary<(loc: WebGLUniformLocation, ...args: any[]) => void>, textures?: string[]);

        /**
         * 注册effect
         * @param name effect名
         * @param shader shader对象
         */
        static register(name: string, effect: Effect): void;

        /**
         * 是否有该effect
         * @param name
         */
        static has(name: string): boolean;

        /**
         * 获取effect
         * @param name
         */
        static get(name: string): Effect;
	}
}

declare namespace ez {

    /** @ignore */
    module FontCache {

        var Width: number;

        var Height: number;

        var rev: number;

        interface TextCacheObject {

            img: any;

            w: number;

            h: number;

            text: string;

            use?: number;

            r?: number[];

            region?: number[];

            rev?: number;
		}

        function log(): void;
	}
}

/**
 * @module Visual
*/
declare namespace ez {

    /**
    * sprite数据定义
    */
    interface SpriteData {

        type: string;

        id?: string;

        blendMode?: BlendMode;

        visible?: boolean;

        zIndex?: number;

        x?: number;

        y?: number;

        scaleX?: number;

        scaleY?: number;

        scale?: number;

        width?: number;

        height?: number;

        anchorX?: number;

        anchorY?: number;

        angle?: number;

        opacity?: number;

        color?: string;

        mirrorH?: boolean;

        mirrorV?: boolean;

        skew?: number;

        effect?: string;

        effectParams?: Object;

        src?: string;

        pattern?: string;

        clip?: boolean;

        ownerBuffer?: boolean;

        culling?: boolean;

        batchMode?: boolean;

        drawCache?: boolean;

        childs?: SpriteData[];

        gradient?: string;

        text?: string;

        font?: string;

        format?: TextFormat;

        strokeColor?: string;

        strokeWidth?: number;

        bkColor?: string;

        lineHeight?: number;

        align?: AlignMode;

        margin?: Number4;

        frames?: SeqFrameDesc | string[];

        fps?: number;

        loop?: boolean;

        framesDuration?: number[];

        autoPlay?: boolean;

        onLoad?: Function;

        [key: string]: any;
	}

    /**
     * Sprite基类
     */
    abstract class Sprite implements IDispose {

        culled: boolean;

        /**
         * 是否已被销毁
         */
        readonly disposed: boolean;

        /**
        * 获取局部变换矩阵（相对parent）
        */
        readonly localTransform: Matrix;

        /**
        * 获取全局变换矩阵
        */
        readonly globalTransform: Matrix;

        /**
        * 是否显示
        */
        visible: boolean;

        /**
        * effect特效(仅WebGL模式下支持)
        * @default null，使用默认效果
        */
        effect: string;

        /**
         * 设置shader参数
         */
        set effectParams(params: Object);

        /**
        * 颜色
        * @default #ffffff
        */
        color: string;

        /**
        * 设置z排序值
        * @remark 对象显示顺序自动按照zIndex顺序排序，zIndex大的在上面
        * @default 0
        */
        zIndex: number;

        /**
        * sprite对象名字
        */
        readonly id: string;

        /**
        * 透明度，取值(0~1)
        */
        opacity: number;

        /**
        * 混合模式
        */
        blendMode: BlendMode;

        protected _parent: Stage;

        protected _id: string;

        protected _zIndex: any;

        protected _color: string;

        protected _handle: Handle;

        protected _target: Sprite;

        protected _targetRev: number;

        protected _blendMode: BlendMode;

        protected _opacity: number;

        protected _effect: string;

        protected _effectParams: any;

        /**
         * 根据类型名创建sprite
         * @param type: 类型名
         * @param parent: stage容器
         * @param id: 对象id， optional
         */
        static create<T extends Sprite>(type: string, parent: Stage, id?: string): T;

        /**
         * 注册Sprite对象类型
         * @param type: 类型名
         * @param creator: 创建函数
         */
        static register(type: string, creator: (parent: Stage, id?: string) => Sprite): void;

        protected _dispose(): void;

        protected applyEffect(rc: IRenderContext): void;

        protected _buildTransform(): void;

        protected _prepare(bound: Rect, transfrom: Handle, transChanged: boolean): void;

        protected abstract _draw(rc: IRenderContext, opacity: number): void;

        /**
         * 构造函数
         * @param stage 舞台容器
         * @param id 对象名字
         */
        constructor(stage: Stage, id?: string);

        /**
         * 获取对象类型
         */
        abstract getType(): string;

        /**
         * 销毁事件（销毁时触发）
         */
        onDispose: Function;

        /**
         * 销毁sprite，销毁之后会自动从stage中移除该对象
         */
        dispose(): void;

        /**
         * 设置对象变化标志，触发刷新计算
         * @description 通常该方法不需要手动调用，引擎内部会自动跟踪所有的属性变化，在绘制前检查对象的变化标志触发相关的刷新计算
         * @param needSort 是否改变了zorder，需要重新进行z排序
         */
        setDirty(needSort?: boolean): void;

        /**
         * 判断该点是否在对象上
         * @param x
         * @param y
         */
        hitTest(x: number, y: number): boolean;

        /**
         * 将对象移到目标stage中
         * @param stage 目标stage
         */
        setParent(stage: Stage): void;

        /**
        * 将sprite对象链接到目标对象上，跟随目标对象的变换矩阵运动
        * @param target 跟随的对象
        */
        link(target: Sprite): void;

        /**
        * 取消链接
        */
        unlink(): void;

        /**
        * x位置
        */
        x: number;

        /**
        * y位置
        */
        y: number;

        /**
        * 水平方向缩放
        */
        scaleX: number;

        /**
        * 垂直方向缩放
        */
        scaleY: number;

        /**
        * 整体缩放
        */
        scale: number;

        /**
        * 宽度
        */
        width: number;

        /**
        * 高度
        */
        height: number;

        /**
        * x轴锚点(0~1)，默认在左上角
        */
        anchorX: number;

        /**
        * y轴锚点(0~1)，默认在左上角
        */
        anchorY: number;

        /**
        * 旋转角度(顺时针)，单位为角度
        */
        angle: number;

        /**
        * 水平方向斜切
        */
        skew: number;

        /**
        * 水平方向镜像
        */
        mirrorH: boolean;

        /**
        * 垂直方向镜像
        */
        mirrorV: boolean;
	}
}

/**
 * @module GUI
*/
declare namespace ez.parse {

    /**
    * 解析渐变填充
    */
    function GradientFill(val: string | ez.GradientFill): ez.GradientFill;

    /**
    * 解析Dimension
    */
    function Dimension(val: number | string | ez.Dimension): ez.Dimension;

    function Boolean(val: boolean | string): boolean;

    function Float(val: number | string): number;

    function Int(val: number | string): number;

    /**
    * 解析序列帧动画描述
    */
    function SeqFrameDesc(val: ez.SeqFrameDesc | string): ez.SeqFrameDesc;

    /**
    * 解析图片资源名，如果资源是http://开头的则会解析为外部资源
    */
    function ImageSrc(val: string | ez.ImageRes): any;

    /**
    * 解析csv
    */
    function CSV(csv: string): string[][];

    /**
    * 解析number数组
    * @param s
    */
    function Numbers(s: any): number[];

    /**
    * 解析Number4
    * @param s
    */
    function Number4(s: any): ez.Number4;

    /**
    * 解析JS对象，和JSON的区别在于属性名可以不带双引号，简化写法
    * @param val 字符串
    */
    function JSObj(val: any): any;

    /**
    * 解析枚举值，多个枚举值可以用|组合
    * @param val
    * @param enumType
    */
    function Enums(val: string, enumType: Object): number;

    /**
    * 获取某个枚举类型的解析器
    * @param enumType 枚举类型
    */
    function getEnumParser(enumType: Object): (val: any) => any;
}

/**
 * @module GUI
*/
declare namespace ez.ui {

    /**
    * UI属性绑定数据定义
    */
    interface DataBinderItem {

        /**
        * 源对象，源对象需从DataModel继承
        */
        src?: Object;

        /**
        * 源属性名字
        */
        prop: string;

        /**
        * 目标对象
        */
        target: Object;

        /**
        * 目标属性名字
        */
        targetProp?: string;

        /**
        * 转换函数
        */
        converter?: (val: any) => any;
	}

    /**
    * UI属性定义，供UI模板编译器使用
    */
    interface PropDefine {

        name: string;

        type: string;

        default?: any;

        converter?: (data: string) => any;

        validate?: string;

        customProperty?: boolean;
	}

    /**
    * Control状态迁移的子项数据定义
    */
    /**
    * Control状态迁移数据定义
    */
    interface ControlStateData {

        onEnter?: (ctrl: Control, lastState: string) => void;

        onLeave?: (ctrl: Control, newState: string) => void;

        props?: Dictionary<any>;
	}

    /**
    * UI元素的数据定义
    */
    interface ElementData {

        class: string;

        id?: string;

        childsProperty?: any;

        _array?: any[];

        _childs?: any[];

        [x: string]: any;
	}

    /**
     * UI类的元数据
     */
    interface UIClassData {

        prototype: any;

        ClassName: string;

        Properties: PropDefine[];

        HasChildElements?: boolean;

        States?: Dictionary<ControlStateData>;

        Styles?: Dictionary<any>;

        baseclass: UIClassData;

        hasProperty(prop: string): boolean;
	}

    interface ControlClass {

        prototype: any;

        mixins(eventHander: any): void;

        checkStates(...states: string[]): any;
	}

    /**
    * UI事件
    */
    interface EventArgs {

        /**
        * 事件名字
        */
        name: string;

        /**
        * 发起事件的控件
        */
        sender: Element;

        /**
        * 事件参数
        */
        arg?: any;

        /**
        * 是否向上冒泡
        */
        bubble: boolean;
	}

    /**
     * 文本样式
     * @summary 文本样式包含了一组文本相关的属性，用于设置控件上的文本样式，控件的文本样式会逐级向上继承父容器上的文本样式，通过向容器设置文本样式方便统一更改每个子控件的文本样式
     */
    interface TextStyle {

        /**
         * 样式名
        */
        id: string;

        font?: string;

        format?: TextFormat;

        strokeColor?: string;

        strokeWidth?: number;

        color?: string;

        bkColor?: string;

        lineHeight?: number;

        align?: AlignMode;

        margin?: Number4;

        gradient?: GradientFill;
	}

    /**
     * UI模板数据
     * @description 通过uiml定义template，可以实现UI类的逻辑和样式分离，用户可以在uiml中定义UI类的属性、childs、数据绑定和事件处理。
     * 在template中重新定义childs，从而获得新的外观、布局等信息。当这个UI类创建的时候指定template属性就可以将UI的外观和布局替换成模板
     * 中所定义的内容，从而实现逻辑和样式的独立修改。
     */
    interface Template {

        name: string;

        childs: ElementData[] | any[];

        init(ui: Container): any;
	}

    /**
     * 注册UI模板
     * @param temps
     */
    function registerTemplates(temps: Dictionary<Template> | Template[]): void;

    /**
     * 获取ui模板
     * @param name 模板名
     * @returns template
     */
    function getTemplate(name: string): Template;

    /**
     * 添加一个/一组文本样式
     * @param style
     */
    function registerTextStyle(style: TextStyle | TextStyle[]): void;

    /**
     * 获取文本样式
     * @param style 样式名
     */
    function getTextStyle(style: string): any;

    function getTextStyleNames(): string[];

    function getAllGuiClassNames(): string[];

    function getGuiClass(name: string): UIClassData;

    /** 注册UI类 */
    function initUIClass(uiClass: UIClassData, baseClass: UIClassData, abstract?: boolean): void;

    /**
    * UI基类，提供基础UI属性，数据绑定， 布局计算
    */
    class Element extends DataModel {

        /**
         * 获取控件类的元数据
         */
        readonly class: UIClassData;

        /**
        * 控件id标识
        * @remark 每个自定义的UI类都可以包含若干带id名字的子UI元素，可以通过find方法查找，也可以通过namedChilds属性访问
        */
        readonly id: string;

        /**
        * 父UI容器
        */
        readonly parent: Container;

        readonly parentStage: Stage;

        protected static _propDefaults: Dictionary<any>;

        protected static _propConverters: Dictionary<(val: any) => any>;

        static baseclass: UIClassData;

        static ClassName: string;

        static Properties: PropDefine[];

        static hasProperty(prop: string): boolean;

        protected _bound: Rect;

        protected _parent: Container;

        protected _setProps(props: Dictionary<any>): void;

        protected _init(uiClass: any): void;

        constructor(parent: Container);

        /**
        * 发起一个自定义事件
        * @param event: 事件名字
        * @param arg: 事件参数
        * @param bubble: 是否向上冒泡，默认为false
        */
        fireEvent(event: string, arg?: any, bubble?: boolean): void;

        /**
        * 添加事件的回调处理函数
        * @param event: 事件名字
        * @param func: 事件回调函数
        * @param ctx: this上下文
        */
        addEventHandler(event: string, func: (e: EventArgs) => any, ctx?: any): IDispose;

        /**
         * 从父容器中移除并销毁该UI对象
         */
        dispose(): void;

        /**
        * 左边界位置
        * @remark set可以是number,string,Dimension类型，get时为Dimension类型
        */
        left: number | string | Dimension;

        /**
        * 上边界位置
        */
        top: number | string | Dimension;

        /**
        * 右边界位置
        * @remark 设置右边位置属性使得控件的右边自动跟随父控件的右边对齐
        */
        right: number | string | Dimension;

        /**
        * 底边界位置
        * @remark 设置底边位置属性使得控件的底边自动跟随父控件的底边对齐
        */
        bottom: number | string | Dimension;

        /**
        * 基于anchor点的x位置
        * @remark 当left和right都未设置时由x确定控件位置
        */
        x: number | string | Dimension;

        /**
        * 基于anchor点的y位置
        * @remark 当top和bottom都未设置时由y确定控件位置
        */
        y: number | string | Dimension;

        /**
        * 宽度
        */
        width: number | string | Dimension;

        /**
        * 高度
        */
        height: number | string | Dimension;

        /**
        * 透明度，0~1
        */
        opacity: number;

        /**
        * 可见性
        */
        visible: boolean;

        /**
        * 水平缩放倍率
        * @remark 缩放和旋转仅改变UI元素的显示，但不会影响到UI的边界和布局
        */
        scaleX: number;

        /**
        * 垂直缩放倍率
        */
        scaleY: number;

        /**
        * 缩放倍率
        */
        scale: number;

        /**
        * 旋转角度
        */
        angle: number;

        /**
        * 控件中心点水平位置，0~1
        */
        anchorX: number;

        /**
        * 控件中心点垂直位置，0~1
        */
        anchorY: number;

        /**
        * 是否可触控，若设置为不可触控则点击判断会穿过该控件
        */
        touchable: boolean;

        /**
        * z排序值
        */
        zIndex: number;

        /**
        * 控件创建完成事件
        * @remark 可以通过uiClass.prototype.onCreate来绑定事件处理函数
        */
        onCreate: () => void;

        protected textStyleChanged(): void;

        /**
        * 获取UI元素的边界
        * @remark UI元素的布局计算是lazy evaluate的，在游戏逻辑中不管怎么修改布局属性，都不会立刻计算元素的边界，
        * 而是等到渲染前统一计算，这样节省了大量计算资源，但是也可能会导致依赖于元素边界数据的逻辑代码出现错误，因此在getBound()时
        * 可能返回null，这时需要调用measureBound(width, height, true)强制计算一下bound。
        */
        getBound(): Rect;

        /**
        * 屏幕坐标转换为UI局部坐标
        */
        screenToClient(x: number, y: number): Point;

        /**
        * UI局部坐标转换为屏幕坐标
        */
        clientToScreen(x: number, y: number): Point;

        /**
        * 设置边界（内部使用）
        */
        setBound(bound: Rect): void;

        /**
        * 测量UI元素的边界
        */
        measureBound(w: number, h: number, force?: boolean): void;

        /**
        * 测量点是否在控件内，xy为父控件坐标空间
        */
        ptInBound(x: number, y: number): boolean;

        /**
        * 点击判定，xy为本控件坐标空间
        */
        hitTest(x: number, y: number): boolean;

        /**
        * 查找点中的控件，xy为父控件坐标空间
        */
        findControls(x: number, y: number): ui.Control[];

        /**
         * 查找坐标点中的所有元素
         */
        findElements(x: number, y: number, results: ui.Element[]): void;
	}

    /**
    * UI容器基类，从Container继承的类中可以包含子元素
    */
    class Container extends Element {

        /**
        * 获得子元素数量
        */
        readonly childCount: number;

        readonly _displayStage: Stage;

        style: string;

        /**
         * 设置namedChilds元素的属性
         */
        set childsProperty(properties: Dictionary<any>);

        protected _childs: Array<Element>;

        protected _stage: SubStageSprite;

        protected _lastBound: Rect;

        protected _sizeDirty: boolean;

        protected _namedChilds: Dictionary<Element>;

        static ClassName: string;

        static Properties: PropDefine[];

        _removeChild(child: Element): void;

        protected _setChilds(data: ElementData[] | any[]): void;

        protected _setProps(props: Dictionary<any>): void;

        protected _createChilds(data: ElementData[] | any[]): void;

        /**
         * 根据名字查找子元素
         * @param id 元素id
         * @param recursive 是否递归向下级容器查找
         */
        find(id: string, recursive?: boolean): Element;

        /**
        * 删除所有的子元素
        */
        clearChilds(): void;

        dispose(): void;

        /**
        * 根据index获得子元素
        */
        getChild(idx: number): Element;

        protected textStyleChanged(): void;

        constructor(parent: Container, stage?: SubStageSprite);

        /**
        * 是否在渲染前预先剔除超出边界范围的物体，默认为false
        */
        culling: boolean;

        /**
        * 是否在渲染前预先剔除超出边界范围的物体，默认为false
        */
        drawCache: boolean;

        /**
        * 是否显示超出边界的子元素，默认为false
        */
        clip: boolean;

        /**
        * 是否自带显示缓冲区，默认为false
        */
        ownerBuffer: boolean;

        /**
        * 跨stage的自动合批模式
        * @remark 打开改选项可以将该容器下的所有子元素按照渲染状态进行重新排序，以尽可能有利于合批提高渲染性能（但也可能造成前后次序错误，谨慎使用）
        */
        batchMode: boolean;

        /**
        * 文本样式
        * @remark Label子控件会逐级向父容器请求文本样式
        */
        textStyle: string;

        /**
        *  创建子元素
         * @param uiclass UI类型
         * @param [props] 属性表
         * @returns child ui子元素
         */
        createChild<T extends Element>(uiclass: UIClass<T>, props?: any): T;

        /**
        * 测量边界
        */
        measureBound(w: number, h: number, force?: boolean): void;

        /**
         * 查找目标点下的Control及其子Control
         */
        findControls(x: number, y: number): Control[];

        /**
         * 查找坐标点中的所有元素
         */
        findElements(x: number, y: number, results: ui.Element[]): void;

        protected _setStyle(style: Dictionary<any>): void;
	}

    /**
    * 简单的UI容器类，用于包含多个子元素
    */
    class Group extends Container {

        static ClassName: string;

        static instance: Group;

        static Properties: PropDefine[];

        static HasChildElements: boolean;

        constructor(parent: Container);

        /**
         * 设置子控件
         */
        setChilds(data: ElementData[]): void;
	}

    /**
    * 控件基类
    * @remark 控件可以接收和处理触摸事件，控件类可以定义状态表
    */
    class Control extends Container implements TouchHandler {

        static ClassName: string;

        static instance: Control;

        static States: Dictionary<ControlStateData>;

        static Properties: PropDefine[];

        /**
         * 将Touch事件处理类混入当前Control类中
         * @param eventHander Touch事件处理类，可以从EventHandlerBase继承，用于处理Touch事件
         */
        static mixins(eventHander: any): void;

        /**
        * 检查控件状态表是否完整
        */
        static checkStates(...states: string[]): void;

        constructor(parent: Container);

        /**
        * 触摸点按下事件
        */
        onTouchBegin: (e: TouchData) => void;

        /**
        * 触摸点移动事件
        */
        onTouchMove: (e: TouchData) => void;

        /**
        * 触摸点抬起事件
        */
        onTouchEnd: (e: TouchData) => void;

        /**
        * 触摸点事件被取消
        */
        onTouchCancel: (id: number) => void;

        /**
        * 当前状态
        */
        state: string;

        /**
         * 控件是否默认可点中
         * @remark 设置为hittable时Control区域内都可被点中，否则将调用Control内子元素的hitTest方法来决定Control是否被点中
         */
        hittable: boolean;

        hitTest(x: number, y: number): boolean;

        protected _setStyle(style: Dictionary<any>): void;

        /**
         * 根据坐标查找子控件
         */
        findControls(x: number, y: number): Control[];

        protected _initStates(s: string, states: Dictionary<ControlStateData>): void;
	}

    /**
    * 设置滚动方向
    */
    enum ScrollMode {
        Horizontal = 1,
        Vertical = 2,
        All = 3
    }

    /**
    * 可滚动的视图容器，支持子元素在视图里的滚动显示
    */
    class ScrollView extends Control {

        readonly _displayStage: Stage;

        protected _scrollStage: SubStageSprite;

        static ClassName: string;

        static instance: ScrollView;

        static HasChildElements: boolean;

        static Properties: PropDefine[];

        dispose(): void;

        constructor(parent: Container);

        /**
        * 水平滚动位置
        */
        xScroll: number;

        /**
        * 垂直滚动位置
        */
        yScroll: number;

        /**
        * 水平滚动范围
        */
        scrollWidth: number;

        /**
        * 垂直滚动范围
        */
        scrollHeight: number;

        /**
        * 滚动方向
        */
        scrollMode: ScrollMode;

        /**
        * 计算滚动范围，如果没有设置scrollWidth/scrollHeight的话就根据子元素的位置和大小自动计算滚动范围
        */
        getScrollRange(): Number2;

        screenToClient(x: number, y: number): Point;

        clientToScreen(x: number, y: number): Point;

        findControls(x: number, y: number): Array<Control>;

        setChilds(data: ElementData[]): void;
	}

    /**
    * 带缩放的卷动视图容器
    */
    class ScaleScrollView extends ScrollView {

        static ClassName: string;

        static instance: ScaleScrollView;

        static HasChildElements: boolean;

        static Properties: PropDefine[];

        constructor(parent: Container);

        getScrollRange(): Number2;

        screenToClient(x: number, y: number): Point;

        clientToScreen(x: number, y: number): Point;

        findControls(x: number, y: number): Array<Control>;
	}

    /**
    * List item的布局模式
    */
    enum LayoutMode {
        /**
        * 横向排列
        */
        Horizontal = 0,
        /**
        * 纵向排列
        */
        Vertical = 1,
        /**
        * 横向换行排列
        */
        Wrap = 2
    }

    /**
    * 列表视图元素接口
    */
    interface ListItemClass extends Element {

        dataSource: any;
	}

    /**
    * 列表视图，用于在视图内放置一组item元素，item的排列支持横向、纵向、换行三种排列方式
    */
    class ListView extends Container {

        set childsProperty(properties: Dictionary<any>);

        items: DataCollection | any[];

        static ClassName: string;

        static instance: ListView;

        static Properties: PropDefine[];

        _childChange: boolean;

        childSizeChanged(): void;

        measureBound(width: number, height: number, force?: boolean): void;

        dispose(): void;

        /**
        * 列表视图内不可直接创建子元素
        */
        createChild<T extends Element>(uiclass: UIClass<T>, props?: any): T;

        constructor(parent: Container);

        /**
        * 布局模式
        */
        layoutMode: LayoutMode;

        /**
        * item元素的UI类，列表根据指定的UI类来创建item所对应的UI子元素
        */
        itemClass: string;

        /**
        * item之间的间距
        */
        itemPadding: Number4;

        /**
         * item属性设置（设置一组属性值，用于初始化item元素的属性）
         */
        item: Dictionary<any>;
	}

    const enum SlideMode {
        Horizental = 0,
        Vertical = 1
    }

    /**
    * 用于包含多个标签页显示的视图
    */
    class StackView extends Control {

        static ClassName: string;

        static instance: StackView;

        static HasChildElements: boolean;

        static Properties: Array<PropDefine>;

        constructor(parent: Container);

        /**
         * 添加一个页面，如果要删除页面的话，调用页面对象的dispose()即可
         * @param uiClass 页面的类名
         * @param props   页面属性
         */
        addPage<T extends Element>(uiclass: UIClass<T>, props?: any): T;

        /**
         * 获取page
         * @param index
         */
        getPage(index: number): Element;

        /**
        * 设置一组页面
        */
        setChilds(data: ElementData[]): void;

        /**
         * 滑动过渡效果
         * @param mode
         */
        slideTransition: (p: number, prevPage: Element, activePage: Element) => void;

        /**
         * 允许点击滑动
         * @param mode
         */
        touchSlide(mode: SlideMode): void;

        /**
        * 滑屏效果
        * @param activePage: 切换到的目标页面Index
        * @param aniCB: 自定义动画效果，返回tween动画对象
        */
        slide(activePage: number, aniCB: (prevPage: Element, activePage: Element) => Tween): void;

        /**
        * 当前显示页面的index
        */
        activePage: number;
	}

    /**
    * 用于包装sprite可视元素，实现UI对象的可视化，Visual是叶节点，不可包含UI子元素
    */
    class Visual extends Element {

        /** 获取sprite对象 */
        readonly sprite: Sprite;

        /**
         * shader特效参数
         */
        effectParams: Object;

        static ClassName: string;

        static Properties: PropDefine[];

        protected _sprite: Sprite;

        /**
         * shader特效
         */
        effect: string;

        /**
        * 混合模式
        */
        blendMode: string | BlendMode;

        /**
        * 水平镜像
        */
        mirrorH: boolean;

        /**
        * 垂直镜像
        */
        mirrorV: boolean;

        /**
        * 销毁UI对象
        */
        dispose(): void;

        constructor(parent: Container, sprite: Sprite);

        hitTest(x: number, y: number): boolean;
	}

    /**
    * 矩形填充元素，包装RectFillSprite
    */
    class RectFill extends Visual {

        static ClassName: string;

        static instance: RectFill;

        static Properties: PropDefine[];

        constructor(parent: Container);

        /** 获取sprite对象 */
        sprite: RectFillSprite;

        /**
        * 渐变填充
        */
        gradient: GradientFill;

        /**
        * 颜色填充
        */
        color: string;
	}

    /**
    * 图像元素
    */
    class Image extends Visual {

        /**
         * 直接设置纹理
         */
        set image(v: Texture);

        static ClassName: string;

        static instance: Image;

        static Properties: PropDefine[];

        constructor(parent: Container);

        /** 获取sprite对象 */
        sprite: ImageSprite;

        /**
         * 平铺模式
         */
        pattern: string;

        /**
         * 图片资源
         */
        src: string | ImageRes;

        /**
         * 颜色相乘
         */
        color: string;

        hitTest(x: number, y: number): boolean;

        measureBound(width: number, height: number, force?: boolean): void;
	}

    /**
    * 序列帧动画元素
    */
    class SeqFrame extends Visual {

        /**
         * 播放状态
         */
        readonly state: MediaState;

        static ClassName: string;

        static instance: SeqFrame;

        static Properties: PropDefine[];

        constructor(parent: Container);

        /** 获取sprite对象 */
        sprite: SeqFrameSprite;

        /**
         * 载入后自动播放
         */
        autoPlay: boolean;

        /**
         * 序列帧定义
         */
        frames: SeqFrameDesc;

        /**
         * 播放帧率
         */
        fps: number;

        /**
         * 循环播放
         */
        loop: boolean;

        /**
         * 颜色相乘
         */
        color: string;

        /**
         * 开始播放
         */
        play(): void;

        /**
         * 停止播放
         */
        stop(): void;

        /**
         * 暂停播放
         */
        pause(): void;

        hitTest(x: number, y: number): boolean;

        measureBound(width: number, height: number, force?: boolean): void;
	}

    /**
    * SubStage元素，包装SubStageSprite。通过在UI里添加UIStage元素，用户就可以在该元素里获得Stage容器，从而向这个Stage添加sprites，构造轻量级的可视树
    */
    class UIStage extends Visual {

        /**
         * stage对象
         */
        readonly stage: Stage;

        static ClassName: string;

        static instance: UIStage;

        static HasChildElements: boolean;

        static Properties: PropDefine[];

        protected _setProps(props: Dictionary<any>): void;

        constructor(parent: Container);

        /** 获取sprite对象 */
        sprite: SubStageSprite;

        /**
         * 查找stage内的sprite
         * @param id: sprite id
         */
        find(id: string): Sprite;

        /**
         * 载入sprites
         */
        setChilds(val: SpriteData[]): void;
	}

    /**
    * 文本元素，包装LabelSprite
    */
    class Label extends Visual {

        /**
        * 文本测量结果
        */
        readonly textMetric: TextMetric;

        /**
        * 文本字体
        */
        font: string;

        /**
        * 文本格式
        */
        format: TextFormat;

        static ClassName: string;

        static instance: Label;

        static Properties: PropDefine[];

        _textStyleCache: TextStyle;

        constructor(parent: Container);

        protected textStyleChanged(): void;

        /** 获取sprite对象 */
        sprite: LabelSprite;

        measureBound(width: number, height: number, force?: boolean): void;

        /**
        * 文本样式
        * @summary: 如果不指定控件的文本样式，控件会向上从父控件继承文本样式
        */
        textStyle: string;

        /**
        * 文本内容
        */
        text: string;

        /**
        * 描边颜色
        */
        strokeColor: string;

        /**
        * 描边宽度
        */
        strokeWidth: number;

        /**
        * 文本颜色
        */
        color: string;

        /**
        * 文本背景色
        */
        bkColor: string;

        /**
        * 行高
        */
        lineHeight: number;

        /**
        * 文本对齐模式
        */
        align: AlignMode;

        /**
        * 文本边距
        */
        margin: Number4;

        /**
        * 文本渐变填充
        */
        gradient: GradientFill;
	}

    /**
     * 含超链接的富文本
     * @summary: 包装富文本Label，处理触摸事件，当用户点到a标签文本时产生click事件，event的arg参数为a标签的href值
     */
    class RichTextWithHyperlink extends Control {

        readonly namedChilds: {
            label: Label;
        };

        readonly textMetric: TextMetric;

        /**
        * 文本字体
        */
        font: string;

        static ClassName: string;

        static instance: RichTextWithHyperlink;

        static Properties: PropDefine[];

        _label: Label;

        _href: RichTextMetricLine;

        constructor(parent: Container);

        findHyperlink(pt: Point): RichTextMetricLine;

        onTouchBegin: (d: TouchData) => void;

        onTouchCancel: (id: number) => void;

        onTouchEnd: (d: TouchData) => void;

        text: string;

        color: string;

        lineHeight: number;
	}

    /**
    * 文本输入控件，使用html标签实现的输入控件
    */
    class TextInput extends Control {

        static ClassName: string;

        static instance: TextInput;

        static Properties: PropDefine[];

        static States: Dictionary<ControlStateData>;

        dispose(): void;

        constructor(parent: Container);

        protected textStyleChanged(): void;

        beginInput(): void;

        /**
        * TextInput内不可直接创建子元素
        */
        createChild<T extends Element>(uiclass: UIClass<T>, props?: any): T;

        findControls(x: number, y: number): Control[];

        text: string;

        font: string;

        color: string;

        bkColor: string;

        lineHeight: number;

        multiLine: boolean;

        margin: Number4;

        /**
        * 最大可输入的字符数
        */
        maxLength: number;

        /**
        * 是否在按回车时完成输入
        */
        submitOnReturn: boolean;

        /**
        * 输入类型：text,number,password
        */
        type: string;
	}

    /**
    * 标签按钮接口
    */
    interface TabBtn {

        /**
        * 标签状态 select/unselect
        */
        state: string;

        group: TabGroup;
	}

    /**
    * 标签页头，与StackView组合使用可以实现完整的标签视图
    */
    class TabGroup extends Container {

        static ClassName: string;

        static instance: TabGroup;

        static HasChildElements: boolean;

        static Properties: ui.PropDefine[];

        constructor(parent: ui.Container);

        select(tab: TabBtn): void;

        /**
        * 添加一个标签按钮
        */
        addTabBtn(btn: string | TabBtn, props?: any): any;

        /**
        * 设置一组标签按钮
        */
        setChilds(items: ui.ElementData[]): void;

        /**
        * 设置当前标签页index
        */
        activeIndex: number;
	}
}

/**
 * @module GUI
*/
declare namespace ez {

    interface TouchHandler {

        onTouchBegin: (e: TouchData) => void;

        onTouchMove: (e: TouchData) => void;

        onTouchEnd: (e: TouchData) => void;

        onTouchCancel: (id: number) => void;

        disposed: boolean;
	}

    type UIClass<T extends ui.Element> = {
        ClassName: string;
        instance: T;
    };

    /**
     * UI根对象接口，通过egl.getRoot()获取，root代表了整个游戏窗口区域的范围，可以在root上创建ui元素。
     */
    interface UIRoot extends DataModel {

        /**
         * 文本样式
         */
        textStyle: ui.TextStyle;

        /**
         * 在root上创建ui元素
         * @param uiclass ui类型
         * @param props 元素属性表
         * @return ui元素
         */
        createChild<T extends ui.Element>(uiclass: UIClass<T>, props?: any): T;

        /**
         * 根据id查找ui子元素
         */
        find(id: string, recursive?: boolean): ui.Element;

        /**
         * 清除所有ui子元素
         */
        clear(): any;

        /**
         * 屏幕大小变化事件处理
         */
        addScreenResizeListener(func: (width: number, height: number) => void, ctx?: any): any;

        /**
         * 某个触摸事件是否被控件捕获
         */
        isCaptured(id: number): boolean;

        /**
         * 取消输入
         */
        cancelInput(): any;

        /**
         * root宽度
         */
        readonly width: number;

        /**
         * root高度
         */
        readonly height: number;

        /**
         * 游戏窗口分辨率相对屏幕分辨率的缩放系数
         */
        readonly scale: number;

        /**
        * 是否启用高清渲染
        * 启用高清渲染后，文本、矢量图形和3D模型将以屏幕实际分辨率大小进行渲染，在高清屏上获得清晰的显示
        * 开启后可能在低端机型上导致性能问题，需要进行一定的适配
        */
        setHighDPI(enable: boolean): any;
	}

    /**
    * 屏幕适配模式
    */
    const enum ScreenAdaptMode {
        /**
        * 根据启动配置里设置的宽高参数以及当前屏幕的宽高比例调整root大小，并将root拉伸到屏幕大小
        */
        ShowAll = 0,
        /**
        * 固定root的大小，并将root拉伸到屏幕大小
        */
        Fixed = 1,
        /**
        * 固定root的大小。且不进行拉伸
        */
        FixedNoScale = 2,
        /**
        * 固定root的宽度，根据启动配置里高度范围以及当前屏幕的宽高比例调整root高度，并将root拉伸到屏幕大小
        */
        FixedWidth = 3,
        /**
        * 固定root的高度，根据启动配置里高度范围以及当前屏幕的宽高比例调整root宽度，并将root拉伸到屏幕大小
        */
        FixedHeight = 4,
        /**
        * 将root调整为屏幕大小
        */
        ScreenSize = 5,
        /**
        * 自定义适配策略，需要在启动配置里配置onScreenAdapt
        */
        Custom = 6
    }

    /**
    * 游戏窗口对齐模式
    */
    const enum ScreenAlignMode {
        LeftTop = 0,
        LeftCenter = 1,
        LeftBottom = 2,
        CenterTop = 4,
        AllCenter = 5,
        CenterBottom = 6,
        RightTop = 8,
        RightCenter = 9,
        RightBottom = 10
    }
}

/**
 * @module GUI
*/
declare namespace ez.ui {

    /**
     * 触摸事件处理基类
     * 控件的触摸事件处理使用mixins方式混入控件类中，使一个触摸事件处理行为可以复用到多个控件类中。例如，
     * 我们有多种Button控件类，都混入同一个Button事件处理类，使得这些Button控件类都具备Button的行为
     * @category EventHandler
     */
    abstract class EventHandlerBase implements TouchHandler {

        disposed: boolean;

        class: UIClassData;

        id: string;

        left: Dimension;

        top: Dimension;

        right: Dimension;

        bottom: Dimension;

        x: Dimension;

        y: Dimension;

        width: Dimension;

        height: Dimension;

        opacity: number;

        visible: boolean;

        scaleX: number;

        scaleY: number;

        scale: number;

        angle: number;

        anchorX: number;

        anchorY: number;

        touchable: boolean;

        zIndex: number;

        state: string;

        culling: boolean;

        drawCache: boolean;

        clip: boolean;

        ownerBuffer: boolean;

        batchMode: boolean;

        textStyle: string;

        parent: Container;

        style: string;

        protected _bound: Rect;

        protected _parent: Container;

        measureBound: (w: number, h: number, force?: boolean) => void;

        findControls: (x: number, y: number) => Control[];

        fireEvent: (event: string, arg?: any, bubble?: boolean) => void;

        abstract onTouchBegin(d: TouchData): any;

        abstract onTouchMove(e: TouchData): any;

        abstract onTouchEnd(e: TouchData): any;

        abstract onTouchCancel(id: number): any;
	}

    /**
    * 绑定标签按钮元素的触摸事件
    * @param uiClass 控件类
    * @category EventHandler
    */
    function addTabBtnEventHandler(uiClass: ControlClass): void;

    /**
    * 绑定按钮元素的触摸事件
    *  控件需要有normal,down两个状态
    * @category EventHandler
    * @param uiClass 控件类
    * @param btnSalce 设置按钮按下时缩小的比例
    * @param snd 设置点击按钮时的音效
    */
    function addButtonEventHandler(uiClass: ControlClass, btnScale?: number, snd?: string): void;

    /**
    *  给控件绑定确认框的事件处理
    *  控件需要有uncheck,check两个状态
    * @category EventHandler
    * @param uiClass: 控件类
    * @param btnSalce: 设置按钮按下时缩小的比例
    * @param snd: 设置点击按钮时的音效
    */
    function addCheckboxEventHandler(uiClass: ControlClass, btnScale?: number, snd?: string): void;
}

/**
 * @module Visual
*/
declare namespace ez {

    /**
     * 图像的点击判断模式
     */
    const enum HitTestMode {
        BoundingBox = 0,
        Pixel = 1
    }

    /**
     * 图像对象
     */
    class ImageSprite extends Sprite {

        width: number;

        height: number;

        /**
        * 图像资源，set时可以是资源名,Texture,ImageRes，get时获得Texture或ImageRes
        */
        src: string | Texture | ImageRes;

        /**
        * 设置重复填充模式，可选模式："repeat-x","repeat-y", "repeat"
        */
        pattern: "repeat-x" | "repeat-y" | "repeat";

        /**
        * 设置图片剪切，以原图大小为基础剪切部分图片显示，默认为null
        */
        clipRect: Rect;

        protected _dispose(): void;

        static Type: string;

        getType(): string;

        protected _draw(rc: IRenderContext, opacity: number): void;

        constructor(stage: Stage, id?: string);

        /**
         * 判断该点是否在对象上
         *	当图像资源有hitmask时会以图像的alpha通道进行像素级判定，hitmask需要通过工具预先生成。没有hitmask则以图像矩形区域进行判定
         * @param x
         * @param y
         */
        hitTest(x: number, y: number): boolean;
	}
}

/**
 * @module Text
*/
declare namespace ez {

    /**
    * 载入字体文件
    * @name 字体名
    * @url 字体文件地址(html模式下需要准备.eot .woff .ttf三种格式的字体文件，weixin平台则只需要.ttf)
    */
    function loadFont(name: string, url: string, fontweight?: string, fontstyle?: string): void;

    /**
    * 文本测量行
    */
    interface TextMetricLine {

        width: number;

        text: string;

        newLine?: boolean;
	}

    /**
    * 富文本测量行
    */
    interface RichTextMetricLine extends TextMetricLine {

        x: number;

        color: string;

        font: string;

        underline?: boolean;

        strike?: boolean;

        href?: string;

        stroke?: {
            width: number;
            color: string;
        };

        cache?: any;
	}

    /**
    * 文本布局测量对象
    */
    class TextMetric {

        readonly font: string;

        /**
        * 文本行数据
        */
        lines: TextMetricLine[];

        /**
        * 富文本行数据
        */
        richLines: RichTextMetricLine[][];

        /**
        * 最大文本宽度
        */
        maxWidth: number;

        /**
        * 文本行高
        */
        lineHeight: number;

        protected _font: string;

        static EndBreak: {};

        static _ctx: CanvasRenderingContext2D;

        static DefaultFont: string;

        static isFullWidth(ch: number): boolean;

        static GetNextWordBreak(str: string, index: number): number;

        static textWidthLowerBound(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): number;

        static measureLine(ctx: CanvasRenderingContext2D, text: string, x: number, maxWidth: number, wordBreak: boolean, single: boolean): Array<TextMetricLine>;

        /**
        * 富文本测量，支持的标签:
        *	<color=#颜色值></color>
        *	<font=字体></font>
        *	<stroke=描边宽度 #描边颜色></stroke>
        *	<u>下划线</u>
        *	<s>删除线</s>
        *	<a href=链接>超链接</a>
        * @example <color=#ffffff>t1 <font=32px>t2<stroke=2 #00>t3</color>
        */
        measureRichText(text: any, width: number, height: number, format: TextFormat, color: string): void;

        /**
        * 文本测量
        * @param text 文本
        * @param width 文本框宽度
        * @param height 文本框高度
        * @param format 格式控制
        */
        measureText(text: any, width: number, height: number, format: TextFormat): void;

        static getFontHeight(font: string): number;

        constructor(font: string);
	}
}

/**
 * @module Visual
*/
declare namespace ez {

    function scanFontText(): void;

    function outputFontText(): void;

    /**
     * 文本对象
     */
    class LabelSprite extends Sprite {

        /**
         * 文本测量结果
         */
        readonly textMetric: TextMetric;

        /**
         * 文本框宽度
         */
        width: number;

        /**
         * 文本框高度
         */
        height: number;

        /**
        * 渐变填充
        */
        gradient: GradientFill;

        /**
         * 字体
         */
        font: string;

        /**
         * 文本格式
         */
        format: TextFormat;

        /**
         * 文本内容
         */
        text: string;

        /**
         * 描边颜色
         */
        strokeColor: string;

        /**
         * 描边宽度
         */
        strokeWidth: number;

        /**
         * 文本颜色
         */
        color: string;

        /**
         * 行高
         */
        lineHeight: number;

        /**
         * 文本对齐模式
         */
        align: AlignMode;

        /**
         * 空白边距
         */
        margin: Number4;

        /**
         * 背景底色
         */
        bkColor: string;

        protected _font: string;

        protected _format: TextFormat;

        protected _bkColor: string;

        protected _text: string;

        protected _strokeColor: string;

        protected _gradient: GradientFill;

        protected _strokeWidth: number;

        protected _lineHeight: number;

        protected _textMetric: TextMetric;

        protected _margin: Number4;

        protected _align: AlignMode;

        static Type: string;

        getType(): string;

        protected _prepare(bound: Rect, transfrom: Handle, transChanged: boolean): void;

        dispose(): void;

        constructor(parent: Stage, id?: string);

        protected _draw(rc: IRenderContext, opacity: number): boolean;
	}
}

/**
 * @module Visual
*/
declare namespace ez {

    /**
     * 矩形填充对象
     */
    class RectFillSprite extends Sprite {

        /**
         * 设置渐变填充
         */
        gradient: string | GradientFill;

        static Type: string;

        protected _draw(rc: IRenderContext, opacity: number): void;

        getType(): string;

        constructor(stage: Stage, id?: string);
	}
}

/**
 * 资源管理模块
 * @module Resource
*/
declare namespace ez {

    /**
    * 下载资源类型
    */
    const enum DataType {
        Text = 0,
        Binary = 1,
        Image = 2,
        Sound = 3
    }

    /**
    * 资源类型
    */
    const enum ResType {
        text = 1,
        json = 2,
        csv = 3,
        image = 4,
        subimage = 5,
        binary = 6,
        sound = 7,
        gltf = 8,
        model = 9,
        empty = 10,
        texture = 11,
        spine = 12,
        ezm = 13
    }

    /**
    * 资源加载状态
    */
    const enum ResState {
        Unload = 1,
        Loading = 2,
        Ready = 3,
        Error = 4
    }

    /**
    * 资源描述信息
    */
    interface ResourceData {

        name: string;

        type: string;

        url: string;

        width?: number;

        height?: number;

        region?: string;

        margin?: string;

        parent?: string;

        s9?: string;

        format?: TextureFormat;

        /**
        * 图像是否转置(90°旋转存放)
        */
        transpose?: boolean;

        /**
        * 图像点击判定mask
        */
        hitMask?: string;

        /**
        * 压缩纹理类型
        */
        types?: TextureFormat[];

        cubemap?: string[];
	}

    /**
    * 资源组
    */
    interface GroupData {

        name: string;

        keys: string;
	}

    /**
    * 资源包描述
    */
    interface PackageData {

        resources: ResourceData[];

        groups: GroupData[];
	}

    /**
    * 资源对象接口
    */
    interface Res<T> {

        /**
        * 名字hash后的id值
        */
        id: string;

        /**
        * 资源名（资源名默认是资源目录下的相对路径加文件名，不带扩展名）,发布版不带资源名称信息
        */
        name: string;

        /**
        * 载入状态
        */
        state: ResState;

        /**
        * 资源附加描述信息
        */
        args: any;

        /**
        * 资源地址
        */
        url: string;

        /**
        * 资源类型
        */
        type: ResType;

        width?: number;

        height?: number;

        bin?: ArrayBuffer;

        parentImage?: ImageRes;

        age?: number;

        cors?: boolean;

        hitMask?: {
            data: number[][];
            level: number;
        };

        /**
        * 获取资源数据
        */
        getData(): T;

        /**
        * await异步加载资源
        * @param priority: 加载优先级，高优先级的将被提前加载
        */
        loadAsync(priority?: number): Promise<T>;

        /**
        * 加载资源
        * @param onLoad: 回调函数
        * @param priority: 加载优先级，高优先级的将被提前加载
        */
        load(onLoad?: (success: boolean) => void, thisObj?: any, priority?: number): any;

        /**
        * 释放资源
        */
        release(): any;
	}

    /**
    * 图像资源对象接口
    */
    type ImageRes = Res<Texture>;

    /**
    * 资源代理url地址（用于跨域资源的获取）
    */
    var getProxyUrl: Function;

    /**
     * 检查浏览器对图像格式的支持
     * @description	在载入资源前需要先检查浏览器支持的图像格式
     * @return promise
     */
    function detectImageExt(): Promise<void>;

    /**
    * HTTP资源下载接口
    */
    class HTTP {

        /**
        * 最大资源并发载入数量
        */
        static maxLoadingTask: number;

        static getSound(url: string, onFinish: (success: boolean, data?: any) => void, thisObj?: any): void;

        static getImage(url: string, cors: boolean, onFinish: (success: boolean, data?: any) => void, thisObj?: any): void;

        /**
        * await方式通过http请求下载文件
        * @param url: 文件地址
        * @param type: 文件类型
        * @param cors: 是否需要跨域加载，如果为跨域则使用proxy方式获取，需要配置egl.getProxy函数
        * @param priority: 下载优先级，优先级大的在队列里提前加载
        */
        static downloadAsync(url: string, type: DataType, cors: boolean, priority: number): Promise<any>;

        /**
        * 通过http请求下载文件
        * @param url: 文件地址
        * @param type: 文件类型
        * @param cors: 是否需要跨域加载，如果跨域则使用proxy方式获取，需要配置{@link egl.getProxy}函数
        * @param priority: 下载优先级，优先级大的在队列里提前加载
        * @param onFinish: 回调函数
        */
        static download(url: string, type: DataType, cors: boolean, priority: number, onFinish: (success: boolean, data: any) => void, thisObj?: any): void;
	}

    /**
    * 加载资源包
    * @param packData: 资源包数据
    * @param root: 资源根路径
    */
    function loadPackage(data: PackageData, resRoot: string): void;

    /**
    * 加载外部JSON文件资源包
    * @param pkgUrl: 文件路径
    * @param root: 资源根路径
    * @param onComplete: 回调函数
    */
    function loadJSONPackage(pkgUrl: string, root: string, onComplete: (success: boolean) => void, thisObj?: any): void;

    /**
    * 从外部加载JSON格式资源包
    * @param pkgUrl 文件路径
    * @param root 资源根路径
    */
    function loadJSONPackageAsync(pkgUrl: string, root: string): Promise<void>;

    /**
    * 设置本地资源加载列表（APP打包用，当资源存在本地时优先从本地加载）
    * @param root 资源本地根路径
    * @param resList 资源文件名列表
    */
    function setLocalResList(root: string, resList: string[]): void;

    /**
    * 加载发布后的资源描述
    *	当使用publish工具发布后，资源包将被转化成混淆后的字符串嵌入到代码中(也可从外部文件加载)
    * @param resPak 混淆后的资源包描述
    * @param root 资源根路径
    * @param groups 资源组
    */
    function loadResPackage(resPak: string, root: string, groups: any): void;

    /** 添加一个资源组 */
    function addGroup(grpName: string, resources: string[]): void;

    /**
     * 检查是否存在这个资源
     * @param name 资源名
     * @returns true if exist
     */
    function hasRes(name: string): boolean;

    /**
    * 获取外链资源，外链资源是以http://或https://开头的存放于其他网站的资源文件，比如用户头像
    */
    function getExternalRes<T>(url: string, resType: ResType, args?: any): Res<T>;

    /**
    * 获取资源对象
    * @param name 资源名 资源名为资源文件root中的相对路径，不带文件扩展名，使用/分隔目录，不区分大小写
    * 资源名前缀为ext: http: https:的则当作外部资源加载
    * 资源前缀为R:的则直接使用hash后的资源id加载
    * @param type 如果为外部资源则需要指定type，若不指定则当image来加载
    * @returns 资源对象
    */
    function getRes<T>(name: string, type?: ResType): Res<T>;

    /**
    * 获取全部资源对象
    */
    function allRes(): Res<{}>[];

    /**
     * 遍历资源组内的资源
     */
    function groupForEach(group: string | string[], func: (res: Res<{}>) => void): void;

    /**
    * 预加载资源
    * @param resOrGroups 可以是字符串或数组，可以是资源名或资源组名
    * @param onProgress 载入进度回调函数
    */
    function loadGroup(resOrGroups: string | string[], onProgress?: (progress: number, total: number) => void, thisObj?: any): Promise<{}>;
}

/**
 * @module Visual
*/
declare namespace ez {

    /**
    * 动画序列帧数据定义
    */
    interface SeqFrameDesc {

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
    class SeqFrameSprite extends Sprite {

        width: number;

        height: number;

        /**
         * 序列帧数据
         *	set frames可以为序列帧(string,Texture)数组或者SeqFrameDesc描述，get为Texture数组
         */
        frames: Texture[] | string[] | SeqFrameDesc;

        /**
         * 加载后自动播放
         */
        autoPlay: boolean;

        /**
         * 当前帧索引
         */
        readonly frameIndex: number;

        position: number;

        /**
         * 动画长度，单位为毫秒
         */
        readonly length: number;

        fps: number;

        /**
         * 播放状态
         */
        readonly state: MediaState;

        /**
        * 播放速度
        */
        set speed(v: number);

        /**
         * 设置每帧帧的持续时间
         *	可用于非固定帧率的动画
         */
        set framesDuration(frames: number[]);

        /**
         * 将SeqFrameDesc转换成图片名字数组
         * @param data
         * @returns frames
         */
        static toFrames(data: SeqFrameDesc): string[];

        static Type: string;

        getType(): string;

        protected _draw(rc: IRenderContext, opacity: number): boolean;

        _dispose(): void;

        constructor(stage: Stage, name?: string);

        /**
         * 是否循环播放
         */
        loop: boolean;

        /**
         * 播放完成事件通知
         */
        onStop: Function;

        /**
        * 是否在播放完成后自动从stage中移除
        */
        autoRemove: boolean;

        /**
         * 开始播放
         */
        play(): void;

        /**
         * 暂停
         */
        pause(): void;

        /**
         * 停止
         */
        stop(): void;

        /**
         * 设置指定帧的持续时间
         *	可用于非固定帧率的动画
         */
        setFrameDuration(i: number, time: number): void;
	}
}

/**
 * @module Visual
*/
declare namespace ez {

    /** @ignore */
    interface IPreRender {

        preRender(profile?: WGLPerFrameProfiler | CanvasPerFrameProfiler): any;
	}

    /**
     * 舞台对象接口
     * @description 舞台是sprite的容器，舞台里可以嵌套子舞台，舞台中的每个sprite继承舞台自身的变换矩阵和透明度设置
     */
    interface Stage {

        /** @inernal */
        render(target: RenderTexture, profile?: any): void;

        /** @inernal */
        makeDirty(needSort: boolean): void;

        /** @inernal */
        addChild(item: any, id: string): any;

        /** @inernal */
        needPreRender(node: IPreRender): any;

        /** @inernal */
        _remove(item: Sprite): any;

        culling: boolean;

        globalTransform: Matrix;

        /**
        * 子元素数量
        */
        readonly count: number;

        /**
        * 舞台内子元素是否有发生过变化
        */
        readonly dirty: boolean;

        /**
        * 通过索引获取子元素
        */
        getItem(index: any): Sprite;

        /**
        * 移除一个子元素
        */
        remove(sprite: Sprite): void;

        /**
        * 将子元素的绘制顺序调整到相同zIndex值的最上面
        */
        bringToTop(sprite: Sprite): void;

        /**
        * 将子元素的绘制顺序调整到相同zIndex值的最下面
        */
        bringToBottom(sprite: Sprite): void;

        /**
        * 根据sprite对象数据载入一个舞台
        */
        load(items: SpriteData[]): Sprite[];

        /**
        * 根据id查找子元素，没有找到的话，会继续递归查找子舞台
        */
        find(id: string): Sprite;

        /**
        * 清除所有子元素
        */
        clear(): void;

        hitFind(x: number, y: number, allHitTargets?: boolean): Sprite | Sprite[];
	}

    /**
     * 子舞台对象，通过添加子舞台实现舞台的嵌套
     */
    class SubStageSprite extends Sprite implements Stage, IPreRender {

        /**
        * 是否剪切舞台内超出舞台边界的对象，默认为不剪切
        */
        clip: boolean;

        /**
        * 舞台宽度
        */
        width: number;

        /**
        * 舞台高度
        */
        height: number;

        /**
        * 舞台是否自带离屏缓冲区，默认为false
        */
        ownerBuffer: boolean;

        protected _rtBuffer: RenderTexture;

        protected _bound: Rect;

        static Type: string;

        _dispose(): void;

        setDirty(needSort?: boolean): void;

        getType(): string;

        constructor(parent: Stage, id?: string);

        /** @inernal */
        preRender(profile?: WGLPerFrameProfiler | CanvasPerFrameProfiler): void;

        protected _prepare(bound: Rect, transfrom: Handle, transChanged: boolean): void;

        protected _draw(rc: IRenderContext, opacity: number): boolean;

        protected destroyBuffer(): void;

        /**
        * 是否在绘制时预先剔除超出舞台边界的对象，默认为false
        */
        culling: boolean;

        /**
        * 是否缓存绘制命令（WebGL下有效），默认为false
        * @description stage设置绘制缓存后，当stage及其子元素相对与上一帧没有任何变化时，将直接向WebGL提交缓存的绘制命令，从而节省所有的中间计算过程。
        * 对不经常变化的stage设置缓存后可以有效提高渲染效率，对经常变化的stage设置缓存会造成不必要的内存浪费
        */
        drawCache: boolean;

        /**
        * 是否需要跨舞台进行自动合批排序，默认为false
        * @description 设置跨舞台自动合批后，该舞台下包括子元素的所有对象绘制将根据最小上下文切换原则重新排序渲染，这可能导致渲染顺序错乱，可以通过设置zIndex来强制决定渲染顺序修正顺序错误
        */
        batchMode: boolean;

        /**
        * 将stage拷贝到一个临时的canvas上
        * @description ownerBuffer必须设置为true
        */
        saveToCanvas(): HTMLCanvasElement;

        makeDirty(needSort: boolean): void;

        /**@inernal */
        addChild: (item: any, id: string) => void;

        /**@inernal */
        needPreRender: (node: IPreRender) => void;

        /**@inernal */
        render: (target: RenderTexture, profile?: any) => void;

        /**@inernal */
        _remove: (item: Sprite) => void;

        readonly count: number;

        readonly dirty: boolean;

        getItem: (index: any) => Sprite;

        remove: (sprite: Sprite) => void;

        bringToTop: (sprite: Sprite) => void;

        bringToBottom: (sprite: Sprite) => void;

        load: (items: SpriteData[]) => Sprite[];

        find: (id: string) => Sprite;

        clear: () => void;

        hitFind: (x: number, y: number, allHitTargets?: boolean) => Sprite | Sprite[];
	}

    function createStage(): Stage;
}

/**
 * WebGL constant defination
 * @ignore
 */
declare const enum GL {
    DEPTH_BUFFER_BIT = 256,
    STENCIL_BUFFER_BIT = 1024,
    COLOR_BUFFER_BIT = 16384,
    FALSE = 0,
    TRUE = 1,
    POINTS = 0,
    LINES = 1,
    LINE_LOOP = 2,
    LINE_STRIP = 3,
    TRIANGLES = 4,
    TRIANGLE_STRIP = 5,
    TRIANGLE_FAN = 6,
    ZERO = 0,
    ONE = 1,
    SRC_COLOR = 768,
    ONE_MINUS_SRC_COLOR = 769,
    SRC_ALPHA = 770,
    ONE_MINUS_SRC_ALPHA = 771,
    DST_ALPHA = 772,
    ONE_MINUS_DST_ALPHA = 773,
    DST_COLOR = 774,
    ONE_MINUS_DST_COLOR = 775,
    SRC_ALPHA_SATURATE = 776,
    FUNC_ADD = 32774,
    BLEND_EQUATION = 32777,
    BLEND_EQUATION_RGB = 32777,
    BLEND_EQUATION_ALPHA = 34877,
    FUNC_SUBTRACT = 32778,
    FUNC_REVERSE_SUBTRACT = 32779,
    BLEND_DST_RGB = 32968,
    BLEND_SRC_RGB = 32969,
    BLEND_DST_ALPHA = 32970,
    BLEND_SRC_ALPHA = 32971,
    CONSTANT_COLOR = 32769,
    ONE_MINUS_CONSTANT_COLOR = 32770,
    CONSTANT_ALPHA = 32771,
    ONE_MINUS_CONSTANT_ALPHA = 32772,
    BLEND_COLOR = 32773,
    ARRAY_BUFFER = 34962,
    ELEMENT_ARRAY_BUFFER = 34963,
    ARRAY_BUFFER_BINDING = 34964,
    ELEMENT_ARRAY_BUFFER_BINDING = 34965,
    STREAM_DRAW = 35040,
    STATIC_DRAW = 35044,
    DYNAMIC_DRAW = 35048,
    BUFFER_SIZE = 34660,
    BUFFER_USAGE = 34661,
    CURRENT_VERTEX_ATTRIB = 34342,
    FRONT = 1028,
    BACK = 1029,
    FRONT_AND_BACK = 1032,
    TEXTURE_2D = 3553,
    CULL_FACE = 2884,
    BLEND = 3042,
    DITHER = 3024,
    STENCIL_TEST = 2960,
    DEPTH_TEST = 2929,
    SCISSOR_TEST = 3089,
    POLYGON_OFFSET_FILL = 32823,
    SAMPLE_ALPHA_TO_COVERAGE = 32926,
    SAMPLE_COVERAGE = 32928,
    NO_ERROR = 0,
    INVALID_ENUM = 1280,
    INVALID_VALUE = 1281,
    INVALID_OPERATION = 1282,
    OUT_OF_MEMORY = 1285,
    CW = 2304,
    CCW = 2305,
    LINE_WIDTH = 2849,
    ALIASED_POINT_SIZE_RANGE = 33901,
    ALIASED_LINE_WIDTH_RANGE = 33902,
    CULL_FACE_MODE = 2885,
    FRONT_FACE = 2886,
    DEPTH_RANGE = 2928,
    DEPTH_WRITEMASK = 2930,
    DEPTH_CLEAR_VALUE = 2931,
    DEPTH_FUNC = 2932,
    STENCIL_CLEAR_VALUE = 2961,
    STENCIL_FUNC = 2962,
    STENCIL_FAIL = 2964,
    STENCIL_PASS_DEPTH_FAIL = 2965,
    STENCIL_PASS_DEPTH_PASS = 2966,
    STENCIL_REF = 2967,
    STENCIL_VALUE_MASK = 2963,
    STENCIL_WRITEMASK = 2968,
    STENCIL_BACK_FUNC = 34816,
    STENCIL_BACK_FAIL = 34817,
    STENCIL_BACK_PASS_DEPTH_FAIL = 34818,
    STENCIL_BACK_PASS_DEPTH_PASS = 34819,
    STENCIL_BACK_REF = 36003,
    STENCIL_BACK_VALUE_MASK = 36004,
    STENCIL_BACK_WRITEMASK = 36005,
    VIEWPORT = 2978,
    SCISSOR_BOX = 3088,
    COLOR_CLEAR_VALUE = 3106,
    COLOR_WRITEMASK = 3107,
    UNPACK_ALIGNMENT = 3317,
    PACK_ALIGNMENT = 3333,
    MAX_TEXTURE_SIZE = 3379,
    MAX_VIEWPORT_DIMS = 3386,
    SUBPIXEL_BITS = 3408,
    RED_BITS = 3410,
    GREEN_BITS = 3411,
    BLUE_BITS = 3412,
    ALPHA_BITS = 3413,
    DEPTH_BITS = 3414,
    STENCIL_BITS = 3415,
    POLYGON_OFFSET_UNITS = 10752,
    POLYGON_OFFSET_FACTOR = 32824,
    TEXTURE_BINDING_2D = 32873,
    SAMPLE_BUFFERS = 32936,
    SAMPLES = 32937,
    SAMPLE_COVERAGE_VALUE = 32938,
    SAMPLE_COVERAGE_INVERT = 32939,
    NUM_COMPRESSED_TEXTURE_FORMATS = 34466,
    COMPRESSED_TEXTURE_FORMATS = 34467,
    DONT_CARE = 4352,
    FASTEST = 4353,
    NICEST = 4354,
    GENERATE_MIPMAP_HINT = 33170,
    BYTE = 5120,
    UNSIGNED_BYTE = 5121,
    SHORT = 5122,
    UNSIGNED_SHORT = 5123,
    INT = 5124,
    UNSIGNED_INT = 5125,
    FLOAT = 5126,
    FIXED = 5132,
    DEPTH_COMPONENT = 6402,
    ALPHA = 6406,
    RGB = 6407,
    RGBA = 6408,
    LUMINANCE = 6409,
    LUMINANCE_ALPHA = 6410,
    UNSIGNED_SHORT_4_4_4_4 = 32819,
    UNSIGNED_SHORT_5_5_5_1 = 32820,
    UNSIGNED_SHORT_5_6_5 = 33635,
    FRAGMENT_SHADER = 35632,
    VERTEX_SHADER = 35633,
    MAX_VERTEX_ATTRIBS = 34921,
    MAX_VERTEX_UNIFORM_VECTORS = 36347,
    MAX_VARYING_VECTORS = 36348,
    MAX_COMBINED_TEXTURE_IMAGE_UNITS = 35661,
    MAX_VERTEX_TEXTURE_IMAGE_UNITS = 35660,
    MAX_TEXTURE_IMAGE_UNITS = 34930,
    MAX_FRAGMENT_UNIFORM_VECTORS = 36349,
    SHADER_TYPE = 35663,
    DELETE_STATUS = 35712,
    LINK_STATUS = 35714,
    VALIDATE_STATUS = 35715,
    ATTACHED_SHADERS = 35717,
    ACTIVE_UNIFORMS = 35718,
    ACTIVE_UNIFORM_MAX_LENGTH = 35719,
    ACTIVE_ATTRIBUTES = 35721,
    ACTIVE_ATTRIBUTE_MAX_LENGTH = 35722,
    SHADING_LANGUAGE_VERSION = 35724,
    CURRENT_PROGRAM = 35725,
    NEVER = 512,
    LESS = 513,
    EQUAL = 514,
    LEQUAL = 515,
    GREATER = 516,
    NOTEQUAL = 517,
    GEQUAL = 518,
    ALWAYS = 519,
    KEEP = 7680,
    REPLACE = 7681,
    INCR = 7682,
    DECR = 7683,
    INVERT = 5386,
    INCR_WRAP = 34055,
    DECR_WRAP = 34056,
    VENDOR = 7936,
    RENDERER = 7937,
    VERSION = 7938,
    EXTENSIONS = 7939,
    NEAREST = 9728,
    LINEAR = 9729,
    NEAREST_MIPMAP_NEAREST = 9984,
    LINEAR_MIPMAP_NEAREST = 9985,
    NEAREST_MIPMAP_LINEAR = 9986,
    LINEAR_MIPMAP_LINEAR = 9987,
    TEXTURE_MAG_FILTER = 10240,
    TEXTURE_MIN_FILTER = 10241,
    TEXTURE_WRAP_S = 10242,
    TEXTURE_WRAP_T = 10243,
    TEXTURE = 5890,
    TEXTURE_CUBE_MAP = 34067,
    TEXTURE_BINDING_CUBE_MAP = 34068,
    TEXTURE_CUBE_MAP_POSITIVE_X = 34069,
    TEXTURE_CUBE_MAP_NEGATIVE_X = 34070,
    TEXTURE_CUBE_MAP_POSITIVE_Y = 34071,
    TEXTURE_CUBE_MAP_NEGATIVE_Y = 34072,
    TEXTURE_CUBE_MAP_POSITIVE_Z = 34073,
    TEXTURE_CUBE_MAP_NEGATIVE_Z = 34074,
    MAX_CUBE_MAP_TEXTURE_SIZE = 34076,
    TEXTURE0 = 33984,
    TEXTURE1 = 33985,
    TEXTURE2 = 33986,
    TEXTURE3 = 33987,
    TEXTURE4 = 33988,
    TEXTURE5 = 33989,
    TEXTURE6 = 33990,
    TEXTURE7 = 33991,
    TEXTURE8 = 33992,
    TEXTURE9 = 33993,
    TEXTURE10 = 33994,
    TEXTURE11 = 33995,
    TEXTURE12 = 33996,
    TEXTURE13 = 33997,
    TEXTURE14 = 33998,
    TEXTURE15 = 33999,
    TEXTURE16 = 34000,
    TEXTURE17 = 34001,
    TEXTURE18 = 34002,
    TEXTURE19 = 34003,
    TEXTURE20 = 34004,
    TEXTURE21 = 34005,
    TEXTURE22 = 34006,
    TEXTURE23 = 34007,
    TEXTURE24 = 34008,
    TEXTURE25 = 34009,
    TEXTURE26 = 34010,
    TEXTURE27 = 34011,
    TEXTURE28 = 34012,
    TEXTURE29 = 34013,
    TEXTURE30 = 34014,
    TEXTURE31 = 34015,
    ACTIVE_TEXTURE = 34016,
    REPEAT = 10497,
    CLAMP_TO_EDGE = 33071,
    MIRRORED_REPEAT = 33648,
    FLOAT_VEC2 = 35664,
    FLOAT_VEC3 = 35665,
    FLOAT_VEC4 = 35666,
    INT_VEC2 = 35667,
    INT_VEC3 = 35668,
    INT_VEC4 = 35669,
    BOOL = 35670,
    BOOL_VEC2 = 35671,
    BOOL_VEC3 = 35672,
    BOOL_VEC4 = 35673,
    FLOAT_MAT2 = 35674,
    FLOAT_MAT3 = 35675,
    FLOAT_MAT4 = 35676,
    SAMPLER_2D = 35678,
    SAMPLER_CUBE = 35680,
    VERTEX_ATTRIB_ARRAY_ENABLED = 34338,
    VERTEX_ATTRIB_ARRAY_SIZE = 34339,
    VERTEX_ATTRIB_ARRAY_STRIDE = 34340,
    VERTEX_ATTRIB_ARRAY_TYPE = 34341,
    VERTEX_ATTRIB_ARRAY_NORMALIZED = 34922,
    VERTEX_ATTRIB_ARRAY_POINTER = 34373,
    VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = 34975,
    IMPLEMENTATION_COLOR_READ_TYPE = 35738,
    IMPLEMENTATION_COLOR_READ_FORMAT = 35739,
    COMPILE_STATUS = 35713,
    INFO_LOG_LENGTH = 35716,
    SHADER_SOURCE_LENGTH = 35720,
    SHADER_COMPILER = 36346,
    SHADER_BINARY_FORMATS = 36344,
    NUM_SHADER_BINARY_FORMATS = 36345,
    LOW_FLOAT = 36336,
    MEDIUM_FLOAT = 36337,
    HIGH_FLOAT = 36338,
    LOW_INT = 36339,
    MEDIUM_INT = 36340,
    HIGH_INT = 36341,
    FRAMEBUFFER = 36160,
    RENDERBUFFER = 36161,
    RGBA4 = 32854,
    RGB5_A1 = 32855,
    RGB565 = 36194,
    DEPTH_COMPONENT16 = 33189,
    STENCIL_INDEX8 = 36168,
    RENDERBUFFER_WIDTH = 36162,
    RENDERBUFFER_HEIGHT = 36163,
    RENDERBUFFER_INTERNAL_FORMAT = 36164,
    RENDERBUFFER_RED_SIZE = 36176,
    RENDERBUFFER_GREEN_SIZE = 36177,
    RENDERBUFFER_BLUE_SIZE = 36178,
    RENDERBUFFER_ALPHA_SIZE = 36179,
    RENDERBUFFER_DEPTH_SIZE = 36180,
    RENDERBUFFER_STENCIL_SIZE = 36181,
    FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE = 36048,
    FRAMEBUFFER_ATTACHMENT_OBJECT_NAME = 36049,
    FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL = 36050,
    FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = 36051,
    COLOR_ATTACHMENT0 = 36064,
    DEPTH_ATTACHMENT = 36096,
    STENCIL_ATTACHMENT = 36128,
    NONE = 0,
    FRAMEBUFFER_COMPLETE = 36053,
    FRAMEBUFFER_INCOMPLETE_ATTACHMENT = 36054,
    FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 36055,
    FRAMEBUFFER_INCOMPLETE_DIMENSIONS = 36057,
    FRAMEBUFFER_UNSUPPORTED = 36061,
    FRAMEBUFFER_BINDING = 36006,
    RENDERBUFFER_BINDING = 36007,
    MAX_RENDERBUFFER_SIZE = 34024,
    INVALID_FRAMEBUFFER_OPERATION = 1286,
    DEPTH_STENCIL = 34041,
    DEPTH_STENCIL_ATTACHMENT = 33306,
    UNPACK_PREMULTIPLY_ALPHA_WEBGL = 37441
}

/**
 * @module Texture
*/
declare namespace ez {

    /**
     * 纹理格式
     */
    const enum TextureFormat {
        RGBA = 0,
        RGB565 = 1,
        RGBA4 = 2,
        L8 = 3,
        L8A8 = 4,
        ETC1 = 5,
        PVR = 6,
        ASTC = 7,
        DXT = 8
    }

    /**
     * 纹理使用统计
     */
    interface TextureProfile {

        totalMemory: number;

        activeTextueres: {
            name: string;
            size: number;
            width: number;
            height: number;
            age: number;
        }[];

        permanentTextures: {
            name: string;
            size: number;
            width: number;
            height: number;
        }[];
	}

    /** @ignore */
    interface TextureData {

        id: string;

        name: string;

        width: number;

        height: number;

        memSize: number;

        state?: ResState;

        maxAge?: number;

        age?: number;

        invWidth?: number;

        invHeight?: number;

        format?: number;

        tex?: WebGLTexture;

        img?: HTMLImageElement;

        canvas?: HTMLCanvasElement;

        fb?: WebGLFramebuffer;

        load?: Function;

        release?: Function;

        isCube?: boolean;
	}

    /**
     * 纹理及图片对象
     */
    class Texture {

        /**
        * 是否为Cube map
        */
        readonly isCube: boolean;

        /**
        * 资源名
        */
        readonly name: string;

        /**
        * 资源id
        */
        readonly id: string;

        /**
        * 纹理宽度
        */
        readonly width: number;

        /**
        * 纹理高度
        */
        readonly height: number;

        /**
        * 水平缩放
        */
        readonly scaleX: number;

        /**
        * 垂直缩放
        */
        readonly scaleY: number;

        /**
        * 内存占用大小
        */
        readonly memSize: number;

        /**
        * 纹理是否已加载
        */
        readonly ready: boolean;

        /**@ignore */
        readonly invWidth: number;

        /**@ignore */
        readonly invHeight: number;

        /**
         * 获取Image对象
         * 	仅在canvas渲染模式下有效
         */
        readonly image: HTMLImageElement;

        static addTextureAge(): void;

        static errorFallback: TextureData;

        static compressFormat: TextureFormat;

        static TEXTURE_MAX_ANISOTROPY_EXT: number;

        static anisotropicMax: number;

        static CompressTextureType: any;

        /** @inernal */
        static init(wgl: any): void;

        /** @inernal */
        static addTextureData(t: TextureData): void;

        /**
         * 获取纹理使用统计数据 */
        static profile(): TextureProfile;

        /**
         * 释放长期未使用的WGL纹理
         *   在当前加载的纹理中，每帧未被使用的age会加1，被使用的age设为0
         * @param maxAge 超过maxAge的纹理释放
         * ```
         * //设置全局资源管理策略，每秒检测并释放掉60帧内没有被使用过的纹理
         * setInterval(() => egl.Texture.releaseUnusedTexture(60), 1000);
         * ```
         */
        static releaseUnusedTexture(maxAge: number): void;

        protected _data: TextureData;

        protected _width: number;

        protected _height: number;

        /**
        * 空白边距
        */
        margin?: Number4;

        /**
        * 9宫格拉伸
        */
        s9?: Number4;

        /**
        * 子区域
        */
        subRect?: Rect;

        /**
        * 像素格式
        */
        format?: TextureFormat;

        /**
         * 是否在纹理atlas中旋转90°存放
        */
        transpose: boolean;

        /**
        * 是否为空白纹理
        */
        empty: boolean;

        /**
        * 释放资源
        */
        release(): void;

        constructor(data: TextureData, width?: number, height?: number);

        /**
        * 加载纹理到内存
        */
        load(onload?: Function): void;

        /** @ignore */
        bindTexture(idx: number): void;

        /**
         * 创建子图
         * @param rect 子图区域
         * @param w 子图宽度
         * @param h 子图高度
         */
        createSubTexture(rect: Rect, w?: number, h?: number): Texture;

        /**
         * 从image/canvascanvas元素创建Texture
         * @param img 图片元素
         */
        static createFromImage(img: HTMLImageElement | HTMLCanvasElement | ImageData): Texture;

        /** @inernal */
        static createGLTextureFromImage(img: HTMLImageElement | HTMLCanvasElement | ImageData, wrapMode: number, mipmap: boolean): WebGLTexture;

        /** @inernal */
        static createCompressTexture(width: number, height: number, compressFormat: number, wrapMode: number, filterMode: number, mipmaps: ArrayBufferView[]): WebGLTexture;

        /** @inernal */
        static createCubeTextureFromImage(imgs: HTMLImageElement[] | HTMLCanvasElement[] | ImageData[]): WebGLTexture;

        /** @inernal */
        static createCompressCubeTexture(width: number, height: number, compressFormat: number, filterMode: number, cubes: ArrayBufferView[][]): WebGLTexture;

        /** @inernal */
        static createGLTexture(width: number, height: number, format: TextureFormat, wrapMode: number, filterMode: number, mulAlpha: boolean, genMipmap: boolean, pixels: ArrayBufferView): WebGLTexture;
	}

    /**
     * 原生WebGL纹理
     */
    class RawTexture extends Texture {

        /** webGL纹理 */
        readonly glTex: WebGLTexture;

        constructor(data: TextureData, width: number, height: number);

        /**
         *  创建webGL纹理
         */
        static create(id: string, width: number, height: number, pixFormat: number, wrapMode: number, filterMode: number, data: ArrayBufferView): RawTexture;

        /**
         * 释放纹理
         */
        release(): void;
	}

    /**
    * 可渲染纹理
    */
    class RenderTexture extends Texture {

        readonly framebuffer: WebGLFramebuffer;

        /** 获取canvas接口（仅canvas渲染模式下有效） */
        readonly canvas: HTMLCanvasElement;

        constructor(tex: TextureData, width?: number, height?: number);

        dispose(): void;

        scale: number;

        /**
         * 重置纹理尺寸
         */
        resize(w: number, h: number): void;

        /**
         * 将canvas元素包装成可渲染纹理
         * @param canvas
         */
        static createFromCanvas(canvas: HTMLCanvasElement): RenderTexture;

        /**
         * 创建可渲染纹理
         * @param width 宽度
         * @param height 高度
         * @param needDepth 是否需要创建z-buffer
         */
        static create(width: number, height: number, needDepth?: boolean): RenderTexture;
	}
}

/**
 * @module Animation
*/
declare namespace ez {

    class Ease {

        static get(amount: any): (t: number) => number;

        static getPowIn(pow: any): (t: number) => number;

        static getPowOut(pow: any): (t: number) => number;

        static getPowInOut(pow: any): (t: number) => number;

        static sineIn(t: any): number;

        static sineOut(t: any): number;

        static sineInOut(t: any): number;

        static getBackIn(amount: any): (t: number) => number;

        static getBackOut(amount: any): (t: number) => number;

        static getBackInOut(amount: any): (t: number) => number;

        static circIn(t: any): number;

        static circOut(t: any): number;

        static circInOut(t: any): number;

        static bounceIn(t: any): number;

        static bounceOut(t: any): number;

        static bounceInOut(t: any): number;

        static getElasticIn(amplitude: any, period: any): (t: number) => number;

        static getElasticOut(amplitude: any, period: any): (t: number) => number;

        static getElasticInOut(amplitude: any, period: any): (t: number) => number;

        static quadIn: (t: number) => number;

        static quadOut: (t: number) => number;

        static quadInOut: (t: number) => number;

        static cubicIn: (t: number) => number;

        static cubicOut: (t: number) => number;

        static cubicInOut: (t: number) => number;

        static quartIn: (t: number) => number;

        static quartOut: (t: number) => number;

        static quartInOut: (t: number) => number;

        static quintIn: (t: number) => number;

        static quintOut: (t: number) => number;

        static quintInOut: (t: number) => number;

        static elasticIn: (t: number) => number;

        static elasticInOut: (t: number) => number;

        static elasticOut: (t: number) => number;

        static backIn: (t: number) => number;

        static backOut: (t: number) => number;

        static backInOut: (t: number) => number;

        static linear(t: any): any;
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
    class Tween {

        /**
        * 播放状态 */
        readonly state: MediaState;

        static defaultEase: typeof Ease.linear;

        static add(target: Object, steps?: any[]): Tween;

        /**
         * 清除某个对象上的tween动画
         * @param target
         */
        static stopTweens(target: Object): void;

        /** 是否循环播放
         */
        loop: boolean;

        constructor(target: Object, steps?: any[]);

        /**
         * 设置目标属性
         * @param props
         */
        set(props: Object): Tween;

        /**
         * 移动目标属性
         * @param props  { 属性名: [start, end] }
         * @param duration 持续时间
         * @param ease 插值类型
         */
        move(props: Object, duration: number, ease?: (t: number) => number): Tween;

        /**
         * 目标属性从当前值到目标值
         * @param props  { 属性名: end }
         * @param duration 持续时间
         * @param ease 插值类型
         */
        to(props: Object, duration: number, ease?: (t: number) => number): Tween;

        /**
         * 重新设置动画作用的目标对象
         * @param t 目标对象
         */
        target(t: any): Tween;

        /**
         * 等待一段时间
         * @param duration 毫秒数
         */
        wait(duration: number): Tween;

        /**
         * 调用一个事件回调
         * @param func 回调函数
         * @param thisObj
         */
        call(func: Function, thisObj?: any): Tween;

        /**
         * 销毁target
         */
        disposeTarget(): this;

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
        func(duration: number, func: (target: any, t: number) => void, thisObj?: any, ease?: (t: number) => number): Tween;

        /**
         * 连接另一个tween动画到当前动画后面
         * @param tween
         */
        append(tween: Tween): Tween;

        /**
         * 设置tween属性
         * @param args
         * @example
         * ```
         * new egl.Tween(icon).move({angle:[0,360]}, 1000).config({loop:true}).play();
         * ```
         */
        config(args: any): Tween;

        /**
         * 开始播放 */
        play(): Tween;

        /**
         * 返回一个Promise用于等待动画结束 */
        waitForEnd(): Promise<void>;

        /**
         * 停止播放 */
        stop(): void;

        /**
        * 暂停播放 */
        pause(): void;

        /**
         * 前进一段时间
         * @param dt 前进的毫秒数
         */
        advance(dt: number): void;
	}

    interface TrackDesc {

        name?: string;

        target: string;

        steps: any[];

        loop?: boolean;
	}

    class KeyframeAnimation {

        readonly state: MediaState;

        tracks: Tween[];

        isLoop: boolean;

        _promise: any;

        load(stage: Stage, data: TrackDesc[]): void;

        waitForEnd(): Promise<void>;

        play(isLoop?: boolean): void;

        stop(): void;

        dispose(): void;
	}
}

/**
 * @module ezgame
*/
declare namespace ez {

    /**
     * 加载ezm图像格式解码器
     * @param url 解码器url，用于创建worker
     * @param [thread] 解码线程数，默认为2个线程
     */
    function loadEZMDecoder(url: string, thread?: number): any;
}

/**@ignore */
declare type Handle = number;

/**@ignore */
declare type Mat3x4Handle = number;