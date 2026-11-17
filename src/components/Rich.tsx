import { Fragment } from "react";

/**
 * Turns light markup in dictionary strings into elements:
 *   *words*            → <em>words</em> (the italic accent style)
 *   [[Fill in: ...]]   → a yellow placeholder the team still has to fill in
 *   [text](https://…)  → a link that opens in a new tab (used in FAQ answers)
 *   a | b              → a line break (used in the two-line stat labels)
 */
export function rich(text: string) {
  const parts = text.split(/(\*[^*]+\*|\[\[[^\]]+\]\]|\[[^\]]+\]\(https?:\/\/[^)\s]+\)|\|)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part === "|") return <br key={i} />;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith("[[")) return <span key={i} className="fill">{part.slice(2, -2)}</span>;
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    if (link)
      return (
        <a key={i} href={link[2]} target="_blank" rel="noopener">
          {link[1]}
        </a>
      );
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/** The same string as plain text, for search engine data: markup removed, link text kept. */
export function plain(text: string) {
  return text
    .replace(/\[([^\]]+)\]\(https?:\/\/[^)\s]+\)/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\s*\|\s*/g, " ");
}
