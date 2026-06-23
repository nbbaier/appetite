import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./input";

describe("Input", () => {
  it("renders with placeholder and value", () => {
    render(
      <Input
        onChange={() => {
          // do nothing
        }}
        placeholder="Type here"
        value="abc"
      />
    );
    const input = screen.getByPlaceholderText("Type here");
    expect(input).toBeInTheDocument();
    expect(input.value).toBe("abc");
  });

  it("calls onChange when typing", () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} value="" />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "x" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("can be disabled", () => {
    render(
      <Input
        disabled
        onChange={() => {
          // do nothing
        }}
        value=""
      />
    );
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });
});
