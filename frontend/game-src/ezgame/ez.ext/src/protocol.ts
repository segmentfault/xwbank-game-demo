var LogProtocol:boolean;

namespace EasyGame {
	export const enum Primitive {
		bool = 1,
		int = 2,
		string = 3,
		float = 4,
		short = 5,
		char = 6,
		byte = 7,
		double = 8,
		uint = 9,
		ushort = 10,
		int64 = 11,
		uint64 = 12,
		date = 13,
		bits = 14,
		array = 15,
		dict = 16,
		tuple = 17,
		bytes = 18
	};


	export var Type: any = {};

	export interface Dictionary<T> {
		[key: number]: T;
		[key: string]: T;
	}

	export interface ObjectSerializer {
		read(s: StreamReader): any;
		write(s: StreamWriter, obj: any): any;
	}

	var b64Enc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	var b64Dec = [];
	(function () {
		for (var i = 0; i < b64Enc.length; i++)
			b64Dec[b64Enc.charCodeAt(i) - 43] = i;
	})();

	function base64Decode(s: string): Uint8Array {
		var bytes = (s.length / 4) * 3;
		if (s.charAt[s.length - 1] == "=") bytes--;
		if (s.charAt[s.length - 2] == "=") bytes--;
		var a, b, c, d;
		var c1, c2, c3;
		var i = 0;
		var j = 0;
		var arr = new Uint8Array(bytes);
		for (i = 0; i < bytes; i += 3) {
			a = b64Dec[s.charCodeAt(j++) - 43];
			b = b64Dec[s.charCodeAt(j++) - 43];
			c = b64Dec[s.charCodeAt(j++) - 43];
			d = b64Dec[s.charCodeAt(j++) - 43];
			c1 = (a << 2) | (b >> 4);
			c2 = ((b & 15) << 4) | (c >> 2);
			c3 = ((c & 3) << 6) | d;
			arr[i] = c1;
			if (c != 64)
				arr[i + 1] = c2;
			if (d != 64)
				arr[i + 2] = c3;
		}
		return arr;
	}

	function base64Encode(bytes: Uint8Array, length?: number): string {
		var b64 = '';
		length = length || bytes.length;
		var r = length % 3;
		var l2 = length - r;
		var c;
		for (var i = 0; i < l2; i += 3) {
			c = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
			b64 += b64Enc[(c & 16515072) >> 18] + b64Enc[(c & 258048) >> 12] + b64Enc[(c & 4032) >> 6] + b64Enc[c & 63];
		}
		if (r == 1) {
			c = bytes[l2];
			b64 += b64Enc[(c & 252) >> 2] + b64Enc[(c & 3) << 4] + '==';
		}
		else if (r == 2) {
			c = (bytes[l2] << 8) | bytes[l2 + 1];
			b64 += b64Enc[(c & 64512) >> 10] + b64Enc[(c & 1008) >> 4] + b64Enc[(c & 15) << 2] + '=';
		}
		return b64;
	}

	function utf8Encode(str: string): Uint8Array {
		var arr = new Uint8Array(str.length * 4);
		var b = 0;
		for (var i = 0, j = str.length; i < j; i++) {
			var code = str.charCodeAt(i);
			if (code <= 0x7f) {
				arr[b++] = code;
				continue;
			}
			if (0xD800 <= code && code <= 0xDBFF) {
				var l = str.charCodeAt(i + 1);
				if (0xDC00 <= l && l <= 0xDFFF) {
					code = ((code & 0x3FF) << 10) + (l & 0x3FF) + 0x10000;
					++i;
				}
			}
			if ((code & 0xFFE00000) !== 0) {
				arr[b++] = 0xF8 | ((code >>> 24) & 0x03);
				arr[b++] = 0x80 | ((code >>> 18) & 0x3F);
				arr[b++] = 0x80 | ((code >>> 12) & 0x3F);
				arr[b++] = 0x80 | ((code >>> 6) & 0x3F);
				arr[b++] = 0x80 | (code & 0x3F);
			} else if ((code & 0xFFFF0000) !== 0) {
				arr[b++] = 0xF0 | ((code >>> 18) & 0x07);
				arr[b++] = 0x80 | ((code >>> 12) & 0x3F);
				arr[b++] = 0x80 | ((code >>> 6) & 0x3F);
				arr[b++] = 0x80 | (code & 0x3F);
			} else if ((code & 0xFFFFF800) !== 0) {
				arr[b++] = 0xE0 | ((code >>> 12) & 0x0F);
				arr[b++] = 0x80 | ((code >>> 6) & 0x3F);
				arr[b++] = 0x80 | (code & 0x3F);
			} else {
				arr[b++] = 0xC0 | ((code >>> 6) & 0x1F);
				arr[b++] = 0x80 | (code & 0x3F);
			}
		}
		return arr.subarray(0, b);
	}

