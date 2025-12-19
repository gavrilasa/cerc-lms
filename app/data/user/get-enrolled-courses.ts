import "server-only";
import { requireUser } from "./require-user";
import prisma from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { checkRole, type AuthUser } from "@/lib/access-control";

export async function getEnrolledCourses() {
	const sessionUser = await requireUser();
	const user = sessionUser as AuthUser;

	const whereClause: Prisma.EnrollmentWhereInput = {
		userId: user.id,
		status: "Active",
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
					chapter: {
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
