"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragOverlay,
	defaultDropAnimationSideEffects,
	DragStartEvent,
	DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import { Save, Search, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { updateCurriculumStructure } from "@/app/admin/curriculum/actions";
import { SortableCourseItem } from "./SortableCourseItem";
import { PoolCourseItem } from "./PoolCourseItem";
import { CurriculumCourseType } from "@/lib/generated/prisma/enums";

// Tipe Data Lokal UI
export interface DesignItem {
	id: string; // Course ID
	title: string;
	level: string;
	category: string;
	type: CurriculumCourseType;
}

interface CurriculumDesignBuilderProps {
	curriculumId: string;
	initialCanvasItems: DesignItem[];
	initialPoolItems: DesignItem[];
}

export function CurriculumDesignBuilder({
	curriculumId,
	initialCanvasItems,
	initialPoolItems,
}: CurriculumDesignBuilderProps) {
	const router = useRouter();

	// State
	const [canvasItems, setCanvasItems] =
		useState<DesignItem[]>(initialCanvasItems);
	const [poolItems, setPoolItems] = useState<DesignItem[]>(initialPoolItems);
	const [searchQuery, setSearchQuery] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [activeId, setActiveId] = useState<string | null>(null); // For DragOverlay

	// DnD Sensors
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	// --- Logic 1: Filter Pool ---
	const filteredPool = poolItems.filter((item) =>
		item.title.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// --- Logic 2: Handle Add from Pool to Canvas ---
	const addToCanvas = (item: DesignItem) => {
		setCanvasItems((prev) => [...prev, { ...item, type: "CORE" }]); // Default CORE
		setPoolItems((prev) => prev.filter((i) => i.id !== item.id));
	};

	// --- Logic 3: Handle Remove from Canvas to Pool ---
	const removeFromCanvas = (id: string) => {
		const itemToRemove = canvasItems.find((i) => i.id === id);
		if (!itemToRemove) return;

		setCanvasItems((prev) => prev.filter((i) => i.id !== id));
		setPoolItems((prev) => [itemToRemove, ...prev]); // Kembalikan ke pool
	};

	// --- Logic 4: Handle Toggle Type (Core/Elective) ---
	const toggleType = (id: string, currentType: CurriculumCourseType) => {
		const newType = currentType === "CORE" ? "ELECTIVE" : "CORE";
		setCanvasItems((prev) =>
			prev.map((item) => (item.id === id ? { ...item, type: newType } : item))
		);
	};

	// --- Logic 5: Handle Drag End (Reorder) ---
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveId(null);

		if (active.id !== over?.id) {
			setCanvasItems((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id);
				const newIndex = items.findIndex((item) => item.id === over?.id);
				return arrayMove(items, oldIndex, newIndex);
			});
		}
	};

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	};

	// --- Logic 6: Save (Single Save) ---
	const handleSave = async () => {
		setIsSaving(true);
		try {
			// Payload Preparation
			const payloadItems = canvasItems.map((item, index) => ({
				courseId: item.id,
				type: item.type,
				order: index + 1, // Urutan visual menjadi order database
			}));

			const result = await updateCurriculumStructure({
				curriculumId,
				items: payloadItems,
			});

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Structure saved successfully!");
				router.refresh(); // Sync server state
			}
		} catch {
			toast.error("An unexpected error occurred.");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="flex flex-1 overflow-hidden">
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				{/* --- LEFT PANEL: COURSE POOL --- */}
				<div className="w-1/3 border-r bg-muted/10 flex flex-col">
					<div className="p-4 border-b space-y-4">
						<h2 className="font-semibold flex items-center gap-2">
							Course Pool
							<span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
								{poolItems.length}
							</span>
						</h2>
						<div className="relative">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search courses..."
								className="pl-8"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								disabled={isSaving}
							/>
						</div>
					</div>
					<ScrollArea className="flex-1 p-4">
						<div className="space-y-2">
							{filteredPool.map((item) => (
								<PoolCourseItem
									key={item.id}
									item={item}
									onAdd={() => addToCanvas(item)}
									disabled={isSaving}
								/>
							))}
							{filteredPool.length === 0 && (
								<div className="text-center py-8 text-muted-foreground text-sm">
									No courses found.
								</div>
							)}
						</div>
					</ScrollArea>
				</div>

				{/* --- RIGHT PANEL: CANVAS --- */}
				<div className="flex-1 flex flex-col bg-background">
					<div className="p-4 border-b flex items-center justify-between">
						<h2 className="font-semibold flex items-center gap-2">
							Curriculum Structure
							<span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
								{canvasItems.length} Items
							</span>
						</h2>
						<Button
							onClick={handleSave}
							disabled={isSaving || canvasItems.length === 0}
						>
							{isSaving ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								<>
									<Save className="mr-2 h-4 w-4" />
									Save Changes
								</>
							)}
						</Button>
					</div>

					<ScrollArea className="flex-1 p-4 bg-muted/5">
						<SortableContext
							items={canvasItems.map((i) => i.id)}
							strategy={verticalListSortingStrategy}
						>
							<div className="space-y-2 max-w-3xl mx-auto">
								{canvasItems.map((item, index) => (
									<SortableCourseItem
										key={item.id}
										item={item}
										index={index + 1}
										onRemove={() => removeFromCanvas(item.id)}
										onToggleType={() => toggleType(item.id, item.type)}
										disabled={isSaving}
									/>
								))}
								{canvasItems.length === 0 && (
									<div className="border-2 border-dashed rounded-lg p-12 text-center text-muted-foreground">
										<p>
											Drag courses from the pool or click + to add them here.
										</p>
									</div>
								)}
							</div>
						</SortableContext>
					</ScrollArea>
				</div>

				{/* Drag Overlay for Smooth Visual */}
				<DragOverlay
					dropAnimation={{
						sideEffects: defaultDropAnimationSideEffects({
							styles: { active: { opacity: "0.5" } },
						}),
					}}
				>
					{activeId ? (
						<div className="bg-background border rounded-md p-4 shadow-xl opacity-80 w-[400px]">
							{canvasItems.find((i) => i.id === activeId)?.title}
						</div>
					) : null}
				</DragOverlay>
			</DndContext>
		</div>
	);
}
