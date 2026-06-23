import React, { useMemo, useState } from "react";
import type { Recipe } from "../../types";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface AddFromRecipeModalProps {
  availableRecipes: Recipe[];
  loading: boolean;
  onAddFromRecipe: (recipeId: string) => void;
  onClose: () => void;
  visible: boolean;
}

const prefetchRecipeDetailModal = () => {
  import("../recipes/RecipeDetailModal");
};

export const AddFromRecipeModal: React.FC<AddFromRecipeModalProps> = ({
  visible,
  onClose,
  onAddFromRecipe,
  availableRecipes,
  loading,
}) => {
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);

  React.useEffect(() => {
    if (!visible) {
      return;
    }
    setSearch("");
    setVisibleCount(10);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, onClose]);

  const filteredRecipes = useMemo(() => {
    if (!search.trim()) {
      return availableRecipes;
    }
    return availableRecipes.filter((r) =>
      r.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [availableRecipes, search]);

  if (!visible) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <Card className="mx-auto max-h-[90vh] w-full max-w-lg overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">
            Add Ingredients from Recipe
          </CardTitle>
          <Button className="ml-auto" onClick={onClose} variant="ghost">
            Close
          </Button>
        </CardHeader>
        <CardContent>
          <input
            className="mb-4 w-full rounded border px-3 py-2 text-sm"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes..."
            type="text"
            value={search}
          />
          {loading ? (
            <div className="py-8 text-center">Loading recipes...</div>
          ) : (
            <div className="space-y-2">
              {filteredRecipes.length === 0 ? (
                <div className="py-8 text-center text-secondary-600">
                  No recipes found.
                </div>
              ) : (
                <>
                  {filteredRecipes.slice(0, visibleCount).map((recipe) => (
                    <Button
                      className="w-full justify-start"
                      key={recipe.id}
                      onClick={() => onAddFromRecipe(recipe.id)}
                      onFocus={prefetchRecipeDetailModal}
                      onMouseEnter={prefetchRecipeDetailModal}
                    >
                      {recipe.title}
                    </Button>
                  ))}
                  {filteredRecipes.length > visibleCount && (
                    <Button
                      className="mt-2 w-full"
                      onClick={() => setVisibleCount((c) => c + 10)}
                      variant="outline"
                    >
                      Show More
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
