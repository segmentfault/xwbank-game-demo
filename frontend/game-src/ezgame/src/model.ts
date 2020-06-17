/**
 * @module model
 */
namespace ez {

	export var MAX_BONE = 45;
	export const Mat3x4Size = 12 * 4;
	export const Mat3x4IdentityHandle = 1;
	
	export function copyMat3x4TempStack(m: Mat3x4):Handle {
		var t = ezasm.tempStackAlloc(Mat3x4Size);
		ezasm.handleToFloatArray(t, 12).set(m);
		return t;
	}

	export class Transform {
		value: Mat3x4;

		constructor(v?: Mat3x4) {
			this.value = v || Mat3x4.identity;
		}
	}

	export class TransformTranslation extends Transform {

		constructor(x, y, z) {
			super();
			this.value = Mat3x4.translate(x, y, z);
		}
	}

	export interface IRenderPipeline {
		camera: Camera;
		render(ctx: IRenderContext3D, renderables: Renderable[], camera: Camera);
		addPrimitive(primitive: Primitive, skeleton: Node[], material: Material, transform: Handle, shaderValues: any);
	}

	export interface IScene {
		remove(obj: Renderable);
	}

	export class Renderable {
		private passExcludes: number;
		private passIncludes: number;
		public scene: IScene;
		public transform: Transform;
		public visible: boolean = true;
		public shaderValues: any;

		public passExclude(pass: number) { this.passExcludes |= 1 << pass; }
		public passInclude(pass: number) { this.passIncludes |= 1 << pass; }
		public isExclude(pass) { return (this.passExcludes && (this.passExcludes & (1 << pass))); }
		public isInclude(pass) { return (this.passIncludes && (this.passIncludes & (1 << pass))); }
		draw(pipeline: IRenderPipeline) { }
		update(dt: number): boolean { return false; }
		get disposed() { return !this.scene; }
		dispose() {
			if(this.scene) {
				this.scene.remove(this);
				this.scene = null;
			}
		}
		public setShaderParameter(name: string, value: any) {
			if(!this.shaderValues)
				this.shaderValues = {};
			this.shaderValues[name] = value;
		}
	}

	function remapSkin(m: Mesh, skeleton: Node[]): Mesh {
		var i = 0;
		for (i = 0; i < m.primitives.length; i++) {
			var p = m.primitives[i];
			if (p.skin || p.skins)
				break;
		}

		if (i == m.primitives.length)//no skin
			return m;
		var mesh = {
			primitives : []
		};
		mesh.primitives = m.primitives.map(p => {
			if (p.skin || p.skins)
				return p.remapSkin(skeleton);
			return p;
		});
		return mesh;
	}

	export class Model extends Renderable {
		private nodes: Node[];
		private root: Node;
		private parent: { node: Node, model: Model, invSkinMatrix?:number };
		private lastFrame;
		private state: MediaState = MediaState.Stop;
		public playing: Animation;
		public position = 0;
		public loop: boolean;
		public animations: Dictionary<Animation>;
		public drawables: Node[] = [];
		public materials: Material[];
		public onStop: Function;
		public speed = 1;

		private updateTrans() {
			this.root.traverse((node: Node, parent: Node) => node.updateGlobalTrans(parent), null);
			this.root.traverse(node => node.changed = false, null);
		}

		/*
		private updateBone() {
			var drawables = this.drawables;
			for(var i = 0; i < drawables.length; i++) {
				var skin = drawables[i].skin;
				if(skin)
					skin.updateBones(this.nodes);
			}
		}*/

		constructor(nodes: Node[], root: number, animations: Animation[]) {
			super();
			this.nodes = nodes;
			this.root = nodes[root];
			var dict = {};
			animations.forEach(v => dict[v.name] = v);
			this.animations = dict;
			var ctx = this;
			this.materials = [];
			this.root.traverse(function (node: Node, parent: Node) {
				if(node.mesh) {
					ctx.drawables.push(node);
					var materials = ctx.materials;
					for(let i = 0; i < node.mesh.primitives.length; i++) {
						let m = node.mesh.primitives[i].material;
						if(materials.indexOf(m) < 0)
							materials.push(m);
					}
				}
			}, null);
			this.updateTrans();
			//this.updateBone();
		}		
		dispose() {
            super.dispose();
            this.stop();
			for(var i = 0; i < this.nodes.length; i++)
				this.nodes[i].dispose();
			this.nodes = null;
			this.drawables = null;
		}

