import { Component, ImageView } from "../../components";
import { AlignType, App, Pager, ResourceSource, Window } from "ave-ui";
import * as pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

export class DiffView extends Component {
	private view: ImageView;
	private _pager: Pager;
	app: App;

	get control() {
		return this.view.control;
	}

	get pager() {
		return this._pager;
	}

	constructor(window: Window, app: App) {
		super(window);
		this.app = app;
		this.view = new ImageView(window);

		this._pager = new Pager(window);
		this._pager.SetContent(this.view.control);
		this._pager.SetContentHorizontalAlign(AlignType.Center);
		this._pager.SetContentVerticalAlign(AlignType.Center);
	}

	update(baseline: Buffer, current: Buffer) {
		const baselinePNG = PNG.sync.read(baseline);
		const currentPNG = PNG.sync.read(current);

		const { width, height } = baselinePNG;
		const diffPNG = new PNG({ width, height });

		pixelmatch(baselinePNG.data, currentPNG.data, diffPNG.data, width, height, { threshold: 0, includeAA: true, alpha: 0 });
		const diffBuffer = PNG.sync.write(diffPNG);

		// fs.writeFileSync("diff.png", diffBuffer);
		const codec = this.app.GetImageCodec();
		this.view.updateRawImage(codec.Open(ResourceSource.FromBuffer(diffBuffer)));
	}
}
