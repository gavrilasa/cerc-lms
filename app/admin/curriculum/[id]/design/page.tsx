import "server-only";

import { notFound } from "next/navigation";
import { requireAdmin } from "@/app/data/admin/require-admin";
import prisma from "@/lib/db";
import { getAllCourses } from "@/app/data/course/get-all-courses";
import { CurriculumDesignBuilder } from "../../_components/CurriculumDesignBuilder";
import { Division } from "@/lib/generated/prisma/enums";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function CurriculumDesignPage({ params }: PageProps) {
	await requireAdmin();
	const { id } = await params;

	// 1. Fetch Kurikulum Target & Existing Courses
	const curriculum = await prisma.curriculum.findUnique({
		where: { id },
		include: {
			courses: {
				include: {
					course: true, // Ambil detail course (title, level, etc)
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
	// Filter berdasarkan divisi kurikulum & exclude yang sudah ada di kurikulum ini
	const poolCourses = await getAllCourses({
		divisionFilter: curriculum.division as Division,
		excludeCurriculumId: curriculum.id,
	});

	return (
		<div className="flex flex-col h-[calc(100vh-4rem)]">
			<div className="flex items-center justify-between px-6 py-4 border-b bg-background">
				<div>
					<h1 className="text-xl font-bold">Curriculum Designer</h1>
					<p className="text-sm text-muted-foreground">
						{curriculum.title} ({curriculum.division})
					</p>
				</div>
			</div>

			{/* 3. Render Client Builder */}
			<CurriculumDesignBuilder
				curriculumId={curriculum.id}
				initialCanvasItems={curriculum.courses.map((pivot) => ({
					id: pivot.course.id, // Kita gunakan ID Course sebagai key utama di UI
					title: pivot.course.title,
					level: pivot.course.level,
					type: pivot.type,
					category: pivot.course.category,
				}))}
				initialPoolItems={poolCourses.map((c) => ({
					id: c.id,
					title: c.title,
					level: c.level,
					type: "CORE", // Default type saat di-drag dari pool
					category: c.category,
				}))}
			/>
		</div>
	);
}
