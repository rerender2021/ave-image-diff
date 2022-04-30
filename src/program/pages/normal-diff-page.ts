import { AlignType, Pager, ResourceSource, Vec2 } from "ave-ui";
import { autorun } from "mobx";
import { GridLayout, ImageView, Page, ZoomView } from "../../components";
import { assetBuffer } from "../../utils";
import { BlinkDiffView } from "../components/blink-diff-view";
import { NormalDiffView } from "../components/normal-diff-view";
import { state } from "../state";

export class NormalDiffPage extends Page {
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

		[this.normalDiffView, this.baselineImage, this.currentImage].forEach((each) => {
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
		container.addControl(this.normalDiffView.control, container.areas.diff);
		container.addControl(this.blinkDiffView.control, container.areas.diff);

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

		const baselineBuffer = assetBuffer("map-baseline.png");
		const currentBuffer = assetBuffer("map-current.png");

		this.baselineSource = ResourceSource.FromBuffer(baselineBuffer);
		this.baselineImage.updateRawImage(codec.Open(this.baselineSource));

		this.currentSource = ResourceSource.FromBuffer(currentBuffer);
		this.currentImage.updateRawImage(codec.Open(this.currentSource));

		//
		this.normalDiffView.update(baselineBuffer, currentBuffer);

		//
		this.baselineZoomView.track({ image: this.baselineImage.native });
		this.currentZoomView.track({ image: this.currentImage.native });
	}

	onPointerMove(pos: Vec2) {
		this.baselineZoomView.updatePixelPos(pos);
		this.currentZoomView.updatePixelPos(pos);
	}
}
