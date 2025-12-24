import "server-only";

import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { courseWithChaptersSelect } from "@/lib/prisma/selects";

/**
 * Get a course by slug with chapters and lessons.
 * For public/user facing views.
 */
export async function getCourse(slug: string) {
	const course = await prisma.course.findUnique({
		where: {
			slug: slug,
		},
		select: courseWithChaptersSelect,
	});

	if (!course) {
		return notFound();
	}

	return course;
}
