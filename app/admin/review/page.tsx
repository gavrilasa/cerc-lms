import { Metadata } from "next";
import { requireSession } from "@/app/data/auth/require-session";
import { redirect } from "next/navigation";
import { getAllSubmissionsForReview } from "@/app/dashboard/submission/actions";
import { ReviewTable } from "./_components/ReviewTable";
import { checkRole, type AuthUser } from "@/lib/access-control";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
	title: "Review Submission",
	description: "Review dan berikan penilaian untuk submission user.",
};

interface ReviewPageProps {
	searchParams: Promise<{
		page?: string;
		status?: string;
		sort?: string;
	}>;
}

export default async function ReviewPage(props: ReviewPageProps) {
	const session = await requireSession();
	const user = session.user as AuthUser;

	// Only MENTOR and ADMIN can access this page
	if (!checkRole(user, "MENTOR")) {
		redirect("/admin");
	}

	const searchParams = await props.searchParams;
	const page = Number(searchParams.page) || 1;
	const status = searchParams.status || "ALL";
	const sort = (searchParams.sort as "asc" | "desc") || "desc";
	const limit = 10;

	const { submissions, metadata } = await getAllSubmissionsForReview(
		page,
		limit,
		status,
		sort
	);

	return (
		<div className="p-4 space-y-4">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold tracking-tight">Review Submission</h1>
				<p className="text-muted-foreground">
					Submission yang menunggu review dari user di divisi Anda.
				</p>
			</div>

			<Card>
				<CardContent>
					<ReviewTable submissions={submissions} metadata={metadata} />
				</CardContent>
			</Card>
		</div>
	);
}
