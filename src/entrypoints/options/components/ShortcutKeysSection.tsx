import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { ShortcutKeys } from "@/lib/types";

interface Props {
	keys: ShortcutKeys;
	onChange: (keys: ShortcutKeys) => void;
}

type RecordingField = "speedDown" | "speedUp" | null;

function displayKey(key: string): string {
	if (key === " ") return "Space";
	if (key === "ArrowUp") return "\u2191";
	if (key === "ArrowDown") return "\u2193";
	if (key === "ArrowLeft") return "\u2190";
	if (key === "ArrowRight") return "\u2192";
	return key.length === 1 ? key.toUpperCase() : key;
}

export function ShortcutKeysSection({ keys, onChange }: Props) {
	const [recording, setRecording] = useState<RecordingField>(null);
	const recordingRef = useRef<RecordingField>(null);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (!recordingRef.current) return;

			e.preventDefault();
			e.stopPropagation();

			if (e.key === "Escape") {
				setRecording(null);
				recordingRef.current = null;
				return;
			}

			onChange({ ...keys, [recordingRef.current]: e.key });
			setRecording(null);
			recordingRef.current = null;
		},
		[keys, onChange],
	);

	useEffect(() => {
		recordingRef.current = recording;

		if (recording) {
			document.addEventListener("keydown", handleKeyDown, true);
			return () => document.removeEventListener("keydown", handleKeyDown, true);
		}
	}, [recording, handleKeyDown]);

	const startRecording = (field: RecordingField) => {
		setRecording(field);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Keyboard Shortcuts</CardTitle>
				<CardDescription>
					Customize the keys used to control playback speed. Click a button and press the desired key.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center gap-4">
					<Label className="w-32">Speed down</Label>
					<Button
						variant={recording === "speedDown" ? "default" : "outline"}
						size="sm"
						className="w-24 font-mono"
						onClick={() => startRecording("speedDown")}
					>
						{recording === "speedDown" ? "Press key..." : displayKey(keys.speedDown)}
					</Button>
				</div>
				<div className="flex items-center gap-4">
					<Label className="w-32">Speed up</Label>
					<Button
						variant={recording === "speedUp" ? "default" : "outline"}
						size="sm"
						className="w-24 font-mono"
						onClick={() => startRecording("speedUp")}
					>
						{recording === "speedUp" ? "Press key..." : displayKey(keys.speedUp)}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
