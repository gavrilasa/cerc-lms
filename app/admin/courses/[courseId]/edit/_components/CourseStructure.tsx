"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DndContext,
	DragEndEvent,
	DraggableSyntheticListeners,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	useSortable,
	SortableContext,
	verticalListSortingStrategy,
	sortableKeyboardCoordinates,
	arrayMove,
} from "@dnd-kit/sortable";
import { ReactNode, useMemo, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { AdminCourseSingularType } from "@/app/data/admin/admin-get-course";
import { cn } from "@/lib/utils";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	ChevronDown,
	ChevronRight,
	FileText,
	GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { reorderChapters, reorderLessons } from "../actions";
import { NewChapterModal } from "./NewChapterModal";
import { NewLessonModal } from "./NewLessonModal";
import { DeleteLesson } from "./DeleteLesson";
import { DeleteChapter } from "./DeleteChapter";

interface iAppProps {
	data: AdminCourseSingularType;
}

interface SortableItemsProps {
	id: string;
	children: (listeners: DraggableSyntheticListeners) => ReactNode;
	className?: string;
	data?: {
		type: "chapter" | "lesson";
		chapterId?: string;
	};
}

// Define SortableItem at module scope to avoid re-creating it on every render
function SortableItem({ children, id, className, data }: SortableItemsProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: id, data: data });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			className={cn("touch-none", className, isDragging ? "z-10" : "")}
		>
			{children(listeners)}
		</div>
	);
}

interface ChapterItem {
	id: string;
	title: string;
	order: number;
	isOpen: boolean;
	lessons: {
		id: string;
		title: string;
		order: number;
	}[];
}

