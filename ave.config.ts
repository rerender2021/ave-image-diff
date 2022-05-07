import { IPackConfig } from "ave-pack";
import * as fs from "fs";
import * as path from "path";

const packageJSON = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./package.json"), "utf-8"));

const config: IPackConfig = {
	build: {
		projectRoot: __dirname,
		target: "node14-win-x64",
		input: "./build/src/index.js",
		output: "./bin/image-diff.exe",
	},
	resource: {
		icon: "./assets/compare.ico",
		productVersion: packageJSON.version,
		productName: "Image Diff",
		fileVersion: packageJSON.version,
		companyName: "QberSoft",
		fileDescription: "A simple image diff tool",
		LegalCopyright: `© ${new Date().getFullYear()} Ave Copyright.`,
	},
};

export default config;
