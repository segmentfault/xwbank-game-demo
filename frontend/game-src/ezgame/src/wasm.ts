/**@ignore */
type Handle = number;
/**@ignore */
type Mat3x4Handle = number;
/**@internal */
interface ezasmInterface {
	buffer: ArrayBuffer;
	setFloatArray(handle: Handle, array: number[]);
	handleToFloatArray(handle: Handle, count: number): Float32Array;
	handleToByteArray(handle: Handle, size: number): Uint8Array;
	memcpy(dest: Handle, src: Handle, size: number);

	//memory
	poolAllocDebug(size: number, type: number): Handle;
	poolAlloc(size: number): Handle;
	poolFree(node: Handle);
	initStaticMemoryPage(pageSize: number);
	initTempStackMemory(pageSize: number);
	tempStackAlloc(size: number): Handle;
	saveTempStack();
	restoreTempStack();
	staticAlloc(size: number): Handle;
	malloc(size: number): Handle;
	free(handle: Handle);
	printPoolInfo();

	//for sprite
	newSpriteData(): Handle;
	buildLocalTrans(s: Handle, targetTrans: Handle):number;
	buildGlobalTrans(s: Handle, transform: Handle);
	cullingTest(s: Handle, left, top, right, bottom): boolean;
	getx(s: Handle): number;
	gety(s: Handle): number;
	getscaleX(s: Handle): number;
	getscaleY(s: Handle): number;
	getscale(s: Handle): number;
	getanchorX(s: Handle): number;
	getanchorY(s: Handle): number;
	getangle(s: Handle): number;
	getskew(s: Handle): number;
	getMirrorH(s: Handle): boolean;
	getMirrorV(s: Handle): boolean;
	getwidth(s: Handle): number;
	getheight(s: Handle): number;
	getVisible(s: Handle): boolean;
	getCulled(s: Handle): boolean;
	getlocalTrans(s: Handle): Handle;
	getglobalTrans(s: Handle): Handle;
	setx(s: Handle, v: number);
	sety(s: Handle, v: number);
	setsx(s: Handle, v: number);
	setsy(s: Handle, v: number);
	setscale(s: Handle, v: number);
	setanchorX(s: Handle, v: number);
	setanchorY(s: Handle, v: number);
	setangle(s: Handle, v: number);
	//setopacity(s: Handle, v: number);
	setskew(s: Handle, v: number);
	setMirrorH(s: Handle, v: boolean);
	setMirrorV(s: Handle, v: boolean);
	setwidth(s: Handle, v: number);
	setheight(s: Handle, v: number);
	setVisible(s: Handle, v: boolean);
	setCulled(s: Handle, v: boolean);
	//setblendMode(s: Handle, val: number): boolean;
	calcBound(s: Handle): Handle;
	getOwnerBuffer(s: Handle): boolean;
	setOwnerBuffer(s: Handle, v: boolean);
	getClip(s: Handle): boolean;
	setClip(s: Handle, v: boolean);

	//for rendercontext
	getQuadsBuffer(): Handle;
	addQuad(quadIdx: number, flags);
	renderScaleTrans(width, height, transform: Handle);
	renderScaleTranslateTrans(width, height, x, y, transform: Handle);
	setUVIdentity();
	setUV(l, t, w, h);
	setUVGrad(x0, y0, x1, y1, w, h, len);
	setOpacity(val);
	setFillColor(r, g, b);
	setFrameBufferSize(width, height);
	tempAllocMat2x3(_11, _12, _21, _22, x, y): Handle;
	mat2x3Append(m1: Handle, m2: Handle);
	setGlobalTransform(m: Handle);

	//for ez3d
	mat3x4Identity(): Mat3x4Handle;
	mat3x4Mul(m1: Handle, m2: Handle, result: Mat3x4Handle);
	mat3x4FromQuat(x, y, z, w, result: Mat3x4Handle);
	mat3x4ScaleTranslate(sx, sy, sz, x, y, z, result: Mat3x4Handle);
	quatLerp(q1: Handle, q2: Handle, t: number, out: Handle);
}
/**@internal */
declare var ezasm: ezasmInterface;