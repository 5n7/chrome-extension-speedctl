import { DEFAULT_CONFIG, STORAGE_KEY } from "./constants";
import type { SpeedctlConfig } from "./types";
import { isSpeedctlConfig } from "./types";

export async function loadConfig(): Promise<SpeedctlConfig> {
	const result = await chrome.storage.local.get(STORAGE_KEY);
	const data = result[STORAGE_KEY];
	return isSpeedctlConfig(data) ? data : DEFAULT_CONFIG;
}

export async function saveConfig(config: SpeedctlConfig): Promise<void> {
	await chrome.storage.local.set({ [STORAGE_KEY]: config });
}

export function onConfigChanged(callback: (config: SpeedctlConfig) => void): () => void {
	const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
		const newValue = changes[STORAGE_KEY]?.newValue;
		if (isSpeedctlConfig(newValue)) {
			callback(newValue);
		}
	};
	chrome.storage.onChanged.addListener(listener);
	return () => chrome.storage.onChanged.removeListener(listener);
}
