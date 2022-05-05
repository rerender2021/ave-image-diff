import { Component } from "./component";
import { GridLayout } from "./layout";
import { Window } from "ave-ui";

export interface IArea {
	onCreate(): GridLayout;
}

export abstract class Area extends Component implements IArea {
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
