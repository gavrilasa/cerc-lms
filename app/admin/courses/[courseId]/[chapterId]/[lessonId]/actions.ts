"use server";

import { requireSession } from "@/app/data/auth/require-session";
import prisma from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { lessonSchema, LessonSchemaType } from "@/lib/zodSchemas";
import { revalidatePath } from "next/cache";

export async function updateLesson(
	values: LessonSchemaType,
	lessonId: string
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

		if (user.role !== "ADMIN" && lesson.chapter.course.division !== user.division) {
			return {
				status: "error",
				message: "Unauthorized: Different division",
			};
		}

		await prisma.lesson.update({
			where: {
				id: lessonId,
			},
			data: {
				title: result.data.title,
				description: result.data.description,
			},
		});

		await prisma.adminLog.create({
			data: {
				action: "UPDATE_LESSON",
				entity: "Lesson",
				details: `Updated lesson "${result.data.title}" in chapter "${lesson.chapter.title}" of course "${lesson.chapter.course.title}"`,
				userId: user.id,
			},
		});

		revalidatePath(`/admin/courses/${result.data.courseId}/edit`);

		return {
			status: "success",
			message: "Lesson updated successfully",
		};
	} catch {
		return {
			status: "error",
			message: "Failed to update lesson",
		};
	}
}
