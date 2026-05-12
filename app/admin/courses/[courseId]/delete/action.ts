"use server";

import { requireSession } from "@/app/data/auth/require-session";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import prisma from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";

const aj = arcjet.withRule(
	fixedWindow({
		mode: "LIVE",
		window: "1m",
		max: 5,
	})
);

export async function deleteCourse(courseId: string): Promise<ApiResponse> {
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

		const course = await prisma.course.findUnique({
			where: { id: courseId },
			select: { title: true, userId: true, division: true },
		});

		if (!course) {
			return {
				status: "error",
				message: "Course not found",
			};
		}

		if (user.role !== "ADMIN" && course.userId !== user.id) {
			return {
				status: "error",
				message: "Unauthorized: You can only delete courses you created",
			};
		}

		if (user.role !== "ADMIN" && course.division !== user.division) {
			return {
				status: "error",
				message: "Unauthorized: Different division",
			};
		}

		await prisma.course.delete({
			where: {
				id: courseId,
			},
		});

		await prisma.adminLog.create({
			data: {
				action: "DELETE_COURSE",
				entity: "Course",
				details: `Deleted course: ${course.title}`,
				userId: user.id,
			},
		});

		revalidatePath("/admin/courses");

		return {
			status: "success",
			message: "Course deleted successfully",
		};
	} catch {
		return {
			status: "error",
			message: "Failed to delete course",
		};
	}
}
