"use server";

import { requireSession } from "@/app/data/auth/require-session";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import prisma from "@/lib/db";
import { Division } from "@/lib/generated/prisma/enums";
import { ApiResponse } from "@/lib/types";
import {
	chapterSchema,
	ChapterSchemaType,
	courseSchema,
	CourseSchemaType,
	lessonSchema,
	LessonSchemaType,
} from "@/lib/zodSchemas";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";

const aj = arcjet.withRule(
	fixedWindow({
		mode: "LIVE",
		window: "1m",
		max: 5,
	})
);

export async function editCourse(
	data: CourseSchemaType,
	courseId: string
): Promise<ApiResponse> {
	const { user } = await requireSession({ minRole: "MENTOR" });

	try {
		const req = await request();

		const decision = await aj.protect(req, {
			fingerprint: user.id,
		});

		if (decision.isDenied()) {
			if (decision.reason.isRateLimit()) {
				return {
					status: "error",
					message: "You have been blocked due to rate limiting",
				};
			} else {
				return {
					status: "error",
					message: "Looks like you are a malicious user",
				};
			}
		}

		const result = courseSchema.safeParse(data);
		if (!result.success) {
			return {
				status: "error",
				message: "Invalid Data",
			};
		}

		// Fetch course to check ownership and division
		const course = await prisma.course.findUnique({
			where: { id: courseId },
			select: { userId: true, division: true, title: true },
		});

		if (!course) {
			return {
				status: "error",
				message: "Course not found",
			};
		}

		// Check ownership: MENTOR can only edit their own courses, ADMIN can edit any
		if (user.role !== "ADMIN" && course.userId !== user.id) {
			return {
				status: "error",
				message: "Unauthorized: You can only edit courses you created",
			};
		}

		// Check division access for MENTOR
		if (user.role !== "ADMIN" && course.division !== user.division) {
			return {
				status: "error",
				message: "Unauthorized: Different division",
			};
		}

		const division = result.data.division
			? (result.data.division as Division)
			: undefined;

		await prisma.course.update({
			where: {
				id: courseId,
			},
			data: {
				...result.data,
				division: division,
			},
		});

		// [NEW] Log the action
		await prisma.adminLog.create({
			data: {
				action: "UPDATE_COURSE",
				entity: "Course",
				details: `Updated course ${result.data.title || courseId}`,
				userId: user.id,
			},
		});

		return {
			status: "success",
			message: "Course updated Successfully",
		};
	} catch (error) {
		console.error("[EDIT_COURSE_ERROR]", error);
		return {
			status: "error",
			message: "Failed to Update Course",
		};
	}
}

export async function reorderLessons(
	chapterId: string,
	lessons: {
		id: string;
		position: number;
	}[],
	courseId: string
): Promise<ApiResponse> {
	const { user } = await requireSession({ minRole: "MENTOR" });

	try {
		if (!lessons || lessons.length === 0) {
			return {
				status: "error",
				message: "No lessons provided for reordering",
			};
		}

		// Fetch course to check division and ownership
		const course = await prisma.course.findUnique({
			where: { id: courseId },
			select: { userId: true, division: true, title: true },
		});

		if (!course) {
			return {
				status: "error",
				message: "Course not found",
			};
		}

		// Check ownership: MENTOR can only reorder their own courses, ADMIN can reorder any
		if (user.role !== "ADMIN" && course.userId !== user.id) {
			return {
				status: "error",
				message: "Unauthorized: You can only reorder lessons in courses you created",
			};
		}

		// Check division access for MENTOR
		if (user.role !== "ADMIN" && course.division !== user.division) {
			return {
				status: "error",
				message: "Unauthorized: Different division",
			};
		}

		const updates = lessons.map((lesson) =>
			prisma.lesson.update({
				where: {
					id: lesson.id,
					chapterId: chapterId,
				},
				data: {
					position: lesson.position,
				},
			})
		);

		await prisma.$transaction(updates);

		// Log the action
		await prisma.adminLog.create({
			data: {
				action: "REORDER_LESSONS",
				entity: "Lesson",
				details: `Reordered lessons in course ${course.title || courseId}`,
				userId: user.id,
			},
		});

		revalidatePath(`/admin/courses/${courseId}/edit`);

		return {
			status: "success",
			message: "Lessons reordered successfully",
		};
	} catch {
		return {
			status: "error",
			message: "Failed to reorder lessons.",
		};
	}
}

