import { Metadata } from "next";
import { requireSession } from "@/app/data/auth/require-session";
import { getGlobalLeaderboard } from "./actions";
import { LeaderboardTable } from "./_components/LeaderboardTable";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
	title: "Leaderboard",
	description: "Lihat peringkat poin global.",
};

export default async function LeaderboardPage() {
	await requireSession();

	const { entries, currentUserRank } = await getGlobalLeaderboard();

	return (
		<div className="p-4 space-y-4">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold tracking-tight">
					Leaderboard Global
				</h1>
				<p className="text-muted-foreground">
					Top 20 user with the highest points.
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
