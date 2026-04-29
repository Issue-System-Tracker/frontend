import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CustomSelect from "./CustomSelect";

describe("CustomSelect", () => {
  const options = [
    { value: "OPEN", label: "Open" },
    { value: "DONE", label: "Done" },
  ];

  it("opens list and selects option", () => {
    const onChange = vi.fn();
    render(
      <CustomSelect
        label="Статус"
        options={options}
        value={null}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Статус" }));
    fireEvent.click(screen.getByRole("option", { name: "Done" }));

    expect(onChange).toHaveBeenCalledWith("DONE");
  });

  it("allows reset to null when not required", () => {
    const onChange = vi.fn();
    render(
      <CustomSelect
        label="Статус"
        options={options}
        value="OPEN"
        onChange={onChange}
        emptyOptionLabel="Не выбрано"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Статус" }));
    fireEvent.click(screen.getByRole("button", { name: "Не выбрано" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("does not open when disabled", () => {
    const onChange = vi.fn();
    render(
      <CustomSelect
        label="Статус"
        options={options}
        value={null}
        onChange={onChange}
        disabled
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Статус" }));
    expect(screen.queryByRole("option", { name: "Open" })).not.toBeInTheDocument();
  });
});
