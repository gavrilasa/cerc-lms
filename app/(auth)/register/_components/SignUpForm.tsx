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
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const divisions = [
	"SOFTWARE",
	"EMBEDDED",
	"MULTIMEDIA",
	"NETWORKING",
	"ARTIFICIAL_INTELLIGENCE",
	"CYBER_SECURITY",
] as const;

const signUpSchema = z.object({
	name: z.string().min(3, "Nama minimal 3 karakter"),
	email: z.string().email("Email tidak valid"),
	password: z.string().min(8, "Password minimal 8 karakter"),
	nim: z.string().min(5, "NIM wajib diisi"),
	generation: z.string().refine((val) => !isNaN(Number(val)), {
		message: "Angkatan harus berupa angka tahun",
	}),
	division: z.enum(divisions, {
		message: "Pilih divisi yang valid",
	}),
});

type SignUpSchemaType = z.infer<typeof signUpSchema>;

export function SignUpForm() {
	const router = useRouter();
	const [pending, setPending] = useState(false);

	const form = useForm<SignUpSchemaType>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			nim: "",
			generation: "",
			division: undefined,
		},
	});

	async function onSubmit(values: SignUpSchemaType) {
		setPending(true);
		try {
			type SignUpPayload = {
				email: string;
				password: string;
				name: string;
				image?: string;
				callbackURL?: string;
			} & {
				division: string;
				nim: string;
				generation: number;
			};

			const { error } = await authClient.signUp.email({
				email: values.email,
				password: values.password,
				name: values.name,
				division: values.division,
				nim: values.nim,
				generation: Number(values.generation),
				callbackURL: "/waiting-approval",
			} as SignUpPayload);

			if (error) {
				toast.error(error.message || "Gagal mendaftar");
			} else {
				toast.success("Pendaftaran berhasil! Silakan tunggu verifikasi admin.");
				router.push("/waiting-approval");
			}
		} catch {
			toast.error("Terjadi kesalahan sistem");
		} finally {
			setPending(false);
		}
	}

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle className="text-xl">Pendaftaran Akses LMS</CardTitle>
				<CardDescription>
					Isi data diri Anda untuk mengakses LMS CERC.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nama Lengkap</FormLabel>
									<FormControl>
										<Input placeholder="John Doe" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="email@example.com"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="nim"
							render={({ field }) => (
								<FormItem>
									<FormLabel>NIM</FormLabel>
									<FormControl>
										<Input placeholder="2112012..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="generation"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Angkatan</FormLabel>
										<FormControl>
											<Input placeholder="2024" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="division"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Pilih Divisi</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Divisi" />
												</SelectTrigger>
											</FormControl>
											<SelectContent className="w-(--radix-select-trigger-width)">
												{divisions.map((div) => (
													<SelectItem key={div} value={div}>
														{div.replace("_", " ")}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input type="password" placeholder="******" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type="submit" className="w-full" disabled={pending}>
							{pending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Mendaftar...
								</>
							) : (
								"Daftar Sekarang"
							)}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
