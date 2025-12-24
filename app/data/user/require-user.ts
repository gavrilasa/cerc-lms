import "server-only";

import { requireSession } from "@/app/data/auth/require-session";

/**
 * Requires the user to be authenticated (any role).
 * Redirects to /login if not authenticated.
 *
 * @returns The user object from the session
 *
 * @deprecated Consider using `requireSession()` directly for more flexibility.
 * Note: requireSession returns full session, use session.user to get user data.
 */
export const requireUser = async () => {
	const session = await requireSession();
	return session.user;
};
