import { Metadata } from "next";
import { requireSession } from "@/app/data/auth/require-session";
import { getUserSubmissions, getEnrolledCourses } from "./actions";
import { SubmissionTable } from "./_components/SubmissionTable";
import { CreateSubmissionDialog } from "./_components/CreateSubmissionDialog";

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
		<div className="flex flex-col space-y-8">
			<div className="flex flex-col space-y-2">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Submission</h1>
						<p className="text-muted-foreground">
							Kirim tugas atau project untuk mendapatkan poin.
						</p>
					</div>
					<CreateSubmissionDialog enrolledCourses={enrolledCourses} />
				</div>
			</div>

			<div className="rounded-md border">
				<SubmissionTable submissions={submissions} metadata={metadata} />
			</div>
		</div>
	);
}
