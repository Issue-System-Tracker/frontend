import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LogoutButton from "./LogoutButton";

const logoutMock = vi.fn();
vi.mock("@/features/auth", () => ({
  logout: () => logoutMock(),
}));

describe("LogoutButton", () => {
  it("calls logout on click", () => {
    render(<LogoutButton />);
    fireEvent.click(screen.getByRole("button", { name: "Выйти" }));
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  it("applies centered class when centered=true", () => {
    render(<LogoutButton centered className="extra" />);
    const button = screen.getByRole("button", { name: "Выйти" });
    expect(button.className).toContain("justify-center");
    expect(button.className).toContain("extra");
  });
});
