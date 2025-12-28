import "server-only";

import { requireSession } from "@/app/data/auth/require-session";
import prisma from "@/lib/db";
import { S3 } from "@/lib/S3Client";
import { env } from "@/lib/env";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export type CurriculumTimelineItem = {
	courseId: string;
	title: string;
	slug: string;
	order: number;
	thumbnailUrl: string | null;
	totalLessons: number;
	completedLessons: number;
	completedAt: Date | null;
};

export async function getCurriculumTimeline(): Promise<
	CurriculumTimelineItem[]
> {
	const { user } = await requireSession();

	if (!user.selectedCurriculumId) {
		return [];
	}

	// 1. Query Database
	const curriculumCourses = await prisma.curriculumCourse.findMany({
		where: {
			curriculumId: user.selectedCurriculumId,
		},
		orderBy: {
			order: "asc",
		},
		include: {
			course: {
				select: {
					id: true,
					title: true,
					slug: true,
					fileKey: true,
					// Mengambil Enrollment user ini untuk cek status Completed (Opsi A)
					enrollments: {
						where: {
							userId: user.id,
						},
						select: {
							completedAt: true,
						},
						take: 1,
					},
					// FIX: Menggunakan 'chapter' (lowercase) sesuai schema.prisma
					chapters: {
						select: {
							lessons: {
								select: {
									id: true,
									lessonProgress: {
										where: {
											userId: user.id,
											completed: true,
										},
										select: {
											completed: true,
										},
									},
								},
							},
						},
					},
				},
			},
		},
	});

	// 2. Data Transformation & S3 Signing (Parallel)
	const timelineData = await Promise.all(
		curriculumCourses.map(async (item, index) => {
			// Prisma sekarang seharusnya bisa meng-infer tipe 'course' dengan benar
			const course = item.course;

			// a. Hitung Statistik Lesson (Total vs Completed)
			// FIX: Mengakses 'course.chapter' (lowercase)
			const allLessons = course.chapters.flatMap((c) => c.lessons);
			const totalLessons = allLessons.length;

			// Hitung lesson yang memiliki entry progress 'completed: true'
			const completedLessons = allLessons.filter(
				(l) => l.lessonProgress.length > 0
			).length;

			// b. Ambil CompletedAt dari Enrollment
			const completedAt = course.enrollments[0]?.completedAt ?? null;

			// c. Generate Presigned URL untuk Thumbnail
			let thumbnailUrl: string | null = null;
			if (course.fileKey) {
				try {
					const command = new GetObjectCommand({
						Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
						Key: course.fileKey,
					});
					thumbnailUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });
				} catch (error) {
					console.error(
						`[S3_SIGN_ERROR] Failed to sign url for course ${course.id}:`,
						error
					);
					thumbnailUrl = null;
				}
			}

			return {
				courseId: course.id,
				title: course.title,
				slug: course.slug,
				order: item.order ?? index + 1,
				thumbnailUrl,
				totalLessons,
				completedLessons,
				completedAt,
			};
		})
	);

	return timelineData;
}
