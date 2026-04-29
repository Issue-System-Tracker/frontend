import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TextInput from "./TextInput";

describe("TextInput", () => {
  it("renders input and propagates text changes", () => {
    const onChange = vi.fn();
    render(<TextInput value="" onChange={onChange} placeholder="Введите текст" />);

    fireEvent.change(screen.getByPlaceholderText("Введите текст"), {
      target: { value: "hello" },
    });
    expect(onChange).toHaveBeenCalledWith("hello");
  });

  it("converts value to number for number type", () => {
    const onChange = vi.fn();
    render(<TextInput type="number" value={0} onChange={onChange} placeholder="0" />);

    fireEvent.change(screen.getByPlaceholderText("0"), { target: { value: "15" } });
    expect(onChange).toHaveBeenCalledWith(15);
  });

  it("renders textarea in multiline mode", () => {
    const onChange = vi.fn();
    render(<TextInput multiline value="" onChange={onChange} label="Описание" required />);

    expect(screen.getByText("Описание")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});
