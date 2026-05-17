"use client";

import { updateLesson } from "@/app/admin/courses/[courseId]/[chapterId]/[lessonId]/actions";
import {
	LessonRichTextEditor,
	useLessonEditorConfig,
} from "@/components/rich-text-editor/LessonEditor";
import { LessonMenubar } from "@/components/rich-text-editor/LessonMenubar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { tryCatch } from "@/lib/utils/try-catch";
import { lessonSchema, LessonSchemaType } from "@/lib/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Maximize, Minimize, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LessonFormProps {
	initialData: {
		title: string;
		description: string | null;
		id: string;
	};
	courseId: string;
	chapterId: string;
	lessonId: string;
}

export function LessonForm({
	initialData,
	courseId,
	chapterId,
	lessonId,
}: LessonFormProps) {
	const [isZenMode, setIsZenMode] = useState(false);
	const [pending, startTransition] = useTransition();
	const router = useRouter();

	const form = useForm<LessonSchemaType>({
		resolver: zodResolver(lessonSchema),
		defaultValues: {
			title: initialData.title,
			description: initialData.description || "",
			courseId: courseId,
			chapterId: chapterId,
		},
	});

	// Initialize editor in parent component
	const descriptionValue = useWatch({
		control: form.control,
		name: "description",
	});

	const { editor, uploadImage, defaults } = useLessonEditorConfig({
		value: descriptionValue,
		onChange: (value) =>
			form.setValue("description", value, { shouldDirty: true }),
	});

	// Konfirmasi sebelum meninggalkan halaman jika ada perubahan yang belum disimpan
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (form.formState.isDirty) {
				e.preventDefault();
				e.returnValue = "";
			}
		};
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [form.formState.isDirty]);

	function onSubmit(values: LessonSchemaType) {
		startTransition(async () => {
			const { data, error } = await tryCatch(updateLesson(values, lessonId));

			if (error) {
				toast.error("Failed to update lesson");
				return;
			}

			if (data?.status === "success") {
				toast.success("Lesson updated successfully");
				router.refresh();
			} else {
				toast.error(data?.message || "Something went wrong");
			}
		});
	}

	const toggleZenMode = () => {
		setIsZenMode((prev) => !prev);
	};

	return (
		<>
			{/* Header Navigation (Disembunyikan saat Zen Mode) */}
			{!isZenMode && (
				<div className="flex items-center gap-x-4 mb-6">
					<Link
						href={`/admin/courses/${courseId}/edit`}
						className={buttonVariants({ variant: "outline", size: "icon" })}
					>
						<ArrowLeft className="size-4" />
					</Link>
					<div className="flex flex-col gap-y-1">
						<h1 className="text-2xl font-bold">Edit Lesson</h1>
						<p className="text-sm text-muted-foreground">{initialData.title}</p>
					</div>
				</div>
			)}

			{/* Main Form Container */}
			<div
				className={cn(
					"transition-all duration-300 ease-in-out",
					isZenMode
						? "fixed inset-0 z-9999 bg-card overflow-y-auto p-4 md:p-8" // Fullscreen Style with card background
						: "w-full", // Default Style
				)}
			>
				<Card
					className={cn("flex flex-col", isZenMode && "h-full border shadow-lg")}
				>
					{!isZenMode && (
						<CardHeader>
							<CardTitle>Lesson Details</CardTitle>
							<CardDescription>
								Write your lesson content here. Focus on the text.
							</CardDescription>
						</CardHeader>
					)}

					<CardContent
						className={cn(
							"flex flex-col",
							isZenMode
								? "p-0 h-full max-w-5xl mx-auto"
								: "h-[calc(100vh-280px)]"
						)}
					>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="flex flex-col flex-1 overflow-hidden"
							>
								{/* Top Toolbar (Title, Actions, Editor Toolbar) - STICKY */}
								<div
									className={cn(
										"sticky top-0 z-50 shrink-0",
										isZenMode
											? "bg-card/80 backdrop-blur supports-backdrop-filter:bg-card/60" // Zen mode: subtle backdrop blur
											: "bg-card/95 backdrop-blur border-b px-4 -mx-4 pt-4" // Default: with border and padding
									)}
								>
									{/* Row 1: Title and Actions */}
									<div className="flex flex-col md:flex-row gap-4 items-center justify-between">
										{/* Title Input */}
										<FormField
											control={form.control}
											name="title"
											render={({ field }) => (
												<FormItem className="flex-1 w-full md:max-w-xl mb-0">
													{!isZenMode && <FormLabel className="sr-only">Title</FormLabel>}
													<FormControl>
														<Input
															{...field}
															placeholder="Lesson Title"
															className={cn(
																"font-semibold text-lg border-0 focus-visible:ring-0 bg-transparent px-4 shadow-none",
																isZenMode ? "text-xl" : "text-lg"
															)}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<div className="flex items-center gap-2 w-full md:w-auto">
											{/* Zen Mode Toggle */}
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={toggleZenMode}
												title={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
											>
												{isZenMode ? (
													<Minimize className="size-5" />
												) : (
													<Maximize className="size-5" />
												)}
											</Button>

											{/* Save Button */}
											<Button type="submit" disabled={pending}>
												{pending ? (
													<Loader2 className="size-4 animate-spin mr-2" />
												) : (
													<Save className="size-4 mr-2" />
												)}
												Save
											</Button>
										</div>
									</div>

									{/* Row 2: Editor Toolbar - Now included in sticky header! */}
									{editor && (
										<div className="mt-4">
											<LessonMenubar
												editor={editor}
												uploadImage={uploadImage}
												defaults={defaults}
											/>
										</div>
									)}
								</div>

								{/* Scrollable Content Area */}
								<div className="flex-1 overflow-y-auto">
									{/* Rich Text Editor - Full Width (NO TOOLBAR) */}
									<FormField
										control={form.control}
										name="description"
										render={() => (
											<FormItem className="h-full flex flex-col">
												{!isZenMode && <FormLabel className="sr-only">Content</FormLabel>}
												<FormControl>
													<div className={cn("flex-1", isZenMode && "min-h-[calc(100vh-300px)]")}>
														<LessonRichTextEditor editor={editor} />
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
									)}
									/>
								</div>
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
		</>
	);
}
