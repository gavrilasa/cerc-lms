"use client";

import * as React from "react";
import {
	IconCamera,
	IconDashboard,
	IconFileAi,
	IconFileDescription,
	IconHelp,
	IconSearch,
	IconSettings,
	IconLayout,
	IconSend,
	IconTrophy,
} from "@tabler/icons-react";
import { NavMain } from "@/components/sidebar/nav-main";
import { NavSecondary } from "@/components/sidebar/nav-secondary";
import { NavUser } from "@/components/sidebar/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";

const data = {
	navMain: [
		{
			title: "Dashboard",
			url: "/dashboard",
			icon: IconDashboard,
			exact: true,
		},
		{
			title: "Curriculum",
			url: "/dashboard/curriculum",
			icon: IconLayout,
		},
		{
			title: "Submission",
			url: "/dashboard/submission",
			icon: IconSend,
		},
		{
			title: "Leaderboard",
			url: "/dashboard/leaderboard",
			icon: IconTrophy,
			exact: true,
		},
		{
			title: "Division Leaderboard",
			url: "/dashboard/leaderboard/division",
			icon: IconTrophy,
			memberOnly: true,
		},
	],
	navClouds: [
		{
			title: "Capture",
			icon: IconCamera,
			isActive: true,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
		{
			title: "Proposal",
			icon: IconFileDescription,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
		{
			title: "Prompts",
			icon: IconFileAi,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
	],
	navSecondary: [
		{
			title: "Settings",
			url: "#",
			icon: IconSettings,
		},
		{
			title: "Get Help",
			url: "#",
			icon: IconHelp,
		},
		{
			title: "Search",
			url: "#",
			icon: IconSearch,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { data: session } = authClient.useSession();
	const isMember = session?.user?.role === "MEMBER";

	// Filter nav items based on user role
	const filteredNavMain = data.navMain.filter((item) => {
		if ("memberOnly" in item && item.memberOnly) {
			return isMember;
		}
		return true;
	});

	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:p-1.5!"
						>
							<Link href="/">
								<Image
									src="https://cerc-lms-bucket.t3.storage.dev/Logo-CERC-presspadding.webp"
									alt="Logo"
									width={36}
									height={29}
								/>
								<span className="text-base font-semibold">CERC LMS</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={filteredNavMain} />
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
