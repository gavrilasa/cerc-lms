"use server";

import { requireUser } from "@/app/data/user/require-user";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { type Division, EnrollmentStatus } from "@/lib/generated/prisma/enums";

export async function enrollUser(courseId: string) {
	// 1. Auth Check
	const user = await requireUser();

	if (!courseId || typeof courseId !== "string") {
		return { error: "Invalid Course ID." };
	}

	try {
		// 2. Get Data Kursus Target
		const course = await prisma.course.findUnique({
			where: { id: courseId },
			select: { id: true, slug: true },
		});

		if (!course) {
			return { error: "Kursus tidak ditemukan." };
		}

		// 3. Idempotency Check (Sudah enroll belum?)
		const existingEnrollment = await prisma.enrollment.findUnique({
			where: {
				userId_courseId: {
					userId: user.id,
					courseId: course.id,
				},
			},
		});

		if (existingEnrollment) {
			return {
				success: true,
				message: "Anda sudah terdaftar di kursus ini.",
			};
		}

		// =========================================================================
		// 4. GATING SYSTEM CHECK
		// =========================================================================

		const userCurriculum = await prisma.curriculum.findFirst({
			where: {
				division: user.division as Division,
			},
			include: {
				courses: true,
			},
		});

		if (userCurriculum) {
			const targetCourseItem = await prisma.curriculumCourse.findFirst({
				where: {
					curriculumId: userCurriculum.id,
					courseId: course.id,
				},
			});

			const targetOrder = targetCourseItem?.order ?? 0;

			if (targetCourseItem && targetOrder > 1) {
				const previousCourseItem = await prisma.curriculumCourse.findFirst({
					where: {
						curriculumId: userCurriculum.id,
						order: targetOrder - 1,
					},
				});

				if (previousCourseItem) {
					const prevEnrollment = await prisma.enrollment.findUnique({
						where: {
							userId_courseId: {
								userId: user.id,
								courseId: previousCourseItem.courseId,
							},
						},
					});

					// PERBAIKAN:
					// Schema EnrollmentStatus tidak punya 'Completed'.
					// Kita cek field 'completedAt' (DateTime?) untuk validasi kelulusan.
					if (!prevEnrollment || !prevEnrollment.completedAt) {
						return {
							error:
								"Akses Ditolak: Anda harus menyelesaikan kursus sebelumnya terlebih dahulu.",
						};
					}
				}
			}
		}
		// =========================================================================

		// 5. Database Transaction
		await prisma.enrollment.create({
			data: {
				userId: user.id,
				courseId: course.id,
				// PERBAIKAN: Gunakan .Active (sesuai Schema), bukan .ACTIVE
				status: EnrollmentStatus.Active,
			},
		});

		// 6. Revalidation
		revalidatePath("/dashboard");
		revalidatePath(`/dashboard/courses/${course.slug}`);

		return { success: true, message: "Berhasil mendaftar kursus!" };
	} catch (error) {
		console.error("[ENROLLMENT_ERROR]", error);
		return {
			error: "Terjadi kesalahan saat memproses pendaftaran. Silakan coba lagi.",
		};
	}
}
