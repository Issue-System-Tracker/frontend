import { describe, expect, it } from "vitest";
import { formatDate, formatDateWithStatus, normalizeIso } from "./dateUtils";

describe("dateUtils", () => {
  it("normalizeIso converts unix seconds to ISO", () => {
    expect(normalizeIso("1700000000")).toBe("2023-11-14T22:13:20.000Z");
  });

  it("normalizeIso converts spaced datetime to Z-suffixed datetime", () => {
    expect(normalizeIso("2026-04-29 12:00:00")).toBe("2026-04-29T12:00:00Z");
  });

  it("formatDate returns placeholder for invalid date", () => {
    expect(formatDate("not-a-date")).toBe("—");
  });

  it("formatDateWithStatus returns overdue status for yesterday", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const result = formatDateWithStatus(yesterday);

    expect(result).not.toBeNull();
    expect(result?.statusText).toBe("Просрочено");
    expect(result?.statusClass).toContain("text-red-500");
  });
});
