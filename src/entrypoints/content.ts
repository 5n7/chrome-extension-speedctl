import { detectAdapter } from "../adapters";
import { SpeedController } from "./content/controller";

export default defineContentScript({
	matches: ["*://*.youtube.com/*"],
	main() {
		const adapter = detectAdapter();
		if (!adapter) return;

		const controller = new SpeedController(adapter);
		controller.start();

		chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
			if (message.type === "GET_VIDEO_CONTEXT") {
				const context = adapter.getVideoContext();
				sendResponse({
					channelName: context.channelName,
					title: context.title,
					currentSpeed: controller.currentSpeed,
				});
			}
			return true;
		});
	},
});
