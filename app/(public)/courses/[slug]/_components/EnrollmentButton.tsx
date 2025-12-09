"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { enrollInCourseAction } from "../actions";
import { toast } from "sonner";
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

interface EnrollmentButtonProps {
	courseId: string;
}

export function EnrollmentButton({ courseId }: EnrollmentButtonProps) {
	const [pending, startTransition] = useTransition();

	function onEnroll() {
		startTransition(async () => {
			const result = await enrollInCourseAction(courseId);

			if (result.status === "error") {
				toast.error(result.message);
			}
		});
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button className="w-full font-semibold" size="lg">
					Mulai Belajar
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Mulai Kursus Ini?</AlertDialogTitle>
					<AlertDialogDescription>
						Anda akan terdaftar di kursus ini secara gratis dan dapat langsung
						mengakses seluruh materi pembelajaran.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Batal</AlertDialogCancel>
					<AlertDialogAction onClick={onEnroll} disabled={pending}>
						{pending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Memproses...
							</>
						) : (
							"Ya, Mulai Belajar"
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
