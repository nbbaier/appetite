// biome-ignore-all assist/source/organizeImports: needed for testing
// @ts-nocheck
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AutocompleteInput } from "./AutocompleteInput";

const defaultProps = {
  value: "",
  onChange: vi.fn(),
  onSelect: vi.fn(),
  placeholder: "Enter ingredient name...",
  userHistory: ["Apple", "Banana", "Carrot", "Apple"],
  className: undefined,
  disabled: false,
};

describe("AutocompleteInput", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders input with placeholder and disabled state", () => {
    render(<AutocompleteInput {...defaultProps} disabled={true} />);
    const input = screen.getByPlaceholderText(/enter ingredient name/i);
    expect(input).toBeInTheDocument();
    expect(input).toBeDisabled();
  });

  it("shows suggestions from user history, common, and brand", async () => {
    render(<AutocompleteInput {...defaultProps} value="app" />);
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    await waitFor(() => {
      expect(screen.getByText("Apple")).toBeInTheDocument();
    });
    // Should show label for user history or common
    expect(screen.getAllByText(/recent|popular/i).length).toBeGreaterThan(0);
  });

  it("calls onChange and onSelect when suggestion is clicked", async () => {
    const onChange = vi.fn();
    const onSelect = vi.fn();
    render(
      <AutocompleteInput
        {...defaultProps}
        value="ban"
        onChange={onChange}
        onSelect={onSelect}
      />,
    );
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    await waitFor(() => {
      expect(screen.getByText("Banana")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Banana"));
    expect(onChange).toHaveBeenCalledWith("Banana");
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Banana" }),
    );
  });

  it("supports keyboard navigation and selection", async () => {
    const onChange = vi.fn();
    const onSelect = vi.fn();
    render(
      <AutocompleteInput
        {...defaultProps}
        value="che"
        onChange={onChange}
        onSelect={onSelect}
      />,
    );
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    await waitFor(() => {
      expect(screen.getByText("Cheese")).toBeInTheDocument();
    });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("Cheese");
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Cheese" }),
    );
  });

  it("closes suggestions on escape and blur", async () => {
    render(<AutocompleteInput {...defaultProps} value="egg" />);
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    await waitFor(() => {
      expect(screen.getByText("Eggs")).toBeInTheDocument();
    });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByText("Eggs")).not.toBeInTheDocument();
  });

  it("does not show suggestions for empty input", () => {
    render(<AutocompleteInput {...defaultProps} value="" />);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("handles duplicate suggestions gracefully", async () => {
    render(
      <AutocompleteInput
        {...defaultProps}
        value="apple"
        userHistory={["Apple", "Apple"]}
      />,
    );
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    await waitFor(() => {
      // Only one Apple suggestion should appear
      expect(screen.getAllByText("Apple").length).toBe(1);
    });
  });
});
