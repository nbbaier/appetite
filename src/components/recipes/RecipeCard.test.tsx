// biome-ignore-all assist/source/organizeImports: needed for testing
// @ts-nocheck
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RecipeCard } from "./RecipeCard";

const baseRecipe = {
  id: "1",
  user_id: "u1",
  title: "Test Recipe",
  description: "A delicious test recipe.",
  image_url: "https://example.com/image.jpg",
  prep_time: 10,
  cook_time: 20,
  servings: 4,
  difficulty: "Easy",
  cuisine_type: "Italian",
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
};

describe("RecipeCard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders recipe info and image", () => {
    render(
      <RecipeCard
        recipe={baseRecipe}
        isBookmarked={false}
        onBookmark={vi.fn()}
      />,
    );
    expect(screen.getByText("Test Recipe")).toBeInTheDocument();
    expect(screen.getByText("A delicious test recipe.")).toBeInTheDocument();
    expect(screen.getByAltText("Test Recipe")).toBeInTheDocument();
    expect(screen.getByText("30 min")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Easy")).toBeInTheDocument();
    expect(screen.getByText("Italian")).toBeInTheDocument();
  });

  it("calls onBookmark when heart is clicked", () => {
    const onBookmark = vi.fn();
    render(
      <RecipeCard
        recipe={baseRecipe}
        isBookmarked={false}
        onBookmark={onBookmark}
      />,
    );
    const btn = screen.getAllByRole("button")[0];
    fireEvent.click(btn);
    expect(onBookmark).toHaveBeenCalledWith("1");
  });

  it("shows Can Cook badge and match percentage", () => {
    render(
      <RecipeCard
        recipe={baseRecipe}
        isBookmarked={false}
        onBookmark={vi.fn()}
        canCook={true}
        matchPercentage={90}
      />,
    );
    expect(screen.getByText(/can cook/i)).toBeInTheDocument();
    expect(screen.getByText(/90% match/i)).toBeInTheDocument();
  });

  it("shows Perfect Match badge at 100%", () => {
    render(
      <RecipeCard
        recipe={baseRecipe}
        isBookmarked={false}
        onBookmark={vi.fn()}
        matchPercentage={100}
      />,
    );
    expect(screen.getByText(/perfect match/i)).toBeInTheDocument();
  });

  it("shows missing ingredients and more count", () => {
    render(
      <RecipeCard
        recipe={baseRecipe}
        isBookmarked={false}
        onBookmark={vi.fn()}
        missingIngredients={["Eggs", "Milk", "Flour", "Sugar"]}
      />,
    );
    expect(screen.getByText(/missing/i)).toBeInTheDocument();
    expect(screen.getByText(/Eggs, Milk, Flour/)).toBeInTheDocument();
    expect(screen.getByText(/\+1 more/)).toBeInTheDocument();
  });

  it("calls onEdit and onDelete when buttons are clicked", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(
      <RecipeCard
        recipe={baseRecipe}
        isBookmarked={false}
        onBookmark={vi.fn()}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );
    // Edit is the second button, Delete is the third
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[1]);
    expect(onEdit).toHaveBeenCalledWith(baseRecipe);
    fireEvent.click(buttons[2]);
    expect(onDelete).toHaveBeenCalledWith(baseRecipe);
  });
});
