import { CheckBox, CheckValue, ComboBox, TextBox, TrackBar } from "ave-ui";
import { GridLayout, ImageView, MiniView, Page } from "../../components";
import { state } from "../state";
import { DiffPage } from "./diff-page";

export class MainPage extends Page {
	blinkCheckBox: CheckBox;
	blinkText: TextBox;

	thresholdScroll: TrackBar;
	thresholdText: TextBox;

	blendAlphaScroll: TrackBar;
	blendAlphaText: TextBox;

	zoomScroll: TrackBar;
	zoomText: TextBox;

	miniView: MiniView;
	miniViewText: TextBox;
	miniViewSwitch: ComboBox;

	diffPage: DiffPage;

	onCreate(): GridLayout {
		const { window } = this;

		//
		this.blinkCheckBox = new CheckBox(window);
		this.blinkCheckBox.SetText("Blink");
		this.blinkCheckBox.OnCheck((sender: CheckBox) => {
			const checkValue = sender.GetValue();
			state.setBlink(checkValue === CheckValue.Checked);
		});

		this.blinkText = new TextBox(window);
		this.blinkText.SetReadOnly(true);
		this.blinkText.SetBorder(false);
		this.blinkText.SetText("Mode");

		const createSlider = (nMin, nMax, nDef, s, fn): [TrackBar, TextBox] => {
			const tb = new TrackBar(window);
			tb.SetMinimum(nMin).SetMaximum(nMax).SetValue(nDef);
			tb.OnThumbChange(fn);

			const txt = new TextBox(window);
			txt.SetReadOnly(true);
			txt.SetBorder(false);
			txt.SetText(s);

			return [tb, txt];
		};

		[this.thresholdScroll, this.thresholdText] = createSlider(0, 100, 0, "Threshold", (sender: TrackBar) => {
			state.setThreshold(sender.GetValue() / 100);
		});

		[this.blendAlphaScroll, this.blendAlphaText] = createSlider(0, 100, 50, "Blend Alpha", (sender: TrackBar) => {
			state.setBlendAlpha(sender.GetValue() / 100);
		});

		[this.zoomScroll, this.zoomText] = createSlider(1, 16, 1, "Zoom", (sender: TrackBar) => {
			state.setZoom(sender.GetValue());
		});

		//
		this.miniView = new MiniView(window);
		this.miniViewText = new TextBox(window);
		this.miniViewText.SetReadOnly(true);
		this.miniViewText.SetBorder(false);
		this.miniViewText.SetText("Mini View");

		//
		this.miniViewSwitch = new ComboBox(window);
		this.miniViewSwitch.Append("Baseline", "Current");
		this.miniViewSwitch.Select(0);
		this.miniViewSwitch.OnSelectionChange((comboBox: ComboBox) => {
			const i = comboBox.GetSelection();
			if (i === 0) {
				this.track(this.diffPage.baselineImage);
			} else if (i === 1) {
				this.track(this.diffPage.currentImage);
			}
		});

		//
		this.diffPage = new DiffPage(window, this.app);
		this.track(this.diffPage.baselineImage);

		const container = this.onCreateLayout();
		return container;
	}

	track(image: ImageView) {
		this.miniView.track({
			pager: [this.diffPage.baselinePager, this.diffPage.currentPager, this.diffPage.normalDiffView.container],
			image: image.native,
		});
	}

	onCreateLayout() {
		const { window } = this;

		//
		const containerLayout = {
			rows: "1",
			columns: "1 192dpx 32dpx",
			areas: {
				main: { x: 0, y: 0 },
				control: { x: 1, y: 0 },
			},
		};
		const container = new GridLayout<keyof typeof containerLayout.areas>(window, containerLayout);

		const controlLayout = {
			rows: "32dpx 128px 16dpx 16dpx 16dpx 16dpx 16dpx 16dpx 16dpx 16dpx 16dpx 16dpx 16dpx 16dpx 1",
			columns: "1 1",
			areas: {
				miniView: { x: 0, y: 1, xspan: 2, yspan: 1 },
				miniViewText: { x: 0, y: 4 },
				miniViewSwitch: { x: 1, y: 4 },
				thresholdText: { x: 0, y: 6 },
				threshold: { x: 1, y: 6 },
				blendAlphaText: { x: 0, y: 8 },
				blendAlpha: { x: 1, y: 8 },
				zoomText: { x: 0, y: 10 },
				zoom: { x: 1, y: 10 },
				blinkText: { x: 0, y: 12 },
				blink: { x: 1, y: 12 },
			},
		};
		const controlGrid = new GridLayout<keyof typeof controlLayout.areas>(window, controlLayout);

		container.addControl(this.diffPage.control, container.areas.main);
		container.addControl(controlGrid.control, container.areas.control);

		controlGrid.addControl(this.blinkCheckBox, controlGrid.areas.blink);
		controlGrid.addControl(this.blinkText, controlGrid.areas.blinkText);

		controlGrid.addControl(this.thresholdText, controlGrid.areas.thresholdText);
		controlGrid.addControl(this.thresholdScroll, controlGrid.areas.threshold);

		controlGrid.addControl(this.blendAlphaText, controlGrid.areas.blendAlphaText);
		controlGrid.addControl(this.blendAlphaScroll, controlGrid.areas.blendAlpha);

		controlGrid.addControl(this.zoomText, controlGrid.areas.zoomText);
		controlGrid.addControl(this.zoomScroll, controlGrid.areas.zoom);

		controlGrid.addControl(this.miniView.control, controlGrid.areas.miniView);
		controlGrid.addControl(this.miniViewText, controlGrid.areas.miniViewText);
		controlGrid.addControl(this.miniViewSwitch, controlGrid.areas.miniViewSwitch);

		return container;
	}
}
