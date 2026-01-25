import { requireSession } from "@/app/data/auth/require-session";
import React from "react";

export default async function DeleteCourseLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	await requireSession({ minRole: "MENTOR" });
	return <>{children}</>;
}
