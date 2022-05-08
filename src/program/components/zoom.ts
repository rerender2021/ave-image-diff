import { IByo2Image, TextBox, Vec2, Window } from "ave-ui";
import { autorun } from "mobx";
import { Area, createGridLayout, ZoomView } from "../../components";
import { state } from "../state";
import { Content } from "./content";
import * as Color from "color";
import { Sidebar } from "./sidebar";

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
	private sidebar: Sidebar;

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

		this.sidebar = new Sidebar(window, this.content).create();

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
			rows: "1 4dpx 16dpx 4dpx 16dpx 4dpx 16dpx 4dpx",
			columns: "1 4dpx 1 4dpx 1",
			areas: {
				baseline: { x: 0, y: 0 },
				baselinePosText: { x: 0, y: 2 },
				baselineColorText: { x: 0, y: 4 },
				baselineHexText: { x: 0, y: 6 },
				current: { x: 2, y: 0 },
				currentPosText: { x: 2, y: 2 },
				currentColorText: { x: 2, y: 4 },
				currentHexText: { x: 2, y: 6 },
				sidebar: { x: 4, y: 0, yspan: 8 },
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

		container.addControl(this.sidebar.control, container.areas.sidebar);

		return container;
	}

	update(baseline: IByo2Image, current: IByo2Image) {
		this.baselineZoomView.track({ image: baseline });
		this.currentZoomView.track({ image: current });
		this.sidebar.update();
	}

	onPointerMove(pos: Vec2) {
		this.baselineZoomView.updatePixelPos(pos);
		this.currentZoomView.updatePixelPos(pos);
	}
}
