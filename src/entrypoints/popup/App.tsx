import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SPEED_STEPS } from "@/lib/constants";
import { loadConfig, saveConfig } from "@/lib/storage";
import type { Speed } from "@/lib/types";

interface VideoState {
	channelName: string | null;
	title: string | null;
	currentSpeed: Speed;
}

type Status = "loading" | "unavailable" | "ready";

export default function App() {
	const [status, setStatus] = useState<Status>("loading");
	const [videoState, setVideoState] = useState<VideoState | null>(null);
	const [speed, setSpeed] = useState<Speed>(1.0);
	const [existingRuleSpeed, setExistingRuleSpeed] = useState<Speed | null>(null);
	const [saved, setSaved] = useState(false);

	useEffect(() => {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			const tab = tabs[0];
			if (!tab?.id) {
				setStatus("unavailable");
				return;
			}

			chrome.tabs.sendMessage(tab.id, { type: "GET_VIDEO_CONTEXT" }, (response) => {
				if (chrome.runtime.lastError || !response) {
					setStatus("unavailable");
					return;
				}

				setVideoState(response);
				setSpeed(response.currentSpeed);
				setStatus("ready");

				if (response.channelName) {
					loadConfig().then((config) => {
						const existing = config.channelRules.find((r) => r.channelName === response.channelName);
						if (existing) {
							setExistingRuleSpeed(existing.speed);
							setSpeed(existing.speed);
						}
					});
				}
			});
		});
	}, []);

	const handleSave = async () => {
		if (!videoState?.channelName) return;

		const config = await loadConfig();
		const idx = config.channelRules.findIndex((r) => r.channelName === videoState.channelName);

		if (idx >= 0) {
			config.channelRules[idx].speed = speed;
		} else {
			config.channelRules.push({
				id: crypto.randomUUID(),
				channelName: videoState.channelName,
				speed,
			});
		}

		await saveConfig(config);
		setExistingRuleSpeed(speed);
		setSaved(true);
	};

	const hasExistingRule = existingRuleSpeed !== null;
	const isUnchanged = hasExistingRule && speed === existingRuleSpeed;

	return (
		<div className="w-72 p-4">
			<h1 className="text-lg font-bold">speedctl</h1>
			<Separator className="my-3" />

			{status === "loading" && <p className="text-sm text-muted-foreground">Loading...</p>}

			{status === "unavailable" && (
				<Alert>
					<AlertDescription>No video detected on this page.</AlertDescription>
				</Alert>
			)}

			{status === "ready" && videoState?.channelName && (
				<div className="space-y-3">
					<div>
						<p className="text-xs text-muted-foreground">Channel</p>
						<p className="text-sm font-medium">{videoState.channelName}</p>
					</div>
					<div>
						<p className="mb-1.5 text-xs text-muted-foreground">Speed</p>
						<div className="grid grid-cols-3 gap-1">
							{SPEED_STEPS.map((s) => (
								<Button
									key={s}
									variant={s === speed ? "default" : "outline"}
									size="sm"
									className="text-xs"
									onClick={() => {
										setSpeed(s);
										setSaved(false);
									}}
								>
									{s.toFixed(1)}x
								</Button>
							))}
						</div>
					</div>
					<Button className="w-full" size="sm" onClick={handleSave} disabled={isUnchanged}>
						{hasExistingRule ? "Update Rule" : "Add Channel Rule"}
					</Button>
					{saved && <p className="text-center text-xs text-muted-foreground">Saved!</p>}
				</div>
			)}

			{status === "ready" && !videoState?.channelName && (
				<Alert>
					<AlertDescription>Channel name not available.</AlertDescription>
				</Alert>
			)}

			<Separator className="my-3" />
			<Button variant="link" className="h-auto p-0 text-sm" onClick={() => chrome.runtime.openOptionsPage()}>
				Open Settings
			</Button>
		</div>
	);
}
