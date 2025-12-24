import "server-only";

import prisma from "@/lib/db";

/**
 * Check if a user is enrolled in a specific course.
 *
 * @param userId - The user's ID
 * @param courseId - The course's ID
 * @returns The enrollment object if found, null otherwise
 */
export async function checkUserEnrollment(userId: string, courseId: string) {
	const enrollment = await prisma.enrollment.findUnique({
		where: {
			userId_courseId: {
				userId: userId,
				courseId: courseId,
			},
		},
	});

	return enrollment;
}

/**
 * Check if a user is actively enrolled in a course (status is ACTIVE).
 *
 * @param userId - The user's ID
 * @param courseId - The course's ID
 * @returns true if user has active enrollment, false otherwise
 */
export async function isUserActivelyEnrolled(
	userId: string,
	courseId: string
): Promise<boolean> {
	const enrollment = await checkUserEnrollment(userId, courseId);
	return enrollment?.status === "ACTIVE";
}
