/**
 * @module model
 */
declare namespace ez {
    enum SemanticIndex {
        POSITION = 0,
        NORMAL = 1,
        JOINTS = 2,
        WEIGHTS = 3,
        TANGENT = 4,
        TEXCOORD0 = 5,
        TEXCOORD1 = 6
    }
    interface ChannelData {
        index: number;
        semantic: string;
        count: number;
        type: number;
        normalized: boolean;
        offset: number;
        data: Float32Array | Int8Array | Int16Array;
    }
    interface SkinData {
        joints: number[];
        jointNames: string[];
        inverseBindMatrices?: number;
        skeleton?: number;
        inverseMatrixhandle: Handle;
    }
    interface Mesh {
        primitives: Primitive[];
    }
    class Primitive {
        stride: number;
        vertCount: number;
        idxCount: number;
        vertices: Float32Array;
        indices: Uint16Array;
        channels: ChannelData[];
        vbo: WebGLBuffer;
        ibo: WebGLBuffer;
        vaoBind: Function;
        material: Material;
        skin: Skin;
        skins: Skin[];
        groups: number[];
        hasTangent: boolean;
        updateData(): void;
        load(channels: ChannelData[], vertCount: number, indices: Uint16Array): void;
        splitSkin(limit: number): void;
        remapSkin(skeleton: Node[]): Primitive;
        draw(ctx: IRenderContext3D, skeleton: Node[]): void;
    }
}
/**
 * @module model
 */
declare namespace ez {
    var MAX_BONE: number;
    const Mat3x4Size: number;
    const Mat3x4IdentityHandle = 1;
    function copyMat3x4TempStack(m: Mat3x4): Handle;
    class Transform {
        value: Mat3x4;
        constructor(v?: Mat3x4);
    }
    class TransformTranslation extends Transform {
        constructor(x: any, y: any, z: any);
    }
    interface IRenderPipeline {
        camera: Camera;
        render(ctx: IRenderContext3D, renderables: Renderable[], camera: Camera): any;
        addPrimitive(primitive: Primitive, skeleton: Node[], material: Material, transform: Handle, shaderValues: any): any;
    }
    interface IScene {
        remove(obj: Renderable): any;
    }
    class Renderable {
        private passExcludes;
        private passIncludes;
        scene: IScene;
        transform: Transform;
        visible: boolean;
        shaderValues: any;
        passExclude(pass: number): void;
        passInclude(pass: number): void;
        isExclude(pass: any): number;
        isInclude(pass: any): number;
        draw(pipeline: IRenderPipeline): void;
        update(dt: number): boolean;
        get disposed(): boolean;
        dispose(): void;
        setShaderParameter(name: string, value: any): void;
    }
    class Model extends Renderable {
        private nodes;
        private root;
        private parent;
        private lastFrame;
        private state;
        playing: Animation;
        position: number;
        loop: boolean;
        animations: Dictionary<Animation>;
        drawables: Node[];
        materials: Material[];
        onStop: Function;
        speed: number;
        private updateTrans;
        constructor(nodes: Node[], root: number, animations: Animation[]);
        dispose(): void;
        replaceSkin(name: string): Promise<void>;
        addSkin(name: string): Promise<void>;
        findNode(name: string): Node;
        private _update;
        update(dt: number): boolean;
        linkTo(target: Model, nodeName: string): void;
        draw(pipeline: IRenderPipeline): void;
        play(aniName: string, loop: boolean): void;
        stop(): void;
    }
    class Node {
        name: string;
        private hLocalTrans;
        hGlobalTrans: Handle;
        translation: Vec3;
        rotation: Quaternion;
        scale: Vec3;
        parent: Node;
        children: Node[];
        mesh: Mesh;
        skin: SkinData;
        changed: boolean;
        hide: boolean;
        constructor(name: string, trs: TRS, matrix: Mat3x4);
        private delTransform;
        dispose(): void;
        draw(pipeline: IRenderPipeline, skeleton: Node[], transform: Handle, shaderValues: any): void;
        traverse(preFunc: Function, postFunc: Function, checkUsed?: boolean): void;
        setTRS(trs: TRS): void;
        setGlobalTrans(trans: Handle): void;
        updateGlobalTrans(parent: Node): void;
        updateTRS(): void;
        update(path: AnimationTargetPath, value: number[]): void;
    }
    enum AnimationTargetPath {
        translation = 0,
        rotation = 1,
        scale = 2
    }
    enum AnimationInterpolation {
        LINEAR = 0,
        STEP = 1,
        CATMULLROMSPLINE = 2,
        CUBICSPLINE = 3
    }
    interface AnimationChannelData {
        input: number[];
        output: number[];
        valueCount: number;
        interpolation: AnimationInterpolation;
        nodeId: number;
        path: AnimationTargetPath;
        minTime?: number;
        maxTime?: number;
    }
    interface TRS {
        translation?: number[];
        rotation?: number[];
        scale?: number[];
    }
    class Animation {
        name: string;
        duration: number;
        private channels;
        frames: any[];
        nodeIds: number[];
        initPos: TRS[];
        reset(nodes: Node[]): void;
        update(nodes: Node[], time: number): void;
        constructor(name: string, initPos: TRS[], channels: AnimationChannelData[]);
        setCache(): void;
    }
    class Skin {
        joints: number[];
        jointNames: string[];
        hInvMatrix: Handle;
        bonesHandle: Handle;
        bonesBuffer: Float32Array;
        constructor(s?: SkinData);
        dispose(): void;
        updateBones(nodes: Node[]): void;
    }
}
/**
 * @module model
 */
