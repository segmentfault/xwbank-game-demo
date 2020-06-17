/**
 * 开发调试工具
 */
declare module inspector {

    interface ArgDesc {

        name: string;

        default?: any;

        options?: string[];
	}

    interface Testcase extends Function {

        name: string;

        Arguments?: ArgDesc[];
	}

    /**
     * 初始化调试工具
     * @remark 在引擎初始化后调用这个方法就可以连上ezgame devtools进行调试
     */
    export function install(): void;

    /**
     * 添加测试用例
     */
    export function addTestcase(testcases: {
        [key: string]: Testcase;
    }): void;
}