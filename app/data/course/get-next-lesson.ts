import "server-only";

import prisma from "@/lib/db";

/**
 * Finds the first incomplete lesson for a user in a given course.
 * Returns the lesson ID, or undefined if no lessons exist.
 * If all lessons are complete, returns the first lesson ID.
 */
export async function getNextLesson(
	courseId: string,
	userId: string
): Promise<string | undefined> {
	const chapters = await prisma.chapter.findMany({
		where: { courseId },
		orderBy: { position: "asc" },
		select: {
			id: true,
			lessons: {
				orderBy: { position: "asc" },
				select: {
					id: true,
					lessonProgress: {
						where: { userId },
						select: { completed: true },
					},
				},
			},
		},
	});

	let firstLessonId: string | undefined;

	for (const chapter of chapters) {
		for (const lesson of chapter.lessons) {
			// Track the very first lesson as a fallback
			if (!firstLessonId) {
				firstLessonId = lesson.id;
			}

			// Check if this lesson is NOT completed
			const progress = lesson.lessonProgress[0];
			if (!progress || !progress.completed) {
				return lesson.id;
			}
		}
	}

	// All lessons completed, fallback to first lesson
	return firstLessonId;
}
