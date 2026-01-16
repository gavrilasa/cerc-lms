"use client";

import { useState, useTransition, useRef } from "react";
import { DivisionTabs } from "./_components/DivisionTabs";
import { LeaderboardTable } from "@/app/dashboard/leaderboard/_components/LeaderboardTable";
import { getDivisionLeaderboard } from "@/app/dashboard/leaderboard/actions";
import { Division } from "@/lib/generated/prisma/enums";
import { Card, CardContent } from "@/components/ui/card";

interface LeaderboardEntry {
	rank: number;
	userId: string;
	name: string;
	division: Division | null;
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

	// Cache entries for each division to avoid refetch
	const entriesCache = useRef<Record<Division, LeaderboardEntry[]>>({
		[initialDivision]: initialEntries,
	} as Record<Division, LeaderboardEntry[]>);

	const handleDivisionChange = (newDivision: Division) => {
		setDivision(newDivision);

		// Check if we have cached entries for this division
		if (entriesCache.current[newDivision]) {
			setEntries(entriesCache.current[newDivision]);
		} else {
			// Fetch new data if not cached
			startTransition(async () => {
				const result = await getDivisionLeaderboard(newDivision);
				entriesCache.current[newDivision] = result.entries;
				setEntries(result.entries);
			});
		}
	};

	return (
		<div className="p-4 space-y-4">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold tracking-tight">
					Division Leaderboard
				</h1>
				<p className="text-muted-foreground">Top 15 members per division.</p>
			</div>

			{/* Only show division tabs for Admins */}
			{isAdmin && (
				<DivisionTabs
					currentDivision={division}
					onDivisionChange={handleDivisionChange}
				/>
			)}

			<Card>
				<CardContent>
					{isPending ? (
						<div className="flex items-center justify-center py-12">
							<p className="text-muted-foreground">Loading...</p>
						</div>
					) : (
						<LeaderboardTable entries={entries} currentUserRank={null} />
					)}
				</CardContent>
			</Card>
		</div>
	);
}
