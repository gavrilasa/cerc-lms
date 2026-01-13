import "server-only";

import prisma from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { UserStatus, Division } from "@/lib/generated/prisma/enums";
import { requireSession } from "@/app/data/auth/require-session";

export async function getUsers(
	statusFilter?: UserStatus | "ALL",
	divisionFilter?: Division | "ALL",
	searchQuery?: string,
	page: number = 1,
	limit: number = 10
) {
	const session = await requireSession({ minRole: "MENTOR" });
	const user = session.user;

	const whereClause: Prisma.UserWhereInput = {};

	// Mentor hanya bisa melihat user satu divisi atau user yang belum punya divisi (Pending)
	if (user.role !== "ADMIN" && user.division) {
		whereClause.OR = [
			{ division: user.division as Division },
			{ division: null },
		];
	}

	if (statusFilter && statusFilter !== "ALL") {
		whereClause.status = statusFilter;
	}

	if (divisionFilter && divisionFilter !== "ALL") {
		whereClause.division = divisionFilter;
	}

	if (searchQuery) {
		whereClause.OR = [
			{ name: { contains: searchQuery, mode: "insensitive" } },
			{ email: { contains: searchQuery, mode: "insensitive" } },
			{ nim: { contains: searchQuery, mode: "insensitive" } },
		];
	}

	const [users, total] = await Promise.all([
		prisma.user.findMany({
			where: whereClause,
			orderBy: {
				createdAt: "desc",
			},
			take: limit,
			skip: (page - 1) * limit,
			select: {
				id: true,
				name: true,
				email: true,
				nim: true,
				division: true,
				status: true,
				role: true,
				createdAt: true,
				image: true,
			},
		}),
		prisma.user.count({ where: whereClause }),
	]);

	return {
		users,
		metadata: {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		},
	};
}
