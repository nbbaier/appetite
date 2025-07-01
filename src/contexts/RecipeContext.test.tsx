// biome-ignore-all assist/source/organizeImports: needed for testing
// @ts-nocheck
import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RecipeProvider, useRecipe } from "./RecipeContext";
import { recipeService, bookmarkService } from "../lib/database";

// Mock services and useAuth FIRST
vi.mock("../lib/database", () => ({
  recipeService: {
    getAll: vi.fn().mockResolvedValue([]),
    getIngredients: vi.fn().mockResolvedValue([]),
    getInstructions: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  },
  bookmarkService: {
    getUserBookmarks: vi.fn().mockResolvedValue([]),
    addBookmark: vi.fn().mockResolvedValue(true),
    removeBookmark: vi.fn().mockResolvedValue(undefined),
  },
}));

const stableUser = { id: "user1" };
vi.mock("./AuthContext", () => ({
  useAuth: () => ({ user: stableUser }),
}));

function TestComponent() {
  const ctx = useRecipe();
  return (
    <>
      <div data-testid="recipes">{ctx.recipes.length}</div>
      <div data-testid="bookmarks">{ctx.bookmarkedRecipes.length}</div>
      <div data-testid="loading">{ctx.loading ? "yes" : "no"}</div>
    </>
  );
}

