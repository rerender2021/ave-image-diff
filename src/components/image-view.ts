import { AveImage, DrawImageFilter, Picture, StretchMode, Window, ImageData, ImageBox } from "ave-ui";
import { Component } from "./component";
import { INativeImage, NativeRawImage } from "./native-image";

export class ImageView extends Component {
	private view: Picture;
	private image: INativeImage;

	constructor(window: Window) {
		super(window);
		this.onCreate();
	}

	get control() {
		return this.view;
	}

	get data() {
		return this.image.data;
	}

	get native() {
		return this.image.native;
	}

	get width() {
		return this.image.native.GetWidth();
	}

	get height() {
		return this.image.native.GetHeight();
	}

	readPixel(x: number, y: number) {
		return this.image.readPixel(x, y);
	}

	private onCreate() {
		this.view = new Picture(this.window);
		this.view.SetStretchMode(StretchMode.Fit);
		this.view.SetImageFilter(DrawImageFilter.Point);
	}

	updateRawImage(aveImage: AveImage) {
		this.image = new NativeRawImage(this.window, aveImage);
		this.view.SetImage(this.image.native);
	}

	updateRawData(data: ImageData) {
		if (this.image) {
			const md = this.image.data.GetMetadata(0);
			if (md.Format != data.Format || md.Width != data.Width || md.Height != data.Height)
				this.image = null;
		}
		if(!this.image){
			const img = new AveImage();
			img.Create2D(data.Format, data.Width, data.Height, 1, 1);
			img.CopyFrom(0, 0, 0, 0, data, ImageBox.Full(), 0);
			this.updateRawImage(img);
		} else {
			this.image.updateData(data);
		}
	}

	redraw() {
		this.view.Redraw();
	}
}