declare namespace ez {
    const enum BillboardType {
        Eye = 0,
        AxisY = 1,
        None = 2
    }
    /**
     * 公告板对象
     */
    class Billboard extends Renderable {
        material: Material;
        position: Vec3;
        target: Renderable;
        type: BillboardType;
        constructor(material: Material);
        linkTo(target: Renderable): void;
        draw(pipeline: IRenderPipeline): void;
    }
    class CrossMesh extends Renderable {
        material: Material;
        dimension: Vec3;
        constructor(material: Material);
        draw(pipeline: IRenderPipeline): void;
    }
}
declare namespace ez {
    class Camera {
        eye: Vec3;
        dir: Vec3;
        up: Vec3;
        view: Mat4;
        projection: Mat4;
        viewProj: Mat4;
        hViewTranspose: Handle;
        changed: boolean;
        constructor();
        update(): void;
    }
    class OrthoCamera extends Camera {
        width: number;
        height: number;
        zNear: number;
        zFar: number;
        constructor(w: number, h: number, zn: number, zf: number);
        update(): void;
    }
    class PerspectiveCamera extends Camera {
        fov: number;
        aspect: number;
        near: number;
        far: number;
        constructor(fov: number, aspect: number, near?: number, far?: number);
        update(): void;
    }
}
/**
 * gltf格式的模型文件
 * @module model
 */
declare module gltf {
    const enum ComponentType {
        BYTE = 5120,
        UNSIGNED_BYTE = 5121,
        SHORT = 5122,
        UNSIGNED_SHORT = 5123,
        FLOAT = 5126
    }
    enum DataCount {
        SCALAR = 1,
        VEC2 = 2,
        VEC3 = 3,
        VEC4 = 4,
        MAT2 = 4,
        MAT3 = 9,
        MAT4 = 16
    }
    interface Buffer {
        byteLength: number;
        uri: string;
        data: ArrayBuffer;
    }
    interface BufferView {
        buffer: number;
        byteLength: number;
        byteOffset: number;
        byteStride: number;
        target?: number;
    }
    interface Accessor {
        componentType: ComponentType;
        type: string;
        count: number;
        bufferView: number;
        byteOffset: number;
        normalized: boolean;
        min?: number[];
        max?: number[];
        data: Float32Array | Int16Array | Int8Array | Uint16Array | Uint8Array;
    }
    interface PbrMetallicRoughness {
        baseColorFactor?: ez.Number4;
        baseColorTexture?: string;
        metallicFactor?: number;
        roughnessFactor?: number;
        metallicRoughnessTexture?: string;
    }
    interface Material {
        name: string;
        shadingModel: string;
        texturePath?: string;
    }
    interface PbrMaterial extends Material {
        pbrMetallicRoughness: PbrMetallicRoughness;
    }
    interface StandardMaterial extends Material {
        shader: string;
        alphaMode: string;
        diffuseMap?: string;
        normalMap?: string;
        specularMap?: string;
        occlusionMap?: string;
        reflectMap?: string;
        emissiveMap?: string;
        diffuseFactor?: number[];
        opacity: number;
        specularLevel: number;
        shininess: number;
        extras: any;
    }
    interface Mesh {
        primitives: Primitive[];
        name: string;
        weights?: number;
    }
    interface Attribute {
        POSITION: number;
        NORMAL?: number;
        TANGENT?: number;
        JOINT?: number;
        WEIGHT?: number;
        COLOR: number[];
        TEXCOORD: number[];
    }
    interface Primitive {
        material: number;
        mode: number;
        attributes: any;
        indices: number;
    }
    interface Node {
        name: string;
        translation?: number[];
        rotation?: number[];
        scale?: number[];
        matrix?: number[];
        children: number[];
        mesh?: number;
        skin?: number;
    }
    interface AnimationSampler {
        input: number;
        output: number;
        interpolation: string;
        inputData: Accessor;
        outputData: Accessor;
    }
    class Target {
        node: number;
        path: string;
    }
    interface Channel {
        sampler: number;
        target: Target;
    }
    interface Animation {
        name: string;
        initPos?: ez.TRS[];
        samplers: AnimationSampler[];
        channels: Channel[];
    }
    interface Scene {
        name: string;
        nodes: number[];
    }
    interface File {
        asset: {
            generator: string;
            version: string;
        };
        scene: number;
        buffers: Buffer[];
        bufferViews: BufferView[];
        accessors: Accessor[];
        materials: Material[];
        meshes: Mesh[];
        skins: ez.SkinData[];
        animations: Animation[];
        nodes: Node[];
        scenes: Scene[];
    }
    function load(name: string, onFinish: any, onError: any): Promise<void>;
}
/**
 * @module Material
 */
