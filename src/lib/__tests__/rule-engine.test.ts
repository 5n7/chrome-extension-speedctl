import { describe, expect, it } from "vitest";

import { evaluateRules } from "../rule-engine";
import type { SpeedctlConfig, VideoContext } from "../types";

const baseConfig: SpeedctlConfig = {
	channelRules: [],
	defaultSpeed: 1.0,
	regexRules: [],
};

function ctx(title: string | null = null, channelName: string | null = null): VideoContext {
	return { channelName, title };
}

describe("evaluateRules", () => {
	it("returns default speed when no rules match", () => {
		expect(evaluateRules(ctx("any title", "any channel"), baseConfig)).toBe(1.0);
	});

	it("returns default speed when context is empty", () => {
		expect(evaluateRules(ctx(), baseConfig)).toBe(1.0);
	});

	it("uses custom default speed", () => {
		const config = { ...baseConfig, defaultSpeed: 2.0 as const };
		expect(evaluateRules(ctx(), config)).toBe(2.0);
	});

	describe("channel rules", () => {
		const config: SpeedctlConfig = {
			...baseConfig,
			channelRules: [
				{ channelName: "3Blue1Brown", id: "1", speed: 1.5 },
				{ channelName: "Fireship", id: "2", speed: 2.0 },
			],
		};

		it("matches exact channel name", () => {
			expect(evaluateRules(ctx("video", "3Blue1Brown"), config)).toBe(1.5);
			expect(evaluateRules(ctx("video", "Fireship"), config)).toBe(2.0);
		});

		it("falls back to default for unknown channel", () => {
			expect(evaluateRules(ctx("video", "UnknownChannel"), config)).toBe(1.0);
		});

		it("does not match when channel name is null", () => {
			expect(evaluateRules(ctx("video", null), config)).toBe(1.0);
		});
	});

	describe("regex rules", () => {
		const config: SpeedctlConfig = {
			...baseConfig,
			regexRules: [
				{ id: "1", pattern: "ASMR", speed: 0.5 },
				{ id: "2", pattern: "tutorial", speed: 1.5 },
			],
		};

		it("matches title by regex", () => {
			expect(evaluateRules(ctx("ASMR relaxing"), config)).toBe(0.5);
			expect(evaluateRules(ctx("JS tutorial"), config)).toBe(1.5);
		});

		it("first match wins", () => {
			const multiMatch: SpeedctlConfig = {
				...baseConfig,
				regexRules: [
					{ id: "1", pattern: "video", speed: 0.5 },
					{ id: "2", pattern: "video", speed: 2.0 },
				],
			};
			expect(evaluateRules(ctx("video title"), multiMatch)).toBe(0.5);
		});

		it("skips invalid regex patterns", () => {
			const config: SpeedctlConfig = {
				...baseConfig,
				regexRules: [
					{ id: "1", pattern: "[invalid", speed: 0.5 },
					{ id: "2", pattern: "fallback", speed: 2.0 },
				],
			};
			expect(evaluateRules(ctx("fallback title"), config)).toBe(2.0);
		});

		it("skips regex patterns exceeding length limit", () => {
			const config: SpeedctlConfig = {
				...baseConfig,
				regexRules: [{ id: "1", pattern: "a".repeat(201), speed: 0.5 }],
			};
			expect(evaluateRules(ctx("a".repeat(201)), config)).toBe(1.0);
		});

		it("does not match when title is null", () => {
			expect(evaluateRules(ctx(null, "channel"), config)).toBe(1.0);
		});
	});

	describe("priority", () => {
		it("regex takes priority over channel", () => {
			const config: SpeedctlConfig = {
				channelRules: [{ channelName: "MyChannel", id: "1", speed: 2.0 }],
				defaultSpeed: 1.0,
				regexRules: [{ id: "2", pattern: "ASMR", speed: 0.5 }],
			};
			expect(evaluateRules(ctx("ASMR video", "MyChannel"), config)).toBe(0.5);
		});

		it("channel takes priority over default", () => {
			const config: SpeedctlConfig = {
				channelRules: [{ channelName: "MyChannel", id: "1", speed: 2.5 }],
				defaultSpeed: 1.0,
				regexRules: [],
			};
			expect(evaluateRules(ctx("video", "MyChannel"), config)).toBe(2.5);
		});

		it("falls through regex → channel → default", () => {
			const config: SpeedctlConfig = {
				channelRules: [{ channelName: "Other", id: "1", speed: 2.0 }],
				defaultSpeed: 3.0,
				regexRules: [{ id: "2", pattern: "nomatch", speed: 0.5 }],
			};
			expect(evaluateRules(ctx("video", "Unknown"), config)).toBe(3.0);
		});
	});
});
