import "server-only";

import prisma from "@/lib/db";
import { requireSession } from "@/app/data/auth/require-session";

export async function adminGetRecentCourses() {
	await requireSession({ minRole: "ADMIN" });

	const data = await prisma.course.findMany({
		orderBy: {
			createdAt: "desc",
		},
		take: 2,
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
