import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LogoutButton } from "./_components/LogoutButton";
import {
	Clock,
	ShieldAlert,
	Building2,
	User as UserIcon,
	CheckCircle2,
} from "lucide-react";
import { type AuthUser } from "@/lib/access-control";

export default async function WaitingApprovalPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return redirect("/login");
	}

	const user = session.user as AuthUser;
	// Fallback data agar UI tidak rusak jika data kosong
	const userName = user.name || "Pengguna Baru";
	const userEmail = user.email || "-";
	const userDivision = user.division || "Belum ditentukan";

	return (
		<div className="min-h-screen w-full flex items-center justify-center p-4">
			{/* Background decoration */}
			<div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-neutral-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

			<Card className="max-w-md w-full shadow-xl border-t-4 border-t-amber-500 animate-in fade-in zoom-in-95 duration-500">
				<CardHeader className="flex flex-col items-center text-center pb-2 pt-8">
					<div className="relative mb-4">
						<div className="absolute inset-0 animate-ping rounded-full bg-amber-400 opacity-20"></div>
						<div className="relative flex size-20 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500 border border-amber-200 dark:border-amber-800">
							<Clock className="size-10" />
						</div>
						<div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 border shadow-sm">
							<ShieldAlert className="size-5 text-amber-600" />
						</div>
					</div>

					<h1 className="text-2xl font-bold tracking-tight">
						Verifikasi Diperlukan
					</h1>
					<p className="text-muted-foreground text-sm max-w-[85%]">
						Terima kasih telah mendaftar. Akun Anda saat ini sedang dalam
						antrean verifikasi.
					</p>
				</CardHeader>

				<CardContent className="space-y-6 pt-4">
					{/* Status Badge */}
					<div className="flex justify-center">
						<Badge
							variant="outline"
							className="px-4 py-1 border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 gap-2"
						>
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
							</span>
							Status: Menunggu Persetujuan
						</Badge>
					</div>

					<div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 space-y-3">
						<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
							Detail Pendaftaran
						</h3>

						{/* User Info */}
						<div className="flex items-center gap-3">
							<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
								<UserIcon className="size-4 text-muted-foreground" />
							</div>
							<div className="flex flex-col overflow-hidden">
								<span className="text-sm font-medium truncate">{userName}</span>
								<span className="text-xs text-muted-foreground truncate">
									{userEmail}
								</span>
							</div>
						</div>

						<Separator />

						{/* Division Info */}
						<div className="flex items-center gap-3">
							<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
								<Building2 className="size-4 text-blue-600 dark:text-blue-400" />
							</div>
							<div className="flex flex-col">
								<span className="text-xs text-muted-foreground">
									Target Divisi
								</span>
								<span className="text-sm font-semibold text-foreground">
									{userDivision}
								</span>
							</div>
						</div>
					</div>

					{/* Steps / Info */}
					<div className="space-y-3">
						<div className="flex gap-3 text-sm text-muted-foreground">
							<CheckCircle2 className="size-5 text-green-500 shrink-0" />
							<p>Data pendaftaran telah diterima sistem.</p>
						</div>
						<div className="flex gap-3 text-sm text-muted-foreground">
							<Clock className="size-5 text-amber-500 shrink-0" />
							<p>
								Menunggu persetujuan Admin/Mentor divisi{" "}
								<span className="font-medium text-foreground">
									{userDivision}
								</span>
								.
							</p>
						</div>
					</div>
				</CardContent>

				<CardFooter className="flex flex-col gap-4 bg-muted/30 pt-6 pb-6 border-t">
					<LogoutButton />
					<p className="text-xs text-center text-muted-foreground px-4">
						Jika dalam 1x24 jam belum disetujui, atau jika Anda merasa salah
						memilih divisi, silakan hubungi admin CERC.
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
