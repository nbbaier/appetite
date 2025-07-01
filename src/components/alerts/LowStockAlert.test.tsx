// biome-ignore-all assist/source/organizeImports: needed for testing
// @ts-nocheck
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LowStockAlert } from "./LowStockAlert";

const makeIngredient = (overrides = {}) => ({
  id: Math.random().toString(),
  user_id: "user1",
  name: "Test Ingredient",
  quantity: 1,
  unit: "pcs",
  category: "Test",
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
  ...overrides,
});

describe("LowStockAlert", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders nothing if ingredients is empty", () => {
    const { container } = render(<LowStockAlert ingredients={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("shows out of stock and low stock counts", () => {
    const ingredients = [
      makeIngredient({ name: "Eggs", quantity: 0 }),
      makeIngredient({ name: "Milk", quantity: 1, low_stock_threshold: 2 }),
      makeIngredient({ name: "Bread", quantity: 5 }),
    ];
    render(<LowStockAlert ingredients={ingredients} />);
    expect(screen.getByText(/low stock alert/i)).toBeInTheDocument();
    expect(screen.getByText(/3 items/i)).toBeInTheDocument();
    expect(screen.getByText(/1 out of stock/i)).toBeInTheDocument();
    expect(screen.getByText(/1 running low/i)).toBeInTheDocument();
  });

  it("shows up to 3 items and a 'more' message if needed", () => {
    const ingredients = [
      makeIngredient({ name: "Eggs", quantity: 0 }),
      makeIngredient({ name: "Milk", quantity: 1 }),
      makeIngredient({ name: "Bread", quantity: 2 }),
      makeIngredient({ name: "Butter", quantity: 0 }),
    ];
    render(<LowStockAlert ingredients={ingredients} />);
    expect(screen.getByText("Eggs")).toBeInTheDocument();
    expect(screen.getByText("Milk")).toBeInTheDocument();
    expect(screen.getByText("Bread")).toBeInTheDocument();
    expect(screen.getByText(/and 1 more/i)).toBeInTheDocument();
  });

  it("shows correct badge for out and low stock", () => {
    const ingredients = [
      makeIngredient({ name: "Eggs", quantity: 0 }),
      makeIngredient({ name: "Milk", quantity: 1 }),
    ];
    render(<LowStockAlert ingredients={ingredients} />);
    expect(screen.getByText("Out")).toBeInTheDocument();
    expect(screen.getByText("1 pcs")).toBeInTheDocument();
  });

  it("calls onViewPantry when button is clicked", () => {
    const onViewPantry = vi.fn();
    const ingredients = [makeIngredient({ name: "Eggs", quantity: 0 })];
    render(
      <LowStockAlert ingredients={ingredients} onViewPantry={onViewPantry} />,
    );
    const btn = screen.getByRole("button", { name: /view pantry/i });
    fireEvent.click(btn);
    expect(onViewPantry).toHaveBeenCalled();
  });
});
