import { AlignType, Pager, ResourceSource } from "ave-ui";
import { GridLayout, ImageView, Page } from "../../components";
import { assetBuffer } from "../../utils";
import { DiffView } from "../components/diff-view";

export class BlinkDiffPage extends Page {
	blinkPager: Pager;
	blinkTimer: NodeJS.Timer;

	baselineImage: ImageView;
	baselineSource: ResourceSource;

	currentImage: ImageView;
	currentSource: ResourceSource;

	diffView: DiffView;

	onCreate(): GridLayout {
		const { window } = this;

		//
		this.baselineImage = new ImageView(window);
		this.currentImage = new ImageView(window);

		this.blinkPager = new Pager(window);
		this.blinkPager.SetContent(this.baselineImage.control);
		this.blinkPager.SetContentHorizontalAlign(AlignType.Center);
		this.blinkPager.SetContentVerticalAlign(AlignType.Center);

		//
		this.diffView = new DiffView(window, this.app);

		this.update();
		this.blink();

		//
		const container = this.onCreateLayout();
		return container;
	}

	onCreateLayout() {
		const { window } = this;

		//
		const containerLayout = {
			rows: "32dpx 1 32dpx",
			columns: "32dpx 1 32dpx 1 32dpx",
			areas: {
				blink: { x: 1, y: 1 },
				diff: { x: 3, y: 1 },
			},
		};
		const container = new GridLayout<keyof typeof containerLayout.areas>(window, containerLayout);

		container.addControl(this.blinkPager, container.areas.blink);
		container.addControl(this.diffView.grid, container.areas.diff);

		return container;
	}

	update() {
		const codec = this.app.GetImageCodec();

		const baselineBuffer = assetBuffer("map-baseline.png");
		const currentBuffer = assetBuffer("map-current.png");

		this.baselineSource = ResourceSource.FromBuffer(baselineBuffer);
		this.baselineImage.updateRawImage(codec.Open(this.baselineSource));

		this.currentSource = ResourceSource.FromBuffer(currentBuffer);
		this.currentImage.updateRawImage(codec.Open(this.currentSource));

		this.diffView.update(baselineBuffer, currentBuffer);
	}

	blink() {
		this.blinkTimer = setInterval(() => {
			const thisTurn = this.blinkPager.GetContent();
			if (thisTurn === this.baselineImage.control) {
				this.blinkPager.SetContent(this.currentImage.control);
			} else if (thisTurn === this.currentImage.control) {
				this.blinkPager.SetContent(this.baselineImage.control);
			}
		}, 500);
	}
}
