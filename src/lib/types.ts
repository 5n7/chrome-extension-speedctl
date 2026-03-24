export type Speed = 0.5 | 1.0 | 1.5 | 2.0 | 2.5 | 3.0;

export type StorageArea = "local" | "sync";

export interface VideoContext {
	title: string | null;
	channelName: string | null;
}

export interface ChannelRule {
	id: string;
	channelName: string;
	speed: Speed;
}

export interface RegexRule {
	id: string;
	pattern: string;
	speed: Speed;
}

export interface ShortcutKeys {
	speedDown: string;
	speedUp: string;
}

export interface SpeedctlConfig {
	defaultSpeed: Speed;
	channelRules: ChannelRule[];
	regexRules: RegexRule[];
	shortcutKeys: ShortcutKeys;
}

const VALID_SPEEDS = new Set<number>([0.5, 1.0, 1.5, 2.0, 2.5, 3.0]);

export function isSpeed(value: unknown): value is Speed {
	return typeof value === "number" && VALID_SPEEDS.has(value);
}

export function isShortcutKeys(value: unknown): value is ShortcutKeys {
	if (!value || typeof value !== "object") return false;
	const obj = value as Record<string, unknown>;
	return typeof obj.speedDown === "string" && typeof obj.speedUp === "string";
}

export function isSpeedctlConfig(value: unknown): value is SpeedctlConfig {
	if (!value || typeof value !== "object") return false;
	const obj = value as Record<string, unknown>;
	if (!isSpeed(obj.defaultSpeed) || !Array.isArray(obj.channelRules) || !Array.isArray(obj.regexRules)) return false;
	if (obj.shortcutKeys !== undefined && !isShortcutKeys(obj.shortcutKeys)) return false;
	return true;
}
