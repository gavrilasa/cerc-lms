import "server-only";

import prisma from "@/lib/db";
import type { Division } from "@/lib/generated/prisma/enums";

export async function getCurriculumByDivision(division: Division) {
	try {
		const curricula = await prisma.curriculum.findMany({
			where: {
				division: division,
				status: "ACTIVE",
			},
			select: {
				id: true,
				title: true,
				slug: true,
				description: true,
				_count: {
					select: {
						courses: true,
					},
				},
				courses: {
					select: {
						order: true,
						course: {
							select: {
								id: true,
								title: true,
							},
						},
					},
					orderBy: {
						order: "asc",
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return curricula;
	} catch (error) {
		console.error("[GET_CURRICULUM_BY_DIVISION]", error);
		return [];
	}
}

export type CurriculumOption = Awaited<
	ReturnType<typeof getCurriculumByDivision>
>[0];