	function utf8Decode(bytes: Uint8Array, offset?: number, cnt?: number): string {
		if (cnt == 0)
			return "";
		var str = "";
		var j = offset || 0;
		cnt = cnt ? j + cnt : bytes.length;
		while (j < cnt) {
			var b1 = bytes[j++] & 0xFF;
			if (b1 <= 0x7F)
				str += String.fromCharCode(b1);
			else {
				var pf = 0xC0;
				var bits = 5;
				do {
					var mask = (pf >> 1) | 0x80;
					if ((b1 & mask) === pf) break;
					pf = (pf >> 1) | 0x80;
					--bits;
				} while (bits >= 0);

				if (bits <= 0)
					throw new Error("Invalid UTF8 char");
				var code = (b1 & ((1 << bits) - 1));
				for (var i = 5; i >= bits; --i) {
					var bi = bytes[j++];
					if ((bi & 0xC0) != 0x80) {
						throw new Error("Invalid UTF8 char");
					}
					code = (code << 6) | (bi & 0x3F);
				}
				if (code >= 0x10000)
					str += String.fromCharCode((((code - 0x10000) >> 10) & 0x3FF) | 0xD800, (code & 0x3FF) | 0xDC00);
				else
					str += String.fromCharCode(code);
			}
		}
		return str;
	}

	export interface Int64 {
		low: number;
		high: number;
	}
	export function NumberToInt64(v: number) {
		var negate = v < 0;
		v = Math.abs(v);
		if (v > 0xFFFFFFFF)
			return { low: v % 0x100000000, high: (v / 0x100000000) | 0 };
		else
			return { low: v, high: 0 };
	}
	export function Int64ToNumber(v: Int64) {
		return v.high * 65536 * 65536 + v.low;
	}

	export class StreamReader {
		public pos: number;
		public buffer: ArrayBuffer;
		public dataView: DataView;
		public byteView: Uint8Array;

