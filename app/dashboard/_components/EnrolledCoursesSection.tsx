import { getEnrolledCourses } from "@/app/data/user/get-enrolled-courses";
import { CourseProgressCard } from "./CourseProgressCard";
import { EmptyState } from "@/components/general/EmptyState";

/**
 * Async component for enrolled courses section.
 * To be used with Suspense boundary.
 */
export async function EnrolledCoursesSection() {
	const enrolledCourses = await getEnrolledCourses();

	return (
		<>
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold tracking-tight">Lanjutkan Belajar</h2>
				<span className="text-sm text-muted-foreground">
					{enrolledCourses.length} Kursus Aktif
				</span>
			</div>

			{enrolledCourses.length > 0 ? (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
					{enrolledCourses.map((item) => (
						<CourseProgressCard key={item.course.id} data={item} />
					))}
				</div>
			) : (
				<EmptyState
					title="Belum ada kursus yang diikuti"
					description="Anda belum memulai pembelajaran apapun. Pilih kursus dari katalog di bawah untuk memulai."
					href="#available-courses"
					buttonText="Lihat Katalog"
				/>
			)}
		</>
	);
}
