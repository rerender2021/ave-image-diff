import { App, WindowCreation, Window, WindowFlag, Pager, AlignType, ResourceSource } from "ave-ui";
import { ImageView } from "../components";
import { getAppLayout } from "./layout";
import { createResourceSourceFromAsset } from "../utils";

export class Program {
	app: App;
	window: Window;

	baselinePager: Pager;
	baselineImage: ImageView;

	currentPager: Pager;
	currentImage: ImageView;

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
			this.currentImage = new ImageView(window);

			this.currentPager = new Pager(window);
			this.currentPager.SetContent(this.currentImage.control);
			this.currentPager.SetContentHorizontalAlign(AlignType.Center);
			this.currentPager.SetContentVerticalAlign(AlignType.Center);

			//
			const container = this.onCreateLayout(window);
			window.SetContent(container);
			this.onInit();
			return true;
		});
	}

	onInit() {
		const codec = this.app.GetImageCodec();
		this.baselineImage.updateRawImage(codec.Open(createResourceSourceFromAsset("square-baseline.png")));
		this.currentImage.updateRawImage(codec.Open(createResourceSourceFromAsset("square-current.png")));
	}

	onCreateLayout(window: Window) {
		const { container } = getAppLayout(window);

		container.addControl(this.baselinePager, container.areas.baseline);
		container.addControl(this.currentPager, container.areas.current);

		return container.control;
	}
}
