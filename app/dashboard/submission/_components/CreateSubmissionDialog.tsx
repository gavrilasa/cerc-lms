"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { createSubmission } from "../actions";
import { SubmissionType } from "@/lib/generated/prisma/enums";

interface Course {
	id: string;
	title: string;
	slug: string;
}

interface CreateSubmissionDialogProps {
	enrolledCourses: Course[];
}

interface LinkInput {
	label: string;
	url: string;
}

export function CreateSubmissionDialog({
	enrolledCourses,
}: CreateSubmissionDialogProps) {
	const [open, setOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	const [type, setType] = useState<"TASK" | "PROJECT">("TASK");
	const [courseId, setCourseId] = useState<string>("");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [links, setLinks] = useState<LinkInput[]>([{ label: "", url: "" }]);

	const resetForm = () => {
		setType("TASK");
		setCourseId("");
		setTitle("");
		setDescription("");
		setLinks([{ label: "", url: "" }]);
	};

	const addLink = () => {
		if (links.length < 10) {
			setLinks([...links, { label: "", url: "" }]);
		}
	};

	const removeLink = (index: number) => {
		if (links.length > 1) {
			setLinks(links.filter((_, i) => i !== index));
		}
	};

	const updateLink = (index: number, field: "label" | "url", value: string) => {
		const newLinks = [...links];
		newLinks[index][field] = value;
		setLinks(newLinks);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		startTransition(async () => {
			const result = await createSubmission({
				title,
				description: description || undefined,
				type: type as SubmissionType,
				courseId: type === "TASK" ? courseId : undefined,
				links: links.filter((l) => l.label && l.url),
			});

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success(result.message);
				setOpen(false);
				resetForm();
				router.refresh();
			}
		});
	};

	const isValid =
		title.trim() &&
		links.some((l) => l.label.trim() && l.url.trim()) &&
		(type === "PROJECT" || (type === "TASK" && courseId));

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="cursor-pointer">
					<IconPlus className="mr-2 h-4 w-4" />
					Buat Submission
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Buat Submission Baru</DialogTitle>
					<DialogDescription>
						Kirim tugas atau project Anda untuk mendapatkan poin.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Type Selection with Tabs */}
					<div className="space-y-2">
						<Label>Tipe Submission</Label>
						<Tabs
							value={type}
							onValueChange={(v) => setType(v as "TASK" | "PROJECT")}
						>
							<TabsList className="w-full">
								<TabsTrigger value="TASK" className="flex-1">
									Task (Tugas Course)
								</TabsTrigger>
								<TabsTrigger value="PROJECT" className="flex-1">
									Project (Independen)
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>

					{/* Course Selection (Only for TASK) */}
					{type === "TASK" && (
						<div className="space-y-2">
							<Label htmlFor="course">Course</Label>
							{enrolledCourses.length === 0 ? (
								<p className="text-sm text-muted-foreground">
									Anda belum terdaftar di course manapun.
								</p>
							) : (
								<Select value={courseId} onValueChange={setCourseId}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Pilih course" />
									</SelectTrigger>
									<SelectContent>
										{enrolledCourses.map((course) => (
											<SelectItem key={course.id} value={course.id}>
												{course.title}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</div>
					)}

					{/* Title */}
					<div className="space-y-2">
						<Label htmlFor="title">Judul</Label>
						<Input
							id="title"
							placeholder="Masukkan judul submission"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							maxLength={200}
						/>
					</div>

					{/* Description */}
					<div className="space-y-2">
						<Label htmlFor="description">Deskripsi (Opsional)</Label>
						<Textarea
							id="description"
							placeholder="Jelaskan submission Anda"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							maxLength={1000}
							rows={3}
						/>
					</div>

					{/* Dynamic Links */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label>Link</Label>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={addLink}
								disabled={links.length >= 10}
							>
								<IconPlus className="mr-1 h-3 w-3" />
								Tambah Link
							</Button>
						</div>
						<div className="space-y-3">
							{links.map((link, index) => (
								<div key={index} className="flex gap-2 items-start">
									<div className="flex-1 space-y-2">
										<Input
											placeholder="Label (e.g., GitHub, Deploy)"
											value={link.label}
											onChange={(e) =>
												updateLink(index, "label", e.target.value)
											}
											maxLength={100}
										/>
										<Input
											placeholder="URL (https://...)"
											value={link.url}
											onChange={(e) => updateLink(index, "url", e.target.value)}
											type="url"
										/>
									</div>
									{links.length > 1 && (
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => removeLink(index)}
											className="mt-1"
										>
											<IconTrash className="h-4 w-4 text-destructive" />
										</Button>
									)}
								</div>
							))}
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							Batal
						</Button>
						<Button type="submit" disabled={!isValid || isPending}>
							{isPending ? "Mengirim..." : "Kirim Submission"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
