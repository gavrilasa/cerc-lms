import { Metadata } from "next";
import { requireSession } from "@/app/data/auth/require-session";
import { redirect } from "next/navigation";
import { getDivisionLeaderboard } from "@/app/dashboard/leaderboard/actions";
import { checkRole, type AuthUser } from "@/lib/access-control";
import { Division } from "@/lib/generated/prisma/enums";
import AdminLeaderboardClient from "./client";

export const metadata: Metadata = {
	title: "Leaderboard Divisi",
	description: "Lihat peringkat poin per divisi.",
};

export default async function AdminLeaderboardPage() {
	const session = await requireSession();
	const user = session.user as AuthUser;

	// Only ADMIN can access this page
	if (!checkRole(user, "ADMIN")) {
		redirect("/admin");
	}

	// Load initial data for first division
	const initialDivision = Division.SOFTWARE;
	const { entries } = await getDivisionLeaderboard(initialDivision);

	return (
		<AdminLeaderboardClient
			initialDivision={initialDivision}
			initialEntries={entries}
		/>
	);
}
