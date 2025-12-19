"use client";

import { ReactNode } from "react";
import { useZenModeStore } from "@/hooks/use-zen-mode";
import { cn } from "@/lib/utils";
import { CourseSidebarDataType } from "@/app/data/course/get-course-sidebar-data";
import { CourseSidebar } from "./CourseSidebar";
// Catatan: Pastikan path import CourseSidebar sesuai dengan struktur folder Anda.
// Berdasarkan konteks file Anda, sidebar ada di dalam folder [lessonId]/_components.

interface LearnLayoutWrapperProps {
	children: ReactNode;
	course: CourseSidebarDataType["course"];
}

export function LearnLayoutWrapper({
	children,
	course,
}: LearnLayoutWrapperProps) {
	const { isZenMode } = useZenModeStore();

	return (
		<div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
			{/* Sidebar Area 
        Kita menggunakan CSS transition untuk efek sembunyi/muncul yang halus.
        Saat Zen Mode, width menjadi 0 dan opacity 0.
      */}
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
