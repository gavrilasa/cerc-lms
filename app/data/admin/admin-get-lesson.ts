import "server-only";

import prisma from "@/lib/db";
import { requireSession } from "@/app/data/auth/require-session";
import { notFound } from "next/navigation";

export async function adminGetLesson(id: string) {
	// 1. Minimum role: MENTOR
	const session = await requireSession({ minRole: "MENTOR" });
	const user = session.user;

	const data = await prisma.lesson.findUnique({
		where: {
			id: id,
		},
		select: {
			title: true,
			description: true,
			id: true,
			position: true,
			chapter: {
				select: {
					course: {
						select: {
							division: true,
						},
					},
				},
			},
		},
	});

	if (!data) {
		return notFound();
	}

	// 2. Access Control
	if (user.role !== "ADMIN" && data.chapter.course.division !== user.division) {
		return notFound();
	}

	return {
		id: data.id,
		title: data.title,
		description: data.description,
		position: data.position,
	};
}

export type AdminLessonType = Awaited<ReturnType<typeof adminGetLesson>>;
