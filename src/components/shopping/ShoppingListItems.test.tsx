import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, expect, it, vi } from "vitest";
import type { ShoppingListItem } from "../../types";
import { ShoppingListItems } from "./ShoppingListItems";

const items = [
  {
    id: "1",
    name: "Eggs",
    quantity: 1,
    unit: "dozen",
    is_purchased: false,
    category: "Dairy",
    shopping_list_id: "list-1",
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "2",
    name: "Milk",
    quantity: 2,
    unit: "liters",
    is_purchased: true,
    category: "Dairy",
    shopping_list_id: "list-1",
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
] satisfies ShoppingListItem[];

describe("ShoppingListItems", () => {
  it("renders all items", () => {
    render(
      <ShoppingListItems
        items={items}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onTogglePurchased={vi.fn()}
      />
    );
    expect(screen.getByText("Eggs")).toBeInTheDocument();
    expect(screen.getByText("Milk")).toBeInTheDocument();
  });

  it("shows purchased state", () => {
    render(
      <ShoppingListItems
        items={items}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onTogglePurchased={vi.fn()}
      />
    );
    expect(screen.getByText("Milk")).toHaveClass("line-through");
  });

  it("calls onTogglePurchased when item is clicked", () => {
    const onTogglePurchased = vi.fn();
    render(
      <ShoppingListItems
        items={items}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onTogglePurchased={onTogglePurchased}
      />
    );
    // The first button in the row is the toggle button
    const btn = screen.getAllByRole("button")[0];
    fireEvent.click(btn);
    expect(onTogglePurchased).toHaveBeenCalledWith("1", false);
  });
});
