import "server-only";

import prisma from "@/lib/db";
import { requireSession } from "@/app/data/auth/require-session";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS, CACHE_TTL } from "@/lib/cache";

// Cached aggregate stats
const getCachedStats = unstable_cache(
	async () => {
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
	},
	["admin-dashboard-stats"],
	{
		revalidate: CACHE_TTL.ADMIN_STATS,
		tags: [CACHE_TAGS.ADMIN_STATS],
	}
);

export async function adminGetDashboardStats() {
	await requireSession({ minRole: "MENTOR" });
	return getCachedStats();
}