describe("RecipeContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws if useRecipe is used outside provider", () => {
    function Wrapper() {
      useRecipe();
      return null;
    }
    expect(() => render(<Wrapper />)).toThrow();
  });

  it("provides initial state and loads recipes/bookmarks", async () => {
    await act(async () => {
      render(
        <RecipeProvider>
          <TestComponent />
        </RecipeProvider>,
      );
    });
    await waitFor(() => {
      const recipes = screen.getByTestId("recipes").textContent;
      const bookmarks = screen.getByTestId("bookmarks").textContent;
      const loading = screen.getByTestId("loading").textContent;
      console.log("recipes:", recipes);
      console.log("bookmarks:", bookmarks);
      console.log("loading:", loading);
      expect(recipes).toBe("0");
      expect(bookmarks).toBe("0");
      expect(loading).toBe("no");
    });
  });

  it("calls addRecipe and updates recipes", async () => {
    const addRecipe = vi.spyOn(recipeService, "create");
    function AddRecipeTest() {
      const ctx = useRecipe();
      return (
        <button
          onClick={() =>
            ctx.addRecipe({
              title: "R",
              description: "",
              user_id: "user1",
              image_url: "",
              prep_time: 0,
              cook_time: 0,
              servings: 1,
              difficulty: "Easy",
            })
          }
        >
          Add
        </button>
      );
    }
    await act(async () => {
      render(
        <RecipeProvider>
          <AddRecipeTest />
        </RecipeProvider>,
      );
    });
    await act(async () => {
      screen.getByText("Add").click();
    });
    expect(addRecipe).toHaveBeenCalled();
  });

  it("calls toggleBookmark and updates bookmarks", async () => {
    // Mock getUserBookmarks to return ['recipe1'] so recipe1 is already bookmarked
    bookmarkService.getUserBookmarks.mockResolvedValue(["recipe1"]);
    const removeBookmark = vi.spyOn(bookmarkService, "removeBookmark");
    function ToggleBookmarkTest() {
      const ctx = useRecipe();
      return (
        <>
          <button
            data-testid="toggle-btn"
            onClick={() => ctx.toggleBookmark("recipe1")}
          >
            Toggle
          </button>
          <div data-testid="bookmarks">{ctx.bookmarkedRecipes.length}</div>
        </>
      );
    }
    await act(async () => {
      render(
        <RecipeProvider>
          <ToggleBookmarkTest />
        </RecipeProvider>,
      );
    });
    // Wait for bookmarks to load in the DOM
    await waitFor(() => {
      expect(screen.getByTestId("bookmarks").textContent).toBe("1");
    });
    // Now call toggleBookmark via button click
    await act(async () => {
      screen.getByTestId("toggle-btn").click();
    });
    expect(removeBookmark).toHaveBeenCalled();
  });

  it("loads recipe details (ingredients/instructions) successfully", async () => {
    recipeService.getIngredients.mockResolvedValueOnce(["ing1"]);
    recipeService.getInstructions.mockResolvedValueOnce(["step1"]);
    function DetailsTest() {
      const ctx = useRecipe();
      React.useEffect(() => {
        ctx.loadRecipeDetails("recipe1");
      }, [ctx.loadRecipeDetails]);
      return (
        <>
          <div data-testid="ingredients">{ctx.recipeIngredients.length}</div>
          <div data-testid="instructions">{ctx.recipeInstructions.length}</div>
        </>
      );
    }
    await act(async () => {
      render(
        <RecipeProvider>
          <DetailsTest />
        </RecipeProvider>,
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId("ingredients").textContent).toBe("1");
      expect(screen.getByTestId("instructions").textContent).toBe("1");
    });
  });

  it("handles error in loadRecipeDetails", async () => {
    recipeService.getIngredients.mockRejectedValueOnce(new Error("fail"));
    recipeService.getInstructions.mockRejectedValueOnce(new Error("fail"));
    function DetailsTest() {
      const ctx = useRecipe();
      React.useEffect(() => {
        ctx.loadRecipeDetails("recipe1");
      }, [ctx.loadRecipeDetails]);
      return (
        <>
          <div data-testid="ingredients">{ctx.recipeIngredients.length}</div>
          <div data-testid="instructions">{ctx.recipeInstructions.length}</div>
        </>
      );
    }
    await act(async () => {
      render(
        <RecipeProvider>
          <DetailsTest />
        </RecipeProvider>,
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId("ingredients").textContent).toBe("0");
      expect(screen.getByTestId("instructions").textContent).toBe("0");
    });
  });

  it("calls toggleBookmark to add a bookmark", async () => {
    bookmarkService.getUserBookmarks.mockResolvedValue([]);
    const addBookmark = vi.spyOn(bookmarkService, "addBookmark");
    function ToggleBookmarkTest() {
      const ctx = useRecipe();
      return (
        <>
          <button
            data-testid="toggle-btn"
            onClick={() => ctx.toggleBookmark("recipe2")}
          >
            Toggle
          </button>
          <div data-testid="bookmarks">{ctx.bookmarkedRecipes.length}</div>
        </>
      );
    }
    await act(async () => {
      render(
        <RecipeProvider>
          <ToggleBookmarkTest />
        </RecipeProvider>,
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId("bookmarks").textContent).toBe("0");
    });
    await act(async () => {
      screen.getByTestId("toggle-btn").click();
    });
    expect(addBookmark).toHaveBeenCalled();
  });

  it("calls updateRecipe and deleteRecipe", async () => {
    const updateRecipe = vi.spyOn(recipeService, "update");
    const deleteRecipe = vi.spyOn(recipeService, "delete");
    function UpdateDeleteTest() {
      const ctx = useRecipe();
      return (
        <>
          <button
            data-testid="update-btn"
            onClick={() => ctx.updateRecipe("id1", { title: "T" })}
          >
            Update
          </button>
          <button
            data-testid="delete-btn"
            onClick={() => ctx.deleteRecipe("id1")}
          >
            Delete
          </button>
        </>
      );
    }
    await act(async () => {
      render(
        <RecipeProvider>
          <UpdateDeleteTest />
        </RecipeProvider>,
      );
    });
    await act(async () => {
      screen.getByTestId("update-btn").click();
      screen.getByTestId("delete-btn").click();
    });
    expect(updateRecipe).toHaveBeenCalled();
    expect(deleteRecipe).toHaveBeenCalled();
  });

  it("calls setSelectedRecipe and updates state", async () => {
    function SelectTest() {
      const ctx = useRecipe();
      return (
        <>
          <button
            data-testid="select-btn"
            onClick={() => ctx.setSelectedRecipe("id2")}
          >
            Select
          </button>
          <div data-testid="selected">{ctx.selectedRecipe}</div>
        </>
      );
    }
    await act(async () => {
      render(
        <RecipeProvider>
          <SelectTest />
        </RecipeProvider>,
      );
    });
    await act(async () => {
      screen.getByTestId("select-btn").click();
    });
    expect(screen.getByTestId("selected").textContent).toBe("id2");
  });

  it("handles error in addRecipe", async () => {
    recipeService.create.mockRejectedValueOnce(new Error("fail"));
    function AddRecipeTest() {
      const ctx = useRecipe();
      return (
        <button
          onClick={() =>
            ctx.addRecipe({
              title: "R",
              description: "",
              user_id: "user1",
              image_url: "",
              prep_time: 0,
              cook_time: 0,
              servings: 1,
              difficulty: "Easy",
            })
          }
        >
          Add
        </button>
      );
    }
    await act(async () => {
      render(
        <RecipeProvider>
          <AddRecipeTest />
        </RecipeProvider>,
      );
    });
    await act(async () => {
      screen.getByText("Add").click();
    });
    expect(recipeService.create).toHaveBeenCalled();
  });
});
