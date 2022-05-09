import { Area, createGridLayout, GridLayout } from "../../components";
import { Content } from "./content";
import { Sidebar } from "./sidebar";

export class Main extends Area {
	private content: Content;
	private sidebar: Sidebar;

	protected onCreate(): GridLayout {
		const { window } = this;

		this.content = new Content(window).create();
		//this.sidebar = new Sidebar(window, this.content).create();

		const container = this.onCreateLayout();
		return container;
	}

	private onCreateLayout() {
		const { window } = this;

		const containerLayout = {
			rows: "1",
			columns: "1",
			areas: {
				content: { x: 0, y: 0 },
				sidebar: { x: 1, y: 0 },
			},
		};

		const container = createGridLayout(window, containerLayout);
		container.addControl(this.content.control, container.areas.content);
		//container.addControl(this.sidebar.control, container.areas.sidebar);

		return container;
	}
}
