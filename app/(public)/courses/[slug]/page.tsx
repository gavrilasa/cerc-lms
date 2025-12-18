import { getIndividualCourse } from "@/app/data/course/get-course";
import { getUserCurriculumDetails } from "@/app/data/curriculum/get-user-curriculum-details";
import { requireUser } from "@/app/data/user/require-user";
import { EnrollmentButton } from "./_components/EnrollmentButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Clock, Signal, Video, Lock } from "lucide-react";
import Image from "next/image";
import { env } from "@/lib/env";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CoursePage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	// 1. Ambil Data User & Course Dasar
	const user = await requireUser();
	const course = await getIndividualCourse(slug);

	// 2. Ambil Detail Dashboard User (Single Source of Truth)
	const dashboardData = await getUserCurriculumDetails(user.id);

	// 3. Tentukan Status Akses & Pesan Lock
	let isLocked = false;
	let lockedMessage = "";
	let isInCurriculum = false;

	if (!dashboardData) {
		// Edge Case: User belum pilih kurikulum
		isLocked = true;
		lockedMessage = "Anda belum memilih kurikulum.";
	} else {
		// Cek di Core Courses
		const coreIndex = dashboardData.coreCourses.findIndex(
			(c) => c.id === course.id
		);

		if (coreIndex !== -1) {
			isInCurriculum = true;
			const coreCourse = dashboardData.coreCourses[coreIndex];
			isLocked = coreCourse.isLocked;

			if (isLocked) {
				// Logic Pesan: Cari course sebelumnya
				if (coreIndex > 0) {
					const prevCourse = dashboardData.coreCourses[coreIndex - 1];
					lockedMessage = `Selesaikan "${prevCourse.title}" untuk membuka materi ini.`;
				} else {
					lockedMessage = "Selesaikan materi sebelumnya dalam roadmap.";
				}
			}
		} else {
			// Cek di Elective Courses
			const electiveCourse = dashboardData.electiveCourses.find(
				(c) => c.id === course.id
			);

			if (electiveCourse) {
				isInCurriculum = true;
				isLocked = electiveCourse.isLocked;
				if (isLocked) {
					lockedMessage =
						"Selesaikan seluruh Kurikulum Wajib (Core) untuk membuka materi pengayaan ini.";
				}
			}
		}
	}

	// Jika course tidak ada di kurikulum user sama sekali (Cross-curriculum browsing prevention)
	if (dashboardData && !isInCurriculum) {
		return (
			<div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
				<Lock className="h-12 w-12 mx-auto text-muted-foreground" />
				<h1 className="text-2xl font-bold">Akses Dibatasi</h1>
				<p className="text-muted-foreground">
					Course ini tidak tersedia dalam kurikulum{" "}
					<strong>{dashboardData.curriculumInfo.title}</strong> yang Anda ambil.
				</p>
				<Button asChild className="mt-4">
					<Link href="/dashboard">Kembali ke Dashboard</Link>
				</Button>
			</div>
		);
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