export function CourseStructure({ data }: iAppProps) {
	const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({});

	// Compute items during rendering from props + UI state
	const items: ChapterItem[] = useMemo(() => {
		return (
			data.chapters.map((chapter) => ({
				id: chapter.id,
				title: chapter.title,
				order: chapter.position,
				isOpen: openChapters[chapter.id] ?? true,
				lessons: chapter.lessons.map((lesson) => ({
					id: lesson.id,
					title: lesson.title,
					order: lesson.position,
				})),
			})) || []
		);
	}, [data.chapters, openChapters]);

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;

		if (!over || active.id === over.id) {
			return;
		}

		const activeId = active.id;
		const overId = over.id;
		const activeType = active.data.current?.type as "chapter" | "lesson";
		const overType = over.data.current?.type as "chapter" | "lesson";
		const courseId = data.id;

		if (activeType === "chapter") {
			let targetChapterId = null;

			if (overType === "chapter") {
				targetChapterId = overId;
			} else if (overType === "lesson") {
				targetChapterId = over.data.current?.chapterId ?? null;
			}

			if (!targetChapterId) {
				toast.error("Could not determine the chapter for ordering");
				return;
			}

			const oldIndex = items.findIndex((item) => item.id === activeId);
			const newIndex = items.findIndex((item) => item.id === targetChapterId);

			if (oldIndex === -1 || newIndex === -1) {
				toast.error("Could not find chapter old/new index for reordering");
				return;
			}

			const reordedLocalChapters = arrayMove(items, oldIndex, newIndex);

			const chaptersToUpdate = reordedLocalChapters.map((chapter, index) => ({
				id: chapter.id,
				position: index + 1,
			}));

			if (courseId) {
				const reorderPromise = () =>
					reorderChapters(courseId, chaptersToUpdate);

				toast.promise(reorderPromise(), {
					loading: "Reordering Chapters...",
					success: (result) => {
						if (result.status === "success") return result.message;

						throw new Error(result.message);
					},
					error: () => {
						return "Failed to reorder Chapters";
					},
				});
			}
			return;
		}

		if (activeType === "lesson" && overType === "lesson") {
			const chapterId = active.data.current?.chapterId;
			const overChapterId = over.data.current?.chapterId;

			if (!chapterId || chapterId !== overChapterId) {
				toast.error(
					"Lesson move between different chapters or invalid chapter ID is not allowed.",
				);
				return;
			}

			const chapterIndex = items.findIndex(
				(chapter) => chapter.id === chapterId,
			);

			if (chapterIndex === -1) {
				toast.error("Could not find chapter for lesson");
				return;
			}

			const chapterToUpdate = items[chapterIndex];

			const oldLessonIndex = chapterToUpdate.lessons.findIndex(
				(lesson) => lesson.id === active.id,
			);
			const newLessonIndex = chapterToUpdate.lessons.findIndex(
				(lesson) => lesson.id === overId,
			);

			if (oldLessonIndex === -1 || newLessonIndex === -1) {
				toast.error("Could not find lesson fro reordering");
				return;
			}

			const reordedLessons = arrayMove(
				chapterToUpdate.lessons,
				oldLessonIndex,
				newLessonIndex,
			);

			const lessonsToUpdate = reordedLessons.map((lesson, index) => ({
				id: lesson.id,
				position: index + 1,
			}));

			if (courseId) {
				const reorderLessonsPromise = () =>
					reorderLessons(chapterId, lessonsToUpdate, courseId);

				toast.promise(reorderLessonsPromise(), {
					loading: "Reordering Lessons...",
					success: (result) => {
						if (result.status === "success") return result.message;
						throw new Error(result.message);
					},
					error: () => {
						return "Failed to Reorder Lesson";
					},
				});
			}

			return;
		}

		// Handle lesson dropped on a chapter header (insert at end of chapter)
		if (activeType === "lesson" && overType === "chapter") {
			const chapterId = active.data.current?.chapterId;
			const targetChapterId = overId as string;

			if (!chapterId || chapterId !== targetChapterId) {
				toast.error(
					"Lesson move between different chapters or invalid chapter ID is not allowed.",
				);
				return;
			}

			const chapterIndex = items.findIndex(
				(chapter) => chapter.id === chapterId,
			);

			if (chapterIndex === -1) {
				toast.error("Could not find chapter for lesson");
				return;
			}

			const chapterToUpdate = items[chapterIndex];
			const oldLessonIndex = chapterToUpdate.lessons.findIndex(
				(lesson) => lesson.id === active.id,
			);

			if (oldLessonIndex === -1) {
				toast.error("Could not find lesson for reordering");
				return;
			}

			// Move to end of chapter
			const newLessonIndex = chapterToUpdate.lessons.length - 1;

			if (oldLessonIndex === newLessonIndex) {
				return; // Already at the end
			}

			const reordedLessons = arrayMove(
				chapterToUpdate.lessons,
				oldLessonIndex,
				newLessonIndex,
			);

			const lessonsToUpdate = reordedLessons.map((lesson, index) => ({
				id: lesson.id,
				position: index + 1,
			}));

			if (courseId) {
				const reorderLessonsPromise = () =>
					reorderLessons(chapterId, lessonsToUpdate, courseId);

				toast.promise(reorderLessonsPromise(), {
					loading: "Reordering Lessons...",
					success: (result) => {
						if (result.status === "success") return result.message;
						throw new Error(result.message);
					},
					error: () => {
						return "Failed to Reorder Lesson";
					},
				});
			}

			return;
		}
	}

	function toggleChapter(chapterId: string) {
		setOpenChapters((prev) => ({
			...prev,
			[chapterId]: !(prev[chapterId] ?? true),
		}));
	}

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	return (
		<DndContext
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
			sensors={sensors}
		>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between border-b border-border">
					<CardTitle>Chapters</CardTitle>
					<NewChapterModal courseId={data.id} />
				</CardHeader>
				<CardContent className="space-y-8">
					<SortableContext strategy={verticalListSortingStrategy} items={items}>
						{items.map((item) => (
							<SortableItem
								key={item.id}
								id={item.id}
								data={{ type: "chapter" }}
							>
								{(listeners) => (
									<Card className="pt-1">
										<Collapsible
											open={item.isOpen}
											onOpenChange={() => toggleChapter(item.id)}
										>
											<div className="flex items-center justify-between p-3 border-b border-border">
												<div className="flex items-center gap-2">
													<Button size="icon" variant="ghost" {...listeners}>
														<GripVertical className="size-4" />
													</Button>
													<CollapsibleTrigger asChild>
														<Button
															size="icon"
															variant="ghost"
															className="flex items-center"
														>
															{item.isOpen ? (
																<ChevronDown className="size-4" />
															) : (
																<ChevronRight className="size-4" />
															)}
														</Button>
													</CollapsibleTrigger>

													<p className="cursor-pointer hover:text-primary pl-2">
														{item.title}
													</p>
												</div>

												<DeleteChapter chapterId={item.id} courseId={data.id} />
											</div>

											<CollapsibleContent>
												<div className="p-2 space-y-2">
													<SortableContext
														items={item.lessons.map((lesson) => lesson.id)}
														strategy={verticalListSortingStrategy}
													>
														{item.lessons.map((lesson) => (
															<SortableItem
																key={lesson.id}
																id={lesson.id}
																data={{ type: "lesson", chapterId: item.id }}
															>
																{(lessonListeners) => (
																	<div className="flex items-center justify-between p-2 hover:bg-accent rounded-sm">
																		<div className="flex items-center gap-2">
																			<Button
																				variant="ghost"
																				size="icon"
																				{...lessonListeners}
																			>
																				<GripVertical className="size-4" />
																			</Button>
																			<FileText className="size-4" />
																			<Link
																				href={`/admin/courses/${data.id}/${item.id}/${lesson.id}`}
																			>
																				{lesson.title}
																			</Link>
																		</div>

																		<DeleteLesson
																			chapterId={item.id}
																			courseId={data.id}
																			lessonId={lesson.id}
																		/>
																	</div>
																)}
															</SortableItem>
														))}
													</SortableContext>
													<div className="p-2">
														<NewLessonModal
															chapterId={item.id}
															courseId={data.id}
														/>
													</div>
												</div>
											</CollapsibleContent>
										</Collapsible>
									</Card>
								)}
							</SortableItem>
						))}
					</SortableContext>
				</CardContent>
			</Card>
		</DndContext>
	);
}
