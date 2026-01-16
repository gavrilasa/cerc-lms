"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { IconExternalLink } from "@tabler/icons-react";
import { toast } from "sonner";
import { gradeSubmission } from "@/app/dashboard/submission/actions";
import { type ReviewSubmission } from "@/app/dashboard/submission/actions";

import { Pagination } from "@/components/general/Pagination";

interface ReviewTableProps {
	submissions: ReviewSubmission[];
	metadata: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export function ReviewTable({ submissions, metadata }: ReviewTableProps) {
	const [selectedSubmission, setSelectedSubmission] =
		useState<ReviewSubmission | null>(null);
	const [score, setScore] = useState<number>(5);
	const [feedback, setFeedback] = useState("");
	const [isPending, startTransition] = useTransition();
	const router = useRouter();
	const searchParams = useSearchParams();

	const handleGrade = () => {
		if (!selectedSubmission) return;

		startTransition(async () => {
			const result = await gradeSubmission({
				submissionId: selectedSubmission.id,
				score,
				feedback,
			});

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success(result.message);
				setSelectedSubmission(null);
				setScore(5);
				setFeedback("");
				router.refresh();
			}
		});
	};

	if (submissions.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<p className="text-muted-foreground">Tidak ada submission saat ini.</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
				<div className="flex gap-2 w-full sm:w-auto">
					{/* Status Filter */}
					<Select
						defaultValue={searchParams.get("status") || "ALL"}
						onValueChange={(val) => {
							const params = new URLSearchParams(searchParams.toString());
							if (val === "ALL") params.delete("status");
							else params.set("status", val);
							params.delete("page");
							router.push(`/admin/review?${params.toString()}`);
						}}
					>
						<SelectTrigger className="w-[150px] cursor-pointer">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">All Status</SelectItem>
							<SelectItem value="PENDING">Pending</SelectItem>
							<SelectItem value="REVIEWED">Reviewed</SelectItem>
						</SelectContent>
					</Select>

					{/* Sort Order */}
					<Select
						defaultValue={searchParams.get("sort") || "desc"}
						onValueChange={(val) => {
							const params = new URLSearchParams(searchParams.toString());
							if (val === "desc") params.delete("sort");
							else params.set("sort", val);
							params.delete("page");
							router.push(`/admin/review?${params.toString()}`);
						}}
					>
						<SelectTrigger className="w-[150px] cursor-pointer">
							<SelectValue placeholder="Sort" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="desc">Newest</SelectItem>
							<SelectItem value="asc">Oldest</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="border rounded-md overflow-hidden bg-white">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="pl-4">Date</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Title</TableHead>
							<TableHead>Course</TableHead>
							<TableHead className="text-center">Type</TableHead>
							<TableHead className="text-center">Status</TableHead>
							<TableHead className="text-center">Score</TableHead>
							<TableHead className="text-center">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{submissions.map((submission) => (
							<TableRow key={submission.id}>
								<TableCell className="pl-4">
									{format(new Date(submission.createdAt), "dd MMM yyyy", {
										locale: id,
									})}
								</TableCell>
								<TableCell
									className="font-medium max-w-[150px] truncate"
									title={submission.user.name}
								>
									{submission.user.name}
								</TableCell>
								<TableCell
									className="max-w-[150px] truncate"
									title={submission.title}
								>
									{submission.title}
								</TableCell>
								<TableCell
									className="max-w-[200px] truncate"
									title={submission.course?.title || "-"}
								>
									{submission.course?.title || "-"}
								</TableCell>
								<TableCell className="text-center">
									<Badge
										variant={
											submission.type === "TASK" ? "default" : "secondary"
										}
									>
										{submission.type}
									</Badge>
								</TableCell>
								<TableCell className="text-center">
									<Badge
										variant={
											submission.status === "REVIEWED" ? "default" : "outline"
										}
										className={
											submission.status === "REVIEWED"
												? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
												: "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
										}
									>
										{submission.status === "REVIEWED" ? "Reviewed" : "Pending"}
									</Badge>
								</TableCell>
								<TableCell className="text-center">
									{submission.score !== null ? (
										<span className="font-semibold">{submission.score}/10</span>
									) : (
										<span className="text-muted-foreground">-</span>
									)}
								</TableCell>
								<TableCell className="text-center">
									{submission.status === "PENDING" ? (
										<Button
											size="sm"
											onClick={() => setSelectedSubmission(submission)}
											className="cursor-pointer"
										>
											Review
										</Button>
									) : (
										<Button
											size="sm"
											variant="outline"
											onClick={() => setSelectedSubmission(submission)}
											className="cursor-pointer"
										>
											Lihat
										</Button>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<Pagination
				currentPage={metadata.page}
				totalPages={metadata.totalPages}
			/>

			{/* Review Dialog */}
			<Dialog
				open={selectedSubmission !== null}
				onOpenChange={(open) => {
					if (!open) {
						setSelectedSubmission(null);
						setScore(5);
						setFeedback("");
					}
				}}
			>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>
							{selectedSubmission?.status === "REVIEWED"
								? "Detail Submission"
								: "Review Submission"}
						</DialogTitle>
						<DialogDescription>
							{selectedSubmission?.status === "REVIEWED"
								? "Submission ini sudah direview."
								: "Berikan penilaian untuk submission ini."}
						</DialogDescription>
					</DialogHeader>

					{selectedSubmission && (
						<div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
							{/* Submission Info */}
							<div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
								<div>
									<p className="text-sm text-muted-foreground">User</p>
									<p className="font-medium break-all">
										{selectedSubmission.user.name}
									</p>
									<p className="text-sm text-muted-foreground">
										{selectedSubmission.user.nim || "No NIM"}
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Tipe</p>
									<p className="font-medium">{selectedSubmission.type}</p>
									{selectedSubmission.course && (
										<p className="text-sm text-muted-foreground">
											{selectedSubmission.course.title}
										</p>
									)}
								</div>
							</div>

							{/* Title & Description */}
							<div>
								<p className="text-sm text-muted-foreground">Judul</p>
								<p className="font-medium break-all">
									{selectedSubmission.title}
								</p>
								{selectedSubmission.description && (
									<p className="text-sm mt-1 whitespace-pre-wrap break-all">
										{selectedSubmission.description}
									</p>
								)}
							</div>

							{/* Links */}
							<div>
								<p className="text-sm text-muted-foreground mb-2">Links</p>
								<div className="space-y-2">
									{selectedSubmission.links.map((link) => (
										<a
											key={link.id}
											href={link.url}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-start gap-2 text-sm text-primary hover:underline"
										>
											<IconExternalLink className="h-4 w-4 shrink-0 mt-0.5" />
											<span className="break-all">
												{link.label}: {link.url}
											</span>
										</a>
									))}
								</div>
							</div>

							{/* Show existing review or grading form */}
							{selectedSubmission.status === "REVIEWED" ? (
								<div className="border-t pt-4 space-y-4">
									<div className="grid grid-cols-2 gap-4 p-4 bg-green-500/10 rounded-lg">
										<div>
											<p className="text-sm text-muted-foreground">Skor</p>
											<p className="font-semibold text-lg">
												{selectedSubmission.score}/10
											</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">Reviewer</p>
											<p className="font-medium">
												{selectedSubmission.reviewer?.name || "-"}
											</p>
										</div>
									</div>
									{selectedSubmission.feedback && (
										<div>
											<p className="text-sm text-muted-foreground">Feedback</p>
											<p className="mt-1 whitespace-pre-wrap break-all">
												{selectedSubmission.feedback}
											</p>
										</div>
									)}
								</div>
							) : (
								<div className="border-t pt-4 space-y-4">
									<div className="space-y-2">
										<Label htmlFor="score">Skor (1-10)</Label>
										<Input
											id="score"
											type="number"
											min={1}
											max={10}
											value={score}
											onChange={(e) =>
												setScore(
													Math.min(
														10,
														Math.max(1, parseInt(e.target.value) || 1)
													)
												)
											}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="feedback">Feedback</Label>
										<Textarea
											id="feedback"
											placeholder="Berikan feedback untuk user..."
											value={feedback}
											onChange={(e) => setFeedback(e.target.value)}
											rows={3}
										/>
									</div>
								</div>
							)}
						</div>
					)}

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setSelectedSubmission(null)}
							className="cursor-pointer"
						>
							{selectedSubmission?.status === "REVIEWED" ? "Tutup" : "Batal"}
						</Button>
						{selectedSubmission?.status === "PENDING" && (
							<Button
								onClick={handleGrade}
								disabled={!feedback.trim() || isPending}
								className="cursor-pointer"
							>
								{isPending ? "Menyimpan..." : "Simpan Review"}
							</Button>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
