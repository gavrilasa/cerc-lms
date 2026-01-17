import { Metadata } from "next";
import { requireSession } from "@/app/data/auth/require-session";
import { redirect } from "next/navigation";
import { getDivisionLeaderboard } from "../actions";
import { LeaderboardTable } from "../_components/LeaderboardTable";
import { checkRole, type AuthUser } from "@/lib/access-control";

import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
	title: "Division Leaderboard",
	description: "View point rankings in your division.",
};

export default async function DivisionLeaderboardPage() {
	const session = await requireSession();
	const user = session.user as AuthUser;

	// Minimum MEMBER role required to access this page
	if (!checkRole(user, "MEMBER")) {
		redirect("/dashboard/leaderboard");
	}

	if (!user.division) {
		redirect("/dashboard/leaderboard");
	}

	const { entries, currentUserRank } = await getDivisionLeaderboard();

	return (
		<div className="p-4 space-y-4">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold tracking-tight">
					Division Leaderboard{" "}
					<span className="capitalize">{user.division?.toLowerCase()}</span>
				</h1>
				<p className="text-muted-foreground">
					Top 15 members with the highest points in your division.
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
