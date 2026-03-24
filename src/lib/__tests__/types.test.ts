import { describe, expect, it } from "vitest";

import { isShortcutKeys, isSpeed, isSpeedctlConfig } from "../types";

describe("isSpeed", () => {
	it.each([0.5, 1.0, 1.5, 2.0, 2.5, 3.0])("returns true for valid speed %s", (v) => {
		expect(isSpeed(v)).toBe(true);
	});

	it.each([0, 0.3, 1.1, 4.0, -1, NaN, Infinity])("returns false for invalid number %s", (v) => {
		expect(isSpeed(v)).toBe(false);
	});

	it.each([null, undefined, "1.0", true, {}])("returns false for non-number %s", (v) => {
		expect(isSpeed(v)).toBe(false);
	});
});

describe("isShortcutKeys", () => {
	it("returns true for valid shortcut keys", () => {
		expect(isShortcutKeys({ speedDown: "s", speedUp: "d" })).toBe(true);
		expect(isShortcutKeys({ speedDown: "ArrowLeft", speedUp: "ArrowRight" })).toBe(true);
	});

	it("returns false when fields are missing", () => {
		expect(isShortcutKeys({ speedDown: "s" })).toBe(false);
		expect(isShortcutKeys({ speedUp: "d" })).toBe(false);
		expect(isShortcutKeys({})).toBe(false);
	});

	it("returns false when fields are not strings", () => {
		expect(isShortcutKeys({ speedDown: 1, speedUp: "d" })).toBe(false);
		expect(isShortcutKeys({ speedDown: "s", speedUp: null })).toBe(false);
	});

	it("returns false for non-objects", () => {
		expect(isShortcutKeys(null)).toBe(false);
		expect(isShortcutKeys(undefined)).toBe(false);
		expect(isShortcutKeys("string")).toBe(false);
	});
});

describe("isSpeedctlConfig", () => {
	const validConfig = {
		defaultSpeed: 1.0,
		channelRules: [],
		regexRules: [],
		shortcutKeys: { speedDown: "s", speedUp: "d" },
	};

	it("returns true for a complete config", () => {
		expect(isSpeedctlConfig(validConfig)).toBe(true);
	});

	it("returns true for config without shortcutKeys (backward compatibility)", () => {
		const { shortcutKeys: _, ...legacy } = validConfig;
		expect(isSpeedctlConfig(legacy)).toBe(true);
	});

	it("returns false when shortcutKeys is present but invalid", () => {
		expect(isSpeedctlConfig({ ...validConfig, shortcutKeys: { speedDown: 1 } })).toBe(false);
		expect(isSpeedctlConfig({ ...validConfig, shortcutKeys: "bad" })).toBe(false);
	});

	it("returns false for invalid defaultSpeed", () => {
		expect(isSpeedctlConfig({ ...validConfig, defaultSpeed: 9.9 })).toBe(false);
	});

	it("returns false when required fields are missing", () => {
		expect(isSpeedctlConfig({ defaultSpeed: 1.0, channelRules: [] })).toBe(false);
		expect(isSpeedctlConfig({ defaultSpeed: 1.0, regexRules: [] })).toBe(false);
	});

	it("returns false for non-objects", () => {
		expect(isSpeedctlConfig(null)).toBe(false);
		expect(isSpeedctlConfig(undefined)).toBe(false);
		expect(isSpeedctlConfig(42)).toBe(false);
	});
});
