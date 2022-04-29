import { App, WindowCreation, Window, WindowFlag, ThemeImage } from "ave-ui";
import { getAppLayout } from "./layout";

export class Program {
	app: App;
	window: Window;

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
			const container = this.onCreateLayout(window);
			window.SetContent(container);
			return true;
		});
	}

	onCreateLayout(window: Window) {
		const { container } = getAppLayout(window);
		return container.control;
	}
}
