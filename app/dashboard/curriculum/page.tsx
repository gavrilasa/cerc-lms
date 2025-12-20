import { redirect } from "next/navigation";
import { Metadata } from "next";

import { requireUser } from "@/app/data/user/require-user";
import { getCurriculumTimeline } from "@/app/data/curriculum/get-curriculum-timeline";
import { CurriculumTimeline } from "./_components/CurriculumTimeline";
import { EmptyState } from "@/components/general/EmptyState";

export const metadata: Metadata = {
	title: "My Curriculum",
	description: "Track your learning progress and unlock new courses.",
};

export default async function CurriculumPage() {
	// 1. Auth & Validation
	const user = await requireUser();

	// Jika user belum memilih kurikulum, redirect ke halaman seleksi
	if (!user.selectedCurriculumId) {
		redirect("/select-curriculum");
	}

	// 2. Data Loading
	const timelineItems = await getCurriculumTimeline();

	// Edge Case: Data kosong (misal kurikulum belum disetup admin)
	if (timelineItems.length === 0) {
		return (
			<div className="flex h-[calc(100vh-200px)] items-center justify-center p-8">
				<EmptyState
					title="No Curriculum Found"
					description="It seems this curriculum doesn't have any courses yet. Please contact your admin."
					href="/dashboard"
					buttonText="Back to Dashboard"
				/>
			</div>
		);
	}

	// 3. Rendering
	return (
		<div className="flex flex-col space-y-8 p-8">
			<div className="flex flex-col space-y-2">
				<h1 className="text-3xl font-bold tracking-tight">
					Curriculum Roadmap
				</h1>
				<p className="text-muted-foreground">
					Follow the learning path step-by-step. Complete courses to unlock the
					next stages.
				</p>
			</div>

			<CurriculumTimeline items={timelineItems} />
		</div>
	);
}
