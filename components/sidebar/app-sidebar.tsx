"use client";

import * as React from "react";
import {
	IconCamera,
	IconChartBar,
	IconDashboard,
	IconFileAi,
	IconFileDescription,
	IconFolder,
	IconHelp,
	IconListDetails,
	IconSearch,
	IconSettings,
	IconEye,
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

const data = {
	navMain: [
		{
			title: "Dashboard",
			url: "/admin",
			icon: IconDashboard,
		},
		{
			title: "Courses",
			url: "/admin/courses",
			icon: IconListDetails,
		},
		{
			title: "Users",
			url: "/admin/users",
			icon: IconChartBar,
		},
		{
			title: "Curriculum",
			url: "/admin/curriculum",
			icon: IconFolder,
		},
		{
			title: "Review",
			url: "/admin/review",
			icon: IconEye,
		},
		{
			title: "Leaderboard Divisi",
			url: "/admin/leaderboard",
			icon: IconTrophy,
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
				<NavMain items={data.navMain} />
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
