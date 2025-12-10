"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { checkRole, type AuthUser } from "@/lib/access-control";
import { type Role, type UserStatus } from "@/lib/generated/prisma"; // Pastikan import dari generated

// Helper untuk validasi sesi admin (DRY)
async function validateAdmin() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session || !checkRole(session.user as AuthUser, "ADMIN")) {
		throw new Error("Unauthorized");
	}
	return session;
}

// 1. Update Status (Bisa untuk Approve, Reject, Archive, Restore)
export async function updateUserStatus(userId: string, newStatus: UserStatus) {
	try {
		await validateAdmin();
		await prisma.user.update({
			where: { id: userId },
			data: { status: newStatus },
		});
		revalidatePath("/admin/users");
		return { success: true, message: `Status updated to ${newStatus}` };
	} catch {
		return { error: "Failed to update status" };
	}
}

// 2. Update Role (Promosi/Demosi: Guest <-> Admin)
export async function updateUserRole(userId: string, newRole: Role) {
	try {
		const session = await validateAdmin();

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
		const session = await validateAdmin();

		if (session.user.id === userId) {
			return { error: "You cannot delete your own account." };
		}

		await prisma.user.delete({
			where: { id: userId },
		});
		revalidatePath("/admin/users");
		return { success: true, message: "User deleted permanently" };
	} catch (error) {
		console.error(error);
		return { error: "Failed to delete user" };
	}
}
