import type { SiteAdapter } from "./types";
import { YouTubeAdapter } from "./youtube";

const adapters: SiteAdapter[] = [new YouTubeAdapter()];

export function detectAdapter(): SiteAdapter | null {
	return adapters.find((a) => a.match(window.location.href)) ?? null;
}
