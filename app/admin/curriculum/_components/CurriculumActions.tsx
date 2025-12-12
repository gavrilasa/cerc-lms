"use client";

import { useState, useTransition } from "react";
import { reorderCurriculum } from "../../courses/reorder/action";
import { Division } from "@/lib/generated/prisma";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

// --- Tipe Data Minimal ---
type MinimalCourse = { id: string; title: string };

// ==========================================
// 1. MODAL PEMILIHAN COURSE (Insert)
// ==========================================
interface AddCourseModalProps {
	targetPosition: number;
	division: Division;
	poolCourses: MinimalCourse[];
	triggerContent?: React.ReactNode;
	triggerVariant?: "default" | "ghost" | "outline";
	size?: "default" | "sm" | "icon";
	singleMode?: boolean; // Jika true, langsung confirm tanpa pilih list
}

export function AddCourseModal({
	targetPosition,
	division,
	poolCourses,
	triggerContent,
	triggerVariant = "ghost",
	size = "default",
	singleMode = false,
}: AddCourseModalProps) {
	const [open, setOpen] = useState(false);
	const [selectedCourseId, setSelectedCourseId] = useState<string | null>(
		singleMode ? poolCourses[0]?.id : null
	);
	const [showWarning, setShowWarning] = useState(false);
	const [isPending, startTransition] = useTransition();

	const handleInitialClick = () => {
		if (singleMode) {
			setShowWarning(true); // Skip pemilihan, langsung warning
		} else {
			setOpen(true);
		}
	};

	const handleSelect = (id: string) => {
		setSelectedCourseId(id);
		setOpen(false); // Tutup list
		setShowWarning(true); // Buka warning
	};

	const executeAction = () => {
		if (!selectedCourseId) return;

		startTransition(async () => {
			const result = await reorderCurriculum({
				courseId: selectedCourseId,
				newOrder: targetPosition,
				division: division,
			});

			if (result.status === "success") {
				toast.success(`Course berhasil dimasukkan ke urutan ${targetPosition}`);
				setShowWarning(false);
				setOpen(false);
			} else {
				toast.error(result.message);
			}
		});
	};

	return (
		<>
			{/* TRIGGER UTAMA */}
			<Button variant={triggerVariant} size={size} onClick={handleInitialClick}>
				{triggerContent || <ArrowRight className="h-4 w-4" />}
			</Button>

			{/* DIALOG PEMILIHAN (LIST) */}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Sisipkan Course</DialogTitle>
						<DialogDescription>
							Pilih course dari pool untuk dimasukkan ke{" "}
							<strong>Urutan {targetPosition}</strong>.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-2 mt-4 max-h-[60vh] overflow-y-auto">
						{poolCourses.map((course) => (
							<Button
								key={course.id}
								variant="outline"
								className="justify-start h-auto py-3 text-left"
								onClick={() => handleSelect(course.id)}
							>
								<div className="flex flex-col items-start gap-1">
									<span className="font-semibold">{course.title}</span>
									<span className="text-xs text-muted-foreground">
										ID: {course.id.slice(0, 8)}...
									</span>
								</div>
							</Button>
						))}
					</div>
				</DialogContent>
			</Dialog>

			{/* ALERT WARNING (CONFIRMATION) */}
			<AlertDialog open={showWarning} onOpenChange={setShowWarning}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="text-destructive">
							Konfirmasi Perubahan Kurikulum
						</AlertDialogTitle>
						<AlertDialogDescription className="space-y-2">
							<p>
								Anda akan memasukkan course ke{" "}
								<strong>Urutan {targetPosition}</strong>.
							</p>
							<div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md text-amber-800 dark:text-amber-100 text-sm">
								<strong>Perhatian:</strong> Mengubah struktur kurikulum akan
								menghitung ulang progres semua siswa. Siswa yang sebelumnya
								memiliki akses mungkin akan{" "}
								<strong>terkunci kembali secara retroaktif</strong> jika belum
								memenuhi urutan baru.
							</div>
							<p>Lanjutkan perubahan ini?</p>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault(); // Mencegah auto-close agar loading terlihat
								executeAction();
							}}
							disabled={isPending}
							className="bg-destructive hover:bg-destructive/90"
						>
							{isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...
								</>
							) : (
								"Ya, Lakukan Perubahan"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

// ==========================================
// 2. ALERT HAPUS DARI KURIKULUM (Remove)
// ==========================================
interface RemoveCourseAlertProps {
	courseId: string;
	courseTitle: string;
	division: Division;
}

export function RemoveCourseAlert({
	courseId,
	courseTitle,
	division,
}: RemoveCourseAlertProps) {
	const [isPending, startTransition] = useTransition();

	const handleRemove = () => {
		startTransition(async () => {
			const result = await reorderCurriculum({
				courseId,
				newOrder: null, // Null artinya hapus dari kurikulum (jadi elective)
				division,
			});

			if (result.status === "success") {
				toast.success("Course dikeluarkan dari kurikulum");
			} else {
				toast.error(result.message);
			}
		});
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="text-muted-foreground hover:text-destructive"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Keluarkan dari Kurikulum?</AlertDialogTitle>
					<AlertDialogDescription>
						Course <strong>&quot;{courseTitle}&quot;</strong> akan dipindahkan
						ke Pool Materi (Elective).
						<br />
						<br />
						Urutan course di bawahnya akan bergeser naik. Siswa tetap bisa
						mengakses course ini jika mereka sudah menyelesaikannya atau jika
						semua kurikulum wajib selesai.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
					<AlertDialogAction
						onClick={(e) => {
							e.preventDefault();
							handleRemove();
						}}
						disabled={isPending}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{isPending ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							"Ya, Keluarkan"
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
