import { Component } from "./component";
import { GridLayout } from "./layout";

export interface IPage {
	onCreate(): GridLayout;
}

export abstract class Page extends Component implements IPage {
	private layout: GridLayout;

	get control() {
		return this.layout.control;
	}

	abstract onCreate(): GridLayout;

	create() {
		this.layout = this.onCreate();
	}
}
