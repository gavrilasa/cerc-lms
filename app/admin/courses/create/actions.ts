"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkRole, type AuthUser } from "@/lib/access-control";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import prisma from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { courseSchema, CourseSchemaType } from "@/lib/zodSchemas";
import { request } from "@arcjet/next";
import type { Division } from "@/lib/generated/prisma/enums";

const aj = arcjet.withRule(
	fixedWindow({
		mode: "LIVE",
		window: "1m",
		max: 5,
	})
);

export async function CreateCourse(
	values: CourseSchemaType
): Promise<ApiResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const user = session?.user as AuthUser;

	if (!session || !checkRole(user, "MENTOR")) {
		return {
			status: "error",
			message: "Unauthorized: You do not have permission to create courses.",
		};
	}

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

		const validation = courseSchema.safeParse(values);

		if (!validation.success) {
			return {
				status: "error",
				message: "Invalid Form Data",
			};
		}

		let finalDivision: Division;

		if (user.role === "ADMIN") {
			if (!validation.data.division) {
				return {
					status: "error",
					message: "Division is required for Admins.",
				};
			}
			finalDivision = validation.data.division;
		} else {
			if (!user.division) {
				return {
					status: "error",
					message: "Your account is not assigned to any division.",
				};
			}
			finalDivision = user.division;
		}

		await prisma.course.create({
			data: {
				...validation.data,
				division: finalDivision,
				userId: user.id,
			},
		});

		return {
			status: "success",
			message: "Course created successfully",
		};
	} catch (error) {
		console.error("Create Course Error:", error);
		return {
			status: "error",
			message: "Failed to Create Course",
		};
	}
}