		public constructor(data: ArrayBuffer, length?: number) {
			this.buffer = data;
			this.pos = 0;
			length = length || data.byteLength;
			this.dataView = new DataView(data, 0, length);
			this.byteView = new Uint8Array(data, 0, length);
		}
		checkBound(size: number) {
			if (this.pos + size > this.dataView.byteLength)
				throw new Error("out of stream limit.");
		}
		public readInt(): number {
			var v;
			this.checkBound(1);
			v = this.dataView.getInt8(this.pos);
			this.pos++;
			if (v == -128) {
				this.checkBound(4);
				v = this.dataView.getInt32(this.pos, true);
				this.pos += 4;
			}
			else if (v == 127) {
				this.checkBound(2);
				v = this.dataView.getInt16(this.pos, true);
				this.pos += 2;
			}
			return v;
		}
		public read(t: number | ObjectSerializer): any {
			var v;
			var len;
			if (typeof (t) === "number") {
				switch (t) {
					case Primitive.bool:
						this.checkBound(1);
						v = this.dataView.getInt8(this.pos) != 0;
						this.pos++;
						break;
					case Primitive.int:
						return this.readInt();
					case Primitive.string:
						len = this.readInt();
						if (len < 0)
							return null;
						this.checkBound(len);
						v = utf8Decode(this.byteView, this.pos, len);
						this.pos += len;
						break;
					case Primitive.float:
						this.checkBound(4);
						v = this.dataView.getFloat32(this.pos, true);
						this.pos += 4;
						break;
					case Primitive.short:
						this.checkBound(2);
						v = this.dataView.getInt16(this.pos, true);
						this.pos += 2;
						break;
					case Primitive.char:
						this.checkBound(2);
						v = this.dataView.getInt16(this.pos, true);
						this.pos += 2;
						break;
					case Primitive.byte:
						this.checkBound(1);
						v = this.dataView.getUint8(this.pos);
						this.pos += 1;
						break;
					case Primitive.double:
						this.checkBound(8);
						v = this.dataView.getFloat64(this.pos, true);
						this.pos += 8;
						break;
					case Primitive.uint:
						this.checkBound(4);
						v = this.dataView.getUint32(this.pos, true);
						this.pos += 4;
						break;
					case Primitive.ushort:
						this.checkBound(2);
						v = this.dataView.getUint16(this.pos, true);
						this.pos += 2;
						break;
					case Primitive.int64:
						this.checkBound(8);
						v = {
							low: this.dataView.getUint32(this.pos, true),
							high: this.dataView.getUint32(this.pos + 4, true)
						};
						this.pos += 8;
						break;
					case Primitive.uint64:
						this.checkBound(8);
						v = {
							low: this.dataView.getUint32(this.pos, true),
							high: this.dataView.getUint32(this.pos + 4, true)
						};
						this.pos += 8;
						break;
					case Primitive.date:
						v = new Date();
						v.setTime(Int64ToNumber(this.read(Primitive.uint64)) * 0.0001);
						break;
				}
				return v;
			}
			else
				return (<ObjectSerializer>t).read(this);
		}
		public readBits(count: number): boolean[] {
			var bits = [];
			var b = 0;
			for (var i = 0; i < count; i++) {
				var d = i & 7;
				if (d == 0)
					b = this.read(Primitive.byte);
				bits.push((b & (1 << d)) != 0);
			}
			return bits;
		}
		public readArray(t: number | ObjectSerializer): Array<any> {
			var len = this.readInt();
			if (len < 0)
				return null;
			var arr = [];
			for (var i = 0; i < len; i++)
				arr.push(this.read(t));
			return arr;
		}
		public readDict(k: number, t: number | ObjectSerializer): any {
			var len = this.readInt();
			if (len < 0)
				return null;
			var dict: any = {};
			for (var i = 0; i < len; i++)
				dict[this.read(k)] = this.read(t);
			return dict;
		}
		public readTuple(t: any[]): any[] {
			var tuple = [];
			for (var i = 0; i < t.length; i++)
				tuple[i] = this.read(t[i]);
			return tuple;
		}
	}

	export class StreamWriter {
		public pos: number;
		public dataView: DataView;
		public byteBuffer: Uint8Array;

		public constructor() {
			this.byteBuffer = new Uint8Array(64);
			this.dataView = new DataView(this.byteBuffer.buffer, 0, this.byteBuffer.length);
			this.pos = 0;
		}

