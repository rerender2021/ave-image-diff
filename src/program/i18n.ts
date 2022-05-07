import { App, CultureId } from "ave-ui";

export interface ILang {
	// ave built-in language key
	AppTitle: string;
	CoOk: string;
	__FontStd: string;

	// user defined key
	MiniView: string;
	Theme: string;
	Mode: string;
	Threshold: string;
	BlendAlpha: string;
	Zoom: string;
	Blink: string;
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
				AppTitle: "Color Picker",
				CoOk: "OK",
				__FontStd: "Segoe UI",

				//
				MiniView: "Mini View",
				Theme: "Theme",
				Mode: "Mode",
				Threshold: "Threshold",
				BlendAlpha: "Blend Alpha",
				Zoom: "Zoom",
				Blink: "Blink",
			},
			[CultureId.zh_cn]: {
				AppTitle: "颜色选择器",
				CoOk: "好的",
				__FontStd: "Microsoft YaHei UI",

				//
				MiniView: "迷你视图",
				Theme: "主题",
				Mode: "模式",
				Threshold: "阈值",
				BlendAlpha: "透明度",
				Zoom: "缩放",
				Blink: "闪烁切换",
			},
		},
	};

	return i18n;
}
