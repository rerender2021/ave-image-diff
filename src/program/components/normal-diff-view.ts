import { Component, ImageView } from "../../components";
import { AlignType, App, Pager, ResourceSource, Vec2, Window } from "ave-ui";
import * as pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { state } from "../state";
import { autorun } from "mobx";

export class NormalDiffView extends Component {
	private view: ImageView;
	private pager: Pager;
	private baseline: Buffer;
	private current: Buffer;
	private app: App;

	get control() {
		return this.view.control;
	}

	get container() {
		return this.pager;
	}

	constructor(window: Window, app: App) {
		super(window);
		this.app = app;
		this.onCreate();
	}

	private onCreate() {
		const { window } = this;
		this.view = new ImageView(window);

		this.pager = new Pager(window);
		this.pager.SetContent(this.view.control);
		this.pager.SetContentHorizontalAlign(AlignType.Center);
		this.pager.SetContentVerticalAlign(AlignType.Center);

		this.watch();
	}

	watch() {
		autorun(() => {
			this.update(this.baseline, this.current, state.blendAlpha);
		});
	}

	update(baseline: Buffer, current: Buffer, blendAlpha = 0.5) {
		if (!baseline || !current) {
			return;
		}

		this.baseline = baseline;
		this.current = current;

		const baselinePNG = PNG.sync.read(this.baseline);
		const currentPNG = PNG.sync.read(this.current);

		if (baselinePNG.width !== currentPNG.width || baselinePNG.height !== currentPNG.height) {
			return;
		}

		const { width, height } = baselinePNG;
		const diffPNG = new PNG({ width, height });

		pixelmatch(baselinePNG.data, currentPNG.data, diffPNG.data, width, height, { threshold: 0, includeAA: true, alpha: blendAlpha });
		const diffBuffer = PNG.sync.write(diffPNG);

		// fs.writeFileSync("diff.png", diffBuffer);
		const codec = this.app.GetImageCodec();
		this.view.updateRawImage(codec.Open(ResourceSource.FromBuffer(diffBuffer)));
		this.pager.SetContentSize(new Vec2(width, height));
	}

	show(): void {
		this.pager.SetVisible(true);
	}

	hide(): void {
		this.pager.SetVisible(false);
	}
}
