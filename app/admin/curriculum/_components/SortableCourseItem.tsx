"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, BookOpen, Layers } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DesignItem } from "./CurriculumDesignBuilder";

interface SortableCourseItemProps {
	item: DesignItem;
	index: number;
	onRemove: () => void;
	onToggleType: () => void;
	disabled: boolean;
}

export function SortableCourseItem({
	item,
	index,
	onRemove,
	onToggleType,
	disabled,
}: SortableCourseItemProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: item.id, disabled });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 10 : 1,
		opacity: isDragging ? 0.5 : 1,
	};

	const isCore = item.type === "CORE";

	return (
		<Card
			ref={setNodeRef}
			style={style}
			className={cn(
				"flex items-center gap-4 p-3 group relative transition-all",
				!isCore &&
					"border-dashed border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-900/10"
			)}
		>
			{/* Drag Handle */}
			<div
				{...attributes}
				{...listeners}
				className={cn(
					"cursor-grab text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted",
					disabled && "cursor-not-allowed opacity-50"
				)}
			>
				<GripVertical className="h-5 w-5" />
			</div>

			<div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-mono text-muted-foreground">
				{index}
			</div>

			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-1">
					<h4 className="font-medium truncate">{item.title}</h4>
				</div>
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					{isCore ? (
						<BookOpen className="h-3 w-3" />
					) : (
						<Layers className="h-3 w-3" />
					)}
					<span>{isCore ? "Wajib (Core)" : "Pilihan (Elective)"}</span>
				</div>
			</div>

			{/* Actions */}
			<div className="flex items-center gap-6 mr-2">
				<div className="flex items-center gap-2">
					<Label
						htmlFor={`type-${item.id}`}
						className="text-xs text-muted-foreground font-normal"
					>
						{isCore ? "Core" : "Elective"}
					</Label>
					<Switch
						id={`type-${item.id}`}
						checked={isCore}
						onCheckedChange={onToggleType}
						disabled={disabled}
						className="data-[state=unchecked]:bg-yellow-500" // Visual cue for Elective
					/>
				</div>

				<Button
					variant="ghost"
					size="icon"
					onClick={onRemove}
					disabled={disabled}
					className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
				>
					<X className="h-4 w-4" />
				</Button>
			</div>
		</Card>
	);
}
