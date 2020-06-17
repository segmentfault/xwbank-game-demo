type SkeletonDataHandle = number;
type AnimationHandle = number;
type StringHandle = number;
type AnimationStateDataHandle = number;
type AnimationStateHandle = number;
type SkeletonHandle = number;
type AttachmentHandle = number;

/** @internal */
interface spineASM {
	buffer: ArrayBuffer;
	copyFloatArray(handle: Handle, array: number[]);
	copyByteArray(handle: Handle, array: number[] | ArrayBuffer | Uint8Array);
	handleToFloatArray(handle: Handle, count: number): Float32Array;
	handleToByteArray(handle: Handle, size: number): Uint8Array;
	memcpy(dest: Handle, src: Handle, size: number);
	getString(ptr: StringHandle): string;
	allocString(str: string): Handle;
	lastError(): string;
	malloc(size: number): Handle;
	free(ptr: Handle);

	init();
	loadSkeletonJson(data: Handle): SkeletonDataHandle;
	loadSkeletonBin(data: Handle, size: number): SkeletonDataHandle;
	disposeSkeletonData(s: SkeletonDataHandle);
	disposeAnimationStateData(s: AnimationStateDataHandle);

	getSkDataAniCount(s: SkeletonDataHandle): number;
	getSkDataAni(data: SkeletonDataHandle, idx: number): Handle;
	getSkDataSkinCount(s: SkeletonDataHandle): number;
	getSkDataSkinName(data: SkeletonDataHandle, idx: number): Handle;

	getAnimationName(data: AnimationHandle): StringHandle;
	getAnimationDuration(data: AnimationHandle): number;

	createAnimationStateData(data: SkeletonDataHandle): AnimationStateDataHandle;	
	createAnimationState(data: AnimationStateDataHandle): AnimationStateHandle;
	disposeAnimationState(data: AnimationStateHandle);
	setAnimation(data: AnimationStateHandle, trackIndex: number, ani: AnimationHandle, loop: number);
	addAnimation(data: AnimationStateHandle, trackIndex: number, ani: AnimationHandle, loop: number, delay: number);
	clearTracks(data: AnimationStateHandle): void;
	clearTrack(data: AnimationStateHandle, trackIndex: number): void;
	updateAnimationState(data: AnimationStateHandle, dt: number, skeleton: SkeletonHandle): boolean;
	setAnimationEventListener(data: AnimationStateHandle, userData: number);
	//attachment
	updateAttachRegion(attachment: AttachmentHandle,
		u, v, u2, v2, rotate, degrees,
		offsetX, offsetY, width, height, originalWidth, originalHeight);
	updateAttachment(attachment: AttachmentHandle,
		m0, m1, m2, m3, u, v, u2, v2, width, height);

	//Skeleton
	createSkeleton(data: SkeletonDataHandle): SkeletonHandle;
	disposeSkeleton(self: SkeletonHandle);
	setSkeletonSkinByName(self: SkeletonHandle, skinName:number): number;
	drawSkeleton(self: SkeletonHandle, opacity: number);
}
/** @internal */
var spasm: spineASM;
/*
var memobjs = {};
//spwasm["initMemDbg"]();
spasm["allocMem"] = function (ptr, size, fn, line) {
	memobjs[ptr] = {size:size, info:`size:${size} ${fn} @ ${line}`};
}
spasm["freeMem"] = function (ptr) {
	if(!memobjs[ptr]) {
		console.log(`${ptr} not found.`);
	}
	else
		delete memobjs[ptr];
}*/
/*
spasm["logMemInfo"] = function () {
	var total = 0;
	var count = 0;
	for(var k in memobjs) {
		total += memobjs[k].size;
		count++;
		console.log(memobjs[k].info);
	}
	console.log("all: ", total, count);
}*/

namespace spine {
	class TextureAtlas {
		pages = new Array<TextureAtlasPage>();
		regions: ez.Dictionary<TextureAtlasRegion> = {};

