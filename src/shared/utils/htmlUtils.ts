/**
 * Извлекает видимый текст из HTML (превью в карточках, проверка «пустого» редактора).
 */
export function stripHtmlToText(html: string): string {
  if (!html?.trim()) return "";
  if (typeof document !== "undefined") {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const text = doc.body.textContent ?? "";
    return text.replace(/\s+/g, " ").trim();
  }
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isRichTextEmpty(html: string): boolean {
  return stripHtmlToText(html).length === 0;
}

export function previewTextFromHtml(html: string, maxLen = 240): string {
  const t = stripHtmlToText(html);
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen).trimEnd()}…`;
}
