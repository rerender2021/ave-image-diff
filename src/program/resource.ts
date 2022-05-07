import { assetPath } from "../utils";

export const iconDataMap = {
    // https://www.flaticon.com/premium-icon/difference_4956420?term=different&page=1&position=76&page=1&position=76&related_id=4956420&origin=search
    WindowIcon: [assetPath("compare.png")],
};

export type IconDataMapType = Record<keyof typeof iconDataMap, number>;