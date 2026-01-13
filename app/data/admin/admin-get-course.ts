import "server-only";

import { requireSession } from "@/app/data/auth/require-session";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { courseWithDetailedChaptersSelect } from "@/lib/prisma/selects";

/**
 * Get a course by ID with detailed chapters and lessons.
 * For admin views. Requires ADMIN role.
 */
export async function adminGetCourse(id: string) {
	// 1. Minimum role: MENTOR
	const session = await requireSession({ minRole: "MENTOR" });
	const user = session.user;

	const data = await prisma.course.findUnique({
		where: {
			id: id,
		},
		select: courseWithDetailedChaptersSelect,
	});

	if (!data) {
		return notFound();
	}

	// 2. Access Control: If user is MENTOR (not ADMIN), check division
	if (user.role !== "ADMIN" && data.division !== user.division) {
		// Or redirect to unauthorized page/dashboard
		return notFound();
	}

	return data;
}

export type AdminCourseSingularType = Awaited<
	ReturnType<typeof adminGetCourse>
>;
