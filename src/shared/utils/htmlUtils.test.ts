import { describe, expect, it } from "vitest";
import {
  isRichTextEmpty,
  previewTextFromHtml,
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

  it("previewTextFromHtml truncates long plain text", () => {
    const long = "a".repeat(300);
    const prev = previewTextFromHtml(`<p>${long}</p>`, 50);
    expect(prev.endsWith("…")).toBe(true);
    expect(prev.length).toBeLessThanOrEqual(51);
  });
});
