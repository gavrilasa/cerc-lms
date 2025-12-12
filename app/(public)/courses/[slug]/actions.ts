"use server";

import { requireUser } from "@/app/data/user/require-user";
import { getCurriculumProgress } from "@/app/data/curriculum/get-user-progress";
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

	// Validasi input courseId
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

		// Ambil division juga untuk cek kurikulum
		const course = await prisma.course.findUnique({
			where: { id: courseId },
			select: { id: true, slug: true, division: true },
		});

		if (!course) {
			return { status: "error", message: "Course not found" };
		}

		courseSlug = course.slug;

		// Ambil snapshot status kurikulum user saat ini
		const { curriculum, electives } = await getCurriculumProgress(
			user.id,
			course.division
		);

		// Cari status course target ini di dalam kurikulum atau elektif
		const targetCourse =
			curriculum.find((c) => c.id === course.id) ||
			electives.find((c) => c.id === course.id);

		// Validasi Gating: Tolak jika course terkunci (LOCKED)
		if (targetCourse?.state === "LOCKED") {
			return {
				status: "error",
				message: "Course terkunci. Selesaikan prasyarat kurikulum sebelumnya.",
			};
		}

		// Idempotency: Jika sudah completed atau enrolled, anggap sukses (tanpa write DB)
		if (
			targetCourse?.state === "COMPLETED" ||
			targetCourse?.state === "ACTIVE"
		) {
			// Cek sepintas di DB apakah enrollment benar-benar ada untuk case Active
			const isEnrolled = await prisma.enrollment.findUnique({
				where: {
					userId_courseId: { userId: user.id, courseId: course.id },
				},
			});
			if (isEnrolled && isEnrolled.status === "Active") {
				return { status: "success", message: "Already enrolled" }; // Redirect handled below
			}
		}

		await prisma.$transaction(async (tx) => {
			const existingEnrollment = await tx.enrollment.findUnique({
				where: {
					userId_courseId: { userId: user.id, courseId: courseId },
				},
			});

			if (existingEnrollment) {
				// Aktifkan kembali jika status sebelumnya inactive/archived
				if (existingEnrollment.status !== "Active") {
					await tx.enrollment.update({
						where: { id: existingEnrollment.id },
						data: { status: "Active", updatedAt: new Date() },
					});
				}
			} else {
				// Buat enrollment baru dengan completedAt null
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
		console.error(error);
		return { status: "error", message: "Failed to enroll in course" };
	}

	redirect(`/dashboard/${courseSlug}`);
}
