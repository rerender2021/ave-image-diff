import { makeObservable, observable, action } from "mobx";

export class ProgramState {
	blink: boolean;

	constructor() {
		makeObservable(this, {
			blink: false,
		});
	}
}

export const state = new ProgramState();
