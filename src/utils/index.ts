import * as path from "path";
import * as fs from "fs";

export function assetBuffer(name: string) {
    return fs.readFileSync(assetPath(name));
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
