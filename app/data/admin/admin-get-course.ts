import "server-only";

import { requireAdmin } from "./require-admin";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { courseWithDetailedChaptersSelect } from "@/lib/prisma/selects";

/**
 * Get a course by ID with detailed chapters and lessons.
 * For admin views. Requires ADMIN role.
 */
export async function adminGetCourse(id: string) {
	await requireAdmin();

	const data = await prisma.course.findUnique({
		where: {
			id: id,
		},
		select: courseWithDetailedChaptersSelect,
	});

	if (!data) {
		return notFound();
	}

	return data;
}

export type AdminCourseSingularType = Awaited<
	ReturnType<typeof adminGetCourse>
>;
