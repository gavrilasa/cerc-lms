import { getCourse } from "@/app/data/course/get-course";
import { userIsEnrolled } from "@/app/data/user/user-is-enrolled";
import { notFound } from "next/navigation";
import { EnrollmentAction } from "./_components/EnrollmentAction";
import { CourseSyllabus } from "./_components/CourseSyllabus";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CourseThumbnail } from "./_components/CourseThumbnail";
import { CalendarDays, Clock, BarChart } from "lucide-react";

// Tipe Params harus sesuai dengan Next.js 15+ (Promise)
type Params = Promise<{ slug: string }>;

export default async function CourseDetailPage(props: { params: Params }) {
	const params = await props.params;

	const course = await getCourse(params.slug);

	if (!course) {
		return notFound();
	}

	// Sekarang fungsi ini sudah tersedia dengan nama yang benar
	const isEnrolled = await userIsEnrolled(course.id);

	// Sorting manual sebagai fallback (meski di DB sudah di-sort)
	const sortedChapters = course.chapter.sort((a, b) => a.position - b.position);
	const firstChapter = sortedChapters[0];
	const firstLesson = firstChapter?.lessons.sort(
		(a, b) => a.position - b.position
	)[0];
	const firstLessonId = firstLesson?.id;

	return (
		<div className="container mx-auto py-8 space-y-8 max-w-5xl">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2 space-y-6">
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Badge variant="secondary" className="uppercase tracking-wider">
								{/* Division sekarang ada di tipe data */}
								{course.division}
							</Badge>
							<Badge variant="outline">{course.level}</Badge>
							<Badge
								className={
									course.status === "Published"
										? "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200"
										: "bg-yellow-500/10 text-yellow-600 border-yellow-200"
								}
							>
								{course.status}
							</Badge>
						</div>

						<h1 className="text-4xl font-bold tracking-tight text-foreground">
							{course.title}
						</h1>

						<p className="text-lg text-muted-foreground leading-relaxed">
							{course.smallDescription}
						</p>
					</div>

					<div className="flex items-center gap-6 text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<Clock className="w-4 h-4" />
							<span>{Math.round(course.duration / 60)} Jam Konten</span>
						</div>
						<div className="flex items-center gap-2">
							<BarChart className="w-4 h-4" />
							<span>Level {course.level}</span>
						</div>
						<div className="flex items-center gap-2">
							<CalendarDays className="w-4 h-4" />
							{/* UpdatedAt sekarang ada */}
							<span>
								Update: {new Date(course.updatedAt).toLocaleDateString("id-ID")}
							</span>
						</div>
					</div>

					<div className="pt-4">
						<EnrollmentAction
							courseId={course.id}
							courseSlug={course.slug || params.slug}
							isEnrolled={isEnrolled}
							firstLessonId={firstLessonId}
						/>
					</div>
				</div>

				<div className="lg:col-span-1">
					<div className="rounded-xl overflow-hidden shadow-lg border bg-muted aspect-video relative">
						<CourseThumbnail fileKey={course.fileKey} title={course.title} />
					</div>
				</div>
			</div>

			<Separator />

			<div className="space-y-6">
				<h2 className="text-2xl font-bold tracking-tight">Materi Kursus</h2>

				<CourseSyllabus chapters={course.chapter} isEnrolled={isEnrolled} />
			</div>
		</div>
	);
}
