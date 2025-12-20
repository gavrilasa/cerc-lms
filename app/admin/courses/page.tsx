import { adminGetCourses } from "@/app/data/admin/admin-get-courses";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import {
	AdminCourseCard,
	AdminCourseCardSkeleton,
} from "./_components/AdminCourseCard";
import { EmptyState } from "@/components/general/EmptyState";
import { Suspense } from "react";
import { PlusIcon } from "lucide-react";

export default function CoursesPage() {
	return (
		<div className="p-4 space-y-4">
			<div className="flex justify-between">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-bold tracking-tight">
						Courses Management
					</h1>
					<p className="text-muted-foreground">
						Manage Course, Chapter and Lessons (Create, Edit and Delete)
					</p>
				</div>
				<Link className={buttonVariants()} href="/admin/courses/create">
					<PlusIcon />
					Add Course
				</Link>
			</div>

			<Suspense fallback={<AdminCourseCardSkeletonLayout />}>
				<RenderCourses />
			</Suspense>
		</div>
	);
}

async function RenderCourses() {
	const data = await adminGetCourses();

	return (
		<>
			{data.length === 0 ? (
				<EmptyState
					title="No Courses Found"
					description="Create a new course to get started"
					buttonText="Create Course"
					href="/admin/courses/create"
				/>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{data.map((course) => (
						<AdminCourseCard key={course.id} data={course} />
					))}
				</div>
			)}
		</>
	);
}

function AdminCourseCardSkeletonLayout() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
			{Array.from({ length: 4 }).map((_, index) => (
				<AdminCourseCardSkeleton key={index} />
			))}
		</div>
	);
}
