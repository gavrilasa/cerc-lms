"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/app/data/admin/require-admin";
import prisma from "@/lib/db";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { Division, CurriculumCourseType } from "@/lib/generated/prisma/enums";

// -----------------------------------------------------------------------------
// 1. Configuration & Schemas
// -----------------------------------------------------------------------------

// Rate Limiting: Mencegah spam pembuatan kurikulum
const aj = arcjet.withRule(
	fixedWindow({
		mode: "LIVE",
		window: "1m",
		max: 5,
	})
);

// Schema untuk Create Curriculum (FormData)
const createCurriculumSchema = z.object({
	title: z.string().min(3, "Title must be at least 3 characters"),
	slug: z
		.string()
		.regex(
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
			"Slug must be lowercase and dash-separated"
		),
	division: z.nativeEnum(Division),
	description: z.string().min(10, "Description is too short"),
});

// Schema untuk Update Structure (JSON Payload from Designer)
const updateStructureSchema = z.object({
	curriculumId: z.string().uuid(),
	items: z.array(
		z.object({
			courseId: z.string().uuid(),
			type: z.nativeEnum(CurriculumCourseType),
			order: z.number().int(),
		})
	),
});

// -----------------------------------------------------------------------------
// 2. Server Actions
// -----------------------------------------------------------------------------

/**
 * Membuat kurikulum baru.
 * Dipanggil dari CreateCurriculumDialog.
 */
export async function createCurriculum(prevState: unknown, formData: FormData) {
	// A. Auth & Rate Limit Check
	const session = await requireAdmin();
	const user = session.user;

	const req = await request();
	const decision = await aj.protect(req, {
		fingerprint: user.id, // Rate limit per admin user
	});

	if (decision.isDenied()) {
		return { error: "Too many requests. Please try again later." };
	}

	// B. Parse & Validate Input
	const rawData = {
		title: formData.get("title"),
		slug: formData.get("slug"),
		division: formData.get("division"),
		description: formData.get("description"),
	};

	const validated = createCurriculumSchema.safeParse(rawData);
	if (!validated.success) {
		// Return flat errors for simple handling on client
		return { error: validated.error.flatten().fieldErrors };
	}

	const { title, slug, division, description } = validated.data;

	try {
		// C. Unique Check
		const existing = await prisma.curriculum.findUnique({
			where: { slug },
		});

		if (existing) {
			return { error: "Slug already exists. Please choose another one." };
		}

		// D. Database Creation
		await prisma.curriculum.create({
			data: {
				title,
				slug,
				division,
				description,
				status: "ACTIVE",
			},
		});

		revalidatePath("/admin/curriculum");
		return { success: true };
	} catch (error) {
		console.error("[CREATE_CURRICULUM]", error);
		return { error: "Failed to create curriculum." };
	}
}

/**
 * Menyimpan struktur kurikulum (Reorder, Add, Remove, Type Change).
 * Menggunakan strategi "Delete All & Re-Insert" dalam satu transaksi.
 * Dipanggil dari CurriculumDesignBuilder.
 */
export async function updateCurriculumStructure(
	input: z.infer<typeof updateStructureSchema>
) {
	await requireAdmin();

	const validated = updateStructureSchema.safeParse(input);
	if (!validated.success) {
		return { error: "Invalid structure data" };
	}

	const { curriculumId, items } = validated.data;

	try {
		await prisma.$transaction(async (tx) => {
			// 1. Hapus semua pivot existing untuk kurikulum ini
			// Note: Data enrollment user aman karena melekat pada Course, bukan Pivot.
			await tx.curriculumCourse.deleteMany({
				where: { curriculumId },
			});

			// 2. Insert ulang sesuai urutan baru
			if (items.length > 0) {
				await tx.curriculumCourse.createMany({
					data: items.map((item) => ({
						curriculumId,
						courseId: item.courseId,
						type: item.type,
						order: item.order,
					})),
				});
			}
		});

		// Revalidate halaman list dan halaman designer
		revalidatePath(`/admin/curriculum`);
		revalidatePath(`/admin/curriculum/${curriculumId}/design`);

		return { success: true };
	} catch (error) {
		console.error("[UPDATE_CURRICULUM_STRUCTURE]", error);
		return { error: "Failed to save curriculum structure." };
	}
}

/**
 * Mengarsipkan kurikulum (Soft Delete).
 * Dipanggil dari Dropdown menu di list kurikulum.
 */
export async function archiveCurriculum(curriculumId: string) {
	await requireAdmin();

	if (!curriculumId) return { error: "ID is required" };

	try {
		await prisma.curriculum.update({
			where: { id: curriculumId },
			data: { status: "ARCHIVED" },
		});

		revalidatePath("/admin/curriculum");
		return { success: true };
	} catch (error) {
		console.error("[ARCHIVE_CURRICULUM]", error);
		return { error: "Failed to archive curriculum." };
	}
}
