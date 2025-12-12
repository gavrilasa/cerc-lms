"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	courseSchema,
	CourseSchemaType,
	courseLevels,
	courseStatus,
	courseCategories,
	divisions,
} from "@/lib/zodSchemas";
import { ArrowLeft, Loader2, PlusIcon, SparkleIcon } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import slugify from "slugify";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { Uploader } from "@/components/file-uploader/Uploader";
import { tryCatch } from "@/hooks/try-catch";
import { useTransition } from "react";
import { CreateCourse } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useConfetti } from "@/hooks/use-confetti";

interface CreateCourseFormProps {
	userRole: string;
}

export function CreateCourseForm({ userRole }: CreateCourseFormProps) {
	const [pending, startTransition] = useTransition();
	const router = useRouter();
	const { triggerConfetti } = useConfetti();

	const form = useForm<CourseSchemaType>({
		resolver: zodResolver(courseSchema),
		defaultValues: {
			title: "",
			description: "",
			fileKey: "",
			duration: 0,
			level: courseLevels[0],
			category: courseCategories[3],
			smallDescription: "",
			slug: "",
			status: courseStatus[0],
			division: undefined,
		},
	});

	function onSubmit(values: CourseSchemaType) {
		startTransition(async () => {
			const { data: result, error } = await tryCatch(CreateCourse(values));

			if (error) {
				toast.error("An unexpected error occured. Please try again");
				return;
			}

			if (result?.status === "success") {
				toast.success(result?.message);
				triggerConfetti();
				form.reset();
				router.push("/admin/courses");
			} else if (result?.status === "error") {
				toast.error(result?.message);
			}
		});
	}

	return (
		<>
			<div className="flex items-center gap-4">
				<Link
					className={buttonVariants({
						variant: "outline",
						size: "icon",
					})}
					href="/admin/courses"
				>
					<ArrowLeft className="size-4" />
				</Link>

				<h1 className="font-bold text-2xl">Create Courses</h1>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Basic Information</CardTitle>
					<CardDescription>
						Provide basic information about the course
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
							<div className="flex gap-4 items-end">
								<FormField
									control={form.control}
									name="title"
									render={({ field }) => (
										<FormItem className="w-full">
											<FormLabel>Title</FormLabel>
											<FormControl>
												<Input placeholder="Title" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								{userRole === "ADMIN" && (
									<FormField
										control={form.control}
										name="division"
										render={({ field }) => (
											<FormItem className="w-full">
												<FormLabel>Division (Admin Override)</FormLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Select Division" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{divisions.map((div) => (
															<SelectItem key={div} value={div}>
																{div}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}
							</div>

							<div className="flex gap-4 items-end">
								<FormField
									control={form.control}
									name="slug"
									render={({ field }) => (
										<FormItem className="w-full">
											<FormLabel>Slug</FormLabel>
											<FormControl>
												<Input placeholder="Slug" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button
									type="button"
									className="w-fit"
									onClick={() => {
										const titleValue = form.getValues("title");
										const slug = slugify(titleValue || "", { lower: true });
										form.setValue("slug", slug, { shouldValidate: true });
									}}
								>
									Generate Slug <SparkleIcon className="ml-1" size={16} />
								</Button>
							</div>

							<FormField
								control={form.control}
								name="smallDescription"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel>Small Description</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Small Description"
												className="min-h-[72]"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel>Description</FormLabel>
										<FormControl>
											<RichTextEditor field={field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="fileKey"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel>Thumbnail Image</FormLabel>
										<FormControl>
											<Uploader
												onChange={field.onChange}
												value={field.value}
												fileTypeAccepted="image"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<FormField
									control={form.control}
									name="category"
									render={({ field }) => (
										<FormItem className="w-full">
											<FormLabel>Category</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select Category" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{courseCategories.map((category) => (
														<SelectItem key={category} value={category}>
															{category}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="level"
									render={({ field }) => (
										<FormItem className="w-full">
											<FormLabel>Level</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select Level" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{courseLevels.map((level) => (
														<SelectItem key={level} value={level}>
															{level}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="duration"
									render={({ field: { value, onChange, ...field } }) => (
										<FormItem className="w-full">
											<FormLabel>Duration (hours)</FormLabel>
											<FormControl>
												<Input
													placeholder="Duration"
													type="number"
													value={value || ""}
													onChange={(e) => {
														const numValue = e.target.valueAsNumber;
														onChange(isNaN(numValue) ? 0 : numValue);
													}}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="status"
									render={({ field }) => (
										<FormItem className="w-full">
											<FormLabel>Status</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select Status" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{courseStatus.map((status) => (
														<SelectItem key={status} value={status}>
															{status}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormItem>
									)}
								/>
							</div>

							<Button type="submit" disabled={pending}>
								{pending ? (
									<>
										Creating... <Loader2 className="animate-spin" />
									</>
								) : (
									<>
										Create Course <PlusIcon className="ml-1" size={16} />
									</>
								)}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</>
	);
}
