import { ChefHat, X } from "lucide-react";
import React, { useCallback, useEffect, useId, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { recipeService } from "../../lib/database";
import type { Leftover, Recipe } from "../../types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface LeftoverFormProps {
  leftover?: Leftover;
  onSubmit: (
    data: Omit<Leftover, "id" | "created_at" | "updated_at">,
  ) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
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
    if (!showRecipeSelector) return;
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
    if (!user) return;

    await onSubmit({
      user_id: user.id,
      name: formData.name,
      quantity: parseFloat(formData.quantity) || 1,
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
    (r) => r.id === formData.source_recipe_id,
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4" role="form">
      <div className="grid grid-cols-1 gap-4">
        {/* Recipe Selection */}
        <div>
          <label className="block mb-2 text-sm font-medium text-secondary-700">
            Source Recipe (Optional)
          </label>
          {selectedRecipe ? (
            <div className="flex items-center p-3 space-x-2 bg-blue-50 rounded-lg border border-blue-200">
              <ChefHat className="w-4 h-4 text-blue-600" />
              <span className="flex-1 text-sm font-medium text-blue-900">
                {selectedRecipe.title}
              </span>
              <button
                type="button"
                onClick={clearRecipe}
                className="p-1 text-blue-600 rounded hover:text-blue-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRecipeSelector(true)}
              className="justify-start w-full"
            >
              <ChefHat className="mr-2 w-4 h-4" />
              Select Recipe
            </Button>
          )}
        </div>

        {/* Recipe Selector Modal */}
        {showRecipeSelector && (
          <div className="flex fixed inset-0 z-50 justify-center items-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[70vh] overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">Select Recipe</h3>
                <button
                  onClick={() => setShowRecipeSelector(false)}
                  className="p-1 text-gray-400 rounded hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[50vh] p-4">
                <div className="space-y-2">
                  {recipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      type="button"
                      onClick={() => selectRecipe(recipe)}
                      className="p-3 w-full text-left rounded-lg border border-gray-200 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            recipe.image_url ||
                            "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
                          }
                          alt={recipe.title}
                          className="object-cover w-12 h-12 rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {recipe.title}
                          </h4>
                          <p className="text-sm text-gray-600 truncate">
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
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="e.g., Spaghetti Carbonara (Leftovers)"
        />

        {/* Quantity and Unit */}
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              label="Quantity"
              type="number"
              step="0.1"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              required
            />
          </div>
          <div className="w-24">
            <label
              htmlFor={unitSelectId}
              className="block mb-1 text-sm font-medium text-secondary-700"
            >
              Unit
            </label>
            <select
              id={unitSelectId}
              value={formData.unit}
              onChange={(e) =>
                setFormData({ ...formData, unit: e.target.value })
              }
              className="px-2 w-full h-10 text-sm rounded-lg border border-secondary-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
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
          type="date"
          value={formData.expiration_date}
          onChange={(e) =>
            setFormData({ ...formData, expiration_date: e.target.value })
          }
          min={new Date().toISOString().split("T")[0]}
        />

        {/* Notes */}
        <div>
          <label className="block mb-1 text-sm font-medium text-secondary-700">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Any additional notes about the leftovers..."
            className="px-3 py-2 w-full h-20 text-sm rounded-lg border resize-none border-secondary-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        <Button
          type="submit"
          disabled={loading}
          className="text-sm sm:text-base"
        >
          {loading
            ? "Saving..."
            : leftover
              ? "Update Leftover"
              : "Add Leftover"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="text-sm sm:text-base"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
