import { Button } from "ave-ui";
import { GridLayout, Page } from "../../components";

export class NormalPage extends Page {
	onCreate(): GridLayout {
		const { window } = this;

		const pageLayout = {
			rows: "1",
			columns: "1",
			areas: {
				main: { x: 0, y: 0 },
			},
		};
		const layout = new GridLayout<keyof typeof pageLayout.areas>(window, pageLayout);

		const button = new Button(window);
		button.SetText("Button");

		layout.addControl(button, layout.areas.main);

		return layout;
	}
}
