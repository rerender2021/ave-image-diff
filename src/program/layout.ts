import { Window } from "ave-ui";
import { GridLayout } from "../components";

export function getAppLayout(window: Window) {
	const containerLayout = {
		rows: "1",
		columns: "1 1",
		areas: {
			baseline: { x: 0, y: 0 },
			current: { x: 1, y: 0 },
		},
	};

	return {
		container: new GridLayout<keyof typeof containerLayout.areas>(window, containerLayout),
	};
}