declare namespace ez {
    var TexturePath: string;
    const enum DepthMode {
        CheckWrite = 0,
        Check = 16,
        Uncheck = 32
    }
    enum AlphaBlendMode {
        Opaque = 0,
        Transparent = 1,
        Add = 2
    }
    class Material {
        name: string;
        sortKey: number;
        shaderFlags: number;
        shaderModel: string;
        alphaMode: AlphaBlendMode;
        depthMode: DepthMode;
        uniforms: Dictionary<any>;
        dynamicUniforms: string[];
        textures: {
            name: string;
            texture: Texture;
        }[];
        skip: boolean;
        constructor(name: string, shader: string);
        setTexture(name: string, args: any, flag: number): void;
    }
}
/**
 * 向量计算库函数
 * @module math
 */
declare namespace ez {
    function clamp(value: number, min: number, max: number): number;
    function lerp(a: number, b: number, alpha: number): number;
    class Vec3 extends Array<number> {
        get x(): number;
        set x(v: number);
        get y(): number;
        set y(v: number);
        get z(): number;
        set z(v: number);
        constructor(x?: number, y?: number, z?: number);
        toArray(): Array<number>;
        add(v: Vec3): Vec3;
        sub(v: Vec3): Vec3;
        mul(t: number): Vec3;
        dot(v: Vec3): number;
        cross(v: Vec3): Vec3;
        distanceSquared(v: any): number;
        distance(v: any): number;
        min(v: Vec3): Vec3;
        max(v: Vec3): Vec3;
        normalize(): Vec3;
        clone(): Vec3;
        transform(m: Mat3x4): void;
        static min(v1: Vec3, v2: Vec3): Vec3;
        static max(v1: Vec3, v2: Vec3): Vec3;
        static add(v1: Vec3, v2: Vec3): Vec3;
        static sub(v1: Vec3, v2: Vec3): Vec3;
        static cross(v1: Vec3, v2: Vec3): Vec3;
        static lerp(v1: Vec3, v2: Vec3, t: number): Vec3;
        static axisX: Vec3;
        static axisY: Vec3;
        static axisZ: Vec3;
    }
    class Vec4 extends Array<number> {
        get x(): number;
        set x(v: number);
        get y(): number;
        set y(v: number);
        get z(): number;
        set z(v: number);
        get w(): number;
        set w(v: number);
        toArray(): Array<number>;
        constructor(x?: number, y?: number, z?: number, w?: number);
        static formVec3(v: Vec3): Vec4;
        transform(m: Mat4): void;
    }
    class Quaternion extends Vec4 {
        static rotateX(a: number): Quaternion;
        static rotateY(a: number): Quaternion;
        static rotateZ(a: number): Quaternion;
        static rotateAxis(axis: Vec3, a: number): Quaternion;
        clone(): Quaternion;
        isZero(): boolean;
        mul(q: Quaternion): Quaternion;
        static lerp(v1: Quaternion, v2: Quaternion, t: number): Quaternion;
        static slerp(v1: Quaternion, v2: Quaternion, t: number): Quaternion;
        static mul(p: Quaternion, q: Quaternion): Quaternion;
    }
    type Mat3x4 = [number, number, number, number, number, number, number, number, number, number, number, number];
    type Mat4 = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
    type Mat3 = [number, number, number, number, number, number, number, number, number];
    module Mat3 {
        const enum Element {
            m11 = 0,
            m12 = 1,
            m13 = 2,
            m21 = 3,
            m22 = 4,
            m23 = 5,
            m31 = 6,
            m32 = 7,
            m33 = 8
        }
    }
    module Mat3x4 {
        const enum Element {
            m11 = 0,
            m12 = 1,
            m13 = 2,
            m14 = 3,
            m21 = 4,
            m22 = 5,
            m23 = 6,
            m24 = 7,
            m31 = 8,
            m32 = 9,
            m33 = 10,
            m34 = 11
        }
        var identity: Mat3x4;
        function makeIdentity(): Mat3x4;
        function rotateX(a: any): Mat3x4;
        function rotateY(a: number): Mat3x4;
        function rotateZ(a: number): Mat3x4;
        function translate(x: number, y: number, z: number): Mat3x4;
        function scale(sx: number, sy: number, sz: number): Mat3x4;
        function clone(m: Mat3x4): Mat3x4;
        function transpose(m: Mat3x4): Mat3x4;
        function fromQuaternion(q: Quaternion, result?: Mat3x4): Mat3x4;
        function fromMat4(m: Mat4, transpose: boolean, result?: Mat3x4): Mat3x4;
        /**
         * m2 * m1 * v
         */
        function append(m1: Mat3x4, m2: Mat3x4): Mat3x4;
        function mul(m1: Mat3x4, m2: Mat3x4, result?: Mat3x4): Mat3x4;
    }
    module Mat4 {
        const enum Element {
            m11 = 0,
            m12 = 1,
            m13 = 2,
            m14 = 3,
            m21 = 4,
            m22 = 5,
            m23 = 6,
            m24 = 7,
            m31 = 8,
            m32 = 9,
            m33 = 10,
            m34 = 11,
            m41 = 12,
            m42 = 13,
            m43 = 14,
            m44 = 15
        }
        function cameraView(eye: Vec3, dir: Vec3, up: Vec3): Mat4;
        function perspective(fov: number, aspect: number, zn: number, zf: number): Mat4;
        function ortho(w: number, h: number, zn: number, zf: number): Mat4;
        function mul(m1: Mat4, m2: Mat4, result?: Mat4): Mat4;
        function mul2(m1: Mat3x4, m2: Mat4, result?: Mat4): Mat4;
        function transpose(m: Mat4): Mat4;
        function append(m1: Mat4, m2: Mat4): Mat4;
        function fromMat3x4(m: Mat3x4, result?: Mat4): Mat4;
        function clone(m: Mat4): Mat4;
    }
}
/**
 * @module model
 */
