/**
 * @module model
 */
namespace ez {
	const JOINT_NULL = 0xff;

	export enum SemanticIndex {
		POSITION = 0,
		NORMAL = 1,
		JOINTS = 2,
		WEIGHTS = 3,
		TANGENT = 4,
		TEXCOORD0 = 5,
		TEXCOORD1 = 6
	}

	export interface ChannelData {
		index: number;
		semantic: string;
		count: number;
		type: number;
		normalized: boolean;
		offset: number;
		data: Float32Array | Int8Array | Int16Array;
	}

	function type2Size(type, gl: WebGLRenderingContext) {
		switch(type) {
			case GL.FLOAT: return 4;
			case GL.BYTE: case GL.UNSIGNED_BYTE: return 1;
			case GL.SHORT: case GL.UNSIGNED_SHORT: return 2;
		}
		return 0;
	}

	export interface SkinData {
		joints: number[];
		jointNames: string[];
		inverseBindMatrices?: number;
		skeleton?: number;
		inverseMatrixhandle: Handle;
	}

	export interface Mesh {
		primitives: Primitive[];
	}

	interface Subset {
		skin: Skin;
	}

	class TriangleSet {
		joints = new Set<number>();
		indices = new Set<number>();
		triangles: number[] = [];

		contain(i1, i2, i3): boolean {
			let indices = this.indices;
			return indices.has(i1) || indices.has(i2) || indices.has(i3);
		}

		add(idx, joints, count) {
			this.triangles.push(idx);
			this.indices.add(idx);
			for(let j = 0; j < count; j++) {
				var t = joints[idx * count + j];
				if(t != JOINT_NULL)
					this.joints.add(t);
			}
		}
		combine(s: TriangleSet) {
			var joints = this.joints;
			var indices = this.indices;
			s.joints.forEach(j => joints.add(j));
			s.indices.forEach(j => indices.add(j));
			this.triangles = this.triangles.concat(s.triangles);
		}
	}

	function find(arr: any[], pred: Function) {
		for(var i = 0; i < arr.length; i++)
			if(pred(arr[i]))
				return arr[i];
		return null;
	}

	export class Primitive {
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

		updateData() {
			var channels = this.channels;
			var vertCount = this.vertCount;
			var offset = this.stride;
			var vertices = new Float32Array(offset * vertCount);
			for(var i = 0; i < channels.length; i++) {
				var c = channels[i];
				if(c.type == GL.FLOAT) {
					var s = offset >> 2;
					let buf = new Float32Array(vertices.buffer, c.offset);
					var idx = 0;
					for(var j = 0; j < vertCount; j++) {
						for(var k = 0; k < c.count; k++)
							buf[j * s + k] = c.data[idx++];
					}
				}
				else if(c.type == GL.SHORT || c.type == GL.UNSIGNED_SHORT) {
					var s = offset >> 1;
					let buf = new Int16Array(vertices.buffer, c.offset);
					var idx = 0;
					for(var j = 0; j < vertCount; j++) {
						for(var k = 0; k < c.count; k++)
							buf[j * s + k] = c.data[idx++];
					}
				}
				else if(c.type == GL.BYTE || c.type == GL.UNSIGNED_BYTE) {
					var s = offset;
					let buf = new Int8Array(vertices.buffer, c.offset);
					var idx = 0;
					for(var j = 0; j < vertCount; j++) {
						for(var k = 0; k < c.count; k++)
							buf[j * s + k] = c.data[idx++];
					}
				}
				else {
					Log.error("unknown type:", c.type);
				}
			}
			var gl = getGL();
			gl.bindBuffer(GL.ARRAY_BUFFER, this.vbo);
			gl.bufferData(GL.ARRAY_BUFFER, vertices, GL.STATIC_DRAW);

			gl.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.ibo);
			gl.bufferData(GL.ELEMENT_ARRAY_BUFFER, this.indices, GL.STATIC_DRAW);
		}

