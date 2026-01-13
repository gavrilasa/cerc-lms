import { z } from "zod";

export const courseStatus = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export const divisions = [
	"SOFTWARE",
	"EMBEDDED",
	"MULTIMEDIA",
	"NETWORKING",
] as const;

export const courseSchema = z.object({
	title: z
		.string()
		.min(3, { message: "Title must be at least 3 characters long" })
		.max(100, { message: "Title cannot exceed 100 characters" }),
	description: z
		.string()
		.min(3, { message: "Description must be at least 3 characters long" }),
	fileKey: z.string().min(1, { message: "File key cannot be empty" }),
	division: z.enum(divisions).optional(),
	smallDescription: z
		.string()
		.min(1, { message: "Small description cannot be empty" })
		.max(200, { message: "Small description cannot exceed 200 characters" }),
	slug: z
		.string()
		.min(3, { message: "Slug must be at least 3 characters long" }),
	status: z.enum(courseStatus, { message: "Status is required" }),
});

export const chapterSchema = z.object({
	title: z
		.string()
		.min(3, { message: "Title must be at least 3 characters long" }),
	courseId: z.string().uuid({ message: "Invalid course Id" }),
});

export const lessonSchema = z.object({
	title: z
		.string()
		.min(3, { message: "Title must be at least 3 characters long" }),
	courseId: z.string().uuid({ message: "Invalid course Id" }),
	chapterId: z.string().uuid({ message: "Invalid chapter Id" }),
	description: z
		.string()
		.min(3, { message: "Description must be at least 3 characters long" })
		.optional(),
});

export type CourseSchemaType = z.infer<typeof courseSchema>;
export type ChapterSchemaType = z.infer<typeof chapterSchema>;
export type LessonSchemaType = z.infer<typeof lessonSchema>;
