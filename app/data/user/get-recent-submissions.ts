import "server-only";
import { requireSession } from "@/app/data/auth/require-session";
import prisma from "@/lib/db";
import { AuthUser } from "@/lib/access-control";

export async function getRecentSubmissions() {
	const session = await requireSession();
	const user = session.user as AuthUser;

	const submissions = await prisma.submission.findMany({
		where: {
			userId: user.id,
		},
		select: {
			id: true,
			title: true,
			status: true,
			score: true,
			createdAt: true,
			feedback: true,
			course: {
				select: {
					title: true,
					slug: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
		take: 5,
	});

	return submissions;
}
