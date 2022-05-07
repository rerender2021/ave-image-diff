import { App, WindowCreation, Window, WindowFlag } from "ave-ui";
import { Main } from "./components";
import { iconDataMap } from "./resource";
import { state } from "./state";

export class Program {
	app: App;
	window: Window;

	mainArea: Main;

	constructor() {
		this.app = new App();
		state.setApp(this.app);

		const resMap = this.app.CreateResourceMap(this.app, [16], iconDataMap);
		state.setResMap(resMap);

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
			window.SetIcon(state.getResMap().WindowIcon);
			this.mainArea = new Main(window).create();
			window.SetContent(this.mainArea.control);
			return true;
		});
	}
}
