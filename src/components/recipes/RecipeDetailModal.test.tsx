// biome-ignore-all assist/source/organizeImports: needed for testing
// @ts-nocheck
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { RecipeDetailModal } from "./RecipeDetailModal";

const recipe = {
  id: "1",
  user_id: "u1",
  title: "Test Recipe",
  description: "A test description.",
  image_url: "https://example.com/image.jpg",
  prep_time: 10,
  cook_time: 20,
  servings: 4,
  difficulty: "Easy",
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
};

const baseProps = {
  open: true,
  onClose: vi.fn(),
  recipe,
  ingredients: [],
  instructions: [],
  loading: false,
  isBookmarked: false,
  onBookmark: vi.fn(),
  canCook: false,
  userShoppingLists: [],
  showAddToShoppingModal: false,
  setShowAddToShoppingModal: vi.fn(),
  selectedShoppingListId: "",
  setSelectedShoppingListId: vi.fn(),
  addMissingToShoppingList: vi.fn(),
  addingToShopping: false,
  showCreateLeftoverModal: false,
  setShowCreateLeftoverModal: vi.fn(),
  createLeftoverFromRecipe: vi.fn(),
  creatingLeftover: false,
  getMissingIngredients: () => [],
};

describe("RecipeDetailModal", () => {
  it("renders recipe details", () => {
    render(<RecipeDetailModal {...baseProps} />);
    expect(screen.getByText("Test Recipe")).toBeInTheDocument();
    expect(screen.getByText("A test description.")).toBeInTheDocument();
    expect(screen.getByAltText("Test Recipe")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<RecipeDetailModal {...baseProps} onClose={onClose} />);
    // The close button has no accessible name, so select the first button
    const btn = screen.getAllByRole("button")[0];
    fireEvent.click(btn);
    expect(onClose).toHaveBeenCalled();
  });
});
