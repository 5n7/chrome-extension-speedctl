import type { VideoContext } from "../lib/types";

export interface SiteAdapter {
	readonly id: string;
	match(url: string): boolean;
	getVideoElement(): HTMLVideoElement | null;
	getPlayerContainer(): HTMLElement | null;
	getVideoContext(): VideoContext;
	onNavigate(callback: () => void): () => void;
}
