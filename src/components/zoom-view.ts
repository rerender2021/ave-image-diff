import { Byo2Image, DrawImageFilter, DrawImageFlag, DrawImageParam, Placeholder, Vec2, Vec4, Window } from "ave-ui";
import { Component } from "./component";

export interface IZoomViewProps {
	image: Byo2Image;
}

export class ZoomView extends Component {
	private view: Placeholder;
	private image: Byo2Image;
	private _pixelPos: Vec2;

	constructor(window: Window) {
		super(window);
		this.onCreate();
	}

	get control() {
		return this.view;
	}

	get pixelPos() {
		return this._pixelPos;
	}

	track(props: IZoomViewProps) {
		const { image } = props;
		this.image = image;
		this.updatePixelPos(new Vec2(-1, -1));
	}

	updatePixelPos(pos: Vec2) {
		this._pixelPos = pos;
	}

	private onCreate() {
		this.view = new Placeholder(this.window);

		const dip = new DrawImageParam();
		dip.Filter = DrawImageFilter.Point;

		this.view.OnPaintPost((sender, painter, rc) => {
			const { image } = this;
			const width = image.GetWidth();
			const height = image.GetHeight();

			const blockSize = rc.w / 9;
			if (this.pixelPos.x >= 0 && this.pixelPos.y >= 0 && this.pixelPos.x < width && this.pixelPos.y < height) {
				const v = Vec2.Zero;
				dip.SourceRect.x = this.pixelPos.x - 4;
				dip.SourceRect.y = this.pixelPos.y - 4;
				dip.SourceRect.w = 9;
				dip.SourceRect.h = 9;
				dip.TargetSize.x = rc.w;
				dip.TargetSize.y = rc.h;
				if (dip.SourceRect.x < 0) {
					v.x -= blockSize * dip.SourceRect.x;
					dip.SourceRect.x = 0;
				}
				if (dip.SourceRect.y < 0) {
					v.y -= blockSize * dip.SourceRect.y;
					dip.SourceRect.y = 0;
				}
				if (dip.SourceRect.Right >= width) dip.SourceRect.w = width - dip.SourceRect.x;
				if (dip.SourceRect.Bottom >= height) dip.SourceRect.h = height - dip.SourceRect.y;
				dip.TargetSize.x = dip.SourceRect.w * blockSize;
				dip.TargetSize.y = dip.SourceRect.h * blockSize;
				painter.DrawImageEx(image, v, DrawImageFlag.TargetSize | DrawImageFlag.SourceRect | DrawImageFlag.Filter, dip);
			}
			painter.SetPenColor(new Vec4(0, 0, 0, 255));
			painter.DrawRectangle(rc.x, rc.y, rc.w, rc.h);
			painter.DrawRectangle((rc.w - blockSize) * 0.5, (rc.h - blockSize) * 0.5, blockSize, blockSize);
			painter.SetPenColor(new Vec4(255, 255, 255, 255));
			painter.DrawRectangle((rc.w - blockSize) * 0.5 - 1, (rc.h - blockSize) * 0.5 - 1, blockSize + 2, blockSize + 2);
		});
	}
}
