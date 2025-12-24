import prisma from "@/lib/db";

/**
 * Generate a unique slug with retry logic for race conditions.
 * If the slug exists, appends a random suffix.
 *
 * @param baseSlug - The desired slug (e.g., "my-course")
 * @param maxRetries - Maximum number of retries (default: 5)
 * @returns A unique slug
 */
export async function generateUniqueSlug(
	baseSlug: string,
	maxRetries: number = 5
): Promise<string> {
	// Clean the base slug
	let slug = baseSlug
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9-]/g, "-") // Replace non-alphanumeric with hyphen
		.replace(/-+/g, "-") // Replace multiple hyphens with single
		.replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

	let attempts = 0;

	while (attempts < maxRetries) {
		// Check if slug exists
		const existing = await prisma.course.findUnique({
			where: { slug },
			select: { id: true },
		});

		if (!existing) {
			return slug;
		}

		// Generate a random suffix
		const randomSuffix = Math.random().toString(36).substring(2, 6);
		slug = `${baseSlug}-${randomSuffix}`;
		attempts++;
	}

	// Last resort: use timestamp
	const timestamp = Date.now().toString(36);
	return `${baseSlug}-${timestamp}`;
}

/**
 * Validate slug format.
 * @param slug - The slug to validate
 * @returns true if valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
	// Slug must be:
	// - At least 3 characters
	// - Only lowercase letters, numbers, and hyphens
	// - Not start or end with hyphen
	const slugRegex = /^[a-z0-9][a-z0-9-]{1,}[a-z0-9]$/;
	return slugRegex.test(slug) && !slug.includes("--");
}

/**
 * Create an index file for utils
 */
export { deleteS3File, cleanupCourseS3Files } from "./s3-cleanup";
export { tryCatch } from "./try-catch";
export {
	escapeHtml,
	stripHtml,
	sanitizeRichText,
	sanitizeUrl,
	sanitizeInput,
} from "./sanitize";
