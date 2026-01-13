"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error(error);
	}, [error]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-destructive/5">
			<div className="text-center space-y-6 p-8 max-w-md">
				<div className="flex justify-center">
					<div className="rounded-full bg-destructive/10 p-4">
						<AlertTriangle className="h-12 w-12 text-destructive" />
					</div>
				</div>

				<div className="space-y-2">
					<h1 className="text-3xl font-bold text-foreground">
						Something went wrong!
					</h1>
					<p className="text-muted-foreground">
						An unexpected error occurred. Please try again or contact support if
						the problem persists.
					</p>
					{error.digest && (
						<p className="text-xs text-muted-foreground font-mono">
							Error ID: {error.digest}
						</p>
					)}
				</div>

				<div className="flex flex-col sm:flex-row gap-3 justify-center">
					<Button onClick={reset} variant="outline">
						<RotateCcw className="mr-2 h-4 w-4" />
						Try Again
					</Button>
					<Button asChild>
						<Link href="/dashboard">
							<Home className="mr-2 h-4 w-4" />
							Go to Dashboard
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
