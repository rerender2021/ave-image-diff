import { IByo2Image, TextBox, Vec2, Window } from "ave-ui";
import { autorun } from "mobx";
import { Area, createGridLayout, ZoomView } from "../../components";
import { state } from "../state";
import { Content } from "./content";
import * as Color from "color";

export class ZoomArea extends Area {
	private baselineZoomView: ZoomView;
	private baselinePosText: TextBox;
	private baselineColorText: TextBox;
	private baselineHexText: TextBox;

	private currentZoomView: ZoomView;
	private currentPosText: TextBox;
	private currentColorText: TextBox;
	private currentHexText: TextBox;

	private content: Content;

	constructor(window: Window, content: Content) {
		super(window);
		this.content = content;
	}

	protected onCreate() {
		const { window } = this;

		const createText = (s: string): TextBox => {
			const txt = new TextBox(window);
			txt.SetReadOnly(true);
			txt.SetBorder(false);
			txt.SetText(s);
			return txt;
		};

		this.baselineZoomView = new ZoomView(window);
		this.baselinePosText = createText("Baseline Position:");
		this.baselineColorText = createText("RGBA:");
		this.baselineHexText = createText("Hex:");

		this.currentZoomView = new ZoomView(window);
		this.currentPosText = createText("Current Position:");
		this.currentColorText = createText("RGBA:");
		this.currentHexText = createText("Hex:");

		this.watch();

		const container = this.onCreateLayout();
		return container;
	}

	private watch() {
		autorun(() => {
			this.baselinePosText.SetText(state.i18n.t("BaselinePosition", { x: state.pixelPos.x, y: state.pixelPos.y }));
			this.currentPosText.SetText(state.i18n.t("CurrentPosition", { x: state.pixelPos.x, y: state.pixelPos.y }));

			const baseline = state.pixelColor.baseline;
			const current = state.pixelColor.current;

			this.baselineColorText.SetText(`RGBA: ${baseline.r}, ${baseline.g}, ${baseline.b}, ${baseline.a}`);
			this.currentColorText.SetText(`RGBA: ${current.r}, ${current.g}, ${current.b}, ${current.a}`);

			this.baselineHexText.SetText(`Hex: ${Color({ r: baseline.r, g: baseline.g, b: baseline.b }).hex()}`);
			this.currentHexText.SetText(`Hex: ${Color({ r: current.r, g: current.g, b: current.b }).hex()}`);
		});

		this.window.OnLanguageChange((sender) => {
			this.baselinePosText.SetText(state.i18n.t("BaselinePosition", { x: state.pixelPos.x, y: state.pixelPos.y }));
			this.currentPosText.SetText(state.i18n.t("CurrentPosition", { x: state.pixelPos.x, y: state.pixelPos.y }));
		});
	}

	private onCreateLayout() {
		const { window } = this;

		const containerLayout = {
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

		const container = createGridLayout(window, containerLayout);

		container.addControl(this.baselineZoomView.control, container.areas.baseline);
		container.addControl(this.currentZoomView.control, container.areas.current);

		container.addControl(this.baselinePosText, container.areas.baselinePosText);
		container.addControl(this.currentPosText, container.areas.currentPosText);

		container.addControl(this.baselineColorText, container.areas.baselineColorText);
		container.addControl(this.currentColorText, container.areas.currentColorText);

		container.addControl(this.baselineHexText, container.areas.baselineHexText);
		container.addControl(this.currentHexText, container.areas.currentHexText);

		return container;
	}

	update(baseline: IByo2Image, current: IByo2Image) {
		this.baselineZoomView.track({ image: baseline });
		this.currentZoomView.track({ image: current });
	}

	onPointerMove(pos: Vec2) {
		this.baselineZoomView.updatePixelPos(pos);
		this.currentZoomView.updatePixelPos(pos);
	}
}