export async function reorderChapters(
	courseId: string,
	chapters: {
		id: string;
		position: number;
	}[]
): Promise<ApiResponse> {
	const { user } = await requireSession({ minRole: "MENTOR" });

	try {
		if (!chapters || chapters.length === 0) {
			return {
				status: "error",
				message: "No chapters provided for reordering",
			};
		}

		// Fetch course to check division and ownership
		const course = await prisma.course.findUnique({
			where: { id: courseId },
			select: { userId: true, division: true, title: true },
		});

		if (!course) {
			return {
				status: "error",
				message: "Course not found",
			};
		}

		// Check ownership: MENTOR can only reorder their own courses, ADMIN can reorder any
		if (user.role !== "ADMIN" && course.userId !== user.id) {
			return {
				status: "error",
				message: "Unauthorized: You can only reorder chapters in courses you created",
			};
		}

		// Check division access for MENTOR
		if (user.role !== "ADMIN" && course.division !== user.division) {
			return {
				status: "error",
				message: "Unauthorized: Different division",
			};
		}

		const updates = chapters.map((chapter) =>
			prisma.chapter.update({
				where: {
					id: chapter.id,
					courseId: courseId,
				},
				data: {
					position: chapter.position,
				},
			})
		);

		await prisma.$transaction(updates);

		// Log the action
		await prisma.adminLog.create({
			data: {
				action: "REORDER_CHAPTERS",
				entity: "Chapter",
				details: `Reordered chapters in course ${course.title || courseId}`,
				userId: user.id,
			},
		});

		revalidatePath(`/admin/courses/${courseId}/edit`);

		return {
			status: "success",
			message: "Chapters reorded successfully",
		};
	} catch {
		return {
			status: "error",
			message: "Failed to reorder chapters",
		};
	}
}

export async function createChapter(
	values: ChapterSchemaType
): Promise<ApiResponse> {
	const { user } = await requireSession({ minRole: "MENTOR" });
	try {
		const result = chapterSchema.safeParse(values);

		if (!result.success) {
			return {
				status: "error",
				message: "Invalid data",
			};
		}

		// Fetch course to check division and ownership
		const course = await prisma.course.findUnique({
			where: { id: result.data.courseId },
			select: { userId: true, division: true, title: true },
		});

		if (!course) {
			return {
				status: "error",
				message: "Course not found",
			};
		}

		// Check ownership: MENTOR can only add chapters to their own courses, ADMIN can add to any
		if (user.role !== "ADMIN" && course.userId !== user.id) {
			return {
				status: "error",
				message: "Unauthorized: You can only add chapters to courses you created",
			};
		}

		// Check division access for MENTOR
		if (user.role !== "ADMIN" && course.division !== user.division) {
			return {
				status: "error",
				message: "Unauthorized: Different division",
			};
		}

		await prisma.$transaction(async (tx) => {
			const maxPos = await tx.chapter.findFirst({
				where: {
					courseId: result.data.courseId,
				},
				select: {
					position: true,
				},
				orderBy: {
					position: "desc",
				},
			});

			return await tx.chapter.create({
				data: {
					title: result.data.title,
					courseId: result.data.courseId,
					position: (maxPos?.position ?? 0) + 1,
				},
			});
		});

		// Log the action
		await prisma.adminLog.create({
			data: {
				action: "CREATE_CHAPTER",
				entity: "Chapter",
				details: `Created chapter "${result.data.title}" in course "${course.title}"`,
				userId: user.id,
			},
		});

		revalidatePath(`/admin/courses/${result.data.courseId}/edit`);

		return {
			status: "success",
			message: "Chapter Created Successfully",
		};
	} catch {
		return {
			status: "error",
			message: "Failed to create chapter",
		};
	}
}

