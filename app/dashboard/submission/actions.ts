"use server";

import { requireSession } from "@/app/data/auth/require-session";
import prisma from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache";
import {
	SubmissionType,
	SubmissionStatus,
	EnrollmentStatus,
} from "@/lib/generated/prisma/enums";
import { z } from "zod";
import { type AuthUser, checkRole } from "@/lib/access-control";

// =============================================================================
// Zod Schemas
// =============================================================================

const linkSchema = z.object({
	label: z.string().min(1, "Label is required").max(100),
	url: z.string().url("Invalid URL format"),
});

const createSubmissionSchema = z.object({
	title: z.string().min(1, "Title is required").max(200),
	description: z.string().max(1000).optional(),
	type: z.nativeEnum(SubmissionType),
	courseId: z.string().uuid().optional(),
	links: z.array(linkSchema).min(1, "At least one link is required").max(10),
});

const gradeSubmissionSchema = z.object({
	submissionId: z.string().uuid(),
	score: z.number().int().min(1).max(10),
	feedback: z.string().min(1, "Feedback is required").max(2000),
});

// =============================================================================
// Types
// =============================================================================

interface ActionResult {
	success?: boolean;
	error?: string;
	message?: string;
}

export type SubmissionWithDetails = Awaited<
	ReturnType<typeof getUserSubmissions>
>["submissions"][number];

// =============================================================================
// User Actions
// =============================================================================

/**
 * Create a new submission
 * - TASK type requires courseId and user must be enrolled
 * - PROJECT type doesn't require courseId
 */
export async function createSubmission(
	input: z.infer<typeof createSubmissionSchema>
): Promise<ActionResult> {
	const session = await requireSession();
	const user = session.user as AuthUser;

	// Validate input
	const validation = createSubmissionSchema.safeParse(input);
	if (!validation.success) {
		return { error: validation.error.issues[0]?.message || "Invalid input" };
	}

	const { title, description, type, courseId, links } = validation.data;

	// User must have a division
	if (!user.division) {
		return { error: "Akun Anda belum terdaftar pada divisi manapun." };
	}

	try {
		// TASK type requires courseId and enrollment check
		if (type === SubmissionType.TASK) {
			if (!courseId) {
				return { error: "Course harus dipilih untuk submission tipe Task." };
			}

			// Check if user is enrolled in the course
			const enrollment = await prisma.enrollment.findUnique({
				where: {
					userId_courseId: {
						userId: user.id,
						courseId: courseId,
					},
				},
			});

			if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) {
				return {
					error: "Anda harus terdaftar di course ini untuk membuat submission.",
				};
			}
		}

		// Create submission with links
		await prisma.submission.create({
			data: {
				title,
				description,
				type,
				status: SubmissionStatus.PENDING,
				division: user.division,
				userId: user.id,
				courseId: type === SubmissionType.TASK ? courseId : null,
				links: {
					create: links.map((link) => ({
						label: link.label,
						url: link.url,
					})),
				},
			},
		});

		revalidatePath("/dashboard/submission");

		return { success: true, message: "Submission berhasil dibuat!" };
	} catch (error) {
		console.error("[CREATE_SUBMISSION_ERROR]", error);
		return {
			error: "Terjadi kesalahan saat membuat submission. Silakan coba lagi.",
		};
	}
}

/**
 * Get all submissions for the current user
 */
