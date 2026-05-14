"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { exportCourseToMarkdown } from "@/app/data/admin/export-course-to-markdown";
import {
	Download,
	FileText,
	Loader2,
	AlertCircle,
	CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ExportCourseButtonProps {
	courseId: string;
	courseTitle: string;
}

type ExportStatus = "idle" | "loading" | "success" | "error";

interface ExportState {
	status: ExportStatus;
	progress: number;
	message: string;
	filename?: string;
	markdown?: string;
	error?: string;
}

export function ExportCourseButton({
	courseId,
	courseTitle,
}: ExportCourseButtonProps) {
	const [open, setOpen] = useState(false);
	const [state, setState] = useState<ExportState>({
		status: "idle",
		progress: 0,
		message: "Ready to export",
	});

	const handleExport = async () => {
		try {
			setState({
				status: "loading",
				progress: 10,
				message: "Fetching course data...",
			});

			// Simulate progress updates
			const progressInterval = setInterval(() => {
				setState((prev) => ({
					...prev,
					progress: Math.min(prev.progress + 15, 80),
				}));
			}, 200);

			const result = await exportCourseToMarkdown(courseId);

			clearInterval(progressInterval);

			if ("error" in result) {
				setState({
					status: "error",
					progress: 0,
					message: "Export failed",
					error: result.error,
				});
				toast.error(`Export failed: ${result.error}`);
				return;
			}

			setState({
				status: "success",
				progress: 100,
				message: "Export complete!",
				filename: result.filename,
				markdown: result.markdown,
			});

			toast.success("Course exported successfully!");
		} catch (error) {
			setState({
				status: "error",
				progress: 0,
				message: "Export failed",
				error: error instanceof Error ? error.message : "Unknown error",
			});
			toast.error("An unexpected error occurred");
		}
	};

	const handleDownload = () => {
		if (!state.markdown || !state.filename) return;

		// Create blob and download
		const blob = new Blob([state.markdown], { type: "text/markdown" });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = state.filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);

		toast.success(`Downloaded ${state.filename}`);
		setOpen(false);

		// Reset state after dialog closes
		setTimeout(() => {
			setState({
				status: "idle",
				progress: 0,
				message: "Ready to export",
			});
		}, 300);
	};

	const handleClose = () => {
		if (state.status !== "loading") {
			setOpen(false);
			setTimeout(() => {
				setState({
					status: "idle",
					progress: 0,
					message: "Ready to export",
				});
			}, 300);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="gap-2"
					onClick={() => setOpen(true)}
				>
					<FileText className="h-4 w-4" />
					Export to Markdown
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md gap-0">
				<DialogHeader className="gap-4">
					<DialogTitle className="flex items-center gap-2">
						{state.status === "loading" && (
							<Loader2 className="h-5 w-5 animate-spin" />
						)}
						{state.status === "success" && (
							<CheckCircle className="h-5 w-5 text-green-500" />
						)}
						{state.status === "error" && (
							<AlertCircle className="h-5 w-5 text-red-500" />
						)}
						{state.status === "idle" && <FileText className="h-5 w-5" />}
						Export Course
					</DialogTitle>
					<DialogDescription>
						{state.status === "idle" && (
							<>
								Export <strong>{courseTitle}</strong> to Markdown format
								including all chapters and lessons.
							</>
						)}
						{state.status === "loading" && state.message}
						{state.status === "success" && (
							<>Course exported successfully! Ready to download.</>
						)}
						{state.status === "error" && (
							<>
								<span className="text-red-600">{state.error}</span>
							</>
						)}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{state.status === "loading" && (
						<div className="space-y-2">
							<Progress value={state.progress} className="w-full" />
							<p className="text-sm text-muted-foreground text-center">
								{state.progress}%
							</p>
						</div>
					)}

					{state.status === "success" && state.filename && (
						<div className="space-y-4">
							<div className="bg-muted p-3 rounded-md">
								<p className="text-sm font-medium">Filename:</p>
								<p className="text-sm text-muted-foreground font-mono">
									{state.filename}
								</p>
							</div>
							<div className="bg-muted p-3 rounded-md max-h-32 overflow-y-auto">
								<p className="text-sm font-medium mb-2">Preview:</p>
								<pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
									{state.markdown?.slice(0, 500)}...
								</pre>
							</div>
						</div>
					)}

					{state.status === "error" && (
						<div className="bg-red-50 border border-red-200 p-3 rounded-md">
							<p className="text-sm text-red-600">
								Please try again or contact support if the problem persists.
							</p>
						</div>
					)}
				</div>

				<div className="flex gap-2 justify-end">
					{state.status !== "loading" && (
						<Button variant="outline" onClick={handleClose}>
							{state.status === "success" ? "Close" : "Cancel"}
						</Button>
					)}
					{state.status === "idle" && (
						<Button onClick={handleExport} className="gap-2">
							<Download className="h-4 w-4" />
							Start Export
						</Button>
					)}
					{state.status === "success" && (
						<Button onClick={handleDownload} className="gap-2">
							<Download className="h-4 w-4" />
							Download .md
						</Button>
					)}
					{state.status === "error" && (
						<Button onClick={handleExport} variant="default">
							Try Again
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
