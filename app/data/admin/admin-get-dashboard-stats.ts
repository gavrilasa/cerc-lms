import "server-only";

import prisma from "@/lib/db";
import { requireSession } from "@/app/data/auth/require-session";

export async function adminGetDashboardStats() {
	await requireSession({ minRole: "ADMIN" });

	const [totalSignups, totalEnrolledUsers, totalCourses, totalLessons] =
		await Promise.all([
			prisma.user.count(),
			prisma.user.count({
				where: {
					enrollments: {
						some: {},
					},
				},
			}),

			prisma.course.count(),

			prisma.lesson.count(),
		]);

	return {
		totalSignups,
		totalEnrolledUsers,
		totalCourses,
		totalLessons,
	};
}
