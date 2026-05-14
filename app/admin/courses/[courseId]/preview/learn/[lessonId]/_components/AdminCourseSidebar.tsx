"use client";

import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, PanelLeftClose, ArrowLeft } from "lucide-react";
import { AdminLessonItem } from "./AdminLessonItem";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useZenModeStore } from "@/hooks/use-zen-mode";
import Link from "next/link";

interface Chapter {
	id: string;
	title: string;
	position: number;
	lessons: {
		id: string;
		title: string;
		position: number;
	}[];
}

interface Course {
	id: string;
	title: string;
	chapters: Chapter[];
}

interface AdminCourseSidebarProps {
	course: Course;
}

export function AdminCourseSidebar({ course }: AdminCourseSidebarProps) {
	const pathname = usePathname();
	const currentLessonId = pathname.split("/").pop() || "";
	const { toggleZenMode } = useZenModeStore();

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
				{/* Back to Course Preview button - above title */}
				<Button
					variant="ghost"
					size="sm"
					className="mb-3 w-full justify-start text-muted-foreground hover:text-foreground"
					asChild
				>
					<Link href={`/admin/courses/${course.id}/preview`}>
						<ArrowLeft className="size-4 mr-2" />
						Back to Preview
					</Link>
				</Button>

				<div className="flex items-center gap-3">
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
			</div>

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
																	{chapter.lessons.length} {chapter.lessons.length === 1 ? "lesson" : "lessons"}
																</p>
										</div>
									</div>
								</Button>
							</CollapsibleTrigger>
							<CollapsibleContent className="mt-3 pl-6 border-l-2 space-y-3">
								{chapter.lessons.map((lesson) => (
									<AdminLessonItem
										key={lesson.id}
										lesson={lesson}
										courseId={course.id}
										isActive={currentLessonId === lesson.id}
									/>
								))}
							</CollapsibleContent>
						</Collapsible>
					);
				})}
			</div>
		</div>
	);
}
