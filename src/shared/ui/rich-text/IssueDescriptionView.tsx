"use client";

import DOMPurify from "dompurify";
import { useMemo } from "react";
import { absolutizeUploadUrlsInHtml } from "@/shared/utils/htmlUtils";

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
  const safe = useMemo(() => {
    const resolved = absolutizeUploadUrlsInHtml(html || "");
    return DOMPurify.sanitize(resolved, {
      USE_PROFILES: { html: true },
    });
  }, [html]);

  return (
    <div
      className={`issue-description-html ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
