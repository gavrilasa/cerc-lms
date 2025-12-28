import { requireSession } from "@/app/data/auth/require-session";
import { CreateCourseForm } from "./_components/CreateCourseForm";
import { redirect } from "next/navigation";

export default async function CourseCreationPage() {
	const { user } = await requireSession();

	if (!user.role) {
		redirect("/not-admin");
	}

	return <CreateCourseForm userRole={user.role} />;
}
