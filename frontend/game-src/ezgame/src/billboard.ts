/// <reference path="mesh.ts"/>
/// <reference path="model.ts"/>
/**
 * @module model
 */
namespace ez {
	var mesh;
	var crossMesh;

	function initMesh() {
		if(mesh)
			return;
		mesh = new Primitive();
		mesh.load([{
			index: 0,
			semantic: "POSITION",
			count: 3,
			type: gltf.ComponentType.FLOAT,
			normalized: false,
			offset: 0,
			data: new Float32Array([-0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0])
		},
		{
			index: 0,
			semantic: "TEXCOORD0",
			count: 2,
			type: gltf.ComponentType.FLOAT,
			normalized: false,
			offset: 0,
			data: new Float32Array([0, 0, 0, 1, 1, 1, 1, 0])
		}], 4, new Uint16Array([0, 1, 2, 2, 3, 0]));
	}

	function initCrossMesh() {
		if(crossMesh)
			return;
		crossMesh = new Primitive();
		crossMesh.load([{
			index: 0,
			semantic: "POSITION",
			count: 3,
			type: gltf.ComponentType.FLOAT,
			normalized: false,
			offset: 0,
			data: new Float32Array([-0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0,
				-0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, -0.5, 0.5, 0, 0.5])
		},
		{
			index: 0,
			semantic: "TEXCOORD0",
			count: 2,
			type: gltf.ComponentType.FLOAT,
			normalized: false,
			offset: 0,
			data: new Float32Array([0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0])
		}],
			8, new Uint16Array([0, 1, 2, 2, 3, 0, 2, 1, 0, 0, 3, 2, 4, 5, 6, 6, 7, 4, 6, 5, 4, 4, 7, 6]));
	}
	export const enum BillboardType {
		Eye,
		AxisY,
		None
	}
	/**
	 * 公告板对象
	 */
	export class Billboard extends Renderable {
		material: Material;
		position: Vec3;
		target: Renderable;
		type = BillboardType.Eye;

		constructor(material: Material) {
			super();
			initMesh();
			this.material = material;
		}
		linkTo(target: Renderable) {
			this.target = target;
		}
		draw(pipeline: IRenderPipeline) {
			var transform = copyMat3x4TempStack(this.transform.value);
			if(this.type == BillboardType.Eye) {
				var camera = pipeline.camera;
				if(!camera.hViewTranspose) {
					camera.hViewTranspose = ezasm.poolAlloc(Mat3x4Size);
					ezasm.handleToFloatArray(camera.hViewTranspose, 12).set(Mat3x4.fromMat4(pipeline.camera.view, true));
				}
				ezasm.mat3x4Mul(transform, camera.hViewTranspose, transform);
				//transform = Mat3x4.mul(this.transform.value, camera.viewTranspose);
			}
			/*else if(this.type == BillboardType.None) {
				transform = Mat3x4.clone(this.transform.value);
			}*/
			if(this.position) {
				var p = this.position;
				var v = ezasm.handleToFloatArray(transform, 12);
				v[Mat3x4.Element.m14] += p.x;
				v[Mat3x4.Element.m24] += p.y;
				v[Mat3x4.Element.m34] += p.z;
				//ezasm.mat3x4AppendTranslate(transform, p.x, p.y, p.z);
			}
			//Mat3x4.append(transform, Mat3x4.translate(this.position.x, this.position.y, this.position.z));

			if(this.target && this.target.transform)
				ezasm.mat3x4Mul(transform, copyMat3x4TempStack(this.target.transform.value), transform);
				//Mat3x4.append(transform, this.target.transform.value);
			pipeline.addPrimitive(mesh, null, this.material, transform, this.shaderValues);
		}
	}
	
	export class CrossMesh extends Renderable {
		material: Material;
		dimension: Vec3;

		constructor(material: Material) {
			super();
			initCrossMesh();
			this.material = material;
		}

		draw(pipeline: IRenderPipeline) {
			var transform = copyMat3x4TempStack(this.transform.value);
			if(this.dimension) {
				var v = ezasm.handleToFloatArray(transform, 12);
				var x = this.dimension.x;
				v[Mat3x4.Element.m11] *= x;
				v[Mat3x4.Element.m21] *= x;
				v[Mat3x4.Element.m31] *= x;
				var y = this.dimension.y;
				v[Mat3x4.Element.m12] *= y;
				v[Mat3x4.Element.m22] *= y;
				v[Mat3x4.Element.m32] *= y;
				var z = this.dimension.z;
				v[Mat3x4.Element.m13] *= z;
				v[Mat3x4.Element.m23] *= z;
				v[Mat3x4.Element.m33] *= z;
				//transform = Mat3x4.append(Mat3x4.scale(this.dimension.x, this.dimension.y, this.dimension.z), transform);
			}
			pipeline.addPrimitive(crossMesh, null, this.material, transform, this.shaderValues);
		}
	}

}