import { AlignType, Pager, ResourceSource, Vec2 } from "ave-ui";
import { GridLayout, ImageView, Page, ZoomView } from "../../components";
import { assetBuffer } from "../../utils";
import * as pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

export class NormalDiffPage extends Page {
	baselinePager: Pager;
	baselineImage: ImageView;
	baselineSource: ResourceSource;

	currentPager: Pager;
	currentImage: ImageView;
	currentSource: ResourceSource;

	diffPager: Pager;
	diffImage: ImageView;

	baselineZoomView: ZoomView;
	currentZoomView: ZoomView;

	onCreate(): GridLayout {
		const { window } = this;

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

		this.update();

		//
		const container = this.onCreateLayout();
		return container;
	}

	onCreateLayout() {
		const { window } = this;

		//
		const containerLayout = {
			rows: "32dpx 1 32dpx 1 32dpx",
			columns: "32dpx 1 32dpx 1 32dpx",
			areas: {
				baseline: { x: 1, y: 1 },
				current: { x: 3, y: 1 },
				diff: { x: 3, y: 3 },
				zoom: { x: 1, y: 3 },
				control: { x: 5, y: 1 },
			},
		};
		const container = new GridLayout<keyof typeof containerLayout.areas>(window, containerLayout);

		const zoomLayout = {
			rows: "1 192dpx 1",
			columns: "1 192dpx 32dpx 192dpx 1",
			areas: {
				baseline: { x: 1, y: 1 },
				current: { x: 3, y: 1 },
			},
		};

		const zoomGrid = new GridLayout<keyof typeof zoomLayout.areas>(window, zoomLayout);

		container.addControl(this.baselinePager, container.areas.baseline);
		container.addControl(this.currentPager, container.areas.current);
		container.addControl(this.diffPager, container.areas.diff);

		//
		container.addControl(zoomGrid.control, container.areas.zoom);
		zoomGrid.addControl(this.baselineZoomView.control, zoomGrid.areas.baseline);
		zoomGrid.addControl(this.currentZoomView.control, zoomGrid.areas.current);

		return container;
	}

	update() {
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

		//
		this.baselineZoomView.track({ image: this.baselineImage.native });
		this.currentZoomView.track({ image: this.currentImage.native });
	}

	onPointerMove(pos: Vec2) {
		this.baselineZoomView.updatePixelPos(pos);
		this.currentZoomView.updatePixelPos(pos);
	}
}
