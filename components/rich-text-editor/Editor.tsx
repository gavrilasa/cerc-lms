"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { LineHeight } from "@tiptap/extension-text-style/line-height";
import { FontSize } from "@tiptap/extension-text-style/font-size";
import { FontFamily } from "@tiptap/extension-text-style/font-family";

import { Menubar } from "./Menubar";

const DEFAULT_FONT_FAMILY = "Inter";
const DEFAULT_FONT_SIZE = "16px";
const DEFAULT_LINE_HEIGHT = "1.5";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function RichTextEditor({ field }: { field: any }) {
	const editor = useEditor({
		extensions: [
			StarterKit,
			TextStyle,
			LineHeight.configure({ types: ["textStyle"] }),
			FontSize.configure({ types: ["textStyle"] }),
			FontFamily.configure({ types: ["textStyle"] }),
			TextAlign.configure({ types: ["heading", "paragraph"] }),
		],

		editorProps: {
			attributes: {
				class:
					"min-h-[300px] p-4 focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert !w-full !max-w-none",
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

		content: field?.value ? JSON.parse(field.value) : "<p>Hello World</p>",

		immediatelyRender: false,
	});

	return (
		<div className="w-full border border-input rounded-lg overflow-hidden dark:bg-input/30">
			<Menubar
				editor={editor}
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
