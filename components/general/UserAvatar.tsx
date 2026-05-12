"use client";

import Avatar from "boring-avatars";
import { Avatar as ShadcnAvatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UserAvatarProps {
	user: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
		division?: string | null;
	};
	size?: number;
	className?: string;
}

const divisionColors: Record<string, string[]> = {
	SOFTWARE: ["#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE"],
	EMBEDDED: ["#EA580C", "#F97316", "#FB923C", "#FDBA74", "#FED7AA"],
	MULTIMEDIA: ["#DB2777", "#EC4899", "#F472B6", "#F9A8D4", "#FBCFE8"],
	NETWORKING: ["#0891B2", "#06B6D4", "#22D3EE", "#67E8F9", "#A5F3FC"],
};

const defaultColors = ["#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0", "#F1F5F9"];

export function UserAvatar({
	user,
	size = 36,
	className,
}: UserAvatarProps) {
	const colors = user.division ? divisionColors[user.division] || defaultColors : defaultColors;

	const fallbackContent = user.image ? null : (
		<Avatar
			size={size}
			name={user.id}
			variant="beam"
			colors={colors}
		/>
	);

	const initialsFallback =
		user.name && user.name.length > 0
			? user.name.slice(0, 2).toUpperCase()
			: user.email.slice(0, 2).toUpperCase();

	return (
		<ShadcnAvatar
			className={className}
			style={{ width: size, height: size }}
		>
			<AvatarImage src={user.image || ""} />
			<AvatarFallback className="p-0 overflow-hidden">
				{fallbackContent || initialsFallback}
			</AvatarFallback>
		</ShadcnAvatar>
	);
}
