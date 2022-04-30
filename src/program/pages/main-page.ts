import { CheckBox, CheckValue } from "ave-ui";
import { GridLayout, Page } from "../../components";
import { BlinkDiffPage } from "./blink-diff-page";
import { NormalDiffPage } from "./normal-diff-page";

export class MainPage extends Page {
	private inBlinkMode: boolean;

	blinkCheckBox: CheckBox;
	normalDiffPage: NormalDiffPage;
	blinkDiffPage: BlinkDiffPage;

	onCreate(): GridLayout {
		const { window } = this;

		//
		this.blinkCheckBox = new CheckBox(window);
		this.blinkCheckBox.SetText("Blink");
		this.blinkCheckBox.OnCheck((sender: CheckBox) => {
			const checkValue = sender.GetValue();
			this.inBlinkMode = checkValue === CheckValue.Checked;
			console.log(`in blink mode: ${this.inBlinkMode}`);
		});

		//
		this.normalDiffPage = new NormalDiffPage(window, this.app);
		this.blinkDiffPage = new BlinkDiffPage(window, this.app);

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
			rows: "32dpx 32dpx 4dpx 1",
			columns: "1",
			areas: {
				blink: { x: 0, y: 1 },
			},
		};
		const controlGrid = new GridLayout<keyof typeof controlLayout.areas>(window, controlLayout);

		container.addControl(this.blinkDiffPage.control, container.areas.main);
		container.addControl(controlGrid.control, container.areas.control);

		controlGrid.addControl(this.blinkCheckBox, controlGrid.areas.blink);

		return container;
	}
}
