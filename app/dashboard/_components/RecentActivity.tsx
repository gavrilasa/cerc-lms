import { getRecentSubmissions } from "@/app/data/user/get-recent-submissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History } from "lucide-react";

export async function RecentActivity() {
	const submissions = await getRecentSubmissions();

	return (
		<Card className="col-span-1">
			<CardHeader>
				<div className="flex items-center gap-2">
					<History className="h-5 w-5" />
					<CardTitle>Aktivitas Terakhir</CardTitle>
				</div>
			</CardHeader>
			<CardContent>
				<ScrollArea className="pr-4">
					<div className="space-y-4">
						{submissions.length === 0 ? (
							<p className="text-sm text-muted-foreground text-center py-8">
								Belum ada aktivitas submission.
							</p>
						) : (
							submissions.map((submission) => (
								<div
									key={submission.id}
									className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
								>
									<div className="space-y-1">
										<p className="text-sm font-medium leading-none">
											{submission.title}
										</p>
										<p className="text-xs text-muted-foreground">
											{submission.course?.title}
										</p>
										<p className="text-xs text-muted-foreground">
											{new Date(submission.createdAt).toLocaleDateString(
												"id-ID",
												{
													day: "numeric",
													month: "long",
													year: "numeric",
												}
											)}
										</p>
									</div>
									<div className="flex flex-col items-end gap-1">
										<StatusBadge
											status={submission.status}
											score={submission.score}
										/>
									</div>
								</div>
							))
						)}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}

function StatusBadge({
	status,
	score,
}: {
	status: string;
	score: number | null;
}) {
	if (status === "PENDING") {
		return <Badge variant="secondary">Menunggu Review</Badge>;
	}

	if (status === "REVIEWED") {
		return (
			<Badge variant={score && score >= 70 ? "default" : "destructive"}>
				{score !== null ? `Nilai: ${score}` : "Reviewed"}
			</Badge>
		);
	}

	return <Badge variant="outline">{status}</Badge>;
}
