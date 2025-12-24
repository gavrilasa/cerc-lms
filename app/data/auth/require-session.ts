import "server-only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Role } from "@/lib/generated/prisma/enums";

/**
 * Role hierarchy levels for permission checking
 */
const ROLE_LEVELS: Record<Role, number> = {
	GUEST: 0,
	USER: 1,
	MEMBER: 2,
	MENTOR: 3,
	ADMIN: 4,
};

interface RequireSessionOptions {
	/** Minimum role required to access. If not provided, any authenticated user is allowed. */
	minRole?: Role;
	/** Custom redirect path when user is not authenticated. Defaults to "/login" */
	loginRedirect?: string;
	/** Custom redirect path when user doesn't have required role. Defaults to "/not-admin" */
	unauthorizedRedirect?: string;
}

/**
 * Unified session requirement function that replaces both requireAdmin and requireUser.
 * Uses React cache() for request deduplication.
 *
 * @example
 * // Require any authenticated user
 * const session = await requireSession();
 *
 * @example
 * // Require admin role
 * const session = await requireSession({ minRole: "ADMIN" });
 *
 * @example
 * // Require mentor role with custom redirects
 * const session = await requireSession({
 *   minRole: "MENTOR",
 *   unauthorizedRedirect: "/access-denied"
 * });
 */
export const requireSession = cache(
	async (options: RequireSessionOptions = {}) => {
		const {
			minRole,
			loginRedirect = "/login",
			unauthorizedRedirect = "/not-admin",
		} = options;

		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return redirect(loginRedirect);
		}

		// If minRole is specified, check if user has sufficient role level
		if (minRole) {
			const userRole = session.user.role as Role;
			const userLevel = ROLE_LEVELS[userRole] || 0;
			const requiredLevel = ROLE_LEVELS[minRole];

			if (userLevel < requiredLevel) {
				return redirect(unauthorizedRedirect);
			}
		}

		return session;
	}
);

/**
 * Get the current user from session, or null if not authenticated.
 * Does NOT redirect - useful for conditional rendering.
 */
export const getOptionalSession = cache(async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	return session;
});
