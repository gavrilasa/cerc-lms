"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
	const router = useRouter();

	return (
		<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-muted/20">
			<div className="text-center space-y-6 p-8 max-w-md">
				<div className="space-y-2">
					<h1 className="text-8xl font-bold text-primary">404</h1>
					<h2 className="text-2xl font-semibold text-foreground">
						Page Not Found
					</h2>
					<p className="text-muted-foreground">
						Sorry, the page you are looking for doesn&apos;t exist or has been
						moved.
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 justify-center">
					<Button variant="outline" onClick={() => router.back()}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Go Back
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
