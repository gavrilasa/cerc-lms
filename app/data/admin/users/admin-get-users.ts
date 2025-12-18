import "server-only";

import prisma from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { UserStatus, Division } from "@/lib/generated/prisma/enums";
import { requireAdmin } from "../require-admin";

export async function getUsers(
	statusFilter?: UserStatus | "ALL",
	divisionFilter?: Division | "ALL",
	searchQuery?: string
) {
	await requireAdmin();

	const whereClause: Prisma.UserWhereInput = {};

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

	const users = await prisma.user.findMany({
		where: whereClause,
		orderBy: {
			createdAt: "desc",
		},
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
	});

	return users;
}
