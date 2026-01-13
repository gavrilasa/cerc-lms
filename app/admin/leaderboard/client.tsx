"use client";

import { useState, useEffect, useTransition } from "react";
import { DivisionTabs } from "./_components/DivisionTabs";
import { LeaderboardTable } from "@/app/dashboard/leaderboard/_components/LeaderboardTable";
import { getDivisionLeaderboard } from "@/app/dashboard/leaderboard/actions";
import { Division } from "@/lib/generated/prisma/enums";

interface LeaderboardEntry {
	rank: number;
	userId: string;
	name: string;
	totalPoints: number;
	isCurrentUser: boolean;
}

interface AdminLeaderboardClientProps {
	initialDivision: Division;
	initialEntries: LeaderboardEntry[];
	isAdmin: boolean;
}

export default function AdminLeaderboardClient({
	initialDivision,
	initialEntries,
	isAdmin,
}: AdminLeaderboardClientProps) {
	const [division, setDivision] = useState<Division>(initialDivision);
	const [entries, setEntries] = useState<LeaderboardEntry[]>(initialEntries);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		if (division !== initialDivision) {
			startTransition(async () => {
				const result = await getDivisionLeaderboard(division);
				setEntries(result.entries);
			});
		}
	}, [division, initialDivision]);

	return (
		<div className="flex flex-col space-y-8">
			<div className="flex flex-col space-y-2">
				<h1 className="text-3xl font-bold tracking-tight">
					Leaderboard Divisi
				</h1>
				<p className="text-muted-foreground">Top 15 member per divisi.</p>
			</div>

			{/* Only show division tabs for Admins */}
			{isAdmin && (
				<DivisionTabs
					currentDivision={division}
					onDivisionChange={setDivision}
				/>
			)}

			<div className="rounded-md border">
				{isPending ? (
					<div className="flex items-center justify-center py-12">
						<p className="text-muted-foreground">Loading...</p>
					</div>
				) : (
					<LeaderboardTable entries={entries} currentUserRank={null} />
				)}
			</div>
		</div>
	);
}
