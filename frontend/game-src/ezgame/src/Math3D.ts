/**
 * 向量计算库函数
 * @module math
 */
namespace ez {

	export function clamp(value: number, min: number, max: number) {
		return Math.max(min, Math.min(max, value));
	}

	export function lerp(a: number, b: number, alpha: number) {
		return a * (1 - alpha) + b * alpha;
	}

	export class Vec3 extends Array<number> {
		public get x(): number {
			return this[0];
		}
		public set x(v: number) {
			this[0] = v;
		}
		public get y(): number {
			return this[1];
		}
		public set y(v: number) {
			this[1] = v;
		}
		public get z(): number {
			return this[2];
		}
		public set z(v: number) {
			this[2] = v;
		}
		constructor(x?: number, y?: number, z?: number) {
			super(3);
			this[0] = x || 0;
			this[1] = y || 0;
			this[2] = z || 0;
		}
		public toArray(): Array<number> {
			return this;
		}
		add(v: Vec3): Vec3 {
			this[0] += v[0];
			this[1] += v[1];
			this[2] += v[2];
			return this;
		}
		sub(v: Vec3): Vec3 {
			this[0] -= v[0];
			this[1] -= v[1];
			this[2] -= v[2];
			return this;
		}
		mul(t: number): Vec3 {
			this[0] *= t;
			this[1] *= t;
			this[2] *= t;
			return this;
		}
		dot(v: Vec3): number {
			return this[0] * v[0] + this[1] * v[1] + this[2] * v[2];
		}
		cross(v: Vec3): Vec3 {
			var x = this[0];
			var y = this[1];
			var z = this[2];			
			this[0] = y * v[2] - z * v[1];
			this[1] = z * v[0] - x * v[2];
			this[2] = x * v[1] - y * v[0];
			return this;
		}
        distanceSquared(v) {
            var dx = this[0] - v[0];
			var dy = this[1] - v[1];
			var dz = this[2] - v[2];
            return dx * dx + dy * dy + dz * dz;
        }
        distance(v) {
            return Math.sqrt(this.distanceSquared(v));
		}
		min(v: Vec3): Vec3 {
			this[0] = Math.min(this[0], v[0]);
			this[1] = Math.min(this[1], v[1]);
			this[2] = Math.min(this[2], v[2]);
			return this;
		}
		max(v: Vec3): Vec3 {
			this[0] = Math.max(this[0], v[0]);
			this[1] = Math.max(this[1], v[1]);
			this[2] = Math.max(this[2], v[2]);
			return this;
		}
		normalize(): Vec3 {
			var t = 1 / Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2]);
			this[0] *= t;
			this[1] *= t;
			this[2] *= t;
			return this;
		}
		clone(): Vec3 {
			return new Vec3(this[0], this[1], this[2]);
		}
		transform(m: Mat3x4) {
			var x = this[0];
			var y = this[1];
			var z = this[2];
			this[0] = x * m[Mat3x4.Element.m11] + y * m[Mat3x4.Element.m12] + z * m[Mat3x4.Element.m13] + m[Mat3x4.Element.m14];
			this[1] = x * m[Mat3x4.Element.m21] + y * m[Mat3x4.Element.m22] + z * m[Mat3x4.Element.m23] + m[Mat3x4.Element.m24];
			this[2] = x * m[Mat3x4.Element.m31] + y * m[Mat3x4.Element.m32] + z * m[Mat3x4.Element.m33] + m[Mat3x4.Element.m34];
		}
		static min(v1: Vec3, v2: Vec3): Vec3 {
			return new Vec3(Math.min(v1[0], v2[0]), Math.min(v1[1], v2[1]), Math.min(v1[2], v2[2]));
		}
		static max(v1: Vec3, v2: Vec3): Vec3 {
			return new Vec3(Math.max(v1[0], v2[0]), Math.max(v1[1], v2[1]), Math.max(v1[2], v2[2]));
		}
		static add(v1: Vec3, v2: Vec3): Vec3 {
			return new Vec3(v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]);
		}
		static sub(v1: Vec3, v2: Vec3): Vec3 {
			return new Vec3(v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]);
		}
		static cross(v1: Vec3, v2: Vec3): Vec3 {
			return new Vec3(v1[1] * v2[2] - v1[2] * v2[1],
							v1[2] * v2[0] - v1[0] * v2[2],
							v1[0] * v2[1] - v1[1] * v2[0]);
		}
		static lerp(v1: Vec3, v2: Vec3, t: number): Vec3 {
			return new Vec3(
				(v2[0] - v1[0]) * t + v1[0],
				(v2[1] - v1[1]) * t + v1[1],
				(v2[2] - v1[2]) * t + v1[2]);
		}
		static axisX: Vec3 = new Vec3(1, 0, 0);
		static axisY: Vec3 = new Vec3(0, 1, 0);
		static axisZ: Vec3 = new Vec3(0, 0, 1);
	}

	export class Vec4 extends Array<number> {
		public get x(): number {
			return this[0];
		}
		public set x(v: number) {
			this[0] = v;
		}
		public get y(): number {
			return this[1];
		}
		public set y(v: number) {
			this[1] = v;
		}
		public get z(): number {
			return this[2];
		}
		public set z(v: number) {
			this[2] = v;
		}
		public get w(): number {
			return this[3];
		}
		public set w(v: number) {
			this[3] = v;
		}
		public toArray():Array<number> {
			return this;
		}
		constructor(x?: number, y?: number, z?: number, w?:number) {
			super(4);
			this[0] = x || 0;
			this[1] = y || 0;
			this[2] = z || 0;
			this[3] = w || 1;
		}
		static formVec3(v: Vec3): Vec4 {
			return new Vec4(v[0], v[1], v[2], 1);
		}
		transform(m: Mat4) {
			var x = this[0];
			var y = this[1];
			var z = this[2];
			var w = this[3];
			this[0] = x * m[Mat4.Element.m11] + y * m[Mat4.Element.m12] + z * m[Mat4.Element.m13] + w * m[Mat4.Element.m14];
			this[1] = x * m[Mat4.Element.m21] + y * m[Mat4.Element.m22] + z * m[Mat4.Element.m23] + w * m[Mat4.Element.m24];
			this[2] = x * m[Mat4.Element.m31] + y * m[Mat4.Element.m32] + z * m[Mat4.Element.m33] + w * m[Mat4.Element.m34];
			this[3] = x * m[Mat4.Element.m41] + y * m[Mat4.Element.m42] + z * m[Mat4.Element.m43] + w * m[Mat4.Element.m44];
		}
	}

	export class Quaternion extends Vec4 {
		static rotateX(a: number) {
			a *= 0.5;
			return new Quaternion(Math.sin(a), 0, 0, Math.cos(a));
		}
		static rotateY(a: number) {
			a *= 0.5;
			return new Quaternion(0, Math.sin(a), 0, Math.cos(a));
		}
		static rotateZ(a: number) {
			a *= 0.5;
			return new Quaternion(0, 0, Math.sin(a), Math.cos(a));
		}
		static rotateAxis(axis:Vec3, a:number) {
			a *= 0.5;
			var s = Math.sin(a);
			return new Quaternion(axis.x * s, axis.y * s, axis.z * s, Math.cos(a));
		}
		clone(): Quaternion {
			return new Quaternion(this.x, this.y, this.z, this.w);
		}
		isZero() {
			return this.x === 0 && this.y === 0 && this.z === 0 && this.w === 1;
		}
		mul(q: Quaternion): Quaternion {
			var x = this[0];
			var y = this[1];
			var z = this[2];
			var w = this[3];
			this[0] = w * q[0] + x * q[3] + y * q[2] - z * q[1];
			this[1] = w * q[1] + y * q[3] + z * q[0] - x * q[2];
			this[2] = w * q[2] + z * q[3] + x * q[1] - y * q[0];
			this[3] = w * q[3] - x * q[0] - y * q[1] - z * q[2];
			return this;
		}
		static lerp(v1: Quaternion, v2: Quaternion, t: number): Quaternion {
			return new Quaternion(
				(v2.x - v1.x) * t + v1.x,
				(v2.y - v1.y) * t + v1.y,
				(v2.z - v1.z) * t + v1.z,
				(v2.w - v1.w) * t + v1.w);
		}
		static slerp(v1: Quaternion, v2: Quaternion, t: number): Quaternion {
			// benchmarks:
			//    http://jsperf.com/quaternion-slerp-implementations
			let ax = v1.x, ay = v1.y, az = v1.z, aw = v1.w;
			let bx = v2.x, by = v2.y, bz = v2.z, bw = v2.w;
			let omega, cosom, sinom, scale0, scale1;
			// calc cosine
			cosom = ax * bx + ay * by + az * bz + aw * bw;
			// adjust signs (if necessary)
			if(cosom < 0) {
				cosom = -cosom;
				bx = -bx;
				by = -by;
				bz = -bz;
				bw = -bw;
			}
			// calculate coefficients
			if((1 - cosom) > 0.000001) {
				// standard case (slerp)
				omega = Math.acos(cosom);
				sinom = Math.sin(omega);
				scale0 = Math.sin((1 - t) * omega) / sinom;
				scale1 = Math.sin(t * omega) / sinom;
			} else {
				// "from" and "to" quaternions are very close
				//  ... so we can do a linear interpolation
				scale0 = 1 - t;
				scale1 = t;
			}
			return new Quaternion(scale0 * ax + scale1 * bx,
								  scale0 * ay + scale1 * by,
								  scale0 * az + scale1 * bz,
								  scale0 * aw + scale1 * bw);
		}
		static mul(p: Quaternion, q: Quaternion): Quaternion {
			return new Quaternion(p.w * q[0] + p.x * q[3] + p.y * q[2] - p.z * q[1],
								  p.w * q[1] + p.y * q[3] + p.z * q[0] - p.x * q[2],
								  p.w * q[2] + p.z * q[3] + p.x * q[1] - p.y * q[0],
								  p.w * q[3] - p.x * q[0] - p.y * q[1] - p.z * q[2]);
		}
	}

	export type Mat3x4 = [number, number, number, number,
						  number, number, number, number,
						  number, number, number, number];

	export type Mat4 = [number, number, number, number,
						number, number, number, number,
						number, number, number, number,
						number, number, number, number];

	export type Mat3 = [number, number, number,
						number, number, number,
						number, number, number];

	export module Mat3 {
		export const enum Element {
			m11, m12, m13,
			m21, m22, m23,
			m31, m32, m33,
		}
	}

	export module Mat3x4 {
		export const enum Element {
			m11, m12, m13, m14,
			m21, m22, m23, m24,
			m31, m32, m33, m34,
		}
		export var identity: Mat3x4 = [ 1, 0, 0, 0,
										0, 1, 0, 0,
										0, 0, 1, 0];

		export function makeIdentity(): Mat3x4 {
			return [1, 0, 0, 0,
					0, 1, 0, 0,
					0, 0, 1, 0];
		}

		export function rotateX(a): Mat3x4 {
			var c = Math.cos(a);
			var s = Math.sin(a);
			return [1, 0, 0, 0,
					0, c,-s, 0,
					0, s, c, 0];
		}
		export function rotateY(a: number): Mat3x4 {
			var c = Math.cos(a);
			var s = Math.sin(a);
			return [c, 0, s, 0,
					0, 1, 0, 0,
				   -s, 0, c, 0];
		}
		export function rotateZ(a: number): Mat3x4 {
			var c = Math.cos(a);
			var s = Math.sin(a);
			return [c,-s, 0, 0,
					s, c, 0, 0,
					0, 0, 1, 0];
		}
		export function translate(x: number, y: number, z: number): Mat3x4 {
			return [1, 0, 0, x,
					0, 1, 0, y,
					0, 0, 1, z];
		}
		export function scale(sx: number, sy: number, sz: number): Mat3x4 {
			return [sx, 0, 0, 0,
					0, sy, 0, 0,
					0, 0, sz, 0];
		}
		export function clone(m: Mat3x4): Mat3x4 {
			return <Mat3x4>m.concat();
		}
		export function transpose(m: Mat3x4): Mat3x4 {
			return [m[Element.m11], m[Element.m21], m[Element.m31], 0,
					m[Element.m12], m[Element.m22], m[Element.m32], 0,
					m[Element.m13], m[Element.m23], m[Element.m33], 0];
		}
		export function fromQuaternion(q: Quaternion, result?: Mat3x4): Mat3x4 {
			// Quaternion math
			let x = q[0], y = q[1], z = q[2], w = q[3];

			let x2 = x + x;
			let y2 = y + y;
			let z2 = z + z;

			let xx = x * x2;
			let xy = x * y2;
			let xz = x * z2;
			let yy = y * y2;
			let yz = y * z2;
			let zz = z * z2;
			let wx = w * x2;
			let wy = w * y2;
			let wz = w * z2;

			if(!result) {
				result = [1 - (yy + zz), xy - wz, xz + wy, 0,
						  xy + wz, 1 - (xx + zz), yz - wx, 0,
						  xz - wy, yz + wx, 1 - (xx + yy), 0];
			}
			else {
				result[0] = 1 - (yy + zz);	result[1] = xy - wz;		result[2] = xz + wy;		result[3] = 0;
				result[4] = xy + wz;		result[5] = 1 - (xx + zz);	result[6] = yz - wx;		result[7] = 0;
				result[8] = xz - wy;		result[9] = yz + wx;		result[10] = 1 - (xx + yy);	result[11] = 0;
			}
			return result;
		}

		export function fromMat4(m: Mat4, transpose: boolean, result?: Mat3x4): Mat3x4 {
			if(!result)
				result = <Mat3x4><any>new Array(12);
			if(!transpose) {
				for(var i = 0; i < 12; i++)
					result[i] = m[i];
			}
			else {
				result[Mat4.Element.m11] = m[Mat4.Element.m11];
				result[Mat4.Element.m12] = m[Mat4.Element.m21];
				result[Mat4.Element.m13] = m[Mat4.Element.m31];
				result[Mat4.Element.m14] = m[Mat4.Element.m41];

				result[Mat4.Element.m21] = m[Mat4.Element.m12];
				result[Mat4.Element.m22] = m[Mat4.Element.m22];
				result[Mat4.Element.m23] = m[Mat4.Element.m32];
				result[Mat4.Element.m24] = m[Mat4.Element.m42];

				result[Mat4.Element.m31] = m[Mat4.Element.m13];
				result[Mat4.Element.m32] = m[Mat4.Element.m23];
				result[Mat4.Element.m33] = m[Mat4.Element.m33];
				result[Mat4.Element.m34] = m[Mat4.Element.m43];
			}
			return result;
		}

		/**
		 * m2 * m1 * v
		 */
		export function append(m1: Mat3x4, m2: Mat3x4) {
			var t1 = m1[Element.m11];
			var t2 = m1[Element.m21];
			var t3 = m1[Element.m31];
			m1[Element.m11] = t1 * m2[Element.m11] + t2 * m2[Element.m12] + t3 * m2[Element.m13];
			m1[Element.m21] = t1 * m2[Element.m21] + t2 * m2[Element.m22] + t3 * m2[Element.m23];
			m1[Element.m31] = t1 * m2[Element.m31] + t2 * m2[Element.m32] + t3 * m2[Element.m33];
			
			t1 = m1[Element.m12];
			t2 = m1[Element.m22];
			t3 = m1[Element.m32];
			m1[Element.m12] = t1 * m2[Element.m11] + t2 * m2[Element.m12] + t3 * m2[Element.m13];
			m1[Element.m22] = t1 * m2[Element.m21] + t2 * m2[Element.m22] + t3 * m2[Element.m23];
			m1[Element.m32] = t1 * m2[Element.m31] + t2 * m2[Element.m32] + t3 * m2[Element.m33];

			t1 = m1[Element.m13];
			t2 = m1[Element.m23];
			t3 = m1[Element.m33];
			m1[Element.m13] = t1 * m2[Element.m11] + t2 * m2[Element.m12] + t3 * m2[Element.m13];
			m1[Element.m23] = t1 * m2[Element.m21] + t2 * m2[Element.m22] + t3 * m2[Element.m23];
			m1[Element.m33] = t1 * m2[Element.m31] + t2 * m2[Element.m32] + t3 * m2[Element.m33];

			t1 = m1[Element.m14];
			t2 = m1[Element.m24];
			t3 = m1[Element.m34];
			m1[Element.m14] = t1 * m2[Element.m11] + t2 * m2[Element.m12] + t3 * m2[Element.m13] + m2[Element.m14];
			m1[Element.m24] = t1 * m2[Element.m21] + t2 * m2[Element.m22] + t3 * m2[Element.m23] + m2[Element.m24];
			m1[Element.m34] = t1 * m2[Element.m31] + t2 * m2[Element.m32] + t3 * m2[Element.m33] + m2[Element.m34];

			return m1;
		}

		/// result = m2 * m1
		export function mul(m1: Mat3x4, m2: Mat3x4, result?: Mat3x4): Mat3x4 {
			var i, j, k;
			var t1, t2, t3;
			if(!result)
				result = <Mat3x4>new Array(12);
			for(i = 0; i < 3; i++) {
				t1 = m1[Element.m11 + i];
				t2 = m1[Element.m21 + i];
				t3 = m1[Element.m31 + i];
				for(j = 0; j < 3; j++) {
					k = j * 4;
					result[k + i] = t1 * m2[k] + t2 * m2[k + 1] + t3 * m2[k + 2];
				}
			}
			t1 = m1[Element.m11 + 3];
			t2 = m1[Element.m21 + 3];
			t3 = m1[Element.m31 + 3];
			for(j = 0; j < 3; j++) {
				k = j * 4;
				result[k + 3] = t1 * m2[k] + t2 * m2[k + 1] + t3 * m2[k + 2] + m2[k + 3];
			}
			return result;
		}
	}

	export module Mat4 {
		export const enum Element {
			m11, m12, m13, m14,
			m21, m22, m23, m24,
			m31, m32, m33, m34,
			m41, m42, m43, m44
		}
		export function cameraView(eye: Vec3, dir: Vec3, up: Vec3): Mat4 {
			var zAxis = new Vec3(-dir.x, -dir.y, -dir.z);
			var xAxis = Vec3.cross(up, zAxis);
			var yAxis = Vec3.cross(zAxis, xAxis);
			return [xAxis.x, xAxis.y, xAxis.z, -xAxis.dot(eye),
					yAxis.x, yAxis.y, yAxis.z, -yAxis.dot(eye),
					zAxis.x, zAxis.y, zAxis.z, -zAxis.dot(eye),
						  0,	   0,		0,			1];
		}

		export function perspective(fov: number, aspect: number, zn: number, zf: number): Mat4 {
			//	yScale = cot(fovY/2)
			//	xScale = yScale / aspect ratio
			var yScale = 1 / Math.tan(fov * 0.5);
			var xScale = yScale / aspect;
			var fn = zf / (zn - zf);
			return [xScale,		 0,		 0,		0,
					     0,	yScale,		 0,		0,
						 0,		 0,		fn,	zn*fn,
						 0,		 0,		-1,		0];
		}
		export function ortho(w: number, h: number, zn: number, zf: number): Mat4 {
			var z = 1 / (zn - zf);
			return [2/w,	0,		0,		0,
					  0,  2/h,		0,		0,
					  0,	0,      z,	 zn*z,
					  0,	0,		0,		1];
		}
		export function mul(m1: Mat4, m2: Mat4, result?: Mat4): Mat4 {
			var i, j;
			if(!result)
				result = <Mat4>new Array(16);
			for(i = 0; i < 4; i++) {
				for(j = 0; j < 4; j++) {
					var k = j * 4;
					result[k + i] = m1[i] * m2[k] + m1[4 + i] * m2[k + 1] + m1[8 + i] * m2[k + 2] + m1[12 + i] * m2[k + 3];
				}
			}
			return result;
		}
		export function mul2(m1: Mat3x4, m2: Mat4, result: Mat4 = null): Mat4 {
			var i, j;
			var t1, t2, t3;
			if(!result)
				result = <Mat4>new Array(16);
			for(i = 0; i < 4; i++) {
				t1 = m1[i];
				t2 = m1[4 + i];
				t3 = m1[8 + i];
				for(j = 0; j < 4; j++) {
					var k = j * 4;
					result[k + i] = t1 * m2[k] + t2 * m2[k + 1] + t3 * m2[k + 2];
					if(i == 3)
						result[k + 3] += m2[k + 3];
				}
			}
			//for(i = 0; i < 4; i++)
			//	result[12 + i] = m2[12 + i];
			return result;
		}
		export function transpose(m: Mat4): Mat4 {
			return [m[Element.m11], m[Element.m21], m[Element.m31], m[Element.m41],
					m[Element.m12], m[Element.m22], m[Element.m32], m[Element.m42],
					m[Element.m13], m[Element.m23], m[Element.m33], m[Element.m43],
					m[Element.m14], m[Element.m24], m[Element.m34], m[Element.m44]];
		}
		export function append(m1: Mat4, m2: Mat4): Mat4 {
			var i, j;
			var t1, t2, t3, t4;
			for (i = 0; i < 4; i++) {
				t1 = m1[i];
				t2 = m1[4 + i];
				t3 = m1[8 + i];
				t4 = m1[12 + i];
				for(j = 0; j < 4; j++) {
					var k = j * 4;
					m1[k + i] = t1 * m2[k] + t2 * m2[k + 1] + t3 * m2[k + 2] + t4 * m2[k + 3];
				}
			}
			return m1;
		}
		export function fromMat3x4(m: Mat3x4, result?: Mat4): Mat4 {
			if(!result)
				result = <Mat4><any>new Array(16);
			for(var i = 0; i < 12; i++)
				result[i] = m[i];
			result[12] = result[13] = result[14] = 0;
			result[15] = 1;
			return result;
		}
		export function clone(m: Mat4): Mat4 {
			return <Mat4>m.concat();
		}
	}
}