import { unstable_cache } from "next/cache";

export const CACHE_TAGS = {
	LEADERBOARD: "leaderboard",
	ADMIN_STATS: "admin-stats",
} as const;

export const CACHE_TTL = {
	LEADERBOARD: 30, // 30 seconds
	ADMIN_STATS: 60, // 1 minute
} as const;

export { unstable_cache };