		async replaceSkin(name: string) {
            var model = await loadModelFile(name);
            if (this.disposed)
            {
                model.dispose();
                return
            }
			var drawables = model.drawables;
			drawables.forEach(n => n.mesh = remapSkin(n.mesh, this.nodes));
			this.drawables = drawables;
			this.materials = model.materials;
			model.dispose();
		}

		async addSkin(name: string) {
			var model = await loadModelFile(name);
			var drawables = model.drawables;
			drawables.forEach(n => n.mesh = remapSkin(n.mesh, this.nodes));
			this.drawables = this.drawables.concat(drawables);
			model.dispose();
		}

		findNode(name: string):Node {
			for(let i = 0; i < this.nodes.length; i++) {
				var n = this.nodes[i];
				if(n.name === name)
					return n;
			}
			return null;
		}

		private _update(ani: Animation) {
			if(Cache3DAnimationFPS) {
				var frame = (this.position * Cache3DAnimationFPS) | 0;
				if(frame == this.lastFrame)
					return false;
				if(!ani.frames)
					ani.setCache();
				this.lastFrame = frame;
				var nodes = this.nodes;

				if(!ani.frames[frame]) {
					ani.update(nodes, frame / Cache3DAnimationFPS);
					for(var i = 0, len = ani.nodeIds.length; i < len; i++)
						nodes[ani.nodeIds[i]].updateTRS();
					this.updateTrans();
					var c = ani.frames[frame] = [];
					for(var i = 0; i < nodes.length; i++) {
						var n = nodes[i];
						//var v: any = { i: i, t: n.hGlobalTrans };
						var v = n.hGlobalTrans;
						if(v > Mat3x4IdentityHandle) {
							v = ezasm.poolAllocDebug(Mat3x4Size, 4);
							ezasm.memcpy(v, n.hGlobalTrans, Mat3x4Size);
						}
						c.push(v);
					}
				}
				else {
					var cache = ani.frames[frame];
					for (var i = 0; i < cache.length; i++)
						nodes[i].setGlobalTrans(cache[i]);
					//ani.frames[frame].forEach(v => nodes[v.i].setGlobalTrans(v.t));
				}
				return true;
			}
			else {
				ani.update(this.nodes, this.position);
				for(var i = 0, len = ani.nodeIds.length; i < len; i++)
					this.nodes[ani.nodeIds[i]].updateTRS();
				this.updateTrans();
				return true;
			}
		}

		update(dt: number): boolean {
			dt = dt * this.speed;
			if(!this.playing)
				return false;
			this.position += dt * 0.001;
			var ani = this.playing;
				//nodeIds
			if(ani.duration <= 0) {
				Log.error(`duration error`);
				return;
			}
			if(!this.loop && this.position > ani.duration) {
				this.position = ani.duration;
				var r = this._update(ani);
				this.playing = null;
				if(this.onStop)
					this.onStop();
				return r;
			}
			while(this.position > ani.duration)
				this.position -= ani.duration;
			return this._update(ani);
		}

		linkTo(target: Model, nodeName: string) {
			var node = target.findNode(nodeName);
			if (!node) {
				Log.error(`not find node ${nodeName}`);
				return;
			}
			//node.setUsed();
			this.parent = { node: node, model: target };
			let idx = target.nodes.indexOf(node);
			for (let i = 0; i < target.drawables.length; i++) {
				let n = target.drawables[i];
				if (!n.skin)
					continue;
				let j = n.skin.joints.indexOf(idx)
				if (j >= 0) {
					this.parent.invSkinMatrix = n.skin.inverseMatrixhandle + j * Mat3x4Size;
					break;
				}
			}			
		}

