/**
 * @module model
 */
namespace ez {
	const enum ComponentType {
		BYTE = 1,
		UNSIGNED_BYTE = 2,
		SHORT = 3,
		UNSIGNED_SHORT = 4,
		FLOAT = 5
	}
	const enum StoreType {
		Raw,
		Byte,
		Short,
		Normal
	}
	const enum DataType {
		SCALAR = 1,
		VEC2 = 2,
		VEC3 = 3,
		VEC4 = 4,
		MAT2 = 4,
		MAT3 = 9,
		MAT4 = 16
	}

	interface Accessor {
		type: ComponentType;
		count: number;
		normalized: boolean;
		data: Float32Array | Int16Array | Int8Array;
	}
	interface MaterialData {
		//name: string;
		//shadingModel: string;
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
	/*
	interface SkinData {
		joints: number[];
		skeleton: number;
		inverseMatrixhandle: Handle;
		//inverseBindMatrix: Mat3x4[];
	}*/
	interface NodeData {
		name: string;
		trs: TRS;
		matrix: number[];
		children: number[];
		mesh?: number;
		skin?: number;
	}

	interface ModelData {
		root: number;
		meshes: Mesh[];
		nodes: NodeData[];
		skins: SkinData[];
		animations: Animation[];
	}

	function createMaterialV1(shader: string, alphaMode: number, diffuseMap: string, normalMap: string,
		specularMap: string, occlusionMap: string, reflectMap: string, emissiveMap: string,
		diffuseFactor: number[], opacity: number, specularLevel: number, shininess: number, extras: any) {
		var args = <any>{};
		args.shadingModel = "standard";
		args.alphaMode = alphaMode;
		if(diffuseMap)
			args.diffuseMap = diffuseMap;
		if(normalMap)
			args.normalMap = normalMap;
		if(specularMap)
			args.specularMap = specularMap;
		if(occlusionMap)
			args.occlusionMap = occlusionMap;
		if(reflectMap)
			args.reflectMap = reflectMap;
		if(emissiveMap)
			args.emissiveMap = emissiveMap;
		args.diffuseFactor = diffuseFactor;
		args.specularLevel = specularLevel;
		args.shininess = shininess;
		args.extras = extras;
		if(alphaMode == AlphaBlendMode.Transparent)
			args.opacity = opacity;
		return args;
	}

	function createMaterialV2(shadingModel: string, name: string, args: any) {
		args.name = name;
		args.shadingModel = shadingModel;
		return args;
	}

	var componentTypes;
	function createAccessor(storeType: StoreType, componentType: ComponentType, type: DataType, count: number, normalized: number,
							dataPos: number, scalePos: number, offsetPos: number, buffer: ArrayBuffer): Accessor {
		var output;
		if(storeType == StoreType.Raw) {
			switch(componentType) {
				case ComponentType.BYTE: output = new Int8Array(buffer, dataPos, count * type); break;
				case ComponentType.UNSIGNED_BYTE: output = new Uint8Array(buffer, dataPos, count * type); break;
				case ComponentType.SHORT: output = new Int16Array(buffer, dataPos, count * type); break;
				case ComponentType.UNSIGNED_SHORT: output = new Uint16Array(buffer, dataPos, count * type); break;
				case ComponentType.FLOAT: output = new Float32Array(buffer, dataPos, count * type); break;
			}
		}
		else if(storeType == StoreType.Byte) {
		}
		else if(storeType == StoreType.Short) {
			let input = new Uint16Array(buffer, dataPos);
			var scale = new Float32Array(buffer, scalePos);
			var offset = new Float32Array(buffer, offsetPos);
			output = new Float32Array(count * type);
			var idx = 0;
			for(var i = 0; i < count; i++) {
				for(var j = 0; j < type; j++) {
					output[idx] = input[idx] * scale[j] + offset[j];
					idx++;
				}
			}
		}
		else if(storeType == StoreType.Normal) {
			let input = new Int16Array(buffer, dataPos);
			output = new Float32Array(count * type);
			for(var i = 0; i < count; i++) {
				var x = input[i * 2] * (1 / 32767);
				var y = input[i * 2 + 1];
				var sign = y & 1;
				y = (y >> 1) * (1 / 16383);
				var z = sign ? -Math.sqrt(1 - x * x - y * y) : Math.sqrt(1 - x * x - y * y);
				output[i * 3] = x;
				output[i * 3 + 1] = y;
				output[i * 3 + 2] = z;
			}
		}
		return {
			type: componentTypes[componentType],
			count: type,
			normalized: !!normalized,
			data: output,
		}
	}

