"use client";

import Link from "next/link";
import Image from "next/image";
import { Lock, PlayCircle, CheckCircle, BookOpen } from "lucide-react";

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DashboardCourse } from "@/app/data/curriculum/get-user-curriculum-details";
import { cn } from "@/lib/utils";
import { useConstructUrl } from "@/hooks/use-construct-url";

interface CurriculumCourseCardProps {
	course: DashboardCourse;
	isLocked: boolean;
}

export function CurriculumCourseCard({
	course,
	isLocked,
}: CurriculumCourseCardProps) {
	const isCompleted = course.status === "Completed";
	const inProgress = course.status === "Active";

	const imageUrl = useConstructUrl(course.thumbnail);

	const CardContentInner = () => (
		<Card
			className={cn(
				"flex flex-col h-full overflow-hidden transition-all duration-200",
				isLocked
					? "bg-muted opacity-60 grayscale cursor-not-allowed border-dashed"
					: "hover:shadow-md hover:border-primary/50"
			)}
		>
			<div className="relative w-full aspect-video bg-muted">
				{imageUrl ? (
					<Image
						src={imageUrl}
						alt={course.title}
						fill
						className="object-cover"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					/>
				) : (
					<div className="flex items-center justify-center w-full h-full bg-secondary/20">
						<BookOpen className="h-10 w-10 text-muted-foreground/50" />
					</div>
				)}

				{isLocked && (
					<div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
						<Lock className="h-8 w-8 text-muted-foreground" />
					</div>
				)}

				{isCompleted && !isLocked && (
					<div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-sm">
						<CheckCircle className="h-4 w-4" />
					</div>
				)}
			</div>

			<CardHeader className="p-4 pb-2">
				<div className="flex justify-between items-start gap-2">
					<Badge variant="outline" className="text-[10px] h-5">
						{course.level}
					</Badge>
					{inProgress && !isLocked && (
						<Badge className="text-[10px] h-5 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200 shadow-none">
							In Progress
						</Badge>
					)}
				</div>
				<CardTitle className="text-base font-semibold line-clamp-2 mt-2">
					{course.title}
				</CardTitle>
			</CardHeader>

			<CardContent className="p-4 pt-0 flex-1">
				<p className="text-xs text-muted-foreground">
					{Math.round(course.duration / 60)} Jam Pembelajaran
				</p>
			</CardContent>

			<CardFooter className="p-4 pt-0 mt-auto">
				<Button
					variant={isCompleted ? "outline" : "default"}
					size="sm"
					className="w-full gap-2"
					disabled={isLocked}
				>
					{!isLocked && <PlayCircle className="h-4 w-4" />}
					{isLocked
						? "Terkunci"
						: isCompleted
							? "Ulangi Materi"
							: inProgress
								? "Lanjutkan"
								: "Mulai Belajar"}
				</Button>
			</CardFooter>
		</Card>
	);

	if (isLocked) {
		return (
			<TooltipProvider>
				<Tooltip delayDuration={0}>
					<TooltipTrigger asChild>
						<div className="h-full select-none">
							<CardContentInner />
						</div>
					</TooltipTrigger>
					<TooltipContent className="bg-destructive text-destructive-foreground">
						<p className="flex items-center gap-2">
							<Lock className="h-3 w-3" />
							Selesaikan Kurikulum Utama untuk membuka materi ini.
						</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	return (
		<Link
			href={`/dashboard/${course.slug}`}
			className="h-full block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg"
		>
			<CardContentInner />
		</Link>
	);
}
