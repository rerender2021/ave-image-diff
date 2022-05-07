import { AlignType, AveImage, Pager, ResourceSource, Vec2, Window } from "ave-ui";
import { autorun } from "mobx";
import { ImageView, Component } from "../../components";
import { readAsBuffer } from "../../utils";
import { state } from "../state";

export class BlinkDiff extends Component {
	private pager: Pager;
	private timer: NodeJS.Timer;

	private baseline: AveImage;
	private current: AveImage;
	private view: ImageView;

	get control() {
		return this.view.control;
	}

	get contrainer() {
		return this.pager;
	}

	constructor(window: Window) {
		super(window);
		this.onCreate();
	}

	private onCreate() {
		const { window } = this;

		//
		this.view = new ImageView(window);

		this.pager = new Pager(window);
		this.pager.SetContent(this.view.control);
		this.pager.SetContentHorizontalAlign(AlignType.Center);
		this.pager.SetContentVerticalAlign(AlignType.Center);

		this.update();
		this.watch();
	}

	update() {
		const codec = state.getApp().GetImageCodec();
		this.baseline = codec.Open(ResourceSource.FromBuffer(readAsBuffer(state.baselineFile)));
		this.current = codec.Open(ResourceSource.FromBuffer(readAsBuffer(state.currentFile)));
		this.view.updateRawImage(this.baseline);
		this.pager.SetContentSize(new Vec2(this.view.width, this.view.height));
	}

	private watch() {
		autorun(() => {
			this.update();
		});
	}

	private blink() {
		let displayBaseline = true;
		this.timer = setInterval(() => {
			if (displayBaseline) {
				this.view.updateRawImage(this.baseline);
			} else {
				this.view.updateRawImage(this.current);
			}
			displayBaseline = !displayBaseline;
		}, 500);
	}

	setZoom(zoom: number) {
		this.pager.SetContentSize(new Vec2(this.view.width * zoom, this.view.height * zoom));
	}
	
	show(): void {
		this.pager.SetVisible(true);
		this.blink();
	}

	hide(): void {
		this.pager.SetVisible(false);
		clearInterval(this.timer);
	}
}
