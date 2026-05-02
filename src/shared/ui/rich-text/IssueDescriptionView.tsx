"use client";

import DOMPurify from "dompurify";
import { useMemo } from "react";

interface IssueDescriptionViewProps {
  html: string;
  className?: string;
}

/**
 * Безопасный вывод HTML описания задачи (санитизация на клиенте).
 */
export function IssueDescriptionView({
  html,
  className = "",
}: IssueDescriptionViewProps) {
  const safe = useMemo(
    () =>
      DOMPurify.sanitize(html || "", {
        USE_PROFILES: { html: true },
      }),
    [html],
  );

  return (
    <div
      className={`issue-description-html ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
