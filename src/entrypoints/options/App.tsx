import { useCallback, useEffect, useRef, useState } from "react";

import { Separator } from "@/components/ui/separator";
import { DEFAULT_CONFIG, DEFAULT_STORAGE_AREA } from "@/lib/constants";
import { loadConfig, loadStorageArea, saveConfig, setStorageArea } from "@/lib/storage";
import type { SpeedctlConfig, StorageArea } from "@/lib/types";

import { ChannelRulesSection } from "./components/ChannelRulesSection";
import { DefaultSpeedSection } from "./components/DefaultSpeedSection";
import { RegexRulesSection } from "./components/RegexRulesSection";
import { ShortcutKeysSection } from "./components/ShortcutKeysSection";
import { StorageAreaSection } from "./components/StorageAreaSection";

export default function App() {
	const [config, setConfig] = useState<SpeedctlConfig>(DEFAULT_CONFIG);
	const [storageArea, setStorageAreaState] = useState<StorageArea>(DEFAULT_STORAGE_AREA);
	const [loaded, setLoaded] = useState(false);
	const [saveCount, setSaveCount] = useState(0);
	const [showSaved, setShowSaved] = useState(false);
	const isInitialLoad = useRef(true);

	useEffect(() => {
		Promise.all([loadConfig(), loadStorageArea()]).then(([c, area]) => {
			setConfig(c);
			setStorageAreaState(area);
			setLoaded(true);
		});
	}, []);

	useEffect(() => {
		if (!loaded) return;
		if (isInitialLoad.current) {
			isInitialLoad.current = false;
			return;
		}
		saveConfig(config);
	}, [config, loaded]);

	useEffect(() => {
		if (saveCount === 0) return;
		setShowSaved(true);
		const timer = setTimeout(() => setShowSaved(false), 1500);
		return () => clearTimeout(timer);
	}, [saveCount]);

	const updateConfig = useCallback((updater: (prev: SpeedctlConfig) => SpeedctlConfig) => {
		setConfig((prev) => updater(prev));
		setSaveCount((c) => c + 1);
	}, []);

	const handleStorageAreaChange = useCallback(async (area: StorageArea) => {
		await setStorageArea(area);
		setStorageAreaState(area);
		setSaveCount((c) => c + 1);
	}, []);

	return (
		<div className="mx-auto max-w-2xl p-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">speedctl</h1>
					<p className="text-muted-foreground mt-1">Playback speed control settings</p>
				</div>
				{showSaved && <span className="text-sm text-muted-foreground">Saved</span>}
			</div>
			<Separator className="my-6" />
			<div className="space-y-8">
				<DefaultSpeedSection
					speed={config.defaultSpeed}
					onChange={(speed) => updateConfig((c) => ({ ...c, defaultSpeed: speed }))}
				/>
				<ChannelRulesSection
					rules={config.channelRules}
					onChange={(rules) => updateConfig((c) => ({ ...c, channelRules: rules }))}
				/>
				<RegexRulesSection
					rules={config.regexRules}
					onChange={(rules) => updateConfig((c) => ({ ...c, regexRules: rules }))}
				/>
				<ShortcutKeysSection
					keys={config.shortcutKeys}
					onChange={(shortcutKeys) => updateConfig((c) => ({ ...c, shortcutKeys }))}
				/>
				<StorageAreaSection area={storageArea} onChange={handleStorageAreaChange} />
			</div>
		</div>
	);
}
