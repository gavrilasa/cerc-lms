"use server";

import { requireUser } from "@/app/data/user/require-user";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { EnrollmentStatus } from "@/lib/generated/prisma/enums";

// Zod schema untuk validasi input
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

/**
 * Mark a lesson as completed dengan validasi:
 * - User harus aktif enrolled di course
 * - Lesson harus exist
 */
export async function markAsCompleted(
	lessonId: string,
	courseId: string
): Promise<MarkAsCompletedResult> {
	const session = await requireUser();

	// 1. Input Validation
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

	// 2. [NEW] Enrollment Check - user harus enrolled di course
	const enrollment = await prisma.enrollment.findUnique({
		where: {
			userId_courseId: {
				userId: session.id,
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

	// 3. Get current lesson data
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

	// 4. Update Progress (Upsert for idempotency)
	await prisma.lessonProgress.upsert({
		where: {
			userId_lessonId: {
				userId: session.id,
				lessonId: lessonId,
			},
		},
		update: {
			completed: true,
		},
		create: {
			userId: session.id,
			lessonId: lessonId,
			completed: true,
		},
	});

	// 5. Find Next Lesson
	let nextLessonId: string | null = null;

	// Cari lesson berikutnya di Chapter yang sama
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
		// Jika tidak ada, cari Chapter berikutnya dalam Course yang sama
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

	// 6. Check Course Completion
	const totalLessonsCount = await prisma.lesson.count({
		where: {
			chapter: {
				courseId: courseId,
			},
		},
	});

	const completedLessonsCount = await prisma.lessonProgress.count({
		where: {
			userId: session.id,
			completed: true,
			lesson: {
				chapter: {
					courseId: courseId,
				},
			},
		},
	});

	const isCourseCompleted = completedLessonsCount === totalLessonsCount;

	// 7. Update enrollment if completed
	if (isCourseCompleted) {
		await prisma.enrollment.updateMany({
			where: {
				userId: session.id,
				courseId: courseId,
			},
			data: {
				completedAt: new Date(),
			},
		});
	}

	// 8. Revalidation
	revalidatePath("/dashboard/courses");

	return {
		success: true,
		nextLessonId,
		isCourseCompleted,
	};
}
