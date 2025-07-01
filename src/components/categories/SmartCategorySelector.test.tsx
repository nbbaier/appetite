// biome-ignore-all assist/source/organizeImports: needed for testing
// @ts-nocheck
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SmartCategorySelector } from "./SmartCategorySelector";

const defaultProps = {
  ingredientName: "Tomato",
  currentCategory: "Vegetables",
  onCategoryChange: vi.fn(),
  userHistory: [],
  disabled: false,
};

describe("SmartCategorySelector", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders with required props", () => {
    render(<SmartCategorySelector {...defaultProps} />);
    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /smart suggest/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("calls analyzeCategory when Smart Suggest is clicked and shows suggestion banner", async () => {
    // Mock fetch to return a suggestion
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        category: "Fruits",
        confidence: 0.95,
        suggestions: ["Fruits", "Vegetables"],
      }),
    });
    render(<SmartCategorySelector {...defaultProps} ingredientName="Apple" />);
    const button = screen.getByRole("button", { name: /smart suggest/i });
    fireEvent.click(button);
    await waitFor(() => {
      const banner = screen.getByText(/smart suggestion:/i).closest("div");
      expect(banner).toBeInTheDocument();
      // Look for the 'Fruits' badge inside the banner
      expect(
        within(banner!).getByText("Fruits", { selector: "div" }),
      ).toBeInTheDocument();
    });
  });

  it("applies and dismisses a suggestion", async () => {
    const onCategoryChange = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        category: "Fruits",
        confidence: 0.95,
        suggestions: ["Fruits", "Vegetables"],
      }),
    });
    render(
      <SmartCategorySelector
        {...defaultProps}
        ingredientName="Apple"
        onCategoryChange={onCategoryChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /smart suggest/i }));
    await waitFor(() =>
      expect(screen.getByText(/smart suggestion:/i)).toBeInTheDocument(),
    );
    // Apply
    fireEvent.click(screen.getByRole("button", { name: /apply/i }));
    expect(onCategoryChange).toHaveBeenCalledWith("Fruits");
    // Dismiss (re-render to show again)
    fireEvent.click(screen.getByRole("button", { name: /smart suggest/i }));
    await waitFor(() =>
      expect(screen.getByText(/smart suggestion:/i)).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(screen.queryByText(/smart suggestion:/i)).not.toBeInTheDocument();
  });
});
