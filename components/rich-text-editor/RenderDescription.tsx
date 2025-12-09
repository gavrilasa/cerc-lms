"use client";

import { useMemo } from "react";
import { generateHTML } from "@tiptap/html";
import { type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { LineHeight } from "@tiptap/extension-text-style/line-height";
import { FontSize } from "@tiptap/extension-text-style/font-size";
import { FontFamily } from "@tiptap/extension-text-style/font-family";
import parse from "html-react-parser";

export function RenderDescription({ json }: { json: JSONContent }) {
	const output = useMemo(() => {
		return generateHTML(json, [
			StarterKit,
			TextStyle,
			LineHeight.configure({ types: ["textStyle"] }),
			FontSize.configure({ types: ["textStyle"] }),
			FontFamily.configure({ types: ["textStyle"] }),
			TextAlign.configure({ types: ["heading", "paragraph"] }),
		]);
	}, [json]);

	return (
		<div className="prose dark:prose-invert prose-li:marker:text-primary">
			{parse(output)}
		</div>
	);
}
