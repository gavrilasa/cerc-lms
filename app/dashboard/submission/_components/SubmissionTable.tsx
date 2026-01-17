"use client";

import { useState } from "react";
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { IconEye, IconExternalLink } from "@tabler/icons-react";
import { type SubmissionWithDetails } from "../actions";

import { Pagination } from "@/components/general/Pagination";

interface SubmissionTableProps {
	submissions: SubmissionWithDetails[];
	metadata: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export function SubmissionTable({
	submissions,
	metadata,
}: SubmissionTableProps) {
	const [selectedSubmission, setSelectedSubmission] =
		useState<SubmissionWithDetails | null>(null);

	if (submissions.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<p className="text-muted-foreground">
					Belum ada submission. Klik tombol di atas untuk membuat submission
					baru.
				</p>
			</div>
		);
	}

	return (
		<>
			<div className="border rounded-md overflow-hidden bg-white">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="pl-4 w-px whitespace-nowrap">
								Date
							</TableHead>
							<TableHead>Title</TableHead>
							<TableHead>Course</TableHead>
							<TableHead className="text-center">Type</TableHead>
							<TableHead className="text-center">Status</TableHead>
							<TableHead className="text-center">Score</TableHead>
							<TableHead className="text-center w-[50px] pr-4">
								Action
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{submissions.map((submission) => (
							<TableRow key={submission.id}>
								<TableCell className="pl-4 whitespace-nowrap">
									{format(new Date(submission.createdAt), "dd MMM yyyy", {
										locale: id,
									})}
								</TableCell>
								<TableCell
									className="font-medium max-w-[150px] truncate"
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
								<TableCell className="text-center pr-4">
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 cursor-pointer"
										onClick={() => setSelectedSubmission(submission)}
									>
										<IconEye className="h-4 w-4" />
									</Button>
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

			<Dialog
				open={selectedSubmission !== null}
				onOpenChange={(open) => !open && setSelectedSubmission(null)}
			>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Detail Submission</DialogTitle>
						<DialogDescription>
							Detail informasi submission dan hasil review.
						</DialogDescription>
					</DialogHeader>

					{selectedSubmission && (
						<div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
							{/* INFO */}
							<div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
								<div>
									<p className="text-sm text-muted-foreground">Tipe</p>
									<p className="font-medium">{selectedSubmission.type}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Course</p>
									<p className="font-medium">
										{selectedSubmission.course?.title || "-"}
									</p>
								</div>
							</div>

							{/* DETAILS */}
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

							{/* LINKS */}
							{selectedSubmission.links.length > 0 && (
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
							)}

							{/* REVIEW RESULT */}
							{selectedSubmission.status === "REVIEWED" && (
								<div className="border-t pt-4 space-y-4">
									<div className="flex items-center gap-2">
										<h4 className="font-semibold">Hasil Review</h4>
										<Badge
											variant="outline"
											className="bg-green-500/10 text-green-600"
										>
											Reviewed
										</Badge>
									</div>

									<div className="grid grid-cols-2 gap-4 p-4 bg-green-500/5 rounded-lg border border-green-500/20">
										<div>
											<p className="text-sm text-muted-foreground">Skor</p>
											<p className="font-bold text-2xl text-green-700">
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
											<p className="mt-1 whitespace-pre-wrap break-all text-sm">
												{selectedSubmission.feedback}
											</p>
										</div>
									)}
								</div>
							)}
						</div>
					)}

					<DialogFooter>
						<Button
							onClick={() => setSelectedSubmission(null)}
							className="cursor-pointer"
						>
							Tutup
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
