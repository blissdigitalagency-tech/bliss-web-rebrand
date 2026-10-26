import { Fragment } from "react";

/**
 * Turns light markup in dictionary strings into elements:
 *   *words*            → <em>words</em> (the italic accent style)
 *   [[Fill in: ...]]   → a yellow placeholder the team still has to fill in
 *   a | b              → a line break (used in the two-line stat labels)
 */
export function rich(text: string) {
  const parts = text.split(/(\*[^*]+\*|\[\[[^\]]+\]\]|\|)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part === "|") return <br key={i} />;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith("[[")) return <span key={i} className="fill">{part.slice(2, -2)}</span>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}
