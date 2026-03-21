import { SPEED_STEPS } from "../../lib/constants";
import type { Speed } from "../../lib/types";

function isInputFocused(): boolean {
	const el = document.activeElement;
	if (!el) return false;
	const tag = el.tagName.toLowerCase();
	return tag === "input" || tag === "textarea" || (el as HTMLElement).isContentEditable;
}

export function setupShortcuts(getCurrentSpeed: () => Speed, setSpeed: (speed: Speed) => void): () => void {
	const handler = (e: KeyboardEvent) => {
		if (isInputFocused()) return;

		const currentSpeed = getCurrentSpeed();
		const currentIndex = SPEED_STEPS.indexOf(currentSpeed);
		if (currentIndex === -1) return;

		if (e.key === "s" && currentIndex > 0) {
			setSpeed(SPEED_STEPS[currentIndex - 1]);
		} else if (e.key === "d" && currentIndex < SPEED_STEPS.length - 1) {
			setSpeed(SPEED_STEPS[currentIndex + 1]);
		}
	};

	document.addEventListener("keydown", handler);
	return () => document.removeEventListener("keydown", handler);
}
