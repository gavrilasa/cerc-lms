"use server";

import { requireUser } from "@/app/data/user/require-user";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import prisma from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";

const aj = arcjet.withRule(
	fixedWindow({
		mode: "LIVE",
		window: "1m",
		max: 10,
	})
);

export async function markLessonComplete(
	lessonId: string,
	slug: string
): Promise<ApiResponse> {
	const session = await requireUser();

	try {
		// 1. Proteksi Infrastruktur: Cegah brute-force completion
		const req = await request();
		const decision = await aj.protect(req, {
			fingerprint: session.id,
		});

		if (decision.isDenied()) {
			return {
				status: "error",
				message: "Too many requests. Please slow down.",
			};
		}

		// 2. Pencatatan Progress Lesson
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
				lessonId: lessonId,
				userId: session.id,
				completed: true,
			},
		});

		// 3. Kalkulasi Kelulusan Course (Aggregation)
		// Hitung total lesson yang ada di course ini
		const totalLessons = await prisma.lesson.count({
			where: {
				Chapter: {
					Course: {
						slug: slug,
					},
				},
			},
		});

		// Hitung total lesson yang sudah diselesaikan user di course ini
		const completedLessons = await prisma.lessonProgress.count({
			where: {
				userId: session.id,
				completed: true,
				lesson: {
					Chapter: {
						Course: {
							slug: slug,
						},
					},
				},
			},
		});

		// 4. Evaluasi "Moment of Truth" & Update Enrollment
		if (totalLessons > 0 && totalLessons === completedLessons) {
			// Update completedAt hanya jika belum terisi (Idempotent)
			await prisma.enrollment.updateMany({
				where: {
					userId: session.id,
					course: {
						slug: slug,
					},
					completedAt: null,
				},
				data: {
					completedAt: new Date(),
				},
			});
		}

		revalidatePath(`/dashboard/${slug}`);
		revalidatePath("/dashboard"); // Update status gembok di dashboard utama

		return {
			status: "success",
			message: "Progress Updated",
		};
	} catch (error) {
		console.error(error);
		return {
			status: "error",
			message: "Failed to mark lesson as complete",
		};
	}
}
