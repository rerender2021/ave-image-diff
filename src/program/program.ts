import { App, WindowCreation, Window, WindowFlag } from "ave-ui";
import { MainPage } from "./pages/main-page";

export class Program {
	app: App;
	window: Window;

	mainPage: MainPage;

	constructor() {
		this.app = new App();

		const cpWindow = new WindowCreation();
		cpWindow.Title = "Image Diff";
		cpWindow.Flag |= WindowFlag.Layered;

		this.window = new Window(cpWindow);
	}

	run() {
		this.onCreateContent();
		if (!this.window.CreateWindow()) process.exit(-1);

		this.window.SetVisible(true);
		this.window.Activate();
	}

	onCreateContent() {
		this.window.OnCreateContent((window) => {
			this.mainPage = new MainPage(window, this.app);
			window.SetContent(this.mainPage.control);
			return true;
		});
	}
}
