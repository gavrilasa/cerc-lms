"use server";

import { requireSession } from "@/app/data/auth/require-session";
import prisma from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { lessonSchema, LessonSchemaType } from "@/lib/zodSchemas";

export async function updateLesson(
	values: LessonSchemaType,
	lessonId: string
): Promise<ApiResponse> {
	await requireSession({ minRole: "ADMIN" });

	try {
		const result = lessonSchema.safeParse(values);

		if (!result.success) {
			return {
				status: "error",
				message: "Invalid data",
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

		return {
			status: "success",
			message: "Course updated successfully",
		};
	} catch {
		return {
			status: "error",
			message: "Failed to update course",
		};
	}
}
