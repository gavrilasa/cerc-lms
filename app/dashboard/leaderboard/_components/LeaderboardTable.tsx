"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { IconMedal } from "@tabler/icons-react";
import { DivisionBadge } from "@/components/general/DivisionBadge";
import type { Division } from "@/lib/generated/prisma/enums";

interface LeaderboardEntry {
	rank: number;
	userId: string;
	name: string;
	division: Division | null;
	totalPoints: number;
	isCurrentUser: boolean;
}

interface LeaderboardTableProps {
	entries: LeaderboardEntry[];
	currentUserRank: LeaderboardEntry | null;
}

export function LeaderboardTable({
	entries,
	currentUserRank,
}: LeaderboardTableProps) {
	if (entries.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<p className="text-muted-foreground">Belum ada data leaderboard.</p>
			</div>
		);
	}

	const getRankDisplay = (rank: number) => {
		if (rank === 1) {
			return (
				<div className="flex items-center justify-center">
					<IconMedal className="h-6 w-6 text-yellow-500 fill-yellow-500" />
				</div>
			);
		}
		if (rank === 2) {
			return (
				<div className="flex items-center justify-center">
					<IconMedal className="h-6 w-6 text-gray-400 fill-gray-400" />
				</div>
			);
		}
		if (rank === 3) {
			return (
				<div className="flex items-center justify-center">
					<IconMedal className="h-6 w-6 text-amber-600 fill-amber-600" />
				</div>
			);
		}
		return <span className="text-muted-foreground font-medium">{rank}</span>;
	};

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-16 text-center pl-4">#</TableHead>
					<TableHead>Name</TableHead>
					<TableHead className="text-center">Division</TableHead>
					<TableHead className="text-center pr-4">Points</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{entries.map((entry) => (
					<TableRow
						key={entry.userId}
						className={cn(
							entry.isCurrentUser &&
								"bg-primary/5 font-semibold border-l-2 border-l-primary"
						)}
					>
						<TableCell className="text-center pl-4">
							{getRankDisplay(entry.rank)}
						</TableCell>
						<TableCell>
							<div className="flex items-center gap-2">
								<span className="font-medium">{entry.name}</span>
								{entry.isCurrentUser && (
									<span className="text-xs text-primary">(You)</span>
								)}
							</div>
						</TableCell>
						<TableCell className="text-center">
							<DivisionBadge division={entry.division} />
						</TableCell>
						<TableCell className="text-center font-semibold pr-4">
							{entry.totalPoints}
						</TableCell>
					</TableRow>
				))}

				{/* Show current user's rank if not in top list */}
				{currentUserRank && (
					<>
						<TableRow>
							<TableCell
								colSpan={4}
								className="text-center text-muted-foreground py-2"
							>
								...
							</TableCell>
						</TableRow>
						<TableRow className="bg-primary/5 font-semibold border-l-2 border-l-primary">
							<TableCell className="text-center pl-4">
								<span className="text-muted-foreground font-medium">
									{currentUserRank.rank}
								</span>
							</TableCell>
							<TableCell>
								<div className="flex items-center gap-2">
									<span className="font-medium">{currentUserRank.name}</span>
									<span className="text-xs text-primary">(You)</span>
								</div>
							</TableCell>
							<TableCell className="text-center">
								<DivisionBadge division={currentUserRank.division} />
							</TableCell>
							<TableCell className="text-center font-semibold pr-4">
								{currentUserRank.totalPoints}
							</TableCell>
						</TableRow>
					</>
				)}
			</TableBody>
		</Table>
	);
}