		constructor(atlasText: string, textureLoader: (path: string) => ez.Texture) {
			if(textureLoader == null)
				throw new Error("textureLoader cannot be null.");
			let reader = new TextureAtlasReader(atlasText);
			let tuple = new Array<string>(4);
			let page: TextureAtlasPage = null;
			while(true) {
				let line = reader.readLine();
				if(line == null)
					break;
				line = line.trim();
				if(line.length == 0)
					page = null;
				else if(!page) {
					page = new TextureAtlasPage();
					page.name = line;

					if(reader.readTuple(tuple) == 2) { // size is only optional for an atlas packed with an old TexturePacker.
						page.width = parseInt(tuple[0]);
						page.height = parseInt(tuple[1]);
						reader.readTuple(tuple);
					}
					reader.readTuple(tuple);

					let direction = reader.readValue();
					page.texture = textureLoader(line);
					page.width = page.texture.width;
					page.height = page.texture.height;
					this.pages.push(page);
				} else {
					let region: TextureAtlasRegion = new TextureAtlasRegion();
					region.name = line;
					region.page = page;

					let rotateValue = reader.readValue();
					if(rotateValue.toLocaleLowerCase() == "true") {
						region.degrees = 90;
					} else if(rotateValue.toLocaleLowerCase() == "false") {
						region.degrees = 0;
					} else {
						region.degrees = parseFloat(rotateValue);
					}
					region.rotate = region.degrees == 90;

					reader.readTuple(tuple);
					let x = parseInt(tuple[0]);
					let y = parseInt(tuple[1]);

					reader.readTuple(tuple);
					let width = parseInt(tuple[0]);
					let height = parseInt(tuple[1]);

					region.u = x / page.width;
					region.v = y / page.height;
					if(region.rotate) {
						region.u2 = (x + height) / page.width;
						region.v2 = (y + width) / page.height;
					} else {
						region.u2 = (x + width) / page.width;
						region.v2 = (y + height) / page.height;
					}
					region.x = x;
					region.y = y;
					region.width = Math.abs(width);
					region.height = Math.abs(height);

					if(reader.readTuple(tuple) == 4) { // split is optional
						if(reader.readTuple(tuple) == 4) { // pad is optional, but only present with splits
							reader.readTuple(tuple);
						}
					}

					region.originalWidth = parseInt(tuple[0]);
					region.originalHeight = parseInt(tuple[1]);

					reader.readTuple(tuple);
					region.offsetX = parseInt(tuple[0]);
					region.offsetY = parseInt(tuple[1]);

					region.index = parseInt(reader.readValue());

					region.renderObject = page.texture;
					this.regions[region.name] = region;
				}
			}
		}

		findRegion(name: string): TextureAtlasRegion {
			return this.regions[name];
		}
	}

	class TextureAtlasReader {
		lines: Array<string>;
		index: number = 0;

		constructor(text: string) {
			this.lines = text.split(/\r\n|\r|\n/);
		}

		readLine(): string {
			if(this.index >= this.lines.length)
				return null;
			return this.lines[this.index++];
		}

		readValue(): string {
			let line = this.readLine();
			let colon = line.indexOf(":");
			if(colon == -1)
				throw new Error("Invalid line: " + line);
			return line.substring(colon + 1).trim();
		}

		readTuple(tuple: Array<string>): number {
			let line = this.readLine();
			let colon = line.indexOf(":");
			if(colon == -1)
				throw new Error("Invalid line: " + line);
			let i = 0, lastMatch = colon + 1;
			for(; i < 3; i++) {
				let comma = line.indexOf(",", lastMatch);
				if(comma == -1) break;
				tuple[i] = line.substr(lastMatch, comma - lastMatch).trim();
				lastMatch = comma + 1;
			}
			tuple[i] = line.substring(lastMatch).trim();
			return i + 1;
		}
	}

	class TextureAtlasPage {
		name: string;
		texture: ez.Texture;
		width: number;
		height: number;
	}

	class TextureAtlasRegion {
		renderObject: any;
		u = 0; v = 0;
		u2 = 0; v2 = 0;
		width = 0; height = 0;
		rotate = false;
		offsetX = 0; offsetY = 0;
		originalWidth = 0;
		originalHeight = 0;
		page: TextureAtlasPage;
		name: string;
		x: number;
		y: number;
		index: number;
		degrees: number;
	}

	export class Animation {
		/**@ignore */
		public handle: Handle;
		/** 动画名 */
		public name: string;
		/** 动画时间 */
		public get duration(): number {
			return spasm.getAnimationDuration(this.handle);
		}
		/**@ignore */
		constructor(handle: Handle) {
			this.handle = handle;
			this.name = spasm.getString(spasm.getAnimationName(handle));
		}
	}

	export interface AnimationEvent {
		name: string;
		intValue: number;
		floatValue: number;
		stringValue: string;
	}

	var eventPool = [];

	export function aniEvent(id:number, name: number, intVal: number, floatVal: number, strVal: number) {
		var l = eventPool[id];
		if(!l)
			return;
		var e = {
			name: spasm.getString(name),
			intValue: intVal,
			floatValue: floatVal,
			stringValue: ""
		};
		if(strVal)
			e.stringValue = spasm.getString(strVal);
		l(e);
	}

