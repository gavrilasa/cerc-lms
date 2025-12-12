import { requireUser } from "@/app/data/user/require-user";
import { CreateCourseForm } from "./_components/CreateCourseForm";
import { redirect } from "next/navigation";

export default async function CourseCreationPage() {
	const user = await requireUser();

	if (!user.role) {
		redirect("/not-admin");
	}

	return <CreateCourseForm userRole={user.role} />;
}
