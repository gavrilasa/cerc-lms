import "server-only";
import { requireSession } from "@/app/data/auth/require-session";
import prisma from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { checkRole, type AuthUser } from "@/lib/access-control";

export async function getEnrolledCourses() {
	const session = await requireSession();
	const user = session.user as AuthUser;

	const whereClause: Prisma.EnrollmentWhereInput = {
		userId: user.id,
		status: "ACTIVE",
	};

	if (!checkRole(user, "ADMIN")) {
		if (user.division) {
			whereClause.course = {
				division: user.division,
			};
		} else {
			return [];
		}
	}

	const data = await prisma.enrollment.findMany({
		where: whereClause,
		select: {
			course: {
				select: {
					id: true,
					smallDescription: true,
					title: true,
					fileKey: true,
					slug: true,
					chapters: {
						select: {
							id: true,
							lessons: {
								select: {
									id: true,
									lessonProgress: {
										where: {
											userId: user.id,
										},
										select: {
											id: true,
											completed: true,
											lessonId: true,
										},
									},
								},
							},
						},
					},
				},
			},
		},
	});

	return data;
}

export type EnrolledCourseType = Awaited<
	ReturnType<typeof getEnrolledCourses>
>[0];
