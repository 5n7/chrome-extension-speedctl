import type { Speed } from "../../lib/types";

const OVERLAY_ID = "speedctl-overlay";
const FADE_DURATION = 2000;
const OPACITY_ACTIVE = "0.9";
const OPACITY_IDLE = "0.4";
const OPACITY_HIDDEN = "0";

let overlayEl: HTMLDivElement | null = null;
let fadeTimer: ReturnType<typeof setTimeout> | null = null;

export function createOverlay(container: HTMLElement): void {
	removeOverlay();

	overlayEl = document.createElement("div");
	overlayEl.id = OVERLAY_ID;
	Object.assign(overlayEl.style, {
		backdropFilter: "blur(4px)",
		backgroundColor: "rgba(0, 0, 0, 0.6)",
		borderRadius: "6px",
		color: "#fff",
		fontFamily: "monospace",
		fontSize: "13px",
		fontWeight: "bold",
		opacity: OPACITY_HIDDEN,
		padding: "4px 10px",
		pointerEvents: "none",
		position: "absolute",
		right: "10px",
		top: "10px",
		transition: "opacity 0.3s ease",
		userSelect: "none",
		zIndex: "60",
	});

	container.style.position = "relative";
	container.appendChild(overlayEl);
}

export function updateOverlay(speed: Speed): void {
	if (!overlayEl) return;

	overlayEl.textContent = `${speed.toFixed(1)}x`;
	overlayEl.style.opacity = OPACITY_ACTIVE;

	if (fadeTimer) clearTimeout(fadeTimer);
	fadeTimer = setTimeout(() => {
		if (!overlayEl) return;
		overlayEl.style.opacity = speed === 1.0 ? OPACITY_HIDDEN : OPACITY_IDLE;
	}, FADE_DURATION);
}

export function removeOverlay(): void {
	if (fadeTimer) {
		clearTimeout(fadeTimer);
		fadeTimer = null;
	}
	if (overlayEl) {
		overlayEl.remove();
		overlayEl = null;
	}
}
