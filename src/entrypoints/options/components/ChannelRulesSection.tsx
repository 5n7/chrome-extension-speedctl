import { useState } from "react";

import { SpeedSelect } from "@/components/SpeedSelect";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ChannelRule } from "@/lib/types";

interface Props {
	rules: ChannelRule[];
	onChange: (rules: ChannelRule[]) => void;
}

export function ChannelRulesSection({ rules, onChange }: Props) {
	const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

	const addRule = () => {
		onChange([...rules, { id: crypto.randomUUID(), channelName: "", speed: 1.0 }]);
	};

	const updateRule = (id: string, updates: Partial<ChannelRule>) => {
		onChange(rules.map((r) => (r.id === id ? { ...r, ...updates } : r)));
	};

	const deleteRule = (id: string) => {
		onChange(rules.filter((r) => r.id !== id));
	};

	const getError = (rule: ChannelRule): string | null => {
		if (!rule.channelName.trim()) return "Channel name is required";
		if (rules.some((r) => r.id !== rule.id && r.channelName.trim() === rule.channelName.trim())) {
			return "Duplicate channel name";
		}
		return null;
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Channel Rules</CardTitle>
				<CardDescription>Set playback speed for specific YouTube channels. Exact channel name match.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{rules.length === 0 ? (
					<Alert>
						<AlertDescription>
							No channel rules configured. Add a rule to automatically set speed for specific channels.
						</AlertDescription>
					</Alert>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Channel Name</TableHead>
								<TableHead className="w-32">Speed</TableHead>
								<TableHead className="w-24" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{rules.map((rule) => {
								const error = getError(rule);
								return (
									<TableRow key={rule.id}>
										<TableCell>
											<div className="space-y-1">
												<Input
													value={rule.channelName}
													onChange={(e) => updateRule(rule.id, { channelName: e.target.value })}
													placeholder="Channel name"
													className={error ? "border-destructive" : ""}
												/>
												{error && <p className="text-xs text-destructive">{error}</p>}
											</div>
										</TableCell>
										<TableCell>
											<SpeedSelect value={rule.speed} onChange={(speed) => updateRule(rule.id, { speed })} />
										</TableCell>
										<TableCell>
											<Button
												variant={pendingDeleteId === rule.id ? "destructive" : "outline"}
												size="sm"
												onClick={() => {
													if (pendingDeleteId === rule.id) {
														deleteRule(rule.id);
														setPendingDeleteId(null);
													} else {
														setPendingDeleteId(rule.id);
													}
												}}
											>
												{pendingDeleteId === rule.id ? "Confirm?" : "Delete"}
											</Button>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				)}
				<Button onClick={addRule}>Add Rule</Button>
			</CardContent>
		</Card>
	);
}
