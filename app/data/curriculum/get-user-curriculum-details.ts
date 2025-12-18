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
							duration: true,
							level: true,
							createdAt: true,
							smallDescription: true,
							category: true,
							enrollment: {
								where: {
									userId: userId,
								},
								select: {
									status: true,
									completedAt: true,
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
		const enrollment = course.enrollment[0];

		let status: "NotStarted" | "Active" | "Completed" = "NotStarted";
		if (enrollment) {
			if (enrollment.completedAt) {
				status = "Completed";
			} else {
				status = "Active";
			}
		}

		let isLocked = false;
		if (pivot.type === "CORE") {
			isLocked = false;
		} else {
			isLocked = user.curriculumStatus !== "COMPLETED";
		}

		return {
			id: course.id,
			title: course.title,
			slug: course.slug,
			thumbnail: course.fileKey, // Mapping fileKey ke thumbnail
			duration: course.duration,
			level: course.level,
			smallDescription: course.smallDescription,
			category: course.category,
			status: status,
			isLocked: isLocked,
			type: pivot.type,
			order: pivot.order,
			createdAt: course.createdAt,
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
