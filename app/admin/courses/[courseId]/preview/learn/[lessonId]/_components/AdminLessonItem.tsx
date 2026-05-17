import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";
import Link from "next/link";

interface AdminLessonItemProps {
	lesson: {
		id: string;
		title: string;
		position: number;
	};
	courseId: string;
	isActive?: boolean;
}

export function AdminLessonItem({
	lesson,
	courseId,
	isActive,
}: AdminLessonItemProps) {
	return (
		<Link
			href={`/admin/courses/${courseId}/preview/learn/${lesson.id}`}
			className={buttonVariants({
				variant: "ghost",
				className: cn(
					"w-full p-2.5 h-auto justify-start transition-all",
					isActive
						? "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
						: "text-muted-foreground hover:bg-muted hover:text-foreground"
				),
			})}
		>
			<div className="flex items-center gap-2.5 w-full min-w-0">
				<div className="shrink-0">
					<div
						className={cn(
							"size-5 rounded-full border-2 flex justify-center items-center",
							isActive
								? "border-primary bg-primary/10"
								: "border-muted-foreground/30"
						)}
					>
						<Play
							className={cn(
								"size-2.5 fill-current",
								isActive ? "text-primary" : "text-muted-foreground"
							)}
						/>
					</div>
				</div>

				<div className="flex-1 text-left min-w-0">
					<p
						className={cn(
							"text-xs font-medium truncate",
							isActive ? "text-primary font-semibold" : "text-foreground"
						)}
					>
						{lesson.position}. {lesson.title}
					</p>
					{isActive && (
						<p className="text-[10px] text-primary font-medium">
							Currently Viewing
						</p>
					)}
				</div>
			</div>
		</Link>
	);
}
