import { requireAdmin } from "@/app/data/admin/require-admin";
import prisma from "@/lib/db";
import { CurriculumManager } from "./_components/CurriculumManager";
import { Division } from "@/lib/generated/prisma";

export default async function CurriculumPage() {
	await requireAdmin();

	const allCourses = await prisma.course.findMany({
		orderBy: [{ curriculumOrder: "asc" }, { title: "asc" }],
		select: {
			id: true,
			title: true,
			category: true,
			level: true,
			division: true,
			curriculumOrder: true,
			status: true,
		},
	});

	const divisions = Object.values(Division);

	return (
		<div className="p-4 space-y-4">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold tracking-tight">
					Manajemen Kurikulum
				</h1>
				<p className="text-muted-foreground">
					Atur urutan pembelajaran untuk setiap divisi. Perubahan di sini
					bersifat retroaktif dan mempengaruhi akses siswa.
				</p>
			</div>

			<CurriculumManager initialCourses={allCourses} divisions={divisions} />
		</div>
	);
}
