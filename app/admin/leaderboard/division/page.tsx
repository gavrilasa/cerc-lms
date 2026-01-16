import { Metadata } from "next";
import { requireSession } from "@/app/data/auth/require-session";
import { redirect } from "next/navigation";
import { getDivisionLeaderboard } from "@/app/dashboard/leaderboard/actions";
import { checkRole, type AuthUser } from "@/lib/access-control";
import { Division } from "@/lib/generated/prisma/enums";
import AdminLeaderboardClient from "./client";

export const metadata: Metadata = {
	title: "Division Leaderboard",
	description: "View point rankings per division.",
};

export default async function AdminLeaderboardPage() {
	const session = await requireSession();
	const user = session.user as AuthUser;

	// ADMIN and MENTOR can access this page
	if (!checkRole(user, "MENTOR")) {
		redirect("/admin");
	}

	const isAdmin = user.role === "ADMIN";
	// For Mentors, use their own division. For Admins, default to SOFTWARE.
	const initialDivision = isAdmin
		? Division.SOFTWARE
		: (user.division as Division) || Division.SOFTWARE;
	const { entries } = await getDivisionLeaderboard(initialDivision);

	return (
		<AdminLeaderboardClient
			initialDivision={initialDivision}
			initialEntries={entries}
			isAdmin={isAdmin}
		/>
	);
}
