"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { DesignItem } from "./CurriculumDesignBuilder";

interface PoolCourseItemProps {
	item: DesignItem;
	onAdd: () => void;
	disabled: boolean;
}

export function PoolCourseItem({ item, onAdd, disabled }: PoolCourseItemProps) {
	return (
		<Card className="p-3 flex items-center justify-between hover:bg-accent/50 transition-colors">
			<div className="min-w-0 pr-2">
				<div className="font-medium text-sm truncate" title={item.title}>
					{item.title}
				</div>
			</div>
			<Button
				size="icon"
				variant="ghost"
				className="h-8 w-8 shrink-0 hover:bg-primary/10 hover:text-primary"
				onClick={onAdd}
				disabled={disabled}
			>
				<Plus className="h-4 w-4" />
			</Button>
		</Card>
	);
}
