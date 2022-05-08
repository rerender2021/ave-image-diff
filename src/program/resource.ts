import { assetPath } from "../utils";

function createAssetPath(format: string): string[] {
	const r = [];
	for (let i = 0; i < 20; ++i)
		r.push(assetPath(format.replace("*", i.toString())));
	return r;
}

export const iconDataMap = {
	// https://www.flaticon.com/premium-icon/difference_4956420?term=different&page=1&position=76&page=1&position=76&related_id=4956420&origin=search
	WindowIcon: createAssetPath("compare#*.png"),
	Scale: createAssetPath("scale#*.png"),
	Language: createAssetPath("language#*.png"),
};

export type IconDataMapType = Record<keyof typeof iconDataMap, number>;
