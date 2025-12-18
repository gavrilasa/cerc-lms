"use client";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, Lock } from "lucide-react";
import { useTransition } from "react";
import { enrollInCourseAction } from "../actions";
import { toast } from "sonner";

interface EnrollmentButtonProps {
	courseId: string;
	isLocked?: boolean;
	lockedMessage?: string;
}

export function EnrollmentButton({
	courseId,
	isLocked = false,
	lockedMessage = "Prasyarat belum terpenuhi",
}: EnrollmentButtonProps) {
	const [isPending, startTransition] = useTransition();

	const handleEnroll = async () => {
		startTransition(async () => {
			const res = await enrollInCourseAction(courseId);
			if (res?.status === "error") {
				toast.error(res.message);
			}
		});
	};

	// === Render State: LOCKED ===
	if (isLocked) {
		return (
			<TooltipProvider>
				<Tooltip delayDuration={0}>
					<TooltipTrigger asChild>
						{/* Span wrapper diperlukan agar Tooltip bekerja pada elemen disabled */}
						<span
							className="inline-block w-full cursor-not-allowed"
							tabIndex={0}
						>
							<Button
								disabled
								variant="ghost"
								className="w-full border border-muted-foreground/20 bg-muted/50 text-muted-foreground"
							>
								<Lock className="mr-2 h-4 w-4" />
								Terkunci
							</Button>
						</span>
					</TooltipTrigger>
					<TooltipContent className="bg-destructive text-destructive-foreground">
						<p className="text-sm font-medium">{lockedMessage}</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	// === Render State: DEFAULT / ACTIVE ===
	return (
		<Button onClick={handleEnroll} disabled={isPending} className="w-full">
			{isPending ? (
				<>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					Please Wait
				</>
			) : (
				"Enroll for Free"
			)}
		</Button>
	);
}