		public w(...args) {
			var ctx = this;
			for (var i = 0; i < arguments.length; i += 2) {
				write(arguments[i], arguments[i + 1]);
			}
			function checkBound(size: number) {
				if (ctx.pos + size > ctx.byteBuffer.length) {
					var buf = ctx.byteBuffer;
					ctx.byteBuffer = new Uint8Array((buf.length + size) * 2);
					ctx.byteBuffer.set(buf);
					ctx.dataView = new DataView(ctx.byteBuffer.buffer, 0, ctx.byteBuffer.length);
				}
			}
			function writeInt(v) {
				checkBound(1);
				if (v > -128 && v < 127) {
					ctx.dataView.setInt8(ctx.pos++, v);
				}
				else if (v >= -32768 && v <= 0x7FFF) {
					ctx.dataView.setInt8(ctx.pos++, 127);
					checkBound(2);
					ctx.dataView.setInt16(ctx.pos, v, true);
					ctx.pos += 2;
				}
				else {
					ctx.dataView.setUint8(ctx.pos++, 128);
					checkBound(4);
					ctx.dataView.setInt32(ctx.pos, v, true);
					ctx.pos += 4;
				}
			}
			function write(t: number | any[] | ObjectSerializer, v: any) {
				if (typeof (t) === "number") {
					if (t < 0) {
						if (v == null)
							return;
						t = -t;
					}
					switch (t) {
						case Primitive.bool:
							checkBound(1);
							ctx.dataView.setInt8(ctx.pos, v ? 1 : 0);
							ctx.pos++;
							break;
						case Primitive.int:
							writeInt(v);
							break;
						case Primitive.string:
							if (v == null) {
								writeInt(-1);
								return;
							}
							v = utf8Encode(v);
							writeInt(v.length);
							checkBound(v.length);
							ctx.byteBuffer.set(v, ctx.pos);
							ctx.pos += v.length;
							break;
						case Primitive.float:
							checkBound(4);
							ctx.dataView.setFloat32(ctx.pos, v, true);
							ctx.pos += 4;
							break;
						case Primitive.short:
							checkBound(2);
							ctx.dataView.setInt16(ctx.pos, v, true);
							ctx.pos += 2;
							break;
						case Primitive.char:
							checkBound(2);
							ctx.dataView.setInt16(ctx.pos, v, true);
							ctx.pos += 2;
							break;
						case Primitive.byte:
							checkBound(1);
							ctx.dataView.setUint8(ctx.pos, v);
							ctx.pos += 1;
							break;
						case Primitive.double:
							checkBound(8);
							ctx.dataView.setFloat64(ctx.pos, v, true);
							ctx.pos += 8;
							break;
						case Primitive.uint:
							checkBound(4);
							ctx.dataView.setUint32(ctx.pos, v, true);
							ctx.pos += 4;
							break;
						case Primitive.ushort:
							checkBound(2);
							ctx.dataView.setUint16(ctx.pos, v, true);
							ctx.pos += 2;
							break;
						case Primitive.int64:
							checkBound(8);
							ctx.dataView.setUint32(ctx.pos, v.low, true);
							ctx.dataView.setInt32(ctx.pos + 4, v.high, true);
							ctx.pos += 8;
							break;
						case Primitive.uint64:
							ctx.dataView.setUint32(ctx.pos, v.low, true);
							ctx.dataView.setUint32(ctx.pos + 4, v.high, true);
							ctx.pos += 8;
						case Primitive.date:
							checkBound(8);
							v = NumberToInt64(v.getTime() * 10000);
							ctx.dataView.setUint32(ctx.pos, v.low, true);
							ctx.dataView.setUint32(ctx.pos + 4, v.high, true);
							ctx.pos += 8;
							break;
						case Primitive.bits:
							var bytes = [];
							for (var i = 0; i < v.length; i++) {
								if ((i & 7) == 0)
									bytes.push(0);
								if (v[i])
									bytes[i >> 3] |= (1 << (i & 7));
							}
							for (i = 0; i < bytes.length; i++)
								write(Primitive.byte, bytes[i]);
							break;
						case Primitive.bytes:
							writeInt(v.length);
							checkBound(v.length);
							ctx.byteBuffer.set(v, ctx.pos);
							ctx.pos += v.length;
							break;
					}
				}
				else if (Array.isArray(t)) {
					switch (t[0]) {
						case Primitive.array:
							if (v == null)
								writeInt(-1);
							else {
								writeInt(v.length);
								for (var i = 0; i < v.length; i++)
									write(t[1], v[i]);
							}
							break;
						case Primitive.dict:
							if (v == null)
								writeInt(-1);
							else {
								var i = 0;
								for (var k in v)
									i++;
								writeInt(i);
								for (var k in v) {
									write(t[1], k);
									write(t[2], v[k]);
								}
							}
							break;
						case Primitive.tuple:
							for (var i = 0; i < t.length; i++)
								write(t[i + 1], v[i]);
							break;
					}
				}
				else
					(<ObjectSerializer>t).write(ctx, v);
			}
		}