export async function getUserSubmissions(page: number = 1, limit: number = 10) {
	const session = await requireSession();
	const user = session.user as AuthUser;

	const [submissions, total] = await Promise.all([
		prisma.submission.findMany({
			where: { userId: user.id },
			include: {
				course: {
					select: {
						id: true,
						title: true,
						slug: true,
					},
				},
				links: true,
				reviewer: {
					select: {
						id: true,
						name: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
			take: limit,
			skip: (page - 1) * limit,
		}),
		prisma.submission.count({ where: { userId: user.id } }),
	]);

	return {
		submissions,
		metadata: {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		},
	};
}

/**
 * Get user's enrolled courses for the submission form dropdown
 */
export async function getEnrolledCourses() {
	const session = await requireSession();
	const user = session.user as AuthUser;

	const enrollments = await prisma.enrollment.findMany({
		where: {
			userId: user.id,
			status: EnrollmentStatus.ACTIVE,
		},
		include: {
			course: {
				select: {
					id: true,
					title: true,
					slug: true,
				},
			},
		},
	});

	return enrollments.map((e) => e.course);
}

// =============================================================================
// Mentor/Admin Actions
// =============================================================================

/**
 * Get all submissions for review page
 * - Mentors see submissions from their division only
 * - Admins see all submissions
 * - Shows both pending and reviewed submissions
 */
export async function getAllSubmissionsForReview(
	page: number = 1,
	limit: number = 10,
	status: string = "ALL", // ALL, PENDING, REVIEWED
	sort: "asc" | "desc" = "desc" // desc = Newest, asc = Oldest
) {
	const session = await requireSession();
	const user = session.user as AuthUser;

	// Must be at least MENTOR
	if (!checkRole(user, "MENTOR")) {
		return {
			submissions: [],
			metadata: {
				total: 0,
				page,
				limit,
				totalPages: 0,
			},
		};
	}

	const whereClause: Prisma.SubmissionWhereInput =
		user.role === "ADMIN" ? {} : { division: user.division! };

	// Apply status filter
	if (status !== "ALL") {
		if (status === "PENDING") {
			whereClause.status = SubmissionStatus.PENDING;
		} else if (status === "REVIEWED") {
			whereClause.status = SubmissionStatus.REVIEWED;
		}
	}

	const [submissions, total] = await Promise.all([
		prisma.submission.findMany({
			where: whereClause,
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						nim: true,
						generation: true,
					},
				},
				course: {
					select: {
						id: true,
						title: true,
						slug: true,
					},
				},
				links: true,
				reviewer: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
			orderBy: { createdAt: sort },
			take: limit,
			skip: (page - 1) * limit,
		}),
		prisma.submission.count({ where: whereClause }),
	]);

	return {
		submissions,
		metadata: {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		},
	};
}

export type ReviewSubmission = Awaited<
	ReturnType<typeof getAllSubmissionsForReview>
>["submissions"][number];

/**
 * Grade a submission
 * - Assigns score and feedback
 * - Updates user's totalPoints atomically
 */
export async function gradeSubmission(
	input: z.infer<typeof gradeSubmissionSchema>
): Promise<ActionResult> {
	const session = await requireSession();
	const user = session.user as AuthUser;

	// Must be at least MENTOR
	if (!checkRole(user, "MENTOR")) {
		return { error: "Anda tidak memiliki akses untuk melakukan review." };
	}

	// Validate input
	const validation = gradeSubmissionSchema.safeParse(input);
	if (!validation.success) {
		return { error: validation.error.issues[0]?.message || "Invalid input" };
	}

	const { submissionId, score, feedback } = validation.data;

	try {
		// Get submission
		const submission = await prisma.submission.findUnique({
			where: { id: submissionId },
			select: {
				id: true,
				status: true,
				division: true,
				userId: true,
			},
		});

		if (!submission) {
			return { error: "Submission tidak ditemukan." };
		}

		if (submission.status === SubmissionStatus.REVIEWED) {
			return { error: "Submission ini sudah direview." };
		}

		// Division check for MENTOR (ADMIN can review all)
		if (user.role !== "ADMIN" && submission.division !== user.division) {
			return {
				error: "Anda tidak memiliki akses untuk mereview submission ini.",
			};
		}

		// Update submission and user points in a transaction
		await prisma.$transaction([
			prisma.submission.update({
				where: { id: submissionId },
				data: {
					status: SubmissionStatus.REVIEWED,
					score,
					feedback,
					reviewerId: user.id,
				},
			}),
			prisma.user.update({
				where: { id: submission.userId },
				data: {
					totalPoints: {
						increment: score,
					},
				},
			}),
		]);

		revalidatePath("/dashboard/submission");
		revalidatePath("/dashboard/review");
		revalidateTag(CACHE_TAGS.LEADERBOARD, "max"); // Invalidate leaderboard when points change

		return { success: true, message: "Review berhasil disimpan!" };
	} catch (error) {
		console.error("[GRADE_SUBMISSION_ERROR]", error);
		return {
			error: "Terjadi kesalahan saat menyimpan review. Silakan coba lagi.",
		};
	}
}

/**
 * Get submission detail by ID (for review modal)
 */
export async function getSubmissionDetail(submissionId: string) {
	const session = await requireSession();
	const user = session.user as AuthUser;

	// Must be at least MENTOR or the owner
	const submission = await prisma.submission.findUnique({
		where: { id: submissionId },
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					nim: true,
					generation: true,
					division: true,
				},
			},
			course: {
				select: {
					id: true,
					title: true,
					slug: true,
				},
			},
			links: true,
			reviewer: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	});

	if (!submission) {
		return null;
	}

	// Access check: owner or MENTOR/ADMIN
	const isOwner = submission.userId === user.id;
	const isReviewer = checkRole(user, "MENTOR");

	if (!isOwner && !isReviewer) {
		return null;
	}

	return submission;
}
