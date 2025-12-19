import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { LessonMainWrapper } from "./_components/LessonMainWrapper";

type Params = Promise<{
	lessonId: string;
	slug: string;
}>;

export default async function LessonPage({ params }: { params: Params }) {
	const { lessonId, slug } = await params;

	// 1. Fetch Lesson Data
	// Kita perlu include Chapter -> Course untuk validasi dan data context
	const lesson = await prisma.lesson.findUnique({
		where: {
			id: lessonId,
		},
		select: {
			id: true,
			title: true,
			description: true,
			chapterId: true,
			Chapter: {
				select: {
					courseId: true,
					Course: {
						select: {
							title: true,
							slug: true,
						},
					},
				},
			},
		},
	});

	// 2. Validasi
	if (!lesson) {
		return redirect("/dashboard");
	}

	// Validasi Slug URL matches Lesson Data (Security/Consistency check)
	if (lesson.Chapter.Course.slug !== slug) {
		return redirect(
			`/dashboard/courses/${lesson.Chapter.Course.slug}/learn/${lessonId}`
		);
	}

	// 3. Render Client Wrapper
	return (
		<LessonMainWrapper
			lessonId={lesson.id}
			courseId={lesson.Chapter.courseId}
			lessonTitle={lesson.title}
			lessonContent={lesson.description || ""}
			courseTitle={lesson.Chapter.Course.title}
		/>
	);
}
