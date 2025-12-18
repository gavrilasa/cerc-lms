import { getUsers } from "@/app/data/admin/users/admin-get-users";
import UserTable from "./_components/UserTable";
import type { Division, UserStatus } from "@/lib/generated/prisma/enums";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
	title: "Manajemen User | Admin CERC",
};

interface AdminUsersPageProps {
	searchParams: Promise<{
		status?: string;
		division?: string;
		search?: string;
	}>;
}

export default async function AdminUsersPage(props: AdminUsersPageProps) {
	const searchParams = await props.searchParams;

	const statusFilter = (searchParams.status as UserStatus) || "ALL";
	const divisionFilter = (searchParams.division as Division) || "ALL";
	const searchQuery = searchParams.search || "";

	const users = await getUsers(statusFilter, divisionFilter, searchQuery);

	return (
		<div className="p-4 space-y-4">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold tracking-tight">Manajemen User</h1>
				<p className="text-muted-foreground">
					Kelola semua pengguna sistem (Verifikasi, Role, Status, dan
					Penghapusan).
				</p>
			</div>

			<Card>
				<CardContent>
					<UserTable users={users} />
				</CardContent>
			</Card>
		</div>
	);
}
