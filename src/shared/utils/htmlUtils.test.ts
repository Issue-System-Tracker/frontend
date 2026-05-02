import { describe, expect, it } from "vitest";
import {
  absolutizeUploadUrlsInHtml,
  absolutizeUploadedImageUrl,
  isRichTextEmpty,
  previewTextFromHtml,
  stripEphemeralImagesFromHtml,
  stripHtmlToText,
} from "./htmlUtils";

describe("htmlUtils", () => {
  it("stripHtmlToText extracts visible text", () => {
    expect(stripHtmlToText("<p>Hello <strong>world</strong></p>")).toBe(
      "Hello world",
    );
  });

  it("isRichTextEmpty is true for empty paragraphs only", () => {
    expect(isRichTextEmpty("<p></p>")).toBe(true);
    expect(isRichTextEmpty("<p><br></p>")).toBe(true);
    expect(isRichTextEmpty("<p> </p>")).toBe(true);
    expect(isRichTextEmpty("<p>x</p>")).toBe(false);
  });

  it("absolutizeUploadUrlsInHtml rewrites uploads path to API origin", () => {
    const out = absolutizeUploadUrlsInHtml(
      '<p><img src="/uploads/a.png"/></p>',
    );
    expect(out).toContain("http://localhost:8080/uploads/a.png");
  });

  it("absolutizeUploadedImageUrl normalizes cross-host uploads URL", () => {
    expect(
      absolutizeUploadedImageUrl("http://localhost:3000/uploads/x.webp"),
    ).toBe("http://localhost:8080/uploads/x.webp");
  });

  it("stripEphemeralImagesFromHtml removes blob/data only", () => {
    expect(
      stripEphemeralImagesFromHtml('<p><img src="blob:x"/>x</p>'),
    ).not.toContain("blob:");
    expect(
      stripEphemeralImagesFromHtml(
        '<p><img src="http://localhost:8080/uploads/a.png"/></p>',
      ),
    ).toContain("uploads");
  });

  it("previewTextFromHtml truncates long plain text", () => {
    const long = "a".repeat(300);
    const prev = previewTextFromHtml(`<p>${long}</p>`, 50);
    expect(prev.endsWith("…")).toBe(true);
    expect(prev.length).toBeLessThanOrEqual(51);
  });
});
