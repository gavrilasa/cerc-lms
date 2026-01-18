"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import {
	TextStyle,
	LineHeight,
	FontSize,
	FontFamily,
} from "@tiptap/extension-text-style";

interface RichTextRendererProps {
	content: string | null;
	className?: string;
}

export function RichTextRenderer({
	content,
	className = "",
}: RichTextRendererProps) {
	const editor = useEditor({
		editable: false,
		immediatelyRender: false,
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
				class: `prose dark:prose-invert focus:outline-none !max-w-none ${className}`,
			},
		},
		content: parseContent(content),
	});

	if (!editor) {
		return null;
	}

	return <EditorContent editor={editor} />;
}

function parseContent(content: string | null) {
	if (!content) return { type: "doc", content: [] };

	try {
		const parsed = JSON.parse(content);
		if (parsed.type === "doc") {
			return parsed;
		}
		return { type: "doc", content: [] };
	} catch {
		return {
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [{ type: "text", text: content }],
				},
			],
		};
	}
}
