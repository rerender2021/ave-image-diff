import { Byo2Image, DrawImageFilter, DrawImageFlag, DrawImageParam, InputModifier, Pager, Placeholder, PointerButton, Rect, Vec2, Vec4, Window } from "ave-ui";
import { Component } from "./component";

export interface IMiniViewProps {
	image: Byo2Image;
	pager: Pager[];
}

export class MiniView extends Component {
	private view: Placeholder;
	private image: Byo2Image;
	private pager: Pager[];

	constructor(window: Window) {
		super(window);
		this.onCreate();
	}

	get control() {
		return this.view;
	}

	track(props: IMiniViewProps) {
		const { image, pager } = props;
		this.image = image;
		this.pager = pager;
	}

	private onCreate() {
		this.view = new Placeholder(this.window);

		const dip = new DrawImageParam();
		dip.Filter = DrawImageFilter.Point;

		this.view.OnPaintPost((sender, painter, rc) => {
			const { image, pager: allPagers } = this;
			const pager = allPagers[0];

			const width = image.GetWidth();
			const height = image.GetHeight();

			const rcImage = new Rect(0, 0, width, height);
			const rcContainer = new Rect(rc.x, rc.y, rc.w, rc.h);
			rcImage.UniformScale(rcContainer);
			dip.TargetSize.x = rcImage.w;
			dip.TargetSize.y = rcImage.h;
			painter.DrawImageEx(image, rcImage.Position, DrawImageFlag.TargetSize, dip);
			painter.SetPenColor(new Vec4(0, 0, 0, 255));
			const sm = pager.GetScrollMax();
			const sp = pager.GetScrollPosition();
			const rcp = pager.GetRectClient();
			if (sm.x > 0 || sm.y > 0) {
				const rcv = new Rect(0, 0, 1, 1);
				if (sm.x > 0) {
					rcv.x = -sp.x / sm.x;
					rcv.w = rcp.w / sm.x;
				}
				if (sm.y > 0) {
					rcv.y = -sp.y / sm.y;
					rcv.h = rcp.h / sm.y;
				}
				rcv.x = rcv.x * rcImage.w + rcImage.x;
				rcv.w *= rcImage.w;
				rcv.y = rcv.y * rcImage.h + rcImage.y;
				rcv.h *= rcImage.h;
				painter.SetPenColor(new Vec4(255, 255, 255, 255));
				painter.DrawRectangle(rcv.x - 1, rcv.y - 1, rcv.w + 2, rcv.h + 2);
				painter.SetPenColor(new Vec4(0, 0, 0, 255));
				painter.DrawRectangle(rcv.x, rcv.y, rcv.w, rcv.h);
			}
			painter.DrawRectangle(rc.x, rc.y, rc.w, rc.h);
		});

		//
		const moveMiniView = (v: Vec2) => {
			const { image } = this;
			const width = image.GetWidth();
			const height = image.GetHeight();

			this.pager.forEach((pager) => {
				const sm = pager.GetScrollMax();
				const rc = this.view.GetRectClient();
				const rcp = pager.GetRectClient();
				if (sm.x > 0 || sm.y > 0) {
					const rcImage = new Rect(0, 0, width, height);
					rcImage.UniformScale(rc);
					const vPos = Vec2.Zero;
					if (width > rc.w) vPos.x = -Math.max(0, ((v.x - rcImage.x) / rcImage.w) * sm.x - rcp.w * 0.5);
					if (height > rc.h) vPos.y = -Math.max(0, ((v.y - rcImage.y) / rcImage.h) * sm.y - rcp.h * 0.5);
					pager.SetScrollPosition(vPos, false);
				}
			});
		};

		this.view.OnPointerPress((sender, mp) => {
			if (PointerButton.First == mp.Button) moveMiniView(mp.Position);
		});

		this.view.OnPointerMove((sender, mp) => {
			if (InputModifier.Button1 & mp.Modifier) moveMiniView(mp.Position);
		});
	}
}
