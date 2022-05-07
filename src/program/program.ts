import { App, WindowCreation, Window, WindowFlag, ThemeImage, ThemePredefined_Dark, ThemeFileImage, ResourceSource, ThemeFile } from "ave-ui";
import { autorun } from "mobx";
import { assetPath } from "../utils";
import { Main } from "./components";
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

		this.theme = new ThemeImage();
		this.themeDark = new ThemePredefined_Dark();
		this.themeGeek = new ThemeFileImage();
		if (!this.themeGeek.Open(ResourceSource.FromPackedFile(assetPath("HyperEmerald.ave-theme-image"))))
			this.themeGeek = null;

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
					if (this.themeGeek)
						this.themeGeek.SetTheme(this.theme, 0);
					break;
				}
			}
			if (this.window && this.window.IsWindowCreated())
				this.window.Redraw();
		});
	}

	private onCreateContent() {
		this.window.OnCreateContent((window) => {
			window.SetIcon(state.getResMap().WindowIcon);
			this.mainArea = new Main(window).create();
			window.SetContent(this.mainArea.control);
			return true;
		});
	}
}
