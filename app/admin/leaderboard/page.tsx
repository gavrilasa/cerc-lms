import { Metadata } from "next";
import { requireSession } from "@/app/data/auth/require-session";
import { redirect } from "next/navigation";
import { getGlobalLeaderboard } from "@/app/dashboard/leaderboard/actions";
import { checkRole, type AuthUser } from "@/lib/access-control";
import { LeaderboardTable } from "@/app/dashboard/leaderboard/_components/LeaderboardTable";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
	title: "Leaderboard Global",
	description: "Lihat peringkat poin global.",
};

export default async function AdminGlobalLeaderboardPage() {
	const session = await requireSession();
	const user = session.user as AuthUser;

	// ADMIN and MENTOR can access this page
	if (!checkRole(user, "MENTOR")) {
		redirect("/admin");
	}

	const { entries, currentUserRank } = await getGlobalLeaderboard();

	return (
		<div className="p-4 space-y-4">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold tracking-tight">
					Leaderboard Global
				</h1>
				<p className="text-muted-foreground">
					Top 20 user dengan poin tertinggi.
				</p>
			</div>

			<Card>
				<CardContent>
					<LeaderboardTable
						entries={entries}
						currentUserRank={currentUserRank}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
