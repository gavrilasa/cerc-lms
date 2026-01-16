import { Suspense } from "react";
import { EnrolledCoursesSection } from "./_components/EnrolledCoursesSection";
import { EnrolledCoursesSkeleton } from "./_components/DashboardSkeletons";
import { DashboardHeader } from "./_components/DashboardHeader";
import { RecentActivity } from "./_components/RecentActivity";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
	title: "Dashboard Pembelajaran",
};

export default async function DashboardPage() {
	return (
		<div className="flex flex-col gap-y-8 pb-10">
			<Suspense fallback={<DashboardHeaderSkeleton />}>
				<DashboardHeader />
			</Suspense>

			<div className="grid gap-8 lg:grid-cols-3">
				<div className="lg:col-span-2 space-y-8">
					<section className="space-y-4">
						<Suspense fallback={<EnrolledCoursesSkeleton />}>
							<EnrolledCoursesSection />
						</Suspense>
					</section>
				</div>

				<div className="lg:col-span-1 space-y-8">
					<Suspense fallback={<RecentActivitySkeleton />}>
						<RecentActivity />
					</Suspense>
				</div>
			</div>
		</div>
	);
}

function DashboardHeaderSkeleton() {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<Skeleton className="h-9 w-1/3" />
				<Skeleton className="h-5 w-1/4" />
			</div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={i} className="h-32 w-full rounded-xl" />
				))}
			</div>
		</div>
	);
}

function RecentActivitySkeleton() {
	return (
		<div className="rounded-xl border bg-card text-card-foreground shadow">
			<div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
				<Skeleton className="h-5 w-1/2" />
			</div>
			<div className="p-6 pt-0 space-y-4">
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className="flex items-center space-x-4">
						<div className="space-y-2 w-full">
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-3 w-1/2" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
