"use client";

import { Button } from "@/components/ui/button";
import {
	courseSchema,
	CourseSchemaType,
	courseStatus,
	divisions,
} from "@/lib/zodSchemas";
import { Loader2, PlusIcon, SparkleIcon } from "lucide-react";
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
import { CourseRichTextEditor } from "@/components/rich-text-editor/CourseEditor";
import { Uploader } from "@/components/file-uploader/Uploader";
import { tryCatch } from "@/lib/utils/try-catch";
import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { editCourse } from "../actions";
import { AdminCourseSingularType } from "@/app/data/admin/admin-get-course";

interface EditCourseFormProps {
	data: AdminCourseSingularType;
	userRole?: string;
}

export function EditCourseForm({
	data,
	userRole = "GUEST",
}: EditCourseFormProps) {
	const [pending, startTransition] = useTransition();
	const router = useRouter();

	const form = useForm<CourseSchemaType>({
		resolver: zodResolver(courseSchema),
		defaultValues: {
			title: data.title ?? "",
			description: data.description ?? "",
			fileKey: data.fileKey ?? "",
			smallDescription: data.smallDescription ?? "",
			slug: data.slug ?? "",
			status: data.status,
			division: data.division ?? undefined,
		},
	});

	function onSubmit(values: CourseSchemaType) {
		startTransition(async () => {
			const { data: result, error } = await tryCatch(
				editCourse(values, data.id),
			);

			if (error) {
				toast.error("An unexpected error occured. Please try again");
				return;
			}

			if (result?.status === "success") {
				toast.success(result?.message);
				router.push("/admin/courses");
			} else if (result?.status === "error") {
				toast.error(result?.message);
			}
		});
	}

	return (
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
								<CourseRichTextEditor field={field} />
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

				<Button type="submit" disabled={pending} className="cursor-pointer">
					{pending ? (
						<>
							Updating... <Loader2 className="animate-spin" />
						</>
					) : (
						<>
							Update Course <PlusIcon className="ml-1" size={16} />
						</>
					)}
				</Button>
			</form>
		</Form>
	);
}