		draw(pipeline: IRenderPipeline) {
			var drawables = this.drawables;
			var trans = this.transform ? copyMat3x4TempStack(this.transform.value) : Mat3x4IdentityHandle;
			if(this.parent) {
				if(!this.parent.node.hGlobalTrans)
					return;
				if(trans == Mat3x4IdentityHandle) {
					trans = ezasm.tempStackAlloc(Mat3x4Size);
					ezasm.handleToFloatArray(trans, 12).set(Mat3x4.identity);
				}
				if (this.parent.invSkinMatrix)
					ezasm.mat3x4Mul(trans, this.parent.invSkinMatrix, trans);
				if(this.parent.node.hGlobalTrans > Mat3x4IdentityHandle)
					ezasm.mat3x4Mul(trans, this.parent.node.hGlobalTrans, trans);
				if(this.parent.model.transform)
					ezasm.mat3x4Mul(trans, copyMat3x4TempStack(this.parent.model.transform.value), trans);
			}
			for(var i = 0; i < drawables.length; i++)
				drawables[i].draw(pipeline, this.nodes, trans, this.shaderValues);
		}
		play(aniName: string, loop: boolean) {
            if (this.disposed)
                return;
			var ani = this.animations[aniName];
			if(!ani)
				throw new Error("animation not exist!");
			this.lastFrame = -1;
			this.loop = loop;
			this.position = 0;
			if(this.playing == ani)
				return;
			if (ani.initPos)
				ani.reset(this.nodes);
			/*this.root.traverse(function (node: Node, parent: Node) {
				node.reset();
			}, null);*/
			this.playing = ani;
			this.update(0);
		}
		stop() {
			if(!this.playing)
				return;
			/*this.root.traverse(function (node: Node, parent: Node) {
				node.reset();
			}, null);*/
			if (this.playing.initPos)
				this.playing.reset(this.nodes);
			this.position = 0;
			this.playing = null;
			this.update(0);
			if(this.onStop)
				this.onStop();
		}
	}

	export class Node {
		name: string;
		private hLocalTrans: Handle = 0;
		hGlobalTrans: Handle = 0;
		translation: Vec3;
		rotation: Quaternion;
		scale: Vec3;
		parent: Node;
		children: Node[];
		mesh: Mesh;
		skin: SkinData;
		//skin: Skin;
		//private _trs: TRS;
		//private _matrix: egl.Mat3x4;
		//isUsed: boolean;
		changed: boolean;
		hide: boolean;

		constructor(name: string, trs: TRS, matrix: Mat3x4) {
			this.name = name;
			if(trs){
				//this._trs = trs;
				this.setTRS(trs);	
			}
			else if (matrix) {
				//this._matrix = matrix;
				this.hLocalTrans = ezasm.poolAllocDebug(Mat3x4Size, 1);
				var l = ezasm.handleToFloatArray(this.hLocalTrans, 12);
				l.set(matrix);
			}
			else {
				this.hLocalTrans = Mat3x4IdentityHandle;
			}
			//this._trs = trs;//[translation, rotation, scale];
			//this._matrix = matrix;
			//this.reset();
		}
		private delTransform() {
			if(this.hLocalTrans > Mat3x4IdentityHandle) {
				ezasm.poolFree(this.hLocalTrans);
				if(this.hLocalTrans == this.hGlobalTrans)
					this.hGlobalTrans = 0;
			}
			if(this.hGlobalTrans > Mat3x4IdentityHandle)
				ezasm.poolFree(this.hGlobalTrans);
			this.hLocalTrans = 0;
			this.hGlobalTrans = 0;
		}

