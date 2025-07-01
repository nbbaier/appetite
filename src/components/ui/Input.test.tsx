// biome-ignore-all assist/source/organizeImports: needed for testing
// @ts-nocheck
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { Input } from "./input";

describe("Input", () => {
  it("renders with placeholder and value", () => {
    render(
      <Input
        placeholder="Type here"
        value="abc"
        onChange={() => {
          // do nothing
        }}
      />,
    );
    const input = screen.getByPlaceholderText("Type here");
    expect(input).toBeInTheDocument();
    expect(input.value).toBe("abc");
  });

  it("calls onChange when typing", () => {
    const onChange = vi.fn();
    render(<Input value="" onChange={onChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "x" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("can be disabled", () => {
    render(
      <Input
        value=""
        onChange={() => {
          // do nothing
        }}
        disabled
      />,
    );
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });
});
