import { Suspense } from "react";
import { EnrolledCoursesSection } from "./_components/EnrolledCoursesSection";
import { EnrolledCoursesSkeleton } from "./_components/DashboardSkeletons";

export const metadata = {
	title: "Dashboard Pembelajaran",
};

export default async function DashboardPage() {
	return (
		<div className="flex flex-col gap-y-10 pb-10">
			<section className="space-y-6">
				<Suspense fallback={<EnrolledCoursesSkeleton />}>
					<EnrolledCoursesSection />
				</Suspense>
			</section>
		</div>
	);
}
