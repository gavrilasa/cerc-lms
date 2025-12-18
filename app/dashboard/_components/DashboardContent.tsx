"use client";

import { CheckCircle2, BookOpen, Layers } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { CurriculumCourseCard } from "./CurriculumCourseCard";
import type { UserCurriculumDetails } from "@/app/data/curriculum/get-user-curriculum-details";

interface DashboardContentProps {
	data: UserCurriculumDetails;
}

export function DashboardContent({ data }: DashboardContentProps) {
	const { curriculumInfo, coreCourses, electiveCourses, userStatus } = data;
	const isCompleted = userStatus === "COMPLETED";

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold tracking-tight">
					{curriculumInfo.title}
				</h1>
				<p className="text-muted-foreground max-w-2xl">
					{curriculumInfo.description}
				</p>
			</div>

			{isCompleted && (
				<Alert
					variant="default"
					className="border-green-500 bg-green-500/10 text-green-700 dark:text-green-400"
				>
					<CheckCircle2 className="h-5 w-5" />
					<AlertTitle className="font-semibold">
						Selamat! Anda Telah Lulus.
					</AlertTitle>
					<AlertDescription>
						Anda telah menyelesaikan seluruh materi wajib di kurikulum ini.
						Akses ke materi pengayaan (Elective) kini terbuka sepenuhnya.
					</AlertDescription>
				</Alert>
			)}

			<Separator />

			<Tabs defaultValue="core" className="w-full">
				<div className="flex items-center justify-between mb-4">
					<TabsList>
						<TabsTrigger value="core" className="gap-2">
							<BookOpen className="h-4 w-4" />
							Roadmap Utama
							<Badge variant="secondary" className="ml-1 text-xs">
								{coreCourses.length}
							</Badge>
						</TabsTrigger>
						<TabsTrigger value="elective" className="gap-2">
							<Layers className="h-4 w-4" />
							Materi Pengayaan
							<Badge variant="secondary" className="ml-1 text-xs">
								{electiveCourses.length}
							</Badge>
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value="core" className="space-y-4">
					{coreCourses.length === 0 ? (
						<div className="text-center py-10 text-muted-foreground">
							Tidak ada course wajib saat ini.
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{coreCourses.map((course) => (
								<CurriculumCourseCard
									key={course.id}
									course={course}
									isLocked={false}
								/>
							))}
						</div>
					)}
				</TabsContent>

				<TabsContent value="elective" className="space-y-4">
					{!isCompleted && (
						<div className="mb-4 rounded-md bg-muted p-3 text-sm text-muted-foreground flex gap-2 items-center">
							<Layers className="h-4 w-4" />
							Selesaikan kurikulum utama untuk membuka akses materi pengayaan.
						</div>
					)}

					{electiveCourses.length === 0 ? (
						<div className="text-center py-10 text-muted-foreground">
							Belum ada materi pengayaan tersedia.
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{electiveCourses.map((course) => (
								<CurriculumCourseCard
									key={course.id}
									course={course}
									isLocked={course.isLocked}
								/>
							))}
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
