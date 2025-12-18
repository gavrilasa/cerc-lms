"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { createCurriculum } from "../actions";
import { Division } from "@/lib/generated/prisma/enums";

// Schema lokal untuk form (sinkron dengan Server Action)
const formSchema = z.object({
	title: z.string().min(3, "Minimal 3 karakter"),
	slug: z
		.string()
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug harus lowercase & dash"),
	division: z.nativeEnum(Division),
	description: z.string().min(10, "Deskripsi minimal 10 karakter"),
});

export function CreateCurriculumDialog() {
	const [open, setOpen] = useState(false);
	const [isPending, setIsPending] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "",
			slug: "",
			description: "",
			division: undefined,
		},
	});

	// Auto-generate slug dari title
	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const title = e.target.value;
		form.setValue("title", title);
		const slug = title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
		form.setValue("slug", slug);
	};

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setIsPending(true);
		const formData = new FormData();
		Object.entries(values).forEach(([key, value]) => {
			formData.append(key, value);
		});

		try {
			// Panggil Server Action
			const result = await createCurriculum(null, formData);

			if (result?.error) {
				if (typeof result.error === "string") {
					toast.error(result.error);
				} else {
					// Handle Zod errors dari server
					toast.error("Validasi gagal, periksa input Anda.");
				}
			} else {
				toast.success("Kurikulum berhasil dibuat!");
				setOpen(false);
				form.reset();
			}
		} catch {
			toast.error("Terjadi kesalahan sistem.");
		} finally {
			setIsPending(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Buat Kurikulum
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Buat Kurikulum Baru</DialogTitle>
					<DialogDescription>
						Tentukan detail dasar kurikulum. Anda bisa menambahkan course
						setelah ini.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Judul Kurikulum</FormLabel>
									<FormControl>
										<Input
											placeholder="Contoh: Backend Engineering"
											{...field}
											onChange={handleTitleChange}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="slug"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Slug (URL)</FormLabel>
									<FormControl>
										<Input placeholder="backend-engineering" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="division"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Divisi</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Pilih divisi..." />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{Object.values(Division)
												.filter((d) => d !== "GLOBAL")
												.map((div) => (
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

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Deskripsi Singkat</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Jelaskan fokus kurikulum ini..."
											className="resize-none"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter className="pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
								disabled={isPending}
							>
								Batal
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Simpan Kurikulum
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
