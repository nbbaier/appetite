// biome-ignore-all assist/source/organizeImports: needed for testing
// @ts-nocheck
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, expect, it, vi } from "vitest";
import type { Ingredient } from "../../types";
import { ExpirationMonitor } from "./ExpirationMonitor";

const mockIngredients: Ingredient[] = [
  {
    id: "1",
    user_id: "user1",
    name: "Milk",
    quantity: 1,
    unit: "L",
    category: "Dairy",
    expiration_date: "2025-07-01",
    notes: "",
    low_stock_threshold: 1,
    created_at: "2025-06-01T00:00:00Z",
    updated_at: "2025-06-01T00:00:00Z",
  },
  {
    id: "2",
    user_id: "user1",
    name: "Eggs",
    quantity: 12,
    unit: "pcs",
    category: "Dairy",
    expiration_date: "2025-07-03",
    notes: "",
    low_stock_threshold: 6,
    created_at: "2025-06-01T00:00:00Z",
    updated_at: "2025-06-01T00:00:00Z",
  },
];

describe("ExpirationMonitor", () => {
  it("renders without crashing and displays ingredients", () => {
    render(
      <ExpirationMonitor
        ingredients={mockIngredients}
        onUpdateSettings={vi.fn()}
      />,
    );
    expect(screen.getByText("Milk")).toBeInTheDocument();
    expect(screen.getByText("Eggs")).toBeInTheDocument();
  });

  it("shows and updates settings panel", () => {
    render(
      <ExpirationMonitor
        ingredients={mockIngredients}
        onUpdateSettings={vi.fn()}
      />,
    );
    // Open settings (first button in header)
    const settingsButton = screen.getAllByRole("button")[0];
    fireEvent.click(settingsButton);
    expect(screen.getByText(/Alert Settings/i)).toBeInTheDocument();
    // Change warning days
    const warningInput = screen.getByLabelText(/Warning \(days\)/i);
    fireEvent.change(warningInput, { target: { value: "5" } });
    expect(warningInput).toHaveValue(5);
  });

  it("calls onUpdateSettings when Save Settings is clicked", () => {
    const onUpdateSettings = vi.fn();
    render(
      <ExpirationMonitor
        ingredients={mockIngredients}
        onUpdateSettings={onUpdateSettings}
      />,
    );
    // Open settings (first button in header)
    const settingsButton = screen.getAllByRole("button")[0];
    fireEvent.click(settingsButton);
    // Save (find by text if possible, else by role)
    const saveButton =
      screen.getByRole("button", { name: /save settings/i }) ||
      screen.getAllByRole("button")[1];
    fireEvent.click(saveButton);
    expect(onUpdateSettings).toHaveBeenCalled();
  });
});
