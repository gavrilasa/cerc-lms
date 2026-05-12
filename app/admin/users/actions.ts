"use server";

import prisma from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache";
import type { AuthUser } from "@/lib/access-control";
import type { Role, UserStatus } from "@/lib/generated/prisma/enums";

import { requireSession } from "@/app/data/auth/require-session";

export async function updateUserStatus(userId: string, newStatus: UserStatus) {
	try {
		const session = await requireSession({ minRole: "ADMIN" });
		const currentUser = session.user as AuthUser;

		const targetUser = await prisma.user.findUnique({
			where: { id: userId },
			select: { division: true, name: true },
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

		await prisma.adminLog.create({
			data: {
				action: "UPDATE_STATUS",
				entity: "User",
				details: `Changed status of ${targetUser.name || userId} to ${newStatus}`,
				userId: currentUser.id,
			},
		});

		revalidatePath("/admin/users");
		revalidateTag(CACHE_TAGS.ADMIN_STATS, "max");
		return { success: true, message: `Status updated to ${newStatus}` };
	} catch {
		return { error: "Failed to update status" };
	}
}

export async function updateUserRole(userId: string, newRole: Role) {
	try {
		const session = await requireSession({ minRole: "ADMIN" });

		// Prevent self-demotion to avoid account lockout
		if (session.user.id === userId) {
			return { error: "You cannot change your own role here." };
		}

		await prisma.user.update({
			where: { id: userId },
			data: { role: newRole },
		});

		const targetUser = await prisma.user.findUnique({
			where: { id: userId },
			select: { name: true },
		});

		await prisma.adminLog.create({
			data: {
				action: "UPDATE_ROLE",
				entity: "User",
				details: `Changed role of ${targetUser?.name || userId} to ${newRole}`,
				userId: session.user.id,
			},
		});

		revalidatePath("/admin/users");
		return { success: true, message: `Role updated to ${newRole}` };
	} catch {
		return { error: "Failed to update role" };
	}
}

export async function deleteUser(userId: string) {
	try {
		const session = await requireSession({ minRole: "ADMIN" });
		const currentUser = session.user as AuthUser;

		if (currentUser.id === userId) {
			return { error: "You cannot delete your own account." };
		}

		const targetUser = await prisma.user.findUnique({
			where: { id: userId },
			select: { division: true, status: true, name: true },
		});

		if (!targetUser) return { error: "User not found" };

		// Require user to be archived before deletion to prevent accidental data loss
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

		await prisma.adminLog.create({
			data: {
				action: "DELETE_USER",
				entity: "User",
				details: `Deleted user ${targetUser.name || userId} (was ${targetUser.division || "No Division"})`,
				userId: currentUser.id,
			},
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
