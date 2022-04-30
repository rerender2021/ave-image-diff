import { CheckBox, CheckValue, ScrollBar, TextBox } from "ave-ui";
import { GridLayout, Page } from "../../components";
import { state } from "../state";
import { NormalDiffPage } from "./normal-diff-page";
import * as debounce from "debounce";

export class MainPage extends Page {
	blinkCheckBox: CheckBox;
	blendAlphaScroll: ScrollBar;
	blendAlphaText: TextBox;

	normalDiffPage: NormalDiffPage;

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
		this.normalDiffPage = new NormalDiffPage(window, this.app);

		const container = this.onCreateLayout();
		return container;
	}

	onCreateLayout() {
		const { window } = this;

		//
		const containerLayout = {
			rows: "1",
			columns: "1 192dpx",
			areas: {
				main: { x: 0, y: 0 },
				control: { x: 1, y: 0 },
			},
		};
		const container = new GridLayout<keyof typeof containerLayout.areas>(window, containerLayout);

		const controlLayout = {
			rows: "32dpx 32dpx 4dpx 16dpx 4dpx 1",
			columns: "1 1",
			areas: {
				blink: { x: 0, y: 1 },
				blendAlpha: { x: 1, y: 3 },
				blendAlphaText: { x: 0, y: 3 },
			},
		};
		const controlGrid = new GridLayout<keyof typeof controlLayout.areas>(window, controlLayout);

		container.addControl(this.normalDiffPage.control, container.areas.main);
		container.addControl(controlGrid.control, container.areas.control);

		controlGrid.addControl(this.blinkCheckBox, controlGrid.areas.blink);
		controlGrid.addControl(this.blendAlphaText, controlGrid.areas.blendAlphaText);
		controlGrid.addControl(this.blendAlphaScroll, controlGrid.areas.blendAlpha);

		return container;
	}
}
