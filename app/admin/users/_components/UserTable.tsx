"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserActions } from "./UserActions";
import type { Division, UserStatus, Role } from "@/lib/generated/prisma/enums";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { DivisionBadge } from "@/components/general/DivisionBadge";

interface UserTableProps {
	users: {
		id: string;
		name: string;
		email: string;
		nim: string | null;
		division: Division | null;
		status: UserStatus;
		role: Role;
		createdAt: Date;
		image: string | null;
	}[];
}

export default function UserTable({ users }: UserTableProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [searchTerm, setSearchTerm] = useState(
		searchParams.get("search") || ""
	);

	const debouncedSearch = useDebounce(searchTerm, 500);

	useEffect(() => {
		const params = new URLSearchParams(searchParams.toString());

		if (debouncedSearch === searchParams.get("search")) return;

		if (debouncedSearch) {
			params.set("search", debouncedSearch);
		} else {
			params.delete("search");
		}
		router.replace(`/admin/users?${params.toString()}`);
	}, [debouncedSearch, router, searchParams]);

	const handleFilterChange = (key: string, value: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (value === "ALL") params.delete(key);
		else params.set(key, value);
		router.push(`/admin/users?${params.toString()}`);
	};

	const getStatusColor = (status: UserStatus) => {
		switch (status) {
			case "VERIFIED":
				return "bg-green-100 text-green-700 border-green-200";
			case "REJECTED":
				return "bg-red-100 text-red-700 border-red-200";
			case "ARCHIVED":
				return "bg-gray-100 text-gray-700 border-gray-200";
			default:
				return "bg-yellow-100 text-yellow-700 border-yellow-200";
		}
	};

	const getRoleColor = (role: Role) => {
		switch (role) {
			case "ADMIN":
				return "bg-purple-100 text-purple-700 border-purple-200";
			case "MENTOR":
				return "bg-blue-100 text-blue-700 border-blue-200";
			case "MEMBER":
				return "bg-emerald-100 text-emerald-700 border-emerald-200";
			default:
				return "bg-gray-100 text-gray-600 border-gray-200";
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
				<div className="w-full sm:w-72">
					<Input
						placeholder="Search users..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>

				<div className="flex gap-2 w-full sm:w-auto">
					<Select
						defaultValue={searchParams.get("status") || "ALL"}
						onValueChange={(val) => handleFilterChange("status", val)}
					>
						<SelectTrigger className="w-[150px]">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">All Status</SelectItem>
							<SelectItem value="PENDING">Pending</SelectItem>
							<SelectItem value="VERIFIED">Verified</SelectItem>
							<SelectItem value="REJECTED">Rejected</SelectItem>
							<SelectItem value="ARCHIVED">Archived</SelectItem>
						</SelectContent>
					</Select>

					<Select
						defaultValue={searchParams.get("division") || "ALL"}
						onValueChange={(val) => handleFilterChange("division", val)}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Division" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">All Divisions</SelectItem>
							<SelectItem value="SOFTWARE">Software</SelectItem>
							<SelectItem value="EMBEDDED">Embedded</SelectItem>
							<SelectItem value="MULTIMEDIA">Multimedia</SelectItem>
							<SelectItem value="NETWORKING">Networking</SelectItem>
							<SelectItem value="ARTIFICIAL_INTELLIGENCE">AI</SelectItem>
							<SelectItem value="CYBER_SECURITY">Cyber Security</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="border rounded-md overflow-hidden bg-white">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="pl-4">User Information</TableHead>
							<TableHead className="text-center">Division</TableHead>
							<TableHead className="text-center">Role</TableHead>
							<TableHead className="text-center">Status</TableHead>
							<TableHead className="text-center pr-4">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{users.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center py-10 text-muted-foreground pl-4 pr-4"
								>
									No users found.
								</TableCell>
							</TableRow>
						) : (
							users.map((user) => (
								<TableRow key={user.id}>
									<TableCell className="pl-4">
										<div className="flex items-center gap-3 py-1">
											<Avatar className="h-9 w-9">
												<AvatarImage src={user.image || ""} />
												<AvatarFallback>
													{user.name.slice(0, 2).toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div className="flex flex-col">
												<span className="font-medium text-sm">{user.name}</span>
												<span className="text-xs text-muted-foreground">
													{user.email} • {user.nim || "No NIM"}
												</span>
											</div>
										</div>
									</TableCell>
									<TableCell className="text-center">
										{user.division ? (
											<DivisionBadge division={user.division} />
										) : (
											<span className="text-muted-foreground text-xs">-</span>
										)}
									</TableCell>
									<TableCell className="text-center">
										<Badge
											variant="outline"
											className={`${getRoleColor(user.role)} font-medium text-[10px] px-2 py-0.5`}
										>
											{user.role}
										</Badge>
									</TableCell>
									<TableCell className="text-center">
										<Badge
											variant="outline"
											className={`${getStatusColor(user.status)} font-medium text-[10px] px-2 py-0.5`}
										>
											{user.status}
										</Badge>
									</TableCell>
									<TableCell className="text-center pr-4">
										<UserActions user={user} />
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