	function createPrimitive(material: number, attributes: [number, any[]][], indices: [number, number], buffer: ArrayBuffer, materials: Material[]) {
		if(!componentTypes) {
			componentTypes = [];
			componentTypes[ComponentType.BYTE] = GL.BYTE;
			componentTypes[ComponentType.FLOAT] = GL.FLOAT;
			componentTypes[ComponentType.SHORT] = GL.SHORT;
			componentTypes[ComponentType.UNSIGNED_BYTE] = GL.UNSIGNED_BYTE;
			componentTypes[ComponentType.UNSIGNED_SHORT] = GL.UNSIGNED_SHORT;
		}
		var channels: ChannelData[] = [];
		var count = 0;
		for(var i = 0; i < attributes.length; i++) {
			var semantic = SemanticIndex[attributes[i][0]];
			var args = attributes[i][1];
			var accessor = createAccessor(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], buffer);
			if(semantic == "POSITION")
				count = args[3];
			var channel = {
				index: 0,
				semantic: semantic,
				count: accessor.count,
				type: accessor.type,
				normalized: accessor.normalized,
				offset: 0,
				data: <Float32Array|Int8Array>accessor.data
			};
			channels.push(channel);
		}
		var primitive = new Primitive();
		primitive.load(channels, count, new Uint16Array(buffer, indices[0], indices[1]));
		primitive.material = materials[material];
		return primitive;
	}

	function createMesh(prims: any[], buffer: ArrayBuffer, materials: Material[]) {
		return { primitives: prims.map(p => createPrimitive(p[0], p[1], p[2], buffer, materials)) };
	}
	function createSkin(joints: number[], offset: number, skeleton: number, buffer: ArrayBuffer) {
		//var inverseBindMatrixData = [];
		/*for(let i = 0; i < joints.length; i++) {
			inverseBindMatrixData.push(new Float32Array(buffer, offset + i * 12 * 4, 12));
		}*/
		var size = joints.length * 12 * 4;
		var inverseMatrixhandle = ezasm.poolAlloc(size);
		var buf = ezasm.handleToByteArray(inverseMatrixhandle, size);
		buf.set(new Uint8Array(buffer, offset, size), 0);
		return { joints: joints, inverseMatrixhandle: inverseMatrixhandle, skeleton: skeleton };
	}

	function createNode(name: string, translation: number, rotation: number, scale: number, matrix: number, children: number[],
		mesh: number, skin: number, buffer: ArrayBuffer) {
		function readFloats(offset: number, count: number) {
			if(offset < 0)
				return null;
			var b = new Float32Array(buffer, offset);
			if(count == 3)
				return [b[0], b[1], b[2]];
			else
				return [b[0], b[1], b[2], b[3]];
		}
		return {
			name: name,
			trs: { translation: readFloats(translation, 3), rotation: readFloats(rotation, 4), scale: readFloats(scale, 3) },
			matrix: null,
			children: children,
			mesh: mesh,
			skin: skin
		};
	}

	function createAnimation(name: string, timelines: number[][], channels: any[], initPos: TRS[], nodes: NodeData[], buffer: ArrayBuffer) {
		var times = timelines.map(t => {
			return {
				minT: t[2],
				maxT: t[3],
				data: <any>new Float32Array(buffer, t[1], t[0])
			}
		});
		if(!initPos)
			initPos = nodes.map(n => n.trs);
		else{
			for (var i = 0; i < nodes.length; i++) {
				var trs = initPos[i];
				if (!trs)
					initPos[i] = nodes[i].trs;
				else
					initPos[i] = { translation: trs[0], rotation: trs[1], scale: trs[2] };
			}
		}
		var ani = new Animation(name, initPos, channels.map(c => {
			var data = c[3];
			var timeline = times[c[2]];
			return {
				nodeId: c[0],
				path: c[1],
				minT: timeline.minT,
				maxT: timeline.maxT,
				input: timeline.data,
				output: <any>new Float32Array(buffer, data[2], data[1] * data[0]),
				valueCount: data[1],
				interpolation: AnimationInterpolation.LINEAR
			}
		}));
		if(Cache3DAnimationFPS)
			ani.setCache();
		return ani;
	}

	function utf8Decode(bytes: Uint8Array): string {
		var str = "";
		var j = 0;
		var cnt = bytes.length;
		while(j < cnt) {
			var b1 = bytes[j++] & 0xFF;
			if(b1 <= 0x7F)
				str += String.fromCharCode(b1);
			else {
				var pf = 0xC0;
				var bits = 5;
				do {
					var mask = (pf >> 1) | 0x80;
					if((b1 & mask) === pf) break;
					pf = (pf >> 1) | 0x80;
					--bits;
				} while(bits >= 0);

				if(bits <= 0)
					throw new Error("Invalid UTF8 char");
				var code = (b1 & ((1 << bits) - 1));
				for(var i = 5; i >= bits; --i) {
					var bi = bytes[j++];
					if((bi & 0xC0) != 0x80) {
						throw new Error("Invalid UTF8 char");
					}
					code = (code << 6) | (bi & 0x3F);
				}
				if(code >= 0x10000)
					str += String.fromCharCode((((code - 0x10000) >> 10) & 0x3FF) | 0xD800, (code & 0x3FF) | 0xDC00);
				else
					str += String.fromCharCode(code);
			}
		}
		return str;
	}

