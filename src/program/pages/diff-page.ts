import { AlignType, IControl, MessagePointer, Pager, PointerButton, ResourceSource, TextBox, Vec2 } from "ave-ui";
import { autorun } from "mobx";
import * as Color from "color";
import { GridLayout, ImageView, Page, ZoomView } from "../../components";
import { assetBuffer } from "../../utils";
import { BlinkDiffView, NormalDiffView } from "../components";
import { state } from "../state";

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
	baselinePosText: TextBox;
	baselineColorText: TextBox;
	baselineHexText: TextBox;

	currentZoomView: ZoomView;
	currentPosText: TextBox;
	currentColorText: TextBox;
	currentHexText: TextBox;

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
		this.currentImage = new ImageView(window);

		const createPager = (content: IControl) => {
			const pager = new Pager(window);
			pager.SetContent(content);
			pager.SetContentHorizontalAlign(AlignType.Center);
			pager.SetContentVerticalAlign(AlignType.Center);
			return pager;
		};

		this.baselinePager = createPager(this.baselineImage.control);
		this.currentPager = createPager(this.currentImage.control);

		//
		this.normalDiffView = new NormalDiffView(window);
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

		//
		const createText = (s: string): TextBox => {
			const txt = new TextBox(window);
			txt.SetReadOnly(true);
			txt.SetBorder(false);
			txt.SetText(s);
			return txt;
		};

		this.baselinePosText = createText("Baseline Position:");
		this.currentPosText = createText("Current Position:");

		this.baselineColorText = createText("RGBA:");
		this.currentColorText = createText("RGBA:");

		this.baselineHexText = createText("Hex:");
		this.currentHexText = createText("Hex:");

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
			rows: "1 192dpx 4dpx 16dpx 4dpx 16dpx 4dpx 16dpx 1",
			columns: "1 192dpx 16dpx 192dpx 1",
			areas: {
				baseline: { x: 1, y: 1 },
				baselinePosText: { x: 1, y: 3 },
				baselineColorText: { x: 1, y: 5 },
				baselineHexText: { x: 1, y: 7 },
				current: { x: 3, y: 1 },
				currentPosText: { x: 3, y: 3 },
				currentColorText: { x: 3, y: 5 },
				currentHexText: { x: 3, y: 7 },
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

		//
		zoomGrid.addControl(this.baselinePosText, zoomGrid.areas.baselinePosText);
		zoomGrid.addControl(this.currentPosText, zoomGrid.areas.currentPosText);

		zoomGrid.addControl(this.baselineColorText, zoomGrid.areas.baselineColorText);
		zoomGrid.addControl(this.currentColorText, zoomGrid.areas.currentColorText);

		zoomGrid.addControl(this.baselineHexText, zoomGrid.areas.baselineHexText);
		zoomGrid.addControl(this.currentHexText, zoomGrid.areas.currentHexText);

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

		autorun(() => {
			this.baselinePosText.SetText(`Baseline Position: ${state.pixelPos.x}, ${state.pixelPos.y}`);
			this.currentPosText.SetText(`Current Position: ${state.pixelPos.x}, ${state.pixelPos.y}`);

			const baseline = state.pixelColor.baseline;
			const current = state.pixelColor.current;

			this.baselineColorText.SetText(`RGBA: ${baseline.r}, ${baseline.g}, ${baseline.b}, ${baseline.a}`);
			this.currentColorText.SetText(`RGBA: ${current.r}, ${current.g}, ${current.b}, ${current.a}`);

			this.baselineHexText.SetText(`Hex: ${Color({ r: baseline.r, g: baseline.g, b: baseline.b }).hex()}`);
			this.currentHexText.SetText(`Hex: ${Color({ r: current.r, g: current.g, b: current.b }).hex()}`);
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

		//
		this.baselineZoomView.track({ image: this.baselineImage.native });
		this.currentZoomView.track({ image: this.currentImage.native });

		autorun(() => {
			const pixelSize = state.zoom;
			const resizedSize = new Vec2(this.baselineImage.width * pixelSize, this.baselineImage.height * pixelSize);
			this.baselinePager.SetContentSize(resizedSize);
			this.currentPager.SetContentSize(resizedSize);
			this.normalDiffView.setZoom(pixelSize);
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
			state.setPixelPos(vPos);
			state.setPixelColor({
				baseline: this.baselineImage.readPixel(vPos.x, vPos.y),
				current: this.currentImage.readPixel(vPos.x, vPos.y),
			});
		}
	}

	onPagerScroll(sender: Pager) {
		const vNewScroll = sender.GetScrollPosition();
		this.pager.forEach((e) => {
			if (sender != e) e.SetScrollPosition(vNewScroll, false);
		});
		this.window.Update();
	}
}
