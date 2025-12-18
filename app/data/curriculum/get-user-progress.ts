import "server-only";

import prisma from "@/lib/db";

export async function getCurriculumProgress(
	userId: string,
	curriculumId: string
) {
	const totalCoreCount = await prisma.curriculumCourse.count({
		where: {
			curriculumId: curriculumId,
			type: "CORE",
		},
	});

	const completedCoreCount = await prisma.enrollment.count({
		where: {
			userId: userId,
			completedAt: { not: null },
			course: {
				curricula: {
					some: {
						curriculumId: curriculumId,
						type: "CORE",
					},
				},
			},
		},
	});

	let percentage = 0;
	if (totalCoreCount > 0) {
		percentage = Math.round((completedCoreCount / totalCoreCount) * 100);
	}

	const isCompleted =
		totalCoreCount > 0 && completedCoreCount >= totalCoreCount;

	return {
		percentage,
		totalCore: totalCoreCount,
		completedCore: completedCoreCount,
		isCompleted,
	};
}

export type CurriculumProgress = Awaited<
	ReturnType<typeof getCurriculumProgress>
>;
