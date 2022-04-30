import { App, WindowCreation, Window, WindowFlag, Pager, AlignType, ResourceSource, Vec2, CheckBox, CheckValue } from "ave-ui";
import { ImageView } from "../components";
import { getAppLayout } from "./layout";
import { assetBuffer } from "../utils";
import * as pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import * as fs from "fs";
import { ZoomView } from "../components/zoom-view";

export class Program {
	app: App;
	window: Window;

	baselinePager: Pager;
	baselineImage: ImageView;

	currentPager: Pager;
	currentImage: ImageView;

	diffPager: Pager;
	diffImage: ImageView;

	baselineZoomView: ZoomView;
	currentZoomView: ZoomView;

	inBlinkMode: boolean;

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
			this.inBlinkMode = false;

			//
			this.baselineZoomView = new ZoomView(window);
			this.currentZoomView = new ZoomView(window);

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
			this.diffImage = new ImageView(window);

			this.diffPager = new Pager(window);
			this.diffPager.SetContent(this.diffImage.control);
			this.diffPager.SetContentHorizontalAlign(AlignType.Center);
			this.diffPager.SetContentVerticalAlign(AlignType.Center);

			[this.diffImage, this.baselineImage, this.currentImage].forEach((each) => {
				each.control.OnPointerMove((sender, mp) => {
					const pos = mp.Position;
					this.onPointerMove(pos);
				});
			});

			//
			const container = this.onCreateLayout(window);
			window.SetContent(container);
			this.update();
			return true;
		});
	}

	onPointerMove(pos: Vec2) {
		this.baselineZoomView.updatePixelPos(pos);
		this.currentZoomView.updatePixelPos(pos);
	}

	update() {
		const codec = this.app.GetImageCodec();

		const baselineBuffer = assetBuffer("map-baseline.png");
		const currentBuffer = assetBuffer("map-current.png");

		this.baselineImage.updateRawImage(codec.Open(ResourceSource.FromBuffer(baselineBuffer)));
		this.currentImage.updateRawImage(codec.Open(ResourceSource.FromBuffer(currentBuffer)));

		//
		const baselinePNG = PNG.sync.read(baselineBuffer);
		const currentPNG = PNG.sync.read(currentBuffer);
		const { width, height } = baselinePNG;
		const diffPNG = new PNG({ width, height });
		pixelmatch(baselinePNG.data, currentPNG.data, diffPNG.data, width, height, { threshold: 0, includeAA: true, alpha: 0 });
		const diffBuffer = PNG.sync.write(diffPNG);
		// fs.writeFileSync("diff.png", diffBuffer);
		this.diffImage.updateRawImage(codec.Open(ResourceSource.FromBuffer(diffBuffer)));

		//
		this.baselineZoomView.track({ image: this.baselineImage.native });
		this.currentZoomView.track({ image: this.currentImage.native });
	}

	onCreateLayout(window: Window) {
		const { container, zoomGrid, controlGrid } = getAppLayout(window);

		container.addControl(this.baselinePager, container.areas.baseline);
		container.addControl(this.currentPager, container.areas.current);
		container.addControl(this.diffPager, container.areas.diff);

		//
		container.addControl(zoomGrid.control, container.areas.zoom);
		zoomGrid.addControl(this.baselineZoomView.control, zoomGrid.areas.baseline);
		zoomGrid.addControl(this.currentZoomView.control, zoomGrid.areas.current);

		//
		const blinkCheckBox = new CheckBox(window);
		blinkCheckBox.SetText("Blink");
		blinkCheckBox.OnCheck((sender: CheckBox) => {
			const checkValue = sender.GetValue();
			this.inBlinkMode = checkValue === CheckValue.Checked;
			console.log(`in blink mode: ${this.inBlinkMode}`);
		});

		container.addControl(controlGrid.control, container.areas.control);
		controlGrid.addControl(blinkCheckBox, controlGrid.areas.blink);

		return container.control;
	}
}
