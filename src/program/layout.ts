import { Window } from "ave-ui";
import { GridLayout } from "../components";

export function getAppLayout(window: Window) {
	const containerLayout = {
		rows: "32dpx 1 32dpx 1 32dpx",
		columns: "32dpx 1 32dpx 1 32dpx",
		areas: {
			baseline: { x: 1, y: 1 },
			current: { x: 3, y: 1 },
			diff: { x: 3, y: 3 },
			zoom: { x: 1, y: 3 },
		},
	};

	const zoomLayout = {
		rows: "1 192dpx 1",
		columns: "1 192dpx 32dpx 192dpx 1",
		areas: {
			baseline: { x: 1, y: 1 },
			current: { x: 3, y: 1 },
		},
	};

	return {
		container: new GridLayout<keyof typeof containerLayout.areas>(window, containerLayout),
		zoomGrid: new GridLayout<keyof typeof zoomLayout.areas>(window, zoomLayout),
	};
}
