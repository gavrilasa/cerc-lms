"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Division } from "@/lib/generated/prisma/enums";

interface DivisionTabsProps {
	currentDivision: Division;
	onDivisionChange: (division: Division) => void;
}

const DIVISION_LABELS: Record<Division, string> = {
	SOFTWARE: "Software",
	EMBEDDED: "Embedded",
	MULTIMEDIA: "Multimedia",
	NETWORKING: "Networking",
};

export function DivisionTabs({
	currentDivision,
	onDivisionChange,
}: DivisionTabsProps) {
	return (
		<Tabs
			value={currentDivision}
			onValueChange={(v) => onDivisionChange(v as Division)}
		>
			<TabsList>
				{Object.entries(DIVISION_LABELS).map(([key, label]) => (
					<TabsTrigger key={key} value={key} className="cursor-pointer">
						{label}
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
	);
}
