import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SPEED_STEPS } from "@/lib/constants";
import type { Speed } from "@/lib/types";
import { isSpeed } from "@/lib/types";

interface SpeedSelectProps {
	value: Speed;
	onChange: (speed: Speed) => void;
}

export function SpeedSelect({ value, onChange }: SpeedSelectProps) {
	return (
		<Select
			value={String(value)}
			onValueChange={(v) => {
				const n = Number(v);
				if (isSpeed(n)) onChange(n);
			}}
		>
			<SelectTrigger className="w-24">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{SPEED_STEPS.map((speed) => (
					<SelectItem key={speed} value={String(speed)}>
						{speed.toFixed(1)}x
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
