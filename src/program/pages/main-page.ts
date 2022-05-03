import { CheckBox, CheckValue, TextBox, TrackBar } from "ave-ui";
import { GridLayout, MiniView, Page } from "../../components";
import { state } from "../state";
import { DiffPage } from "./diff-page";

export class MainPage extends Page {
	blinkCheckBox: CheckBox;
	
	thresholdScroll: TrackBar;
	thresholdText: TextBox;

	blendAlphaScroll: TrackBar;
	blendAlphaText: TextBox;

	zoomScroll: TrackBar;
	zoomText: TextBox;

	miniView: MiniView;

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

		const createSlider = (nMin, nMax, nDef, s, fn): [TrackBar, TextBox] => {
			const tb = new TrackBar(window);
			tb.SetMinimum(nMin).SetMaximum(nMax).SetValue(nDef);
			tb.OnThumbChange(fn);

			const txt = new TextBox(window);
			txt.SetReadOnly(true);
			txt.SetBorder(false);
			txt.SetText(s);

			return [tb, txt];
		}

		[this.thresholdScroll, this.thresholdText] = createSlider(0, 100, 0, "Threshold",
			(sender: TrackBar) => {
				state.setThreshold(sender.GetValue() / 100);
			}
		);

		[this.blendAlphaScroll, this.blendAlphaText] = createSlider(0, 100, 50, "Blend Alpha",
			(sender: TrackBar) => {
				state.setBlendAlpha(sender.GetValue() / 100);
			}
		);

		[this.zoomScroll, this.zoomText] = createSlider(1, 16, 1, "Zoom",
			(sender: TrackBar) => {
				state.setZoom(sender.GetValue());
			}
		);

		//
		this.miniView = new MiniView(window);

		//
		this.diffPage = new DiffPage(window, this.app);
		this.miniView.track({
			pager: [this.diffPage.baselinePager, this.diffPage.currentPager, this.diffPage.normalDiffView.container],
			image: this.diffPage.baselineImage.native,
		});

		const container = this.onCreateLayout();
		return container;
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
			rows: "32dpx 128px 32dpx 16dpx 16dpx 16dpx 16dpx 16dpx 16dpx 16dpx 16dpx 16dpx 1",
			columns: "1 1",
			areas: {
				miniView: { x: 0, y: 1, xspan: 2, yspan: 1 },
				blink: { x: 0, y: 3 },
				thresholdText: { x: 0, y: 5 },
				threshold: { x: 1, y: 5 },
				blendAlphaText: { x: 0, y: 7 },
				blendAlpha: { x: 1, y: 7 },
				zoomText: { x: 0, y: 9 },
				zoom: { x: 1, y: 9 },
			},
		};
		const controlGrid = new GridLayout<keyof typeof controlLayout.areas>(window, controlLayout);

		container.addControl(this.diffPage.control, container.areas.main);
		container.addControl(controlGrid.control, container.areas.control);

		controlGrid.addControl(this.blinkCheckBox, controlGrid.areas.blink);

		controlGrid.addControl(this.thresholdText, controlGrid.areas.thresholdText);
		controlGrid.addControl(this.thresholdScroll, controlGrid.areas.threshold);

		controlGrid.addControl(this.blendAlphaText, controlGrid.areas.blendAlphaText);
		controlGrid.addControl(this.blendAlphaScroll, controlGrid.areas.blendAlpha);

		controlGrid.addControl(this.zoomText, controlGrid.areas.zoomText);
		controlGrid.addControl(this.zoomScroll, controlGrid.areas.zoom);

		controlGrid.addControl(this.miniView.control, controlGrid.areas.miniView);

		return container;
	}
}
