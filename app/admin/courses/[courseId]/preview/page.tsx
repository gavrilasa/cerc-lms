import { adminGetCourse } from "@/app/data/admin/admin-get-course";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DivisionBadge } from "@/components/general/DivisionBadge";
import { RichTextRenderer } from "@/components/general/RichTextRenderer";
import { Division } from "@/lib/generated/prisma/enums";
import { buttonVariants } from "@/components/ui/button";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Preview Course",
};

export default async function AdminCoursePreviewPage({
	params,
}: {
	params: Promise<{ courseId: string }>;
}) {
	const { courseId } = await params;
	const course = await adminGetCourse(courseId);

	const totalLessons = course.chapters.reduce(
		(acc: number, chapter: { lessons: { id: string }[] }) =>
			acc + chapter.lessons.length,
		0,
	);

	return (
		<div className="container mx-auto py-10 px-4 md:px-8 max-w-6xl">
			<div className="mb-6">
				<Link
					href="/admin/courses"
					className={buttonVariants({ variant: "ghost", size: "sm" })}
				>
					<ArrowLeft className="size-4 mr-2" />
					Back to Courses
				</Link>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
				{/* Left Column: Content Details */}
				<div className="lg:col-span-2 space-y-8">
					<div>
						<div className="flex items-center gap-2 mb-4">
							<Badge
								variant={
									course.status === "PUBLISHED" ? "default" : "secondary"
								}
							>
								{course.status}
							</Badge>
						</div>
						<h1 className="text-3xl font-bold tracking-tight mb-4">
							{course.title}
						</h1>
						<div className="text-lg text-muted-foreground leading-relaxed">
							<RichTextRenderer content={course.description} />
						</div>
					</div>

					<Separator />

					<div className="space-y-4">
						<h2 className="text-xl font-semibold flex items-center gap-2">
							<BookOpen className="w-5 h-5 text-primary" />
							Lessons
						</h2>
						<div className="space-y-2">
							{course.chapters.length === 0 ? (
								<p className="text-muted-foreground">
									No chapters available yet.
								</p>
							) : (
								<Accordion type="multiple" className="w-full">
									{course.chapters.map(
										(chapter: {
											id: string;
											title: string;
											lessons: { id: string; title: string }[];
										}) => (
											<AccordionItem value={chapter.id} key={chapter.id}>
												<AccordionTrigger className="text-base font-medium cursor-pointer">
													{chapter.title}
												</AccordionTrigger>
												<AccordionContent>
													{chapter.lessons.length === 0 ? (
														<p className="text-sm text-muted-foreground">
															No lessons in this chapter.
														</p>
													) : (
														<ul className="space-y-2">
															{chapter.lessons.map(
																(
																	lesson: { id: string; title: string },
																	index: number,
																) => (
																	<li
																		key={lesson.id}
																		className="flex items-center gap-2 text-sm text-muted-foreground"
																	>
																		<span className="font-medium text-foreground">
																			{index + 1}.
																		</span>
																		{lesson.title}
																	</li>
																),
															)}
														</ul>
													)}
												</AccordionContent>
											</AccordionItem>
										),
									)}
								</Accordion>
							)}
						</div>
					</div>
				</div>

				{/* Right Column: Sticky Sidebar */}
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

							<Link
								href={`/admin/courses/${course.id}/edit`}
								className={buttonVariants({ className: "w-full" })}
							>
								Edit Course
							</Link>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
