"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function LoginForm() {
	const router = useRouter();
	const [pending, setPending] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	async function handleSignIn(e: React.FormEvent) {
		e.preventDefault();
		setPending(true);

		try {
			const { error } = await authClient.signIn.email({
				email,
				password,
				callbackURL: "/dashboard",
			});

			if (error) {
				if (error.code === "INVALID_EMAIL_OR_PASSWORD") {
					toast.error("Email atau password salah");
				} else {
					toast.error(error.message || "Gagal login");
				}
				setPending(false);
			} else {
				toast.success("Login berhasil");
				router.push("/dashboard");
			}
		} catch {
			toast.error("Terjadi kesalahan koneksi");
			setPending(false);
		}
	}

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle className="text-xl">Login CERC LMS</CardTitle>
				<CardDescription>Masuk menggunakan akun CERC Anda</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSignIn} className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="nama@email.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							disabled={pending}
						/>
					</div>
					<div className="grid gap-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="password">Password</Label>
						</div>
						<Input
							id="password"
							type="password"
							placeholder="******"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							disabled={pending}
						/>
					</div>

					<Button type="submit" className="w-full" disabled={pending}>
						{pending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Memproses...
							</>
						) : (
							"Login"
						)}
					</Button>
				</form>

				<div className="mt-4 text-center text-sm text-muted-foreground">
					Belum punya akun?{" "}
					<Link
						href="/register"
						className="text-primary underline hover:text-primary/80"
					>
						Daftar Anggota Baru
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
