"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Lock, PlayCircle, Video } from "lucide-react";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Definisi tipe data sesuai dengan return dari getCourse
interface LessonType {
	id: string;
	title: string;
	position: number;
}

interface ChapterType {
	id: string;
	title: string;
	position: number;
	lessons: LessonType[];
}

interface CourseSyllabusProps {
	chapters: ChapterType[];
	isEnrolled: boolean;
}

export function CourseSyllabus({ chapters, isEnrolled }: CourseSyllabusProps) {
	// State untuk melacak chapter mana yang terbuka (opsional, bisa default open semua)
	// Di sini kita biarkan independen per collapsible

	return (
		<div className="flex flex-col gap-4">
			{chapters.map((chapter, index) => (
				<ChapterItem
					key={chapter.id}
					chapter={chapter}
					isEnrolled={isEnrolled}
					defaultOpen={index === 0} // Chapter pertama terbuka secara default
				/>
			))}

			{chapters.length === 0 && (
				<div className="text-center py-6 text-muted-foreground italic border rounded-lg border-dashed">
					Materi kurikulum sedang disusun.
				</div>
			)}
		</div>
	);
}

function ChapterItem({
	chapter,
	isEnrolled,
	defaultOpen,
}: {
	chapter: ChapterType;
	isEnrolled: boolean;
	defaultOpen: boolean;
}) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<Collapsible
			open={isOpen}
			onOpenChange={setIsOpen}
			className="border rounded-lg bg-card text-card-foreground shadow-sm overflow-hidden"
		>
			<CollapsibleTrigger asChild>
				<div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
					<div className="flex items-center gap-3 font-medium">
						{/* Indikator Expand/Collapse */}
						{isOpen ? (
							<ChevronUp className="h-4 w-4 text-muted-foreground" />
						) : (
							<ChevronDown className="h-4 w-4 text-muted-foreground" />
						)}

						<span className="text-base">{chapter.title}</span>
					</div>

					<Badge variant="secondary" className="text-xs font-normal">
						{chapter.lessons.length} Materi
					</Badge>
				</div>
			</CollapsibleTrigger>

			<CollapsibleContent>
				<div className="flex flex-col border-t divide-y bg-muted/20">
					{chapter.lessons.map((lesson) => (
						<LessonItem
							key={lesson.id}
							lesson={lesson}
							isEnrolled={isEnrolled}
						/>
					))}

					{chapter.lessons.length === 0 && (
						<div className="p-4 text-sm text-muted-foreground pl-11">
							Belum ada materi di chapter ini.
						</div>
					)}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

function LessonItem({
	lesson,
	isEnrolled,
}: {
	lesson: LessonType;
	isEnrolled: boolean;
}) {
	return (
		<div
			className={cn(
				"flex items-center gap-3 p-4 pl-11 text-sm transition-colors",
				isEnrolled ? "text-foreground" : "text-muted-foreground/80" // Agak redup jika belum enroll
			)}
		>
			{/* IKON INDIKATOR */}
			<div className="shrink-0">
				{isEnrolled ? (
					<PlayCircle className="h-4 w-4 text-primary" />
				) : (
					<Lock className="h-4 w-4 text-muted-foreground" />
				)}
			</div>

			<div className="flex flex-col gap-0.5">
				<span className="font-medium line-clamp-1">{lesson.title}</span>
				{/* Jika schema nanti ada duration, bisa dirender di sini */}
				{/* <span className="text-xs text-muted-foreground">10 Menit</span> */}
			</div>

			{/* Indikator Tipe Konten (Opsional) */}
			<div className="ml-auto">
				{isEnrolled ? (
					<Badge
						variant="outline"
						className="text-[10px] h-5 px-1.5 border-primary/20 bg-primary/5 text-primary"
					>
						Akses Terbuka
					</Badge>
				) : (
					<Video className="h-3 w-3 text-muted-foreground/50" />
				)}
			</div>
		</div>
	);
}
