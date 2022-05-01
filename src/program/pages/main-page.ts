import { CheckBox, CheckValue, ScrollBar, TextBox } from "ave-ui";
import { GridLayout, MiniView, Page } from "../../components";
import { state } from "../state";
import { DiffPage } from "./diff-page";
import * as debounce from "debounce";

export class MainPage extends Page {
	blinkCheckBox: CheckBox;
	blendAlphaScroll: ScrollBar;
	blendAlphaText: TextBox;

	zoomScroll: ScrollBar;
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

		//
		this.blendAlphaScroll = new ScrollBar(window);
		this.blendAlphaScroll.SetMinimum(0).SetMaximum(100).SetValue(50).SetShrink(false);
		this.blendAlphaScroll.OnScrolling(
			debounce((sender: ScrollBar) => {
				state.setBlendAlpha(sender.GetValue() / 100);
			}, 300)
		);

		this.blendAlphaText = new TextBox(window);
		this.blendAlphaText.SetReadOnly(true);
		this.blendAlphaText.SetBorder(false);
		this.blendAlphaText.SetText("Blend Alpha");

		//
		this.zoomScroll = new ScrollBar(window);
		this.zoomScroll.SetMinimum(1).SetMaximum(5).SetValue(1).SetShrink(false);
		this.zoomScroll.OnScrolling(
			debounce((sender: ScrollBar) => {
				state.setZoom(sender.GetValue());
			}, 300)
		);

		this.zoomText = new TextBox(window);
		this.zoomText.SetReadOnly(true);
		this.zoomText.SetBorder(false);
		this.zoomText.SetText("Zoom");

		//
		this.miniView = new MiniView(window);

		//
		this.diffPage = new DiffPage(window, this.app);
		this.miniView.track({ pager: [this.diffPage.baselinePager, this.diffPage.currentPager], image: this.diffPage.baselineImage.native });

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
			rows: "32dpx 128px 32dpx 16dpx 16dpx 16dpx 16dpx 16dpx 1",
			columns: "1 1",
			areas: {
				miniView: { x: 0, y: 1, xspan: 2, yspan: 1 },
				blink: { x: 0, y: 3 },
				blendAlphaText: { x: 0, y: 5 },
				blendAlpha: { x: 1, y: 5 },
				zoomText: { x: 0, y: 7 },
				zoom: { x: 1, y: 7 },
			},
		};
		const controlGrid = new GridLayout<keyof typeof controlLayout.areas>(window, controlLayout);

		container.addControl(this.diffPage.control, container.areas.main);
		container.addControl(controlGrid.control, container.areas.control);

		controlGrid.addControl(this.blinkCheckBox, controlGrid.areas.blink);

		controlGrid.addControl(this.blendAlphaText, controlGrid.areas.blendAlphaText);
		controlGrid.addControl(this.blendAlphaScroll, controlGrid.areas.blendAlpha);

		controlGrid.addControl(this.zoomText, controlGrid.areas.zoomText);
		controlGrid.addControl(this.zoomScroll, controlGrid.areas.zoom);

		controlGrid.addControl(this.miniView.control, controlGrid.areas.miniView);

		return container;
	}
}
