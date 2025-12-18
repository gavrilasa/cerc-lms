"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PlayCircle, ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { enrollUser } from "../actions";

interface EnrollmentActionProps {
	courseId: string;
	courseSlug: string;
	isEnrolled: boolean;
	firstLessonId?: string;
}

export function EnrollmentAction({
	courseId,
	courseSlug,
	isEnrolled,
	firstLessonId,
}: EnrollmentActionProps) {
	const [isPending, startTransition] = useTransition();

	const handleEnroll = () => {
		startTransition(async () => {
			try {
				const result = await enrollUser(courseId);

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success(result.message || "Berhasil mendaftar kelas!");
				}
			} catch (error) {
				toast.error("Terjadi kesalahan yang tidak terduga.");
				console.error(error);
			}
		});
	};

	// KONDISI A: SUDAH ENROLL
	if (isEnrolled) {
		if (!firstLessonId) {
			return (
				<Button disabled variant="secondary" className="w-full sm:w-auto">
					Materi Belum Tersedia
				</Button>
			);
		}

		return (
			<Button asChild size="lg" className="w-full sm:w-auto gap-2 text-base">
				<Link href={`/dashboard/courses/${courseSlug}/learn/${firstLessonId}`}>
					<PlayCircle className="w-5 h-5" />
					Lanjutkan Belajar
				</Link>
			</Button>
		);
	}

	// KONDISI B: BELUM ENROLL
	return (
		<Button
			size="lg"
			className="w-full sm:w-auto gap-2 text-base font-semibold"
			onClick={handleEnroll}
			disabled={isPending}
		>
			{isPending ? (
				<>
					<Loader2 className="w-5 h-5 animate-spin" />
					Mendaftarkan...
				</>
			) : (
				<>
					<ArrowRight className="w-5 h-5" />
					Mulai Belajar Sekarang
				</>
			)}
		</Button>
	);
}