	function createModel(model: ModelData) {
		var nodes:Node[] = [];
		for(let i = 0; i < model.nodes.length; i++) {
			var n = model.nodes[i];
			if(n.matrix)
				nodes[i] = new Node(n.name, null, Mat3x4.fromMat4(<Mat4>n.matrix, true));
			else
				nodes[i] = new Node(n.name, n.trs, null);
			if(typeof n.mesh === "number") {
				nodes[i].mesh = model.meshes[n.mesh];
				if(typeof n.skin === "number") {
					nodes[i].skin = model.skins[n.skin];
				/*	let skin = model.skins[n.skin];
					if(skin.joints.length > egl.MAX_BONE) {
						Log.warn(`the skin of mesh[${n.name}] out of the max bone count. bone: ${skin.joints.length}`);
						skin.joints = skin.joints.slice(0, egl.MAX_BONE);
					}
					nodes[i].skin = new egl.Skin(skin.joints, skin.inverseMatrixhandle);**/
				}
			}
		}
		for(let i = 0; i < model.nodes.length; i++) {
			n = model.nodes[i];
			if(n.children) {
				var node = nodes[i];
				node.children = n.children.map(idx => nodes[idx]);
				node.children.forEach(n => n.parent = node);
			}
		}
		//for(let i = 0; i < nodes.length; i++) {
		//	var node = nodes[i];
		//	if(node.mesh)
		//		node.setUsed();
		//	if(node.skin) {
		//		var joints = node.skin.joints;
		//		for(let j = 0; j < joints.length; j++)
		//			nodes[joints[j]].setUsed();
		//	}
		//}
		return new Model(nodes, model.root, model.animations);
	}

	function readModelFile(buffer: ArrayBuffer, texPath?: string): ModelData {
		var data = new DataView(buffer);
		var sig = data.getInt32(0, true);
		var ver = data.getInt32(4, true);
		var len = data.getInt32(8, true);
		var buff = buffer.slice(12, len + 12);
		var json = JSON.parse(utf8Decode(new Uint8Array(buffer, len + 12, buffer.byteLength - len - 12)));
		var model = <ModelData>{};
		var i;
		var materials = json[1].map(v => {
			var args;
			if(ver == 1)
				args = createMaterialV1.apply(null, v);
			else
				args = createMaterialV2.apply(null, v);
			if(texPath)
				args.texturePath = texPath;
			return ShaderLib.createMaterial(args.shadingModel, args);
		});
		model.root = json[0];
		model.meshes = json[2].map(m => createMesh(m, buff, materials));
		model.skins = json[3].map(s => createSkin(s[0], s[1], s[2], buff));
		model.nodes = json[4].map(n => createNode(n[0], n[1], n[2], n[3], n[4], n[5], n[6], n[7], buff));
		model.animations = json[5].map(a => createAnimation(a[0], a[1], a[2], a[3], model.nodes, buff));
		for (i = 0; i < model.skins.length; i++) {
			let skin = model.skins[i];
			skin.jointNames = skin.joints.map(idx => model.nodes[idx].name);
		}
		for(i = 0; i < model.nodes.length; i++) {
			let n = model.nodes[i];
			if(typeof n.mesh === "number" && typeof n.skin === "number") {
				let mesh = model.meshes[n.mesh];
				let s = model.skins[n.skin];
				let skin = new Skin(s);
				for(let j = 0; j < mesh.primitives.length; j++) {
					mesh.primitives[j].skin = skin;
					if(skin.joints.length > MAX_BONE)
						mesh.primitives[j].splitSkin(MAX_BONE);
				}
			}
		}
		return model;
	}

	var models = {};

	export module modelFile {
		export async function load(name: string, onFinish, onError) {
			if(name.substring(0, 4) == "http") {
				try {
					let res = getExternalRes<ArrayBuffer>(name, ResType.binary);
					await res.loadAsync();
					let data = res.getData();
					let texPath = name.substring(0, name.lastIndexOf('/') + 1);
					let modelData = readModelFile(data, texPath);
					onFinish(createModel(modelData));
				}
				catch(e) {
					onError(e);
				}
			}
			else {
				if(models[name]) {
					onFinish(createModel(models[name]));
					return;
				}
				let res = getRes<ArrayBuffer>(name);
				try {
					await res.loadAsync();
					if(models[name]) {
						onFinish(createModel(models[name]));
						return;
					}
					let data = res.getData();
					let modelData = readModelFile(data);
					models[name] = modelData;
					res.release();
					onFinish(createModel(modelData));
				}
				catch(e) {
					onError(e);
				}
			}
		}
	}
}