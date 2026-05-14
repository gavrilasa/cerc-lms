"use client";

import { Button } from "@/components/ui/button";
import { useZenModeStore } from "@/hooks/use-zen-mode";
import { cn } from "@/lib/utils";
import { Maximize2, Minimize2 } from "lucide-react";
import { PreviewModeBanner } from "./PreviewModeBanner";

interface AdminLessonWrapperProps {
	lessonTitle: string;
	children: React.ReactNode;
}

export function AdminLessonWrapper({
	lessonTitle,
	children,
}: AdminLessonWrapperProps) {
	const { isZenMode, toggleZenMode } = useZenModeStore();

	return (
		<div
			className={cn(
				"mx-auto transition-all duration-300 ease-in-out p-6 md:p-8",
				isZenMode ? "max-w-5xl" : "max-w-3xl"
			)}
		>
			{/* Preview Mode Banner - at top of content area */}
			<PreviewModeBanner />

			<div className="flex items-start justify-between gap-4 mb-8 border-b pb-4">
				<h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
					{lessonTitle}
				</h1>

				<Button
					variant="ghost"
					size="icon"
					onClick={toggleZenMode}
					className="cursor-pointer text-muted-foreground hover:text-primary shrink-0"
					title={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
				>
					{isZenMode ? (
						<Minimize2 className="size-5" />
					) : (
						<Maximize2 className="size-5" />
					)}
				</Button>
			</div>

			{/* Content */}
			{children}
		</div>
	);
}
