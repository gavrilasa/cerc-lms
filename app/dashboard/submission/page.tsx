import { Metadata } from "next";
import { requireSession } from "@/app/data/auth/require-session";
import { getUserSubmissions, getEnrolledCourses } from "./actions";
import { SubmissionTable } from "./_components/SubmissionTable";
import { CreateSubmissionDialog } from "./_components/CreateSubmissionDialog";

import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
	title: "Submission",
	description: "Lihat dan buat submission untuk mendapatkan poin.",
};

interface SubmissionPageProps {
	searchParams: Promise<{
		page?: string;
	}>;
}

export default async function SubmissionPage(props: SubmissionPageProps) {
	await requireSession();
	const searchParams = await props.searchParams;
	const page = Number(searchParams.page) || 1;
	const limit = 10;

	const [{ submissions, metadata }, enrolledCourses] = await Promise.all([
		getUserSubmissions(page, limit),
		getEnrolledCourses(),
	]);

	return (
		<div className="p-4 space-y-4">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-bold tracking-tight">Submission</h1>
					<p className="text-muted-foreground">
						Send tasks or projects to earn points.
					</p>
				</div>
				<CreateSubmissionDialog enrolledCourses={enrolledCourses} />
			</div>

			<Card>
				<CardContent>
					<SubmissionTable submissions={submissions} metadata={metadata} />
				</CardContent>
			</Card>
		</div>
	);
}
