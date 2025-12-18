import "server-only";

import Link from "next/link";
import {
	BookOpen,
	Users,
	Edit,
	MoreVertical,
	Trash,
	Layers,
} from "lucide-react";
import { requireAdmin } from "@/app/data/admin/require-admin";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateCurriculumDialog } from "./_components/CreateCurriculumDialog";
import { DivisionBadge } from "@/components/general/DivisionBadge";
import type { Division } from "@/lib/generated/prisma/enums";

export default async function CurriculumPage() {
	await requireAdmin();

	const curricula = await prisma.curriculum.findMany({
		orderBy: { updatedAt: "desc" },
		include: {
			_count: {
				select: {
					courses: true,
					users: true,
				},
			},
		},
	});

	return (
		<div className="p-6 space-y-6">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="space-y-1">
					<h1 className="text-2xl font-bold tracking-tight">
						Manajemen Kurikulum
					</h1>
					<p className="text-muted-foreground">
						Buat dan atur jalur pembelajaran (Roadmap) untuk setiap divisi.
					</p>
				</div>
				<CreateCurriculumDialog />
			</div>

			{/* Grid List Kurikulum */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{curricula.map((item) => (
					<Card
						key={item.id}
						className="flex flex-col group relative overflow-hidden transition-all hover:shadow-md"
					>
						<CardHeader className="pb-3">
							<div className="flex justify-between items-start mb-2">
								<DivisionBadge division={item.division as Division} />
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="h-8 w-8">
											<MoreVertical className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem className="text-destructive focus:text-destructive">
											<Trash className="mr-2 h-4 w-4" />
											Arsipkan
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
							<CardTitle className="text-lg line-clamp-1" title={item.title}>
								{item.title}
							</CardTitle>
							<CardDescription className="line-clamp-2 text-xs mt-1 h-10">
								{item.description}
							</CardDescription>
						</CardHeader>

						<CardContent className="pb-3 grid grid-cols-2 gap-2 text-sm">
							<div className="flex flex-col gap-1 p-2 bg-muted/50 rounded-md items-center justify-center text-center">
								<Layers className="h-4 w-4 text-muted-foreground mb-1" />
								<span className="font-bold">{item._count.courses}</span>
								<span className="text-[10px] text-muted-foreground uppercase tracking-wider">
									Courses
								</span>
							</div>
							<div className="flex flex-col gap-1 p-2 bg-muted/50 rounded-md items-center justify-center text-center">
								<Users className="h-4 w-4 text-muted-foreground mb-1" />
								<span className="font-bold">{item._count.users}</span>
								<span className="text-[10px] text-muted-foreground uppercase tracking-wider">
									Students
								</span>
							</div>
						</CardContent>

						<CardFooter className="pt-0 mt-auto">
							<Button asChild className="w-full gap-2" variant="outline">
								<Link href={`/admin/curriculum/${item.id}/design`}>
									<Edit className="h-4 w-4" />
									Desain Struktur
								</Link>
							</Button>
						</CardFooter>

						{/* Status Indicator */}
						{item.status === "ARCHIVED" && (
							<div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-[1px]">
								<Badge variant="destructive">ARCHIVED</Badge>
							</div>
						)}
					</Card>
				))}

				{/* Empty State */}
				{curricula.length === 0 && (
					<div className="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg bg-muted/10">
						<BookOpen className="h-10 w-10 text-muted-foreground/50 mb-4" />
						<h3 className="text-lg font-semibold">Belum ada kurikulum</h3>
						<p className="text-muted-foreground max-w-sm mt-1 mb-4">
							Mulai dengan membuat kurikulum baru untuk salah satu divisi.
						</p>
						<CreateCurriculumDialog />
					</div>
				)}
			</div>
		</div>
	);
}
