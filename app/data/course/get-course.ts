import "server-only";

import prisma from "@/lib/db";
import { notFound } from "next/navigation";

export async function getCourse(slug: string) {
	const course = await prisma.course.findUnique({
		where: {
			slug: slug,
		},
		select: {
			id: true,
			title: true,
			description: true,
			fileKey: true,
			duration: true,
			level: true,
			category: true,
			smallDescription: true,
			division: true,
			status: true,
			updatedAt: true,
			slug: true,

			chapter: {
				select: {
					id: true,
					title: true,
					position: true,
					lessons: {
						select: {
							id: true,
							title: true,
							position: true,
						},
						orderBy: {
							position: "asc",
						},
					},
				},
				orderBy: {
					position: "asc",
				},
			},
		},
	});

	if (!course) {
		return notFound();
	}

	return course;
}
