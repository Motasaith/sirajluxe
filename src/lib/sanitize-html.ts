"use client";

import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize HTML content, allowing only safe tags/attributes for rich text display.
 * Strips <script>, event handlers, dangerous protocols, etc.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr",
      "ul", "ol", "li",
      "strong", "em", "b", "i", "u", "s", "del", "ins", "mark", "sub", "sup",
      "a", "img",
      "blockquote", "pre", "code",
      "table", "thead", "tbody", "tr", "th", "td",
      "div", "span",
      "figure", "figcaption",
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel",
      "src", "alt", "width", "height", "loading",
      "class", "id",
      "colspan", "rowspan",
    ],
    ALLOW_DATA_ATTR: false,
    // Force all links to open safely
    ADD_ATTR: ["target"],
  });
}
