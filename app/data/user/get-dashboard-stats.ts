import "server-only";
import { requireSession } from "@/app/data/auth/require-session";
import prisma from "@/lib/db";
import { AuthUser } from "@/lib/access-control";

export async function getDashboardStats() {
	const session = await requireSession();
	const user = session.user as AuthUser;

	const [completedCourses, activeCourses, totalSubmissions] = await Promise.all(
		[
			prisma.enrollment.count({
				where: {
					userId: user.id,
					completedAt: {
						not: null,
					},
				},
			}),
			prisma.enrollment.count({
				where: {
					userId: user.id,
					status: "ACTIVE",
					completedAt: null,
				},
			}),
			prisma.submission.count({
				where: {
					userId: user.id,
				},
			}),
		]
	);

	return {
		totalPoints: user.totalPoints ?? 0,
		completedCourses,
		activeCourses,
		totalSubmissions,
		user,
	};
}
