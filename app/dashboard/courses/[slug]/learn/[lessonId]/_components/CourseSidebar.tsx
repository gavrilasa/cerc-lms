"use client";

import { CourseSidebarDataType } from "@/app/data/course/get-course-sidebar-data";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, PanelLeftClose } from "lucide-react";
import { LessonItem } from "./LessonItem";
import { usePathname } from "next/navigation";
import { useCourseProgress } from "@/hooks/use-course-progress";
import { useMemo } from "react";
import { useZenModeStore } from "@/hooks/use-zen-mode";

interface iAppProps {
	course: CourseSidebarDataType["course"];
}

export function CourseSidebar({ course }: iAppProps) {
	const pathname = usePathname();
	const currentLessonId = pathname.split("/").pop();
	const { toggleZenMode } = useZenModeStore();

	const { completedLessons, totalLessons, progressPercentage } =
		useCourseProgress({ courseData: course });

	// Flatten all lessons to calculate locked status linearly
	const allLessons = course.chapters.flatMap((chapter) => chapter.lessons);

	// Find the chapter that contains the current lesson
	const currentChapterId = useMemo(() => {
		for (const chapter of course.chapters) {
			if (chapter.lessons.some((lesson) => lesson.id === currentLessonId)) {
				return chapter.id;
			}
		}
		return course.chapters[0]?.id ?? null;
	}, [course.chapters, currentLessonId]);

	return (
		<div className="flex flex-col h-full">
			<div className="pb-4 pr-4 border-b border-border">
				<div className="flex items-center gap-3 mb-3">
					<div className="flex-1 min-w-0">
						<h1 className="font-semibold text-base leading-tight truncate">
							{course.title}
						</h1>
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="size-8 shrink-0 cursor-pointer"
						onClick={toggleZenMode}
						title="Close sidebar"
					>
						<PanelLeftClose className="size-4" />
					</Button>
				</div>

				<div className="space-y-2">
					<div className="flex justify-between text-xs">
						<span className="font-normal">Progress</span>
						<span className="font-medium">
							{completedLessons}/{totalLessons} lessons
						</span>
					</div>
					<Progress value={progressPercentage} className="h-1.5" />
					<p className="text-xs text-muted-foreground">
						{progressPercentage}% complete
					</p>
				</div>
			</div>

			{/* Key resets collapsible state when current chapter changes */}
			<div key={currentChapterId} className="py-4 pr-4 space-y-3">
				{course.chapters.map((chapter) => {
					const isCurrentChapter = chapter.id === currentChapterId;
					return (
						<Collapsible key={chapter.id} defaultOpen={isCurrentChapter}>
							<CollapsibleTrigger asChild>
								<Button
									variant="outline"
									className="w-full p-3 h-auto flex items-center gap-2 cursor-pointer"
								>
									<div className="shrink-0">
										<ChevronDown className="size-4 text-primary" />
									</div>
									<div className="flex-1 text-left min-w-0">
										<div>
											<p className="font-semibold text-sm truncate text-foreground">
												{chapter.position}: {chapter.title}
											</p>

											<p className="text-sm text-muted-foreground font-medium truncate">
												{chapter.lessons.length} lessons
											</p>
										</div>
									</div>
								</Button>
							</CollapsibleTrigger>
							<CollapsibleContent className="mt-3 pl-6 border-l-2 space-y-3">
								{chapter.lessons.map((lesson) => {
									// Calculate locked status
									const currentLessonIndex = allLessons.findIndex(
										(l) => l.id === lesson.id
									);
									const previousLesson = allLessons[currentLessonIndex - 1];
									const isPreviousCompleted = previousLesson
										? previousLesson.lessonProgress.find(
												(p) => p.lessonId === previousLesson.id
											)?.completed
										: true; // First lesson is distinct, always unlocked

									const isLocked = !isPreviousCompleted;

									return (
										<LessonItem
											key={lesson.id}
											lesson={lesson}
											slug={course.slug}
											isActive={currentLessonId === lesson.id}
											completed={
												lesson.lessonProgress.find(
													(progress) => progress.lessonId === lesson.id
												)?.completed || false
											}
											isLocked={isLocked}
										/>
									);
								})}
							</CollapsibleContent>
						</Collapsible>
					);
				})}
			</div>
		</div>
	);
}