declare namespace ez {
    module modelFile {
        function load(name: string, onFinish: any, onError: any): Promise<void>;
    }
}
/**
 * @module Material
 */
declare namespace ez {
    enum UniformType {
        Float = 0,
        Vec2 = 1,
        Vec3 = 2,
        Vec4 = 3,
        Mat3 = 4,
        Mat4 = 5
    }
    /**
     * 3D材质用的shader库
     */
    module ShaderLib {
        function registerShader(name: string, createMaterial: (args: any) => Material, createShader: (flags: number) => Shader): void;
        function createMaterial(name: string, args: any): Material;
        function getShader(name: string, flags: number): Shader;
    }
}
declare namespace ez {
    var Cache3DAnimationFPS: number;
    /**
     * 加载3D模型文件
     */
    function loadModelFile(filename: string): Promise<Model>;
    /**
     * 3D场景对象
     * @remark 在stage3D中可以载入并渲染3D场景，renderPipeline
     */
    class Stage3DSprite extends Sprite {
        private _ownerBuffer;
        private _rtBuffer;
        private _bound;
        private _ticker;
        private renderables;
        static Type: string;
        getType(): string;
        renderPipeline: IRenderPipeline;
        camera: Camera;
        constructor(parent: Stage, id?: string);
        protected destroyBuffer(): void;
        protected _dispose(): void;
        /**
        * 舞台宽度
        */
        get width(): number;
        set width(val: number);
        /**
        * 舞台高度
        */
        get height(): number;
        set height(val: number);
        /**
        * 舞台是否自带离屏缓冲区
        */
        get ownerBuffer(): boolean;
        set ownerBuffer(val: boolean);
        update(dt: number): void;
        setDirty(needSort?: boolean): void;
        preRender(profile?: WGLPerFrameProfiler | CanvasPerFrameProfiler): void;
        protected _prepare(bound: Rect, transfrom: Handle, transChanged: boolean): void;
        protected _draw(rc: IRenderContext, opacity: number): boolean;
        /**
         * 清除全部子对象
         */
        clear(): void;
        /**
         * 添加一个子对象
         * @param obj
         */
        addChild(obj: Renderable): void;
        /**
         * 移除一个子对象
         * @param obj
         */
        remove(obj: Renderable): void;
        /**
         * 加载3D模型文件并添加到场景中
         * @param name
         * @returns model
         */
        loadModel(name: string): Promise<Model>;
    }
    module ui {
        /**
         * 包装3D场景的UI元素
         */
        class Stage3D extends Visual {
            static ClassName: string;
            static Properties: PropDefine[];
            _stage: Stage3DSprite;
            constructor(parent: Container);
            /**
             * 3D场景对象
             */
            get stage(): Stage3DSprite;
        }
    }
}
