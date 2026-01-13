"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
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
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Tanggal</TableHead>
						<TableHead>Judul</TableHead>
						<TableHead>Tipe</TableHead>
						<TableHead>Course</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Skor</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{submissions.map((submission) => (
						<TableRow key={submission.id}>
							<TableCell>
								{format(new Date(submission.createdAt), "dd MMM yyyy", {
									locale: id,
								})}
							</TableCell>
							<TableCell className="font-medium">{submission.title}</TableCell>
							<TableCell>
								<Badge
									variant={submission.type === "TASK" ? "default" : "secondary"}
								>
									{submission.type}
								</Badge>
							</TableCell>
							<TableCell>{submission.course?.title || "-"}</TableCell>
							<TableCell>
								<Badge
									variant={
										submission.status === "REVIEWED" ? "default" : "outline"
									}
									className={
										submission.status === "REVIEWED"
											? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
											: ""
									}
								>
									{submission.status === "REVIEWED" ? "Reviewed" : "Pending"}
								</Badge>
							</TableCell>
							<TableCell>
								{submission.score !== null ? (
									<span className="font-semibold">{submission.score}/10</span>
								) : (
									<span className="text-muted-foreground">-</span>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<Pagination
				currentPage={metadata.page}
				totalPages={metadata.totalPages}
			/>
		</>
	);
}
