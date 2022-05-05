import { App } from "ave-ui";

let app: App = null;

export function setApp(_app: App) {
	app = _app;
}

export function getApp() {
	return app;
}
