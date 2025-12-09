import { cn } from "@/lib/utils";
import { CloudUploadIcon, ImageIcon, Loader2, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";

export function RenderEmptyState({ isDragActive }: { isDragActive: boolean }) {
	return (
		<div className="text-center">
			<div className="flex items-center justify-center mx-auto mb-4 rounded-full size-12 bg-muted">
				<CloudUploadIcon
					className={cn(
						"size-6 text-muted-foreground",
						isDragActive && "text-primary"
					)}
				/>
			</div>
			<p className="text-base font-semibold text-foreground">
				Drop your files here or{" "}
				<span className="font-bold text-blue-500 cursor-pointer">
					click to upload
				</span>
			</p>
			<Button type="button" className="mt-4">
				Select File
			</Button>
		</div>
	);
}

export function RenderErrorState() {
	return (
		<div className="text-center">
			<div className="flex items-center justify-center mx-auto mb-4 rounded-full size-12 bg-destructive/30">
				<ImageIcon className="size-6 text-destructive" />
			</div>
			<p className="text-base font-semibold">Upload Failed</p>
			<p className="mt-1 text-xs text-muted-foreground">Something went wrong</p>
			<Button type="button" className="mt-4" variant="destructive">
				Retry File Selection
			</Button>
		</div>
	);
}

export function RenderUploadedState({
	previewUrl,
	isDeleting,
	handleRemoveFile,
	fileType,
}: {
	previewUrl: string;
	isDeleting: boolean;
	handleRemoveFile: () => void;
	fileType: "image" | "video";
}) {
	return (
		<div className="relative group w-full h-full flex items-center justify-center">
			{fileType === "video" ? (
				<video src={previewUrl} controls className="rounded-md w-full h-full" />
			) : (
				<Image
					src={previewUrl}
					alt="Uploaded File"
					fill
					className="object-contain p-2"
				/>
			)}

			<Button
				variant="destructive"
				type="button"
				size="icon"
				className={cn("absolute top-4 right-4")}
				onClick={handleRemoveFile}
				disabled={isDeleting}
			>
				{isDeleting ? (
					<Loader2 className="size-4 animate-spin" />
				) : (
					<XIcon className="size-4" />
				)}
			</Button>
		</div>
	);
}

export function RenderUploadingState({
	progress,
	file,
}: {
	progress: number;
	file: File;
}) {
	return (
		<div className="flex flex-col items-center justify-center text-center">
			<p>{progress}</p>
			<p className="mt-2 text-sm font-medium text-foreground">Uploading ...</p>
			<p className="max-w-xs mt-1 text-xs truncate text-muted-foreground">
				{file.name}
			</p>
		</div>
	);
}
