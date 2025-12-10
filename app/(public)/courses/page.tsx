import { getAllCourses } from "@/app/data/course/get-all-courses";
import {
	PublicCourseCard,
	PublicCourseCardSkeleton,
} from "../_components/PublicCourseCard";
import { Suspense } from "react";
import { EmptyState } from "@/components/general/EmptyState";

export default function PublicCoursesRoute() {
	return (
		<div className="mt-5">
			<div className="flex flex-col space-y-2 mb-10">
				<h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
					Explore Courses
				</h1>
				<p className="text-muted-foreground">
					Discover courses tailored for your division.
				</p>
			</div>
			<Suspense fallback={<LoadingSkeletonLayout />}>
				<RenderCourses />
			</Suspense>
		</div>
	);
}

async function RenderCourses() {
	const courses = await getAllCourses();

	if (courses.length === 0) {
		return (
			<div className="col-span-full">
				<EmptyState
					title="No Courses Found"
					description="There are no courses available for your division yet, or you need to login."
					buttonText="Back to Home"
					href="/"
				/>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{courses.map((course) => (
				<PublicCourseCard key={course.id} data={course} />
			))}
		</div>
	);
}

function LoadingSkeletonLayout() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{Array.from({ length: 9 }).map((_, index) => (
				<PublicCourseCardSkeleton key={index} />
			))}
		</div>
	);
}