		dispose() {
			this.delTransform();
		}
		/*setUsed() {
			if(this.isUsed)
				return;
			this.isUsed = true;
			if(this.parent)
				this.parent.setUsed();
			if(!this.hLocalTrans)
				this.reset();
			if(this.parent)
				this.updateGlobalTrans(this.parent);
		}*/
		draw(pipeline: IRenderPipeline, skeleton: Node[], transform: Handle, shaderValues: any) {
			if(this.hide)
				return;				
			var mesh = this.mesh;
			var primitives = mesh.primitives;
			if(this.skin) {
				for(var i = 0; i < primitives.length; i++)
					pipeline.addPrimitive(primitives[i], skeleton, primitives[i].material, transform, shaderValues);
			}
			else {
				var t = transform;
				if(transform > Mat3x4IdentityHandle) {
					if(this.hGlobalTrans > Mat3x4IdentityHandle) {
						t = ezasm.tempStackAlloc(Mat3x4Size);
						ezasm.mat3x4Mul(this.hGlobalTrans, transform, t);
					}
				}
				else
					t = this.hGlobalTrans;
				for(var i = 0; i < primitives.length; i++)
					pipeline.addPrimitive(primitives[i], null, primitives[i].material, t, shaderValues);
			}
		}
		traverse(preFunc: Function, postFunc: Function, checkUsed = true) {
			function t(n: Node, parent: Node) {
				//if(checkUsed && !n.isUsed)
				//	return;
				if(preFunc)
					preFunc(n, parent);
				if(n.children) {
					for(var i = 0, len = n.children.length; i < len; i++)
						t(n.children[i], n);
				}
				if(postFunc)
					postFunc(n, parent);
			}
			t(this, null);
		}
		/*reset() {
			this.delTransform();
			if(this._trs) {
				var translation = this._trs[0];
				var rotation = this._trs[1];
				var scale = this._trs[2];
				if(translation && Math.abs(translation[0]) + Math.abs(translation[1]) + Math.abs(translation[2]) > 0.000001)
					this.translation = new egl.Vec3(translation[0], translation[1], translation[2]);
				if(rotation && (Math.abs(rotation[0]) + Math.abs(rotation[1]) + Math.abs(rotation[2]) > 0.000001 || rotation[3] != 1))
					this.rotation = new egl.Quaternion(rotation[0], rotation[1], rotation[2], rotation[3]);
				if(scale && Math.abs(scale[0] - 1) + Math.abs(scale[1] - 1) + Math.abs(scale[2] - 1) > 0.000001)
					this.scale = new egl.Vec3(scale[0], scale[1], scale[2]);
				this.updateTRS();
			}
			else if(this._matrix) {
				this.hLocalTrans = ezasm.poolAllocDebug(Mat3x4Size, 1);
				var l = ezasm.handleToFloatArray(this.hLocalTrans, 12);
				l.set(this._matrix);
			}
			else {
				this.hLocalTrans = Mat3x4IdentityHandle;
			}
		}*/
		setTRS(trs: TRS){
			this.delTransform();
			var translation = trs.translation;
			var rotation = trs.rotation;
			var scale = trs.scale;
			if (translation && Math.abs(translation[0]) + Math.abs(translation[1]) + Math.abs(translation[2]) > 0.000001)
				this.translation = new Vec3(translation[0], translation[1], translation[2]);
			if (rotation && (Math.abs(rotation[0]) + Math.abs(rotation[1]) + Math.abs(rotation[2]) > 0.000001 || rotation[3] != 1))
				this.rotation = new Quaternion(rotation[0], rotation[1], rotation[2], rotation[3]);
			if (scale && Math.abs(scale[0] - 1) + Math.abs(scale[1] - 1) + Math.abs(scale[2] - 1) > 0.000001)
				this.scale = new Vec3(scale[0], scale[1], scale[2]);
			this.updateTRS();
		}
		setGlobalTrans(trans: Handle) {
			if(!trans) {
				Log.error('global trans is null');
			}
			if(trans == Mat3x4IdentityHandle) {
				if(this.hGlobalTrans > 1 && this.hGlobalTrans != this.hLocalTrans)
					ezasm.poolFree(this.hGlobalTrans);
				this.hGlobalTrans = Mat3x4IdentityHandle;
			}
			else {
				if(this.hGlobalTrans <= Mat3x4IdentityHandle)
					this.hGlobalTrans = ezasm.poolAllocDebug(Mat3x4Size, 2);
				ezasm.memcpy(this.hGlobalTrans, trans, Mat3x4Size);
			}
		}
		updateGlobalTrans(parent:Node) {
			if(parent) {
				if(parent.changed)
					this.changed = true;
				if(this.changed) {
					if(this.hGlobalTrans > 1 && this.hGlobalTrans != this.hLocalTrans)
						ezasm.poolFree(this.hGlobalTrans);
					this.hGlobalTrans = 0;
				}
				if(!this.hGlobalTrans) {
					if(parent.hGlobalTrans > Mat3x4IdentityHandle) {
						this.hGlobalTrans = ezasm.poolAllocDebug(Mat3x4Size, 3);
						ezasm.mat3x4Mul(this.hLocalTrans, parent.hGlobalTrans, this.hGlobalTrans);
					}
					else
						this.hGlobalTrans = this.hLocalTrans;
				}
			}
			else {
				this.hGlobalTrans = this.hLocalTrans;
			}
		}
		updateTRS() {
			if(this.hLocalTrans)
				return;
			this.changed = true;
			var s = this.scale;
			var t = this.translation;
			var r = this.rotation;
			if(!r && !s && !t) {
				this.hLocalTrans = Mat3x4IdentityHandle;
				return;
			}
			this.hLocalTrans = ezasm.mat3x4Identity();
			if(r)
				ezasm.mat3x4FromQuat(r.x, r.y, r.z, r.w, this.hLocalTrans);
			var l = ezasm.handleToFloatArray(this.hLocalTrans, 12);
			if(s) {
				if(s.x !== 1) {
					l[Mat3x4.Element.m11] *= s.x;
					l[Mat3x4.Element.m21] *= s.x;
					l[Mat3x4.Element.m31] *= s.x;
				}
				if(s.y !== 1) {
					l[Mat3x4.Element.m12] *= s.y;
					l[Mat3x4.Element.m22] *= s.y;
					l[Mat3x4.Element.m32] *= s.y;
				}
				if(s.z !== 1) {
					l[Mat3x4.Element.m13] *= s.z;
					l[Mat3x4.Element.m23] *= s.z;
					l[Mat3x4.Element.m33] *= s.z;
				}
			}
			if(t) {
				l[Mat3x4.Element.m14] = t.x;
				l[Mat3x4.Element.m24] = t.y;
				l[Mat3x4.Element.m34] = t.z;
			}
		}

