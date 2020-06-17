/**
 * 基础类型
 * @module CommonTypes
 */
namespace ez {
	/**
	 * 可销毁对象接口
	*/
	export interface IDispose {
		/**
		 * 销毁对象
		*/
		dispose(): void;
		/**
		 * 对象是否已被销毁
		*/
		disposed: boolean;
		/**
		* 销毁时回调函数
		*/
		onDispose?: Function;
	}

	/** 
	* 集合改变事件
	*/
	export const enum CollectionChangeType {
		add,
		update,
		remove,
		set,
		clear
	}

	function removeThis() {
		if (this._p) {
			this.disposed = true;
			this._p.remove(this);
			this._p = null;
		}
	}

	/** 
	* 集合数据源
	* @remark 在集合数据源上可以获取数据项添加/删除/修改的通知
	*/
	export class DataCollection implements IDispose {
		private _items: any[] = [];
		private _observers: any;
		
		private remove(t) {
			if (this._observers == t) {
				this._observers = null;
				return;
			}
			if (Array.isArray(this._observers)) {
				var idx = this._observers.indexOf(t);
				if (idx != -1)
					this._observers.splice(idx, 1);
			}
		}

		private static dataChangeNotify(observers, type, index?, item?) {
			if (!observers)
				return;
			if (Array.isArray(observers)) {
				for (var i = 0; i < observers.length; i++) {
					var o = observers[i];
					o.func.call(o.ctx, type, index, item);
				}
			}
			else
				observers.func.call(observers.ctx, type, index, item);
		}

		public constructor(items?: any[]) {
			this.addItems(items);
		}
		/**
		* 所有的数据项
	    * @remark 只读属性，对数据集进行的直接修改将不会产生通知事件
		*/
		public get items():any[] {
			return this._items;
		}
		/**
		* 获取数据项
		* @param index: 索引下标
		*/
		public getItem(index: number): any {
			return this._items[index];
		}
		/**
		* 在idx位置前插入一个数据项
		* @param idx: 插入位置
		* @param item: 数据项
		*/
		public insertItem(idx: number, item: any): void {
			if (idx < 0 || idx >= this._items.length)
				throw new Error("out of range.");
			this._items.splice(idx, 0, item);
			DataCollection.dataChangeNotify(this._observers, CollectionChangeType.add, idx, item);
		}
		/**
		* 添加一批数据集到数据源中
		* @param items: 数据集
		*/
		public addItems(items: any[]): void {
			if (!items)
				return;
			for (var i = 0; i < items.length; i++) {
				var len = this._items.push(items[i]);
				DataCollection.dataChangeNotify(this._observers, CollectionChangeType.set, len - 1, items[i]);
			}
		}
		/**
		* 重新设置数据集合
		* @param items 数据集合
		*/
		public setItems(items: any[]) {
			if(!items)
				items = [];
			this._items = items;
			DataCollection.dataChangeNotify(this._observers, CollectionChangeType.set, 0, items);
		}
		/**
		* 添加一个数据项
		* @param item 数据项
		*/
		public addItem(item: any) {
			var len = this._items.push(item);
			DataCollection.dataChangeNotify(this._observers, CollectionChangeType.add, len - 1, item);
		}
		/**
		* 删除idx位置的数据项
		* @param idx 要删除的数据项索引
		*/
		public removeIndex(idx: number) {
			if (idx < 0 || idx >= this.items.length)
				throw new RangeError();
			var item = this._items[idx];
			this._items.splice(idx, 1);
			DataCollection.dataChangeNotify(this._observers, CollectionChangeType.remove, idx, item);
		}
		/**
		* 删除一个数据项
		* @param item 要删除的数据项
		*/
		public removeItem(item: any) {
			var idx = this._items.indexOf(item);
			if (idx == -1)
				throw new Error("item not exist!");
			this._items.splice(idx, 1);
			DataCollection.dataChangeNotify(this._observers, CollectionChangeType.remove, idx, item);
		}
		/**
		* 更新idx位置的数据项
		* @param idx 索引下标
		* @param item 数据项
		*/
		public updateItem(idx: number, item: any) {
			if (idx < 0 || idx >= this.items.length)
				throw new RangeError();
			this._items[idx] = item;
			DataCollection.dataChangeNotify(this._observers, CollectionChangeType.update, idx, item);
		}
		/**
		* 清除数据集
		*/
		public clear() {
			this._items = [];
			DataCollection.dataChangeNotify(this._observers, CollectionChangeType.clear);
		}
        /**
		* 添加一个观察者，监听增删改事件
		* @param func: 事件通知处理函数
		*/
		public addObserver(func: (type: CollectionChangeType, index?: number, item?: any) => void, thisArg?: any): IDispose {
			var t = { func: func, ctx: thisArg, _p: this, disposed: false, dispose: removeThis };
			if (!this._observers)
				this._observers = t;
			else {
				if (Array.isArray(this._observers))
					this._observers.push(t);
				else
					this._observers = [this._observers, t];
			}
			return t;
		}
		/**
		* 清除所有观察者
		*/
		public clearObservers(): void {
			this._observers = null;
		}
		/**
		* 销毁数据集
		*/
		public dispose():void {
			this._items = null;
			this._observers = null;
		}
		public get disposed():boolean {
			return this._items == null;
		}
	}

