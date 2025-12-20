"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, BookOpen, Layers } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
				"flex flex-row items-center justify-start gap-2 p-4 pr-3 group relative transition-all whitespace-nowrap",
				"hover:border-primary/50",
				!isCore &&
					"border-dashed border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-900/10"
			)}
		>
			{/* 1. Drag Handle */}
			<div
				{...attributes}
				{...listeners}
				className={cn(
					"cursor-grab text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-muted/80 transition-colors",
					disabled && "cursor-not-allowed opacity-50"
				)}
			>
				<GripVertical className="h-4 w-4" />
			</div>

			{/* 2. Index Number */}
			<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-mono font-medium text-muted-foreground">
				{index}
			</div>

			{/* 3. Badge */}
			<Badge
				variant={isCore ? "secondary" : "outline"}
				className={cn(
					"h-5 px-1.5 gap-1 text-xs font-normal pointer-events-none",
					!isCore &&
						"text-yellow-600 border-yellow-500/30 bg-yellow-100/50 dark:text-yellow-400 dark:bg-yellow-900/20"
				)}
			>
				{isCore ? (
					<BookOpen className="h-3 w-3" />
				) : (
					<Layers className="h-3 w-3" />
				)}
				<span>{isCore ? "Core" : "Elective"}</span>
			</Badge>

			{/* 4. Title */}
			<div className="flex items-center gap-2">
				<h4 className="font-medium text-sm truncate max-w-[200px] md:max-w-[300px]">
					{item.title}
				</h4>
			</div>

			{/* 5. Actions (Toggle & Delete) - Pushed to Far Right */}
			<div className="flex items-center gap-2 ml-auto pl-2">
				<div className="flex items-center gap-2" title="Toggle Course Type">
					<Switch
						id={`type-${item.id}`}
						checked={isCore}
						onCheckedChange={onToggleType}
						disabled={disabled}
						className="data-[state=unchecked]:bg-yellow-500"
					/>
				</div>

				<Button
					variant="ghost"
					size="icon"
					onClick={onRemove}
					disabled={disabled}
					className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full cursor-pointer"
				>
					<X className="h-3.5 w-3.5" />
				</Button>
			</div>
		</Card>
	);
}
