import { App, CultureId } from "ave-ui";

export interface ILang {
	// ave built-in language key
	AppTitle: string;
	CoOk: string;
	__FontStd: string;

	// user defined key
	Scale0: string;
	Scale1: string;
	MiniView: string;
	Theme: string;
	Mode: string;
	Threshold: string;
	BlendAlpha: string;
	Zoom: string;
	Blink: string;
	BaselinePosition: string;
	CurrentPosition: string;
	MiniViewType0: string;
	MiniViewType1: string;
	ThemeType0: string;
	ThemeType1: string;
	ThemeType2: string;
}

export type KeyOfLang = keyof ILang;

export interface Ii18n {
	t(key: keyof ILang, toReplace?: object): string;
	switch(id: CultureId): void;
	lang: Partial<Record<CultureId, ILang>>;
}

export function initI18n(app: App) {
	const i18n: Ii18n = {
		t(key: keyof ILang, toReplace: object = {}) {
			let result = app.LangGetString(key);
			Object.keys(toReplace).forEach((each) => {
				result = result.replace(`{{${each}}}`, toReplace[each]);
			});
			return result;
		},
		switch(this: Ii18n, id: CultureId) {
			app.LangSetDefaultString(id, this.lang[id]);
			app.LangSetCurrent(id);
		},
		lang: {
			[CultureId.en_us]: {
				AppTitle: "Image Diff",
				CoOk: "OK",
				__FontStd: "Segoe UI",

				//
				Scale0: "Use System Setting",
				Scale1: "Use Monitor Optimized",
				MiniView: "Mini View",
				Theme: "Theme",
				Mode: "Mode",
				Threshold: "Tolerance",
				BlendAlpha: "Blend Alpha",
				Zoom: "Zoom",
				Blink: "Blink",
				BaselinePosition: "Baseline Position: {{x}}, {{y}}",
				CurrentPosition: "Current Position: {{x}}, {{y}}",
				MiniViewType0: "Baseline",
				MiniViewType1: "Current",
				ThemeType0: "Light",
				ThemeType1: "Dark",
				ThemeType2: "Geek",
			},
			[CultureId.zh_cn]: {
				AppTitle: "图像对比",
				CoOk: "好的",
				__FontStd: "Microsoft YaHei UI",

				//
				Scale0: "使用系统设置",
				Scale1: "使用显示器推荐",
				MiniView: "迷你视图",
				Theme: "主题",
				Mode: "模式",
				Threshold: "允许误差",
				BlendAlpha: "透明度",
				Zoom: "缩放",
				Blink: "闪烁切换",
				BaselinePosition: "基准图位置: {{x}}, {{y}}",
				CurrentPosition: "当前图位置: {{x}}, {{y}}",
				MiniViewType0: "基准图",
				MiniViewType1: "当前图",
				ThemeType0: "亮色",
				ThemeType1: "暗色",
				ThemeType2: "极客风",
			},
		},
	};

	return i18n;
}