	export class AnimationState {
		skeloton:SkeletonData;
		handle: AnimationStateHandle;
		listener: (e: AnimationEvent) => void;

		constructor(skeleton: SkeletonData) {
			this.skeloton = skeleton;
			this.handle = spasm.createAnimationState(skeleton.aniState);
		}

		dispose() {
			spasm.disposeAnimationState(this.handle);
			this.handle = 0;
			if(this.listener) {
				var idx = eventPool.indexOf(this.listener);
				if(idx >= 0)
					eventPool[idx] = null;
				this.listener = null;
			}
		}

		update(dt: number, skeleton: Skeleton): boolean {
			return spasm.updateAnimationState(this.handle, dt, skeleton.handle);
		}

		setAnimation(trackIndex: number, animationName: string, loop: boolean) {
			var ani = this.skeloton.findAnimation(animationName);
			spasm.setAnimation(this.handle, trackIndex, ani.handle, loop ? 1 : 0);
		}
		addAnimation(trackIndex: number, animationName: string, loop: boolean, delay: number) {
			var ani = this.skeloton.findAnimation(animationName);
			spasm.addAnimation(this.handle, trackIndex, ani.handle, loop ? 1 : 0, delay);
		}
		clearTracks(): void {
			spasm.clearTracks(this.handle);
		}
		clearTrack(trackIndex: number): void {
			spasm.clearTrack(this.handle, trackIndex);
		}
		addEventListener(listener: (e: AnimationEvent) => void) {
			var id = -1;
			for(var i = 0; i < eventPool.length; i++) {
				if(eventPool[i] == null)
					id = i;
			}
			if(id < 0) {
				eventPool.push(listener);
				id = eventPool.length - 1;
			}
			spasm.setAnimationEventListener(this.handle, id);
		}
	}
	/** spine骨架对象 */
	export class Skeleton {
		handle: SkeletonHandle;
		constructor(data: SkeletonData) {
			this.handle = spasm.createSkeleton((<any>data).handle);
		}
		dispose() {
			spasm.disposeSkeleton(this.handle);
			this.handle = 0;
		}
		setSkinByName(skinName: string): void {
			var n = spasm.allocString(skinName);
			var r = spasm.setSkeletonSkinByName(this.handle, n);
			spasm.free(n);
			if(!r)
				throw new Error(`skin ${skinName} is not exist.`);
		}
	}

	export class SkeletonData {
		private aniTbl: any;
		private handle: SkeletonDataHandle;

		public animations: Animation[];
		public aniState: AnimationStateDataHandle;
		public aniNames: string[];
		public skinNames: string[];

		constructor(handle: SkeletonDataHandle) {
			this.handle = handle;
			this.aniState = spasm.createAnimationStateData(handle);
			this.animations = [];
			this.aniNames = [];
			this.skinNames = [];
			var count = spasm.getSkDataAniCount(handle);
			this.aniTbl = {};
			for(let i = 0; i < count; i++) {
				var ani = new Animation(spasm.getSkDataAni(handle, i));
				this.animations.push(ani);
				this.aniNames.push(ani.name);
				this.aniTbl[ani.name] = ani;
			}

			count = spasm.getSkDataSkinCount(handle);
			for(let i = 0; i < count; i++) {
				this.skinNames.push(spasm.getString(spasm.getSkDataSkinName(handle, i)));
			}
		}

		findAnimation(name: string): Animation {
			return this.aniTbl[name];
		}

		dispose() {
			spasm.disposeSkeletonData(this.handle);
			spasm.disposeAnimationStateData(this.aniState);
			this.handle = 0;
			this.animations = null;
		}
	}

	var imgPath = "";
	var texAtlas: TextureAtlas;
	var texPool = [null];
	var rc: ez.IRenderContextWGL;
	var shader: ez.Shader;
	var currSkeleton: Skeleton;
	var skeletonPool: ez.Dictionary<SkeletonData> = {};
	var vbo: WebGLBuffer;
	var ibo: WebGLBuffer;
	var vao: Function;

	export var DefVS = `
attribute vec2 pos;
attribute vec2 uv;
attribute vec4 color;
uniform vec2 invSize;
uniform float trans[6];
varying vec2 v_tc;
varying vec2 v_pos;
varying vec4 v_color;

void main(){
	gl_Position = vec4((pos.x * trans[0] + pos.y * trans[2] + trans[4]) * invSize.x - 1.0, (pos.x * trans[1] + pos.y * trans[3] + trans[5]) * invSize.y + 1.0, 0.0, 1.0);
	v_tc = uv;
	v_color = color;
}`;

