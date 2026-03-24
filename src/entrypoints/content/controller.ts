import type { SiteAdapter } from "../../adapters/types";
import { evaluateRules } from "../../lib/rule-engine";
import { loadConfig, onConfigChanged } from "../../lib/storage";
import type { Speed, SpeedctlConfig } from "../../lib/types";
import { createOverlay, removeOverlay, updateOverlay } from "./overlay";
import { setupShortcuts } from "./shortcuts";

const CHANNEL_MAX_RETRIES = 5;
const CHANNEL_RETRY_INTERVAL = 500;

export class SpeedController {
	currentSpeed: Speed = 1.0;
	private adapter: SiteAdapter;
	private config: SpeedctlConfig | null = null;
	private globalCleanups: (() => void)[] = [];
	private navigationId = 0;
	private rateChangeTimer: ReturnType<typeof setTimeout> | null = null;
	private setupCleanups: (() => void)[] = [];
	private shortcutCleanup: (() => void) | null = null;

	constructor(adapter: SiteAdapter) {
		this.adapter = adapter;
	}

	async start(): Promise<void> {
		this.config = await loadConfig();

		this.globalCleanups.push(
			onConfigChanged((config) => {
				this.config = config;
				this.rebindShortcuts();
				this.applyRules();
			}),
		);

		this.globalCleanups.push(this.adapter.onNavigate(() => this.onNavigate()));

		await this.onNavigate();
	}

	destroy(): void {
		this.cleanupSetup();
		if (this.shortcutCleanup) {
			this.shortcutCleanup();
			this.shortcutCleanup = null;
		}
		for (const fn of this.globalCleanups) fn();
		this.globalCleanups = [];
	}

	private async onNavigate(): Promise<void> {
		const navId = ++this.navigationId;
		this.cleanupSetup();

		const video = this.adapter.getVideoElement();
		if (!video) return;

		const container = this.adapter.getPlayerContainer();
		if (container) {
			createOverlay(container);
			this.setupCleanups.push(() => removeOverlay());
		}

		// Re-apply speed if YouTube resets playbackRate
		const rateHandler = () => {
			if (this.rateChangeTimer) clearTimeout(this.rateChangeTimer);
			this.rateChangeTimer = setTimeout(() => {
				if (video.playbackRate !== this.currentSpeed) {
					video.playbackRate = this.currentSpeed;
				}
			}, 100);
		};
		video.addEventListener("ratechange", rateHandler);
		this.setupCleanups.push(() => video.removeEventListener("ratechange", rateHandler));

		this.rebindShortcuts();

		// Apply default speed immediately, then wait for metadata to update
		if (this.config) {
			this.setSpeed(video, this.config.defaultSpeed);
		}
		await this.waitForContextAndApply(navId);
	}

	private async waitForContextAndApply(navId: number): Promise<void> {
		// YouTube SPA navigation fires yt-navigate-finish before DOM metadata updates.
		// Wait for the channel name to become available before evaluating rules.
		for (let i = 0; i < CHANNEL_MAX_RETRIES; i++) {
			await this.delay(CHANNEL_RETRY_INTERVAL);
			if (this.navigationId !== navId) return;
			const context = this.adapter.getVideoContext();
			if (context.channelName) {
				this.applyRules();
				return;
			}
		}
	}

	private rebindShortcuts(): void {
		if (this.shortcutCleanup) {
			this.shortcutCleanup();
			this.shortcutCleanup = null;
		}

		const video = this.adapter.getVideoElement();
		if (!video || !this.config) return;

		this.shortcutCleanup = setupShortcuts(
			this.config.shortcutKeys,
			() => this.currentSpeed,
			(speed) => this.setSpeed(video, speed),
		);
	}

	private applyRules(): void {
		if (!this.config) return;
		const video = this.adapter.getVideoElement();
		if (!video) return;

		const context = this.adapter.getVideoContext();
		const speed = evaluateRules(context, this.config);
		this.setSpeed(video, speed);
	}

	private setSpeed(video: HTMLVideoElement, speed: Speed): void {
		this.currentSpeed = speed;
		video.playbackRate = speed;
		updateOverlay(speed);
	}

	private cleanupSetup(): void {
		for (const fn of this.setupCleanups) fn();
		this.setupCleanups = [];
		if (this.rateChangeTimer) {
			clearTimeout(this.rateChangeTimer);
			this.rateChangeTimer = null;
		}
	}

	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
