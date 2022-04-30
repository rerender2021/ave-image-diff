import { CheckBox, CheckValue } from "ave-ui";
import { GridLayout, Page } from "../../components";

export class MainPage extends Page {
	private inBlinkMode: boolean;

	onCreate(): GridLayout {
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
			rows: "32dpx 4dpx 1",
			columns: "1",
			areas: {
				blink: { x: 0, y: 0 },
			},
		};
		const controlGrid = new GridLayout<keyof typeof controlLayout.areas>(window, controlLayout);

		//
		const blinkCheckBox = new CheckBox(window);
		blinkCheckBox.SetText("Blink");
		blinkCheckBox.OnCheck((sender: CheckBox) => {
			const checkValue = sender.GetValue();
			this.inBlinkMode = checkValue === CheckValue.Checked;
			console.log(`in blink mode: ${this.inBlinkMode}`);
		});

		container.addControl(controlGrid.control, container.areas.control);
		controlGrid.addControl(blinkCheckBox, controlGrid.areas.blink);
		return container;
	}
}
