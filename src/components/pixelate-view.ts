import { Byo2Image, DrawImageFilter, DrawImageFlag, DrawImageParam, Placeholder, Vec2, Window } from "ave-ui";
import { Component } from "./component";

export interface IPixelateViewProps {
	image: Byo2Image;
}

export class PixelateView extends Component {
	private view: Placeholder;
	private image: Byo2Image;

	constructor(window: Window) {
		super(window);
		this.onCreate();
	}

	get control() {
		return this.view;
	}

	track(props: IPixelateViewProps) {
		const { image } = props;
		this.image = image;
	}

	private onCreate() {
		this.view = new Placeholder(this.window);

		const dip = new DrawImageParam();
		dip.Filter = DrawImageFilter.Point;

		this.view.OnPaintPost((sender, painter, rc) => {
			const { image } = this;
			painter.DrawImageEx(image, new Vec2(0, 0), DrawImageFlag.Filter, dip);
		});
	}
}
