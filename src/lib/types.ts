export type Speed = 0.5 | 1.0 | 1.5 | 2.0 | 2.5 | 3.0;

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

export interface SpeedctlConfig {
	defaultSpeed: Speed;
	channelRules: ChannelRule[];
	regexRules: RegexRule[];
}

const VALID_SPEEDS = new Set<number>([0.5, 1.0, 1.5, 2.0, 2.5, 3.0]);

export function isSpeed(value: unknown): value is Speed {
	return typeof value === "number" && VALID_SPEEDS.has(value);
}

export function isSpeedctlConfig(value: unknown): value is SpeedctlConfig {
	if (!value || typeof value !== "object") return false;
	const obj = value as Record<string, unknown>;
	return isSpeed(obj.defaultSpeed) && Array.isArray(obj.channelRules) && Array.isArray(obj.regexRules);
}
