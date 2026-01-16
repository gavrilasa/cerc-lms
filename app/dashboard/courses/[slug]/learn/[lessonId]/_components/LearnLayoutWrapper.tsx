"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useZenModeStore } from "@/hooks/use-zen-mode";
import { cn } from "@/lib/utils";
import { CourseSidebarDataType } from "@/app/data/course/get-course-sidebar-data";
import { CourseSidebar } from "./CourseSidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen } from "lucide-react";

interface LearnLayoutWrapperProps {
	children: ReactNode;
	course: CourseSidebarDataType["course"];
}

export function LearnLayoutWrapper({
	children,
	course,
}: LearnLayoutWrapperProps) {
	const { isZenMode, toggleZenMode } = useZenModeStore();
	const { setOpen } = useSidebar();
	const hasClosedOnMount = useRef(false);

	// Auto-close the main AppSidebar only once when entering learn mode
	useEffect(() => {
		if (!hasClosedOnMount.current) {
			setOpen(false);
			hasClosedOnMount.current = true;
		}
	}, [setOpen]);

	return (
		<div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
			{/* Floating button to open sidebar when hidden */}
			{isZenMode && (
				<Button
					variant="outline"
					size="icon"
					className="fixed left-6 top-20 z-50 size-8 shadow-md bg-background cursor-pointer"
					onClick={toggleZenMode}
					title="Open sidebar"
				>
					<PanelLeftOpen className="size-4" />
				</Button>
			)}

			{/* Sidebar Area */}
			<aside
				className={cn(
					"border-r border-border shrink-0 transition-all duration-300 ease-in-out bg-background overflow-hidden",
					isZenMode ? "w-0 opacity-0 border-none" : "w-80 opacity-100"
				)}
			>
				<div className="w-80 h-full overflow-y-auto">
					<CourseSidebar course={course} />
				</div>
			</aside>

			{/* Main Content Area */}
			<main className="flex-1 overflow-y-auto relative bg-muted/10">
				{children}
			</main>
		</div>
	);
}
