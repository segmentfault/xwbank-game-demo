var sprite = {
    id: ["string", "对象名字"],
    blendMode: ["BlendMode", "混合模式"],
    visible: ["boolean", "是否显示"],
    zIndex: ["float", "z排序, z值大的显示在上层"],
    x: ["float", "x位置"],
    y: ["float", "y位置"],
    scaleX: ["float", "水平方向缩放"],
    scaleY: ["float", "垂直方向缩放"],
    scale: ["float", "整体缩放"],
    width: ["float", "宽度"],
    height: ["float", "高度"],
    anchorX: ["float", "x轴锚点，取值(0~1)，默认在左上角"],
    anchorY: ["float", "y轴锚点，取值(0~1)，默认在左上角"],
    angle: ["float", "旋转角度(顺时针)，单位为角度"],
    opacity: ["float", "透明度，取值(0~1)"],
    color: ["color", "颜色"],
    mirrorH: ["boolean", "水平镜像"],
    mirrorV: ["boolean", "垂直镜像"],
    skew: ["float", "垂直方向斜切"],
    effect: ["string", "shader特效(仅WebGL模式下支持)，默认为null使用默认效果"],
    effectParams: ["设置shader参数"]
};
var subclass = {
    Image: {
        src: ["resource", "图片资源名"],
		pattern: ["pattern", "填充模式, x-repeat, y-repeat, repeat"]
    },
    SubStage: {
        clip: ["boolean", "是否剪切舞台内超出舞台边界的对象"],
        culling: ["boolean", "是否在绘制时剔除在舞台边界外的对象"],
        drawCache: ["boolean", "是否缓存绘制命令"],
        ownerBuffer: ["boolean", "舞台是否自带离屏缓冲区"],
        batchMode: ["boolean", "是否需要跨舞台进行自动合批排序"]
    },
    RectFill: {
        gradient: ["GradientFill", "渐变填充"]
    },
    Label: {
        text: ["string", "文本内容"],
        font: ["string", "字体"],
        format: ["TextFormat", "文本格式"],
        strokeColor: ["color", "描边颜色"],
        strokeWidth: ["int", "描边宽度"],
        bkColor: ["color", "底色"],
        lineHeight: ["int", "行高"],
        align: ["AlignMode", "文本对齐模式"],
        gradient: ["GradientFill", "渐变填充"],
        margin: ["int4", "空白边距"]
    },
    BMFontLabel: {
        text: ["string", "文本内容"],
        font: ["string", "字体"],
        margin: ["int4", "空白边距"],
        bkColor: ["color", "底色"],
        format: ["TextFormat", "文本格式"]
    },
    SeqFrame: {
        frames: ["SeqFrameDesc", "序列帧数据"],
        fps: ["int", "播放帧率"],
        loop: ["boolean", "是否循环播放"],
        autoPlay: ["boolean", "自动开始播放"]
	},
	Spine: {
	}
};
exports.sprite = sprite;
exports.subclass = subclass;
