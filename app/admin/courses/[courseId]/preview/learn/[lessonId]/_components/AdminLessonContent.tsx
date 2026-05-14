"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import {
	TextStyle,
	LineHeight,
	FontSize,
	FontFamily,
} from "@tiptap/extension-text-style";
import { Button } from "@/components/ui/button";
import { FileQuestion, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminLessonContentProps {
	lessonId: string;
	courseId: string;
	content: string;
	lessonTitle: string;
	nextLessonId?: string | null;
	prevLessonId?: string | null;
}

function EmptyLessonContent() {
	return (
		<Alert variant="default" className="border-dashed">
			<FileQuestion className="h-5 w-5" />
			<AlertTitle>Content Not Available</AlertTitle>
			<AlertDescription>
				The material for this lesson is still being prepared. Please check
				back later.
			</AlertDescription>
		</Alert>
	);
}

function isContentEmpty(content: string): boolean {
	if (!content || content.trim() === "") return true;

	try {
		const parsed = JSON.parse(content);
		if (
			parsed.type === "doc" &&
			(!parsed.content || parsed.content.length === 0)
		) {
			return true;
		}
		if (
			parsed.content?.every(
				(node: { type: string; content?: unknown[] }) =>
					node.type === "paragraph" &&
					(!node.content || node.content.length === 0)
			)
		) {
			return true;
		}
		return false;
	} catch {
		return true;
	}
}

export function AdminLessonContent({
	content,
	nextLessonId,
	prevLessonId,
	courseId,
}: AdminLessonContentProps) {
	const isEmpty = isContentEmpty(content);

	const editor = useEditor({
		editable: false,
		immediatelyRender: false,
		extensions: [
			StarterKit,
			TextStyle,
			LineHeight.configure({ types: ["textStyle"] }),
			FontSize.configure({ types: ["textStyle"] }),
			FontFamily.configure({ types: ["textStyle"] }),
			TextAlign.configure({ types: ["heading", "paragraph", "image"] }),
			Image.configure({
				inline: true,
				HTMLAttributes: {
					class: "rounded-lg border shadow-sm max-w-full h-auto my-4",
				},
			}),
			Youtube.configure({
				controls: true,
				nocookie: true,
				HTMLAttributes: {
					class: "w-full aspect-video rounded-lg shadow-sm border my-4",
				},
			}),
		],
		editorProps: {
			attributes: {
				class:
					"prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert focus:outline-none !w-full !max-w-none",
			},
		},
		content:
			content && !isEmpty ? JSON.parse(content) : { type: "doc", content: [] },
	});

	if (!editor) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-3/4" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-2/3" />
				<div className="flex items-center justify-center py-8">
					<Loader2 className="size-8 animate-spin text-muted-foreground" />
				</div>
			</div>
		);
	}

	return (
		<div className="pb-8">
			{/* Konten Materi atau Empty State */}
			{isEmpty ? <EmptyLessonContent /> : <EditorContent editor={editor} />}

			{/* Divider */}
			<div className="my-12 h-px bg-border" />

			{/* Navigation Buttons */}
			<div className="flex items-center justify-between gap-4">
				{/* Previous Lesson */}
				{prevLessonId ? (
					<Button
						variant="outline"
						className="gap-2"
						asChild
					>
						<Link
							href={`/admin/courses/${courseId}/preview/learn/${prevLessonId}`}
						>
							<ChevronLeft className="size-4" />
							Previous Lesson
						</Link>
					</Button>
				) : (
					<div /> /* Spacer */
				)}

				{/* Next Lesson */}
				{nextLessonId ? (
					<Button className="gap-2" asChild>
						<Link
							href={`/admin/courses/${courseId}/preview/learn/${nextLessonId}`}
						>
							Next Lesson
							<ChevronRight className="size-4" />
						</Link>
					</Button>
				) : (
					<div /> /* Spacer */
				)}
			</div>
		</div>
	);
}
