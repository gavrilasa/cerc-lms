"use client";

import { type Editor } from "@tiptap/react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../ui/tooltip";
import { Toggle } from "../ui/toggle";
import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	Bold,
	Heading1Icon,
	Heading2Icon,
	Heading3Icon,
	Italic,
	ListIcon,
	ListOrdered,
	Redo,
	Strikethrough,
	Undo,
	Type,
	MoveVertical,
	CaseUpper,
	Youtube as YoutubeIcon,
	Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

import { Select, SelectTrigger, SelectContent, SelectItem } from "../ui/select";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useRef, useState } from "react";

interface iAppProps {
	editor: Editor | null;
	uploadImage: (file: File) => Promise<string>;
	defaults?: {
		fontFamily: string;
		fontSize: string;
		lineHeight: string;
	};
}

const FONT_FAMILIES = [
	"Inter",
	"Manrope",
	"Merriweather",
	"Roboto Mono",
	"serif",
	"monospace",
];
const FONT_SIZES = ["12px", "14px", "16px", "18px", "24px", "32px"];
const LINE_HEIGHTS = ["1", "1.15", "1.5", "1.75", "2"];

export function LessonMenubar({ editor, defaults, uploadImage }: iAppProps) {
	const [videoUrl, setVideoUrl] = useState("");
	const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	if (!editor) return null;

	const attrs = editor.getAttributes("textStyle") ?? {};
	const currentFontFamily =
		(attrs.fontFamily as string) || defaults?.fontFamily || FONT_FAMILIES[0];
	const currentFontSize =
		(attrs.fontSize as string) || defaults?.fontSize || "16px";
	const currentLineHeight =
		(attrs.lineHeight as string) || defaults?.lineHeight || "1.5";

	// --- Logic Video (Dialog) ---
	const handleAddVideo = () => {
		if (videoUrl) {
			editor.commands.setYoutubeVideo({
				src: videoUrl,
			});
			setVideoUrl("");
			setIsVideoDialogOpen(false);
		}
	};

	// --- Logic Image (File Upload) ---
	const handleImageClick = () => {
		// Trigger klik pada input file tersembunyi
		fileInputRef.current?.click();
	};

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (file) {
			try {
				const url = await uploadImage(file); // Gunakan fungsi dari props
				editor.chain().focus().setImage({ src: url }).run();
			} catch (error) {
				console.error("Failed to upload image from toolbar", error);
			} finally {
				// Reset input value agar user bisa upload file yang sama berturut-turut jika mau
				if (fileInputRef.current) {
					fileInputRef.current.value = "";
				}
			}
		}
	};

	const iconTriggerCls =
		"inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors " +
		"disabled:pointer-events-none disabled:opacity-50 " +
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
		"text-muted-foreground !bg-transparent !border-0 !shadow-none " +
		"hover:bg-accent hover:text-accent-foreground " +
		"data-[state=open]:bg-accent data-[state=open]:text-accent-foreground " +
		"duration-150 ease-in-out " +
		"[&>svg:last-child]:hidden [&_[data-slot=icon]]:hidden";

	const selectContentCls =
		"rounded-md border bg-popover text-popover-foreground shadow-md p-1";
	const selectItemCls =
		"text-sm px-2 py-1.5 rounded-sm cursor-pointer outline-none " +
		"focus:bg-accent focus:text-accent-foreground";

	return (
		<div className="border border-input border-t-0 border-x-0 rounded-t-lg p-2 bg-card flex flex-wrap gap-2 items-center sticky top-0 z-40">
			<TooltipProvider>
				{/* --- Text Formatting Group --- */}
				<div className="flex flex-wrap gap-1">
					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size="sm"
								pressed={editor.isActive("bold")}
								onPressedChange={() =>
									editor.chain().focus().toggleBold().run()
								}
								className={cn(
									editor.isActive("bold") && "bg-muted text-muted-foreground"
								)}
							>
								<Bold className="size-4" />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Bold</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size="sm"
								pressed={editor.isActive("italic")}
								onPressedChange={() =>
									editor.chain().focus().toggleItalic().run()
								}
								className={cn(
									editor.isActive("italic") && "bg-muted text-muted-foreground"
								)}
							>
								<Italic className="size-4" />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Italic</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size="sm"
								pressed={editor.isActive("strike")}
								onPressedChange={() =>
									editor.chain().focus().toggleStrike().run()
								}
								className={cn(
									editor.isActive("strike") && "bg-muted text-muted-foreground"
								)}
							>
								<Strikethrough className="size-4" />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Strike</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size="sm"
								pressed={editor.isActive("heading", { level: 1 })}
								onPressedChange={() =>
									editor.chain().focus().toggleHeading({ level: 1 }).run()
								}
								className={cn(
									editor.isActive("heading", { level: 1 }) &&
										"bg-muted text-muted-foreground"
								)}
							>
								<Heading1Icon className="size-4" />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Heading 1</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size="sm"
								pressed={editor.isActive("heading", { level: 2 })}
								onPressedChange={() =>
									editor.chain().focus().toggleHeading({ level: 2 }).run()
								}
								className={cn(
									editor.isActive("heading", { level: 2 }) &&
										"bg-muted text-muted-foreground"
								)}
							>
								<Heading2Icon className="size-4" />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Heading 2</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size="sm"
								pressed={editor.isActive("heading", { level: 3 })}
								onPressedChange={() =>
									editor.chain().focus().toggleHeading({ level: 3 }).run()
								}
								className={cn(
									editor.isActive("heading", { level: 3 }) &&
										"bg-muted text-muted-foreground"
								)}
							>
								<Heading3Icon className="size-4" />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Heading 3</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size="sm"
								pressed={editor.isActive("bulletList")}
								onPressedChange={() =>
									editor.chain().focus().toggleBulletList().run()
								}
								className={cn(
									editor.isActive("bulletList") &&
										"bg-muted text-muted-foreground"
								)}
							>
								<ListIcon className="size-4" />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Bullet List</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size="sm"
								pressed={editor.isActive("orderedList")}
								onPressedChange={() =>
									editor.chain().focus().toggleOrderedList().run()
								}
								className={cn(
									editor.isActive("orderedList") &&
										"bg-muted text-muted-foreground"
								)}
							>
								<ListOrdered className="size-4" />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Ordered List</TooltipContent>
					</Tooltip>
				</div>

				<div className="w-px h-6 bg-border mx-2" />

				{/* --- Media & Alignment Group --- */}
				<div className="flex flex-wrap gap-1">
					{/* VIDEO DIALOG */}
					<Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
						<DialogTrigger asChild>
							<Button
								size="sm"
								variant="ghost"
								className={cn(
									editor.isActive("youtube") && "bg-muted text-muted-foreground"
								)}
							>
								<YoutubeIcon className="size-4" />
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Embed YouTube Video</DialogTitle>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div className="grid gap-2">
									<Label htmlFor="url">Video URL</Label>
									<Input
										id="url"
										placeholder="https://www.youtube.com/watch?v=..."
										value={videoUrl}
										onChange={(e) => setVideoUrl(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												handleAddVideo();
											}
										}}
									/>
								</div>
							</div>
							<DialogFooter>
								<Button onClick={handleAddVideo}>Embed Video</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					{/* IMAGE UPLOAD (DIRECT) */}
					<input
						type="file"
						ref={fileInputRef}
						className="hidden"
						accept="image/*"
						onChange={handleFileChange}
					/>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="sm"
								variant="ghost"
								onClick={handleImageClick}
								className={cn(
									editor.isActive("image") && "bg-muted text-muted-foreground"
								)}
							>
								<ImageIcon className="size-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>Upload Image</TooltipContent>
					</Tooltip>

					<div className="w-px h-6 bg-border mx-2" />

					{/* Alignment */}
					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size="sm"
								pressed={editor.isActive({ textAlign: "left" })}
								onPressedChange={() =>
									editor.chain().focus().setTextAlign("left").run()
								}
								className={cn(
									editor.isActive({ textAlign: "left" }) &&
										"bg-muted text-muted-foreground"
								)}
							>
								<AlignLeft className="size-4" />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Align Left</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size="sm"
								pressed={editor.isActive({ textAlign: "center" })}
								onPressedChange={() =>
									editor.chain().focus().setTextAlign("center").run()
								}
								className={cn(
									editor.isActive({ textAlign: "center" }) &&
										"bg-muted text-muted-foreground"
								)}
							>
								<AlignCenter className="size-4" />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Align Center</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size="sm"
								pressed={editor.isActive({ textAlign: "right" })}
								onPressedChange={() =>
									editor.chain().focus().setTextAlign("right").run()
								}
								className={cn(
									editor.isActive({ textAlign: "right" }) &&
										"bg-muted text-muted-foreground"
								)}
							>
								<AlignRight className="size-4" />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Align Right</TooltipContent>
					</Tooltip>
				</div>

				<div className="w-px h-6 bg-border mx-2" />

				{/* --- Font Settings Group --- */}
				<div className="flex flex-wrap gap-1">
					{/* Font family */}
					<Select
						value={currentFontFamily}
						onValueChange={(v) => editor.chain().focus().setFontFamily(v).run()}
					>
						<Tooltip>
							<TooltipTrigger asChild>
								<SelectTrigger
									className={iconTriggerCls}
									aria-label={`Font: ${currentFontFamily}`}
								>
									<Type className="h-4 w-4" />
								</SelectTrigger>
							</TooltipTrigger>
							<TooltipContent>Font: {currentFontFamily}</TooltipContent>
						</Tooltip>

						<SelectContent
							position="popper"
							sideOffset={8}
							className={selectContentCls}
						>
							{FONT_FAMILIES.map((f) => (
								<SelectItem key={f} value={f} className={selectItemCls}>
									{f}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{/* Font size */}
					<Select
						value={currentFontSize}
						onValueChange={(v) => editor.chain().focus().setFontSize(v).run()}
					>
						<Tooltip>
							<TooltipTrigger asChild>
								<SelectTrigger
									className={iconTriggerCls}
									aria-label={`Size: ${currentFontSize}`}
								>
									<CaseUpper className="h-4 w-4" />
								</SelectTrigger>
							</TooltipTrigger>
							<TooltipContent>Size: {currentFontSize}</TooltipContent>
						</Tooltip>

						<SelectContent
							position="popper"
							sideOffset={8}
							className={selectContentCls}
						>
							{FONT_SIZES.map((s) => (
								<SelectItem key={s} value={s} className={selectItemCls}>
									{s}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{/* Line height */}
					<Select
						value={currentLineHeight}
						onValueChange={(v) => editor.chain().focus().setLineHeight(v).run()}
					>
						<Tooltip>
							<TooltipTrigger asChild>
								<SelectTrigger
									className={iconTriggerCls}
									aria-label={`Line: ${currentLineHeight}`}
								>
									<MoveVertical className="h-4 w-4" />
								</SelectTrigger>
							</TooltipTrigger>
							<TooltipContent>Line: {currentLineHeight}</TooltipContent>
						</Tooltip>

						<SelectContent
							position="popper"
							sideOffset={8}
							className={selectContentCls}
						>
							{LINE_HEIGHTS.map((lh) => (
								<SelectItem key={lh} value={lh} className={selectItemCls}>
									{lh}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="w-px h-6 bg-border mx-2" />

				{/* --- Undo/Redo Group --- */}
				<div className="flex flex-wrap gap-1">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="sm"
								variant="ghost"
								type="button"
								onClick={() => editor.chain().focus().undo().run()}
								disabled={!editor.can().undo()}
							>
								<Undo className="size-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>Undo</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="sm"
								variant="ghost"
								type="button"
								onClick={() => editor.chain().focus().redo().run()}
								disabled={!editor.can().redo()}
							>
								<Redo className="size-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>Redo</TooltipContent>
					</Tooltip>
				</div>
			</TooltipProvider>
		</div>
	);
}
