import { AlignType, App, AveImage, Pager, ResourceSource, Window } from "ave-ui";
import { ImageView, Component } from "../../components";
import { assetBuffer } from "../../utils";

export class BlinkDiffView extends Component {
	private pager: Pager;
	private timer: NodeJS.Timer;

	private baseline: AveImage;
	private current: AveImage;
	private view: ImageView;

	private app: App;

	get control() {
		return this.view.control;
	}

	get contrainer() {
		return this.pager;
	}

	constructor(window: Window, app: App) {
		super(window);
		this.app = app;
		this.onCreate();
	}

	onCreate() {
		const { window } = this;

		//
		this.view = new ImageView(window);

		this.pager = new Pager(window);
		this.pager.SetContent(this.view.control);
		this.pager.SetContentHorizontalAlign(AlignType.Center);
		this.pager.SetContentVerticalAlign(AlignType.Center);

		this.update();
	}

	update() {
		const codec = this.app.GetImageCodec();

		const baselineBuffer = assetBuffer("map-baseline.png");
		const currentBuffer = assetBuffer("map-current.png");

		this.baseline = codec.Open(ResourceSource.FromBuffer(baselineBuffer));
		this.current = codec.Open(ResourceSource.FromBuffer(currentBuffer));

		this.view.updateRawImage(this.baseline);
	}

	blink() {
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

	show(): void {
		this.pager.SetVisible(true);
		this.blink();
	}

	hide(): void {
		this.pager.SetVisible(false);
		clearInterval(this.timer);
	}
}
