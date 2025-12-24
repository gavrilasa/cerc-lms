import { getCourseBySlug } from "@/app/data/course/get-course-by-slug";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Lock } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { DivisionBadge } from "@/components/general/DivisionBadge";
import { Division } from "@/lib/generated/prisma/enums";
import { requireUser } from "@/app/data/user/require-user";
import { checkUserEnrollment } from "@/app/data/user/check-enrollment";
import { EnrollmentAction } from "./_components/EnrollmentAction";

interface TiptapNode {
	type?: string;
	text?: string;
	content?: TiptapNode[];
}

interface TiptapDoc {
	type: "doc";
	content?: TiptapNode[];
}

// Utilitas Parsing JSON Deskripsi
function getJSONContent(description: string | null) {
	if (!description) return "No description available";
	try {
		const json = JSON.parse(description) as TiptapDoc;

		// Cek struktur Tiptap
		if (json.content && Array.isArray(json.content)) {
			return json.content
				.map((node) => {
					if (node.content && Array.isArray(node.content)) {
						return node.content
							.map((innerNode) => innerNode.text || "")
							.join(" ");
					}
					return node.text || "";
				})
				.join("\n\n");
		}
		return description;
	} catch {
		return description;
	}
}

export default async function CourseDetailPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const course = await getCourseBySlug(slug);

	if (!course) return notFound();

	// 1. Ambil User & Cek Enrollment
	const user = await requireUser();
	const enrollment = await checkUserEnrollment(user.id, course.id);

	// 2. Hitung total lessons
	const totalLessons = course.chapters.reduce(
		(acc, chapter) => acc + chapter.lessons.length,
		0
	);

	// 3. Cari Lesson Pertama untuk tombol "Lanjutkan Belajar"
	// Ambil chapter pertama, lalu lesson pertama dari chapter tersebut
	const firstChapter = course.chapters[0];
	const firstLesson = firstChapter?.lessons[0];
	const firstLessonId = firstLesson?.id;

	return (
		<div className="container mx-auto py-10 px-4 md:px-8 max-w-6xl">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
				{/* Kolom Kiri: Detail Konten */}
				<div className="lg:col-span-2 space-y-8">
					<div>
						<h1 className="text-3xl font-bold tracking-tight mb-4">
							{course.title}
						</h1>
						<div className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
							{getJSONContent(course.description)}
						</div>
					</div>

					<Separator />

					<div className="space-y-4">
						<h2 className="text-xl font-semibold flex items-center gap-2">
							<BookOpen className="w-5 h-5 text-primary" />
							Curriculum
						</h2>
						<div className="space-y-4">
							{course.chapters.map((chapter) => (
								<Card key={chapter.id}>
									<CardHeader className="py-3 bg-muted/20">
										<CardTitle className="text-base font-medium">
											{chapter.title}
										</CardTitle>
									</CardHeader>
									<CardContent className="py-3">
										<ul className="space-y-2">
											{chapter.lessons.map((lesson) => (
												<li
													key={lesson.id}
													className="flex items-center gap-2 text-sm text-muted-foreground"
												>
													<Lock className="w-3 h-3" />
													{lesson.title}
												</li>
											))}
										</ul>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</div>

				{/* Kolom Kanan: Sticky Sidebar/Enroll Card */}
				<div className="lg:col-span-1">
					<Card className="sticky top-24 overflow-hidden border-2 border-primary/10 shadow-lg">
						<div className="relative w-full aspect-video">
							<Image
								src={`https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES}.t3.storage.dev/${course.fileKey}`}
								alt={course.title}
								fill
								className="object-cover"
							/>
						</div>
						<CardHeader>
							<div className="mb-2">
								<DivisionBadge division={course.division as Division} />
							</div>
							<CardTitle>{course.title}</CardTitle>
							<CardDescription>{course.smallDescription}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Total Lessons</span>
								<span className="font-semibold">{totalLessons} Lessons</span>
							</div>
							<Separator />

							{/* Komponen EnrollmentAction menangani logika:
                  - Jika isEnrolled=true -> Tampilkan "Lanjutkan Belajar"
                  - Jika isEnrolled=false -> Tampilkan "Mulai Belajar Sekarang" (Action Enroll)
              */}
							<EnrollmentAction
								courseId={course.id}
								courseSlug={course.slug}
								isEnrolled={!!enrollment} // Konversi object ke boolean
								firstLessonId={firstLessonId}
							/>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
