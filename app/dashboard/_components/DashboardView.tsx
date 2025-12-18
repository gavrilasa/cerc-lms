"use client";

import Link from "next/link";
import type { UserCurriculumDetails } from "@/app/data/curriculum/get-user-curriculum-details";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Lock,
	PlayCircle,
	CheckCircle,
	AlertCircle,
	BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardViewProps {
	data: UserCurriculumDetails;
}

export function DashboardView({ data }: DashboardViewProps) {
	const { coreCourses, electiveCourses, userStatus } = data;
	const isCurriculumCompleted = userStatus === "COMPLETED";

	return (
		<div className="w-full space-y-6">
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold tracking-tight">Dashboard Belajar</h1>
				<p className="text-muted-foreground">
					Ikuti roadmap kurikulum untuk menguasai materi secara terstruktur.
				</p>
			</div>

			<Tabs defaultValue="roadmap" className="w-full">
				<TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
					<TabsTrigger value="roadmap">Roadmap Kurikulum</TabsTrigger>
					<TabsTrigger value="elective">Materi Tambahan</TabsTrigger>
				</TabsList>

				<TabsContent value="roadmap" className="space-y-4 mt-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{coreCourses.map((course, index) => {
							const prevCourseName =
								index > 0 ? coreCourses[index - 1].title : "Materi Sebelumnya";

							return (
								<CourseCard
									key={course.id}
									course={course}
									prevCourseName={prevCourseName}
									index={index + 1}
								/>
							);
						})}
					</div>
					{coreCourses.length === 0 && (
						<div className="text-center py-12 text-muted-foreground">
							Belum ada kurikulum yang tersedia untuk divisi ini.
						</div>
					)}
				</TabsContent>

				<TabsContent value="elective" className="space-y-6 mt-6">
					{!isCurriculumCompleted && (
						<Alert
							variant="destructive"
							className="bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-800"
						>
							<AlertCircle className="h-4 w-4 stroke-amber-600 dark:stroke-amber-400" />
							<AlertTitle>Akses Terbatas</AlertTitle>
							<AlertDescription>
								Akses materi tambahan terkunci hingga seluruh{" "}
								<strong>Kurikulum Wajib</strong> diselesaikan.
							</AlertDescription>
						</Alert>
					)}

					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{electiveCourses.map((course) => (
							<CourseCard key={course.id} course={course} isElective={true} />
						))}
					</div>

					{electiveCourses.length === 0 && (
						<div className="text-center py-12 text-muted-foreground">
							Tidak ada materi tambahan saat ini.
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}

interface CourseCardProps {
	course: UserCurriculumDetails["coreCourses"][0];
	prevCourseName?: string;
	index?: number;
	isElective?: boolean;
}

function CourseCard({
	course,
	prevCourseName,
	index,
	isElective = false,
}: CourseCardProps) {
	// [Fix] smallDescription dan category sekarang sudah resmi ada di tipe data
	const {
		title,
		level,
		duration,
		slug,
		status,
		isLocked,
		smallDescription,
		category,
	} = course;

	const isActive = status === "Active";
	const isCompleted = status === "Completed";

	const cardStyles = cn(
		"flex flex-col h-full transition-all duration-200",
		isActive && "border-primary ring-1 ring-primary shadow-md scale-[1.01]",
		isLocked && "opacity-60 grayscale bg-muted/50",
		isCompleted && "border-green-500/50 bg-green-50/10"
	);

	const ActionButton = () => {
		if (isLocked) {
			return (
				<Button disabled className="w-full" variant="outline">
					<Lock className="mr-2 h-4 w-4" />
					Terkunci
				</Button>
			);
		}
		if (isCompleted) {
			return (
				<Link href={`/dashboard/${slug}`} className="w-full">
					<Button
						className="w-full text-green-700 hover:text-green-800 hover:bg-green-100 border-green-200"
						variant="outline"
					>
						<CheckCircle className="mr-2 h-4 w-4" />
						Review Materi
					</Button>
				</Link>
			);
		}
		return (
			<Link href={`/dashboard/${slug}`} className="w-full">
				<Button className="w-full">
					<PlayCircle className="mr-2 h-4 w-4" />
					{isActive ? "Lanjutkan Belajar" : "Mulai Belajar"}
				</Button>
			</Link>
		);
	};

	const CardContentWrapper = (
		<Card className={cardStyles}>
			<CardHeader>
				<div className="flex justify-between items-start gap-2 mb-2">
					{!isElective && index && (
						<Badge variant="outline" className="w-fit">
							Step {index}
						</Badge>
					)}
					<Badge
						variant={isCompleted ? "default" : "secondary"}
						className={cn(isCompleted && "bg-green-600 hover:bg-green-700")}
					>
						{level}
					</Badge>
				</div>
				<CardTitle className="line-clamp-2 text-lg">{title}</CardTitle>
				<CardDescription className="flex items-center gap-1">
					<BookOpen className="h-3 w-3" /> {category} •{" "}
					{Math.round(duration / 60)} Jam
				</CardDescription>
			</CardHeader>
			<CardContent className="grow">
				<p className="text-sm text-muted-foreground line-clamp-3">
					{smallDescription}
				</p>
			</CardContent>
			<CardFooter>
				<ActionButton />
			</CardFooter>
		</Card>
	);

	if (isLocked && !isElective) {
		return (
			<TooltipProvider>
				<Tooltip delayDuration={0}>
					<TooltipTrigger asChild>
						<div className="cursor-not-allowed h-full">
							{CardContentWrapper}
						</div>
					</TooltipTrigger>
					<TooltipContent className="bg-destructive text-destructive-foreground">
						<p>
							Selesaikan <strong>{prevCourseName}</strong> untuk membuka
						</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	return CardContentWrapper;
}
