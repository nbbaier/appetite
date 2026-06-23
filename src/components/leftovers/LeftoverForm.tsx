import { ChefHat, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useId, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { recipeService } from "../../lib/database";
import type { Leftover, Recipe } from "../../types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface LeftoverFormProps {
  leftover?: Leftover;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (
    data: Omit<Leftover, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
}

const UNITS = [
  "portions",
  "servings",
  "cups",
  "g",
  "kg",
  "ml",
  "l",
  "pieces",
  "slices",
];

export function LeftoverForm({
  leftover,
  onSubmit,
  onCancel,
  loading = false,
}: LeftoverFormProps) {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
  const [formData, setFormData] = useState({
    name: leftover?.name || "",
    quantity: leftover?.quantity?.toString() || "1",
    unit: leftover?.unit || "portions",
    expiration_date: leftover?.expiration_date || "",
    source_recipe_id: leftover?.source_recipe_id || "",
    notes: leftover?.notes || "",
  });
  const unitSelectId = useId();
  const notesId = useId();

  const loadRecipes = useCallback(async () => {
    try {
      const data = await recipeService.getAll();
      setRecipes(data);
    } catch (error) {
      console.error("Error loading recipes:", error);
    }
  }, []);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  useEffect(() => {
    if (!showRecipeSelector) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowRecipeSelector(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showRecipeSelector]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      return;
    }

    await onSubmit({
      user_id: user.id,
      name: formData.name,
      quantity: Number.parseFloat(formData.quantity) || 1,
      unit: formData.unit,
      expiration_date: formData.expiration_date || undefined,
      source_recipe_id: formData.source_recipe_id || undefined,
      notes: formData.notes,
    });
  };

  const selectRecipe = (recipe: Recipe) => {
    setFormData({
      ...formData,
      name: `${recipe.title} (Leftovers)`,
      source_recipe_id: recipe.id,
    });
    setShowRecipeSelector(false);
  };

  const clearRecipe = () => {
    setFormData({
      ...formData,
      source_recipe_id: "",
    });
  };

  const selectedRecipe = recipes.find(
    (r) => r.id === formData.source_recipe_id
  );

  return (
    <form
      aria-label={leftover ? "Edit leftover" : "Add leftover"}
      className="space-y-4"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 gap-4">
        {/* Recipe Selection */}
        <div>
          <p className="mb-2 block font-medium text-secondary-700 text-sm">
            Source Recipe (Optional)
          </p>
          {selectedRecipe ? (
            <div className="flex items-center space-x-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <ChefHat className="h-4 w-4 text-blue-600" />
              <span className="flex-1 font-medium text-blue-900 text-sm">
                {selectedRecipe.title}
              </span>
              <button
                className="rounded p-1 text-blue-600 hover:text-blue-800"
                onClick={clearRecipe}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Button
              className="w-full justify-start"
              onClick={() => setShowRecipeSelector(true)}
              type="button"
              variant="outline"
            >
              <ChefHat className="mr-2 h-4 w-4" />
              Select Recipe
            </Button>
          )}
        </div>

        {/* Recipe Selector Modal */}
        {showRecipeSelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="max-h-[70vh] w-full max-w-md overflow-hidden rounded-lg bg-white">
              <div className="flex items-center justify-between border-b p-4">
                <h3 className="font-semibold text-lg">Select Recipe</h3>
                <button
                  className="rounded p-1 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowRecipeSelector(false)}
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="max-h-[50vh] overflow-y-auto p-4">
                <div className="space-y-2">
                  {recipes.map((recipe) => (
                    <button
                      className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50"
                      key={recipe.id}
                      onClick={() => selectRecipe(recipe)}
                      type="button"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          alt={recipe.title}
                          className="h-12 w-12 rounded-lg object-cover"
                          height={48}
                          src={
                            recipe.image_url ||
                            "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
                          }
                          width={48}
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate font-medium text-gray-900">
                            {recipe.title}
                          </h4>
                          <p className="truncate text-gray-600 text-sm">
                            {recipe.cuisine_type} • {recipe.difficulty}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leftover Name */}
        <Input
          label="Leftover Name"
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Spaghetti Carbonara (Leftovers)"
          required
          value={formData.name}
        />

        {/* Quantity and Unit */}
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              label="Quantity"
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              required
              step="0.1"
              type="number"
              value={formData.quantity}
            />
          </div>
          <div className="w-24">
            <label
              className="mb-1 block font-medium text-secondary-700 text-sm"
              htmlFor={unitSelectId}
            >
              Unit
            </label>
            <select
              className="h-10 w-full rounded-lg border border-secondary-300 px-2 text-sm focus:border-primary-500 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
              id={unitSelectId}
              onChange={(e) =>
                setFormData({ ...formData, unit: e.target.value })
              }
              value={formData.unit}
            >
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Expiration Date */}
        <Input
          label="Expiration Date (Optional)"
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) =>
            setFormData({ ...formData, expiration_date: e.target.value })
          }
          type="date"
          value={formData.expiration_date}
        />

        {/* Notes */}
        <div>
          <label
            className="mb-1 block font-medium text-secondary-700 text-sm"
            htmlFor={notesId}
          >
            Notes (Optional)
          </label>
          <textarea
            className="h-20 w-full resize-none rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
            id={notesId}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Any additional notes about the leftovers..."
            value={formData.notes}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
        <Button
          className="text-sm sm:text-base"
          disabled={loading}
          type="submit"
        >
          {loading
            ? "Saving..."
            : leftover
              ? "Update Leftover"
              : "Add Leftover"}
        </Button>
        <Button
          className="text-sm sm:text-base"
          disabled={loading}
          onClick={onCancel}
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
