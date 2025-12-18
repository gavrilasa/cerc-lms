import "server-only";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Prisma } from "@/lib/generated/prisma/client";
import { checkRole, type AuthUser } from "@/lib/access-control";

export async function adminGetCourses() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session || !session.user) {
		return redirect("/login");
	}

	const user = session.user as AuthUser;

	if (!checkRole(user, "MENTOR")) {
		return redirect("/dashboard");
	}

	const whereClause: Prisma.CourseWhereInput = {};

	if (user.role === "MENTOR") {
		whereClause.division = user.division ?? undefined;
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
			division: true,
		},
	});

	return data;
}

export type AdminCourseType = Awaited<ReturnType<typeof adminGetCourses>>[0];
