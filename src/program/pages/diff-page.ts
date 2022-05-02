import { AlignType, MessagePointer, Pager, PointerButton, ResourceSource, Vec2 } from "ave-ui";
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

	dragMoving: boolean = false;
	dragStartScrollPos: Vec2 = Vec2.Zero;
	dragStartPointerPos: Vec2 = Vec2.Zero;

	pager: Pager[];

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

		[this.normalDiffView, this.blinkDiffView, this.baselineImage, this.currentImage].forEach((each) => {
			each.control.OnPointerPress((sender, mp) => this.onPointerPress(mp));
			each.control.OnPointerRelease((sender, mp) => this.onPointerRelease(mp));
			each.control.OnPointerMove((sender, mp) => this.onPointerMove(mp));
		});

		this.pager = [this.baselinePager, this.currentPager, this.normalDiffView.container, this.blinkDiffView.contrainer];

		this.pager.forEach((e) => {
			e.OnScroll((sender) => this.onPagerScroll(sender));
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

		let baselineBuffer = assetBuffer("map-baseline.png");
		const currentBuffer = assetBuffer("map-current.png");

		this.baselineSource = ResourceSource.FromBuffer(baselineBuffer);
		this.baselineImage.updateRawImage(codec.Open(this.baselineSource));

		this.currentSource = ResourceSource.FromBuffer(currentBuffer);
		this.currentImage.updateRawImage(codec.Open(this.currentSource));

		//
		this.normalDiffView.update(this.baselineImage.data, this.currentImage.data);
		//this.normalDiffView.update(baselineBuffer, currentBuffer);

		//
		this.baselineZoomView.track({ image: this.baselineImage.native });
		this.currentZoomView.track({ image: this.currentImage.native });


		autorun(() => {
			const pixelSize = state.zoom;
			const resizedSize = new Vec2(this.baselineImage.width * pixelSize, this.baselineImage.height * pixelSize);
			this.baselinePager.SetContentSize(resizedSize);
			this.currentPager.SetContentSize(resizedSize);
			this.normalDiffView.setZoom(pixelSize);

			// const pixelSize = state.zoom;

			// const baselinePNG = PNG.sync.read(baselineBuffer);
			// const resizedBaseline = new PNG({ width: baselinePNG.width * pixelSize, height: baselinePNG.height * pixelSize });
			// for (let y = 0; y < resizedBaseline.height; ++y) {
			// 	for (let x = 0; x < resizedBaseline.width; ++x) {
			// 		const i = (resizedBaseline.width * y + x) * 4;
			// 		const j = (baselinePNG.width * Math.floor(y / pixelSize) + Math.floor(x / pixelSize)) * 4;

			// 		resizedBaseline.data[i] = baselinePNG.data[j];
			// 		resizedBaseline.data[i + 1] = baselinePNG.data[j + 1];
			// 		resizedBaseline.data[i + 2] = baselinePNG.data[j + 2];
			// 		resizedBaseline.data[i + 3] = baselinePNG.data[j + 3];
			// 	}
			// }

			// const resizedBaselineBuffer = PNG.sync.write(resizedBaseline);
			// const baselineSource = ResourceSource.FromBuffer(resizedBaselineBuffer);
			// this.baselineImage.updateRawImage(codec.Open(baselineSource));
			// this.baselineImage.redraw();

			// this.baselinePager.SetContentSize(new Vec2(resizedBaseline.width, resizedBaseline.height));
			// this.baselinePager.Redraw();

			// //
			// const currentPNG = PNG.sync.read(currentBuffer);
			// const resizedCurrent = new PNG({ width: currentPNG.width * pixelSize, height: currentPNG.height * pixelSize });
			// for (let y = 0; y < resizedCurrent.height; ++y) {
			// 	for (let x = 0; x < resizedCurrent.width; ++x) {
			// 		const i = (resizedCurrent.width * y + x) * 4;
			// 		const j = (currentPNG.width * Math.floor(y / pixelSize) + Math.floor(x / pixelSize)) * 4;

			// 		resizedCurrent.data[i] = currentPNG.data[j];
			// 		resizedCurrent.data[i + 1] = currentPNG.data[j + 1];
			// 		resizedCurrent.data[i + 2] = currentPNG.data[j + 2];
			// 		resizedCurrent.data[i + 3] = currentPNG.data[j + 3];
			// 	}
			// }

			// const resizedCurrentBuffer = PNG.sync.write(resizedCurrent);
			// const currentSource = ResourceSource.FromBuffer(resizedCurrentBuffer);
			// this.currentImage.updateRawImage(codec.Open(currentSource));
			// this.currentImage.redraw();

			// this.currentPager.SetContentSize(new Vec2(resizedCurrent.width, resizedCurrent.height));
			// this.currentPager.Redraw();

			// [this.normalDiffView, this.baselineImage, this.currentImage].forEach((each) => {
			// 	each.control.OnPointerMove((sender, mp) => {
			// 		const pos = mp.Position;
			// 		const posZoom = new Vec2(Math.floor(pos.x) / state.zoom, Math.floor(pos.y) / state.zoom);
			// 		this.onPointerMove(posZoom);
			// 	});
			// });

			// this.normalDiffView.update(resizedBaselineBuffer, resizedCurrentBuffer);

			// resizedBaseline.pack().pipe(fs.createWriteStream("out.png"));
		});

	}

	onPointerPress(mp: MessagePointer) {
		if (PointerButton.First == mp.Button) {
			this.dragMoving = true;
			this.dragStartPointerPos = this.window.GetPlatform().PointerGetPosition();
			this.dragStartScrollPos = this.baselinePager.GetScrollPosition();
		}
	}

	onPointerRelease(mp: MessagePointer) {
		if (PointerButton.First == mp.Button) {
			this.dragMoving = false;
		}
	}

	onPointerMove(mp: MessagePointer) {
		if (this.dragMoving) {
			const vPos = this.window.GetPlatform().PointerGetPosition();
			const vNewScroll = this.dragStartScrollPos.Add(vPos.Sub(this.dragStartPointerPos));
			this.pager.forEach((e) => e.SetScrollPosition(vNewScroll, false));
			this.window.Update();
		} else {
			const vPos = mp.Position.Div(state.zoom);
			vPos.x = Math.floor(vPos.x);
			vPos.y = Math.floor(vPos.y);
			this.baselineZoomView.updatePixelPos(vPos);
			this.currentZoomView.updatePixelPos(vPos);
		}
	}

	onPagerScroll(sender: Pager) {
		const vNewScroll = sender.GetScrollPosition();
		this.pager.forEach((e) => {
			if (sender != e)
				e.SetScrollPosition(vNewScroll, false)
		});
		this.window.Update();
	}
}
