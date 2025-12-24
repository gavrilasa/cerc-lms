import "server-only";
import prisma from "@/lib/db";

export async function getUserCurriculumDetails(userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			selectedCurriculumId: true,
			curriculumStatus: true,
		},
	});

	if (!user || !user.selectedCurriculumId) {
		return null;
	}

	const curriculumData = await prisma.curriculum.findUnique({
		where: {
			id: user.selectedCurriculumId,
		},
		include: {
			courses: {
				include: {
					course: {
						select: {
							id: true,
							title: true,
							slug: true,
							fileKey: true,
							createdAt: true,
							updatedAt: true,
							smallDescription: true,
							description: true,
							division: true,
							userId: true,
							status: true,
							chapters: {
								select: {
									lessons: {
										select: { id: true },
									},
								},
							},
							enrollments: {
								where: {
									userId: userId,
								},
								select: {
									id: true,
									status: true,
									completedAt: true,
									createdAt: true,
									updatedAt: true,
									userId: true,
									courseId: true,
								},
							},
						},
					},
				},
			},
		},
	});

	if (!curriculumData) return null;

	const allProcessedCourses = curriculumData.courses.map((pivot) => {
		const course = pivot.course;
		const enrollment = course.enrollments[0];

		let enrollmentStatus: "NotStarted" | "Active" | "Completed" = "NotStarted";
		if (enrollment) {
			if (enrollment.completedAt) {
				enrollmentStatus = "Completed";
			} else {
				enrollmentStatus = "Active";
			}
		}

		let isLocked = false;
		if (pivot.type === "CORE") {
			isLocked = false;
		} else {
			isLocked = user.curriculumStatus !== "COMPLETED";
		}

		const totalLessons = course.chapters.reduce(
			(acc, ch) => acc + ch.lessons.length,
			0
		);

		return {
			id: course.id,
			title: course.title,
			slug: course.slug,
			fileKey: course.fileKey,
			smallDescription: course.smallDescription,
			description: course.description,
			division: course.division,
			userId: course.userId,
			createdAt: course.createdAt,
			updatedAt: course.updatedAt,
			status: course.status,

			enrollmentStatus: enrollmentStatus,
			isLocked: isLocked,
			type: pivot.type,
			order: pivot.order,

			_count: {
				lessons: totalLessons,
			},
			lessons: [],
			enrollments: course.enrollments,
		};
	});

	const coreCourses = allProcessedCourses
		.filter((c) => c.type === "CORE")
		.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

	const electiveCourses = allProcessedCourses
		.filter((c) => c.type === "ELECTIVE")
		.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

	return {
		curriculumInfo: {
			id: curriculumData.id,
			title: curriculumData.title,
			description: curriculumData.description,
		},
		coreCourses,
		electiveCourses,
		userStatus: user.curriculumStatus,
	};
}

export type UserCurriculumDetails = NonNullable<
	Awaited<ReturnType<typeof getUserCurriculumDetails>>
>;

export type DashboardCourse = UserCurriculumDetails["coreCourses"][0];
