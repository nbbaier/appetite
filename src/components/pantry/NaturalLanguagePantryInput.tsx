import { Plus, Wand2, X } from "lucide-react";
import React, { useState } from "react";
import { useNotification } from "../../contexts/NotificationContext";
import { handleApiError } from "../../lib/errorUtils";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

const CATEGORIES = [
  "Vegetables",
  "Fruits",
  "Meat",
  "Dairy",
  "Grains",
  "Spices",
  "Condiments",
  "Other",
];

const UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "cups",
  "tbsp",
  "tsp",
  "pieces",
  "cans",
  "bottles",
];

export type IngredientLike = {
  name: string;
  quantity: number;
  unit: string;
  category: string;
};

interface NaturalLanguagePantryInputProps {
  onAddIngredients: (ingredients: IngredientLike[]) => Promise<void> | void;
  disabled?: boolean;
}

function NaturalLanguagePantryInputRaw({
  onAddIngredients,
  disabled,
}: NaturalLanguagePantryInputProps) {
  const [showInput, setShowInput] = useState(false);
  const [naturalLanguageText, setNaturalLanguageText] = useState("");
  const [parsedIngredients, setParsedIngredients] = useState<IngredientLike[]>(
    [],
  );
  const [isParsingText, setIsParsingText] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useNotification();

  const resetForm = () => {
    setNaturalLanguageText("");
    setParsedIngredients([]);
    setShowInput(false);
    setError(null);
  };

  const parseNaturalLanguageText = async () => {
    if (!naturalLanguageText.trim()) return;
    setIsParsingText(true);
    setError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-ingredients`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: naturalLanguageText.trim() }),
        },
      );
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setParsedIngredients(data.ingredients || []);
    } catch (err: unknown) {
      setError(handleApiError(err));
      notify(handleApiError(err), { type: "error" });
      setParsedIngredients([]);
    } finally {
      setIsParsingText(false);
    }
  };

  const updateParsedIngredient = (
    index: number,
    field: keyof IngredientLike,
    value: string | number,
  ) => {
    setParsedIngredients((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const removeParsedIngredient = (index: number) => {
    setParsedIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddAll = async () => {
    if (parsedIngredients.length === 0) return;
    setIsAdding(true);
    setError(null);
    try {
      await onAddIngredients(parsedIngredients);
      resetForm();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to add ingredients.");
      } else {
        setError("Failed to add ingredients.");
      }
      notify(handleApiError(err), { type: "error" });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div>
      {!showInput && (
        <Button onClick={() => setShowInput(true)} disabled={disabled}>
          <Wand2 className="mr-2 w-4 h-4" /> Add Ingredients from Text
        </Button>
      )}
      {showInput && (
        <Card className="mt-4">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Wand2 className="w-5 h-5" />
              <span>Add Ingredients from Text</span>
            </CardTitle>
            <CardDescription>
              Describe your ingredients in natural language (e.g., "3 apples,
              1kg flour, 2 cans of tuna")
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="mb-2 text-sm font-medium text-red-600">
                {error}
              </div>
            )}
            <div>
              <label className="block mb-2 text-sm font-medium text-secondary-700">
                Describe your ingredients:
              </label>
              <textarea
                value={naturalLanguageText}
                onChange={(e) => setNaturalLanguageText(e.target.value)}
                placeholder="Example: 3 apples, 1kg flour, 2 cans of tuna, 500ml olive oil, 1 liter milk"
                className="px-3 py-2 w-full h-24 text-sm rounded-lg border resize-none border-secondary-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                disabled={isParsingText || isAdding}
              />
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button
                onClick={parseNaturalLanguageText}
                disabled={
                  !naturalLanguageText.trim() || isParsingText || isAdding
                }
                className="flex justify-center items-center space-x-2"
              >
                <Wand2 className="w-4 h-4" />
                <span>{isParsingText ? "Parsing..." : "Parse Text"}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isParsingText || isAdding}
              >
                Cancel
              </Button>
            </div>
            {parsedIngredients.length > 0 && (
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-secondary-900">
                    Parsed Ingredients ({parsedIngredients.length})
                  </h3>
                  <Button
                    onClick={handleAddAll}
                    disabled={isAdding}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isAdding ? "Adding..." : "Add All to Pantry"}</span>
                  </Button>
                </div>
                <div className="space-y-3">
                  {parsedIngredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border bg-secondary-50 border-secondary-200"
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        <div>
                          <label className="block mb-1 text-xs font-medium text-secondary-700">
                            Name
                          </label>
                          <input
                            type="text"
                            value={ingredient.name}
                            onChange={(e) =>
                              updateParsedIngredient(
                                index,
                                "name",
                                e.target.value,
                              )
                            }
                            className="px-2 py-1 w-full text-sm rounded-md border border-secondary-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-xs font-medium text-secondary-700">
                            Quantity
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={ingredient.quantity}
                            onChange={(e) =>
                              updateParsedIngredient(
                                index,
                                "quantity",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="px-2 py-1 w-full text-sm rounded-md border border-secondary-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-xs font-medium text-secondary-700">
                            Unit
                          </label>
                          <select
                            value={ingredient.unit}
                            onChange={(e) =>
                              updateParsedIngredient(
                                index,
                                "unit",
                                e.target.value,
                              )
                            }
                            className="px-2 py-1 w-full text-sm rounded-md border border-secondary-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
                          >
                            {UNITS.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block mb-1 text-xs font-medium text-secondary-700">
                            Category
                          </label>
                          <div className="flex items-center space-x-2">
                            <select
                              value={ingredient.category}
                              onChange={(e) =>
                                updateParsedIngredient(
                                  index,
                                  "category",
                                  e.target.value,
                                )
                              }
                              className="flex-1 px-2 py-1 text-sm rounded-md border border-secondary-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
                            >
                              {CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => removeParsedIngredient(index)}
                              className="p-1 rounded text-secondary-400 hover:text-red-600"
                              type="button"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export const NaturalLanguagePantryInput = React.memo(
  NaturalLanguagePantryInputRaw,
);
