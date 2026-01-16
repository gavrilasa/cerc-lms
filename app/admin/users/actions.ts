"use server";

import prisma from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache";
import type { AuthUser } from "@/lib/access-control";
import type { Role, UserStatus } from "@/lib/generated/prisma/enums";

// Helper untuk validasi sesi admin (DRY)
import { requireSession } from "@/app/data/auth/require-session";

// 1. Update Status (Bisa untuk Approve, Reject, Archive, Restore)
export async function updateUserStatus(userId: string, newStatus: UserStatus) {
	try {
		const session = await requireSession({ minRole: "ADMIN" });
		const currentUser = session.user as AuthUser;

		// Fetch target user to check division
		const targetUser = await prisma.user.findUnique({
			where: { id: userId },
			select: { division: true },
		});

		if (!targetUser) return { error: "User not found" };

		// Access Control: Admin OR (Mentor AND (same division OR target has no division))
		if (currentUser.role !== "ADMIN") {
			if (targetUser.division && targetUser.division !== currentUser.division) {
				return { error: "Unauthorized: Different division" };
			}
		}

		await prisma.user.update({
			where: { id: userId },
			data: { status: newStatus },
		});
		revalidatePath("/admin/users");
		revalidateTag(CACHE_TAGS.ADMIN_STATS, "max");
		return { success: true, message: `Status updated to ${newStatus}` };
	} catch {
		return { error: "Failed to update status" };
	}
}

// 2. Update Role (Promosi/Demosi: Guest <-> Admin) - Tetap ADMIN only
export async function updateUserRole(userId: string, newRole: Role) {
	try {
		const session = await requireSession({ minRole: "ADMIN" });

		// Prevent Self-Demotion (Admin tidak bisa menurunkan role dirinya sendiri lewat menu ini biar gak terkunci)
		if (session.user.id === userId) {
			return { error: "You cannot change your own role here." };
		}

		await prisma.user.update({
			where: { id: userId },
			data: { role: newRole },
		});
		revalidatePath("/admin/users");
		return { success: true, message: `Role updated to ${newRole}` };
	} catch {
		return { error: "Failed to update role" };
	}
}

// 3. Delete User (Hard Delete - Hati-hati)
export async function deleteUser(userId: string) {
	try {
		const session = await requireSession({ minRole: "ADMIN" });
		const currentUser = session.user as AuthUser;

		if (currentUser.id === userId) {
			return { error: "You cannot delete your own account." };
		}

		// Fetch target user to check division and status
		const targetUser = await prisma.user.findUnique({
			where: { id: userId },
			select: { division: true, status: true },
		});

		if (!targetUser) return { error: "User not found" };

		// Require user to be ARCHIVED before deletion
		if (targetUser.status !== "ARCHIVED") {
			return { error: "User must be archived before deletion" };
		}

		// Access Control: Admin OR (Mentor AND (same division OR target has no division))
		if (currentUser.role !== "ADMIN") {
			if (targetUser.division && targetUser.division !== currentUser.division) {
				return { error: "Unauthorized: Different division" };
			}
		}

		await prisma.user.delete({
			where: { id: userId },
		});
		revalidatePath("/admin/users");
		revalidateTag(CACHE_TAGS.ADMIN_STATS, "max");
		revalidateTag(CACHE_TAGS.LEADERBOARD, "max");
		return { success: true, message: "User deleted permanently" };
	} catch (error) {
		console.error(error);
		return { error: "Failed to delete user" };
	}
}
