import "server-only";

import prisma from "@/lib/db";
import { requireSession } from "@/app/data/auth/require-session";
import { Prisma } from "@/lib/generated/prisma/client";

export async function getLogs(
	page: number = 1,
	limit: number = 20,
	search?: string
) {
	await requireSession({ minRole: "ADMIN" });

	const whereClause: Prisma.AdminLogWhereInput = {};

	if (search) {
		whereClause.OR = [
			{ action: { contains: search, mode: "insensitive" } },
			{ entity: { contains: search, mode: "insensitive" } },
			{ details: { contains: search, mode: "insensitive" } },
			{
				user: {
					OR: [
						{ name: { contains: search, mode: "insensitive" } },
						{ email: { contains: search, mode: "insensitive" } },
					],
				},
			},
		];
	}

	const [logs, total] = await Promise.all([
		prisma.adminLog.findMany({
			where: whereClause,
			include: {
				user: {
					select: {
						name: true,
						email: true,
						image: true,
						role: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
			take: limit,
			skip: (page - 1) * limit,
		}),
		prisma.adminLog.count({ where: whereClause }),
	]);

	return {
		logs,
		metadata: {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		},
	};
}
