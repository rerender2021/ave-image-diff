import { AlignType, Pager, ResourceSource, Vec2 } from "ave-ui";
import { autorun } from "mobx";
import { GridLayout, ImageView, Page, ZoomView } from "../../components";
import { assetBuffer } from "../../utils";
import { BlinkDiffView } from "../components/blink-diff-view";
import { NormalDiffView } from "../components/normal-diff-view";
import { state } from "../state";
import { PNG } from "pngjs";
import * as fs from "fs";
import { PixelateView } from "../../components/pixelate-view";

export class DiffPage extends Page {
	baselinePager: Pager;
	baselineImage: ImageView;
	baselineSource: ResourceSource;

	currentPager: Pager;
	currentImage: ImageView;
	currentSource: ResourceSource;

	normalDiffView: NormalDiffView;
	blinkDiffView: BlinkDiffView;

	baselineZoomView: ZoomView;
	currentZoomView: ZoomView;
	pixelateView: PixelateView;

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
		this.normalDiffView = new NormalDiffView(window, this.app);
		this.blinkDiffView = new BlinkDiffView(window, this.app);
		this.pixelateView = new PixelateView(window);

		[this.normalDiffView, this.blinkDiffView, this.baselineImage, this.currentImage].forEach((each) => {
			each.control.OnPointerMove((sender, mp) => {
				const pos = mp.Position;
				this.onPointerMove(pos);
			});
		});

		this.update();
		this.watch();

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
				diff: { x: 1, y: 3 },
				zoom: { x: 3, y: 3 },
				control: { x: 5, y: 1 },
			},
		};
		const container = new GridLayout<keyof typeof containerLayout.areas>(window, containerLayout);

		const zoomLayout = {
			rows: "1 192dpx 1",
			columns: "1 192dpx 16dpx 192dpx 1",
			areas: {
				baseline: { x: 1, y: 1 },
				current: { x: 3, y: 1 },
			},
		};

		const zoomGrid = new GridLayout<keyof typeof zoomLayout.areas>(window, zoomLayout);

		container.addControl(this.baselinePager, container.areas.baseline);
		container.addControl(this.currentPager, container.areas.current);
		container.addControl(this.normalDiffView.container, container.areas.diff);
		container.addControl(this.blinkDiffView.contrainer, container.areas.diff);
		container.addControl(this.pixelateView.control, container.areas.diff);

		//
		container.addControl(zoomGrid.control, container.areas.zoom);
		zoomGrid.addControl(this.baselineZoomView.control, zoomGrid.areas.baseline);
		zoomGrid.addControl(this.currentZoomView.control, zoomGrid.areas.current);

		return container;
	}

	watch() {
		autorun(() => {
			if (state.blink) {
				this.blinkDiffView.show();
				this.normalDiffView.hide();
			} else {
				this.normalDiffView.show();
				this.blinkDiffView.hide();
			}
		});
	}

	update() {
		const codec = this.app.GetImageCodec();

		let baselineBuffer = assetBuffer("out.png");
		const currentBuffer = assetBuffer("map-current.png");

		// const baselinePNG = PNG.sync.read(baselineBuffer);
		// const pixelSize = 10;
		// const resizedBaseline = new PNG({ width: baselinePNG.width * pixelSize, height: baselinePNG.height * pixelSize });
		// for (let y = 0; y < resizedBaseline.height; ++y) {
		// 	for (let x = 0; x < resizedBaseline.width; ++x) {
		// 		const i = (resizedBaseline.width * y + x) * 4;
		// 		const j = (baselinePNG.width * Math.floor((y) / pixelSize) + Math.floor((x) / pixelSize)) * 4;

		// 		resizedBaseline.data[i] = baselinePNG.data[j];
		// 		resizedBaseline.data[i + 1] = baselinePNG.data[j + 1];
		// 		resizedBaseline.data[i + 2] = baselinePNG.data[j + 2];
		// 		resizedBaseline.data[i + 3] = baselinePNG.data[j + 3];
		// 	}
		// }

		// resizedBaseline.pack().pipe(fs.createWriteStream("out.png"));

		// baselineBuffer = PNG.sync.write(resizedBaseline);

		this.baselineSource = ResourceSource.FromBuffer(baselineBuffer);
		this.baselineImage.updateRawImage(codec.Open(this.baselineSource));

		this.currentSource = ResourceSource.FromBuffer(currentBuffer);
		this.currentImage.updateRawImage(codec.Open(this.currentSource));

		//
		this.normalDiffView.update(baselineBuffer, currentBuffer);

		//
		this.baselineZoomView.track({ image: this.baselineImage.native });
		this.currentZoomView.track({ image: this.currentImage.native });
		this.pixelateView.track({ image: this.baselineImage.native });
	}

	onPointerMove(pos: Vec2) {
		this.baselineZoomView.updatePixelPos(pos);
		this.currentZoomView.updatePixelPos(pos);
	}
}
