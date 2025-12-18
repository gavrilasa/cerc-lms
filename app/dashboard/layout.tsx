import "server-only";

import { AppSidebar } from "./_components/DashboardAppSidebar";
import { SiteHeader } from "@/components/sidebar/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";
import { requireUser } from "@/app/data/user/require-user";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";

export default async function DashboardLayout({
	children,
}: {
	children: ReactNode;
}) {
	const user = await requireUser();

	if (user.status === "VERIFIED") {
		if (!user.selectedCurriculumId) {
			redirect("/select-curriculum");
		}

		const curriculum = await prisma.curriculum.findUnique({
			where: { id: user.selectedCurriculumId },
			select: { status: true },
		});

		if (!curriculum || curriculum.status === "ARCHIVED") {
			redirect("/select-curriculum");
		}
	}

	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "calc(var(--spacing) * 72)",
					"--header-height": "calc(var(--spacing) * 12)",
				} as React.CSSProperties
			}
		>
			<AppSidebar variant="inset" />
			<SidebarInset>
				<SiteHeader />
				<div className="flex flex-1 flex-col">
					<div className="@container/main flex flex-1 flex-col gap-2">
						<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
							{children}
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
