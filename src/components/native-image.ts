import { AveImage, Byo2Image, Byo2ImageCreation, Byo2ImageDataType, IByo2Image, ImageData, ResourceSource, Window, ImageBox, Rect, InMemoryData, Vec2, Vec4 } from "ave-ui";
import { Component } from "./component";

export interface INativeImage {
	readPixel(x: number, y: number): Vec4;
	updateData(data: ImageData): void;
	data: AveImage;
	native: IByo2Image;
}

export class NativeRawImage extends Component implements INativeImage {
	private byo2: IByo2Image;
	private aveImage: AveImage;
	private imgData: ImageData;

	constructor(window: Window, aveImage: AveImage) {
		super(window);
		this.aveImage = aveImage;
		this.onCreate();
	}

	get data() {
		return this.aveImage;
	}

	get native() {
		return this.byo2;
	}

	private onCreate() {
		const imgcp = new Byo2ImageCreation();
		imgcp.DataType = Byo2ImageDataType.Raw;

		this.imgData = this.aveImage.GetImage(0, 0, 0);
		imgcp.Data = ResourceSource.FromArrayBuffer(this.imgData.Data, this.imgData.RowPitch, this.imgData.SlicePitch);
		imgcp.Width = this.imgData.Width;
		imgcp.Height = this.imgData.Height;
		imgcp.Format = this.imgData.Format;
		this.byo2 = new Byo2Image(this.window, imgcp);
	}

	updateData(data: ImageData) {
		this.data.CopyFrom(0, 0, 0, 0, data, ImageBox.Full(), 0);
		this.byo2.Upload(Rect.Empty, new InMemoryData(data.Data, data.RowPitch, data.SlicePitch));
	}

	readPixel(x: number, y: number) {
		const color = this.imgData.GetPixel(x, y, 0);
		return new Vec4(color.r * 255, color.g * 255, color.b * 255, color.a * 255);
	}
}
