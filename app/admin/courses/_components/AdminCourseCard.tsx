import { type AdminCourseType } from "@/app/data/admin/admin-get-courses";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useConstructUrl } from "@/hooks/use-construct-url";
import {
	ArrowRight,
	Eye,
	MoreVertical,
	Pencil,
	School,
	TimerIcon,
	Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface iAppProps {
	data: AdminCourseType;
}

export function AdminCourseCard({ data }: iAppProps) {
	const thumbnailUrl = useConstructUrl(data.fileKey);

	return (
		<Card className="group relative py-0 gap-0 overflow-hidden">
			<div className="absolute top-2 left-2 z-10">
				{data.curriculumOrder !== null && data.curriculumOrder !== undefined ? (
					<Badge className="bg-primary font-semibold hover:bg-primary">
						Kurikulum: #{data.curriculumOrder}
					</Badge>
				) : (
					<Badge
						variant="secondary"
						className="bg-background/80 backdrop-blur-md text-foreground font-medium border-black/20 px-2 py-1"
					>
						Non-Curriculum
					</Badge>
				)}
			</div>

			<div className="absolute top-2 right-2 z-10">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="secondary"
							size="icon"
							className="h-8 w-8 bg-background/80 backdrop-blur-sm"
						>
							<MoreVertical className="size-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-48">
						<DropdownMenuItem asChild>
							<Link href={`/admin/courses/${data.id}/edit`}>
								<Pencil className="size-4 mr-2" /> Edit Course
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href={`/admin/courses/${data.slug}`}>
								<Eye className="size-4 mr-2" /> Preview
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<Link href={`/admin/courses/${data.id}/delete`}>
								<Trash2 className="size-4 mr-2 text-destructive" /> Delete
								Course
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className="relative w-full aspect-video">
				<Image
					src={thumbnailUrl}
					alt={data.title}
					fill
					className="object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105"
				/>
			</div>

			<CardContent className="p-4">
				<Link
					href={`/admin/courses/${data.id}/edit`}
					className="font-medium line-clamp-2 hover:underline group-hover:text-primary transition-colors text-lg"
				>
					{data.title}
				</Link>
				<p className="line-clamp-2 text-sm text-muted-foreground leading-tight mt-2 h-10">
					{data.smallDescription}
				</p>

				<div className="flex items-center gap-x-5">
					<div className="flex items-center gap-x-2">
						<TimerIcon className="size-4 text-primary" />
						<p className="text-sm text-muted-foreground">{data.duration} Jam</p>
					</div>
					<div className="flex items-center gap-x-2">
						<School className="size-4 text-primary" />
						<p className="text-sm text-muted-foreground">{data.level}</p>
					</div>
				</div>
				<Link
					href={`/admin/courses/${data.id}/edit`}
					className={buttonVariants({
						className: "w-full mt-4",
					})}
				>
					Edit Course <ArrowRight className="size-4 ml-2" />
				</Link>
			</CardContent>
		</Card>
	);
}

export function AdminCourseCardSkeleton() {
	return (
		<Card className="group relative py-0 gap-0">
			<div className="absolute top-2 right-2 z-10 flex items-center gap-2">
				<Skeleton className="h-8 w-8 rounded-md" />
			</div>
			<div className="w-full relative aspect-video">
				<Skeleton className="w-full h-full rounded-t-lg" />
			</div>
			<CardContent className="p-4">
				<Skeleton className="h-6 w-3/4 mb-2 rounded" />
				<Skeleton className="h-4 w-full mb-4 rounded" />
				<div className="mt-4 flex items-center gap-x-5">
					<div className="flex items-center gap-x-2">
						<Skeleton className="size-6 rounded-md" />
						<Skeleton className="h-4 w-10 rounded" />
					</div>
					<div className="flex items-center gap-x-2">
						<Skeleton className="size-6 rounded-md" />
						<Skeleton className="h-4 w-10 rounded" />
					</div>
				</div>
				<Skeleton className="mt-4 h-10 w-full rounded" />
			</CardContent>
		</Card>
	);
}
