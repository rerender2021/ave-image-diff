import { App, WindowCreation, Window, WindowFlag, Pager, AlignType, ResourceSource } from "ave-ui";
import { ImageView } from "../components";
import { getAppLayout } from "./layout";
import * as fs from "fs";
import { assetPath } from "../utils";

export class Program {
	app: App;
	window: Window;

	baselinePager: Pager;
	baselineImage: ImageView;

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
			//
			this.baselineImage = new ImageView(window);

			this.baselinePager = new Pager(window);
			this.baselinePager.SetContent(this.baselineImage.control);
			this.baselinePager.SetContentHorizontalAlign(AlignType.Center);
			this.baselinePager.SetContentVerticalAlign(AlignType.Center);

			//
			const container = this.onCreateLayout(window);
			window.SetContent(container);
			this.onInit();
			return true;
		});
	}

	onInit() {
		const codec = this.app.GetImageCodec();
		const resourceSource = ResourceSource.FromBuffer(fs.readFileSync(assetPath("square-baseline.png")));
		const aveImage = codec.Open(resourceSource);
		this.baselineImage.updateRawImage(aveImage);
	}

	onCreateLayout(window: Window) {
		const { container } = getAppLayout(window);

		container.addControl(this.baselinePager, container.areas.baseline);

		return container.control;
	}
}
