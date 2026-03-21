import type { VideoContext } from "../lib/types";
import type { SiteAdapter } from "./types";

const YT_SELECTORS = {
	channelName: "#channel-name yt-formatted-string a, #owner #channel-name a",
	playerContainer: "#movie_player",
	video: "video.html5-main-video",
	videoTitle: "h1.ytd-watch-metadata yt-formatted-string, #title h1",
};

export class YouTubeAdapter implements SiteAdapter {
	readonly id = "youtube";

	match(url: string): boolean {
		return /^https?:\/\/(www\.|m\.|music\.)?youtube\.com(\/|$)/.test(url);
	}

	getVideoElement(): HTMLVideoElement | null {
		return document.querySelector<HTMLVideoElement>(YT_SELECTORS.video);
	}

	getPlayerContainer(): HTMLElement | null {
		return document.querySelector<HTMLElement>(YT_SELECTORS.playerContainer);
	}

	getVideoContext(): VideoContext {
		const titleEl = document.querySelector<HTMLElement>(YT_SELECTORS.videoTitle);
		const channelEl = document.querySelector<HTMLElement>(YT_SELECTORS.channelName);
		return {
			channelName: channelEl?.textContent?.trim() ?? null,
			title: titleEl?.textContent?.trim() ?? null,
		};
	}

	onNavigate(callback: () => void): () => void {
		const handler = () => callback();
		document.addEventListener("yt-navigate-finish", handler);
		return () => document.removeEventListener("yt-navigate-finish", handler);
	}
}
