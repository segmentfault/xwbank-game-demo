/// <reference path="CommonTypes.ts"/>

/**@internal */
interface NativeAudioDefine {
	setMusicVolume(track: number, val: number);
	setSFXVolume(val: number);
	playSFX(name: string);
	stopMusic(track: number, fadeOut?: number);
	playMusic(track: number, name: string, volume:number, loop: boolean, fadeIn: number);
}

/**@internal */
declare var NativeAudio: NativeAudioDefine;

/**
 * 声音模块
 * @module Audio
 */
namespace ez {
	/** @internal */
	export var WebAudio: AudioContext = null;
	var tracks: { gain: GainNode, node: AudioBufferSourceNode }[] = [];
	var bgmGain: GainNode;
	var sfxGain: GainNode;
	var started = false;
	var musicAudio: HTMLAudioElement;
	var sfxVolume: number = 1;
	var bgmVolume: number = 1;
	var nativeAudio: NativeAudioDefine;

	/** 
	 * 是否允许背景音乐播放
	*/
	export var bgmEnable = true;
	/**
	 * 是否允许音效播放
	 * @category Audio
	*/
	export var sfxEnable = true;

	if(typeof NativeAudio != "undefined")
		nativeAudio = NativeAudio;

	if (!nativeAudio && PLATFORM != Platform.WeiXin){
		initCall(function() {
			var c = window.AudioContext || window["webkitAudioContext"];
			if (c) {
				WebAudio = new c();
				sfxGain = WebAudio.createGain();
				sfxGain.gain.value = 1;
				sfxGain.connect(WebAudio.destination);
				bgmGain = WebAudio.createGain();
				bgmGain.gain.value = 1;
				bgmGain.connect(WebAudio.destination);
			}
		});
	}

	export namespace internal {
		export function startAudio() {
			if (nativeAudio || started || !WebAudio)
				return;
			started = true;
			var buf = WebAudio.createBuffer(1, 4410, 44100);
			var src = WebAudio.createBufferSource();
			src.buffer = buf;
			src.connect(sfxGain);
			src.start(0);
		}
	}

	/** 
	* 设置音乐的音量
	* @param val 音量 0 ~ 1
	*/
	export function setBGMVolume(val: number) {
		//bgmVol = val;
		if (musicAudio)
			musicAudio.volume = val;
		bgmVolume = val;
		if (nativeAudio) {
			nativeAudio.setMusicVolume(0, val);
			return;
		}
		if (!WebAudio)
			return;
		bgmGain.gain.value = val;
		//if(tracks[track])
		//	tracks[track].gain.gain.value = val;
	}

	/** 
	* 设置音效的音量
	* @param val 音量 0 ~ 1
	*/
	export function setSFXVolume(val: number) {
		sfxVolume = val;
		if (nativeAudio) {
			nativeAudio.setSFXVolume(val);
			return;
		}
		if (!WebAudio)
			return;
		sfxGain.gain.value = val;
	}

	/** 
	* 播放音效
	* @param name 资源名
	*/
	export function playSFX(name: string) {
		if (!sfxEnable)
			return;
		var res = getRes(name);
		if (!res)
			return;
		if (nativeAudio) {
			nativeAudio.playSFX(getUrl(res.url));
			return;
		}
		else if (WebAudio) {
			function play(buf) {
				var src = WebAudio.createBufferSource();
				src.buffer = buf;
				src.connect(sfxGain);
				src.start(0);
			}
			if (res.state == ResState.Ready)
				play(res.getData());
			else if (res.state != ResState.Error) {
				res.load(r => {
					if (r)
						play(res.getData());
				}, null);
			}
		}
		else {
			function playAudio(audio: HTMLAudioElement | wx.InnerAudioContext) {
				audio.currentTime = 0;
				audio.volume = sfxVolume;
				audio.play();
			}
			if (res.state == ResState.Ready)
				playAudio(<HTMLAudioElement>res.getData());
			else {
				res.load(r => {
					if (r)
						playAudio(<HTMLAudioElement>res.getData());
				}, null);
			}
		}
	}

