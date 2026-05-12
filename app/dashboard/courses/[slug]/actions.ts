"use server";

import { requireSession } from "@/app/data/auth/require-session";
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

const enrollmentInputSchema = z.object({
	courseId: z.string().uuid({ message: "Invalid Course ID format" }),
});

interface EnrollmentResult {
	success?: boolean;
	error?: string;
	message?: string;
}

export async function enrollUser(courseId: string): Promise<EnrollmentResult> {
	const session = await requireSession();
	const user = session.user as AuthUser;

	const validation = enrollmentInputSchema.safeParse({ courseId });
	if (!validation.success) {
		return { error: validation.error.issues[0]?.message || "Invalid input" };
	}

	try {
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

		if (course.status !== CourseStatus.PUBLISHED) {
			return { error: "Kursus ini belum tersedia untuk pendaftaran." };
		}

		if (user.role !== "ADMIN") {
			if (!user.division) {
				return { error: "Akun Anda belum terdaftar pada divisi manapun." };
			}
			if (user.division !== course.division) {
				return { error: "Kursus ini tidak tersedia untuk divisi Anda." };
			}
		}

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

				if (!prevEnrollment || !prevEnrollment.completedAt) {
						return {
							error:
								"Akses Ditolak: Anda harus menyelesaikan kursus sebelumnya terlebih dahulu.",
						};
					}
				}
			}
		}

		await prisma.enrollment.create({
			data: {
				userId: user.id,
				courseId: course.id,
				status: EnrollmentStatus.ACTIVE,
			},
		});

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

export async function enrollAndRedirect(courseId: string) {
	const result = await enrollUser(courseId);

	if (result.error) {
		return result;
	}

	revalidatePath("/dashboard");
	redirect("/dashboard");
}
