import { SpeedSelect } from "@/components/SpeedSelect";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { Speed } from "@/lib/types";

interface Props {
	speed: Speed;
	onChange: (speed: Speed) => void;
}

export function DefaultSpeedSection({ speed, onChange }: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Default Speed</CardTitle>
				<CardDescription>The playback speed applied to all videos unless overridden by a rule.</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex items-center gap-4">
					<Label>Speed</Label>
					<SpeedSelect value={speed} onChange={onChange} />
				</div>
			</CardContent>
		</Card>
	);
}
