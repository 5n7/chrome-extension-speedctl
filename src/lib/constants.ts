import type { Speed, SpeedctlConfig, StorageArea } from "./types";

export const SPEED_STEPS: Speed[] = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0];

export const STORAGE_AREA_KEY = "speedctl_storage_area";
export const STORAGE_KEY = "speedctl_config";

export const DEFAULT_CONFIG: SpeedctlConfig = {
	defaultSpeed: 1.0,
	channelRules: [],
	regexRules: [],
};
export const DEFAULT_STORAGE_AREA: StorageArea = "local";
