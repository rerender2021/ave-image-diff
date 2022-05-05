import { App, WindowCreation, Window, WindowFlag } from "ave-ui";
import { Main } from "./components";
import { setApp } from "./utils";

export class Program {
	app: App;
	window: Window;

	mainArea: Main;

	constructor() {
		this.app = new App();
		setApp(this.app);

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
			this.mainArea = new Main(window);
			window.SetContent(this.mainArea.control);
			return true;
		});
	}
}
