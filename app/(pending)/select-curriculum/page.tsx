import "server-only";

import { redirect } from "next/navigation";
import { requireSession } from "@/app/data/auth/require-session";
import { getCurriculumByDivision } from "@/app/data/curriculum/get-curriculum-by-division";
import prisma from "@/lib/db";
import { CurriculumSelectionForm } from "./_components/CurriculumSelectionForm";
import { Division } from "@/lib/generated/prisma/enums";

export const metadata = {
	title: "Pilih Kurikulum",
	description: "Tentukan jalur pembelajaran Anda",
};

export default async function SelectCurriculumPage() {
	const { user } = await requireSession();

	if (!user.division) {
		return (
			<div className="p-8 text-center">
				<h1 className="text-2xl font-bold text-destructive">Akses Ditolak</h1>
				<p className="mt-2 text-muted-foreground">
					Akun Anda tidak memiliki divisi yang valid. Hubungi administrator.
				</p>
			</div>
		);
	}

	const curriculum = await getCurriculumByDivision(user.division as Division);

	if (curriculum.length === 1) {
		const targetCurriculum = curriculum[0];

		await prisma.user.update({
			where: { id: user.id },
			data: {
				selectedCurriculumId: targetCurriculum.id,
				curriculumStatus: "IN_PROGRESS",
			},
		});

		redirect("/dashboard");
	}

	return (
		<div className="container py-10 space-y-8 w-full">
			<div className="space-y-2 text-center">
				<h1 className="text-3xl font-bold tracking-tight">
					Pilih Jalur Pembelajaran
				</h1>
				<p className="text-muted-foreground">
					Berdasarkan divisi <strong>{user.division}</strong>, berikut adalah
					kurikulum yang tersedia untuk Anda.
				</p>
			</div>

			{curriculum.length === 0 ? (
				<div className="p-12 text-center border rounded-lg border-dashed">
					<h3 className="text-lg font-medium">Belum Ada Kurikulum</h3>
					<p className="text-muted-foreground mt-1">
						Admin belum menambahkan kurikulum untuk divisi ini. Silakan cek lagi
						nanti.
					</p>
				</div>
			) : (
				<CurriculumSelectionForm curricula={curriculum} />
			)}
		</div>
	);
}
