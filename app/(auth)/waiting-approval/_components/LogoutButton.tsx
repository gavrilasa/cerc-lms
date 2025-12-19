"use client";

import { Button } from "@/components/ui/button";
import { useSignOut } from "@/hooks/use-signout";
import { LogOut } from "lucide-react";

export function LogoutButton() {
	const handleSignOut = useSignOut();

	return (
		<Button variant="outline" onClick={handleSignOut} className="w-full gap-2">
			<LogOut className="size-4" />
			Logout
		</Button>
	);
}
