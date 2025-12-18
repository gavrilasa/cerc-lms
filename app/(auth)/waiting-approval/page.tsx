import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { LogoutButton } from "./_components/LogoutButton";
import { Clock } from "lucide-react";
import { type AuthUser } from "@/lib/access-control";

export default async function WaitingApprovalPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return redirect("/login");
	}

	const user = session.user as AuthUser;
	const userDivision = user.division || "Unknown Division";

	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-muted/40 p-4">
			<Card className="max-w-md w-full text-center shadow-lg">
				<CardHeader className="flex flex-col items-center gap-4 pb-2">
					<div className="flex size-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
						<Clock className="size-8 text-yellow-600 dark:text-yellow-500" />
					</div>
					<div className="space-y-1">
						<CardTitle className="text-2xl font-bold">
							Menunggu Verifikasi
						</CardTitle>
						<CardDescription className="text-base">
							Pendaftaran Anda berhasil dan sedang diproses.
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
						<p>
							Akun Anda saat ini sedang ditinjau oleh Admin atau Mentor dari
							Divisi{" "}
							<span className="font-semibold text-foreground">
								{userDivision}
							</span>
							.
						</p>
						<p className="mt-2">
							Anda akan mendapatkan akses penuh ke materi pembelajaran setelah
							status Anda diverifikasi.
						</p>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col gap-2">
					<LogoutButton />
					<p className="text-xs text-muted-foreground mt-2">
						Salah mendaftar divisi? Silakan logout dan hubungi admin.
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
