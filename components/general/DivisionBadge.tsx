import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type Division } from "@/lib/generated/prisma";

interface DivisionBadgeProps {
	division: Division | string | null | undefined;
	className?: string;
}

export function DivisionBadge({ division, className }: DivisionBadgeProps) {
	if (!division) {
		return <span className="text-muted-foreground text-xs">-</span>;
	}

	const getDivisionColor = (div: string) => {
		switch (div) {
			case "SOFTWARE":
				return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100";
			case "EMBEDDED":
				return "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100";
			case "MULTIMEDIA":
				return "bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-100";
			case "NETWORKING":
				return "bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-100";
			case "ARTIFICIAL_INTELLIGENCE":
				return "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
			case "CYBER_SECURITY":
				return "bg-red-100 text-red-700 border-red-200 hover:bg-red-100";
			default:
				return "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100";
		}
	};

	const label = division.replace(/_/g, " ");

	return (
		<Badge
			variant="outline"
			className={cn(
				"font-medium text-[10px] px-2 py-0.5 whitespace-nowrap",
				getDivisionColor(division),
				className
			)}
		>
			{label}
		</Badge>
	);
}
