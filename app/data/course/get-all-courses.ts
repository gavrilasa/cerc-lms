import "server-only";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Prisma } from "@/lib/generated/prisma/client";
import { Division } from "@/lib/generated/prisma/enums";
import type { AuthUser } from "@/lib/access-control";

type GetAllCoursesOptions = {
	divisionFilter?: Division;
	excludeCurriculumId?: string;
};

export async function getAllCourses({
	divisionFilter,
	excludeCurriculumId,
}: GetAllCoursesOptions = {}) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session || !session.user) {
		return [];
	}

	const user = session.user as AuthUser;

	const whereClause: Prisma.CourseWhereInput = {
		status: "Published",
	};

	if (divisionFilter) {
		whereClause.division = divisionFilter;
	} else if (user.role !== "ADMIN") {
		if (!user.division) return [];
		whereClause.division = user.division;
	}

	if (excludeCurriculumId) {
		whereClause.curricula = {
			none: {
				curriculumId: excludeCurriculumId,
			},
		};
	}

	const data = await prisma.course.findMany({
		where: whereClause,
		orderBy: {
			createdAt: "desc",
		},
		select: {
			id: true,
			title: true,
			smallDescription: true,
			status: true,
			fileKey: true,
			slug: true,
			division: true,
		},
	});

	return data;
}

export type PublicCourseType = Awaited<ReturnType<typeof getAllCourses>>[0];
