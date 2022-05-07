import { App, Vec2, Vec4 } from "ave-ui";
import { makeObservable, observable, action } from "mobx";
import { assetPath } from "../utils";
import { Ii18n } from "./i18n";
import { IconDataMapType } from "./resource";

export enum MiniViewSelection {
	Baseline = 0,
	Current = 1,
}

export enum ThemeSelection {
	Light = 0,
	Dark = 1,
	Geek = 2,
}

export class ProgramState {
	blink: boolean;
	threshold: number;
	blendAlpha: number;
	zoom: number;
	pixelPos: Vec2;
	pixelColor: {
		baseline: Vec4;
		current: Vec4;
	};
	lockColor: boolean;
	baselineFile: string;
	currentFile: string;
	currentMiniView: MiniViewSelection;
	miniViewUpdateKey: number;
	currentTheme: ThemeSelection;

	// not ui related state
	private resMap: IconDataMapType;
	private app: App;
	private _i18n: Ii18n;

	constructor() {
		this.blink = false;
		this.threshold = 0.0;
		this.blendAlpha = 0.5;
		this.zoom = 1;
		this.pixelPos = new Vec2(0, 0);
		this.pixelColor = {
			baseline: new Vec4(0, 0, 0, 0),
			current: new Vec4(0, 0, 0, 0),
		};
		this.lockColor = false;
		this.baselineFile = assetPath("map-baseline.png");
		this.currentFile = assetPath("map-current.png");
		this.currentMiniView = MiniViewSelection.Baseline;
		this.miniViewUpdateKey = Date.now();
		this.currentTheme = ThemeSelection.Light;

		makeObservable(this, {
			blink: observable,
			setBlink: action,

			threshold: observable,
			setThreshold: action,

			blendAlpha: observable,
			setBlendAlpha: action,

			zoom: observable,
			setZoom: action,

			pixelPos: observable,
			setPixelPos: action,

			pixelColor: observable,
			setPixelColor: action,

			lockColor: observable,
			setLockColor: action,

			baselineFile: observable,
			setBaselineFile: action,

			currentFile: observable,
			setCurrentFile: action,

			currentMiniView: observable,
			setCurrentMiniView: action,

			miniViewUpdateKey: observable,
			setMiniViewUpdateKey: action,

			currentTheme: observable,
			setCurrentTheme: action,
		});
	}

	setI18n(i18n: Ii18n) {
		this._i18n = i18n;
	}

	get i18n() {
		return this._i18n;
	}

	setApp(app: App) {
		this.app = app;
	}

	getApp() {
		return this.app;
	}

	setResMap(resMap: IconDataMapType) {
		this.resMap = resMap;
	}

	getResMap(): IconDataMapType {
		return this.resMap as IconDataMapType;
	}

	setMiniViewUpdateKey(key: number) {
		this.miniViewUpdateKey = key;
	}

	setCurrentMiniView(selection: MiniViewSelection) {
		this.currentMiniView = selection;
	}

	setBaselineFile(file: string) {
		this.baselineFile = file;
	}

	setCurrentFile(file: string) {
		this.currentFile = file;
	}

	setLockColor(lock: boolean) {
		this.lockColor = lock;
	}

	setPixelColor(color: { baseline: Vec4; current: Vec4 }) {
		this.pixelColor = color;
	}

	setPixelPos(pos: Vec2) {
		this.pixelPos = pos;
	}

	setThreshold(threshold: number) {
		this.threshold = threshold;
	}

	setBlendAlpha(alpha: number) {
		this.blendAlpha = alpha;
	}

	setBlink(blink: boolean) {
		this.blink = blink;
	}

	setZoom(zoom: number) {
		this.zoom = zoom;
		console.log(`zoom: ${zoom}`);
	}

	setCurrentTheme(theme: ThemeSelection) {
		this.currentTheme = theme;
	}
}

export const state = new ProgramState();
