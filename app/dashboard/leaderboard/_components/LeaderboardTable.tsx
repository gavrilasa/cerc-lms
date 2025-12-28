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
import { IconTrophy } from "@tabler/icons-react";

interface LeaderboardEntry {
	rank: number;
	userId: string;
	name: string;
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
				<p className="text-muted-foreground">
					Belum ada data leaderboard.
				</p>
			</div>
		);
	}

	const getRankIcon = (rank: number) => {
		if (rank === 1) return <IconTrophy className="h-5 w-5 text-yellow-500" />;
		if (rank === 2) return <IconTrophy className="h-5 w-5 text-gray-400" />;
		if (rank === 3) return <IconTrophy className="h-5 w-5 text-amber-600" />;
		return <span className="text-muted-foreground">{rank}</span>;
	};

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-16">Rank</TableHead>
					<TableHead>Nama</TableHead>
					<TableHead className="text-right">Poin</TableHead>
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
						<TableCell className="font-medium">
							<div className="flex items-center justify-center w-8">
								{getRankIcon(entry.rank)}
							</div>
						</TableCell>
						<TableCell>
							{entry.name}
							{entry.isCurrentUser && (
								<span className="ml-2 text-xs text-primary">(Anda)</span>
							)}
						</TableCell>
						<TableCell className="text-right font-semibold">
							{entry.totalPoints}
						</TableCell>
					</TableRow>
				))}

				{/* Show current user's rank if not in top list */}
				{currentUserRank && (
					<>
						<TableRow>
							<TableCell
								colSpan={3}
								className="text-center text-muted-foreground py-2"
							>
								...
							</TableCell>
						</TableRow>
						<TableRow className="bg-primary/5 font-semibold border-l-2 border-l-primary">
							<TableCell className="font-medium">
								<div className="flex items-center justify-center w-8">
									<span className="text-muted-foreground">
										{currentUserRank.rank}
									</span>
								</div>
							</TableCell>
							<TableCell>
								{currentUserRank.name}
								<span className="ml-2 text-xs text-primary">(Anda)</span>
							</TableCell>
							<TableCell className="text-right font-semibold">
								{currentUserRank.totalPoints}
							</TableCell>
						</TableRow>
					</>
				)}
			</TableBody>
		</Table>
	);
}
