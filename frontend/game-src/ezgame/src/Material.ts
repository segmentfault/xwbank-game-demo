/**
 * @module Material
 */
namespace ez {
	export var TexturePath = "texture/";

	export const enum DepthMode {
		CheckWrite = 0,
		Check = 0x10,
		Uncheck = 0x20
	}
	export enum AlphaBlendMode {
		Opaque = 0,
		Transparent = 1,
		Add = 2
	}
	function hash(s: string) {
		var h = 0;
		for (var i = 0; i < s.length; i++)
			h = ((h + s.charCodeAt(i)) * 7) & 0xffffff;
		return h & 0xffff;
	}
	export class Material {
		name: string;
		sortKey = 0;
		shaderFlags = 0;
		shaderModel: string;
		alphaMode = AlphaBlendMode.Opaque;
		depthMode = DepthMode.CheckWrite;
		uniforms: Dictionary<any> = {};
		dynamicUniforms: string[] = [];
		textures: { name: string, texture: Texture }[] = [];
		skip: boolean;

		constructor(name: string, shader: string) {
			this.name = name;
			this.shaderModel = shader;
		}

		setTexture(name: string, args: any, flag: number) {
			var t = args[name];
			var extPath = args.texturePath;
			if (t) {
				var r;
				if (extPath)
					r = getExternalRes(extPath + t, ResType.texture);
				else {
					var idx = t.lastIndexOf('.');
					r = getRes<Texture>(TexturePath + (idx > 0 ? t.substring(0, idx) : t));
				}
				if (r.state == ResState.Unload)
					r.load();
				this.textures.push({ name: name, texture: r.getData() });
				this.shaderFlags |= flag;
				this.sortKey |= hash(r.id);
			}
		}
	}	
}