"use client";

import { useState } from "react";
import { Division } from "@/lib/generated/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { AddCourseModal } from "./CurriculumActions";
import { RemoveCourseAlert } from "./CurriculumActions";

type CourseData = {
	id: string;
	title: string;
	category: string;
	division: Division;
	curriculumOrder: number | null;
	status: string;
};

interface CurriculumManagerProps {
	initialCourses: CourseData[];
	divisions: Division[];
}

export function CurriculumManager({
	initialCourses,
	divisions,
}: CurriculumManagerProps) {
	// State lokal untuk UI yang responsif (optimistic updates bisa ditambahkan nanti)
	const [courses] = useState<CourseData[]>(initialCourses);
	const [activeTab, setActiveTab] = useState<string>(divisions[0]);

	// Filter Data berdasarkan Tab Divisi yang aktif
	const currentDivisionCourses = courses.filter(
		(c) => c.division === activeTab
	);

	// BUCKET 1: Curriculum (Terurut)
	const curriculumCourses = currentDivisionCourses
		.filter((c) => c.curriculumOrder !== null)
		.sort(
			(a, b) => (a.curriculumOrder as number) - (b.curriculumOrder as number)
		);

	// BUCKET 2: Pool (Belum Masuk)
	const poolCourses = currentDivisionCourses.filter(
		(c) => c.curriculumOrder === null
	);

	return (
		<Tabs
			defaultValue={divisions[0]}
			onValueChange={setActiveTab}
			className="w-full"
		>
			<div className="flex items-center justify-between mb-4">
				<TabsList>
					{divisions.map((div) => (
						<TabsTrigger key={div} value={div} className="capitalize">
							{div.toLowerCase().replace(/_/g, " ")}
						</TabsTrigger>
					))}
				</TabsList>
				<Badge variant="outline" className="text-muted-foreground">
					{curriculumCourses.length} Steps • {poolCourses.length} in Pool
				</Badge>
			</div>

			{divisions.map((division) => (
				<TabsContent key={division} value={division} className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* KOLOM KIRI: VISUALISASI URUTAN (ROADMAP) */}
						<Card className="md:col-span-2 border-primary/20 bg-muted/10">
							<CardHeader>
								<CardTitle>Jalur Kurikulum (Roadmap)</CardTitle>
								<CardDescription>
									Urutan wajib yang harus dilalui siswa. Klik (+) untuk
									menyisipkan.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Tombol Insert Posisi Awal (Posisi 1) */}
								<InsertTrigger
									position={1}
									division={division}
									poolCourses={poolCourses}
									isEmpty={curriculumCourses.length === 0}
								/>

								{curriculumCourses.map((course, index) => (
									<div key={course.id} className="relative group">
										{/* Item Kurikulum */}
										<div className="flex items-center gap-4 p-4 bg-background border rounded-lg shadow-sm hover:border-primary transition-colors relative z-10">
											<div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm shrink-0">
												{index + 1}
											</div>

											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2">
													<h4 className="font-semibold truncate">
														{course.title}
													</h4>
													<Badge variant="secondary" className="text-xs">
														{course.category}
													</Badge>
												</div>
												<p className="text-xs text-muted-foreground mt-1">
													Status: {course.status}
												</p>
											</div>

											{/* Tombol Hapus (Kembalikan ke Pool) */}
											<RemoveCourseAlert
												courseId={course.id}
												courseTitle={course.title}
												division={division}
											/>
										</div>

										{/* Garis Konektor Visual */}
										{index < curriculumCourses.length - 1 && (
											<div className="absolute left-8 top-12 -bottom-5 w-px bg-border z-0" />
										)}

										{/* Tombol Insert "In-Between" (Posisi N + 1) */}
										<InsertTrigger
											position={index + 2}
											division={division}
											poolCourses={poolCourses}
										/>
									</div>
								))}
							</CardContent>
						</Card>

						{/* KOLOM KANAN: POOL / UNASSIGNED */}
						<Card className="h-fit">
							<CardHeader>
								<CardTitle>Pool Materi</CardTitle>
								<CardDescription>
									Materi ini bersifat elektif (opsional) sampai dimasukkan ke
									kurikulum.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ScrollArea className="h-[60vh] pr-4">
									<div className="space-y-3">
										{poolCourses.length === 0 ? (
											<p className="text-sm text-muted-foreground text-center py-8">
												Semua course sudah masuk kurikulum.
											</p>
										) : (
											poolCourses.map((course) => (
												<div
													key={course.id}
													className="p-3 border rounded bg-muted/40 text-sm flex justify-between items-center opacity-70"
												>
													<span className="truncate max-w-[180px]">
														{course.title}
													</span>
													<AddCourseModal
														triggerVariant="ghost"
														size="icon"
														targetPosition={curriculumCourses.length + 1} // Default append
														division={division}
														poolCourses={[course]} // Hanya dia sendiri
														singleMode={true}
													/>
												</div>
											))
										)}
									</div>
								</ScrollArea>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			))}
		</Tabs>
	);
}

// Komponen Kecil: Tombol Insert (+) di antara list
function InsertTrigger({
	position,
	division,
	poolCourses,
	isEmpty = false,
}: {
	position: number;
	division: Division;
	poolCourses: CourseData[];
	isEmpty?: boolean;
}) {
	if (poolCourses.length === 0) return null;

	return (
		<div className={`flex justify-center py-2 ${isEmpty ? "py-6" : ""}`}>
			<AddCourseModal
				targetPosition={position}
				division={division}
				poolCourses={poolCourses}
				triggerContent={
					isEmpty ? (
						<Button variant="outline" className="border-dashed">
							<Plus className="mr-2 h-4 w-4" /> Mulai Kurikulum (Urutan 1)
						</Button>
					) : (
						<Button
							size="sm"
							variant="ghost"
							className="h-6 w-6 rounded-full bg-muted hover:bg-primary hover:text-white p-0 transition-all shadow-sm border"
						>
							<Plus className="h-3 w-3" />
						</Button>
					)
				}
			/>
		</div>
	);
}
