"use client";

import { CourseSidebarDataType } from "@/app/data/course/get-course-sidebar-data";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, BookOpen, Clock, PlayCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { DivisionBadge } from "@/components/general/DivisionBadge";
import { Division } from "@/lib/generated/prisma/enums";

interface DashboardViewProps {
	myCourses: CourseSidebarDataType[];
	roadmapCourses: CourseSidebarDataType[];
}

export function DashboardView({
	myCourses,
	roadmapCourses,
}: DashboardViewProps) {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
			</div>

			<Tabs defaultValue="my-courses" className="space-y-4">
				<TabsList>
					<TabsTrigger value="my-courses">My Courses</TabsTrigger>
					<TabsTrigger value="roadmap">Roadmap</TabsTrigger>
				</TabsList>

				<TabsContent value="my-courses" className="space-y-4">
					{myCourses.length === 0 ? (
						<div className="flex h-[400px] flex-col items-center justify-center rounded-md border border-dashed text-center animate-in fade-in-50">
							<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary/20">
								<BookOpen className="h-10 w-10 text-muted-foreground" />
							</div>
							<h3 className="mt-4 text-lg font-semibold">No courses found</h3>
							<p className="mb-4 mt-2 text-sm text-muted-foreground">
								You haven&apos;t enrolled in any courses yet.
							</p>
							<Button asChild>
								<Link href="/courses">Browse Courses</Link>
							</Button>
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{myCourses.map((item) => (
								<CourseCard key={item.course.id} data={item} />
							))}
						</div>
					)}
				</TabsContent>

				<TabsContent value="roadmap" className="space-y-4">
					{roadmapCourses.length === 0 ? (
						<div className="flex h-[400px] flex-col items-center justify-center rounded-md border border-dashed text-center animate-in fade-in-50">
							<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary/20">
								<Clock className="h-10 w-10 text-muted-foreground" />
							</div>
							<h3 className="mt-4 text-lg font-semibold">No roadmap found</h3>
							<p className="mb-4 mt-2 text-sm text-muted-foreground">
								There are no courses in your roadmap yet.
							</p>
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{roadmapCourses.map((item) => (
								<CourseCard key={item.course.id} data={item} />
							))}
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}

// Internal Component: CourseCard
// Refactored: Removed Level, Duration, and Category. Kept Division.
function CourseCard({ data }: { data: CourseSidebarDataType }) {
	const thumbnailUrl = useConstructUrl(data.course.fileKey);

	return (
		<Card className="group flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 border-border">
			{/* Thumbnail Section */}
			<div className="relative aspect-video w-full overflow-hidden">
				<Image
					src={thumbnailUrl}
					alt={data.course.title}
					fill
					className="object-cover transition-transform duration-300 group-hover:scale-105"
				/>

				{/* Overlay Play Icon */}
				<div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
					<PlayCircle className="w-12 h-12 text-white drop-shadow-md" />
				</div>

				{/* Metadata Badge: Division Only */}
				<div className="absolute top-2 right-2 z-10">
					<DivisionBadge division={data.course.division as Division} />
				</div>
			</div>

			{/* Content Section */}
			<CardHeader className="p-4 pb-2">
				<CardTitle className="line-clamp-1 text-lg group-hover:text-primary transition-colors">
					<Link href={`/dashboard/courses/${data.course.slug}`}>
						{data.course.title}
					</Link>
				</CardTitle>
			</CardHeader>

			<CardContent className="p-4 pt-0 grow">
				<p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed h-10">
					{data.course.smallDescription}
				</p>
			</CardContent>

			{/* Footer Section */}
			<CardFooter className="p-4 pt-0 mt-auto">
				<Button asChild className="w-full gap-2 group/btn">
					<Link href={`/dashboard/courses/${data.course.slug}`}>
						Continue Learning
						<ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
