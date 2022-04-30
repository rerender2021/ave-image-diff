import { Component } from "./component";
import { GridLayout } from "./layout";
import { Window } from "ave-ui";

export interface IPage {
	onCreate(): GridLayout;
}

export abstract class Page extends Component implements IPage {
	private layout: GridLayout;

	constructor(window: Window) {
		super(window);
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
