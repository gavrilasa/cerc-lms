"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for CourseProgressCard
 */
export function CourseProgressCardSkeleton() {
	return (
		<div className="rounded-lg border bg-card overflow-hidden">
			<Skeleton className="aspect-video w-full" />
			<div className="p-4 space-y-3">
				<Skeleton className="h-5 w-3/4" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-2 w-full" />
			</div>
		</div>
	);
}

/**
 * Loading skeleton for a grid of course progress cards
 */
export function EnrolledCoursesSkeleton() {
	return (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{Array.from({ length: 4 }).map((_, i) => (
				<CourseProgressCardSkeleton key={i} />
			))}
		</div>
	);
}

/**
 * Loading skeleton for CurriculumCourseCard
 */
export function CurriculumCourseCardSkeleton() {
	return (
		<div className="rounded-lg border bg-card overflow-hidden">
			<Skeleton className="aspect-video w-full" />
			<div className="p-4 space-y-3">
				<Skeleton className="h-5 w-3/4" />
				<Skeleton className="h-4 w-full" />
				<div className="flex gap-2 pt-2">
					<Skeleton className="h-6 w-16" />
					<Skeleton className="h-6 w-20" />
				</div>
			</div>
		</div>
	);
}

/**
 * Loading skeleton for a grid of available courses
 */
export function AvailableCoursesSkeleton() {
	return (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{Array.from({ length: 4 }).map((_, i) => (
				<CurriculumCourseCardSkeleton key={i} />
			))}
		</div>
	);
}
