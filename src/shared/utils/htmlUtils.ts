import { API_BASE_URL } from "@/shared/config/api";

export function getApiOrigin(): string {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return "";
  }
}

/**
 * Сервер мог собрать URL с Host прокси (например :3000 вместо :8080) — img тогда не грузится.
 * Приводим `/uploads/...` и любой host с таким путём к origin из API_BASE_URL.
 */
export function absolutizeUploadUrlsInHtml(html: string): string {
  if (!html?.trim()) return html ?? "";
  const origin = getApiOrigin();
  if (!origin) return html;

  const rewriteSrc = (src: string): string => {
    const s = src.trim();
    if (s.startsWith("/uploads/")) {
      return `${origin}${s}`;
    }
    try {
      const u = new URL(s);
      if (u.pathname.startsWith("/uploads/")) {
        return `${origin}${u.pathname}${u.search}${u.hash}`;
      }
    } catch {
      /* ignore */
    }
    return src;
  };

  if (typeof document !== "undefined") {
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll("img[src]").forEach((img) => {
      const cur = img.getAttribute("src") ?? "";
      const next = rewriteSrc(cur);
      if (next !== cur) img.setAttribute("src", next);
    });
    return doc.body.innerHTML;
  }

  return html.replace(
    /(<img\b[^>]*\ssrc=["'])(\/uploads\/[^"']+)(["'])/gi,
    (_, open: string, path: string, close: string) => `${open}${origin}${path}${close}`,
  );
}

/** Одна ссылка от POST /api/upload/image — тот же принцип, что и для HTML. */
export function absolutizeUploadedImageUrl(url: string): string {
  if (!url?.trim()) return url;
  const origin = getApiOrigin();
  if (!origin) return url;
  const s = url.trim();
  if (s.startsWith("/uploads/")) return `${origin}${s}`;
  try {
    const u = new URL(s);
    if (u.pathname.startsWith("/uploads/")) {
      return `${origin}${u.pathname}${u.search}${u.hash}`;
    }
  } catch {
    /* ignore */
  }
  return url;
}

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

/** Убирает только временные вставки (blob/data). URL с сервера (/uploads) остаются в сохранённом HTML. */
export function stripEphemeralImagesFromHtml(html: string): string {
  if (!html?.trim()) return html ?? "";
  if (typeof document !== "undefined") {
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll("img").forEach((el) => {
      const src = el.getAttribute("src") ?? "";
      if (src.startsWith("blob:") || src.startsWith("data:")) {
        el.remove();
      }
    });
    return doc.body.innerHTML;
  }
  return html.replace(/<img[^>]*\ssrc=["'](?:blob:|data:)[^"']*["'][^>]*>/gi, "");
}
