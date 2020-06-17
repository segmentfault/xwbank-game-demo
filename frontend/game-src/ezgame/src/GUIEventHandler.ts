/// <reference path="GUI.ts"/>

/**
 * @module GUI
*/
namespace ez.ui {
	/**
	 * 触摸事件处理基类
	 * 控件的触摸事件处理使用mixins方式混入控件类中，使一个触摸事件处理行为可以复用到多个控件类中。例如，
	 * 我们有多种Button控件类，都混入同一个Button事件处理类，使得这些Button控件类都具备Button的行为
	 * @category EventHandler
	 */
	export abstract class EventHandlerBase implements TouchHandler {
		disposed: boolean;
		class: UIClassData;
		id: string;
		left: Dimension;
		top: Dimension;
		right: Dimension;
		bottom: Dimension;
		x: Dimension;
		y: Dimension;
		width: Dimension;
		height: Dimension;
		opacity: number;
		visible: boolean;
		scaleX: number;
		scaleY: number;
		scale: number;
		angle: number;
		anchorX: number;
		anchorY: number;
		touchable: boolean;
		zIndex: number;
		state: string;
		culling: boolean;
		drawCache: boolean;
		clip: boolean;
		ownerBuffer: boolean;
		batchMode: boolean;
		textStyle: string;
		parent: Container;
		style: string;
		protected _bound: Rect;
		protected _parent: Container;
		measureBound: (w: number, h: number, force?: boolean) => void;
		findControls: (x: number, y: number) => Control[];
		fireEvent: (event: string, arg?: any, bubble?: boolean) => void;

		abstract onTouchBegin(d: TouchData);
		abstract onTouchMove(e: TouchData);
		abstract onTouchEnd(e: TouchData);
		abstract onTouchCancel(id: number);
	}

	class TabBtnEventHandler extends EventHandlerBase {
		group: TabGroup;

		onTouchBegin (d: TouchData) {
			if (this.state == "unselect") {
				this.state = "down";
				d.capture();
			}
			else if (this.state == "select") {
				this.state = "selectDown";
				d.capture();
			}
		}

		onTouchMove(d: TouchData){
		}

		onTouchCancel(id: number) {
			if (this.state == "down")
				this.state = "unselect";
			else if (this.state == "selectDown")
				this.state = "select";
		}

		onTouchEnd(d: TouchData) {
			if (this.state == "down") {
				var pt = this.parent.screenToClient(d.screenX, d.screenY);
				if (this.group && this._bound && this._bound.containsPt(pt)) {
					this.state = "select";
					this.group.select(this);
				}
				else
					this.state = "unselect";
			}
			else if (this.state == "selectDown")
				this.state = "select";
		}
	}

	/** 
	* 绑定标签按钮元素的触摸事件
	* @param uiClass 控件类
	* @category EventHandler
	*/
	export function addTabBtnEventHandler(uiClass: ControlClass) {
		uiClass.checkStates("unselect", "down", "select", "selectDown");
		uiClass.mixins(TabBtnEventHandler);
	}

	class ButtonEventHandler extends EventHandlerBase {
		btnScale: number;
		sfx: string;
		_ani: Tween;
		_initScale: number;

		onCreate(){
			this._initScale = this.scale || 1;
		}
		stopAni() {
			if (this._ani) {
				this._ani.stop();
				this._ani = undefined;
			}
		}
		onTouchBegin(d: TouchData) {
			if (this.state == "normal") {
				this.state = "down";
				this.stopAni();
				this._ani = Tween.add(this).move({ scale: [this._initScale, this._initScale * this.btnScale] }, 100).play();
				d.capture();
			}
		}
		onTouchMove(d: TouchData) {
			if (this.state == "down") {
				var pt = this.parent.screenToClient(d.screenX, d.screenY);
				if (this._bound && !this._bound.containsPt(pt)) {
					this.stopAni();
					if (this.scale)
						this._ani = Tween.add(this).move({ scale: [this.scale, this._initScale] }, 100, Ease.sineOut).play();
				}
				else if (!this._ani || this._ani.state == MediaState.Stop) {
					this._ani = undefined;
					this.scale = this._initScale * this.btnScale;
				}
			}
		}
		onTouchEnd(d: TouchData) {
			if (this.state == "down") {
				this.state = "normal";
				this.stopAni();
				this._ani = Tween.add(this).move({ scale: [this.scale, this._initScale] }, 100, Ease.sineOut);
				this._ani.play();
				var pt = this.parent.screenToClient(d.screenX, d.screenY);
				if (this._bound && this._bound.containsPt(pt)) {
					if (this.sfx)
						playSFX(this.sfx);
					this.fireEvent("click");
				}
			}
		}
		onTouchCancel(id: number) {
			if (this.state == "down") {
				this.stopAni();
				this.scale = undefined;
				this.state = "normal";
			}
		}
	}
	
