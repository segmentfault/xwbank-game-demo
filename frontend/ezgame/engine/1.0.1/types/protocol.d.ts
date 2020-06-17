declare var LogProtocol: boolean;

declare namespace EasyGame {

    const enum Primitive {
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
    }

    var Type: any;

    interface Dictionary<T> {

        [key: number]: T;

        [key: string]: T;
	}

    interface ObjectSerializer {

        read(s: StreamReader): any;

        write(s: StreamWriter, obj: any): any;
	}

    interface Int64 {

        low: number;

        high: number;
	}

    function NumberToInt64(v: number): {
        low: number;
        high: number;
    };

    function Int64ToNumber(v: Int64): number;

    class StreamReader {

        pos: number;

        buffer: ArrayBuffer;

        dataView: DataView;

        byteView: Uint8Array;

        constructor(data: ArrayBuffer, length?: number);

        checkBound(size: number): void;

        readInt(): number;

        read(t: number | ObjectSerializer): any;

        readBits(count: number): boolean[];

        readArray(t: number | ObjectSerializer): Array<any>;

        readDict(k: number, t: number | ObjectSerializer): any;

        readTuple(t: any[]): any[];
	}

    class StreamWriter {

        pos: number;

        dataView: DataView;

        byteBuffer: Uint8Array;

        constructor();

        w(...args: any[]): void;

        checkBound(size: number): void;
	}

    interface Connection {

        send(data: Uint8Array, onResponse?: (s: StreamReader) => void): any;

        newReq?: (id: any, onResponse?: (err: any, response: ArrayBuffer) => void) => void;

        setStub?: (stub: IStubBase) => void;

        addStub?: (stub: IStubBase) => void;

        handshake?: (pid: number, version: number, onReslut: (err: EasyGame.ServiceError) => void) => void;

        queueLength: number;
	}

    interface IStubBase {

        pid: number;

        dispatch(s: EasyGame.StreamReader): any;
	}

    interface ServiceError {

        errCode: number;

        errMsg: string;
	}

    class ProxyBase {

        conn: Connection;

        onError: (e: Error) => void;

        constructor(conn: Connection);

        protected send(stream: StreamWriter, onResult?: (s: StreamReader) => void): void;

        protected getResult(t: any, resolve: any, reject: any): (s: StreamReader) => void;
	}

    enum NetworkEvent {
        Issue = 0,
        Recover = 1,
        Error = 2
    }

    class NotifyListener {

        constructor(url: string, session: string, networkEvent: Function);

        addStub(stub: IStubBase): void;

        stop(): void;

        run(): void;
	}

    var RequestTimeout: number;

    class RequestConnection implements Connection {

        readonly queueLength: number;

        xhr: XMLHttpRequest;

        url: string;

        session: string;

        constructor(url: string, session: string, multiplex: boolean, networkEvent: Function);

        send(data: Uint8Array, onResponse?: (response: EasyGame.StreamReader) => void, resend?: boolean): void;
	}

    interface IWebSocketConnection {

        queueLength: number;

        addStub(stub: IStubBase): any;

        send(path: string, data: Uint8Array, onResponse?: (response: EasyGame.StreamReader) => void): any;
	}

    class WebSocketConnectionAdapter implements Connection {

        readonly queueLength: number;

        path: string;

        conn: IWebSocketConnection;

        constructor(path: string, conn: IWebSocketConnection);

        send(data: Uint8Array, onResponse?: (s: StreamReader) => void): void;
	}

    var RequestTimeout: number;

    function createWebSocketConnection(url: string, token: string, networkEvent: Function): IWebSocketConnection;

    class StubBase {

        protected _reqCB: {};

        protected _reqId: number;

        pid: number;

        newReq(onResp: (s: EasyGame.StreamReader) => void): number;

        dispatch(s: EasyGame.StreamReader): void;

        dispMethods: (dispId: any, s: EasyGame.StreamReader) => void;

        constructor(pid: number);
	}
}