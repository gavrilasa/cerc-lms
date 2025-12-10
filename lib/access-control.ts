import { type User } from "better-auth/types";
import type { Division, Role } from "./generated/prisma";

export interface AuthUser extends User {
	role: Role;
	division?: Division | null;
	status?: string;
	nim?: string;
	generation?: number;
}

const ROLE_LEVELS: Record<Role, number> = {
	GUEST: 0,
	USER: 1,
	MEMBER: 2,
	MENTOR: 3,
	ADMIN: 4,
};

export function checkRole(
	user: AuthUser | null | undefined,
	requiredRole: Role
): boolean {
	if (!user || !user.role) return false;

	const userLevel = ROLE_LEVELS[user.role] || 0;
	const requiredLevel = ROLE_LEVELS[requiredRole];

	return userLevel >= requiredLevel;
}

export function checkDivisionAccess(
	user: AuthUser | null | undefined,
	targetDivision: Division
): boolean {
	if (!user || !user.division) return false;

	if (user.role === "ADMIN") return true;

	return user.division === targetDivision;
}

export function canManageCourse(
	user: AuthUser | null | undefined,
	courseDivision: Division
): boolean {
	if (!checkRole(user, "MENTOR")) return false;

	return checkDivisionAccess(user, courseDivision);
}
