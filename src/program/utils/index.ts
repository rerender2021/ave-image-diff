//
import { IGridLayout } from "../../components";
export type AreasOf<T extends IGridLayout> = keyof T["areas"];

//
import { App } from "ave-ui";

let app: App = null;

export function setApp(_app: App) {
	app = _app;
}

export function getApp() {
	return app;
}
