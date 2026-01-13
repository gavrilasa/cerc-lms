import { ReactNode } from "react";

export default function PendingLayout({ children }: { children: ReactNode }) {
	return (
		<div className="relative flex flex-col items-center justify-center min-h-screen p-4">
			<div className="w-full container">{children}</div>
		</div>
	);
}
