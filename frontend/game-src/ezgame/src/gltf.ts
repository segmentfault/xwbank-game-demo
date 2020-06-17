/**
 * gltf格式的模型文件
 * @module model
 */
module gltf {
	export const enum ComponentType {
		BYTE = 5120,
		UNSIGNED_BYTE = 5121,
		SHORT = 5122,
		UNSIGNED_SHORT = 5123,
		FLOAT = 5126
	}
	export enum DataCount {
		SCALAR = 1,
		VEC2 = 2,
		VEC3 = 3,
		VEC4 = 4,
		MAT2 = 4,
		MAT3 = 9,
		MAT4 = 16
	}
	export interface Buffer {
		byteLength: number;
		uri: string;
		data: ArrayBuffer;
	}
	export interface BufferView {
		buffer: number;
		byteLength: number;
		byteOffset: number;
		byteStride: number;
		target?: number;
	}

	export interface Accessor {
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
	/*
	export interface Image {
		name: string;
		uri: string;
	}

	export interface Texture {
		name: string;
		sampler: number;
		source: number;
		path: string;
	}

	export interface TextureInfo {
		index: number;
		texCoord: number;
	}*/

	export interface PbrMetallicRoughness {
		baseColorFactor?: ez.Number4;
		baseColorTexture?: string;
		metallicFactor?: number;
		roughnessFactor?: number;
		metallicRoughnessTexture?: string;
	}

	export interface Material {
		name: string;
		shadingModel: string;
		texturePath?: string;
	}
	export interface PbrMaterial extends Material {
		pbrMetallicRoughness: PbrMetallicRoughness;
	}

	export interface StandardMaterial extends Material {
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

	export interface Mesh {
		primitives: Primitive[];
		name: string;
		weights?: number;
	}

	export interface Attribute {
		POSITION: number;
		NORMAL?: number;
		TANGENT?: number;
		JOINT?: number;
		WEIGHT?: number;
		COLOR: number[];
		TEXCOORD: number[];
	}

	export interface Primitive {
		material: number;
		mode: number;
		attributes: any;
		indices: number;
	}

	export interface Node {
		name: string;
		translation?: number[];
		rotation?: number[];
		scale?: number[];
		matrix?: number[];
		children: number[];
		mesh?: number;
		skin?: number;
	}

	export interface AnimationSampler {
		input: number;
		output: number;
		interpolation: string;
		inputData: Accessor;
		outputData: Accessor;
	}

	export class Target {
		node: number;
		path: string;
	}

	export interface Channel {
		sampler: number;
		target: Target;
	}
	
	export interface Animation {
		name: string;
		initPos?: ez.TRS[];
		samplers: AnimationSampler[];
		channels: Channel[];
	}

	export interface Scene {
		name: string;
		nodes: number[];
	}

	export interface File {
		asset: { generator: string, version: string };
		scene: number;
		buffers: Buffer[];
		bufferViews: BufferView[];
		accessors: Accessor[];
		//images: Image[];
		//textures: Texture[];
		//materials: Material[];
		materials: Material[];
		meshes: Mesh[];
		skins: ez.SkinData[];
		animations: Animation[];
		nodes: Node[];
		scenes: Scene[];
	}

	function getAccessorData(file: File, accessor: Accessor) {
		var bufferView = file.bufferViews[accessor.bufferView];
		switch(accessor.componentType) {
			case ComponentType.FLOAT:
				accessor.data = new Float32Array(file.buffers[0].data, bufferView.byteOffset, bufferView.byteLength >> 2);
				break;
			case ComponentType.SHORT:
				accessor.data = new Int16Array(file.buffers[0].data, bufferView.byteOffset, bufferView.byteLength >> 1);
				break;
			case ComponentType.UNSIGNED_SHORT:
				accessor.data = new Uint16Array(file.buffers[0].data, bufferView.byteOffset, bufferView.byteLength >> 1);
				break;
			case ComponentType.BYTE:
				accessor.data = new Int8Array(file.buffers[0].data, bufferView.byteOffset, bufferView.byteLength);
				break;
			case ComponentType.UNSIGNED_BYTE:
				accessor.data = new Uint8Array(file.buffers[0].data, bufferView.byteOffset, bufferView.byteLength);
				break;
		}
	}

