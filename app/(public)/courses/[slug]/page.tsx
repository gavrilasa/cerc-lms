import { getIndividualCourse } from "@/app/data/course/get-course";
import { getCurriculumProgress } from "@/app/data/curriculum/get-user-progress";
import { requireUser } from "@/app/data/user/require-user";
import { EnrollmentButton } from "./_components/EnrollmentButton";
import prisma from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Clock, Signal, Video } from "lucide-react";
import Image from "next/image";
import { env } from "@/lib/env";

export default async function CoursePage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	// 1. Ambil Data User & Course Dasar
	const user = await requireUser();
	const course = await getIndividualCourse(slug);

	// 2. Ambil Divisi Course (Diperlukan untuk cek kurikulum)
	const courseContext = await prisma.course.findUnique({
		where: { id: course.id },
		select: {
			division: true,
			curriculumOrder: true,
		},
	});

	if (!courseContext) {
		return <div>Data course tidak lengkap. Hubungi admin.</div>;
	}

	// 3. Ambil Status Kurikulum User (Logic Core)
	const { curriculum, electives } = await getCurriculumProgress(
		user.id,
		courseContext.division
	);

	// 4. Tentukan Status Akses Course Ini
	const currentCourseState =
		curriculum.find((c) => c.id === course.id) ||
		electives.find((c) => c.id === course.id);

	const isLocked = currentCourseState?.state === "LOCKED";

	// 5. Generate Pesan Kunci Dinamis
	let lockedMessage = "Prasyarat belum terpenuhi";

	if (isLocked) {
		if (courseContext.curriculumOrder) {
			const prevOrder = courseContext.curriculumOrder - 1;
			if (prevOrder > 0) {
				const prevCourse = curriculum.find(
					(c) => c.curriculumOrder === prevOrder
				);
				if (prevCourse) {
					lockedMessage = `Selesaikan "${prevCourse.title}" untuk membuka`;
				}
			} else {
				lockedMessage = "Selesaikan course sebelumnya dalam kurikulum";
			}
		} else {
			lockedMessage = "Selesaikan seluruh Kurikulum Wajib terlebih dahulu";
		}
	}

	return (
		<section className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* === Left Column: Course Details === */}
				<div className="lg:col-span-2 space-y-8">
					<div className="space-y-4">
						<h1 className="text-3xl md:text-4xl font-bold text-foreground">
							{course.title}
						</h1>
						<p className="text-muted-foreground text-lg">
							{course.smallDescription}
						</p>

						<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
							<div className="flex items-center gap-1">
								<Signal className="h-4 w-4" />
								<span>{course.level}</span>
							</div>
							<div className="flex items-center gap-1">
								<Clock className="h-4 w-4" />
								<span>{Math.round(course.duration / 60)} Jam</span>
							</div>
							<div className="flex items-center gap-1">
								<BookOpen className="h-4 w-4" />
								<span>{course.category}</span>
							</div>
						</div>
					</div>

					<Separator />

					<div className="prose max-w-none dark:prose-invert">
						<h3 className="text-xl font-semibold mb-4">Deskripsi Kursus</h3>
						<div
							dangerouslySetInnerHTML={{
								__html: JSON.parse(course.description).content || "",
							}}
						/>
					</div>

					<div className="space-y-4">
						<h3 className="text-xl font-semibold">Materi Pembelajaran</h3>
						<div className="grid gap-4">
							{course.chapter.map((chapter) => (
								<Card key={chapter.id}>
									<CardHeader className="py-4">
										<CardTitle className="text-lg flex items-center gap-2">
											<span className="bg-primary/10 text-primary p-1 rounded">
												<Video className="h-4 w-4" />
											</span>
											{chapter.title}
										</CardTitle>
									</CardHeader>
									<CardContent className="pb-4 pt-0">
										<ul className="space-y-2">
											{chapter.lessons.map((lesson) => (
												<li
													key={lesson.id}
													className="flex items-center gap-2 text-sm text-muted-foreground ml-8"
												>
													<div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
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

				{/* === Right Column: Enrollment Card === */}
				<div className="lg:col-span-1">
					<div className="sticky top-24">
						<Card className="overflow-hidden border-2 shadow-lg">
							{course.fileKey && (
								<div className="relative aspect-video w-full overflow-hidden bg-muted">
									<Image
										src={`https://${env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES}.t3.storage.dev/${course.fileKey}`}
										alt={course.title}
										fill
										className="object-cover"
										priority
									/>
								</div>
							)}

							<CardContent className="p-6 space-y-6">
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="font-semibold text-lg">Gratis</span>
										<Badge variant="secondary">{course.category}</Badge>
									</div>
									<p className="text-sm text-muted-foreground">
										Akses penuh ke seluruh materi dan kuis
									</p>
								</div>

								<EnrollmentButton
									courseId={course.id}
									isLocked={isLocked}
									lockedMessage={lockedMessage}
								/>

								<div className="space-y-3 pt-4 border-t">
									<h4 className="font-medium text-sm">Course ini mencakup:</h4>
									<ul className="space-y-2 text-sm text-muted-foreground">
										<li className="flex items-center gap-2">
											<Video className="h-4 w-4" />
											{course.chapter.reduce(
												(acc, c) => acc + c.lessons.length,
												0
											)}{" "}
											Pelajaran
										</li>
										<li className="flex items-center gap-2">
											<Clock className="h-4 w-4" />
											Akses selamanya
										</li>
										<li className="flex items-center gap-2">
											<Signal className="h-4 w-4" />
											Level {course.level}
										</li>
									</ul>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</section>
	);
}
