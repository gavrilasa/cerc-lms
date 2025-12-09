"use server";

import { requireUser } from "@/app/data/user/require-user";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import prisma from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { request } from "@arcjet/next";
import { redirect } from "next/navigation";

const aj = arcjet.withRule(
	fixedWindow({
		mode: "LIVE",
		window: "1m",
		max: 5,
	})
);

export async function enrollInCourseAction(
	courseId: string
): Promise<ApiResponse> {
	const user = await requireUser();
	let courseSlug: string;

	try {
		const req = await request();
		const decision = await aj.protect(req, {
			fingerprint: user.id,
		});

		if (decision.isDenied()) {
			return {
				status: "error",
				message: "You have been blocked",
			};
		}

		const course = await prisma.course.findUnique({
			where: {
				id: courseId,
			},
			select: {
				id: true,
				slug: true,
			},
		});

		if (!course) {
			return {
				status: "error",
				message: "Course not found",
			};
		}

		courseSlug = course.slug;

		await prisma.$transaction(async (tx) => {
			const existingEnrollment = await tx.enrollment.findUnique({
				where: {
					userId_courseId: {
						userId: user.id,
						courseId: courseId,
					},
				},
				select: {
					id: true,
					status: true,
				},
			});

			if (existingEnrollment?.status === "Active") {
				return;
			}

			if (existingEnrollment) {
				await tx.enrollment.update({
					where: {
						id: existingEnrollment.id,
					},
					data: {
						status: "Active",
						updatedAt: new Date(),
					},
				});
			} else {
				await tx.enrollment.create({
					data: {
						userId: user.id,
						courseId: course.id,
						status: "Active",
					},
				});
			}
		});
	} catch (error) {
		console.error(error);
		return {
			status: "error",
			message: "Failed to enroll in course",
		};
	}

	redirect(`/dashboard/${courseSlug}`);
}
