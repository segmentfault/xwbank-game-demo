namespace ez {

	export class Camera {
		eye: Vec3;
		dir: Vec3;
		up: Vec3;

		view: Mat4;
		projection: Mat4;
		viewProj: Mat4;
		hViewTranspose: Handle;
		//viewTransposeHandle: Mat3x4;
		changed: boolean;

		constructor() {
			this.eye = new Vec3(0, 0, 0);
			this.dir = new Vec3(1, 0, 0);
			this.up = new Vec3(0, 1, 0);
		}

		update() {
			this.changed = true;
			if(this.hViewTranspose) {
				ezasm.poolFree(this.hViewTranspose);
				this.hViewTranspose = 0;
			}
			
			//this.viewTranspose = null;
			this.view = Mat4.cameraView(this.eye, this.dir, this.up);
		}
	}

	export class OrthoCamera extends Camera {
		width: number;
		height: number;
		zNear: number;
		zFar: number;

		constructor(w: number, h: number, zn: number, zf: number) {
			super();
			this.width = w;
			this.height = h;
			this.zNear = zn;
			this.zFar = zf;
		}

		update() {
			super.update();
			this.projection = Mat4.ortho(this.width, this.height, this.zNear, this.zFar);
			this.viewProj = Mat4.mul(this.view, this.projection);
		}
	}

	export class PerspectiveCamera extends Camera {
		fov: number;
		aspect: number;
		near: number;
		far: number;

		constructor(fov: number, aspect: number, near = 0.1, far = 1000) {
			super();
			this.fov = fov;
			this.aspect = aspect;
			this.near = near;
			this.far = far;
		}

		update() {
			super.update();
			this.projection = Mat4.perspective(this.fov, this.aspect, this.near, this.far);
			this.viewProj = Mat4.mul(this.view, this.projection);
		}
	}
}