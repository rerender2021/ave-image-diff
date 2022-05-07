import { App, WindowCreation, Window, WindowFlag, ThemeImage, ThemePredefined_Dark, ThemeFileImage, ResourceSource, ThemeFile, Menu, MenuItem, CultureId, MenuType, ToolBar, ToolBarItem, ToolBarItemType, IconSource } from "ave-ui";
import { autorun } from "mobx";
import { assetPath } from "../utils";
import { Main } from "./components";
import { initI18n } from "./i18n";
import { iconDataMap } from "./resource";
import { state, ThemeSelection } from "./state";

export class Program {
	private app: App;
	private window: Window;

	private mainArea: Main;

	private theme: ThemeImage;
	private themeDark: ThemePredefined_Dark;
	private themeGeek: ThemeFileImage;

	constructor() {
		this.app = new App();
		state.setApp(this.app);

		const resMap = this.app.CreateResourceMap(this.app, [16], iconDataMap);
		state.setResMap(resMap);

		const i18n = initI18n(this.app);
		state.setI18n(i18n);

		this.theme = new ThemeImage();
		this.themeDark = new ThemePredefined_Dark();
		this.themeGeek = new ThemeFileImage();
		if (!this.themeGeek.Open(ResourceSource.FromPackedFile(assetPath("HyperEmerald.ave-theme-image")))) this.themeGeek = null;

		const cpWindow = new WindowCreation();
		cpWindow.Title = "Image Diff";
		cpWindow.Flag |= WindowFlag.Layered;
		cpWindow.Theme = this.theme;

		this.window = new Window(cpWindow);
	}

	run() {
		this.watch();
		this.onCreateContent();
		if (!this.window.CreateWindow()) process.exit(-1);

		this.window.SetVisible(true);
		this.window.Activate();
	}

	private watch() {
		autorun(() => {
			switch (state.currentTheme) {
				case ThemeSelection.Light: {
					this.theme.ResetTheme();
					break;
				}
				case ThemeSelection.Dark: {
					this.themeDark.SetStyle(this.theme, 0);
					break;
				}
				case ThemeSelection.Geek: {
					if (this.themeGeek) this.themeGeek.SetTheme(this.theme, 0);
					break;
				}
			}
			if (this.window && this.window.IsWindowCreated()) this.window.Redraw();
		});
	}

	private onCreateContent() {
		this.window.OnCreateContent((window) => {
			window.SetIcon(state.getResMap().WindowIcon);
			this.mainArea = new Main(window).create();
			window.SetContent(this.mainArea.control);
			this.createToolbar(window);
			return true;
		});
	}

	private createToolbar(window: Window) {
		//
		const menuLang = new Menu(window);
		menuLang.OnClick((menu, nId) => {
			state.i18n.switch(nId - 1);
			menu.SetRadioId(nId);
		});

		// the reason of +1: menu item id can't be 0, CultureId.en_us is 0
		menuLang.InsertItem(new MenuItem(CultureId.en_us + 1, MenuType.Text, 0, this.app.GetCultureInfo(CultureId.en_us).NameNative));
		menuLang.InsertItem(new MenuItem(CultureId.zh_cn + 1, MenuType.Text, 0, this.app.GetCultureInfo(CultureId.zh_cn).NameNative));

		state.i18n.switch(CultureId.en_us);
		menuLang.SetRadioId(CultureId.en_us + 1);

		//
		const toolbar = new ToolBar(window);
		toolbar.SetBackground(false);
		const ToolBarItemId = {
			Lang: 1,
			Theme: 2,
		};
		toolbar.ToolInsert(new ToolBarItem(ToolBarItemId.Lang, ToolBarItemType.ButtonDrop, window.CacheIcon(new IconSource(state.getResMap().Language, 16))), -1);
		toolbar.DropSetById(1, menuLang);
		window.GetFrame().SetToolBarRight(toolbar);
	}
}
