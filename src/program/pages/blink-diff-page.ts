import { AlignType, Pager, ResourceSource } from "ave-ui";
import { GridLayout, ImageView, Page, ZoomView } from "../../components";
import { assetBuffer } from "../../utils";
import * as pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

export class BlinkDiffPage extends Page {
	blinkPager: Pager;
	blinkTimer: NodeJS.Timer;

	baselineImage: ImageView;
	baselineSource: ResourceSource;

	currentImage: ImageView;
	currentSource: ResourceSource;

	diffPager: Pager;
	diffImage: ImageView;

	onCreate(): GridLayout {
		const { window } = this;

		//
		this.baselineImage = new ImageView(window);
		this.currentImage = new ImageView(window);

		this.blinkPager = new Pager(window);
		this.blinkPager.SetContent(this.baselineImage.control);
		this.blinkPager.SetContentHorizontalAlign(AlignType.Center);
		this.blinkPager.SetContentVerticalAlign(AlignType.Center);

		//
		this.diffImage = new ImageView(window);

		this.diffPager = new Pager(window);
		this.diffPager.SetContent(this.diffImage.control);
		this.diffPager.SetContentHorizontalAlign(AlignType.Center);
		this.diffPager.SetContentVerticalAlign(AlignType.Center);

		this.update();
		this.blink();

		//
		const container = this.onCreateLayout();
		return container;
	}

	onCreateLayout() {
		const { window } = this;

		//
		const containerLayout = {
			rows: "32dpx 1 32dpx",
			columns: "32dpx 1 32dpx 1 32dpx",
			areas: {
				blink: { x: 1, y: 1 },
				diff: { x: 3, y: 1 },
			},
		};
		const container = new GridLayout<keyof typeof containerLayout.areas>(window, containerLayout);

		container.addControl(this.blinkPager, container.areas.blink);
		container.addControl(this.diffPager, container.areas.diff);

		return container;
	}

	update() {
		const { window } = this;

		const codec = this.app.GetImageCodec();

		const baselineBuffer = assetBuffer("map-baseline.png");
		const currentBuffer = assetBuffer("map-current.png");

		this.baselineSource = ResourceSource.FromBuffer(baselineBuffer);
		this.baselineImage.updateRawImage(codec.Open(this.baselineSource));

		this.currentSource = ResourceSource.FromBuffer(currentBuffer);
		this.currentImage.updateRawImage(codec.Open(this.currentSource));

		//
		const baselinePNG = PNG.sync.read(baselineBuffer);
		const currentPNG = PNG.sync.read(currentBuffer);
		const { width, height } = baselinePNG;
		const diffPNG = new PNG({ width, height });
		pixelmatch(baselinePNG.data, currentPNG.data, diffPNG.data, width, height, { threshold: 0, includeAA: true, alpha: 0 });
		const diffBuffer = PNG.sync.write(diffPNG);
		// fs.writeFileSync("diff.png", diffBuffer);
		this.diffImage.updateRawImage(codec.Open(ResourceSource.FromBuffer(diffBuffer)));
	}

	blink() {
		this.blinkTimer = setInterval(() => {
			const thisTurn = this.blinkPager.GetContent();
			if (thisTurn === this.baselineImage.control) {
				this.blinkPager.SetContent(this.currentImage.control);
			} else if (thisTurn === this.currentImage.control) {
				this.blinkPager.SetContent(this.baselineImage.control);
			}
		}, 500);
	}
}