		checkBound(size: number) {
			if (this.pos + size > this.byteBuffer.length) {
				var buf = this.byteBuffer;
				this.byteBuffer = new Uint8Array((buf.length + size) * 2);
				this.byteBuffer.set(buf);
				this.dataView = new DataView(this.byteBuffer.buffer, 0, this.byteBuffer.length);
			}
		}		
	}

	export interface Connection {
		send(data: Uint8Array, onResponse?: (s: StreamReader) => void);
		newReq?: (id, onResponse?: (err, response: ArrayBuffer) => void) => void;
		setStub?: (stub: IStubBase) => void;
		addStub?: (stub: IStubBase) => void;
		handshake?: (pid: number, version: number, onReslut: (err: EasyGame.ServiceError) => void) => void;
		queueLength: number;
	}

	export interface IStubBase {
		pid: number;
		dispatch(s: EasyGame.StreamReader);
	}

	export interface ServiceError {
		errCode: number;
		errMsg: string;
	}

	export class ProxyBase {
		public conn: Connection;
		public onError: (e: Error) => void;

		public constructor(conn: Connection) {
			this.conn = conn;
			this.onError = e => { alert("Error: " + e.message); };
		}
		protected send(stream: StreamWriter, onResult?: (s: StreamReader) => void) {
			var buf = new Uint8Array(stream.byteBuffer.buffer, 0, stream.pos);
			this.conn.send(buf, onResult);
		}
		protected getResult(t, resolve, reject) {
			return function (s: StreamReader) {
				var r = s.readInt();
				if (r) {
					var e = new Error(s.read(Primitive.string));
					e["code"] = r;
					reject(e);
				}
				else if (resolve) {
					if (t)
						resolve(t(s));
					else
						resolve();
				}
			}
		}
	}

	export enum NetworkEvent {
		Issue,
		Recover,
		Error
	}

	export class NotifyListener {
		private xhr: XMLHttpRequest = new XMLHttpRequest();
		private url: string;
		private session: string;
		private reqId = 1;
		private networkEvent: Function;
		private stubs: IStubBase[] = [];
		private retry = 0;
		constructor(url: string, session: string, networkEvent: Function) {
			this.url = url;
			this.session = session;
			this.networkEvent = networkEvent;
			var ctx = this;
			setTimeout(function () { ctx.run() }, 100);
		}

		addStub(stub: IStubBase) {
			this.stubs[stub.pid] = stub;
		}
		stop() {
			this.xhr.abort();
			this.xhr = null;
		}
		run() {
			var ctx = this;
			var xhr = this.xhr;
			var stubs = this.stubs;
			if (!xhr)
				return;

			xhr.open("GET", this.url + `?p=${this.reqId}.${this.session}`, true);
			xhr.onload = () => {
				if (xhr.status === 200) {
					ctx.reqId++;
					if (xhr.responseText != "") {
						var msgs = xhr.responseText.split("\n");
						if (LogProtocol)
							Log.debug("got %d notifies.", msgs.length);
						for (var i = 0; i < msgs.length; i++) {
							try {
								if (msgs[i] == "")
									continue;
								var reader = new EasyGame.StreamReader(base64Decode(msgs[i]).buffer);
								var pid = reader.readInt();
								if (!stubs[pid])
									Log.error("the stub for protocol id[%d] is not register.", pid);
								else
									stubs[pid].dispatch(reader);
							}
							catch (e) {
								Log.error("notify error: %s stack:%o", e.message, e.stack);
							}
						}
					}
					ctx.run();
				}
				else {
					this.networkEvent(NetworkEvent.Error, xhr.statusText);
				}
			};
			xhr.ontimeout = function () {
				Log.debug("notify timeout");
				if (ctx.retry++ > 5)
					return;
				ctx.xhr = new XMLHttpRequest();
				ctx.run();
			}
			xhr.onerror = function (ev) {
				Log.debug("notify error");
				if (ctx.retry++ > 5)
					return;
				setTimeout(() => {
					ctx.run();
				}, 1000);
			};
			xhr.timeout = 60000;
			xhr.send();
		}
	}

