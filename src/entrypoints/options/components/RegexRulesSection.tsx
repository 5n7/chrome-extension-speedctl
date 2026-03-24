import { useRef, useState } from "react";
import type { DragEvent } from "react";

import { SpeedSelect } from "@/components/SpeedSelect";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { RegexRule, Speed } from "@/lib/types";

interface Props {
	rules: RegexRule[];
	onChange: (rules: RegexRule[]) => void;
}

function isValidRegex(pattern: string): boolean {
	try {
		new RegExp(pattern);
		return true;
	} catch {
		return false;
	}
}

export function RegexRulesSection({ rules, onChange }: Props) {
	const [errors, setErrors] = useState<Record<string, boolean>>({});
	const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
	const [dropTargetId, setDropTargetId] = useState<string | null>(null);
	const dragSourceId = useRef<string | null>(null);

	const addRule = () => {
		onChange([...rules, { id: crypto.randomUUID(), pattern: "", speed: 1.0 }]);
	};

	const updatePattern = (id: string, pattern: string) => {
		setErrors((prev) => ({ ...prev, [id]: pattern !== "" && !isValidRegex(pattern) }));
		onChange(rules.map((r) => (r.id === id ? { ...r, pattern } : r)));
	};

	const updateSpeed = (id: string, speed: Speed) => {
		onChange(rules.map((r) => (r.id === id ? { ...r, speed } : r)));
	};

	const deleteRule = (id: string) => {
		onChange(rules.filter((r) => r.id !== id));
		setErrors((prev) => {
			const next = { ...prev };
			delete next[id];
			return next;
		});
	};

	const handleDragStart = (e: DragEvent, id: string) => {
		dragSourceId.current = id;
		e.dataTransfer.effectAllowed = "move";
	};

	const handleDragOver = (e: DragEvent, id: string) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
		if (dragSourceId.current !== id) {
			setDropTargetId(id);
		}
	};

	const handleDragLeave = () => {
		setDropTargetId(null);
	};

	const handleDrop = (e: DragEvent, targetId: string) => {
		e.preventDefault();
		setDropTargetId(null);

		const sourceId = dragSourceId.current;
		if (!sourceId || sourceId === targetId) return;

		const fromIndex = rules.findIndex((r) => r.id === sourceId);
		const toIndex = rules.findIndex((r) => r.id === targetId);
		if (fromIndex === -1 || toIndex === -1) return;

		const reordered = [...rules];
		const [moved] = reordered.splice(fromIndex, 1);
		reordered.splice(toIndex, 0, moved);
		onChange(reordered);
	};

	const handleDragEnd = () => {
		dragSourceId.current = null;
		setDropTargetId(null);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Title Regex Rules</CardTitle>
				<CardDescription>
					Set playback speed based on video title patterns (regex). Rules are evaluated in order — first match wins.
					Drag to reorder.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{rules.length === 0 ? (
					<Alert>
						<AlertDescription>
							No regex rules configured. Add a rule to automatically set speed based on video title patterns.
						</AlertDescription>
					</Alert>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-8" />
								<TableHead>Regex Pattern</TableHead>
								<TableHead className="w-32">Speed</TableHead>
								<TableHead className="w-24" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{rules.map((rule) => (
								<TableRow
									key={rule.id}
									draggable
									onDragStart={(e) => handleDragStart(e, rule.id)}
									onDragOver={(e) => handleDragOver(e, rule.id)}
									onDragLeave={handleDragLeave}
									onDrop={(e) => handleDrop(e, rule.id)}
									onDragEnd={handleDragEnd}
									className={dropTargetId === rule.id ? "border-t-2 border-t-primary" : ""}
								>
									<TableCell className="cursor-grab px-2 text-muted-foreground" aria-label="Drag to reorder" role="img">
										⠿
									</TableCell>
									<TableCell>
										<div className="space-y-1">
											<Input
												value={rule.pattern}
												onChange={(e) => updatePattern(rule.id, e.target.value)}
												placeholder="ASMR|relaxing"
												className={errors[rule.id] ? "border-destructive" : ""}
											/>
											{errors[rule.id] && (
												<p className="text-xs text-destructive">Invalid regex — this rule will be ignored</p>
											)}
										</div>
									</TableCell>
									<TableCell>
										<SpeedSelect value={rule.speed} onChange={(speed) => updateSpeed(rule.id, speed)} />
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
							))}
						</TableBody>
					</Table>
				)}
				<Button onClick={addRule}>Add Rule</Button>
			</CardContent>
		</Card>
	);
}