	//var musicNode: AudioBufferSourceNode;

	/** 
	* 音乐播放停止
	* @param fadeOut 设置音乐淡出效果的时间
	*/
	export function stopMusic(track: number, fadeOut?: number) {
		if (!bgmEnable)
			return;
		if (nativeAudio) {
			nativeAudio.stopMusic(track, fadeOut);
			return;
		}

		if (WebAudio) {
			if (!tracks[track] || !tracks[track].node)
				return;
			var t = tracks[track];
			if (fadeOut) {
				var node = t.node;
				//t.gain.gain.setValueAtTime(1, AudioContext.currentTime);
				t.gain.gain.linearRampToValueAtTime(0, WebAudio.currentTime + fadeOut * 0.001);
				setTimer(fadeOut + 10, () => {
					node.stop(0);
					node.disconnect();
				});
			}
			else {
				try {
					t.node.stop(0);
					t.node.disconnect();
				} catch (e) {
					Log.error("stop music error: %o", e);
				}
				t.node = null;
			}
		}
		else {
			if (!musicAudio)
				return;
			if (fadeOut) {
				var audio = musicAudio;
				musicAudio = null;
				audio.volume = 0.7;
				setTimer(fadeOut * 0.5, () => {
					audio.volume = 0.3;
					setTimer(fadeOut * 0.5, () => {
						audio.currentTime = 10000;
						audio.volume = 0;
						audio.loop = false;
						audio.pause();
						audio.volume = 0;
					});
				});
			}
			else {
				musicAudio.currentTime = 10000;
				musicAudio.volume = 0;
				musicAudio.loop = false;
				musicAudio.pause();
				musicAudio = null;
			}
		}
	}

	function getUrl(url: string) {
		var prefix = url.substring(0, 4);
		if (prefix != "http" && prefix != "file") {
			var href = window.location.href;
			url = href.substring(0, href.lastIndexOf("/") + 1) + url;
		}
		return url;
	}
	/** 
	* 音乐播放
	* @param track 音轨号
	* @param name 资源名
	* @param loop 是否循环播放，默认false
	* @param volume 音量, 默认1
	* @param fadeIn 设置音乐淡入效果的时间(ms)
	*/
	export function playMusic(track: number, name: string, loop?: boolean, volume?: number, fadeIn?: number) {
		if (!bgmEnable)
			return;
		volume = volume || 1;
		loop = !!loop;
		var res = getRes(name);
		if (!res)
			return;
		if (nativeAudio) {
			nativeAudio.playMusic(track, getUrl(res.url), volume, loop, fadeIn || 0);
			return;
		}
		stopMusic(track);
		if (WebAudio) {
			function play(buf) {
				stopMusic(track);
				if (!tracks[track]) {
					tracks[track] = { gain: WebAudio.createGain(), node: null };
					tracks[track].gain.connect(bgmGain);
				}
				var t = tracks[track];
				t.node = WebAudio.createBufferSource();
				t.node.buffer = buf;
				if (loop)
					t.node.loop = true;

				if (fadeIn) {
					var gain = t.gain.gain;
					gain.value = 0;
					//gain.setValueAtTime(0, AudioContext.currentTime);
					gain.linearRampToValueAtTime(volume, WebAudio.currentTime + fadeIn * 0.001);
				}
				else
					t.gain.gain.value = volume;
				t.node.connect(t.gain);
				t.node.start(0);
			}
			if (res.state == ResState.Ready)
				play(res.getData());
			else if (res.state != ResState.Error) {
				res.load(r => {
					if (r)
						play(res.getData());
				}, null);
			}
		}
		else {
			function playAudio(audio: HTMLAudioElement) {
				musicAudio = audio;
				audio.currentTime = 0;
				audio.volume = bgmVolume;
				audio.loop = !!loop;
				audio.play();
			}

			if (res.state == ResState.Ready)
				playAudio(<HTMLAudioElement>res.getData());
			else {
				res.load(r => {
					if (r)
						playAudio(<HTMLAudioElement>res.getData());
				}, null);
			}
		}
	}
} 