		public load(channels: ChannelData[], vertCount: number, indices: Uint16Array) {
			var gl = getGL();
			var offset = 0;
			var i;
			var c: ChannelData;
			for(i = 0; i < channels.length; i++) {
				c = channels[i];
				c.index = SemanticIndex[c.semantic];
				//if(c.semantic == "JOINTS")
				//	this.hasSkin = true;
				if(c.semantic == "TANGENT")
					this.hasTangent = true;					
			}
			channels.sort((a, b) => a.index > b.index ? 1 : a.index == b.index ? 0 : -1);
			for(i = 0; i < channels.length; i++) {
				c = channels[i];
				var size = type2Size(c.type, gl);
				c.offset = offset;
				offset += (size * c.count + 3) & ~3;
			}
			this.channels = channels;
			this.vertCount = vertCount;
			this.idxCount = indices.length;
			this.stride = offset;
			this.indices = indices;
			var vbo = this.vbo = gl.createBuffer();
			var ibo = this.ibo = gl.createBuffer();
			this.updateData();
			var rc = <IRenderContextWGL>RenderContext;
			this.vaoBind = rc.createVAO(function (gl) {
				gl.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, ibo);
				gl.bindBuffer(GL.ARRAY_BUFFER, vbo);
				for(var i = 0; i < channels.length; i++) {
					var c = channels[i];
					gl.enableVertexAttribArray(c.index);
					gl.vertexAttribPointer(c.index, c.count, c.type, c.normalized, offset, c.offset);
				}
			});
		}

		public splitSkin(limit:number) {
			if(this.skins)
				return;
			var triangles: TriangleSet[] = [];
			var dict: TriangleSet[] = [];
			var t = Date.now();
			let indices = this.indices;
			var jointChannel: ChannelData = find(this.channels, function (a) {
				return a.semantic == "JOINTS"
			});
			var weightChannel: ChannelData = find(this.channels, function (a) {
				return a.semantic == "WEIGHTS"
			});

			var joints = new Set<number>();
			var jointsData = jointChannel.data;
			var weights = weightChannel.data;
			for(var i = 0; i < jointsData.length; i++) {
				if(weights[i] > 0)
					joints.add(jointsData[i]);
				else
					jointsData [i] = JOINT_NULL;
			}
			//if(joints.size <= limit)
			//	return;
			//var allTriCount = 0;
			for(let i = 0; i < indices.length; i += 3) {
				var set: TriangleSet;
				for(let j = 0; j < 3; j++) {
					set = dict[indices[i + j]];
					if(set)
						break;
				}
				if(!set) {
					set = new TriangleSet();
					triangles.push(set);
				}

				for(let j = 0; j < 3; j++)
					set.add(indices[i + j], jointsData, 4);

				for(let j = 0; j < 3; j++) {
					let idx = indices[i + j];
					let s = dict[idx];
					if(s && s != set) {
						let index = triangles.indexOf(s);
						if(index >= 0) {
							set.combine(s);
							s.indices.forEach(idx => dict[idx] = set);
							triangles.splice(index, 1);
							//console.log("remove", index);
						}
					}
					dict[idx] = set;
				}
			}

			var groupIdx = [0];
			var groupJoints: number[][] = [];

			function toList(set) {
				var arr = [];
				set.forEach(t => arr.push(t));
				return arr;
			}
			
			function getJoints() {
				var idx = groupIdx[groupIdx.length - 1];
				var listJoint = [];
				joints.forEach(function(t) {
					var j = { key: t, joints: new Set<Number>() };
					listJoint.push(j);
					for(let i = idx; i < triangles.length; i++) {
						var tri = triangles[i];
						if(tri.joints.has(t)) {
							tri.joints.forEach(t => j.joints.add(t));
						}
					}
				});
				listJoint.sort((t1, t2) => {
					var s1 = t1.joints.size;
					var s2 = t2.joints.size;
					return s1 > s2 ? 1 : s1 == s2 ? 0 : -1;
				});
				return listJoint;
			}

			function split() {
				if(joints.size < limit) {
					groupJoints.push(toList(joints));
					groupIdx.push(triangles.length);
					return false;
				}
				var jointsTbl = getJoints();
				var selected = [];
				var group = new Set<number>();

				jointsTbl[0].joints.forEach(t => group.add(t));
				selected.push(jointsTbl[0].key);
				let i = 1;
				while(i < jointsTbl.length) {
					var tbl = jointsTbl[i++];
					if(group.size + tbl.joints.size <= limit) {
						tbl.joints.forEach(t => group.add(t));
					}
					else {
						/*var t = new Set<number>(group);
						t.UnionWith(tbl.Value.Item1);*/
						let cnt = group.size;
						tbl.joints.forEach(t => { if(!group.has(t)) cnt++ });
						if(cnt > limit)
							continue;
						tbl.joints.forEach(t => group.add(t));
					}
					selected.push(tbl.key);
				}

				for(i = 0; i < selected.length; i++)
					joints.delete(selected[i]);

				let idx = groupIdx[groupIdx.length - 1];
				for(i = idx; i < triangles.length; i++) {
					let tri = triangles[i];
					for(let j = 0; j < selected.length; j++) {
						if(tri.joints.has(selected[j])) {
							triangles[i] = triangles[idx];
							triangles[idx++] = tri;
							/*tri.joints.forEach(t => {
								if(!group.has(t))
									console.log("not find:", tri.joints, group, t);
							});*/
							break;
						}
					}
				}
				for(i = groupIdx[groupIdx.length - 1]; i < idx; i++) {
					let tri = triangles[i];
					tri.joints.forEach(t => {
						if(!group.has(t))
							console.log("not find:", tri.joints, group, t);
					});
				}

				groupJoints.push(toList(group));
				groupIdx.push(idx);
				return true;

			}
			while(split());
			this.skins = [];
			this.groups = [0];
			var skin = this.skin;
			var invMatBuf = ezasm.handleToFloatArray(skin.hInvMatrix, skin.joints.length * 12);
			//var newIndices = new Uint16Array(this.indices.length);
			var newIndices = this.indices;
			var idx = 0;
			var j = 1;
			for(i = 0; i < triangles.length; i++) {
				if(groupIdx[j] == i) {
					this.groups.push(idx);
					j++;
				}
				let tri = triangles[i];
				let joints = groupJoints[j - 1];
				/*tri.joints.forEach(t => {
					if(joints.indexOf(t) < 0)
						console.log("not find:", j, i, t);
				});*/
				tri.indices.forEach(idx => {
					//allIndices.add(idx);
					for(let k = 0; k < 4; k++) {
						let t = idx * 4 + k;
						if(jointsData[t] == JOINT_NULL)
							jointsData[t] = 0;
						else {
							var a = joints.indexOf(jointsData[t]);
							if(a < 0) {
								console.log("not find", jointsData[t], i, t, tri);
							}
							else
								jointsData[t] = a;
						}
					}
				});
				newIndices.set(tri.triangles, idx);
				idx += tri.triangles.length;
			}
			this.groups.push(idx);

			for(i = 0; i < groupJoints.length; i++) {
				var newJoints = groupJoints[i];
				var invMatHandler = ezasm.malloc(newJoints.length * 12 * 4);
				var newMatBuf = ezasm.handleToFloatArray(invMatHandler, newJoints.length * 12);
				for(j = 0; j < newJoints.length; j++) {
					let m = invMatBuf.slice(newJoints[j] * 12, (newJoints[j] + 1) * 12);
					newMatBuf.set(m, j * 12);
				}
				
				this.skins[i] = new Skin({
					joints: newJoints.map(t => skin.joints[t]),
					jointNames: newJoints.map(t => skin.jointNames[t]),
					inverseMatrixhandle: invMatHandler
				});//newJoints.map(t => skin.joints[t]), invMatHandler);
			}
			//this.indices = newIndices;
			this.updateData();
			this.skin = null;
			console.log("split skin: %i ms, triangles:%i, triangle set:%i", Date.now() - t, indices.length / 3, triangles.length, groupIdx, groupJoints);
		}
		public remapSkin(skeleton: Node[]): Primitive {
			if (!this.skin && !this.skins) {
				Log.error("no skin data.");
				return null;
			}
			var nodeNames: any = {};
			for (var i = 0; i < skeleton.length; i++)
				nodeNames[skeleton[i].name] = i;

			function remap(skin: Skin):Skin {
				var joints = skin.jointNames.map(n => {
					var idx = nodeNames[n];
					if (idx === undefined) {
						Log.error(`the skin has not find node: ${n}`);
						idx = 0;
					}
					return idx;
				});
				var s = new Skin();
				for (var k in skin)
					s[k] = skin[k];
				s.joints = joints;
				return s;
			}
			var p:any = new Primitive();
			for (var k in this)
				p[k] = this[k];
			if (this.skin)
				p.skin = remap(this.skin);
			else
				p.skins = this.skins.map(s => remap(s));
			return p;
		}
		public draw(ctx: IRenderContext3D, skeleton: Node[]) {
			var gl = ctx.gl;
			if(ctx.lastPrimitive !== this) {
				this.vaoBind();				
				ctx.lastPrimitive = this;
			}
			if(ctx.profiler) {
				ctx.profiler.drawcall++;
				Profile.addCommand("drawcall Mesh");
				ctx.profiler.triangle += this.idxCount / 3;
			}
			if(skeleton) {
				if(this.skins) {
					for(let i = 0; i < this.skins.length; i++) {
						let skin = this.skins[i];
						skin.updateBones(skeleton);
						ctx.shader.bind("BONES", skin.bonesBuffer, true);
						gl.drawElements(GL.TRIANGLES, this.groups[i + 1] - this.groups[i], GL.UNSIGNED_SHORT, this.groups[i] * 2);
					}
					return;
				}
				else {
					let skin = this.skin;
					skin.updateBones(skeleton);
					ctx.shader.bind("BONES", skin.bonesBuffer, true);
				}
			}
			gl.drawElements(GL.TRIANGLES, this.idxCount, GL.UNSIGNED_SHORT, 0);
		}
	}
}

