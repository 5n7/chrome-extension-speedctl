import { resolve } from "node:path";
import { defineConfig } from "wxt";

export default defineConfig({
	srcDir: "src",
	modules: ["@wxt-dev/module-react"],
	manifest: {
		name: "speedctl",
		description: "Advanced playback speed control with rule-based automation",
		permissions: ["storage"],
		icons: {
			16: "icon-16.png",
			32: "icon-32.png",
			48: "icon-48.png",
			128: "icon-128.png",
		},
	},
	hooks: {
		"build:manifestGenerated": (_wxt, manifest) => {
			if (manifest.options_ui) {
				manifest.options_ui.open_in_tab = true;
			}
			if (manifest.action) {
				manifest.action.default_icon = {
					16: "icon-16.png",
					32: "icon-32.png",
				};
			}
		},
	},
	vite: () => ({
		resolve: {
			alias: {
				"@": resolve(import.meta.dirname, "src"),
			},
		},
	}),
});
