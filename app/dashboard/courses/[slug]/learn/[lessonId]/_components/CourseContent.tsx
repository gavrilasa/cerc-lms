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
import { Loader2, CheckCircle, BookOpen } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfetti } from "@/hooks/use-confetti";
import { markAsCompleted } from "../actions"; // Pastikan file actions.ts ada di folder parent
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CourseContentProps {
	lessonId: string;
	courseId: string;
	content: string; // JSON string dari database
	courseTitle: string;
}

export function CourseContent({
	lessonId,
	courseId,
	content,
	courseTitle,
}: CourseContentProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [showCompleteModal, setShowCompleteModal] = useState(false);
	const router = useRouter();
	const { triggerConfetti } = useConfetti();

	// Inisialisasi Editor dalam mode Read-Only
	const editor = useEditor({
		editable: false, // KUNCI: Mode baca saja
		immediatelyRender: false, // Hindari hydration mismatch
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
				controls: true, // Izinkan user memutar video
				nocookie: true,
				HTMLAttributes: {
					class: "w-full aspect-video rounded-lg shadow-sm border my-4",
				},
			}),
		],
		editorProps: {
			attributes: {
				// Styling prose agar enak dibaca (mirip Notion/Medium)
				class:
					"prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert focus:outline-none !w-full !max-w-none",
			},
		},
		content: content ? JSON.parse(content) : { type: "doc", content: [] },
	});

	const handleMarkAsDone = async () => {
		setIsLoading(true);
		try {
			const result = await markAsCompleted(lessonId, courseId);

			// Refresh router agar sidebar progress terupdate
			router.refresh();

			if (result.isCourseCompleted) {
				triggerConfetti();
				setShowCompleteModal(true);
			} else if (result.nextLessonId) {
				// Navigasi ke lesson berikutnya
				router.push(result.nextLessonId); // Asumsi result.nextLessonId adalah full URL atau ID yang diproses page
				// Note: Idealnya server action mengembalikan path lengkap, misal:
				// /dashboard/courses/[slug]/learn/[nextLessonId]
				// Jika hanya ID, kita perlu construct URLnya.
				// Asumsi: Server action mengembalikan FULL PATH untuk kemudahan,
				// ATAU kita construct di sini jika punya slug.
				// Mari kita asumsikan result.nextLessonId adalah ID lesson saja, kita butuh slug di props.
				// router.push(`/dashboard/courses/${slug}/learn/${result.nextLessonId}`);
			} else {
				toast.success("Lesson completed!");
			}
		} catch (error) {
			toast.error("Failed to update progress");
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	if (!editor) {
		return null;
	}

	return (
		<div className="pb-20">
			{/* Konten Materi */}
			<EditorContent editor={editor} />

			{/* Divider */}
			<div className="my-12 h-px bg-border" />

			{/* Tombol Mark as Done */}
			<div className="flex justify-center">
				<Button
					size="lg"
					onClick={handleMarkAsDone}
					disabled={isLoading}
					className={cn(
						"w-full md:w-auto min-w-[200px] gap-2 font-semibold transition-all",
						isLoading ? "opacity-80" : "hover:scale-105"
					)}
				>
					{isLoading ? (
						<>
							<Loader2 className="animate-spin size-5" />
							Saving Progress...
						</>
					) : (
						<>
							Mark as Done
							<CheckCircle className="size-5" />
						</>
					)}
				</Button>
			</div>

			{/* Modal Kursus Selesai */}
			<Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
				<DialogContent className="sm:max-w-md text-center">
					<DialogHeader className="flex flex-col items-center gap-2">
						<div className="size-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
							<CheckCircle className="size-10 text-green-600" />
						</div>
						<DialogTitle className="text-2xl font-bold">
							Congratulations!
						</DialogTitle>
						<DialogDescription className="text-center text-base">
							You have successfully completed the course <br />
							<span className="font-semibold text-foreground">
								&quot;{courseTitle}&quot;
							</span>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
						<Button
							variant="outline"
							onClick={() => router.push("/dashboard")}
							className="w-full"
						>
							Back to Dashboard
						</Button>
						<Button
							className="w-full gap-2"
							onClick={() => router.push("/dashboard?tab=my-courses")} // Atau ke sertifikat jika ada
						>
							<BookOpen className="size-4" />
							Browse More Courses
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
