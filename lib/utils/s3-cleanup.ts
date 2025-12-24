import "server-only";

import { S3 } from "@/lib/S3Client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";
import prisma from "@/lib/db";

/**
 * Delete a file from S3 by its key.
 * @param fileKey - The S3 object key to delete
 */
export async function deleteS3File(fileKey: string): Promise<boolean> {
	if (!fileKey) return false;

	try {
		await S3.send(
			new DeleteObjectCommand({
				Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
				Key: fileKey,
			})
		);
		return true;
	} catch (error) {
		console.error("[S3_DELETE_ERROR]", fileKey, error);
		return false;
	}
}

/**
 * Clean up S3 file when a course is deleted.
 * Should be called before deleting the course record.
 * @param courseId - The course ID being deleted
 */
export async function cleanupCourseS3Files(courseId: string): Promise<void> {
	const course = await prisma.course.findUnique({
		where: { id: courseId },
		select: { fileKey: true },
	});

	if (course?.fileKey) {
		await deleteS3File(course.fileKey);
	}
}

/**
 * Find and report orphaned S3 files (files not referenced in any course).
 * This is a utility for maintenance, not automatic cleanup.
 * @returns Array of orphaned file keys
 */
export async function findOrphanedS3Files(): Promise<string[]> {
	// Get all course file keys from database
	const courses = await prisma.course.findMany({
		select: { fileKey: true },
	});

	const usedFileKeys = new Set(
		courses.map((c) => c.fileKey).filter(Boolean)
	);

	// Note: To get all S3 files, you would need to:
	// 1. List all objects in S3 bucket
	// 2. Compare against usedFileKeys
	// 3. Return difference

	// This is left as a placeholder since S3 ListObjects requires additional setup
	console.log("[S3_CLEANUP] Currently tracking:", usedFileKeys.size, "files");

	return [];
}
