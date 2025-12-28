import { Metadata } from "next";
import { requireSession } from "@/app/data/auth/require-session";
import { redirect } from "next/navigation";
import { getDivisionLeaderboard } from "../actions";
import { LeaderboardTable } from "../_components/LeaderboardTable";
import { checkRole, type AuthUser } from "@/lib/access-control";
import { Role } from "@/lib/generated/prisma/enums";

export const metadata: Metadata = {
	title: "Leaderboard Divisi",
	description: "Lihat peringkat poin di divisi Anda.",
};

export default async function DivisionLeaderboardPage() {
	const session = await requireSession();
	const user = session.user as AuthUser;

	// Only MEMBER can access this page
	if (user.role !== Role.MEMBER) {
		redirect("/dashboard/leaderboard");
	}

	if (!user.division) {
		redirect("/dashboard/leaderboard");
	}

	const { entries, currentUserRank } = await getDivisionLeaderboard();

	return (
		<div className="flex flex-col space-y-8">
			<div className="flex flex-col space-y-2">
				<h1 className="text-3xl font-bold tracking-tight">
					Leaderboard Divisi {user.division}
				</h1>
				<p className="text-muted-foreground">
					Top 15 member dengan poin tertinggi di divisi Anda.
				</p>
			</div>

			<div className="rounded-md border">
				<LeaderboardTable
					entries={entries}
					currentUserRank={currentUserRank}
				/>
			</div>
		</div>
	);
}
