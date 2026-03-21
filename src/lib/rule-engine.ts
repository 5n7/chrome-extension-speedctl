import type { Speed, SpeedctlConfig, VideoContext } from "./types";

const MAX_REGEX_LENGTH = 200;

export function evaluateRules(context: VideoContext, config: SpeedctlConfig): Speed {
	// Priority: Title Regex > Channel > Default

	// 1. Check regex rules (first match wins)
	if (context.title) {
		for (const rule of config.regexRules) {
			if (rule.pattern.length > MAX_REGEX_LENGTH) continue;
			try {
				const regex = new RegExp(rule.pattern);
				if (regex.test(context.title)) {
					return rule.speed;
				}
			} catch {
				// Invalid regex, skip
			}
		}
	}

	// 2. Check channel rules (exact match)
	if (context.channelName) {
		const channelRule = config.channelRules.find((r) => r.channelName === context.channelName);
		if (channelRule) {
			return channelRule.speed;
		}
	}

	// 3. Default speed
	return config.defaultSpeed;
}
