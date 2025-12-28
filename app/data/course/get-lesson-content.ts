import "server-only";
import { requireSession } from "@/app/data/auth/require-session";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";

export async function getLessonContent(lessonId: string) {
	const { user } = await requireSession();

	const lesson = await prisma.lesson.findUnique({
		where: {
			id: lessonId,
		},
		select: {
			id: true,
			title: true,
			description: true,
			position: true,
			lessonProgress: {
				where: {
					userId: user.id,
				},
				select: {
					completed: true,
					lessonId: true,
				},
			},
			chapter: {
				select: {
					courseId: true,
					course: {
						select: {
							slug: true,
						},
					},
				},
			},
		},
	});

	if (!lesson) {
		return notFound();
	}

	const enrollment = await prisma.enrollment.findUnique({
		where: {
			userId_courseId: {
				userId: user.id,
				courseId: lesson.chapter.courseId,
			},
		},
		select: {
			status: true,
		},
	});

	if (!enrollment || enrollment.status !== "ACTIVE") {
		return notFound();
	}

	return lesson;
}

export type LessonContentType = Awaited<ReturnType<typeof getLessonContent>>;
