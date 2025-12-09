import { ReactNode } from "react";
import { Navbar } from "./_components/Navbar";

export default function LayoutPublic({ children }: { children: ReactNode }) {
	return (
		<div>
			<Navbar />
			<main className="container px-4 mx-auto md:px-6 lg:px-8 mb-32">
				{children}
			</main>
		</div>
	);
}