	/** 
	* 绑定按钮元素的触摸事件
	*  控件需要有normal,down两个状态
	* @category EventHandler
	* @param uiClass 控件类
	* @param btnSalce 设置按钮按下时缩小的比例
	* @param snd 设置点击按钮时的音效
	*/
	export function addButtonEventHandler(uiClass: ControlClass, btnScale?: number, snd?: string) {
		if (!uiClass.prototype.hasOwnProperty("btnScale"))
			uiClass.prototype.btnScale = btnScale || 0.85;
		if (snd)
			uiClass.prototype.sfx = snd;
		uiClass.checkStates("normal", "down");
		uiClass.mixins(ButtonEventHandler);
	}

	class CheckboxEventHandler extends EventHandlerBase {
		btnScale: number;
		sfx: string;
		_ani: Tween;
		_initScale: number;
		_push = false;

		onCreate() {
			this._initScale = this.scale || 1;
		}
		stopAni() {
			if (this._ani) {
				this._ani.stop();
				this._ani = undefined;
			}
		}
		onTouchBegin(d: TouchData) {
			if (!this._push) {
				this._push = true;
				this.stopAni();
				this._ani = Tween.add(this).move({ scale: [this._initScale, this._initScale * this.btnScale] }, 100).play();
				d.capture();
			}
		}
		onTouchCancel(id: number) {
			if (this._push) {
				this.stopAni();
				this.scale = undefined;
			}
			this._push = false;
		}
		onTouchMove(d: TouchData) {
			if (this._push) {
				var pt = this.parent.screenToClient(d.screenX, d.screenY);
				if (this._bound && !this._bound.containsPt(pt)) {
					this.stopAni();
					if (this.scale)
						this._ani = Tween.add(this).move({ scale: [this.scale, this._initScale] }, 100, Ease.sineOut).play();
				}
				else if (!this._ani || this._ani.state == MediaState.Stop) {
					this._ani = undefined;
					this.scale = this._initScale * this.btnScale;
				}
			}
		}
		onTouchEnd(d: TouchData) {
			if (this._push) {
				this.stopAni();
				this._ani = Tween.add(this).move({ scale: [this.scale, this._initScale] }, 100, Ease.sineOut);
				this._ani.play();
				var pt = this.parent.screenToClient(d.screenX, d.screenY);
				if (this._bound && this._bound.containsPt(pt)) {
					if (this.state == "check")
						this.state = "uncheck";
					else
						this.state = "check";
					if (this.sfx)
						playSFX(this.sfx);
					this.fireEvent("click");
				}
			}
			this._push = false;
		}
	}

	/**
	*  给控件绑定确认框的事件处理
	*  控件需要有uncheck,check两个状态
	* @category EventHandler
	* @param uiClass: 控件类
	* @param btnSalce: 设置按钮按下时缩小的比例
	* @param snd: 设置点击按钮时的音效
	*/
	export function addCheckboxEventHandler(uiClass: ControlClass, btnScale?: number, snd?: string) {
		if (!uiClass.prototype.hasOwnProperty("btnScale"))
			uiClass.prototype.btnScale = btnScale || 0.85;
		if (snd)
			uiClass.prototype.sfx = snd;
		uiClass.checkStates("uncheck", "check");
		uiClass.mixins(CheckboxEventHandler);
	}
}
