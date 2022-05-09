import { AlignType, CheckBox, CheckValue, ComboBox, IControl, Label, Pager, PagerAdjustment, StringKey, TextBox, TrackBar, Window } from "ave-ui";
import { autorun } from "mobx";
import { Area, createGridLayout, GridLayout, ImageView, MiniView } from "../../components";
import { KeyOfLang } from "../i18n";
import { MiniViewSelection, state } from "../state";
import { Content } from "./content";

export class Sidebar extends Area {
	private miniView: MiniView;
	private miniViewText: IControl;
	private miniViewSwitch: ComboBox;

	private thresholdScroll: TrackBar;
	private thresholdText: IControl;

	private blendAlphaScroll: TrackBar;
	private blendAlphaText: IControl;

	private zoomScroll: TrackBar;
	private zoomText: IControl;

	private blinkCheckBox: CheckBox;
	private blinkText: IControl;

	private content: Content;

	constructor(window: Window, content: Content) {
		super(window);
		this.content = content;
	}

	protected onCreate(): GridLayout {
		const { window } = this;

		//
		this.blinkCheckBox = new CheckBox(window, "Blink");
		this.blinkCheckBox.OnCheck((sender: CheckBox) => {
			const checkValue = sender.GetValue();
			state.setBlink(checkValue === CheckValue.Checked);
		});

		const createText = (key: KeyOfLang): IControl => {
			const txt = new Label(window, key);
			txt.SetAlignHorz(AlignType.Far);
			txt.SetWrappable(false);
			return txt;
		};

		this.blinkText = createText("Mode");

		const createSlider = (nMin, nMax, nDef, s: KeyOfLang, fn): [TrackBar, IControl] => {
			const tb = new TrackBar(window);
			tb.SetMinimum(nMin).SetMaximum(nMax).SetValue(nDef);
			tb.OnThumbChange(fn);

			const txt = createText(s);

			return [tb, txt];
		};

		[this.thresholdScroll, this.thresholdText] = createSlider(0, 100, 0, "Threshold", (sender: TrackBar) => {
			state.setThreshold(sender.GetValue() / 100);
		});

		[this.blendAlphaScroll, this.blendAlphaText] = createSlider(0, 100, 50, "BlendAlpha", (sender: TrackBar) => {
			state.setBlendAlpha(sender.GetValue() / 100);
		});

		[this.zoomScroll, this.zoomText] = createSlider(1, 16, 1, "Zoom", (sender: TrackBar) => {
			state.setZoom(sender.GetValue());
		});

		//
		this.miniView = new MiniView(window);
		this.miniViewText = createText("MiniView");

		//
		this.miniViewSwitch = new ComboBox(window, new StringKey("MiniViewType", 0, 2));
		//  append empty string as placeholder
		this.miniViewSwitch.Append("", "");
		this.miniViewSwitch.Select(0);
		this.miniViewSwitch.OnSelectionChange((comboBox: ComboBox) => {
			const i = comboBox.GetSelection();
			state.setCurrentMiniView(i);
		});

		//
		//this.track(this.content.baselineImage);
		this.watch();

		const container = this.onCreateLayout();
		return container;
	}

	private watch() {
		autorun(() => {
			if (state.miniViewUpdateKey) {
				this.update();
			}
		});
	}

	update() {
		if (state.currentMiniView === MiniViewSelection.Baseline) {
			this.track(this.content.baselineImage);
		} else if (state.currentMiniView === MiniViewSelection.Current) {
			this.track(this.content.currentImage);
		}
	}

	private track(image: ImageView) {
		if (!this.content.baselinePager)
			return;
		this.miniView.track({
			pager: [this.content.baselinePager, this.content.currentPager, this.content.normalDiff.container, this.content.blinkDiff.contrainer],
			image: image.native,
		});
	}

	private onCreateLayout() {
		const { window } = this;

		const containerLayout = {
			rows: "1 8dpx 128dpx",
			columns: "1",
			areas: {
				miniView: { x: 0, y: 0 },
				option: { x: 0, y: 2 },
			},
		};
		const container = createGridLayout(window, containerLayout);

		const optionLayout = {
			rows: "24dpx 8dpx 16dpx 8dpx 16dpx 8dpx 16dpx 8dpx 16dpx 8dpx",
			columns: "6dpx 2 6dpx 3 6dpx",
			areas: {
				miniViewText: { x: 1, y: 0 },
				miniViewSwitch: { x: 3, y: 0 },
				thresholdText: { x: 1, y: 2 },
				threshold: { x: 3, y: 2 },
				blendAlphaText: { x: 1, y: 4 },
				blendAlpha: { x: 3, y: 4 },
				zoomText: { x: 1, y: 6 },
				zoom: { x: 3, y: 6 },
				blinkText: { x: 1, y: 8 },
				blink: { x: 3, y: 8 },
			},
		};
		const optionContainer = createGridLayout(window, optionLayout);
		const optionPager = new Pager(window);

		optionContainer.addControl(this.miniViewText, optionLayout.areas.miniViewText);
		optionContainer.addControl(this.miniViewSwitch, optionLayout.areas.miniViewSwitch);
		
		optionContainer.addControl(this.thresholdText, optionLayout.areas.thresholdText);
		optionContainer.addControl(this.thresholdScroll, optionLayout.areas.threshold);

		optionContainer.addControl(this.blendAlphaText, optionLayout.areas.blendAlphaText);
		optionContainer.addControl(this.blendAlphaScroll, optionLayout.areas.blendAlpha);

		optionContainer.addControl(this.zoomText, optionLayout.areas.zoomText);
		optionContainer.addControl(this.zoomScroll, optionLayout.areas.zoom);

		optionContainer.addControl(this.blinkCheckBox, optionLayout.areas.blink);
		optionContainer.addControl(this.blinkText, optionLayout.areas.blinkText);

		optionPager.SetContent(optionContainer.control);
		optionPager.SetAdjustment(PagerAdjustment.FitWidth);

		container.addControl(this.miniView.control, containerLayout.areas.miniView);
		container.addControl(optionPager, containerLayout.areas.option);

		return container;
	}
}
