import { SignUpForm } from "./_components/SignUpForm";
import Link from "next/link";

export default function RegisterPage() {
	return (
		<div className="flex flex-col items-center gap-4">
			<SignUpForm />
			<div className="text-sm text-muted-foreground">
				Already have an account?{" "}
				<Link href="/login" className="text-primary hover:underline">
					Login here
				</Link>
			</div>
		</div>
	);
}
