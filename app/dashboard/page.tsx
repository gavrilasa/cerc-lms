import { getEnrolledCourses } from "@/app/data/user/get-enrolled-courses";
import { getAvailableCourses } from "@/app/data/course/get-available-courses";
import { CourseProgressCard } from "./_components/CourseProgressCard";
import { CurriculumCourseCard } from "./_components/CurriculumCourseCard";
import { EmptyState } from "@/components/general/EmptyState";
import { Separator } from "@/components/ui/separator";
import { requireUser } from "@/app/data/user/require-user";

export const metadata = {
	title: "Dashboard Pembelajaran",
};

export default async function DashboardPage() {
	const user = await requireUser();

	const [enrolledCourses, availableCourses] = await Promise.all([
		getEnrolledCourses(),
		getAvailableCourses(),
	]);

	return (
		<div className="flex flex-col gap-y-10 pb-10">
			<section className="space-y-6">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-bold tracking-tight">
						Lanjutkan Belajar
					</h2>
					<span className="text-sm text-muted-foreground">
						{enrolledCourses.length} Kursus Aktif
					</span>
				</div>

				{enrolledCourses.length > 0 ? (
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
			</section>

			<Separator />

			<section id="available-courses" className="space-y-6">
				<div className="space-y-1">
					<h2 className="text-2xl font-bold tracking-tight">Katalog Kursus</h2>
					<p className="text-muted-foreground">
						Daftar kursus yang tersedia untuk divisi Anda ({user.division}).
					</p>
				</div>

				{availableCourses.length > 0 ? (
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{availableCourses.map((course) => (
							<CurriculumCourseCard
								key={course.id}
								isLocked={false}
								course={{
									id: course.id,
									title: course.title,
									slug: `courses/${course.slug}`,
									duration: course.duration,
									level: course.level,
									thumbnail: course.fileKey,
									status: "NotStarted",
									smallDescription: course.smallDescription,
									category: course.category,
									isLocked: false,
									type: "ELECTIVE",
									order: null,
									createdAt: course.updatedAt,
								}}
							/>
						))}
					</div>
				) : (
					<div className="py-12 text-center border-2 border-dashed rounded-lg">
						<p className="text-muted-foreground">
							Tidak ada kursus baru yang tersedia saat ini untuk divisi Anda.
						</p>
					</div>
				)}
			</section>
		</div>
	);
}