	/** 
	* 数据模型对象
	* @remark 可以动态添加/删除/修改属性，属性的修改可以添加观察者来获得通知，可以添加数据绑定来同步2个对象间的属性值
	*/
	export class DataModel implements IDispose {
		private _props = {};
		private _observers = {};
		private _converters = null;
		private _defaults = null;
		private _settingProp = "";

		private remove(t) {
			var name = t.name;
			var n = this._observers[name];
			if (Array.isArray(n)) {
				var arr = (<Array<Object>>n);
				var idx = arr.indexOf(t);
				if (idx != -1)
					arr.splice(idx, 1);
			}
			else if (n == t)
				delete this._observers[name];
		}

		public constructor(data?: Object) {
			for (var k in data)
				this.setProp(k, data[k]);
		}
		/**
		 * 设置属性默认值，当属性值不存在或为undefined时使用default中的值
		 */
		public setDefaults(vals: Dictionary<any>){
			this._defaults = vals;
		}

		/**
		* 设置一组属性转换器，当设置属性值时会先经过转换器转换
		*/
		public setPropConverters(conterters: Dictionary<(val: any) => any>) {
			this._converters = conterters;
		}
		/**
		* 获取属性
		* @param name 属性名
		*/
		public getProp(name: string): any {
			let v = this._props[name];
			if (v === undefined && this._defaults)
				return this._defaults[name];
			return v;
		}
		/**
		* 是否具有某个属性
		* @param name 属性名
		*/
		public hasProp(name: string): boolean {
			return this._props.hasOwnProperty(name);
		}
		/**
		* 设置属性
		* @remark 当属性发生改变时observer将会得到通知
		* @param name 属性名
		* @param val 属性值
		*/
		public setProp(name: string, val: any) {
			var conv = this._converters?.[name];
			if(conv && val !== undefined)
				val = conv.call(this, val);
			var old = this._props[name];
			if (old === val)
				return;
			this._props[name] = val;
			if (this._settingProp === name)
				return;
			if (val === undefined && this._defaults)
				val = this._defaults[name];
			this._settingProp = name;
			
			var t = this._observers[name];
			if (t) {
				if (Array.isArray(t)){
					for (let i = 0; i < t.length; i++) {
						let n = t[i];
						n(val, old);
						if (n != t[i])//observer被移除，调整下i
							i--;
					}
				}
				else
					t(val, old);
			}
			this._settingProp = "";
		}
		/**
		 * 将source里的所有属性设置到DataModel上
		 */
		public setData(source: Dictionary<any>) {
			for (var p in this._props) {
				if (source[p] !== undefined)
					this.setProp(p, source[p]);
			}
		}
		/**
		 * 删除属性
		 * @param name 属性名
		 */
		public removeProp(name: string) {
			var old = this._props[name];
			if (old === undefined)
				return;
			this.setProp(name, undefined);
			delete this._props[name];
		}

