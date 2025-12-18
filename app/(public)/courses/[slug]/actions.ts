"use server";

import { requireUser } from "@/app/data/user/require-user";
import { getUserCurriculumDetails } from "@/app/data/curriculum/get-user-curriculum-details";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import prisma from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const aj = arcjet.withRule(
	fixedWindow({
		mode: "LIVE",
		window: "1m",
		max: 5,
	})
);

const enrollSchema = z.string().uuid();

export async function enrollInCourseAction(
	courseId: string
): Promise<ApiResponse> {
	const user = await requireUser();
	let courseSlug: string;

	const parseResult = enrollSchema.safeParse(courseId);
	if (!parseResult.success) {
		return { status: "error", message: "Invalid Course ID" };
	}

	try {
		const req = await request();
		const decision = await aj.protect(req, {
			fingerprint: user.id,
		});

		if (decision.isDenied()) {
			return { status: "error", message: "You have been blocked" };
		}

		const course = await prisma.course.findUnique({
			where: { id: courseId },
			select: { id: true, slug: true },
		});

		if (!course) {
			return { status: "error", message: "Course not found" };
		}

		courseSlug = course.slug;

		const dashboardData = await getUserCurriculumDetails(user.id);

		if (!dashboardData) {
			return {
				status: "error",
				message:
					"Anda belum memilih kurikulum. Silakan pilih kurikulum terlebih dahulu.",
			};
		}

		const targetCourse =
			dashboardData.coreCourses.find((c) => c.id === courseId) ||
			dashboardData.electiveCourses.find((c) => c.id === courseId);

		if (!targetCourse) {
			return {
				status: "error",
				message: "Course ini tidak tersedia dalam kurikulum Anda saat ini.",
			};
		}

		if (targetCourse.isLocked) {
			return {
				status: "error",
				message: "Materi terkunci. Selesaikan kurikulum wajib terlebih dahulu.",
			};
		}

		if (
			targetCourse.status === "Completed" ||
			targetCourse.status === "Active"
		) {
			const existing = await prisma.enrollment.findUnique({
				where: { userId_courseId: { userId: user.id, courseId } },
			});

			if (existing && existing.status === "Active") {
				return { status: "success", message: "Already enrolled" };
			}
		}

		await prisma.$transaction(async (tx) => {
			const existingEnrollment = await tx.enrollment.findUnique({
				where: {
					userId_courseId: { userId: user.id, courseId: courseId },
				},
			});

			if (existingEnrollment) {
				if (existingEnrollment.status !== "Active") {
					await tx.enrollment.update({
						where: { id: existingEnrollment.id },
						data: { status: "Active", updatedAt: new Date() },
					});
				}
			} else {
				await tx.enrollment.create({
					data: {
						userId: user.id,
						courseId: course.id,
						status: "Active",
						completedAt: null,
					},
				});
			}
		});

		revalidatePath("/dashboard");
	} catch (error) {
		console.error("[ENROLL_ACTION]", error);
		return { status: "error", message: "Failed to enroll in course" };
	}

	redirect(`/dashboard/${courseSlug}`);
}
