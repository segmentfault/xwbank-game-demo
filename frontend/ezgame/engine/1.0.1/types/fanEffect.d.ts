declare module ez.effect {

    /**
     * 使用一个扇形蒙板剪切目标对象
     * @remark 可用于冷却倒计时特效
     * @param target 目标对象，可以是image,rectfill等可视对象
     * @param angle  扇形角度(0~360)
     * @param dir 初始剪切方向，默认为(0,-1) 12点方向
     */
    function fanMask(target: Sprite | ui.Visual, angle: number, dir?: ez.Number2): void;
}