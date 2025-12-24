import { getAvailableCourses } from "@/app/data/course/get-available-courses";
import { CurriculumCourseCard } from "./CurriculumCourseCard";
import Link from "next/link";

interface AvailableCoursesSectionProps {
	userDivision: string | null | undefined;
}

/**
 * Async component for available courses section.
 * To be used with Suspense boundary.
 */
export async function AvailableCoursesSection({
	userDivision,
}: AvailableCoursesSectionProps) {
	const availableCourses = await getAvailableCourses();

	return (
		<>
			<div className="space-y-1">
				<h2 className="text-2xl font-bold tracking-tight">Katalog Kursus</h2>
				<p className="text-muted-foreground">
					Daftar kursus yang tersedia untuk divisi Anda ({userDivision}).
				</p>
			</div>

			{availableCourses.length > 0 ? (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{availableCourses.map((course) => (
						<Link
							key={course.id}
							href={`/dashboard/courses/${course.slug}`}
							className="block h-full group"
						>
							<CurriculumCourseCard
								// @ts-expect-error: Type mismatch for course props
								course={course}
								isEnrolled={false}
							/>
						</Link>
					))}
				</div>
			) : (
				<div className="py-12 text-center border-2 border-dashed rounded-lg bg-muted/10">
					<p className="text-muted-foreground">
						Tidak ada kursus baru yang tersedia saat ini untuk divisi Anda.
					</p>
				</div>
			)}
		</>
	);
}
