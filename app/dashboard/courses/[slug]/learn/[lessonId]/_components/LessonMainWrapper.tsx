"use client";

import { Button } from "@/components/ui/button";
import { useZenModeStore } from "@/hooks/use-zen-mode";
import { cn } from "@/lib/utils";
import { Maximize2, Minimize2 } from "lucide-react";
import { CourseContent } from "./CourseContent";

interface LessonMainWrapperProps {
	lessonId: string;
	courseId: string;
	lessonTitle: string;
	lessonContent: string;
	courseTitle: string;
}

export function LessonMainWrapper({
	lessonId,
	courseId,
	lessonTitle,
	lessonContent,
	courseTitle,
}: LessonMainWrapperProps) {
	const { isZenMode, toggleZenMode } = useZenModeStore();

	return (
		<div
			className={cn(
				"mx-auto transition-all duration-300 ease-in-out p-6 md:p-8",
				// Logic Dynamic Class
				isZenMode ? "max-w-5xl" : "max-w-3xl"
			)}
		>
			{/* Header Lesson */}
			<div className="flex items-start justify-between gap-4 mb-8 border-b pb-4">
				<h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
					{lessonTitle}
				</h1>

				{/* Tombol Toggle Zen Mode */}
				<Button
					variant="ghost"
					size="icon"
					onClick={toggleZenMode}
					className="text-muted-foreground hover:text-primary shrink-0"
					title={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
				>
					{isZenMode ? (
						<Minimize2 className="size-5" />
					) : (
						<Maximize2 className="size-5" />
					)}
				</Button>
			</div>

			{/* Render Course Content */}
			<CourseContent
				lessonId={lessonId}
				courseId={courseId}
				content={lessonContent}
				courseTitle={courseTitle}
			/>
		</div>
	);
}
