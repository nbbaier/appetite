// biome-ignore-all assist/source/organizeImports: needed for testing
// @ts-nocheck
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { ShoppingListItems } from "../shopping/ShoppingListItems";

const items = [
  { id: "1", name: "Eggs", quantity: 1, unit: "dozen", is_purchased: false },
  { id: "2", name: "Milk", quantity: 2, unit: "liters", is_purchased: true },
];

describe("ShoppingListItems", () => {
  it("renders all items", () => {
    render(<ShoppingListItems items={items} onToggle={vi.fn()} />);
    expect(screen.getByText("Eggs")).toBeInTheDocument();
    expect(screen.getByText("Milk")).toBeInTheDocument();
  });

  it("shows purchased state", () => {
    render(<ShoppingListItems items={items} onToggle={vi.fn()} />);
    expect(screen.getByText("Milk")).toHaveClass("line-through");
  });

  it("calls onToggle when item is clicked", () => {
    const onToggle = vi.fn();
    render(
      <ShoppingListItems
        items={items}
        onToggle={onToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTogglePurchased={onToggle}
      />,
    );
    // The first button in the row is the toggle button
    const btn = screen.getAllByRole("button")[0];
    fireEvent.click(btn);
    expect(onToggle).toHaveBeenCalledWith("1", false);
  });
});
