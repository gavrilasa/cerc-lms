"use server";

import { requireUser } from "@/app/data/user/require-user";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
	type Division,
	EnrollmentStatus,
	CourseStatus,
} from "@/lib/generated/prisma/enums";
import { redirect } from "next/navigation";
import { z } from "zod";
import { type AuthUser } from "@/lib/access-control";

// Zod schema untuk validasi input
const enrollmentInputSchema = z.object({
	courseId: z.string().uuid({ message: "Invalid Course ID format" }),
});

interface EnrollmentResult {
	success?: boolean;
	error?: string;
	message?: string;
}

/**
 * Enroll user ke course dengan validasi lengkap:
 * - Course status harus PUBLISHED
 * - User division harus match (kecuali ADMIN)
 * - Gating system untuk curriculum check
 */
export async function enrollUser(courseId: string): Promise<EnrollmentResult> {
	// 1. Auth Check
	const sessionUser = await requireUser();
	const user = sessionUser as AuthUser;

	// 2. Input Validation dengan Zod
	const validation = enrollmentInputSchema.safeParse({ courseId });
	if (!validation.success) {
		return { error: validation.error.issues[0]?.message || "Invalid input" };
	}

	try {
		// 3. Get Course Data dengan status dan division
		const course = await prisma.course.findUnique({
			where: { id: courseId },
			select: {
				id: true,
				slug: true,
				status: true,
				division: true,
			},
		});

		if (!course) {
			return { error: "Kursus tidak ditemukan." };
		}

		// 4. [NEW] Course Status Check - hanya PUBLISHED yang bisa di-enroll
		if (course.status !== CourseStatus.PUBLISHED) {
			return { error: "Kursus ini belum tersedia untuk pendaftaran." };
		}

		// 5. [NEW] Division Check - user harus match division (kecuali ADMIN)
		if (user.role !== "ADMIN") {
			if (!user.division) {
				return { error: "Akun Anda belum terdaftar pada divisi manapun." };
			}
			if (user.division !== course.division) {
				return { error: "Kursus ini tidak tersedia untuk divisi Anda." };
			}
		}

		// 6. Idempotency Check (Sudah enroll belum?)
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
		// 7. GATING SYSTEM CHECK (Curriculum prerequisite)
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

					// Cek field 'completedAt' untuk validasi kelulusan
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

		// 8. Create Enrollment
		await prisma.enrollment.create({
			data: {
				userId: user.id,
				courseId: course.id,
				status: EnrollmentStatus.ACTIVE,
			},
		});

		// 9. Revalidation
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

/**
 * Quick enroll dan redirect - wrapper untuk enrollUser
 * Digunakan oleh button yang langsung redirect setelah enroll
 */
export async function enrollAndRedirect(courseId: string) {
	const result = await enrollUser(courseId);

	if (result.error) {
		// Return error untuk ditampilkan di UI
		return result;
	}

	revalidatePath("/dashboard");
	redirect("/dashboard");
}
