import { adminGetCourse } from "@/app/data/admin/admin-get-course";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { AdminLessonWrapper } from "./_components/AdminLessonWrapper";
import { AdminLessonContent } from "./_components/AdminLessonContent";
import type { Metadata } from "next";

interface PageProps {
	params: Promise<{ courseId: string; lessonId: string }>;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	try {
		const { lessonId } = await params;
		const lesson = await prisma.lesson.findUnique({
			where: { id: lessonId },
			select: { title: true },
		});
		return {
			title: lesson?.title ? `Preview: ${lesson.title}` : "Preview Lesson",
		};
	} catch {
		return {
			title: "Preview Lesson",
		};
	}
}

export default async function AdminPreviewLessonPage({ params }: PageProps) {
	const { courseId, lessonId } = await params;

	// Get course data (with auth check)
	const course = await adminGetCourse(courseId);

	// Get specific lesson
	const lesson = await prisma.lesson.findUnique({
		where: { id: lessonId },
		select: {
			id: true,
			title: true,
			description: true,
			chapterId: true,
		},
	});

	// Verify lesson exists
	if (!lesson) {
		return redirect(`/admin/courses/${courseId}/preview`);
	}

	// Verify lesson belongs to this course
	const lessonChapter = course.chapters.find(
		(chapter) => chapter.id === lesson.chapterId,
	);
	if (!lessonChapter) {
		return redirect(`/admin/courses/${courseId}/preview`);
	}

	// Calculate previous and next lesson IDs
	const allLessons = course.chapters.flatMap((chapter) =>
		chapter.lessons.map((l) => ({ ...l, chapterId: chapter.id })),
	);

	const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
	const prevLessonId =
		currentIndex > 0 ? allLessons[currentIndex - 1].id : null;
	const nextLessonId =
		currentIndex < allLessons.length - 1
			? allLessons[currentIndex + 1].id
			: null;

	return (
		<AdminLessonWrapper lessonTitle={lesson.title}>
			<AdminLessonContent
				lessonId={lesson.id}
				courseId={course.id}
				content={lesson.description || ""}
				lessonTitle={lesson.title}
				nextLessonId={nextLessonId}
				prevLessonId={prevLessonId}
			/>
		</AdminLessonWrapper>
	);
}
