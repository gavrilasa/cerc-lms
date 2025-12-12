import { requireUser } from "@/app/data/user/require-user";
import { getCurriculumProgress } from "@/app/data/curriculum/get-user-progress";
import prisma from "@/lib/db";
import { DashboardView } from "./_components/DashboardView";

export default async function DashboardPage() {
	// 1. Authentication Check
	const sessionUser = await requireUser();

	// 2. Fetch User Division (Pastikan data terbaru dari DB)
	const user = await prisma.user.findUnique({
		where: {
			id: sessionUser.id,
		},
		select: {
			division: true,
		},
	});

	// Handle jika user tidak memiliki divisi (Edge Case)
	if (!user || !user.division) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
				<h2 className="text-xl font-semibold">Divisi Belum Ditentukan</h2>
				<p className="text-muted-foreground">
					Akun Anda belum masuk ke dalam divisi manapun. Hubungi admin.
				</p>
			</div>
		);
	}

	// 3. Panggil Logic Core (DAL) untuk hitung status kurikulum
	const progressData = await getCurriculumProgress(
		sessionUser.id,
		user.division
	);

	// 4. Render Client View dengan data matang
	return <DashboardView data={progressData} />;
}
