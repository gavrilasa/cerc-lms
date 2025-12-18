import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { LogoutButton } from "../waiting-approval/_components/LogoutButton";
import { XCircle } from "lucide-react";

export default function RejectedPage() {
	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-red-50/50 dark:bg-red-950/10 p-4">
			<Card className="max-w-md w-full text-center shadow-lg border-red-200 dark:border-red-900">
				<CardHeader className="flex flex-col items-center gap-4 pb-2">
					<div className="flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
						<XCircle className="size-8 text-red-600 dark:text-red-500" />
					</div>
					<div className="space-y-1">
						<CardTitle className="text-2xl font-bold text-red-700 dark:text-red-500">
							Pendaftaran Ditolak
						</CardTitle>
						<CardDescription className="text-base">
							Mohon maaf, pendaftaran akun Anda tidak dapat kami setujui.
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<div className="rounded-md bg-muted p-4 text-sm text-muted-foreground text-left">
						<p className="mb-2">
							Admin telah meninjau data pendaftaran Anda dan memutuskan untuk
							menolak permintaan akses ini.
						</p>
						<p>Kemungkinan penyebab:</p>
						<ul className="list-disc list-inside mt-1 ml-1 space-y-1">
							<li>Data diri (NIM/Nama) tidak valid.</li>
							<li>Divisi yang dipilih tidak sesuai.</li>
							<li>Kuota anggota sudah terpenuhi.</li>
						</ul>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col gap-2">
					<LogoutButton />
					<p className="text-xs text-muted-foreground mt-4">
						Jika Anda merasa ini kesalahan, silakan hubungi admin divisi
						terkait.
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
