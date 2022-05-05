import { Window, AlignType, DragDropImage, DropBehavior, IControl, KbKey, MessagePointer, Pager, PointerButton, ResourceSource, Vec2 } from "ave-ui";
import { autorun } from "mobx";
import { Area, createGridLayout, GridLayout, ImageView } from "../../components";
import { BlinkDiff } from "./blink-diff";
import { NormalDiff } from "./normal-diff";
import { MiniViewSelection, state } from "../state";
import { getApp } from "../utils";
import { ZoomArea } from "./zoom";

export class Content extends Area {
	baselinePager: Pager;
	baselineImage: ImageView;
	private baselineSource: ResourceSource;

	currentPager: Pager;
	currentImage: ImageView;
	private currentSource: ResourceSource;

	normalDiff: NormalDiff;
	blinkDiff: BlinkDiff;
	private zoomArea: ZoomArea;

	private dragMoving: boolean = false;
	private dragStartScrollPos: Vec2 = Vec2.Zero;
	private dragStartPointerPos: Vec2 = Vec2.Zero;

	private pagerList: Pager[];

	constructor(window: Window) {
		super(window);
	}

	protected onCreate(): GridLayout {
		const { window } = this;

		//
		this.baselineImage = new ImageView(window);
		this.currentImage = new ImageView(window);
		this.zoomArea = new ZoomArea(window, this).create();

		const createPager = (content: IControl) => {
			const pager = new Pager(window);
			pager.SetContent(content);
			pager.SetContentHorizontalAlign(AlignType.Center);
			pager.SetContentVerticalAlign(AlignType.Center);
			return pager;
		};

		this.baselinePager = createPager(this.baselineImage.control);
		this.currentPager = createPager(this.currentImage.control);

		[this.baselinePager, this.currentPager].forEach((pager) => {
			pager.OnDragMove((sender, dc) => {
				if (1 == dc.FileGetCount() && ["png", "jpg", "jpeg"].some((extension) => dc.FileGet()[0].toLowerCase().endsWith(extension))) {
					dc.SetDropTip(DragDropImage.Copy, "Open this file");
					dc.SetDropBehavior(DropBehavior.Copy);
				}
			});
		});

		this.baselinePager.OnDragDrop((sender, dc) => {
			const file = dc.FileGet()[0];
			state.setBaselineFile(file);
			// only update mini view when current selection is the one you drop to
			if (state.currentMiniView === MiniViewSelection.Baseline) {
				state.setMiniViewUpdateKey(Date.now());
			}
		});

		this.currentPager.OnDragDrop((sender, dc) => {
			const file = dc.FileGet()[0];
			state.setCurrentFile(file);
			if (state.currentMiniView === MiniViewSelection.Current) {
				state.setMiniViewUpdateKey(Date.now());
			}
		});

		//
		this.normalDiff = new NormalDiff(window);
		this.blinkDiff = new BlinkDiff(window);

		[this.normalDiff, this.blinkDiff, this.baselineImage, this.currentImage].forEach((each) => {
			each.control.OnPointerPress((sender, mp) => this.onPointerPress(mp));
			each.control.OnPointerRelease((sender, mp) => this.onPointerRelease(mp));
			each.control.OnPointerMove((sender, mp) => this.onPointerMove(mp));
		});

		this.pagerList = [this.baselinePager, this.currentPager, this.normalDiff.container, this.blinkDiff.contrainer];

		this.pagerList.forEach((e) => {
			e.OnScroll((sender) => this.onPagerScroll(sender));
		});

		//

		this.init();
		this.watch();
		this.onHotKey();
		this.onWindowDragDrop();

		//
		const container = this.onCreateLayout();
		return container;
	}

	private onWindowDragDrop() {
		this.window.OnDragMove((sender, dc) => {
			if (2 == dc.FileGetCount()) {
				const [baseline, current] = dc.FileGet();
				const isValid = (file: string) => ["png", "jpg", "jpeg"].some((extension) => file.toLowerCase().endsWith(extension));
				if (isValid(baseline) && isValid(current)) {
					dc.SetDropTip(DragDropImage.Copy, "Open these files");
					dc.SetDropBehavior(DropBehavior.Copy);
				}
			}
		});

		this.window.OnDragDrop((sender, dc) => {
			const [baseline, current] = dc.FileGet();
			state.setBaselineFile(baseline);
			state.setCurrentFile(current);

			// always update miniview when drop 2 files
			state.setMiniViewUpdateKey(Date.now());
		});
	}

