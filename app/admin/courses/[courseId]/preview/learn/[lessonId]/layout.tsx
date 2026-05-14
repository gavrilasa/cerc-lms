import { adminGetCourse } from "@/app/data/admin/admin-get-course";
import { requireSession } from "@/app/data/auth/require-session";
import AdminLearnLayoutClient from "./_components/AdminLearnLayoutClient";

interface LayoutProps {
	children: React.ReactNode;
	params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function AdminLearnLayout({
	children,
	params,
}: LayoutProps) {
	// Require mentor+ session
	await requireSession({ minRole: "MENTOR" });

	const { courseId } = await params;
	const course = await adminGetCourse(courseId);

	return (
		<AdminLearnLayoutClient course={course}>{children}</AdminLearnLayoutClient>
	);
}
