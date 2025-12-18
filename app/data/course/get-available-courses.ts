import prisma from "@/lib/db";
import { requireUser } from "@/app/data/user/require-user";
import { Division } from "@/lib/generated/prisma/enums";

export async function getAvailableCourses() {
	const user = await requireUser();

	if (!user.division) {
		return [];
	}

	const courses = await prisma.course.findMany({
		where: {
			division: user.division as Division,

			status: "Published",
			enrollment: {
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
			duration: true,
			level: true,
			category: true,
			slug: true,
			updatedAt: true,
			_count: {
				select: {
					chapter: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return courses;
}
