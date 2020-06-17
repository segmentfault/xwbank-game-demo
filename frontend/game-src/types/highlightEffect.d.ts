declare namespace ez.effect {

    /**
     * 添加流动的高光效果
     * @param target: 目标对象
     * @param color: 光照颜色
     * @param width: 宽度百分比(0~1)
     * @param angle: 角度
     * @param duration: 效果持续时间(ms)
     * @param interval: 效果间隔时间(ms)
     * @param loop: 效果次数，0表示无限循环
     * @param range: 闪光范围，默认为[0,1]
     * @returns 返回ticker对象，如果需要手动取消特效则调用ez.removeTicker(ticker)，否则将在对象dispose时自动取消
     */
    function highlight(target: ui.Visual | Sprite, color: Color, width: number, angle: number, duration: number, interval: number, loop?: number, range?: [number, number]): Object;
}