import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { StorageArea } from "@/lib/types";

interface Props {
	area: StorageArea;
	onChange: (area: StorageArea) => void;
}

export function StorageAreaSection({ area, onChange }: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Storage</CardTitle>
				<CardDescription>
					Choose where to store your settings. Use &quot;Sync&quot; to share settings across devices via your Google
					account.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex items-center gap-4">
					<Label>Storage area</Label>
					<Select value={area} onValueChange={(v) => onChange(v as StorageArea)}>
						<SelectTrigger className="w-40">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="local">Local</SelectItem>
							<SelectItem value="sync">Sync</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardContent>
		</Card>
	);
}
