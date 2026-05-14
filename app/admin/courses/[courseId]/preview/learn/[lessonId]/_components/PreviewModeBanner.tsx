"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Eye } from "lucide-react";

export function PreviewModeBanner() {
	return (
		<Alert className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900">
			<Eye className="h-4 w-4 text-amber-600 dark:text-amber-400" />
			<AlertTitle className="text-amber-800 dark:text-amber-300">
				Preview Mode
			</AlertTitle>
			<AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
				You are viewing this course in preview mode. Progress is not tracked
				and all lessons are accessible.
			</AlertDescription>
		</Alert>
	);
}
