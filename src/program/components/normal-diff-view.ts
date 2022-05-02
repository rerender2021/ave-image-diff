import { Component, ImageView } from "../../components";
import { AlignType, App, AveImage, Pager, PixFormat, ResourceSource, Vec2, Window, ImageData, ImageBox, AveLib } from "ave-ui";
import * as pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { state } from "../state";
import { autorun } from "mobx";

export class NormalDiffView extends Component {
	private view: ImageView;
	private pager: Pager;
	private baseline: AveImage;
	private current: AveImage;
	private baselineData: ImageData;
	private currentData: ImageData;
	private diffData: ImageData;
	//private baseline: Buffer;
	//private current: Buffer;
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
			this.update(this.baseline, this.current, state.threshold, state.blendAlpha);
		});
	}

	private getImageData(img: AveImage) {
		const data = img.GetImage(0, 0, 0);
		if (data.RowPitch != data.Width * 4 || PixFormat.R8G8B8A8_UNORM != data.Format) {
			const dn = new ImageData();
			dn.Width = data.Width;
			dn.Height = data.Height;
			dn.Depth = data.Depth;
			dn.Format = PixFormat.R8G8B8A8_UNORM;
			dn.RowPitch = dn.Width * 4; // Each row exactly 4 * width bytes without padding
			dn.SlicePitch = dn.RowPitch * dn.Height;
			dn.Data = new ArrayBuffer(dn.SlicePitch * dn.Depth);
			img.CopyTo(dn, 0, 0, 0, 0, null, 0);
			return dn;
		}
		return data;
	}

	update(baseline: AveImage, current: AveImage, fThreshold = 0, blendAlpha = 0.5) {
		if (!baseline || !current) {
			return;
		}

		if (this.baseline != baseline) {
			this.baseline = baseline;
			console.time("GetImage");
			this.baselineData = this.getImageData(this.baseline);
			console.timeEnd("GetImage");
			this.diffData = null;
		}
		if (this.current != current) {
			this.current = current;
			this.currentData = this.getImageData(this.current);
			this.diffData = null;
		}

		const md0 = this.baseline.GetMetadata(0);
		const md1 = this.current.GetMetadata(0);
		if (md0.Width != md1.Width || md0.Height != md1.Height)
			return;

		if (!this.diffData) {
			this.diffData = new ImageData();
			this.diffData.Width = md0.Width;
			this.diffData.Height = md0.Height;
			this.diffData.Depth = 1;
			this.diffData.Format = PixFormat.R8G8B8A8_UNORM;
			this.diffData.RowPitch = this.diffData.Width * 4; // Each row exactly 4 * width bytes without padding
			this.diffData.SlicePitch = this.diffData.RowPitch * this.diffData.Height;
			this.diffData.Data = new ArrayBuffer(this.diffData.SlicePitch * this.diffData.Depth);
		}
		let data = [this.baselineData, this.currentData];

		//AveLib.AvePixelMatch(data[0].Data, data[1].Data, diffData.Data, md0.Width, md0.Height, { threshold: threshold, includeAA: true, alpha: blendAlpha });
		console.time("pixelmatch");
		pixelmatch(new Uint8Array(data[0].Data), new Uint8Array(data[1].Data), new Uint8Array(this.diffData.Data), md0.Width, md0.Height, { threshold: fThreshold, includeAA: true, alpha: blendAlpha });
		console.timeEnd("pixelmatch");

		this.view.updateRawData(this.diffData);
		this.pager.SetContentSize(new Vec2(md0.Width, md0.Height));
	}

	// update(baseline: Buffer, current: Buffer, blendAlpha = 0.5) {
	// 	if (!baseline || !current) {
	// 		return;
	// 	}

	// 	this.baseline = baseline;
	// 	this.current = current;

	// 	const baselinePNG = PNG.sync.read(this.baseline);
	// 	const currentPNG = PNG.sync.read(this.current);

	// 	if (baselinePNG.width !== currentPNG.width || baselinePNG.height !== currentPNG.height) {
	// 		return;
	// 	}

	// 	const { width, height } = baselinePNG;
	// 	const diffPNG = new PNG({ width, height });

	// 	pixelmatch(baselinePNG.data, currentPNG.data, diffPNG.data, width, height, { threshold: 0, includeAA: true, alpha: blendAlpha });
	// 	const diffBuffer = PNG.sync.write(diffPNG);

	// 	// fs.writeFileSync("diff.png", diffBuffer);
	// 	const codec = this.app.GetImageCodec();
	// 	this.view.updateRawImage(codec.Open(ResourceSource.FromBuffer(diffBuffer)));
	// 	this.pager.SetContentSize(new Vec2(width, height));
	// }

	setZoom(zoom: number) {
		this.pager.SetContentSize(new Vec2(this.view.width * zoom, this.view.height * zoom));
	}

	show(): void {
		this.pager.SetVisible(true);
	}

	hide(): void {
		this.pager.SetVisible(false);
	}
}
