import prisma from "@/lib/db";
import { notFound } from "next/navigation";

export async function getCourseBySlug(slug: string) {
	const course = await prisma.course.findUnique({
		where: {
			slug: slug,
			status: "Published",
		},
		select: {
			id: true,
			title: true,
			slug: true,
			description: true,
			smallDescription: true,
			fileKey: true,
			division: true,
			chapter: {
				where: {
					lessons: {
						some: {},
					},
				},
				orderBy: {
					position: "asc",
				},
				select: {
					id: true,
					title: true,
					lessons: {
						orderBy: {
							position: "asc",
						},
						select: {
							id: true,
							title: true,
						},
					},
				},
			},
		},
	});

	if (!course) {
		return notFound();
	}

	return course;
}
