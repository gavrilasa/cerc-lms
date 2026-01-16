import { getDashboardStats } from "@/app/data/user/get-dashboard-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, BookCheck, Zap } from "lucide-react";

export async function DashboardHeader() {
	const stats = await getDashboardStats();
	const firstName = stats.user.name?.split(" ")[0] || "Learner";

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					Selamat Datang, {firstName}! 👋
				</h1>
				<p className="text-muted-foreground">
					Lanjutkan perjalanan belajarmu hari ini.
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="gap-2">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Point</CardTitle>
						<Trophy className="h-6 w-6 text-yellow-500" />
					</CardHeader>
					<CardContent>
						<div className="text-4xl font-bold mb-4">{stats.totalPoints}</div>
						<p className="text-xs text-muted-foreground">Point pengalaman</p>
					</CardContent>
				</Card>
				<Card className="gap-2">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Kursus Selesai
						</CardTitle>
						<BookCheck className="h-6 w-6 text-green-500" />
					</CardHeader>
					<CardContent>
						<div className="text-4xl font-bold mb-4">
							{stats.completedCourses}
						</div>
						<p className="text-xs text-muted-foreground">Telah diselesaikan</p>
					</CardContent>
				</Card>
				<Card className="gap-2">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Kursus Aktif</CardTitle>
						<Zap className="h-6 w-6 text-orange-500" />
					</CardHeader>
					<CardContent>
						<div className="text-4xl font-bold mb-4">{stats.activeCourses}</div>
						<p className="text-xs text-muted-foreground">Sedang dipelajari</p>
					</CardContent>
				</Card>
				<Card className="gap-2">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Submission
						</CardTitle>
						<Medal className="h-6 w-6 text-blue-500" />
					</CardHeader>
					<CardContent>
						<div className="text-4xl font-bold mb-4">
							{stats.totalSubmissions}
						</div>
						<p className="text-xs text-muted-foreground">Tugas dikumpulkan</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
