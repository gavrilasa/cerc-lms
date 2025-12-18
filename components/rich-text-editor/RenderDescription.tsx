"use client";

import { useMemo } from "react";
import { generateHTML } from "@tiptap/html";
import { type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import {
	TextStyle,
	LineHeight,
	FontSize,
	FontFamily,
} from "@tiptap/extension-text-style";
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
