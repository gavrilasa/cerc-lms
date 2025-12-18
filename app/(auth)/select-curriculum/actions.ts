"use server";

import { z } from "zod";
import { requireUser } from "@/app/data/user/require-user";
import prisma from "@/lib/db";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";

const aj = arcjet.withRule(
	fixedWindow({
		mode: "LIVE",
		window: "1m",
		max: 3,
	})
);

const selectCurriculumSchema = z.object({
	curriculumId: z.string().uuid("Invalid curriculum ID"),
});

// -----------------------------------------------------------------------------
// Server Actions
// -----------------------------------------------------------------------------

/**
 * Menyimpan pilihan kurikulum user saat onboarding.
 * Melakukan validasi ketat agar user hanya bisa memilih kurikulum sesuai divisinya.
 */
export async function selectCurriculum(
	input: z.infer<typeof selectCurriculumSchema>
) {
	const user = await requireUser();

	// Mencegah brute-force atau abuse pada endpoint ini
	const req = await request();
	const decision = await aj.protect(req, {
		fingerprint: user.id,
	});

	if (decision.isDenied()) {
		return { error: "Too many requests. Please try again later." };
	}

	// 3. Input Validation
	const validated = selectCurriculumSchema.safeParse(input);
	if (!validated.success) {
		return { error: "Invalid input data." };
	}

	const { curriculumId } = validated.data;

	try {
		// Pastikan user sudah VERIFIED (Hanya member resmi yang boleh pilih kurikulum)
		const dbUser = await prisma.user.findUnique({
			where: { id: user.id },
			select: {
				status: true,
				division: true,
				selectedCurriculumId: true,
			},
		});

		if (!dbUser) {
			return { error: "User not found." };
		}

		if (dbUser.status !== "VERIFIED") {
			return { error: "Your account is not verified yet." };
		}

		// Idempotency Check: Tolak jika user sudah pernah memilih kurikulum
		if (dbUser.selectedCurriculumId) {
			return { error: "You have already selected a curriculum." };
		}

		if (!dbUser.division) {
			return { error: "Your account does not belong to any division." };
		}

		// Ambil detail kurikulum target
		const curriculum = await prisma.curriculum.findUnique({
			where: { id: curriculumId },
			select: { division: true, status: true },
		});

		if (!curriculum) {
			return { error: "Curriculum not found." };
		}

		// Pastikan kurikulum AKTIF
		if (curriculum.status !== "ACTIVE") {
			return { error: "This curriculum is no longer available." };
		}

		// Cek Kesesuaian Divisi
		if (curriculum.division !== dbUser.division) {
			return {
				error: `Invalid curriculum. You are in '${dbUser.division}' division but requested a '${curriculum.division}' curriculum.`,
			};
		}

		// 6. Database Update
		await prisma.user.update({
			where: { id: user.id },
			data: {
				selectedCurriculumId: curriculumId,
				curriculumStatus: "IN_PROGRESS",
			},
		});

		return { success: true };
	} catch (error) {
		console.error("[SELECT_CURRICULUM_ERROR]", error);
		return { error: "Failed to select curriculum. Please try again." };
	}
}
