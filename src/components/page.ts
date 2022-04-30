import { Component } from "./component";
import { GridLayout } from "./layout";
import { App, Window } from "ave-ui";

export interface IPage {
	onCreate(): GridLayout;
}

export abstract class Page extends Component implements IPage {
	private layout: GridLayout;
	app: App;

	constructor(window: Window, app: App) {
		super(window);
		this.app = app;
		this.create();
	}

	get control() {
		return this.layout.control;
	}

	abstract onCreate(): GridLayout;

	private create() {
		this.layout = this.onCreate();
	}
}
