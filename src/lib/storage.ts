import {
	DEFAULT_CONFIG,
	DEFAULT_SHORTCUT_KEYS,
	DEFAULT_STORAGE_AREA,
	STORAGE_AREA_KEY,
	STORAGE_KEY,
} from "./constants";
import type { SpeedctlConfig, StorageArea } from "./types";
import { isSpeedctlConfig } from "./types";

function getStorageArea(area: StorageArea): chrome.storage.StorageArea {
	return area === "sync" ? chrome.storage.sync : chrome.storage.local;
}

export async function loadStorageArea(): Promise<StorageArea> {
	const result = await chrome.storage.local.get(STORAGE_AREA_KEY);
	const value = result[STORAGE_AREA_KEY];
	return value === "sync" ? "sync" : DEFAULT_STORAGE_AREA;
}

export async function setStorageArea(newArea: StorageArea): Promise<void> {
	const currentArea = await loadStorageArea();
	if (currentArea === newArea) return;

	const config = await loadConfig();
	await getStorageArea(newArea).set({ [STORAGE_KEY]: config });
	await chrome.storage.local.set({ [STORAGE_AREA_KEY]: newArea });
	await getStorageArea(currentArea).remove(STORAGE_KEY);
}

export async function loadConfig(): Promise<SpeedctlConfig> {
	const area = await loadStorageArea();
	const result = await getStorageArea(area).get(STORAGE_KEY);
	const data = result[STORAGE_KEY];
	if (!isSpeedctlConfig(data)) return DEFAULT_CONFIG;
	return {
		...data,
		shortcutKeys: data.shortcutKeys ?? DEFAULT_SHORTCUT_KEYS,
	};
}

export async function saveConfig(config: SpeedctlConfig): Promise<void> {
	const area = await loadStorageArea();
	await getStorageArea(area).set({ [STORAGE_KEY]: config });
}

export function onConfigChanged(callback: (config: SpeedctlConfig) => void): () => void {
	const listener = async (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
		const currentArea = await loadStorageArea();
		if (areaName !== currentArea) return;

		const newValue = changes[STORAGE_KEY]?.newValue;
		if (isSpeedctlConfig(newValue)) {
			callback({
				...newValue,
				shortcutKeys: newValue.shortcutKeys ?? DEFAULT_SHORTCUT_KEYS,
			});
		}
	};
	chrome.storage.onChanged.addListener(listener);
	return () => chrome.storage.onChanged.removeListener(listener);
}
