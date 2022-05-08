import { CheckBox, CheckValue, ComboBox, StringKey, TextBox, TrackBar, Window } from "ave-ui";
import { autorun } from "mobx";
import { Area, createGridLayout, GridLayout, ImageView, MiniView } from "../../components";
import { KeyOfLang } from "../i18n";
import { MiniViewSelection, state } from "../state";
import { Content } from "./content";

export class Sidebar extends Area {
	private miniView: MiniView;
	private miniViewText: TextBox;
	private miniViewSwitch: ComboBox;

	private thresholdScroll: TrackBar;
	private thresholdText: TextBox;

	private blendAlphaScroll: TrackBar;
	private blendAlphaText: TextBox;

	private zoomScroll: TrackBar;
	private zoomText: TextBox;

	private blinkCheckBox: CheckBox;
	private blinkText: TextBox;

	private themeText: TextBox;
	private themeSwitch: ComboBox;

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

		const createText = (key: KeyOfLang): TextBox => {
			const txt = new TextBox(window, key);
			txt.SetReadOnly(true);
			txt.SetBorder(false);
			return txt;
		};

		this.blinkText = createText("Mode");

		const createSlider = (nMin, nMax, nDef, s: KeyOfLang, fn): [TrackBar, TextBox] => {
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
		this.themeText = createText("Theme");
		this.themeSwitch = new ComboBox(window, new StringKey("ThemeType", 0, 3));
		this.themeSwitch.Append("", "", "");
		this.themeSwitch.Select(0);
		this.themeSwitch.OnSelectionChange((comboBox: ComboBox) => {
			const i = comboBox.GetSelection();
			state.setCurrentTheme(i);
		});

		//
		this.track(this.content.baselineImage);
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

	private update() {
		if (state.currentMiniView === MiniViewSelection.Baseline) {
			this.track(this.content.baselineImage);
		} else if (state.currentMiniView === MiniViewSelection.Current) {
			this.track(this.content.currentImage);
		}
	}

	private track(image: ImageView) {
		this.miniView.track({
			pager: [this.content.baselinePager, this.content.currentPager, this.content.normalDiff.container, this.content.blinkDiff.contrainer],
			image: image.native,
		});
	}

	private onCreateLayout() {
		const { window } = this;

		const containerLayout = {
			rows: "32dpx 128dpx 16dpx 16dpx 24dpx 16dpx 16dpx 16dpx 16dpx 16dpx 16dpx 16dpx 16dpx 16dpx 24dpx 1",
			columns: "1 1",
			areas: {
				miniView: { x: 0, y: 1, xspan: 2, yspan: 1 },
				miniViewText: { x: 0, y: 4 },
				miniViewSwitch: { x: 1, y: 4 },
				thresholdText: { x: 0, y: 6 },
				threshold: { x: 1, y: 6 },
				blendAlphaText: { x: 0, y: 8 },
				blendAlpha: { x: 1, y: 8 },
				zoomText: { x: 0, y: 10 },
				zoom: { x: 1, y: 10 },
				blinkText: { x: 0, y: 12 },
				blink: { x: 1, y: 12 },
				themeText: { x: 0, y: 14 },
				themeSwitch: { x: 1, y: 14 },
			},
		};
		const container = createGridLayout(window, containerLayout);

		container.addControl(this.blinkCheckBox, containerLayout.areas.blink);
		container.addControl(this.blinkText, containerLayout.areas.blinkText);

		container.addControl(this.thresholdText, containerLayout.areas.thresholdText);
		container.addControl(this.thresholdScroll, containerLayout.areas.threshold);

		container.addControl(this.blendAlphaText, containerLayout.areas.blendAlphaText);
		container.addControl(this.blendAlphaScroll, containerLayout.areas.blendAlpha);

		container.addControl(this.zoomText, containerLayout.areas.zoomText);
		container.addControl(this.zoomScroll, containerLayout.areas.zoom);

		container.addControl(this.miniView.control, containerLayout.areas.miniView);
		container.addControl(this.miniViewText, containerLayout.areas.miniViewText);
		container.addControl(this.miniViewSwitch, containerLayout.areas.miniViewSwitch);

		container.addControl(this.themeText, containerLayout.areas.themeText);
		container.addControl(this.themeSwitch, containerLayout.areas.themeSwitch);

		return container;
	}
}
