import { Component, ImageView } from "../../components";
import { AlignType, App, AveImage, Pager, PixFormat, ResourceSource, Vec2, Window, ImageData, ImageBox } from "ave-ui";
import * as pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { state } from "../state";
import { autorun } from "mobx";

export class NormalDiffView extends Component {
	private view: ImageView;
	private pager: Pager;
	private baseline: AveImage;	
	private current: AveImage;
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

	update(baseline: AveImage, current: AveImage, threshold = 0, blendAlpha = 0.5) {
		if (!baseline || !current) {
			return;
		}

		this.baseline = baseline;
		this.current = current;

		const md0 = this.baseline.GetMetadata(0);
		const md1 = this.current.GetMetadata(0);
		if (md0.Width != md1.Width || md0.Height != md1.Height)
			return;

		let img = [this.baseline, this.current];
		let data = img.map((e) => e.GetImage(0, 0, 0));

		// pixelmatch only accept R8G8B8A8_UNORM without data padding
		data.forEach((d, i) => {
			if (d.RowPitch != d.Width * 4 || PixFormat.R8G8B8A8_UNORM != d.Format) {
				let dn = new ImageData();
				dn.Width = d.Width;
				dn.Height = d.Height;
				dn.Depth = d.Depth;
				dn.Format = PixFormat.R8G8B8A8_UNORM;
				dn.RowPitch = dn.Width * 4; // Each row exactly 4 * width bytes without padding
				dn.SlicePitch = dn.RowPitch * dn.Height;
				dn.Data = new ArrayBuffer(dn.SlicePitch * dn.Depth);
				img[i].CopyTo(dn, 0, 0, 0, 0, null, 0);
				data[i] = dn;
			}
		});

		const diffData = new ImageData();
		diffData.Width = md0.Width;
		diffData.Height = md0.Height;
		diffData.Depth = 1;
		diffData.Format = PixFormat.R8G8B8A8_UNORM;
		diffData.RowPitch = diffData.Width * 4; // Each row exactly 4 * width bytes without padding
		diffData.SlicePitch = diffData.RowPitch * diffData.Height;
		diffData.Data = new ArrayBuffer(diffData.SlicePitch * diffData.Depth);

		pixelmatch(new Uint8Array(data[0].Data), new Uint8Array(data[1].Data), new Uint8Array(diffData.Data), md0.Width, md0.Height, { threshold: threshold, includeAA: true, alpha: blendAlpha });

		const diffImage = new AveImage();
		if (!diffImage.Create2D(PixFormat.R8G8B8A8_UNORM, md0.Width, md0.Height, 1, 1))
			return;
		diffImage.CopyFrom(0, 0, 0, 0, diffData, ImageBox.Full(), 0);

		this.view.updateRawImage(diffImage);
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