	var inited = false;
	/** @internal */
	export function init() {
		if (inited)
			return;
		inited = true;
		spasm.init();
		var gl = ez.getGL();
		vbo = gl.createBuffer();
		ibo = gl.createBuffer();
		vao = (<ez.IRenderContextWGL>ez.RenderContext).createVAO(function (gl) {
			gl.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, ibo);
			gl.bindBuffer(GL.ARRAY_BUFFER, vbo);
			gl.enableVertexAttribArray(0);
			gl.enableVertexAttribArray(1);
			gl.enableVertexAttribArray(2);
			gl.vertexAttribPointer(0, 2, GL.FLOAT, false, 5 * 4, 0);
			gl.vertexAttribPointer(1, 2, GL.FLOAT, false, 5 * 4, 2 * 4);
			gl.vertexAttribPointer(2, 4, GL.UNSIGNED_BYTE, true, 5 * 4, 4 * 4);
		});
		//ez.Shader.DefFS2D
		shader = new ez.Shader(DefVS, ez.Effect.DefFS2D, ["pos", "uv", "color"], { texture0: gl.uniform1i, trans: gl.uniform1fv, invSize: gl.uniform2fv });
	}

	/** @internal */
	export function drawMesh(vertBuffer, vertCount, indexBuffer, count, renderObject) {
		var res = texPool[renderObject];
		if(!res) {
			Log.error(`not find renderobjectId:${renderObject}`);
			return;
		}
		var vb = new Float32Array(spasm.buffer, vertBuffer, vertCount * 5);
		var ib = new Uint16Array(spasm.buffer, indexBuffer, count);
		if(res.state != ez.ResState.Ready)
			return;
		rc.bindTexture(res.getData(), 0);
		var gl = ez.getGL();		
		gl.bindBuffer(GL.ARRAY_BUFFER, vbo);
		gl.bufferData(GL.ARRAY_BUFFER, vb, GL.STREAM_DRAW);
		gl.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, ibo);
		gl.bufferData(GL.ELEMENT_ARRAY_BUFFER, ib, GL.STREAM_DRAW);
		rc.drawTriangles(vao, count);
	}

	/** @internal */
	export function onLoadTexture(path: StringHandle, attachment: Handle): number {
		let name = spasm.getString(path);
		if(texAtlas) {
			let region = texAtlas.findRegion(name);
			if(!region) {
				Log.error(`not find region "${name}"`);
				return 0;
			}
			spasm.updateAttachRegion(attachment,
				region.u, region.v, region.u2, region.v2, region.rotate, region.degrees,
				region.offsetX, region.offsetY, region.width, region.height, region.originalWidth, region.originalHeight);
			return region.page.texture["spine_renderObjIdx"];
		}
		else {
			let imgName = imgPath + "/" + name;
			//console.log(`load ${imgName}`);
			var res = ez.getRes<ez.Texture>(imgName);
			var tex = res.getData();
			var m0 = 0, m1 = 0, m2 = 0, m3 = 0;
			if(tex.margin) {
				m0 = tex.margin[0];
				m1 = tex.margin[1];
				m2 = tex.margin[2];
				m3 = tex.margin[3];
			}
			var u = 0, v = 0, u2 = 1, v2 = 1;
			if(tex.subRect) {
				var invW = 1 / res.parentImage.width;
				var invH = 1 / res.parentImage.height;
				u = tex.subRect.left * invW;
				v = tex.subRect.top * invH;
				u2 = tex.subRect.right * invW;
				v2 = tex.subRect.bottom * invH;
			}
			spasm.updateAttachment(attachment, m0, m1, m2, m3, u, v, u2, v2, res.width, res.height);
			if(res.state == ez.ResState.Unload)
				res.load();
			if(!tex["spine_renderObjIdx"]) {
				tex["spine_renderObjIdx"] = texPool.length;
				texPool.push(tex);
			}
			return tex["spine_renderObjIdx"];
		}
	}

	function loadSkeleton(path: string, data: Uint8Array, isBinary: boolean, atlas: string): SkeletonData {
		if(atlas) {
			texAtlas = new TextureAtlas(atlas, p => {
				let res = ez.getRes<ez.Texture>(path + p.substring(0, p.lastIndexOf('.')));
				if(res.state == ez.ResState.Unload)
					res.load();
				var tex = res.getData();
				if(texPool.indexOf(tex.id) < 0)
					texPool.push(tex.id);
				return tex;
			});
		}
		
		imgPath = path;
		let ptr = spasm.malloc(data.byteLength);
		spasm.copyByteArray(ptr, data);
		var s;
		if(isBinary)
			s = spasm.loadSkeletonBin(ptr, data.byteLength);
		else
			s = spasm.loadSkeletonJson(ptr);
		spasm.free(ptr);
		texAtlas = null;
		if(!s) {
			Log.error(spasm.lastError());
			throw new Error(spasm.lastError());
		}
		return new SkeletonData(s);
	}

	/** @internal */
	export async function load(name: string, imgPath?:string): Promise<{ skeleton: Skeleton, state: AnimationState, data:SkeletonData }> {
		if(!shader)
			init();
		var skeData = skeletonPool[name];
		if(!skeData) {
			var res = ez.getRes<ArrayBuffer>(name);
			if(!res)
				throw new Error(`${name} is not exist.`);
			if(res.type != ez.ResType.spine)
				throw new Error(`${name} is not spine file.`);
			if(res.state != ez.ResState.Ready)
				await res.loadAsync();
			var atlas;
			if(res.args.atlas) {
				var atlasRes = ez.getRes<string>(res.args.atlas);
				if(atlasRes.state != ez.ResState.Ready)
					await atlasRes.loadAsync();
				atlas = atlasRes.getData();
			}

			if(res.state == ez.ResState.Error)
				return;
			var data = new Uint8Array(res.getData());
			var sig = data[0];
			let path = name.substring(0, name.lastIndexOf('.'));
			if(imgPath)
				path = imgPath;
			else if(atlas && path.lastIndexOf('/') > 0)
				path = path.substring(0, path.lastIndexOf('/') + 1);
			skeData = loadSkeleton(path, data, sig == 0x1c, atlas);
			skeletonPool[name] = skeData;
		}
		var ske = new Skeleton(skeData);
		var state = new AnimationState(skeData);
		return { skeleton: ske, state: state, data: skeData };
	}

	/** @internal */
	export function draw(ctx: ez.IRenderContext, transform: Handle, skeleton: Skeleton, opacity: number) {
		rc = <ez.IRenderContextWGL>ctx;
		rc.setShader(shader);
		currSkeleton = skeleton;
		var trans = ezasm.handleToFloatArray(transform, 6);
		shader.bind("trans", trans, true);
		shader.bind("invSize", [rc.invWidth, rc.invHeight]);
		spasm.drawSkeleton(skeleton.handle, opacity);
	}
}

