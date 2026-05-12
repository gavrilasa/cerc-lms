import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { LessonMainWrapper } from "./_components/LessonMainWrapper";

type Params = Promise<{
	lessonId: string;
	slug: string;
}>;

export default async function LessonPage({ params }: { params: Params }) {
	const { lessonId, slug } = await params;

	const lesson = await prisma.lesson.findUnique({
		where: {
			id: lessonId,
		},
		select: {
			id: true,
			title: true,
			description: true,
			chapterId: true,
			chapter: {
				select: {
					courseId: true,
					course: {
						select: {
							title: true,
							slug: true,
						},
					},
				},
			},
		},
	});

	if (!lesson) {
		return redirect("/dashboard");
	}

	if (lesson.chapter.course.slug !== slug) {
		return redirect(
			`/dashboard/courses/${lesson.chapter.course.slug}/learn/${lessonId}`
		);
	}

	return (
		<LessonMainWrapper
			lessonId={lesson.id}
			courseId={lesson.chapter.courseId}
			lessonTitle={lesson.title}
			lessonContent={lesson.description || ""}
			courseTitle={lesson.chapter.course.title}
		/>
	);
}
