import { Suspense } from "react";
import { requireSession } from "@/app/data/auth/require-session";
import { EnrolledCoursesSection } from "./_components/EnrolledCoursesSection";
import { AvailableCoursesSection } from "./_components/AvailableCoursesSection";
import {
	EnrolledCoursesSkeleton,
	AvailableCoursesSkeleton,
} from "./_components/DashboardSkeletons";
import { Separator } from "@/components/ui/separator";

export const metadata = {
	title: "Dashboard Pembelajaran",
};

export default async function DashboardPage() {
	// User info is fetched first (fast, cached) for UI display
	const { user } = await requireSession();

	return (
		<div className="flex flex-col gap-y-10 pb-10">
			{/* Enrolled Courses Section with Suspense */}
			<section className="space-y-6">
				<Suspense fallback={<EnrolledCoursesSkeleton />}>
					<EnrolledCoursesSection />
				</Suspense>
			</section>

			<Separator />

			{/* Available Courses Section with Suspense */}
			<section id="available-courses" className="space-y-6">
				<Suspense fallback={<AvailableCoursesSkeleton />}>
					<AvailableCoursesSection userDivision={user.division} />
				</Suspense>
			</section>
		</div>
	);
}