	interface ModelData {
		meshes: ez.Mesh[];
		skins: ez.SkinData[];
		nodes: Node[];
		root: number;
		materials: ez.Material[];
		animations: ez.Animation[];
	}
	function createModel(data: ModelData) {
		var nodes = [];
		for(let i = 0; i < data.nodes.length; i++) {
			var n = data.nodes[i];
			if(n.matrix)
				nodes[i] = new ez.Node(n.name, null, ez.Mat3x4.fromMat4(<ez.Mat4>n.matrix, true));
			else
				nodes[i] = new ez.Node(n.name, n, null);
			if(typeof n.mesh === "number") {
				nodes[i].mesh = data.meshes[n.mesh];
				if(typeof n.skin === "number") {
					nodes[i].skin = data.skins[n.skin];
					/*let skin = data.skins[n.skin];
					if(skin.joints.length > ez.MAX_BONE) {
						Log.warn(`the skin of mesh[${n.name}] out of the max bone count. bone: ${skin.joints.length}`);
						skin.joints = skin.joints.slice(0, ez.MAX_BONE);
					}
					nodes[i].skin = new ez.Skin(skin.joints, skin.inverseMatrixhandle);*/
				}
			}
		}
		for(let i = 0; i < data.nodes.length; i++) {
			n = data.nodes[i];
			if(n.children) {
				var node = nodes[i];
				node.children = n.children.map(idx => nodes[idx]);
				node.children.forEach(t => t.parent = node);				
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
		return new ez.Model(nodes, data.root, data.animations);
	}

	var models = {};

	async function loadModel(res, texPath?:string) {
		var gl = ez.getGL();
		function createPrimitive(prim: Primitive) {
			var channels: ez.ChannelData[] = [];
			var count = 0;
			for(var k in prim.attributes) {
				var args = k.split("_");
				var semantic = args[0];
				if(semantic == "COLOR")
					continue;
				if(semantic == "TEXCOORD")
					semantic += args[1];
				var accessor = jsonFile.accessors[prim.attributes[k]];
				if(semantic == "POSITION")
					count = accessor.count;
				var channel = {
					index: 0,
					semantic: semantic,
					count: DataCount[accessor.type],
					type: accessor.componentType,
					normalized: !!accessor.normalized,
					offset: 0,
					data: accessor.data
				};
				if(semantic == "JOINTS")
					channel.type = ComponentType.UNSIGNED_BYTE;
				channels.push(<ez.ChannelData>channel);
			}
			var primitive = new ez.Primitive();
			primitive.load(channels, count, <Uint16Array>jsonFile.accessors[prim.indices].data);
			primitive.material = materials[prim.material];
			return primitive;
		}
		function createMesh(meshData: Mesh) {
			return { primitives: meshData.primitives.map(p => createPrimitive(p)) };
		}
		function createMaterial(m: Material) {
			var args = <any>m;
			switch (args.alphaMode) {
				case "OPAQUE": args.alphaMode = ez.AlphaBlendMode.Opaque; break;
				case "BLEND": args.alphaMode = ez.AlphaBlendMode.Transparent; break;
				case "ADD": args.alphaMode = ez.AlphaBlendMode.Add; break;
				default: Log.warn(`unknown alpha mode: ${args.alphaMode} material: ${m.name}`);
			}
			return ez.ShaderLib.createMaterial(m.shadingModel, args);//ez.Material.create(m.shadingModel, args);
		}
		function createAnimation(animation: gltf.Animation, nodes: Node[]) {
			var channels = animation.channels.map(v => {
				var sampler = animation.samplers[v.sampler];
				return {
					nodeId: v.target.node,
					path: <ez.AnimationTargetPath>ez.AnimationTargetPath[v.target.path],
					input: <number[]><any>sampler.inputData.data,
					output: <number[]><any>sampler.outputData.data,
					valueCount: <number>DataCount[sampler.outputData.type],
					interpolation: <ez.AnimationInterpolation>ez.AnimationInterpolation[sampler.interpolation],
				}
			});
			if(!animation.initPos){
				animation.initPos = nodes;
			}
			else{
				var initPos = animation.initPos;
				for (var i = 0; i < nodes.length; i++) {
					if(!initPos[i])
						initPos[i] = nodes[i];
				}
			}
			var ani = new ez.Animation(animation.name, animation.initPos, channels);
			if(ez.Cache3DAnimationFPS)
				ani.setCache();
			return ani;
		}

		var materials: ez.Material[] = [];
		var meshes: { primitives: ez.Primitive[] }[] = [];
		var nodes: ez.Node[] = [];
		var jsonFile: File;
		await res.loadAsync();
		jsonFile = <File>res.getData();
		if(texPath) {
			var bin = ez.getExternalRes<ArrayBuffer>(texPath + jsonFile.buffers[0].uri, ez.ResType.binary);
			await bin.loadAsync();
			jsonFile.buffers[0].data = bin.getData();
			bin.release();
		}
		else
			jsonFile.buffers[0].data = res.bin;

		var i, j;
		for(i = 0; i < jsonFile.accessors.length; i++) {
			var accessor = jsonFile.accessors[i];
			getAccessorData(jsonFile, jsonFile.accessors[i]);
			accessor.normalized = !!accessor.normalized;
		}
		if(jsonFile.skins) {
			for(i = 0; i < jsonFile.skins.length; i++) {
				let skin = jsonFile.skins[i];
				let buffer = jsonFile.accessors[skin.inverseBindMatrices].data;
				let count = buffer.length >> 4;
				skin.inverseMatrixhandle = ezasm.malloc(count * 12 * 4);
				skin.jointNames = skin.joints.map(idx => jsonFile.nodes[idx].name);
				var outBuf = ezasm.handleToFloatArray(skin.inverseMatrixhandle, count * 12);
				var idx = 0;
				for(j = 0; j < buffer.length; j += 16) {
					var m = ez.Mat3x4.fromMat4(<any>new Float32Array(buffer.buffer, buffer.byteOffset + j * 4, 16), true);
					outBuf.set(m, idx);
					idx += 12;
				}
			}
		}
		if(jsonFile.animations) {
			for(i = 0; i < jsonFile.animations.length; i++) {
				var ani = jsonFile.animations[i];
				ani.samplers.forEach(v => {
					v.inputData = jsonFile.accessors[v.input];
					v.outputData = jsonFile.accessors[v.output];
				});
			}
		}
		for(let i = 0; i < jsonFile.materials.length; i++) {
			//materials.push(createMaterial(jsonFile.materials[i], jsonFile.textures));
			if(texPath)
				jsonFile.materials[i].texturePath = texPath;
			materials.push(createMaterial(jsonFile.materials[i]));
		}
		for(let i = 0; i < jsonFile.meshes.length; i++) {
			meshes.push(createMesh(jsonFile.meshes[i]));
		}
		for(let i = 0; i < jsonFile.nodes.length; i++) {
			let n = jsonFile.nodes[i];
			if(typeof n.mesh === "number" && typeof n.skin === "number") {
				let mesh = meshes[n.mesh];
				let s = jsonFile.skins[n.skin];
				let skin = new ez.Skin(s);
				for(let j = 0; j < mesh.primitives.length; j++) {
					mesh.primitives[j].skin = skin;
					if(skin.joints.length > ez.MAX_BONE)
						mesh.primitives[j].splitSkin(ez.MAX_BONE);
				}
			}
		}
		var animations = jsonFile.animations ? jsonFile.animations.map(v => createAnimation(v, jsonFile.nodes)) : [];
		return { meshes: meshes, nodes: jsonFile.nodes, skins: jsonFile.skins, root: jsonFile.scenes[jsonFile.scene].nodes[0], animations: animations, materials: materials };
	}

	export async function load(name: string, onFinish, onError) {
		if(models[name]) {
			if(models[name].then)
				models[name].then(r => {
					models[name] = r;
					onFinish(createModel(r));
				});
			else
				onFinish(createModel(models[name]));
			return;
		}
		try {
			if(name.substring(0, 4) == "http") {
				let res = ez.getExternalRes(name, ez.ResType.json);
				let texPath = name.substring(0, name.lastIndexOf('/') + 1);
				let m = await loadModel(res, texPath);
				onFinish(createModel(m));
			}
			else {
				let res = ez.getRes(name);
				if(!res) {
					onError(`${name} is not exist.`);
					return;
				}
				models[name] = loadModel(res);
				models[name].then(function (r) {
					models[name] = r;
					onFinish(createModel(r));
				});
			}
		}
		catch(e) {
			onError(e.message);
		}
	}
}

