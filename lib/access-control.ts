import { type User } from "better-auth/types";
import { Division, Role, ROLE_LEVELS } from "./constants";

/**
 * Extended user type with CERC-specific fields
 */
export interface AuthUser extends User {
	role: Role;
	division?: Division | null;
	status?: string;
	nim?: string;
	generation?: number;
	selectedCurriculumId?: string | null;
	curriculumStatus?: string | null;
	totalPoints?: number;
}

/**
 * Check if user has at least the required role level.
 * Uses role hierarchy: GUEST < USER < MEMBER < MENTOR < ADMIN
 */
export function checkRole(
	user: AuthUser | null | undefined,
	requiredRole: Role
): boolean {
	if (!user || !user.role) return false;

	const userLevel = ROLE_LEVELS[user.role] || 0;
	const requiredLevel = ROLE_LEVELS[requiredRole];

	return userLevel >= requiredLevel;
}

/**
 * Check if user has access to a specific division.
 * ADMIN has access to all divisions.
 */
export function checkDivisionAccess(
	user: AuthUser | null | undefined,
	targetDivision: Division
): boolean {
	if (!user || !user.division) return false;

	if (user.role === "ADMIN") return true;

	return user.division === targetDivision;
}

/**
 * Check if user can manage (create/edit) courses in a division.
 * Requires at least MENTOR role and division access.
 */
export function canManageCourse(
	user: AuthUser | null | undefined,
	courseDivision: Division
): boolean {
	if (!checkRole(user, "MENTOR")) return false;

	return checkDivisionAccess(user, courseDivision);
}
