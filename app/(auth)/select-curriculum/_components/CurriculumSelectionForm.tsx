"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { selectCurriculum } from "@/app/(auth)/select-curriculum/actions";
import type { CurriculumOption } from "@/app/data/curriculum/get-curriculum-by-division";

interface CurriculumSelectionFormProps {
	curricula: CurriculumOption[];
}

export function CurriculumSelectionForm({
	curricula,
}: CurriculumSelectionFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();

	const handleSelect = async (curriculumId: string) => {
		setIsSubmitting(true);

		try {
			const result = await selectCurriculum({ curriculumId });

			if (result.error) {
				toast.error(result.error);
				setIsSubmitting(false);
				return;
			}

			if (result.success) {
				toast.success("Kurikulum berhasil dipilih!");
				router.push("/dashboard");
			}
		} catch {
			toast.error("Terjadi kesalahan sistem. Silakan coba lagi.");
			setIsSubmitting(false);
		}
	};

	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{curricula.map((curriculum) => (
				<Card key={curriculum.id} className="flex flex-col">
					<CardHeader>
						<div className="flex items-center justify-between mb-2">
							<Badge variant="outline" className="w-fit">
								{curriculum._count.courses} Courses
							</Badge>
						</div>
						<CardTitle className="text-xl">{curriculum.title}</CardTitle>
						<CardDescription className="line-clamp-2">
							{curriculum.slug}
						</CardDescription>
					</CardHeader>
					<CardContent className="flex-1">
						<p className="text-sm text-muted-foreground">
							{curriculum.description}
						</p>
					</CardContent>
					<CardFooter>
						<Button
							className="w-full"
							onClick={() => handleSelect(curriculum.id)}
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Memproses...
								</>
							) : (
								<>
									<CheckCircle2 className="mr-2 h-4 w-4" />
									Pilih Kurikulum Ini
								</>
							)}
						</Button>
					</CardFooter>
				</Card>
			))}
		</div>
	);
}
