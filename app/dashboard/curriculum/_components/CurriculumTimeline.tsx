import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Lock, PlayCircle, BookOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CurriculumTimelineItem } from "@/app/data/curriculum/get-curriculum-timeline";

interface CurriculumTimelineProps {
	items: CurriculumTimelineItem[];
	className?: string;
}

const CurriculumTimeline = ({ items, className }: CurriculumTimelineProps) => {
	return (
		<section className={cn("w-full py-8", className)}>
			<div className="container px-4 md:px-6">
				<div className="relative mx-auto max-w-3xl">
					<div className="absolute left-4 top-4 h-[calc(100%-2rem)] w-0.5 bg-muted md:left-6" />

					{items.map((item, index) => {
						// 1. Logika Status (Business Logic pada View Layer)
						const isCompleted = !!item.completedAt;
						const isLocked = index > 0 && !items[index - 1].completedAt;
						const href = `/dashboard/courses/${item.slug}`;

						return (
							<div key={item.courseId} className="relative mb-8 pl-12 md:pl-16">
								{/* 2. Timeline Dot (Conditional Rendering) */}
								<div
									className={cn(
										"absolute left-0 top-6 flex h-8 w-8 -translate-x-0.5 items-center justify-center rounded-full border-4 border-background md:left-2",
										isLocked
											? "bg-muted text-muted-foreground"
											: "bg-primary text-primary-foreground shadow-sm"
									)}
								>
									<div className="h-2 w-2 rounded-full bg-current" />
								</div>

								<h4 className="mb-2 text-sm font-semibold text-muted-foreground">
									#{item.order} Course
								</h4>

								{/* 3. Interactivity & Blocking */}
								{isLocked ? (
									<div className="pointer-events-none select-none opacity-60 grayscale filter">
										<TimelineCard
											item={item}
											status="LOCKED"
											totalLessons={item.totalLessons}
											completedLessons={item.completedLessons}
										/>
									</div>
								) : (
									<Link href={href} className="group block transition-all">
										<TimelineCard
											item={item}
											status={isCompleted ? "COMPLETED" : "IN_PROGRESS"}
											totalLessons={item.totalLessons}
											completedLessons={item.completedLessons}
										/>
									</Link>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

interface TimelineCardProps {
	item: CurriculumTimelineItem;
	status: "LOCKED" | "IN_PROGRESS" | "COMPLETED";
	totalLessons: number;
	completedLessons: number;
}

const TimelineCard = ({
	item,
	status,
	totalLessons,
	completedLessons,
}: TimelineCardProps) => {
	return (
		<Card className="overflow-hidden border-border/60 bg-card">
			<CardContent className="p-0">
				<div className="flex flex-col sm:flex-row">
					{/* Bagian Kiri: Thumbnail Image */}
					<div className="relative h-48 w-full shrink-0 overflow-hidden bg-muted sm:h-auto sm:w-48">
						{item.thumbnailUrl ? (
							<Image
								src={item.thumbnailUrl}
								alt={item.title}
								fill
								className="object-cover transition-transform duration-300 group-hover:scale-110"
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center text-muted-foreground">
								<BookOpen className="h-10 w-10 opacity-20" />
							</div>
						)}
					</div>

					{/* Bagian Tengah & Kanan: Content */}
					<div className="flex flex-1 items-center justify-between p-4 sm:p-6">
						<div className="space-y-2 pr-4">
							<h3 className="line-clamp-2 text-lg font-bold leading-tight tracking-tight text-card-foreground">
								{item.title}
							</h3>

							{/* Badge Progress */}
							<div className="flex items-center gap-2">
								<Badge variant={status === "LOCKED" ? "outline" : "secondary"}>
									{status === "COMPLETED"
										? "Completed"
										: `${completedLessons}/${totalLessons} Lessons`}
								</Badge>
							</div>
						</div>

						{/* Bagian Kanan Pojok: Indikator Status */}
						<div className="shrink-0 pr-4">
							{status === "COMPLETED" && (
								<CheckCircle className="h-8 w-8 text-green-500" />
							)}
							{status === "LOCKED" && (
								<Lock className="h-8 w-8 text-muted-foreground/50" />
							)}
							{status === "IN_PROGRESS" && (
								<PlayCircle className="h-8 w-8 text-primary animate-pulse" />
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export { CurriculumTimeline };
