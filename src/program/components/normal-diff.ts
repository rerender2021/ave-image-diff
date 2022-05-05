import { Component, ImageView } from "../../components";
import { AlignType, AveImage, Pager, PixFormat, Vec2, Window, ImageData, AveGetImageProcessor } from "ave-ui";
import { state } from "../state";
import { autorun } from "mobx";

export class NormalDiff extends Component {
	private view: ImageView;
	private pager: Pager;
	private baseline: AveImage;
	private current: AveImage;
	private baselineData: ImageData;
	private currentData: ImageData;
	private diffData: ImageData;

	get control() {
		return this.view.control;
	}

	get container() {
		return this.pager;
	}

	constructor(window: Window) {
		super(window);
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

	private watch() {
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
		if (md0.Width != md1.Width || md0.Height != md1.Height) return;

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

		console.time("pixelmatch");
		const processor = AveGetImageProcessor();
		processor.PixelMatch(data[0].Data, data[1].Data, this.diffData.Data, md0.Width, md0.Height, { threshold: fThreshold, includeAA: true, alpha: blendAlpha });
		console.timeEnd("pixelmatch");

		this.view.updateRawData(this.diffData);
		this.pager.SetContentSize(new Vec2(md0.Width, md0.Height));
	}

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
