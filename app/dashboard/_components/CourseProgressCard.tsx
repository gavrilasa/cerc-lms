"use client";

import { CourseSidebarDataType } from "@/app/data/course/get-course-sidebar-data";
import { EnrolledCourseType } from "@/app/data/user/get-enrolled-courses";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { useCourseProgress } from "@/hooks/use-course-progress";
import { PlayCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface iAppProps {
	data: EnrolledCourseType;
}

export function CourseProgressCard({ data }: iAppProps) {
	const thumbnailUrl = useConstructUrl(data.course.fileKey);
	const { totalLessons, completedLessons, progressPercentage } =
		useCourseProgress({
			courseData: data.course as unknown as CourseSidebarDataType["course"],
		});

	return (
		<Card className="group relative py-0 gap-0 overflow-hidden hover:shadow-lg transition-all duration-300">
			{/* Gambar Thumbnail */}
			<div className="relative w-full aspect-video">
				<Image
					src={thumbnailUrl}
					alt={`Thumbnail for ${data.course.title}`}
					fill
					className="object-cover transition-transform duration-300 group-hover:scale-105"
				/>
				{/* Overlay Play Icon saat Hover */}
				<div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
					<PlayCircle className="w-12 h-12 text-white drop-shadow-md" />
				</div>
			</div>

			<CardContent className="p-4 flex flex-col gap-3">
				{/* Judul Kursus */}
				<Link
					className="font-semibold text-lg line-clamp-1 hover:text-primary transition-colors"
					href={`/dashboard/courses/${data.course.slug}`}
					title={data.course.title}
				>
					{data.course.title}
				</Link>

				{/* Deskripsi Singkat */}
				<p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed h-8">
					{data.course.smallDescription}
				</p>

				{/* Bagian Progress */}
				<div className="mt-2 space-y-2">
					<div className="flex justify-between items-end text-sm">
						<span className="text-muted-foreground font-medium text-xs">
							Progress
						</span>
						<span className="font-bold text-primary">
							{progressPercentage}%
						</span>
					</div>

					<Progress value={progressPercentage} className="h-2" />

					<p className="text-xs text-muted-foreground text-right">
						{completedLessons}/{totalLessons} Lessons
					</p>
				</div>

				{/* Tombol Aksi */}
				<Link
					href={`/dashboard/courses/${data.course.slug}`}
					className={buttonVariants({ className: "w-full mt-2" })}
				>
					Continue Learning
				</Link>
			</CardContent>
		</Card>
	);
}

export function PublicCourseCardSkeleton() {
	return (
		<Card className="group relative py-0 gap-0 overflow-hidden">
			<div className="w-full relative aspect-video">
				<Skeleton className="w-full h-full" />
			</div>
			<CardContent className="p-4 flex flex-col gap-3">
				<Skeleton className="h-6 w-3/4 rounded" />
				<Skeleton className="h-8 w-full rounded" />

				<div className="mt-2 space-y-2">
					<div className="flex justify-between">
						<Skeleton className="h-4 w-12" />
						<Skeleton className="h-4 w-8" />
					</div>
					<Skeleton className="h-2 w-full rounded-full" />
					<div className="flex justify-end">
						<Skeleton className="h-3 w-16" />
					</div>
				</div>

				<Skeleton className="mt-2 w-full h-10 rounded-md" />
			</CardContent>
		</Card>
	);
}
