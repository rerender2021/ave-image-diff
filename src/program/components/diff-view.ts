import { Component, GridLayout, ImageView } from "../../components";
import { AlignType, App, Pager, ResourceSource, ScrollBar, Window } from "ave-ui";
import * as pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import * as debounce from "debounce";

export class DiffView extends Component {
	private view: ImageView;
	private _pager: Pager;
	private alphaScroll: ScrollBar;
	private layout: GridLayout;
	private currentAlpha: number;
	private baseline: Buffer;
	private current: Buffer;

	app: App;

	get control() {
		return this.view.control;
	}

	get pager() {
		return this._pager;
	}

	get grid() {
		return this.layout.control;
	}

	constructor(window: Window, app: App) {
		super(window);
		this.app = app;
		this.onCreate();
	}

	private onCreate() {
		const { window } = this;
		this.view = new ImageView(window);

		this._pager = new Pager(window);
		this._pager.SetContent(this.view.control);
		this._pager.SetContentHorizontalAlign(AlignType.Center);
		this._pager.SetContentVerticalAlign(AlignType.Center);

		this.currentAlpha = 50;
		this.alphaScroll = new ScrollBar(window);
		this.alphaScroll.SetMinimum(0).SetMaximum(100).SetValue(this.currentAlpha).SetShrink(false);
		this.alphaScroll.OnScrolling(
			debounce((sender: ScrollBar) => {
				this.currentAlpha = sender.GetValue();
				this.update(this.baseline, this.current);
			}, 300)
		);

		this.onCreateLayout();
	}

	private onCreateLayout() {
		const { window } = this;

		//
		const containerLayout = {
			rows: "1",
			columns: "1 32dpx 64dpx",
			areas: {
				main: { x: 0, y: 0 },
				control: { x: 2, y: 0 },
			},
		};
		this.layout = new GridLayout<keyof typeof containerLayout.areas>(window, containerLayout);

		const controlLayout = {
			rows: "32dpx 16dpx 4dpx 1",
			columns: "1",
			areas: {
				alpha: { x: 0, y: 1 },
			},
		};
		const controlGrid = new GridLayout<keyof typeof controlLayout.areas>(window, controlLayout);

		this.layout.addControl(this._pager, this.layout.areas.main);
		this.layout.addControl(controlGrid.control, this.layout.areas.control);

		controlGrid.addControl(this.alphaScroll, controlGrid.areas.alpha);
	}

	update(baseline: Buffer, current: Buffer) {
		this.baseline = baseline;
		this.current = current;

		const baselinePNG = PNG.sync.read(baseline);
		const currentPNG = PNG.sync.read(current);

		const { width, height } = baselinePNG;
		const diffPNG = new PNG({ width, height });

		pixelmatch(baselinePNG.data, currentPNG.data, diffPNG.data, width, height, { threshold: 0, includeAA: true, alpha: this.currentAlpha / 100 });
		const diffBuffer = PNG.sync.write(diffPNG);

		// fs.writeFileSync("diff.png", diffBuffer);
		const codec = this.app.GetImageCodec();
		this.view.updateRawImage(codec.Open(ResourceSource.FromBuffer(diffBuffer)));
	}
}
