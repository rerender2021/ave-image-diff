import { AlignType, App, Pager, ResourceSource, Window } from "ave-ui";
import { ImageView, Component } from "../../components";
import { assetBuffer } from "../../utils";

export class BlinkDiffView extends Component {
	private pager: Pager;
	private timer: NodeJS.Timer;

	private baselineImage: ImageView;
	private currentImage: ImageView;

	private app: App;

	get control() {
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
		this.baselineImage = new ImageView(window);
		this.currentImage = new ImageView(window);

		this.pager = new Pager(window);
		this.pager.SetContent(this.baselineImage.control);
		this.pager.SetContentHorizontalAlign(AlignType.Center);
		this.pager.SetContentVerticalAlign(AlignType.Center);

		
		this.update();
	}

	update() {
		const codec = this.app.GetImageCodec();

		const baselineBuffer = assetBuffer("map-baseline.png");
		const currentBuffer = assetBuffer("map-current.png");

		const baselineSource = ResourceSource.FromBuffer(baselineBuffer);
		this.baselineImage.updateRawImage(codec.Open(baselineSource));

		const currentSource = ResourceSource.FromBuffer(currentBuffer);
		this.currentImage.updateRawImage(codec.Open(currentSource));
	}

	blink() {
		this.timer = setInterval(() => {
			const thisTurn = this.pager.GetContent();
			if (thisTurn === this.baselineImage.control) {
				this.pager.SetContent(this.currentImage.control);
			} else if (thisTurn === this.currentImage.control) {
				this.pager.SetContent(this.baselineImage.control);
			}
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
