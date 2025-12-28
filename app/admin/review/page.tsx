import { Metadata } from "next";
import { requireSession } from "@/app/data/auth/require-session";
import { redirect } from "next/navigation";
import { getAllSubmissionsForReview } from "@/app/dashboard/submission/actions";
import { ReviewTable } from "./_components/ReviewTable";
import { checkRole, type AuthUser } from "@/lib/access-control";

export const metadata: Metadata = {
	title: "Review Submission",
	description: "Review dan berikan penilaian untuk submission user.",
};

export default async function ReviewPage() {
	const session = await requireSession();
	const user = session.user as AuthUser;

	// Only MENTOR and ADMIN can access this page
	if (!checkRole(user, "MENTOR")) {
		redirect("/admin");
	}

	const submissions = await getAllSubmissionsForReview();

	return (
		<div className="flex flex-col space-y-8">
			<div className="flex flex-col space-y-2">
				<h1 className="text-3xl font-bold tracking-tight">
					Review Submission
				</h1>
				<p className="text-muted-foreground">
					Submission yang menunggu review dari user di divisi Anda.
				</p>
			</div>

			<div className="rounded-md border">
				<ReviewTable submissions={submissions} />
			</div>
		</div>
	);
}
