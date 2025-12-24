/**
 * Input sanitization utilities for XSS protection.
 * Use these functions to sanitize user input before storing in database
 * or rendering in the UI.
 */

/**
 * HTML entities to escape for XSS prevention
 */
const HTML_ENTITIES: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#x27;",
	"/": "&#x2F;",
	"`": "&#x60;",
	"=": "&#x3D;",
};

/**
 * Escape HTML entities in a string to prevent XSS attacks.
 * Use this for plain text that will be rendered in HTML.
 *
 * @example
 * escapeHtml("<script>alert('xss')</script>")
 * // Returns: "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;"
 */
export function escapeHtml(str: string): string {
	if (!str || typeof str !== "string") return "";
	return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Remove all HTML tags from a string.
 * Use this when you need plain text only.
 *
 * @example
 * stripHtml("<p>Hello <strong>World</strong></p>")
 * // Returns: "Hello World"
 */
export function stripHtml(str: string): string {
	if (!str || typeof str !== "string") return "";
	return str.replace(/<[^>]*>/g, "");
}

/**
 * Allowed HTML tags for rich text content (TipTap editor output).
 * These tags are considered safe for rendering.
 */
const ALLOWED_TAGS = new Set([
	"p",
	"br",
	"strong",
	"b",
	"em",
	"i",
	"u",
	"s",
	"strike",
	"code",
	"pre",
	"blockquote",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"ul",
	"ol",
	"li",
	"a",
	"img",
	"hr",
	"span",
	"div",
	"table",
	"thead",
	"tbody",
	"tr",
	"th",
	"td",
]);

/**
 * Allowed attributes for HTML tags in rich text content.
 */
const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
	a: new Set(["href", "title", "target", "rel"]),
	img: new Set(["src", "alt", "title", "width", "height"]),
	span: new Set(["class", "style"]),
	div: new Set(["class"]),
	code: new Set(["class"]),
	pre: new Set(["class"]),
	td: new Set(["colspan", "rowspan"]),
	th: new Set(["colspan", "rowspan"]),
	"*": new Set(["class", "id"]), // Allowed on all elements
};

/**
 * Dangerous URL protocols that should be blocked.
 */
const DANGEROUS_PROTOCOLS = ["javascript:", "vbscript:", "data:"];

/**
 * Check if a URL is safe (not using dangerous protocols).
 */
function isSafeUrl(url: string): boolean {
	const normalizedUrl = url.toLowerCase().trim();
	return !DANGEROUS_PROTOCOLS.some((protocol) =>
		normalizedUrl.startsWith(protocol)
	);
}

/**
 * Sanitize rich text HTML content from TipTap editor.
 * Removes dangerous tags/attributes while preserving safe formatting.
 *
 * @param html - Raw HTML string from editor
 * @returns Sanitized HTML string
 *
 * @example
 * sanitizeRichText('<p onclick="alert()">Hello</p><script>bad</script>')
 * // Returns: '<p>Hello</p>'
 */
export function sanitizeRichText(html: string): string {
	if (!html || typeof html !== "string") return "";

	// Simple regex-based sanitization
	// For production, consider using DOMPurify library
	let sanitized = html;

	// Remove script and style tags entirely
	sanitized = sanitized.replace(
		/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
		""
	);
	sanitized = sanitized.replace(
		/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
		""
	);

	// Remove event handlers (onclick, onload, onerror, etc.)
	sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
	sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, "");

	// Remove javascript: URLs
	sanitized = sanitized.replace(/javascript\s*:/gi, "");
	sanitized = sanitized.replace(/vbscript\s*:/gi, "");

	// Remove data: URLs (potential XSS vector)
	sanitized = sanitized.replace(/data\s*:[^"'\s>]*/gi, "");

	return sanitized;
}

/**
 * Sanitize a URL string for safe use in href/src attributes.
 *
 * @param url - URL to sanitize
 * @returns Safe URL or empty string if dangerous
 */
export function sanitizeUrl(url: string): string {
	if (!url || typeof url !== "string") return "";

	const trimmed = url.trim();

	if (!isSafeUrl(trimmed)) {
		return "";
	}

	// Allow relative URLs, http, https, mailto, tel
	if (
		trimmed.startsWith("/") ||
		trimmed.startsWith("http://") ||
		trimmed.startsWith("https://") ||
		trimmed.startsWith("mailto:") ||
		trimmed.startsWith("tel:")
	) {
		return trimmed;
	}

	// Default to adding https:// for URLs without protocol
	if (!trimmed.includes("://")) {
		return `https://${trimmed}`;
	}

	return trimmed;
}

/**
 * Sanitize user input for use in database queries.
 * Trims whitespace and removes null bytes.
 */
export function sanitizeInput(input: string): string {
	if (!input || typeof input !== "string") return "";
	return input.trim().replace(/\0/g, "");
}
