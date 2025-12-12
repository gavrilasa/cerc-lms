"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import prisma from "@/lib/db";
import { Division } from "@/lib/generated/prisma"; // Sesuaikan import enum Division
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema validasi input
const reorderSchema = z.object({
	courseId: z.string().uuid(),
	newOrder: z.number().int().min(1).nullable(), // Nullable untuk 'Hapus dari Kurikulum'
	division: z.nativeEnum(Division),
});

export async function reorderCurriculum({
	courseId,
	newOrder,
	division,
}: {
	courseId: string;
	newOrder: number | null;
	division: Division;
}) {
	// 1. Validasi Admin & Input
	await requireAdmin();

	const validation = reorderSchema.safeParse({ courseId, newOrder, division });
	if (!validation.success) {
		return { status: "error", message: "Invalid input data" };
	}

	try {
		// Ambil data course saat ini untuk tahu posisi lamanya (oldOrder)
		const currentCourse = await prisma.course.findUnique({
			where: { id: courseId },
			select: { curriculumOrder: true, division: true },
		});

		if (!currentCourse) {
			return { status: "error", message: "Course not found" };
		}

		if (currentCourse.division !== division) {
			return { status: "error", message: "Course division mismatch" };
		}

		const oldOrder = currentCourse.curriculumOrder;

		// Jika posisi tidak berubah, hentikan operasi
		if (oldOrder === newOrder) {
			return { status: "success", message: "No changes needed" };
		}

		// 2. Strategi Penggeseran (Shifting) dalam Transaksi
		await prisma.$transaction(async (tx) => {
			// LANGKAH A: "Angkat" course dari posisi lama (Tutup Celah)
			// Jika course punya posisi lama (bukan null), geser course di bawahnya NAIK (decrement)
			if (oldOrder !== null) {
				await tx.course.updateMany({
					where: {
						division: division,
						curriculumOrder: { gt: oldOrder }, // Ambil yang posisinya > lama
					},
					data: {
						curriculumOrder: { decrement: 1 }, // Geser naik (n - 1)
					},
				});
			}

			// LANGKAH B: "Siapkan" tempat di posisi baru (Buat Celah)
			// Jika posisi baru bukan null, geser course di posisi tersebut TURUN (increment)
			if (newOrder !== null) {
				await tx.course.updateMany({
					where: {
						division: division,
						curriculumOrder: { gte: newOrder }, // Ambil yang posisinya >= baru
					},
					data: {
						curriculumOrder: { increment: 1 }, // Geser turun (n + 1)
					},
				});
			}

			// LANGKAH C: Masukkan course ke posisi target
			await tx.course.update({
				where: { id: courseId },
				data: { curriculumOrder: newOrder },
			});
		});

		// 3. Revalidasi Global
		// Refresh dashboard user (agar lock terbuka/tertutup) dan admin table
		revalidatePath("/dashboard");
		revalidatePath("/admin/courses");

		return { status: "success", message: "Curriculum updated successfully" };
	} catch (error) {
		console.error("Reorder failed:", error);
		return { status: "error", message: "Failed to reorder curriculum" };
	}
}