export async function createLesson(
	// PERBAIKAN: Menggunakan LessonSchemaType, bukan ChapterSchemaType
	values: LessonSchemaType
): Promise<ApiResponse> {
	const { user } = await requireSession({ minRole: "MENTOR" });
	try {
		const result = lessonSchema.safeParse(values);

		if (!result.success) {
			return {
				status: "error",
				message: "Invalid data",
			};
		}

		// Fetch chapter with course to check division and ownership
		const chapter = await prisma.chapter.findUnique({
			where: { id: result.data.chapterId },
			include: {
				course: {
					select: { userId: true, division: true, title: true },
				},
			},
		});

		if (!chapter) {
			return {
				status: "error",
				message: "Chapter not found",
			};
		}

		// Check ownership: MENTOR can only add lessons to their own courses, ADMIN can add to any
		if (user.role !== "ADMIN" && chapter.course.userId !== user.id) {
			return {
				status: "error",
				message: "Unauthorized: You can only add lessons to courses you created",
			};
		}

		// Check division access for MENTOR
		if (user.role !== "ADMIN" && chapter.course.division !== user.division) {
			return {
				status: "error",
				message: "Unauthorized: Different division",
			};
		}

		await prisma.$transaction(async (tx) => {
			const maxPos = await tx.lesson.findFirst({
				where: {
					chapterId: result.data.chapterId,
				},
				select: {
					position: true,
				},
				orderBy: {
					position: "desc",
				},
			});

			return await tx.lesson.create({
				data: {
					title: result.data.title, // Menggunakan title
					description: result.data.description,
					// Hapus videoKey dan thumbnailKey
					chapterId: result.data.chapterId,
					position: (maxPos?.position ?? 0) + 1,
				},
			});
		});

		// Log the action
		await prisma.adminLog.create({
			data: {
				action: "CREATE_LESSON",
				entity: "Lesson",
				details: `Created lesson "${result.data.title}" in chapter "${chapter.title}" of course "${chapter.course.title}"`,
				userId: user.id,
			},
		});

		revalidatePath(`/admin/courses/${result.data.courseId}/edit`);

		return {
			status: "success",
			message: "Lesson Created Successfully",
		};
	} catch {
		return {
			status: "error",
			message: "Failed to create lesson",
		};
	}
}

export async function deleteLesson({
	chapterId,
	courseId,
	lessonId,
}: {
	chapterId: string;
	courseId: string;
	lessonId: string;
}): Promise<ApiResponse> {
	const { user } = await requireSession({ minRole: "MENTOR" });
	try {
		// Fetch lesson with chapter and course to check ownership
		const lesson = await prisma.lesson.findUnique({
			where: { id: lessonId },
			include: {
				chapter: {
					include: {
						course: {
							select: { userId: true, division: true, title: true },
						},
					},
				},
			},
		});

		if (!lesson) {
			return {
				status: "error",
				message: "Lesson not found",
			};
		}

		// Check ownership: MENTOR can only delete lessons from their own courses, ADMIN can delete any
		if (user.role !== "ADMIN" && lesson.chapter.course.userId !== user.id) {
			return {
				status: "error",
				message: "Unauthorized: You can only delete lessons from courses you created",
			};
		}

		// Check division access for MENTOR
		if (user.role !== "ADMIN" && lesson.chapter.course.division !== user.division) {
			return {
				status: "error",
				message: "Unauthorized: Different division",
			};
		}

		const chapterWithLessons = await prisma.chapter.findUnique({
			where: {
				id: chapterId,
			},
			select: {
				lessons: {
					orderBy: {
						position: "asc",
					},
					select: {
						id: true,
						position: true,
					},
				},
			},
		});

		if (!chapterWithLessons) {
			return {
				status: "error",
				message: "Chapter not Found",
			};
		}

		const lessons = chapterWithLessons.lessons;

		const lessonToDelete = lessons.find((lesson) => lesson.id === lessonId);

		if (!lessonToDelete) {
			return {
				status: "error",
				message: "Lesson not found in the chapter.",
			};
		}

		const remainingLessons = lessons.filter((lesson) => lesson.id !== lessonId);

		const updates = remainingLessons.map((lesson, index) => {
			return prisma.lesson.update({
				where: { id: lesson.id },
				data: { position: index + 1 },
			});
		});

		await prisma.$transaction([
			...updates,
			prisma.lesson.delete({
				where: {
					id: lessonId,
					chapterId: chapterId,
				},
			}),
		]);

		// Log the action
		await prisma.adminLog.create({
			data: {
				action: "DELETE_LESSON",
				entity: "Lesson",
				details: `Deleted lesson "${lesson.title}" from chapter "${lesson.chapter.title}" of course "${lesson.chapter.course.title}"`,
				userId: user.id,
			},
		});

		revalidatePath(`/admin/courses/${courseId}/edit`);

		return {
			status: "success",
			message: "Lesson deleted and positions reordered successfully",
		};
	} catch {
		return {
			status: "error",
			message: "Failed to delete lesson",
		};
	}
}