namespace ez {

	/** 
	 * spine动画对象
	 */
	export class SpineSprite extends Sprite {
		private _ticker: Object;
		private _skeleton: spine.Skeleton;
		private _state: spine.AnimationState;
		private _data: spine.SkeletonData;
		public static Type = "Spine";

		/** 动画播放速度 */
		public timeScale: number = 1;

		public getType(): string {
			return SpineSprite.Type;
		}

		protected _dispose() {
			this._skeleton.dispose();
			this._state.dispose();
			super._dispose();
		}

		public constructor(parent: Stage, id?: string) {
			super(parent, id);
			spine.init();
		}
		/**
		 * 播放动画
		 * @param track 轨道
		 * @param ani 动画名
		 * @param loop 是否需要循环
		 */
		public play(track: number, ani: string, loop?: boolean) {
			this._state.setAnimation(track, ani, loop);
			if(!this._ticker)
				this._ticker = addTicker(this.update, this);
		}
		/** spine骨骼对象 */
		public get skeleton(): spine.Skeleton {
			return this._skeleton;
		}
		/** 动画状态 */
		public get animationState() {
			return this._state;
		}
		public get skeletonData() {
			return this._data;
		}
		/** 停止播放 */
		public stop() {
			if (!this._ticker)
				return;
			removeTicker(this._ticker);
			this._ticker = null;
		}
		/** 加载动画数据 */
		public async load(name: string, imgPath?: string): Promise<void> {
			let data = await spine.load(name, imgPath);
			this._skeleton = data.skeleton;
			this._state = data.state;
			this._data = data.data;
		}

		private update(dt: number) {
			Profile.addCommand("spine update");
			var playing = this._state.update(dt * this.timeScale * 0.001, this._skeleton);
			this.setDirty();
			if(!playing) {
				Log.debug("stop");
				removeTicker(this._ticker);
				this._ticker = null;
			}
		}

		protected _draw(rc: IRenderContext, opacity: number) {
			if(!this._state)
				return;
			opacity *= this.opacity;
			if(opacity < 0.01)
				return;
			spine.draw(rc, ezasm.getglobalTrans(this._handle), this._skeleton, opacity);
		}
	}

	Sprite.register(SpineSprite.Type, function (p, id) { return new SpineSprite(p, id) });
}