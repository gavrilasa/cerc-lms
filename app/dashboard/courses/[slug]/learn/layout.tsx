import { ReactNode } from "react";
import { getCourseSidebarData } from "@/app/data/course/get-course-sidebar-data";
import { LearnLayoutWrapper } from "./[lessonId]/_components/LearnLayoutWrapper";

interface iAppProps {
	params: Promise<{ slug: string }>;
	children: ReactNode;
}

export default async function CourseLayout({ params, children }: iAppProps) {
	const { slug } = await params;

	// Fetch data di server
	const data = await getCourseSidebarData(slug);

	return (
		<LearnLayoutWrapper course={data.course}>{children}</LearnLayoutWrapper>
	);
}
