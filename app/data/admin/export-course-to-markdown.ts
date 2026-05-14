"use server";

import { requireSession } from "@/app/data/auth/require-session";
import prisma from "@/lib/db";
import { courseWithDetailedChaptersSelect } from "@/lib/prisma/selects";
import { MarkdownManager } from "@tiptap/markdown";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle, LineHeight, FontSize, FontFamily } from "@tiptap/extension-text-style";

interface ExportError {
	error: string;
	code: "NOT_FOUND" | "UNAUTHORIZED" | "PARSE_ERROR" | "CONVERSION_ERROR";
}

interface ExportSuccess {
	markdown: string;
	filename: string;
}

export type ExportResult = ExportSuccess | ExportError;

/**
 * Export a course with chapters and lessons to Markdown format
 * Only accessible to ADMIN users
 */
export async function exportCourseToMarkdown(
	courseId: string,
): Promise<ExportResult> {
	try {
		// 1. Verify admin access only
		const session = await requireSession({ minRole: "ADMIN" });

		// 2. Fetch course with detailed chapters and lessons
		const course = await prisma.course.findUnique({
			where: { id: courseId },
			select: {
				...courseWithDetailedChaptersSelect,
				createdAt: true,
				updatedAt: true,
				user: {
					select: {
						name: true,
						email: true,
					},
				},
			},
		});

		if (!course) {
			return {
				error: "Course not found",
				code: "NOT_FOUND",
			};
		}

		// 3. Create MarkdownManager with configured extensions
		const markdownManager = new MarkdownManager({
			extensions: [
				StarterKit,
				TextStyle,
				LineHeight.configure({ types: ["textStyle"] }),
				FontSize.configure({ types: ["textStyle"] }),
				FontFamily.configure({ types: ["textStyle"] }),
				TextAlign.configure({ types: ["heading", "paragraph"] }),
				Table.configure({ resizable: true }),
				TableRow,
				TableCell,
				TableHeader,
			],
		});

		// 4. Helper function to convert TipTap JSON to markdown
		const convertToMarkdown = (jsonContent: string | null): string => {
			if (!jsonContent) return "";

			try {
				const parsed = JSON.parse(jsonContent);
				const markdown = markdownManager.serialize(parsed);
				return markdown || "";
			} catch (error) {
				console.error("Error converting content to markdown:", error);
				return "";
			}
		};

		// 5. Generate markdown content
		const exportDate = new Date().toISOString();
		const markdownLines: string[] = [];

		// Metadata header
		markdownLines.push("---");
		markdownLines.push(`title: "${course.title}"`);
		markdownLines.push(`slug: ${course.slug}`);
		markdownLines.push(`division: ${course.division}`);
		markdownLines.push(`status: ${course.status}`);
		markdownLines.push(`created: ${course.createdAt.toISOString()}`);
		markdownLines.push(`updated: ${course.updatedAt.toISOString()}`);
		markdownLines.push(`exported: ${exportDate}`);
		markdownLines.push(`author: ${course.user?.name || "Unknown"}`);
		markdownLines.push("---");
		markdownLines.push("");

		// Course title and small description
		markdownLines.push(`# ${course.title}`);
		markdownLines.push("");

		if (course.smallDescription) {
			markdownLines.push("> " + course.smallDescription.replace(/\n/g, "\n> "));
			markdownLines.push("");
		}

		// Course description
		if (course.description) {
			markdownLines.push("## Description");
			markdownLines.push("");
			const descriptionMarkdown = convertToMarkdown(course.description);
			markdownLines.push(descriptionMarkdown);
			markdownLines.push("");
		}

		// Course structure
		markdownLines.push("---");
		markdownLines.push("");
		markdownLines.push("# Course Content");
		markdownLines.push("");

		// Process chapters and lessons
		if (course.chapters && course.chapters.length > 0) {
			for (const chapter of course.chapters) {
				markdownLines.push(`## Chapter: ${chapter.title}`);
				markdownLines.push("");

				if (chapter.lessons && chapter.lessons.length > 0) {
					for (const lesson of chapter.lessons) {
						markdownLines.push(`### Lesson: ${lesson.title}`);
						markdownLines.push("");

						if (lesson.description) {
							const lessonMarkdown = convertToMarkdown(lesson.description);
							if (lessonMarkdown.trim()) {
								markdownLines.push(lessonMarkdown);
								markdownLines.push("");
							}
						}
					}
				} else {
					markdownLines.push("*No lessons in this chapter*");
					markdownLines.push("");
				}
			}
		} else {
			markdownLines.push("*No chapters in this course*");
			markdownLines.push("");
		}

		// Footer
		markdownLines.push("---");
		markdownLines.push("");
		markdownLines.push(
			`*Exported from CERC LMS on ${exportDate} by ${session.user.name}*`,
		);

		// 6. Generate filename
		const safeTitle =
			course.slug || course.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
		const filename = `${safeTitle}-${new Date().toISOString().split("T")[0]}.md`;

		return {
			markdown: markdownLines.join("\n"),
			filename,
		};
	} catch (error) {
		console.error("Export error:", error);

		if (error instanceof Error && error.message.includes("UNAUTHORIZED")) {
			return {
				error: "Unauthorized access",
				code: "UNAUTHORIZED",
			};
		}

		if (error instanceof SyntaxError) {
			return {
				error: "Failed to parse course content",
				code: "PARSE_ERROR",
			};
		}

		return {
			error: "Failed to export course to markdown",
			code: "CONVERSION_ERROR",
		};
	}
}
