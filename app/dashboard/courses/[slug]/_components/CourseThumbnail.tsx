"use client";

import Image from "next/image";
import { BookOpen } from "lucide-react";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { cn } from "@/lib/utils";

interface CourseThumbnailProps {
	fileKey: string;
	title: string;
	className?: string;
}

export function CourseThumbnail({
	fileKey,
	title,
	className,
}: CourseThumbnailProps) {
	const imageUrl = useConstructUrl(fileKey);

	if (imageUrl) {
		return (
			<Image
				src={imageUrl}
				alt={`Thumbnail untuk kursus ${title}`}
				fill
				className={cn(
					"object-cover transition-transform duration-500 hover:scale-105",
					className
				)}
				sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
				priority // Prioritas tinggi karena berada di Hero Section (LCP)
			/>
		);
	}

	// Fallback: Tampilkan placeholder jika gambar belum siap atau tidak ada
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center w-full h-full bg-secondary/30 text-muted-foreground select-none",
				className
			)}
		>
			<BookOpen className="w-16 h-16 opacity-20 mb-2" />
			<span className="text-xs font-medium uppercase tracking-widest opacity-40">
				No Thumbnail
			</span>
		</div>
	);
}
