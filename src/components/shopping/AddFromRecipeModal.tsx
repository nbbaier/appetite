import React, { useMemo, useState } from "react";
import type { Recipe } from "../../types";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface AddFromRecipeModalProps {
  visible: boolean;
  onClose: () => void;
  onAddFromRecipe: (recipeId: string) => void;
  availableRecipes: Recipe[];
  loading: boolean;
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
    if (!visible) return;
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
    if (!search.trim()) return availableRecipes;
    return availableRecipes.filter((r) =>
      r.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [availableRecipes, search]);

  if (!visible) return null;
  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center">
      <Card className="mx-auto max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row justify-between items-center pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">
            Add Ingredients from Recipe
          </CardTitle>
          <Button variant="ghost" onClick={onClose} className="ml-auto">
            Close
          </Button>
        </CardHeader>
        <CardContent>
          <input
            type="text"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 mb-4 w-full text-sm rounded border"
            autoFocus
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
                      key={recipe.id}
                      onClick={() => onAddFromRecipe(recipe.id)}
                      onMouseEnter={prefetchRecipeDetailModal}
                      onFocus={prefetchRecipeDetailModal}
                      className="justify-start w-full"
                    >
                      {recipe.title}
                    </Button>
                  ))}
                  {filteredRecipes.length > visibleCount && (
                    <Button
                      variant="outline"
                      className="mt-2 w-full"
                      onClick={() => setVisibleCount((c) => c + 10)}
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
