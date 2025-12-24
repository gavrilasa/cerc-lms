"use client";

import { updateLesson } from "@/app/admin/courses/[courseId]/[chapterId]/[lessonId]/actions";
import { LessonRichTextEditor } from "@/components/rich-text-editor/LessonEditor";
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
import { useForm } from "react-hook-form";
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
			// PERBAIKAN DI SINI:
			// updateLesson hanya menerima (values, lessonId) sesuai definisi di actions.ts
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
						? "fixed inset-0 z-9999 bg-background overflow-y-auto p-4 md:p-10" // Fullscreen Style
						: "w-full" // Default Style
				)}
			>
				<Card className={cn(isZenMode && "border-0 shadow-none h-full")}>
					{!isZenMode && (
						<CardHeader>
							<CardTitle>Lesson Details</CardTitle>
							<CardDescription>
								Write your lesson content here. Focus on the text.
							</CardDescription>
						</CardHeader>
					)}

					<CardContent
						className={cn(isZenMode && "p-0 h-full max-w-5xl mx-auto")}
					>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-6"
							>
								{/* Top Toolbar (Title, Actions) */}
								<div
									className={cn(
										"flex flex-col md:flex-row gap-4 items-start justify-between sticky top-0 z-50 bg-background/95 backdrop-blur py-2 border-b mb-4",
										!isZenMode && "static border-0 bg-transparent p-0"
									)}
								>
									<FormField
										control={form.control}
										name="title"
										render={({ field }) => (
											<FormItem className="flex-1 w-full md:max-w-xl">
												{!isZenMode && <FormLabel>Title</FormLabel>}
												<FormControl>
													<Input
														{...field}
														placeholder="Lesson Title"
														className={cn(
															"font-semibold text-lg",
															isZenMode &&
																"h-12 text-xl shadow-none border-transparent px-0 focus-visible:ring-0"
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

								{/* Rich Text Editor - Full Width */}
								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem className="min-h-[500px]">
											{!isZenMode && <FormLabel>Content</FormLabel>}
											<FormControl>
												{/* Wrapper Editor agar fill screen saat Zen Mode */}
												<div className={cn(isZenMode && "min-h-screen pb-20")}>
													<LessonRichTextEditor field={field} />
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
		</>
	);
}
