"use server";

import { requireSession } from "@/app/data/auth/require-session";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { EnrollmentStatus } from "@/lib/generated/prisma/enums";

const markAsCompletedInputSchema = z.object({
	lessonId: z.string().uuid({ message: "Invalid Lesson ID" }),
	courseId: z.string().uuid({ message: "Invalid Course ID" }),
});

interface MarkAsCompletedResult {
	success: boolean;
	nextLessonId: string | null;
	isCourseCompleted: boolean;
	error?: string;
}

export async function markAsCompleted(
	lessonId: string,
	courseId: string
): Promise<MarkAsCompletedResult> {
	const { user } = await requireSession();

	const validation = markAsCompletedInputSchema.safeParse({
		lessonId,
		courseId,
	});
	if (!validation.success) {
		return {
			success: false,
			nextLessonId: null,
			isCourseCompleted: false,
			error: validation.error.issues[0]?.message || "Invalid input",
		};
	}

	const enrollment = await prisma.enrollment.findUnique({
		where: {
			userId_courseId: {
				userId: user.id,
				courseId: courseId,
			},
		},
	});

	if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) {
		return {
			success: false,
			nextLessonId: null,
			isCourseCompleted: false,
			error: "Anda belum terdaftar di kursus ini.",
		};
	}

	const currentLesson = await prisma.lesson.findUnique({
		where: { id: lessonId },
		select: {
			position: true,
			chapterId: true,
			chapter: { select: { position: true, courseId: true } },
		},
	});

	if (!currentLesson) {
		return {
			success: false,
			nextLessonId: null,
			isCourseCompleted: false,
			error: "Lesson tidak ditemukan.",
		};
	}

	// Verify lesson belongs to the course
	if (currentLesson.chapter.courseId !== courseId) {
		return {
			success: false,
			nextLessonId: null,
			isCourseCompleted: false,
			error: "Lesson tidak ada di kursus ini.",
		};
	}

	await prisma.lessonProgress.upsert({
		where: {
			userId_lessonId: {
				userId: user.id,
				lessonId: lessonId,
			},
		},
		update: {
			completed: true,
		},
		create: {
			userId: user.id,
			lessonId: lessonId,
			completed: true,
		},
	});

	let nextLessonId: string | null = null;

	const nextLessonInSameChapter = await prisma.lesson.findFirst({
		where: {
			chapterId: currentLesson.chapterId,
			position: { gt: currentLesson.position },
		},
		orderBy: { position: "asc" },
		select: { id: true },
	});

	if (nextLessonInSameChapter) {
		nextLessonId = nextLessonInSameChapter.id;
	} else {
		const nextChapter = await prisma.chapter.findFirst({
			where: {
				courseId: courseId,
				position: { gt: currentLesson.chapter.position },
			},
			orderBy: { position: "asc" },
			select: {
				id: true,
				lessons: {
					orderBy: { position: "asc" },
					take: 1,
					select: { id: true },
				},
			},
		});

		if (nextChapter && nextChapter.lessons.length > 0) {
			nextLessonId = nextChapter.lessons[0].id;
		}
	}

	const totalLessonsCount = await prisma.lesson.count({
		where: {
			chapter: {
				courseId: courseId,
			},
		},
	});

	const completedLessonsCount = await prisma.lessonProgress.count({
		where: {
			userId: user.id,
			completed: true,
			lesson: {
				chapter: {
					courseId: courseId,
				},
			},
		},
	});

	const isCourseCompleted = completedLessonsCount === totalLessonsCount;

	if (isCourseCompleted) {
		await prisma.enrollment.updateMany({
			where: {
				userId: user.id,
				courseId: courseId,
			},
			data: {
				completedAt: new Date(),
			},
		});
	}

	revalidatePath("/dashboard/courses");

	return {
		success: true,
		nextLessonId,
		isCourseCompleted,
	};
}
