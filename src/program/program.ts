import { App, WindowCreation, Window, WindowFlag, ThemeImage, ThemePredefined_Dark, ThemeFileImage, ResourceSource, ThemeFile, Menu, MenuItem, CultureId, MenuType, ToolBar, ToolBarItem, ToolBarItemType, IconSource, StringKey, WindowScale } from "ave-ui";
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

	constructor() {
		this.app = new App();
		state.setApp(this.app);

		const resMap = this.app.CreateResourceMap(this.app, [16, 20, 24, 28, 30, 32, 36, 40, 42, 48, 54, 56, 60, 64, 72, 80, 84, 96, 112, 128], iconDataMap);
		state.setResMap(resMap);

		const i18n = initI18n(this.app);
		state.setI18n(i18n);

		this.theme = new ThemeImage();

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
					const themeDark = new ThemePredefined_Dark();
					themeDark.SetStyle(this.theme, 0);
					break;
				}
				case ThemeSelection.Geek: {
					const themeGeek = new ThemeFileImage();
					if (themeGeek.Open(ResourceSource.FromPackedFile(assetPath("HyperEmerald.ave-theme-image"))))
						themeGeek.SetTheme(this.theme, 0);
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
		//----------------------------------------------------------------------------------------------------
		// Scale
		const menuScale = new Menu(window, new StringKey("Scale", 0, 2));
		menuScale.InsertItem(new MenuItem(WindowScale.SystemDefault + 1));
		menuScale.InsertItem(new MenuItem(WindowScale.MonitorOptimized + 1));
		menuScale.InsertItem(new MenuItem(0, MenuType.Separator));
		const scaleList = [100, 125, 150, 175, 200, 225, 250, 300, 350, 400];
		for (let i = WindowScale.Percent100; i <= WindowScale.Percent400; ++i)
			menuScale.InsertItem(new MenuItem(i + 1, MenuType.Text, 0, `${scaleList[i - WindowScale.Percent100]}%`));
		menuScale.SetRadioId(window.GetScale() + 1);
		menuScale.OnClick((sender, nId) => {
			sender.SetRadioId(nId);
			window.SetScale(nId - 1);
		});

		//----------------------------------------------------------------------------------------------------
		// Language
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

		//----------------------------------------------------------------------------------------------------
		// Theme
		const menuTheme = new Menu(window, new StringKey("ThemeType", 0, 3));
		menuTheme.InsertItem(new MenuItem(1));
		menuTheme.InsertItem(new MenuItem(2));
		menuTheme.InsertItem(new MenuItem(3));
		menuTheme.SetRadioId(1);
		menuTheme.OnClick((sender, nId) => {
			sender.SetRadioId(nId);
			state.setCurrentTheme(nId - 1);
		});
		//----------------------------------------------------------------------------------------------------
		// Toolbar
		const toolbar = new ToolBar(window);
		toolbar.SetBackground(false);
		const ToolBarItemId = {
			Scale: 1,
			Lang: 2,
			Theme: 3,
		};
		toolbar.ToolInsert(new ToolBarItem(ToolBarItemId.Scale, ToolBarItemType.ButtonDrop, window.CacheIcon(new IconSource(state.getResMap().Scale, 16))), -1);
		toolbar.ToolInsert(new ToolBarItem(ToolBarItemId.Lang, ToolBarItemType.ButtonDrop, window.CacheIcon(new IconSource(state.getResMap().Language, 16))), -1);
		toolbar.ToolInsert(new ToolBarItem(ToolBarItemId.Theme, ToolBarItemType.ButtonDrop, window.CacheIcon(new IconSource(state.getResMap().Theme, 16))), -1);
		toolbar.DropSetById(ToolBarItemId.Scale, menuScale);
		toolbar.DropSetById(ToolBarItemId.Lang, menuLang);
		toolbar.DropSetById(ToolBarItemId.Theme, menuTheme);
		window.GetFrame().SetToolBarRight(toolbar);
	}
}
