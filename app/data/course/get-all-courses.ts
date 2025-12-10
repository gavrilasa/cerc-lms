import "server-only";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Prisma } from "@/lib/generated/prisma";
import type { AuthUser } from "@/lib/access-control";

export async function getAllCourses() {
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

	if (user.role !== "ADMIN") {
		if (!user.division) return [];
		whereClause.division = user.division;
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
			duration: true,
			level: true,
			status: true,
			fileKey: true,
			slug: true,
			category: true,
			division: true,
		},
	});

	return data;
}

export type PublicCourseType = Awaited<ReturnType<typeof getAllCourses>>[0];
