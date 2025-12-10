"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, Trash2, UserCog } from "lucide-react";
import { toast } from "sonner";
import { updateUserStatus, updateUserRole, deleteUser } from "../actions";
import type { Role, UserStatus } from "@/lib/generated/prisma";

interface UserActionsProps {
	user: {
		id: string;
		name: string;
		role: Role;
		status: UserStatus;
	};
}

export function UserActions({ user }: UserActionsProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [isStatusOpen, setIsStatusOpen] = useState(false);
	const [isRoleOpen, setIsRoleOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	const [selectedStatus, setSelectedStatus] = useState<UserStatus>(user.status);
	const [selectedRole, setSelectedRole] = useState<Role>(user.role);

	const handleStatusChange = async () => {
		setIsLoading(true);
		const res = await updateUserStatus(user.id, selectedStatus);
		setIsLoading(false);
		setIsStatusOpen(false);

		if (res.error) toast.error(res.error);
		else toast.success(res.message);
	};

	const handleRoleChange = async () => {
		setIsLoading(true);
		const res = await updateUserRole(user.id, selectedRole);
		setIsLoading(false);
		setIsRoleOpen(false);

		if (res.error) toast.error(res.error);
		else toast.success(res.message);
	};

	const handleDelete = async () => {
		setIsLoading(true);
		const res = await deleteUser(user.id);
		setIsLoading(false);
		setIsDeleteOpen(false);

		if (res.error) toast.error(res.error);
		else toast.success(res.message);
	};

	return (
		<>
			<div className="flex items-center justify-center gap-1">
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 cursor-pointer hover:bg-blue-100/50 text-blue-600 hover:text-blue-700"
					onClick={() => setIsStatusOpen(true)}
				>
					<Shield className="h-4 w-4" />
					<span className="sr-only">Change Status</span>
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 cursor-pointer hover:bg-green-100/50 text-green-600 hover:text-green-700"
					onClick={() => setIsRoleOpen(true)}
				>
					<UserCog className="h-4 w-4" />
					<span className="sr-only">Change Role</span>
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
					onClick={() => setIsDeleteOpen(true)}
				>
					<Trash2 className="h-4 w-4" />
					<span className="sr-only">Delete User</span>
				</Button>
			</div>

			<Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Change User Status</DialogTitle>
						<DialogDescription>
							Update the status for <b>{user.name}</b>. This will affect their
							access to the system.
						</DialogDescription>
					</DialogHeader>
					<div>
						<Select
							value={selectedStatus}
							onValueChange={(val) => setSelectedStatus(val as UserStatus)}
						>
							<SelectTrigger className="w-1/2 cursor-pointer">
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="PENDING" className="cursor-pointer">
									Pending
								</SelectItem>
								<SelectItem value="VERIFIED" className="cursor-pointer">
									Verified
								</SelectItem>
								<SelectItem value="REJECTED" className="cursor-pointer">
									Rejected
								</SelectItem>
								<SelectItem value="ARCHIVED" className="cursor-pointer">
									Archived
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsStatusOpen(false)}
							className="cursor-pointer"
						>
							Cancel
						</Button>
						<Button
							onClick={handleStatusChange}
							disabled={isLoading}
							className="cursor-pointer"
						>
							{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Save Changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={isRoleOpen} onOpenChange={setIsRoleOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Change User Role</DialogTitle>
						<DialogDescription>
							Update the role for <b>{user.name}</b>. Be careful with
							administrative roles.
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Select
							value={selectedRole}
							onValueChange={(val) => setSelectedRole(val as Role)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="USER">User</SelectItem>
								<SelectItem value="MEMBER">Member</SelectItem>
								<SelectItem value="MENTOR">Mentor</SelectItem>
								<SelectItem value="ADMIN">Admin</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsRoleOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleRoleChange} disabled={isLoading}>
							{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Save Changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete{" "}
							<b>{user.name}</b> account and remove their data from our servers.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault();
								handleDelete();
							}}
							disabled={isLoading}
							className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
						>
							{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
