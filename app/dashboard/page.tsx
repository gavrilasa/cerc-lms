import "server-only";

import { redirect } from "next/navigation";
import { requireUser } from "@/app/data/user/require-user";
import { getUserCurriculumDetails } from "@/app/data/curriculum/get-user-curriculum-details"; // Pastikan path DAL sesuai Fase 2
import { DashboardContent } from "./_components/DashboardContent";

export const metadata = {
	title: "Dashboard Pembelajaran",
};

export default async function DashboardPage() {
	// 1. Ambil User Session
	const user = await requireUser();

	// 2. Fetch Data Kurikulum User (DAL Fase 2)
	// Fetcher ini sudah mengembalikan object { coreCourses, electiveCourses, userStatus, ... }
	const dashboardData = await getUserCurriculumDetails(user.id);

	// 3. Validasi Null / Data Korup
	// Jika user belum punya kurikulum atau data tidak ditemukan, lempar kembali ke seleksi
	if (!dashboardData) {
		redirect("/select-curriculum");
	}

	// 4. Render Client Component untuk Interaktivitas
	return <DashboardContent data={dashboardData} />;
}