	private onHotKey() {
		const { window } = this;
		const hkSpace = window.HotkeyRegister(KbKey.Space, 0);
		window.OnWindowHotkey((sender, nId, key, n) => {
			switch (nId) {
				case hkSpace:
					state.setLockColor(!state.lockColor);
			}
		});
	}

	private onCreateLayout() {
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
			},
		};
		const container = createGridLayout(window, containerLayout);

		container.addControl(this.baselinePager, container.areas.baseline);
		container.addControl(this.currentPager, container.areas.current);
		container.addControl(this.normalDiff.container, container.areas.diff);
		container.addControl(this.blinkDiff.contrainer, container.areas.diff);
		container.addControl(this.zoomArea.control, container.areas.zoom);

		return container;
	}

	private init() {
		this.baselineSource = ResourceSource.FromPackedFile(state.baselineFile);
		this.currentSource = ResourceSource.FromPackedFile(state.currentFile);
		this.update();
	}

	private watch() {
		autorun(() => {
			const pixelSize = state.zoom;
			const resizedSize = new Vec2(this.baselineImage.width * pixelSize, this.baselineImage.height * pixelSize);
			this.baselinePager.SetContentSize(resizedSize);
			this.currentPager.SetContentSize(resizedSize);
			this.normalDiff.setZoom(pixelSize);
			this.blinkDiff.setZoom(pixelSize);
		});

		autorun(() => {
			if (state.blink) {
				this.blinkDiff.show();
				this.normalDiff.hide();
			} else {
				this.normalDiff.show();
				this.blinkDiff.hide();
			}
		});

		autorun(() => {
			if (!state.baselineFile) {
				return;
			}
			this.baselineSource = ResourceSource.FromFilePath(state.baselineFile);
			this.update();
		});

		autorun(() => {
			if (!state.currentFile) {
				return;
			}
			this.currentSource = ResourceSource.FromFilePath(state.currentFile);
			this.update();
		});
	}

	private update() {
		const codec = getApp().GetImageCodec();
		this.baselineImage.updateRawImage(codec.Open(this.baselineSource));
		this.currentImage.updateRawImage(codec.Open(this.currentSource));

		this.baselinePager.SetContentSize(new Vec2(this.baselineImage.width, this.baselineImage.height));
		this.currentPager.SetContentSize(new Vec2(this.currentImage.width, this.currentImage.height));

		this.normalDiff.update(this.baselineImage.data, this.currentImage.data);
		this.zoomArea.update(this.baselineImage.native, this.currentImage.native);
	}

	private onPointerPress(mp: MessagePointer) {
		if (PointerButton.First == mp.Button) {
			this.dragMoving = true;
			this.dragStartPointerPos = this.window.GetPlatform().PointerGetPosition();
			this.dragStartScrollPos = this.baselinePager.GetScrollPosition();
		}
	}

	private onPointerRelease(mp: MessagePointer) {
		if (PointerButton.First == mp.Button) {
			this.dragMoving = false;
		}
	}

	private onPointerMove(mp: MessagePointer) {
		if (state.lockColor) {
			return;
		}

		if (this.dragMoving) {
			const vPos = this.window.GetPlatform().PointerGetPosition();
			const vNewScroll = this.dragStartScrollPos.Add(vPos.Sub(this.dragStartPointerPos));
			this.pagerList.forEach((e) => e.SetScrollPosition(vNewScroll, false));
			this.window.Update();
		} else {
			const vPos = mp.Position.Div(state.zoom);
			vPos.x = Math.floor(vPos.x);
			vPos.y = Math.floor(vPos.y);
			this.zoomArea.onPointerMove(vPos);
			state.setPixelPos(vPos);
			state.setPixelColor({
				baseline: this.baselineImage.readPixel(vPos.x, vPos.y),
				current: this.currentImage.readPixel(vPos.x, vPos.y),
			});
		}
	}

	private onPagerScroll(sender: Pager) {
		const vNewScroll = sender.GetScrollPosition();
		this.pagerList.forEach((e) => {
			if (sender != e) e.SetScrollPosition(vNewScroll, false);
		});
		this.window.Update();
	}
}
