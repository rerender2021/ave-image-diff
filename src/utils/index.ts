import * as path from "path";
import * as fs from "fs";
import { ResourceSource } from "ave-ui";

export function createResourceSourceFromAsset(name: string) {
	return ResourceSource.FromBuffer(fs.readFileSync(assetPath(name)));
}

export function readAsBuffer(filePath: string) {
	const buffer = fs.readFileSync(filePath);
	return buffer;
}

export function assetPath(relative: string) {
	const root = path.resolve(__dirname, "../../assets");
	const absolute = path.resolve(root, relative);
	return absolute;
}
