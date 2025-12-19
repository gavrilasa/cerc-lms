"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import {
	TextStyle,
	LineHeight,
	FontSize,
	FontFamily,
} from "@tiptap/extension-text-style";
import Compressor from "compressorjs";
import { toast } from "sonner";
import { env } from "@/lib/env"; // Pastikan import env untuk construct URL

import { LessonMenubar } from "./LessonMenubar";

const DEFAULT_FONT_FAMILY = "Inter";
const DEFAULT_FONT_SIZE = "16px";
const DEFAULT_LINE_HEIGHT = "1.5";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function LessonRichTextEditor({ field }: { field: any }) {
	// Fungsi helper untuk upload gambar dengan Presigned URL Flow
	const uploadImage = async (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			new Compressor(file, {
				quality: 0.6,
				mimeType: "image/webp",
				success(result) {
					const fileToUpload = result as File;
					const uploadToast = toast.loading("Uploading image...");

					// STEP 1: Minta Presigned URL ke Server
					fetch("/api/s3/upload", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							fileName: file.name,
							contentType: fileToUpload.type, // 'image/webp'
							size: fileToUpload.size,
							isImage: true,
						}),
					})
						.then((res) => {
							if (!res.ok) throw new Error("Failed to get presigned URL");
							return res.json();
						})
						.then(async (data) => {
							const { presignedUrl, key } = data;

							// STEP 2: Upload File Fisik ke S3 menggunakan Presigned URL
							const uploadRes = await fetch(presignedUrl, {
								method: "PUT",
								body: fileToUpload,
								headers: {
									"Content-Type": fileToUpload.type, // Penting: Harus sama dengan yang didaftarkan di Step 1
								},
							});

							if (!uploadRes.ok) throw new Error("Failed to upload to storage");

							toast.dismiss(uploadToast);

							// STEP 3: Construct Public URL
							// Menggunakan format URL yang sama dengan hooks/use-construct-url.ts
							const publicUrl = `https://${env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES}.t3.storage.dev/${key}`;

							resolve(publicUrl);
						})
						.catch((err) => {
							toast.dismiss(uploadToast);
							toast.error("Image upload failed");
							console.error(err);
							reject(err);
						});
				},
				error(err) {
					toast.error("Image compression failed");
					reject(err);
				},
			});
		});
	};

	const editor = useEditor({
		extensions: [
			StarterKit,
			TextStyle,
			LineHeight.configure({ types: ["textStyle"] }),
			FontSize.configure({ types: ["textStyle"] }),
			FontFamily.configure({ types: ["textStyle"] }),
			TextAlign.configure({ types: ["heading", "paragraph", "image"] }),
			Image.configure({
				inline: true,
				allowBase64: false,
				HTMLAttributes: {
					class: "rounded-lg border shadow-sm max-w-full h-auto my-4",
				},
			}),
			Youtube.configure({
				controls: false,
				nocookie: true,
				HTMLAttributes: {
					class: "w-full aspect-video rounded-lg shadow-sm border",
				},
			}),
		],

		editorProps: {
			attributes: {
				class:
					"min-h-[300px] p-4 focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert !w-full !max-w-none",
			},
			handlePaste: (view, event) => {
				const items = Array.from(event.clipboardData?.items || []);
				const imageItem = items.find((item) => item.type.startsWith("image/"));

				if (imageItem) {
					event.preventDefault();
					const file = imageItem.getAsFile();
					if (file) {
						uploadImage(file).then((url) => {
							const { schema } = view.state;
							const node = schema.nodes.image.create({ src: url });
							const transaction = view.state.tr.replaceSelectionWith(node);
							view.dispatch(transaction);
						});
					}
					return true;
				}
				return false;
			},
			handleDrop: (view, event, _slice, moved) => {
				if (
					!moved &&
					event.dataTransfer &&
					event.dataTransfer.files &&
					event.dataTransfer.files[0]
				) {
					const file = event.dataTransfer.files[0];
					if (file.type.startsWith("image/")) {
						event.preventDefault();
						uploadImage(file).then((url) => {
							const { schema } = view.state;
							const coordinates = view.posAtCoords({
								left: event.clientX,
								top: event.clientY,
							});
							if (coordinates) {
								const node = schema.nodes.image.create({ src: url });
								const transaction = view.state.tr.insert(coordinates.pos, node);
								view.dispatch(transaction);
							}
						});
						return true;
					}
				}
				return false;
			},
		},

		onCreate: ({ editor }) => {
			editor
				.chain()
				.setFontFamily(DEFAULT_FONT_FAMILY)
				.setFontSize(DEFAULT_FONT_SIZE)
				.setLineHeight(DEFAULT_LINE_HEIGHT)
				.run();
		},

		onUpdate: ({ editor }) => {
			field.onChange(JSON.stringify(editor.getJSON()));
		},

		content: field?.value ? JSON.parse(field.value) : "",

		immediatelyRender: false,
	});

	return (
		<div className="w-full border border-input rounded-lg overflow-hidden dark:bg-input/30 bg-background">
			<LessonMenubar
				editor={editor}
				uploadImage={uploadImage}
				defaults={{
					fontFamily: DEFAULT_FONT_FAMILY,
					fontSize: DEFAULT_FONT_SIZE,
					lineHeight: DEFAULT_LINE_HEIGHT,
				}}
			/>
			<EditorContent editor={editor} />
		</div>
	);
}
