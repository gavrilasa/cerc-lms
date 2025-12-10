"use client";

import { Button } from "@/components/ui/button";
import { useSignOut } from "@/hooks/use-signout";
import { LogOut } from "lucide-react";

export function LogoutButton() {
	const handleSignOut = useSignOut();

	return (
		<Button variant="outline" onClick={handleSignOut} className="w-full">
			<LogOut className="mr-2 size-4" />
			Logout & Kembali ke Home
		</Button>
	);
}
