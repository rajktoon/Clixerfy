import type { StrapiRichTextBlock, StrapiMediaItem } from "./types";

function getStrapiUrl(): string {
  return import.meta.env.STRAPI_URL ?? "http://localhost:1337";
}

/** Resolve a Strapi media URL (handles relative paths) */
export function getMediaUrl(media: StrapiMediaItem | undefined): string {
  if (!media) return "";
  const url = media.url;
  return url.startsWith("http") ? url : `${getStrapiUrl()}${url}`;
}

// ── Rich Text → HTML ──

/** Strapi Rich Text inline node */
interface RtTextNode {
  type: "text";
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

interface RtLinkNode {
  type: "link";
  url: string;
  rel?: string;
  target?: string;
  children: (RtTextNode | RtLinkNode)[];
}

type RtInlineNode = RtTextNode | RtLinkNode;

interface RtBlock {
  type: "paragraph" | "heading" | "list" | "list-item" | "quote" | "code" | "image";
  level?: number;
  format?: "ordered" | "unordered";
  children: RtInlineNode[];
  url?: string;
  alternativeText?: string | null;
}

/** Render inline nodes (text, links, bold, italic) to HTML */
function renderInline(nodes: RtInlineNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === "link") {
        const inner = renderInline(node.children);
        const rel = node.rel ? ` rel="${node.rel}"` : "";
        const target = node.target ? ` target="${node.target}"` : "";
        return `<a href="${node.url}"${rel}${target}>${inner}</a>`;
      }
      // text node
      let text = node.text ?? "";
      if (!text) return "";
      if (node.bold) text = `<strong>${text}</strong>`;
      if (node.italic) text = `<em>${text}</em>`;
      if (node.underline) text = `<u>${text}</u>`;
      if (node.strikethrough) text = `<s>${text}</s>`;
      if (node.code) text = `<code>${text}</code>`;
      return text;
    })
    .join("");
}

/**
 * Convert Strapi Rich Text (array of blocks) to HTML string.
 * Handles: paragraph, heading, list/list-item, quote, code, image.
 */
export function richTextToHtml(doc: unknown): string {
  // Plain string passthrough
  if (typeof doc === "string") return doc;
  // Array of blocks (Strapi Rich Text format)
  if (Array.isArray(doc)) {
    return doc
      .map((block: RtBlock) => {
        switch (block.type) {
          case "paragraph": {
            const inner = renderInline(block.children ?? []);
            return inner ? `<p>${inner}</p>` : "";
          }
          case "heading": {
            const level = block.level ?? 2;
            const inner = renderInline(block.children ?? []);
            return `<h${level}>${inner}</h${level}>`;
          }
          case "list": {
            const tag = block.format === "ordered" ? "ol" : "ul";
            const items = block.children
              ?.map((item: any) => {
                const text = renderInline(item.children ?? []);
                return `<li>${text}</li>`;
              })
              .join("");
            return `<${tag}>${items}</${tag}>`;
          }
          case "quote": {
            const inner = renderInline(block.children ?? []);
            return `<blockquote>${inner}</blockquote>`;
          }
          case "code": {
            const inner = block.children
              ?.map((n) => (n.type === "text" ? n.text : "") ?? "")
              .join("") ?? "";
            return `<pre><code>${inner}</code></pre>`;
          }
          case "image": {
            if (!block.url) return "";
            const alt = block.alternativeText ?? "";
            return `<img src="${block.url}" alt="${alt}" loading="lazy" />`;
          }
          default:
            return "";
        }
      })
      .join("\n");
  }
  return "";
}
