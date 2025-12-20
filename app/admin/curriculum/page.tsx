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

	const curriculum = await prisma.curriculum.findMany({
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
		<div className="p-4 space-y-4">
			<div className="flex flex-col sm:flex-row justify-between">
				<div className="space-y-1">
					<h1 className="text-2xl font-bold tracking-tight">
						Curriculum Management
					</h1>
					<p className="text-muted-foreground">
						Manage All Curriculum Based on Division.
					</p>
				</div>
				<CreateCurriculumDialog />
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				{curriculum.map((item) => (
					<Card
						key={item.id}
						className="flex flex-col group relative overflow-hidden transition-all hover:shadow-md gap-2"
					>
						<CardHeader className="pb-1">
							<div className="flex justify-between items-center">
								<DivisionBadge division={item.division as Division} />
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 cursor-pointer"
										>
											<MoreVertical className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem className="text-destructive focus:text-destructive font-medium cursor-pointer">
											<Trash className="mr-2 h-4 w-4 text-destructive" />
											Arsipkan
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
							<CardTitle className="text-lg line-clamp-1" title={item.title}>
								{item.title}
							</CardTitle>
							<CardDescription className="line-clamp-2 mb-2">
								{item.description}
							</CardDescription>
						</CardHeader>

						<CardContent className="pb-2 grid grid-cols-2 gap-2 text-sm">
							<div className="flex gap-2 px-6 py-4 bg-muted/50 rounded-md items-center text-center">
								<Layers className="h-4 w-4 text-muted-foreground" />
								<span className="font-bold">{item._count.courses}</span>
								<span className="text-xs text-muted-foreground uppercase tracking-wider">
									Courses
								</span>
							</div>
							<div className="flex gap-2 px-6 py-4 bg-muted/50 rounded-md items-center text-center">
								<Users className="h-4 w-4 text-muted-foreground" />
								<span className="font-bold">{item._count.users}</span>
								<span className="text-xs text-muted-foreground uppercase tracking-wider">
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

						{item.status === "ARCHIVED" && (
							<div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-[1px]">
								<Badge variant="destructive">ARCHIVED</Badge>
							</div>
						)}
					</Card>
				))}

				{curriculum.length === 0 && (
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
