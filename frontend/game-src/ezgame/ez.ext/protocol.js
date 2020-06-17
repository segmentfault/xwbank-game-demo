var LogProtocol;
var EasyGame;
(function (EasyGame) {
    ;
    EasyGame.Type = {};
    var b64Enc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var b64Dec = [];
    (function () {
        for (var i = 0; i < b64Enc.length; i++)
            b64Dec[b64Enc.charCodeAt(i) - 43] = i;
    })();
    function base64Decode(s) {
        var bytes = (s.length / 4) * 3;
        if (s.charAt[s.length - 1] == "=")
            bytes--;
        if (s.charAt[s.length - 2] == "=")
            bytes--;
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
    function base64Encode(bytes, length) {
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
    function utf8Encode(str) {
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
            }
            else if ((code & 0xFFFF0000) !== 0) {
                arr[b++] = 0xF0 | ((code >>> 18) & 0x07);
                arr[b++] = 0x80 | ((code >>> 12) & 0x3F);
                arr[b++] = 0x80 | ((code >>> 6) & 0x3F);
                arr[b++] = 0x80 | (code & 0x3F);
            }
            else if ((code & 0xFFFFF800) !== 0) {
                arr[b++] = 0xE0 | ((code >>> 12) & 0x0F);
                arr[b++] = 0x80 | ((code >>> 6) & 0x3F);
                arr[b++] = 0x80 | (code & 0x3F);
            }
            else {
                arr[b++] = 0xC0 | ((code >>> 6) & 0x1F);
                arr[b++] = 0x80 | (code & 0x3F);
            }
        }
        return arr.subarray(0, b);
    }
    function utf8Decode(bytes, offset, cnt) {
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
                    if ((b1 & mask) === pf)
                        break;
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
    function NumberToInt64(v) {
        var negate = v < 0;
        v = Math.abs(v);
        if (v > 0xFFFFFFFF)
            return { low: v % 0x100000000, high: (v / 0x100000000) | 0 };
        else
            return { low: v, high: 0 };
    }
    EasyGame.NumberToInt64 = NumberToInt64;
    function Int64ToNumber(v) {
        return v.high * 65536 * 65536 + v.low;
    }
    EasyGame.Int64ToNumber = Int64ToNumber;
    class StreamReader {
        constructor(data, length) {
            this.buffer = data;
            this.pos = 0;
            length = length || data.byteLength;
            this.dataView = new DataView(data, 0, length);
            this.byteView = new Uint8Array(data, 0, length);
        }
        checkBound(size) {
            if (this.pos + size > this.dataView.byteLength)
                throw new Error("out of stream limit.");
        }
        readInt() {
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
        read(t) {
            var v;
            var len;
            if (typeof (t) === "number") {
                switch (t) {
                    case 1:
                        this.checkBound(1);
                        v = this.dataView.getInt8(this.pos) != 0;
                        this.pos++;
                        break;
                    case 2:
                        return this.readInt();
                    case 3:
                        len = this.readInt();
                        if (len < 0)
                            return null;
                        this.checkBound(len);
                        v = utf8Decode(this.byteView, this.pos, len);
                        this.pos += len;
                        break;
                    case 4:
                        this.checkBound(4);
                        v = this.dataView.getFloat32(this.pos, true);
                        this.pos += 4;
                        break;
                    case 5:
                        this.checkBound(2);
                        v = this.dataView.getInt16(this.pos, true);
                        this.pos += 2;
                        break;
                    case 6:
                        this.checkBound(2);
                        v = this.dataView.getInt16(this.pos, true);
                        this.pos += 2;
                        break;
                    case 7:
                        this.checkBound(1);
                        v = this.dataView.getUint8(this.pos);
                        this.pos += 1;
                        break;
                    case 8:
                        this.checkBound(8);
                        v = this.dataView.getFloat64(this.pos, true);
                        this.pos += 8;
                        break;
                    case 9:
                        this.checkBound(4);
                        v = this.dataView.getUint32(this.pos, true);
                        this.pos += 4;
                        break;
                    case 10:
                        this.checkBound(2);
                        v = this.dataView.getUint16(this.pos, true);
                        this.pos += 2;
                        break;
                    case 11:
                        this.checkBound(8);
                        v = {
                            low: this.dataView.getUint32(this.pos, true),
                            high: this.dataView.getUint32(this.pos + 4, true)
                        };
                        this.pos += 8;
                        break;
                    case 12:
                        this.checkBound(8);
                        v = {
                            low: this.dataView.getUint32(this.pos, true),
                            high: this.dataView.getUint32(this.pos + 4, true)
                        };
                        this.pos += 8;
                        break;
                    case 13:
                        v = new Date();
                        v.setTime(Int64ToNumber(this.read(12)) * 0.0001);
                        break;
                }
                return v;
            }
            else
                return t.read(this);
        }
        readBits(count) {
            var bits = [];
            var b = 0;
            for (var i = 0; i < count; i++) {
                var d = i & 7;
                if (d == 0)
                    b = this.read(7);
                bits.push((b & (1 << d)) != 0);
            }
            return bits;
        }
        readArray(t) {
            var len = this.readInt();
            if (len < 0)
                return null;
            var arr = [];
            for (var i = 0; i < len; i++)
                arr.push(this.read(t));
            return arr;
        }
        readDict(k, t) {
            var len = this.readInt();
            if (len < 0)
                return null;
            var dict = {};
            for (var i = 0; i < len; i++)
                dict[this.read(k)] = this.read(t);
            return dict;
        }
        readTuple(t) {
            var tuple = [];
            for (var i = 0; i < t.length; i++)
                tuple[i] = this.read(t[i]);
            return tuple;
        }
    }
    EasyGame.StreamReader = StreamReader;
    class StreamWriter {
        constructor() {
            this.byteBuffer = new Uint8Array(64);
            this.dataView = new DataView(this.byteBuffer.buffer, 0, this.byteBuffer.length);
            this.pos = 0;
        }
        w(...args) {
            var ctx = this;
            for (var i = 0; i < arguments.length; i += 2) {
                write(arguments[i], arguments[i + 1]);
            }
            function checkBound(size) {
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
            function write(t, v) {
                if (typeof (t) === "number") {
                    if (t < 0) {
                        if (v == null)
                            return;
                        t = -t;
                    }
                    switch (t) {
                        case 1:
                            checkBound(1);
                            ctx.dataView.setInt8(ctx.pos, v ? 1 : 0);
                            ctx.pos++;
                            break;
                        case 2:
                            writeInt(v);
                            break;
                        case 3:
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
                        case 4:
                            checkBound(4);
                            ctx.dataView.setFloat32(ctx.pos, v, true);
                            ctx.pos += 4;
                            break;
                        case 5:
                            checkBound(2);
                            ctx.dataView.setInt16(ctx.pos, v, true);
                            ctx.pos += 2;
                            break;
                        case 6:
                            checkBound(2);
                            ctx.dataView.setInt16(ctx.pos, v, true);
                            ctx.pos += 2;
                            break;
                        case 7:
                            checkBound(1);
                            ctx.dataView.setUint8(ctx.pos, v);
                            ctx.pos += 1;
                            break;
                        case 8:
                            checkBound(8);
                            ctx.dataView.setFloat64(ctx.pos, v, true);
                            ctx.pos += 8;
                            break;
                        case 9:
                            checkBound(4);
                            ctx.dataView.setUint32(ctx.pos, v, true);
                            ctx.pos += 4;
                            break;
                        case 10:
                            checkBound(2);
                            ctx.dataView.setUint16(ctx.pos, v, true);
                            ctx.pos += 2;
                            break;
                        case 11:
                            checkBound(8);
                            ctx.dataView.setUint32(ctx.pos, v.low, true);
                            ctx.dataView.setInt32(ctx.pos + 4, v.high, true);
                            ctx.pos += 8;
                            break;
                        case 12:
                            ctx.dataView.setUint32(ctx.pos, v.low, true);
                            ctx.dataView.setUint32(ctx.pos + 4, v.high, true);
                            ctx.pos += 8;
                        case 13:
                            checkBound(8);
                            v = NumberToInt64(v.getTime() * 10000);
                            ctx.dataView.setUint32(ctx.pos, v.low, true);
                            ctx.dataView.setUint32(ctx.pos + 4, v.high, true);
                            ctx.pos += 8;
                            break;
                        case 14:
                            var bytes = [];
                            for (var i = 0; i < v.length; i++) {
                                if ((i & 7) == 0)
                                    bytes.push(0);
                                if (v[i])
                                    bytes[i >> 3] |= (1 << (i & 7));
                            }
                            for (i = 0; i < bytes.length; i++)
                                write(7, bytes[i]);
                            break;
                        case 18:
                            writeInt(v.length);
                            checkBound(v.length);
                            ctx.byteBuffer.set(v, ctx.pos);
                            ctx.pos += v.length;
                            break;
                    }
                }
                else if (Array.isArray(t)) {
                    switch (t[0]) {
                        case 15:
                            if (v == null)
                                writeInt(-1);
                            else {
                                writeInt(v.length);
                                for (var i = 0; i < v.length; i++)
                                    write(t[1], v[i]);
                            }
                            break;
                        case 16:
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
                        case 17:
                            for (var i = 0; i < t.length; i++)
                                write(t[i + 1], v[i]);
                            break;
                    }
                }
                else
                    t.write(ctx, v);
            }
        }
        checkBound(size) {
            if (this.pos + size > this.byteBuffer.length) {
                var buf = this.byteBuffer;
                this.byteBuffer = new Uint8Array((buf.length + size) * 2);
                this.byteBuffer.set(buf);
                this.dataView = new DataView(this.byteBuffer.buffer, 0, this.byteBuffer.length);
            }
        }
    }
    EasyGame.StreamWriter = StreamWriter;
    class ProxyBase {
        constructor(conn) {
            this.conn = conn;
            this.onError = e => { alert("Error: " + e.message); };
        }
        send(stream, onResult) {
            var buf = new Uint8Array(stream.byteBuffer.buffer, 0, stream.pos);
            this.conn.send(buf, onResult);
        }
        getResult(t, resolve, reject) {
            return function (s) {
                var r = s.readInt();
                if (r) {
                    var e = new Error(s.read(3));
                    e["code"] = r;
                    reject(e);
                }
                else if (resolve) {
                    if (t)
                        resolve(t(s));
                    else
                        resolve();
                }
            };
        }
    }
    EasyGame.ProxyBase = ProxyBase;
    let NetworkEvent;
    (function (NetworkEvent) {
        NetworkEvent[NetworkEvent["Issue"] = 0] = "Issue";
        NetworkEvent[NetworkEvent["Recover"] = 1] = "Recover";
        NetworkEvent[NetworkEvent["Error"] = 2] = "Error";
    })(NetworkEvent = EasyGame.NetworkEvent || (EasyGame.NetworkEvent = {}));
    class NotifyListener {
        constructor(url, session, networkEvent) {
            this.xhr = new XMLHttpRequest();
            this.reqId = 1;
            this.stubs = [];
            this.retry = 0;
            this.url = url;
            this.session = session;
            this.networkEvent = networkEvent;
            var ctx = this;
            setTimeout(function () { ctx.run(); }, 100);
        }
        addStub(stub) {
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
            };
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
    EasyGame.NotifyListener = NotifyListener;
    EasyGame.RequestTimeout = 5000;
    class RequestConnection {
        constructor(url, session, multiplex, networkEvent) {
            this.xhr = new XMLHttpRequest();
            this.reqId = 1;
            this.nextStep = [];
            this.retry = 0;
            this.url = url;
            this.session = session;
            this.buzy = false;
            this.multiplex = multiplex;
            this.networkEvent = networkEvent;
        }
        get queueLength() {
            return this.nextStep.length;
        }
        send(data, onResponse, resend) {
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
                    ctx.send(data, onResponse, true);
                };
                xhr.onerror = function (ev) {
                    ctx.buzy = false;
                    ctx.retry++;
                    Log.debug("request error, retry: %d", ctx.retry);
                    ctx.networkEvent(NetworkEvent.Issue, ctx.reqId);
                    if (ctx.retry > 5) {
                        ctx.reqId++;
                        ctx.networkEvent(NetworkEvent.Error, "timeout");
                        return;
                    }
                    setTimeout(() => {
                        ctx.send(data, onResponse, true);
                    }, 1000);
                };
                xhr.timeout = EasyGame.RequestTimeout * (ctx.retry + 1);
                xhr.send();
            }
        }
    }
    EasyGame.RequestConnection = RequestConnection;
    class WebSocketConnectionAdapter {
        constructor(path, conn) {
            this.path = path;
            this.conn = conn;
        }
        send(data, onResponse) {
            this.conn.send(this.path, data, onResponse);
        }
        get queueLength() {
            return this.conn.queueLength;
        }
    }
    EasyGame.WebSocketConnectionAdapter = WebSocketConnectionAdapter;
    EasyGame.RequestTimeout = 5000;
    function createWebSocketConnection(url, token, networkEvent) {
        var ws;
        var state = 0;
        var session;
        var reqQueue = [];
        var stubs = [];
        var notifyId = 1;
        var reqId = 1;
        var timer = -1;
        var retryTimes = 60;
        var pingTick;
        var pingPacket = new Uint8Array(1);
        pingPacket[0] = 3;
        function Obfuscation(byteView, pos, size, reqId) {
            var p = reqId & 0xff;
            for (var i = 0; i < size; i++) {
                byteView[i + pos] = p ^ byteView[i + pos];
                p = (p + 7) & 0xff;
            }
        }
        function send(path, data, onResponse) {
            if (LogProtocol)
                Log.debug("send req " + reqId);
            Obfuscation(data, 0, data.length, reqId);
            var writer = new StreamWriter();
            writer.w(2, 1, 2, reqId, 3, path);
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
            writer.w(2, 2, 2, notifyId);
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
                state = 5;
                open();
            }, EasyGame.RequestTimeout);
        }
        function sendimpl() {
            if (reqQueue.length == 0 || state != 1)
                return;
            var req = reqQueue[0];
            if (LogProtocol)
                Log.debug("send request " + req.id);
            ws.send(req.data);
            timer = setTimeout(ping, 500);
        }
        var conn = {
            addStub: function (stub) {
                stubs[stub.pid] = stub;
            },
            send: send
        };
        Object.defineProperty(conn, "queueLength", {
            get: function () {
                return reqQueue.length;
            }
        });
        function open() {
            Log.debug("connect to " + url);
            function onerror(ev) {
                console.error("connection error", ev);
                if (state == 1) {
                    state = 5;
                    open();
                }
                else if (state == 5) {
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
            }
            catch (e) {
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
                state = 2;
                getNotify();
            };
            ws.onmessage = function (ev) {
                networkEvent(NetworkEvent.Recover, "");
                if (state == 2) {
                    Log.debug("get session: " + ev.data);
                    session = ev.data;
                    state = 1;
                    retryTimes = 5;
                    sendimpl();
                }
                else {
                    var stream = new StreamReader(ev.data);
                    var type = stream.readInt();
                    if (type == 1) {
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
                    else if (type == 2) {
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
                    else if (type == 3) {
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
            };
            ws.onerror = onerror;
            ws.onclose = function (ev) {
                console.error("connection lost: ", ev);
                if (ev.code == 1000 || ev.code == 1011 || ev.code == 1003) {
                    networkEvent(NetworkEvent.Error, ev.reason);
                    return;
                }
                if (state == 1) {
                    networkEvent(NetworkEvent.Issue, "网络中断");
                    Log.debug(`开始重连...`);
                    state = 5;
                    open();
                }
            };
        }
        open();
        return conn;
    }
    EasyGame.createWebSocketConnection = createWebSocketConnection;
    class StubBase {
        constructor(pid) {
            this._reqCB = {};
            this._reqId = 0;
            this.pid = pid;
        }
        newReq(onResp) {
            this._reqId++;
            this._reqCB[this._reqId] = onResp;
            return this._reqId;
        }
        asyncCB(s) {
            var id = s.readInt();
            var cb = this._reqCB[id];
            delete this._reqCB[id];
            cb(s);
        }
        dispatch(s) {
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
    }
    EasyGame.StubBase = StubBase;
})(EasyGame || (EasyGame = {}));

//# sourceMappingURL=protocol.js.map
