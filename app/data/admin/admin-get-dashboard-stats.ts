import "server-only";

import prisma from "@/lib/db";
import { requireAdmin } from "./require-admin";

export async function adminGetDashboardStats() {
	await requireAdmin();

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
