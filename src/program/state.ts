import { makeObservable, observable, action } from "mobx";

export class ProgramState {
	blink: boolean;
	blendAlpha: number;
	zoom: number;

	constructor() {
		this.blink = false;
		this.blendAlpha = 0.5;
		this.zoom = 1;

		makeObservable(this, {
			blink: observable,
			setBlink: action,

			blendAlpha: observable,
			setBlendAlpha: action,

			zoom: observable,
			setZoom: action,
		});
	}

	setBlendAlpha(alpha: number) {
		this.blendAlpha = alpha;
	}

	setBlink(blink: boolean) {
		this.blink = blink;
	}

	setZoom(zoom: number) {
		this.zoom = zoom;
		console.log(`zoom: ${zoom}`);
	}
}

export const state = new ProgramState();
