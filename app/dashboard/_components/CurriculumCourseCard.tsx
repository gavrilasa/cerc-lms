"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Course, Enrollment, Lesson } from "@/lib/generated/prisma/client";
import { Division } from "@/lib/generated/prisma/enums";
import { BookOpen, CheckCircle } from "lucide-react";
import Image from "next/image";
import { DivisionBadge } from "@/components/general/DivisionBadge";

interface CurriculumCourseCardProps {
	course: Course & {
		enrollments: Enrollment[];
		lessons: Lesson[];
		_count?: {
			lessons: number;
		};
	};
	curriculumId?: string;
	isSelected?: boolean;
	onSelect?: (courseId: string) => void;
	isEnrolled?: boolean;
	isLocked?: boolean;
}

export function CurriculumCourseCard({
	course,
	isSelected,
	onSelect,
	isEnrolled,
}: CurriculumCourseCardProps) {
	// Hitung total lessons dari _count (prioritas) atau panjang array lessons
	const totalLessons = course._count?.lessons ?? course.lessons?.length ?? 0;

	return (
		<Card
			className={cn(
				"h-full flex flex-col transition-all duration-300 hover:shadow-lg relative overflow-hidden group",
				isSelected ? "ring-2 ring-primary border-primary" : "border-border"
			)}
		>
			<div className="relative w-full aspect-video overflow-hidden">
				{/* Render Image dengan aman */}
				<Image
					src={`https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES}.t3.storage.dev/${course.fileKey}`}
					alt={course.title}
					fill
					className="object-cover transition-transform duration-300 group-hover:scale-105"
				/>

				{/* Overlay Badges */}
				<div className="absolute top-2 right-2 flex flex-col gap-2">
					{/* Hanya Division yang tersisa sebagai metadata utama */}
					<DivisionBadge division={course.division as Division} />

					{/* Level dihapus sesuai rencana refactor */}
				</div>

				{/* Selected Overlay Indicator */}
				{isSelected && (
					<div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[1px]">
						<div className="bg-background rounded-full p-2 text-primary shadow-lg animate-in zoom-in">
							<CheckCircle className="w-6 h-6" />
						</div>
					</div>
				)}
			</div>

			<CardHeader className="p-4 pb-2">
				<CardTitle className="line-clamp-1 text-lg group-hover:text-primary transition-colors">
					{course.title}
				</CardTitle>
				<CardDescription className="line-clamp-2 text-xs mt-1 h-8">
					{course.smallDescription}
				</CardDescription>
			</CardHeader>

			<CardContent className="p-4 pt-2 grow">
				{/* Footer Metadata Baru: Fokus ke Kuantitas Materi */}
				<div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
					<div className="flex items-center gap-1.5">
						<BookOpen className="w-3.5 h-3.5" />
						<span className="font-medium">
							{totalLessons === 0 ? "Coming Soon" : `${totalLessons} Lessons`}
						</span>
					</div>
				</div>
			</CardContent>

			<CardFooter className="p-4 pt-0">
				{isEnrolled ? (
					<Button variant="secondary" className="w-full" disabled>
						Already Enrolled
					</Button>
				) : (
					<Button
						variant={isSelected ? "default" : "outline"}
						className={cn("w-full gap-2", isSelected && "bg-primary")}
						onClick={() => onSelect?.(course.id)}
					>
						{isSelected ? "Selected" : "Select Course"}
					</Button>
				)}
			</CardFooter>
		</Card>
	);
}
