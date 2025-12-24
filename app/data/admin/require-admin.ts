import "server-only";

import { requireSession } from "@/app/data/auth/require-session";

/**
 * Requires the user to be authenticated with ADMIN role.
 * Redirects to /login if not authenticated, /not-admin if insufficient role.
 *
 * @returns The full session object including user data
 *
 * @deprecated Consider using `requireSession({ minRole: "ADMIN" })` directly
 * for more flexibility and to reduce abstraction layers.
 */
export const requireAdmin = async () => {
	return requireSession({ minRole: "ADMIN" });
};
