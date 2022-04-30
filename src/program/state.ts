import { makeObservable, observable, action } from "mobx";

export class ProgramState {
	blink: boolean;
	blendAlpha: number;

	constructor() {
		this.blink = false;
		this.blendAlpha = 0.5;

		makeObservable(this, {
			blink: observable,
            setBlink: action,
            
			blendAlpha: observable,
            setBlendAlpha: action,
		});
	}

	setBlendAlpha(alpha: number) {
		this.blendAlpha = alpha;
	}

	setBlink(blink: boolean) {
		this.blink = blink;
	}
}

export const state = new ProgramState();
