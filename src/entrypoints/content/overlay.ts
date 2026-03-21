import type { Speed } from "../../lib/types";

const OVERLAY_ID = "speedctl-overlay";

let overlayEl: HTMLDivElement | null = null;

export function createOverlay(container: HTMLElement): void {
	removeOverlay();

	overlayEl = document.createElement("div");
	overlayEl.id = OVERLAY_ID;
	Object.assign(overlayEl.style, {
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		borderRadius: "4px",
		color: "#fff",
		fontFamily: "monospace",
		fontSize: "13px",
		fontWeight: "bold",
		padding: "4px 8px",
		pointerEvents: "none",
		position: "absolute",
		right: "10px",
		top: "10px",
		transition: "opacity 0.15s",
		userSelect: "none",
		zIndex: "60",
	});

	container.style.position = "relative";
	container.appendChild(overlayEl);
}

export function updateOverlay(speed: Speed): void {
	if (overlayEl) {
		overlayEl.textContent = `${speed.toFixed(1)}x`;
	}
}

export function removeOverlay(): void {
	if (overlayEl) {
		overlayEl.remove();
		overlayEl = null;
	}
}
