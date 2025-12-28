import { Metadata } from "next";
import { requireSession } from "@/app/data/auth/require-session";
import { getGlobalLeaderboard } from "./actions";
import { LeaderboardTable } from "./_components/LeaderboardTable";

export const metadata: Metadata = {
	title: "Leaderboard",
	description: "Lihat peringkat poin global.",
};

export default async function LeaderboardPage() {
	await requireSession();

	const { entries, currentUserRank } = await getGlobalLeaderboard();

	return (
		<div className="flex flex-col space-y-8">
			<div className="flex flex-col space-y-2">
				<h1 className="text-3xl font-bold tracking-tight">
					Leaderboard Global
				</h1>
				<p className="text-muted-foreground">
					Top 20 user dengan poin tertinggi.
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
