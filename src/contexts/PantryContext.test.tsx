// biome-ignore-all assist/source/organizeImports: needed for testing
// @ts-nocheck
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ingredientService } from "../lib/database";
import { PantryProvider, usePantry } from "./PantryContext";

const stableUser = { id: "user1" };
vi.mock("./AuthContext", () => ({
  useAuth: () => ({ user: stableUser }),
}));

// Mock ingredientService
vi.mock("../lib/database", () => {
  const getAll = vi.fn().mockResolvedValue([{ id: "i1", name: "Flour" }]);
  const create = vi.fn().mockResolvedValue(undefined);
  const update = vi.fn().mockResolvedValue(undefined);
  const del = vi.fn().mockResolvedValue(undefined);
  return {
    ingredientService: { getAll, create, update, delete: del },
    __mocks: { getAll, create, update, del },
  };
});

// Mock supabase.channel
const channelMock = {
  on: vi.fn(function () {
    return channelMock;
  }),
  subscribe: vi.fn(function () {
    return channelMock;
  }),
  unsubscribe: vi.fn(function () {
    return channelMock;
  }),
};
vi.mock("../lib/supabase", () => ({
  supabase: {
    channel: vi.fn(() => channelMock),
  },
}));

function TestComponent() {
  const pantry = usePantry();
  return (
    <>
      <span data-testid="loading">{String(pantry.loading)}</span>
      <span data-testid="ingredients">
        {JSON.stringify(pantry.ingredients)}
      </span>
      <button onClick={() => pantry.loadIngredients()}>Reload</button>
      <button
        onClick={() =>
          pantry.addIngredient({
            name: "Sugar",
            user_id: "user1",
            quantity: 1,
            unit: "kg",
            category: "",
          })
        }
      >
        Add
      </button>
      <button onClick={() => pantry.updateIngredient("i1", { name: "Salt" })}>
        Update
      </button>
      <button onClick={() => pantry.deleteIngredient("i1")}>Delete</button>
    </>
  );
}

describe("PantryContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws error if usePantry is used outside provider", () => {
    // Suppress error output
    const spy = vi.spyOn(console, "error").mockImplementation(() => {
      // do nothing
    });
    function OutsideProvider() {
      usePantry();
      return null;
    }
    expect(() => render(<OutsideProvider />)).toThrow(
      "usePantry must be used within a PantryProvider",
    );
    spy.mockRestore();
  });

  it("provides default state and loads ingredients", async () => {
    render(
      <PantryProvider>
        <TestComponent />
      </PantryProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
      expect(screen.getByTestId("ingredients").textContent).toContain("Flour");
    });
    expect(ingredientService.getAll).toHaveBeenCalledWith("user1");
  });

  it("addIngredient, updateIngredient, deleteIngredient call service and reload", async () => {
    render(
      <PantryProvider>
        <TestComponent />
      </PantryProvider>,
    );
    // Add
    screen.getByText("Add").click();
    await waitFor(() => {
      expect(ingredientService.create).toHaveBeenCalled();
      expect(ingredientService.getAll).toHaveBeenCalledTimes(2); // initial + after add
    });
    // Update
    screen.getByText("Update").click();
    await waitFor(() => {
      expect(ingredientService.update).toHaveBeenCalledWith("i1", {
        name: "Salt",
      });
      expect(ingredientService.getAll).toHaveBeenCalledTimes(3);
    });
    // Delete
    screen.getByText("Delete").click();
    await waitFor(() => {
      expect(ingredientService.delete).toHaveBeenCalledWith("i1");
      expect(ingredientService.getAll).toHaveBeenCalledTimes(4);
    });
  });
});
