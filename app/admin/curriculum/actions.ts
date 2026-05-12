"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/app/data/auth/require-session";
import prisma from "@/lib/db";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { Division, CurriculumCourseType } from "@/lib/generated/prisma/enums";

const aj = arcjet.withRule(
	fixedWindow({
		mode: "LIVE",
		window: "1m",
		max: 5,
	})
);

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

export async function createCurriculum(prevState: unknown, formData: FormData) {
	const session = await requireSession({ minRole: "ADMIN" });
	const user = session.user;

	const req = await request();
	const decision = await aj.protect(req, {
		fingerprint: user.id, // Rate limit per admin user
	});

	if (decision.isDenied()) {
		return { error: "Too many requests. Please try again later." };
	}

	const rawData = {
		title: formData.get("title"),
		slug: formData.get("slug"),
		division: formData.get("division"),
		description: formData.get("description"),
	};

	const validated = createCurriculumSchema.safeParse(rawData);
	if (!validated.success) {
		return { error: validated.error.flatten().fieldErrors };
	}

	const { title, slug, division, description } = validated.data;

	try {
		const existing = await prisma.curriculum.findUnique({
			where: { slug },
		});

		if (existing) {
			return { error: "Slug already exists. Please choose another one." };
		}

		await prisma.curriculum.create({
			data: {
				title,
				slug,
				division,
				description,
				status: "ACTIVE",
			},
		});

		await prisma.adminLog.create({
			data: {
				action: "CREATE_CURRICULUM",
				entity: "Curriculum",
				details: `Created curriculum ${title} (${division})`,
				userId: user.id,
			},
		});

		revalidatePath("/admin/curriculum");
		return { success: true };
	} catch (error) {
		console.error("[CREATE_CURRICULUM]", error);
		return { error: "Failed to create curriculum." };
	}
}

export async function updateCurriculumStructure(
	input: z.infer<typeof updateStructureSchema>
) {
	const session = await requireSession({ minRole: "ADMIN" });

	const validated = updateStructureSchema.safeParse(input);
	if (!validated.success) {
		return { error: "Invalid structure data" };
	}

	const { curriculumId, items } = validated.data;

	try {
		await prisma.$transaction(async (tx) => {
			// Note: Data enrollment user aman karena melekat pada Course, bukan Pivot.
			await tx.curriculumCourse.deleteMany({
				where: { curriculumId },
			});

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

		revalidatePath(`/admin/curriculum`);
		revalidatePath(`/admin/curriculum/${curriculumId}/design`);

		const curriculum = await prisma.curriculum.findUnique({
			where: { id: curriculumId },
			select: { title: true },
		});

		await prisma.adminLog.create({
			data: {
				action: "UPDATE_CURRICULUM_STRUCTURE",
				entity: "Curriculum",
				details: `Updated structure for curriculum ${curriculum?.title || curriculumId} (${items.length} items)`,
				userId: session.user.id,
			},
		});

		return { success: true };
	} catch (error) {
		console.error("[UPDATE_CURRICULUM_STRUCTURE]", error);
		return { error: "Failed to save curriculum structure." };
	}
}

export async function archiveCurriculum(curriculumId: string) {
	const session = await requireSession({ minRole: "ADMIN" });

	if (!curriculumId) return { error: "ID is required" };

	try {
		await prisma.curriculum.update({
			where: { id: curriculumId },
			data: { status: "ARCHIVED" },
		});

		const curriculum = await prisma.curriculum.findUnique({
			where: { id: curriculumId },
			select: { title: true },
		});

		await prisma.adminLog.create({
			data: {
				action: "ARCHIVE_CURRICULUM",
				entity: "Curriculum",
				details: `Archived curriculum ${curriculum?.title || curriculumId}`,
				userId: session.user.id,
			},
		});

		revalidatePath("/admin/curriculum");
		return { success: true };
	} catch (error) {
		console.error("[ARCHIVE_CURRICULUM]", error);
		return { error: "Failed to archive curriculum." };
	}
}
