import { describe, expect, it } from "vitest";
import { getChangeTypeLabel } from "./issueUtils";

describe("issueUtils", () => {
  it("maps known change type to russian label", () => {
    expect(getChangeTypeLabel("STATUS_CHANGE")).toBe("Изменение статуса");
    expect(getChangeTypeLabel("ASSIGNEE_CHANGE")).toBe("Изменение исполнителя");
  });

  it("returns raw type for unknown change type", () => {
    expect(getChangeTypeLabel("CUSTOM_CHANGE")).toBe("CUSTOM_CHANGE");
  });
});
