"use server";

import { requireSession } from "@/app/data/auth/require-session";
import prisma from "@/lib/db";
import { Role, Division } from "@/lib/generated/prisma/enums";
import { type AuthUser, checkRole } from "@/lib/access-control";

// =============================================================================
// Types
// =============================================================================

interface LeaderboardEntry {
	rank: number;
	userId: string;
	name: string;
	division: Division | null;
	totalPoints: number;
	isCurrentUser: boolean;
}

interface LeaderboardResult {
	entries: LeaderboardEntry[];
	currentUserRank: LeaderboardEntry | null;
}

// =============================================================================
// Constants
// =============================================================================

const GLOBAL_LIMIT = 20;
const DIVISION_LIMIT = 15;

// =============================================================================
// Actions
// =============================================================================

/**
 * Get Global Leaderboard
 * Includes MEMBER and USER roles
 * Returns Top 20 + current user's rank if outside Top 20
 */
export async function getGlobalLeaderboard(): Promise<LeaderboardResult> {
	const session = await requireSession();
	const user = session.user as AuthUser;

	// Get top users (MEMBER and USER roles only)
	const topUsers = await prisma.user.findMany({
		where: {
			role: { in: [Role.MEMBER, Role.USER] },
		},
		select: {
			id: true,
			name: true,
			division: true,
			totalPoints: true,
		},
		orderBy: [{ totalPoints: "desc" }, { updatedAt: "asc" }],
		take: GLOBAL_LIMIT,
	});

	const entries: LeaderboardEntry[] = topUsers.map((u, index) => ({
		rank: index + 1,
		userId: u.id,
		name: u.name,
		division: u.division,
		totalPoints: u.totalPoints,
		isCurrentUser: u.id === user.id,
	}));

	// Check if current user is in the top list
	const isInTop = entries.some((e) => e.isCurrentUser);

	let currentUserRank: LeaderboardEntry | null = null;

	if (!isInTop && (user.role === Role.MEMBER || user.role === Role.USER)) {
		// Count how many users have more points
		const higherCount = await prisma.user.count({
			where: {
				role: { in: [Role.MEMBER, Role.USER] },
				OR: [
					{ totalPoints: { gt: user.totalPoints ?? 0 } },
					{
						totalPoints: user.totalPoints ?? 0,
						updatedAt: { lt: new Date() }, // simplified tie-breaker
					},
				],
			},
		});

		// Get current user's data
		const currentUserData = await prisma.user.findUnique({
			where: { id: user.id },
			select: { id: true, name: true, division: true, totalPoints: true },
		});

		if (currentUserData) {
			currentUserRank = {
				rank: higherCount + 1,
				userId: currentUserData.id,
				name: currentUserData.name,
				division: currentUserData.division,
				totalPoints: currentUserData.totalPoints,
				isCurrentUser: true,
			};
		}
	}

	return { entries, currentUserRank };
}

/**
 * Get Division Leaderboard
 * Includes only MEMBER role in specified division
 * Returns Top 15 + current user's rank if outside Top 15
 */
export async function getDivisionLeaderboard(
	division?: Division
): Promise<LeaderboardResult> {
	const session = await requireSession();
	const user = session.user as AuthUser;

	// Only MEMBER and ADMIN can view division leaderboard
	if (!checkRole(user, "MEMBER")) {
		return { entries: [], currentUserRank: null };
	}

	// Use user's division if not specified (for regular members)
	// Admin can specify any division
	const targetDivision =
		user.role === Role.ADMIN ? division : (user.division as Division);

	if (!targetDivision) {
		return { entries: [], currentUserRank: null };
	}

	// Get top members in division
	const topUsers = await prisma.user.findMany({
		where: {
			role: Role.MEMBER,
			division: targetDivision,
		},
		select: {
			id: true,
			name: true,
			division: true,
			totalPoints: true,
		},
		orderBy: [{ totalPoints: "desc" }, { updatedAt: "asc" }],
		take: DIVISION_LIMIT,
	});

	const entries: LeaderboardEntry[] = topUsers.map((u, index) => ({
		rank: index + 1,
		userId: u.id,
		name: u.name,
		division: u.division,
		totalPoints: u.totalPoints,
		isCurrentUser: u.id === user.id,
	}));

	// Check if current user is in the top list (only for MEMBER viewing own division)
	const isInTop = entries.some((e) => e.isCurrentUser);

	let currentUserRank: LeaderboardEntry | null = null;

	if (
		!isInTop &&
		user.role === Role.MEMBER &&
		user.division === targetDivision
	) {
		// Count how many members have more points in this division
		const higherCount = await prisma.user.count({
			where: {
				role: Role.MEMBER,
				division: targetDivision,
				OR: [
					{ totalPoints: { gt: user.totalPoints ?? 0 } },
					{
						totalPoints: user.totalPoints ?? 0,
						updatedAt: { lt: new Date() },
					},
				],
			},
		});

		// Get current user's data
		const currentUserData = await prisma.user.findUnique({
			where: { id: user.id },
			select: { id: true, name: true, division: true, totalPoints: true },
		});

		if (currentUserData) {
			currentUserRank = {
				rank: higherCount + 1,
				userId: currentUserData.id,
				name: currentUserData.name,
				division: currentUserData.division,
				totalPoints: currentUserData.totalPoints,
				isCurrentUser: true,
			};
		}
	}

	return { entries, currentUserRank };
}

/**
 * Get all divisions for Admin tabs
 */
export async function getAllDivisions(): Promise<Division[]> {
	return Object.values(Division);
}