		/**
		* 在属性上添加一个观察者获取属性变化通知
		* @param name 属性名
		* @param func 属性变更处理函数
		*/
		public addObserver(name: string, func: (newVal: any, oldVal?: any) => void, thisArg?: any): IDispose {
			var f = <any>func.bind(thisArg);
			var ctx = this;
			f.dispose = function(){
				if (!ctx)
					return;
				var n = ctx._observers[name];
				if (Array.isArray(n)) {
					var idx = n.indexOf(this);
					if (idx != -1)
						n.splice(idx, 1);
				}
				else if (n == this)
					delete ctx._observers[name];
				ctx = undefined;
				if (this.onDispose)
					this.onDispose();
			}
			Object.defineProperty(f, "disposed", {
				get: function () { return !ctx; },
				enumerable: true,
				configurable: false
			});
			var t = ctx._observers[name];
			if (!t)
				ctx._observers[name] = f;
			else{
				if (Array.isArray(t))
					t.push(f);
				else
					t = [t, f];
			}
			return f;
		}
		/**
		* 属性绑定
		* @remark 当DataModel的属性变化时自动将目标对象的属性更新为最新的值，通过转换器可以将值进行相应的修改后在设置到目标对象上
		* @param propName 属性名
		* @param target 目标对象，目标对象可以为DataModel或者普通JS对象
		* @param targetProp 目标对象的属性
		* @param converter 属性转换器
		* @returns 绑定对象，可调用dispose()方法解除绑定
		*/
		public bind(propName: string, target: DataModel|Object, targetProp?: string, converter?: (val: any) => any): IDispose {
			var srcOb: IDispose;
			targetProp = targetProp || propName;
			function valChanged(newVal: any) {
				if ((<DataModel>target).disposed) {
					srcOb.dispose();
					srcOb = undefined;
					return;
				}
				if (converter)
					newVal = converter(newVal);
				if ((<DataModel>target).setProp)
					(<DataModel>target).setProp(targetProp, newVal);
				else
					target[targetProp] = newVal;
			}
			srcOb = this.addObserver(propName, valChanged);
			if (this.hasProp(propName))
				valChanged(this.getProp(propName));
			return srcOb;
		}
		/**
		* 两个DataModel双向属性绑定
		* @param propName 属性名
		* @param target 目标对象
		* @param targetProp 目标对象的属性
		* @returns 绑定对象，可调用对象的dispose()方法解除绑定
		*/
		public bind2way(propName: string, target: DataModel, targetProp?: string): IDispose {
			var srcOb: IDispose;
			var targetOb: IDispose;
			var srcChange: boolean;
			var src = this;
			function dispose() {
				if (srcOb) {
					srcOb.dispose();
					srcOb = undefined;
				}
				if (targetOb) {
					targetOb.dispose();
					targetOb = undefined;
				}
				src = undefined;
				target = undefined;
			}
			function srcChanged(newVal: any) {
				if (srcChange)
					return;
				if (target.disposed) {
					dispose();
					return;
				}
				srcChange = true;
				target.setProp(targetProp, newVal);
				srcChange = false;
			}
			function targetChanged(newVal: any) {
				if (srcChange)
					return;
				if (src.disposed) {
					dispose();
					return;
				}
				srcChange = true;
				src.setProp(propName, newVal);
				srcChange = false;
			}
			srcOb = src.addObserver(propName, srcChanged);
			targetOb = target.addObserver(targetProp, targetChanged);
			if (src.hasProp(propName))
				srcChanged(src.getProp(propName));

			var o = { dispose: dispose };
			Object.defineProperty(o, "disposed", {
				get: function () { return !srcOb; },
				enumerable: true,
				configurable: false
			})
			return <IDispose>o;
		}
		/**
		* 清除这个属性上的所有观察者
		*/
		public clearObserver(name: string) {
			delete this._observers[name];
		}
		/**
		* 销毁时回调函数
		*/
		public onDispose: Function;
		/**
		 * 对象是否已销毁
		 */
		public get disposed():boolean {
			return this._props == null;
		}
		/**
		* 销毁对象
		*/
		public dispose() {
			this._props = null;
			this._converters = null;
			this._observers = null;
			if (this.onDispose)
				this.onDispose();
		}
	}
} 