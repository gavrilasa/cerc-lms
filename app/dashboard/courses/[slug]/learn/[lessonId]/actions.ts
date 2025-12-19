"use server";

import { requireUser } from "@/app/data/user/require-user";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

interface MarkAsCompletedResult {
	nextLessonId: string | null;
	isCourseCompleted: boolean;
}

export async function markAsCompleted(
	lessonId: string,
	courseId: string
): Promise<MarkAsCompletedResult> {
	const session = await requireUser();

	// 1. Validasi & Update Progress (Upsert)
	// Kita menggunakan upsert untuk menangani kasus di mana user mungkin mengklik tombol ini berkali-kali
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

	// 2. Logika "Next Lesson" (Algoritma Pencarian)
	// Pertama, kita butuh data posisi lesson saat ini
	const currentLesson = await prisma.lesson.findUnique({
		where: { id: lessonId },
		select: {
			position: true,
			chapterId: true,
			Chapter: { select: { position: true } },
		},
	});

	if (!currentLesson) {
		throw new Error("Lesson not found");
	}

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
				position: { gt: currentLesson.Chapter.position },
			},
			orderBy: { position: "asc" },
			select: {
				id: true,
				lessons: {
					orderBy: { position: "asc" },
					take: 1, // Ambil hanya lesson pertama
					select: { id: true },
				},
			},
		});

		// Jika chapter berikutnya ada dan memiliki lesson
		if (nextChapter && nextChapter.lessons.length > 0) {
			nextLessonId = nextChapter.lessons[0].id;
		}
	}

	// 3. Cek Penyelesaian Kursus
	// Hitung total lessons di kursus ini
	const totalLessonsCount = await prisma.lesson.count({
		where: {
			Chapter: {
				courseId: courseId,
			},
		},
	});

	// Hitung jumlah lesson yang sudah diselesaikan user di kursus ini
	const completedLessonsCount = await prisma.lessonProgress.count({
		where: {
			userId: session.id,
			completed: true,
			lesson: {
				Chapter: {
					courseId: courseId,
				},
			},
		},
	});

	const isCourseCompleted = completedLessonsCount === totalLessonsCount;

	// Jika kursus selesai, update status Enrollment
	if (isCourseCompleted) {
		// Catatan: Pastikan Enums EnrollmentStatus mendukung 'COMPLETED' jika ingin mengubah status.
		// Jika tidak, kita setidaknya mengisi completedAt.
		await prisma.enrollment.updateMany({
			where: {
				userId: session.id,
				courseId: courseId,
			},
			data: {
				completedAt: new Date(),
				// Uncomment baris di bawah jika enum EnrollmentStatus Anda memiliki value 'Completed'
				// status: "Completed",
			},
		});
	}

	// Revalidate path agar UI sidebar terupdate (progress bar & checklist)
	// Asumsi path ini, sesuaikan jika slug dinamis
	revalidatePath("/dashboard/courses");

	return {
		nextLessonId,
		isCourseCompleted,
	};
}