		update(path: AnimationTargetPath, value: number[]) {
			this.delTransform();
			switch(path) {
				case AnimationTargetPath.translation:
					var t = this.translation;
					if(!t)
						this.translation = new Vec3(value[0], value[1], value[2]);
					else {
						t[0] = value[0];
						t[1] = value[1];
						t[2] = value[2];
					}
					break;
				case AnimationTargetPath.scale:
					var s = this.scale;
					if(!s)
						this.scale = new Vec3(value[0], value[1], value[2]);
					else {
						s[0] = value[0];
						s[1] = value[1];
						s[2] = value[2];
					}
					break;
				case AnimationTargetPath.rotation:
					var r = this.rotation;
					if(!r)
						this.rotation = new Quaternion(value[0], value[1], value[2], value[3]);
					else {
						r[0] = value[0];
						r[1] = value[1];
						r[2] = value[2];
						r[3] = value[3];
					}
					break;
			}
		}
	}

	export enum AnimationTargetPath {
		translation,
		rotation,
		scale,
	}

	export enum AnimationInterpolation {
		LINEAR,
		STEP,
		CATMULLROMSPLINE,
		CUBICSPLINE
	}

	export interface AnimationChannelData {
		input: number[];
		output: number[];
		valueCount: number;
		interpolation: AnimationInterpolation;
		nodeId: number;
		path: AnimationTargetPath;
		minTime?: number;
		maxTime?: number;
	}

	var tempAniBuffer = 0;
	var tempAniFloats: Float32Array;

	class AnimationChannel {
		time: number[];
		output: number[];
		count: number;
		interpolation: AnimationInterpolation;
		//curIdx: number;
		//curValue: number[];
		endTime: number;
		duration: number;
		nodeId: number;
		path: AnimationTargetPath;

		constructor(data: AnimationChannelData) {
			if(!tempAniBuffer) {
				tempAniBuffer = ezasm.staticAlloc(12 * 4);
				tempAniFloats = ezasm.handleToFloatArray(tempAniBuffer, 12);
			}
			this.time = data.input;
			this.output = data.output;
			this.count = data.valueCount;

			this.interpolation = data.interpolation;

			// runtime status thing
			this.path = data.path;
			this.nodeId = data.nodeId;
			//this.curIdx = 0;
			//this.curValue = [];
			this.endTime = this.time[this.time.length - 1];
			this.duration = this.endTime - this.time[0];
		}

