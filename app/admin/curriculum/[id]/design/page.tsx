import "server-only";

import { notFound } from "next/navigation";
import { requireSession } from "@/app/data/auth/require-session";
import prisma from "@/lib/db";
import { getAllCourses } from "@/app/data/course/get-all-courses";
import { CurriculumDesignBuilder } from "../../_components/CurriculumDesignBuilder";
import { Division } from "@/lib/generated/prisma/enums";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function CurriculumDesignPage({ params }: PageProps) {
	await requireSession({ minRole: "ADMIN" });
	const { id } = await params;

	// 1. Fetch Kurikulum Target & Existing Courses
	const curriculum = await prisma.curriculum.findUnique({
		where: { id },
		include: {
			courses: {
				include: {
					course: true,
				},
				orderBy: {
					order: "asc",
				},
			},
		},
	});

	if (!curriculum) {
		notFound();
	}

	// 2. Fetch Course Pool (Available Courses)
	const poolCourses = await getAllCourses({
		divisionFilter: curriculum.division as Division,
		excludeCurriculumId: curriculum.id,
	});

	return (
		<div className="flex flex-col h-[calc(100vh-4rem)]">
			<div className="flex items-center justify-between p-4 border-b bg-background">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-bold tracking-tight">
						Curriculum Structure
					</h1>
					<p className="text-muted-foreground">
						{curriculum.title} ({curriculum.division})
					</p>
				</div>
			</div>

			{/* 3. Render Client Builder */}
			<CurriculumDesignBuilder
				curriculumId={curriculum.id}
				initialCanvasItems={curriculum.courses.map((pivot) => ({
					id: pivot.course.id,
					title: pivot.course.title,
					type: pivot.type,
				}))}
				initialPoolItems={poolCourses.map((c) => ({
					id: c.id,
					title: c.title,
					type: "CORE",
				}))}
			/>
		</div>
	);
}