export async function deleteChapter({
	chapterId,
	courseId,
}: {
	chapterId: string;
	courseId: string;
}): Promise<ApiResponse> {
	const { user } = await requireSession({ minRole: "MENTOR" });
	try {
		// Fetch chapter with course to check ownership
		const chapter = await prisma.chapter.findUnique({
			where: { id: chapterId },
			include: {
				course: {
					select: { userId: true, division: true, title: true },
				},
			},
		});

		if (!chapter) {
			return {
				status: "error",
				message: "Chapter not found",
			};
		}

		// Check ownership: MENTOR can only delete chapters from their own courses, ADMIN can delete any
		if (user.role !== "ADMIN" && chapter.course.userId !== user.id) {
			return {
				status: "error",
				message: "Unauthorized: You can only delete chapters from courses you created",
			};
		}

		// Check division access for MENTOR
		if (user.role !== "ADMIN" && chapter.course.division !== user.division) {
			return {
				status: "error",
				message: "Unauthorized: Different division",
			};
		}

		const courseWithChapters = await prisma.course.findUnique({
			where: {
				id: courseId,
			},
			select: {
				chapters: {
					orderBy: {
						position: "asc",
					},
					select: {
						id: true,
						position: true,
					},
				},
			},
		});

		if (!courseWithChapters) {
			return {
				status: "error",
				message: "Course not Found",
			};
		}

		const chapters = courseWithChapters.chapters;

		const chapterToDelete = chapters.find(
			(chapter) => chapter.id === chapterId
		);

		if (!chapterToDelete) {
			return {
				status: "error",
				message: "Chapter not found in the course.",
			};
		}

		const remainingChapters = chapters.filter(
			(chapter) => chapter.id !== chapterId
		);

		const updates = remainingChapters.map((chapter, index) => {
			return prisma.chapter.update({
				where: { id: chapter.id },
				data: { position: index + 1 },
			});
		});

		await prisma.$transaction([
			...updates,
			prisma.chapter.delete({
				where: {
					id: chapterId,
				},
			}),
		]);

		// Log the action
		await prisma.adminLog.create({
			data: {
				action: "DELETE_CHAPTER",
				entity: "Chapter",
				details: `Deleted chapter "${chapter.title}" from course "${chapter.course.title}"`,
				userId: user.id,
			},
		});

		revalidatePath(`/admin/courses/${courseId}/edit`);

		return {
			status: "success",
			message: "Chapter deleted and positions reordered successfully",
		};
	} catch {
		return {
			status: "error",
			message: "Failed to delete chapter",
		};
	}
}