		update(t: number, val: number[]) {
			var curIdx = 0;
			var time = this.time;
			if(t > this.endTime)
				t = this.endTime;
			while(curIdx < time.length - 2 && t >= time[curIdx + 1])
				curIdx++;
			var count = this.count;
			var u = Math.max(0, t - time[curIdx]) / (time[curIdx + 1] - time[curIdx]);
			var output = this.output;
			if(count == 4) {
				var idx = curIdx * count;
				for(var i = 0; i < 8; i++)
					tempAniFloats[i] = output[idx + i];
				ezasm.quatLerp(tempAniBuffer, tempAniBuffer + 16, u, tempAniBuffer + 32);
				val[0] = tempAniFloats[8];
				val[1] = tempAniFloats[9];
				val[2] = tempAniFloats[10];
				val[3] = tempAniFloats[11];
			}
			else {
				for(var j = 0; j < count; j++) {
					let idx = curIdx * count + j;
					val[j] = lerp(output[idx], output[idx + count], u);
				}
			}
		}
	}

	export interface TRS {
		translation?: number[];
		rotation?: number[];
		scale?: number[];
	}

	export class Animation {
		name: string;
		duration: number;
		private channels: AnimationChannel[];
		frames: any[];
		nodeIds: number[];
		initPos: TRS[];

		reset(nodes:Node[]) {
			var initPos = this.initPos;
			if (!initPos)
				return;
			for (var i = 0; i < initPos.length; i++){
				nodes[i].setTRS(initPos[i]);
			}
		}
		update(nodes: Node[], time: number) {
			var val = [];
			for(var i = 0, len = this.channels.length; i < len; i++) {
				var c = this.channels[i];
				c.update(time, val);
				var node = nodes[c.nodeId];
				if(node)
					node.update(c.path, val);
			}
		}
		constructor(name: string, initPos: TRS[], channels: AnimationChannelData[]) {
			this.name = name;
			this.initPos = initPos;
			this.channels = channels.map(s => new AnimationChannel(s));
			var duration = 0;
			this.channels.forEach(v => duration = Math.max(v.duration, duration));
			this.duration = duration;
			var n = this.channels.map(c => c.nodeId);
			var nodes = this.nodeIds = [];
			n.forEach(i => {
				if(nodes.indexOf(i) < 0)
					nodes.push(i);
			});
		}

		setCache() {			
			this.frames = [];
		}
	}

	export class Skin {
		joints: number[];
		jointNames: string[];
		hInvMatrix: Handle;
		bonesHandle: Handle;
		public bonesBuffer: Float32Array;

		constructor(s?: SkinData) {
            if(!s)
                return;
			this.joints = s.joints;
			this.jointNames = s.jointNames;
			this.bonesHandle = ezasm.malloc(MAX_BONE * Mat3x4Size);
			this.hInvMatrix = s.inverseMatrixhandle;
			//this.hInvMatrix = ezasm.poolAlloc(inverseBindMatrix.length * Mat3x4Size);
			this.bonesBuffer = ezasm.handleToFloatArray(this.bonesHandle, MAX_BONE * 12);
			//for(let i = 0; i < inverseBindMatrix.length; i++)
			//	ezasm.setFloatArray(this.hInvMatrix + i * 12 * 4, inverseBindMatrix[i]);
		}
		dispose() {
			ezasm.free(this.bonesHandle);
			this.hInvMatrix = 0;
			this.bonesBuffer = null;
		}
		updateBones(nodes: Node[]) {
			var joints = this.joints;
			for(var i = 0, len = joints.length; i < len; i++) {
				var t = nodes[joints[i]].hGlobalTrans;
				if (!t) {
					Log.error("skin error");
					return;
				}
				if(t == Mat3x4IdentityHandle)
					ezasm.memcpy(this.bonesHandle + i * Mat3x4Size, this.hInvMatrix + i * Mat3x4Size, Mat3x4Size);
				else
					ezasm.mat3x4Mul(this.hInvMatrix + i * Mat3x4Size, t, this.bonesHandle + i * Mat3x4Size);
			}
		}
	}

	initCall(() => {
		var count = getGL().getParameter(GL.MAX_VERTEX_UNIFORM_VECTORS);
		MAX_BONE = Math.min(120, ((count - 10) / 3) | 0);
		Log.debug(`MAX_VERTEX_UNIFORM_VECTORS: ${count} MAX_BONE: ${MAX_BONE}`);
	}, true);
}