	export var RequestTimeout = 5000;
	
	export class RequestConnection implements Connection {
		xhr: XMLHttpRequest = new XMLHttpRequest();
		url: string;
		session: string;
		private reqId = 1;
		private buzy: boolean;
		private nextStep: Function[] = [];
		private retry: number = 0;
		private networkEvent: Function;
		private multiplex: boolean;

		constructor(url: string, session: string, multiplex: boolean, networkEvent: Function) {
			this.url = url;
			this.session = session;
			this.buzy = false;
			this.multiplex = multiplex;
			this.networkEvent = networkEvent;
		}

		get queueLength() {
			return this.nextStep.length;
		}

		send(data: Uint8Array, onResponse?: (response: EasyGame.StreamReader) => void, resend?: boolean) {
			var ctx = this;
			if (ctx.buzy) {
				ctx.nextStep.push(() => { ctx.send(data, onResponse); });
				Log.debug("response buzy, queue length:%d", ctx.nextStep.length);
			}
			else {
				if (resend)
					Log.debug("resend request %d", ctx.reqId);
				else
					Log.debug("send request %d", ctx.reqId);
				ctx.buzy = true;
				var xhr = ctx.xhr;
				xhr.open("GET", ctx.url + `?p=${ctx.reqId}.${ctx.session}.${encodeURIComponent(base64Encode(data))}`, true);
				xhr.onload = () => {
					ctx.retry = 0;
					ctx.buzy = false;
					if (xhr.status === 200) {
						ctx.reqId++;
						if (onResponse) {
							try {
								var stream = new EasyGame.StreamReader(base64Decode(xhr.responseText).buffer);
								if (this.multiplex)
									stream.readInt();
								onResponse(stream);
							}
							catch (e) {
								Log.error("onResponse error: %s", e.message);
							}
						}
					}
					else {
						this.networkEvent(NetworkEvent.Error, xhr.status);
						return;
					}
					if (ctx.nextStep.length > 0) {
						Log.debug("process pedding response length:%d %o", ctx.nextStep.length, ctx.nextStep);
						var n = ctx.nextStep.shift();
						n();
					}
					else
						this.networkEvent(NetworkEvent.Recover);
				};


				xhr.ontimeout = function () {
					ctx.buzy = false;
					ctx.retry++;
					Log.debug("request timeout, retry: %d", ctx.retry);
					if (ctx.retry >= 5) {
						ctx.reqId++;
						ctx.networkEvent(NetworkEvent.Error, "timeout");
						return;
					}
					ctx.xhr = new XMLHttpRequest();
					ctx.networkEvent(NetworkEvent.Issue, ctx.reqId);
					//MainPanel.networkIssue(ctx.reqId);
					ctx.send(data, onResponse, true);
				}

				xhr.onerror = function (ev) {
					ctx.buzy = false;
					ctx.retry++;
					Log.debug("request error, retry: %d", ctx.retry);
					ctx.networkEvent(NetworkEvent.Issue, ctx.reqId);
					//MainPanel.networkIssue(ctx.reqId);
					if (ctx.retry > 5) {
						ctx.reqId++;
						ctx.networkEvent(NetworkEvent.Error, "timeout");
						return;
					}
					setTimeout(() => {
						ctx.send(data, onResponse, true);
					}, 1000);
				};
				xhr.timeout = RequestTimeout * (ctx.retry + 1);
				xhr.send();
				//xhr.send(`${ctx.reqId}\n${ctx.session}\n${encodeURIComponent(base64Encode(data))}`);
			}
		}
	}

	const enum WSConnState {
		init,
		connect,
		open,
		establish,
		error,
		reconnect
	}
	const enum WSMessageType {
		Request = 1,
		Notify = 2,
		Ping = 3
	}

	export interface IWebSocketConnection {
		queueLength: number;
		addStub(stub: IStubBase);
		send(path: string, data: Uint8Array, onResponse?: (response: EasyGame.StreamReader) => void);
	}

	export class WebSocketConnectionAdapter implements Connection {
		path: string;
		conn: IWebSocketConnection;

