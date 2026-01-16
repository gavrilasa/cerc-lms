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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pagination } from "@/components/general/Pagination";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { format } from "date-fns";
import type { Prisma } from "@/lib/generated/prisma/client";

type AdminLogWithUser = Prisma.AdminLogGetPayload<{
	include: {
		user: {
			select: {
				name: true;
				email: true;
				image: true;
				role: true;
			};
		};
	};
}>;

interface LogsTableProps {
	logs: AdminLogWithUser[];
	metadata: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export default function LogsTable({ logs, metadata }: LogsTableProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [searchTerm, setSearchTerm] = useState(
		searchParams.get("search") || ""
	);

	const debouncedSearch = useDebounce(searchTerm, 500);

	useEffect(() => {
		const params = new URLSearchParams(searchParams.toString());
		const currentSearch = searchParams.get("search") || "";

		if (debouncedSearch === currentSearch) return;

		if (debouncedSearch) {
			params.set("search", debouncedSearch);
		} else {
			params.delete("search");
		}

		// Reset page when search changes
		params.delete("page");

		router.replace(`/admin/logs?${params.toString()}`);
	}, [debouncedSearch, router, searchParams]);

	const getRoleColor = (role: string) => {
		switch (role) {
			case "ADMIN":
				return "bg-purple-100 text-purple-700 border-purple-200";
			case "MENTOR":
				return "bg-blue-100 text-blue-700 border-blue-200";
			default:
				return "bg-gray-100 text-gray-600 border-gray-200";
		}
	};

	const getActionColor = (action: string) => {
		const lower = action.toLowerCase();
		if (lower.includes("create") || lower.includes("add"))
			return "bg-green-100 text-green-700 border-green-200";
		if (lower.includes("update") || lower.includes("edit"))
			return "bg-blue-100 text-blue-700 border-blue-200";
		if (lower.includes("delete") || lower.includes("remove"))
			return "bg-red-100 text-red-700 border-red-200";
		return "bg-gray-100 text-gray-700 border-gray-200";
	};

	return (
		<div className="space-y-4 px-4">
			<div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
				<div className="w-full sm:w-2xl">
					<Input
						placeholder="Search logs..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			</div>

			<div className="border rounded-md overflow-hidden bg-white">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="pl-4 w-[250px]">User (Actor)</TableHead>
							<TableHead className="text-center w-[150px]">Action</TableHead>
							<TableHead className="text-center w-[120px]">Entity</TableHead>
							<TableHead>Details</TableHead>
							<TableHead className="pr-4 w-[200px] text-center">Date</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{logs.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center py-10 text-muted-foreground pl-4 pr-4"
								>
									No logs found.
								</TableCell>
							</TableRow>
						) : (
							logs.map((log) => (
								<TableRow key={log.id}>
									<TableCell className="pl-4">
										<div className="flex items-center gap-3 py-1">
											<Avatar className="h-9 w-9">
												<AvatarImage src={log.user.image || ""} />
												<AvatarFallback>
													{log.user.name.slice(0, 2).toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div className="flex flex-col">
												<span className="font-medium text-sm">
													{log.user.name}
												</span>
												<div className="flex items-center gap-2">
													<span className="text-xs text-muted-foreground">
														{log.user.email}
													</span>
													<Badge
														variant="outline"
														className={`${getRoleColor(log.user.role)} text-[9px] px-1 py-0 h-4`}
													>
														{log.user.role}
													</Badge>
												</div>
											</div>
										</div>
									</TableCell>
									<TableCell className="text-center">
										<Badge
											variant="outline"
											className={getActionColor(log.action)}
										>
											{log.action}
										</Badge>
									</TableCell>
									<TableCell className="text-center">
										<span className="font-medium text-sm">{log.entity}</span>
									</TableCell>
									<TableCell
										className="text-sm text-muted-foreground truncate max-w-[400px]"
										title={log.details || ""}
									>
										{log.details || "-"}
									</TableCell>
									<TableCell className="pr-4 text-sm text-muted-foreground font-semibold">
										{format(new Date(log.createdAt), "PPP p")}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination Controls */}
			<Pagination
				currentPage={metadata.page}
				totalPages={metadata.totalPages}
			/>
		</div>
	);
}
