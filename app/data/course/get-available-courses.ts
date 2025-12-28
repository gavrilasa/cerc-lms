import "server-only";

import prisma from "@/lib/db";
import { requireSession } from "@/app/data/auth/require-session";
import { Division } from "@/lib/generated/prisma/enums";

export async function getAvailableCourses() {
	const { user } = await requireSession();

	if (!user.division) {
		return [];
	}

	const courses = await prisma.course.findMany({
		where: {
			division: user.division as Division,

			status: "PUBLISHED",
			enrollments: {
				none: {
					userId: user.id,
				},
			},
		},
		select: {
			id: true,
			title: true,
			smallDescription: true,
			fileKey: true,
			slug: true,
			updatedAt: true,
			_count: {
				select: {
					chapters: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return courses;
}