		public constructor(path: string, conn: IWebSocketConnection) {
			this.path = path;
			this.conn = conn;
		}
		send(data: Uint8Array, onResponse?: (s: StreamReader) => void) {
			this.conn.send(this.path, data, onResponse);
		}
		get queueLength() {
			return this.conn.queueLength;
		}

	}

	export var RequestTimeout = 5000;
	
	export function createWebSocketConnection(url: string, token: string, networkEvent: Function): IWebSocketConnection {
		var ws: WebSocket;
		var state = WSConnState.init;
		var session: string;
		var reqQueue = [];
		var stubs: IStubBase[] = [];
		var notifyId = 1;
		var reqId = 1;
		var timer = -1;
		var retryTimes = 60;
		var pingTick;
		var pingPacket = new Uint8Array(1);
		pingPacket[0] = WSMessageType.Ping;

		function Obfuscation(byteView: Uint8Array, pos, size, reqId) {
			var p = reqId & 0xff;
			for (var i = 0; i < size; i++) {
				byteView[i + pos] = p ^ byteView[i + pos];
				p = (p + 7) & 0xff;
			}
		}

		function send(path: string, data: Uint8Array, onResponse: (response: EasyGame.StreamReader) => void) {
			if (LogProtocol)
				Log.debug("send req " + reqId);
			
			Obfuscation(data, 0, data.length, reqId);

			var writer = new StreamWriter();
			writer.w(
				Primitive.int, WSMessageType.Request,
				Primitive.int, reqId,
				Primitive.string, path
			);
			writer.checkBound(data.length);
			writer.byteBuffer.set(data, writer.pos);
			writer.pos += data.length;
			var buf = writer.byteBuffer.subarray(0, writer.pos);
			reqQueue.push({ id: reqId, response: onResponse, data: buf, time: Date.now() });
			reqId++;
			if (reqQueue.length == 1)
				sendimpl();
		}

		function getNotify() {
			if (LogProtocol)
				Log.debug("query notify " + notifyId);
			var writer = new StreamWriter();
			writer.w(
				Primitive.int, WSMessageType.Notify,
				Primitive.int, notifyId);
			ws.send(writer.byteBuffer.subarray(0, writer.pos));
		}

		function ping() {
			if (LogProtocol)
				Log.debug(`ping agent...`);
			pingTick = Date.now();
			ws.send(pingPacket);
			timer = setTimeout(function () {
				timer = 0;
				networkEvent(NetworkEvent.Issue, "网络请求超时");
				Log.debug(`request timeout(${Date.now() - pingTick} ms). close the connection...`);
				ws.onclose = null;
				ws.onerror = null;
				ws.onmessage = null;
				ws.close();
				Log.debug(`重连服务器...`);
				state = WSConnState.reconnect;
				open();
			}, RequestTimeout);
		}

		function sendimpl() {
			if (reqQueue.length == 0 || state != WSConnState.connect)
				return;
			var req = reqQueue[0];
			if (LogProtocol)
				Log.debug("send request " + req.id);
			ws.send(req.data);
			timer = setTimeout(ping, 500);
		}

		var conn = <IWebSocketConnection>{
			addStub: function (stub: IStubBase) {
				stubs[stub.pid] = stub;
			},
			send: send
		}
		Object.defineProperty(conn, "queueLength", {
			get: function () {
				return reqQueue.length;
			}
		})

		function open() {
			Log.debug("connect to " + url);

			function onerror(ev: any) {
				console.error("connection error", ev);
				if (state == WSConnState.connect) {
					state = WSConnState.reconnect;
					open();
				}
				else if (state == WSConnState.reconnect) {
					retryTimes--;
					if (retryTimes <= 0) {
						networkEvent(NetworkEvent.Error, "网络连接失败");
						return;
					}
					Log.debug("连接失败，1秒后重试...");
					setTimeout(open, 1000);
				}
			}

			try {
				ws = new WebSocket(url);
			} catch (e) {
				onerror(e);
			}

			ws.binaryType = "arraybuffer";

			ws.onopen = function () {
				if (session) {
					Log.debug(`ws.onopen check session ${session}`);
					ws.send("1:" + session);
				}
				else {
					Log.debug("ws.onopen get session");
					ws.send("0:" + token);
				}
				state = WSConnState.open;
				getNotify();
			}

			ws.onmessage = function (ev: MessageEvent) {
				networkEvent(NetworkEvent.Recover, "");
				if (state == WSConnState.open) {
					//if(DEBUG)
					Log.debug("get session: " + ev.data);
					session = <string>ev.data;
					state = WSConnState.connect;
					retryTimes = 5;
					sendimpl();
				}
				else {
					var stream = new StreamReader(<ArrayBuffer>ev.data);
					var type = stream.readInt();
					if (type == WSMessageType.Request) {
						var reqId = stream.readInt();
						var req = reqQueue.shift();
						var size = stream.readInt();
						Obfuscation(stream.byteView, stream.pos, size, reqId);
						var pid = stream.readInt();
						if (LogProtocol)
							Log.debug(`get response ${reqId} time: ${Date.now() - req.time}`);
						if (timer > 0) {
							clearTimeout(timer);
							timer = 0;
						}
						sendimpl();
						if (reqId != req.id) {
							Log.error("request id mismatch: get:%d want:%d", reqId, req.id);
						}
						else {
							try {
								req.response(stream);
							}
							catch (e) {
								Log.error('response error: %o', e);
							}
						}
					}
					else if (type == WSMessageType.Notify) {
						var id = stream.readInt();
						Obfuscation(stream.byteView, stream.pos, stream.byteView.byteLength - stream.pos, id);
						var count = stream.readInt();
						if (LogProtocol)
							Log.debug("get notify " + id);
						for (var i = 0; i < count; i++) {
							try {
								var len = stream.readInt();
								var reader = new StreamReader(stream.buffer.slice(stream.pos, stream.pos + len));
								stream.pos += len;
								var pid = reader.readInt();
								if (!stubs[pid])
									Log.error("the stub for protocol id[%d] is not register.", pid);
								else
									stubs[pid].dispatch(reader);
							}
							catch (e) {
								Log.error("notify error: %s stack:%o", e.message, e.stack);
							}
						}
						notifyId++;
						getNotify();
					}
					else if (type == WSMessageType.Ping) {
						if (LogProtocol)
							Log.debug(`ping delay: ${Date.now() - pingTick} ms`);
						if (timer > 0) {
							clearTimeout(timer);
							timer = 0;
						}
					}
					else
						Log.error('unknown data: %o', ev.data);
				}
			}

			ws.onerror = onerror;

			ws.onclose = function (ev: CloseEvent) {
				//if(DEBUG)
				console.error("connection lost: ", ev);
				if (ev.code == 1000 || ev.code == 1011 || ev.code == 1003) { // || ev.code == 1006
					networkEvent(NetworkEvent.Error, ev.reason);
					return;
				}
				if (state == WSConnState.connect) {
					networkEvent(NetworkEvent.Issue, "网络中断");
					Log.debug(`开始重连...`);
					state = WSConnState.reconnect;
					open();
				}
			}
		}
		open();
		return conn;
	}
	export class StubBase {
		protected _reqCB = {};
		protected _reqId = 0;
		public pid: number;
		public newReq(onResp: (s: EasyGame.StreamReader) => void): number {
			this._reqId++;
			this._reqCB[this._reqId] = onResp;
			return this._reqId;
		}
		private asyncCB(s: EasyGame.StreamReader) {
			var id = s.readInt();
			var cb = this._reqCB[id];
			delete this._reqCB[id];
			cb(s);
		}
		public dispatch(s: EasyGame.StreamReader) {

			if (this.dispMethods) {
				var dispId = s.readInt();
				if (dispId == -1)
					this.asyncCB(s);
				else
					this.dispMethods(dispId, s);
			}
			else
				this.asyncCB(s);
		}
		dispMethods: (dispId, s: EasyGame.StreamReader) => void;

		public constructor(pid: number) {
			this.pid = pid;
		}
	}
}