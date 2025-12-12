import "server-only";

import prisma from "@/lib/db";
import type { Division } from "@/lib/generated/prisma";

export type CourseState = "LOCKED" | "ACTIVE" | "COMPLETED" | "ACCESSIBLE";

export async function getCurriculumProgress(
	userId: string,
	division: Division
) {
	const allCourses = await prisma.course.findMany({
		where: {
			division: division,
			status: "Published",
		},
		select: {
			id: true,
			title: true,
			slug: true,
			fileKey: true,
			smallDescription: true,
			duration: true,
			level: true,
			category: true,
			curriculumOrder: true,
		},
		orderBy: {
			curriculumOrder: "asc",
		},
	});

	const userEnrollments = await prisma.enrollment.findMany({
		where: {
			userId: userId,
			course: {
				division: division,
			},
		},
		select: {
			courseId: true,
			completedAt: true,
			status: true,
		},
	});

	const getEnrollment = (courseId: string) =>
		userEnrollments.find((e) => e.courseId === courseId);

	const curriculumCourses = allCourses.filter(
		(c) => c.curriculumOrder !== null
	);
	const electiveCourses = allCourses.filter((c) => c.curriculumOrder === null);

	let activeFound = false;
	let isCurriculumCompleted = true;

	const curriculumWithState = curriculumCourses.map((course) => {
		const enrollment = getEnrollment(course.id);
		const isCompleted = !!enrollment?.completedAt;

		if (isCompleted) {
			return { ...course, state: "COMPLETED" as CourseState };
		}

		if (activeFound) {
			isCurriculumCompleted = false;
			return { ...course, state: "LOCKED" as CourseState };
		}

		activeFound = true;
		isCurriculumCompleted = false;
		return { ...course, state: "ACTIVE" as CourseState };
	});

	if (curriculumCourses.length === 0) {
		isCurriculumCompleted = true;
	}

	const electivesWithState = electiveCourses.map((course) => {
		const enrollment = getEnrollment(course.id);
		const isCompleted = !!enrollment?.completedAt;

		if (isCompleted) {
			return { ...course, state: "COMPLETED" as CourseState };
		}

		if (!isCurriculumCompleted) {
			return { ...course, state: "LOCKED" as CourseState };
		}

		return { ...course, state: "ACCESSIBLE" as CourseState };
	});

	return {
		curriculum: curriculumWithState,
		electives: electivesWithState,
		isCurriculumCompleted,
	};
}

export type CurriculumProgressType = Awaited<
	ReturnType<typeof getCurriculumProgress>
>;
