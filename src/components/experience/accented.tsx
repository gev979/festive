import * as React from "react";

/**
 * Renders a translated line in which `*…*` marks the words set in the accent
 * style. Word order differs between languages, so the translation decides
 * which words those are rather than the markup.
 */
export function Accented({
  text,
  className = "text-gradient",
}: {
  text: string;
  className?: string;
}) {
  return text.split("*").map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className={className}>
        {part}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
}
