import { describe, expect, it } from "vitest";
import { handleApiError } from "./errorHandler";

describe("handleApiError", () => {
  it("returns server permission message for 403", async () => {
    const response = new Response(
      JSON.stringify({ message: "Нет доступа к проекту" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );

    const message = await handleApiError(response, "Ошибка");
    expect(message).toBe("Нет доступа к проекту");
  });

  it("returns default 403 message when payload has no permission keywords", async () => {
    const response = new Response(
      JSON.stringify({ message: "Some other reason" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );

    const message = await handleApiError(response, "Ошибка");
    expect(message).toBe("У вас нет прав для этого действия");
  });

  it("uses json error message for non-403 responses", async () => {
    const response = new Response(
      JSON.stringify({ error: "Плохой запрос" }),
      { status: 400, statusText: "Bad Request", headers: { "Content-Type": "application/json" } }
    );

    const message = await handleApiError(response, "Ошибка");
    expect(message).toBe("Плохой запрос");
  });

  it("formats Spring validation errors field by field", async () => {
    const response = new Response(
      JSON.stringify({
        message: "Validation failed",
        errors: {
          description: "size must be between 1 and 1000",
        },
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );

    const message = await handleApiError(response, "Ошибка");
    expect(message).toBe("description: size must be between 1 and 1000");
  });

  it("falls back to status text for empty response", async () => {
    const response = new Response("", {
      status: 500,
      statusText: "Internal Server Error",
      headers: { "Content-Type": "text/plain" },
    });

    const message = await handleApiError(response, "Ошибка");
    expect(message).toContain("500");
    expect(message).toContain("Internal Server Error");
  });
});
