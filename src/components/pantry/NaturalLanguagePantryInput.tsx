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

export interface IngredientLike {
  category: string;
  name: string;
  quantity: number;
  unit: string;
}

interface NaturalLanguagePantryInputProps {
  disabled?: boolean;
  onAddIngredients: (ingredients: IngredientLike[]) => Promise<void> | void;
}

function NaturalLanguagePantryInputRaw({
  onAddIngredients,
  disabled,
}: NaturalLanguagePantryInputProps) {
  const [showInput, setShowInput] = useState(false);
  const [naturalLanguageText, setNaturalLanguageText] = useState("");
  const [parsedIngredients, setParsedIngredients] = useState<IngredientLike[]>(
    []
  );
  const [isParsingText, setIsParsingText] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useNotification();
  const naturalLanguageInputId = React.useId();

  const resetForm = () => {
    setNaturalLanguageText("");
    setParsedIngredients([]);
    setShowInput(false);
    setError(null);
  };

  const parseNaturalLanguageText = async () => {
    if (!naturalLanguageText.trim()) {
      return;
    }
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
        }
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
    value: string | number
  ) => {
    setParsedIngredients((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeParsedIngredient = (index: number) => {
    setParsedIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddAll = async () => {
    if (parsedIngredients.length === 0) {
      return;
    }
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
        <Button disabled={disabled} onClick={() => setShowInput(true)}>
          <Wand2 className="mr-2 h-4 w-4" /> Add Ingredients from Text
        </Button>
      )}
      {showInput && (
        <Card className="mt-4">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Wand2 className="h-5 w-5" />
              <span>Add Ingredients from Text</span>
            </CardTitle>
            <CardDescription>
              Describe your ingredients in natural language (e.g., "3 apples,
              1kg flour, 2 cans of tuna")
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="mb-2 font-medium text-red-600 text-sm">
                {error}
              </div>
            )}
            <div>
              <label
                className="mb-2 block font-medium text-secondary-700 text-sm"
                htmlFor={naturalLanguageInputId}
              >
                Describe your ingredients:
              </label>
              <textarea
                className="h-24 w-full resize-none rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                disabled={isParsingText || isAdding}
                id={naturalLanguageInputId}
                onChange={(e) => setNaturalLanguageText(e.target.value)}
                placeholder="Example: 3 apples, 1kg flour, 2 cans of tuna, 500ml olive oil, 1 liter milk"
                value={naturalLanguageText}
              />
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <Button
                className="flex items-center justify-center space-x-2"
                disabled={
                  !naturalLanguageText.trim() || isParsingText || isAdding
                }
                onClick={parseNaturalLanguageText}
              >
                <Wand2 className="h-4 w-4" />
                <span>{isParsingText ? "Parsing..." : "Parse Text"}</span>
              </Button>
              <Button
                disabled={isParsingText || isAdding}
                onClick={resetForm}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
            </div>
            {parsedIngredients.length > 0 && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-lg text-secondary-900">
                    Parsed Ingredients ({parsedIngredients.length})
                  </h3>
                  <Button
                    className="flex items-center space-x-2"
                    disabled={isAdding}
                    onClick={handleAddAll}
                  >
                    <Plus className="h-4 w-4" />
                    <span>{isAdding ? "Adding..." : "Add All to Pantry"}</span>
                  </Button>
                </div>
                <div className="space-y-3">
                  {parsedIngredients.map((ingredient, index) => (
                    <div
                      className="rounded-lg border border-secondary-200 bg-secondary-50 p-4"
                      key={`${ingredient.name}-${ingredient.quantity}-${ingredient.unit}-${ingredient.category}`}
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        <div>
                          <label
                            className="mb-1 block font-medium text-secondary-700 text-xs"
                            htmlFor={`parsed-ingredient-${index}-name`}
                          >
                            Name
                          </label>
                          <input
                            className="w-full rounded-md border border-secondary-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-hidden focus:ring-1 focus:ring-primary-500/20"
                            id={`parsed-ingredient-${index}-name`}
                            onChange={(e) =>
                              updateParsedIngredient(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            type="text"
                            value={ingredient.name}
                          />
                        </div>
                        <div>
                          <label
                            className="mb-1 block font-medium text-secondary-700 text-xs"
                            htmlFor={`parsed-ingredient-${index}-quantity`}
                          >
                            Quantity
                          </label>
                          <input
                            className="w-full rounded-md border border-secondary-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-hidden focus:ring-1 focus:ring-primary-500/20"
                            id={`parsed-ingredient-${index}-quantity`}
                            onChange={(e) =>
                              updateParsedIngredient(
                                index,
                                "quantity",
                                Number.parseFloat(e.target.value) || 0
                              )
                            }
                            step="0.1"
                            type="number"
                            value={ingredient.quantity}
                          />
                        </div>
                        <div>
                          <label
                            className="mb-1 block font-medium text-secondary-700 text-xs"
                            htmlFor={`parsed-ingredient-${index}-unit`}
                          >
                            Unit
                          </label>
                          <select
                            className="w-full rounded-md border border-secondary-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-hidden focus:ring-1 focus:ring-primary-500/20"
                            id={`parsed-ingredient-${index}-unit`}
                            onChange={(e) =>
                              updateParsedIngredient(
                                index,
                                "unit",
                                e.target.value
                              )
                            }
                            value={ingredient.unit}
                          >
                            {UNITS.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label
                            className="mb-1 block font-medium text-secondary-700 text-xs"
                            htmlFor={`parsed-ingredient-${index}-category`}
                          >
                            Category
                          </label>
                          <div className="flex items-center space-x-2">
                            <select
                              className="flex-1 rounded-md border border-secondary-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-hidden focus:ring-1 focus:ring-primary-500/20"
                              id={`parsed-ingredient-${index}-category`}
                              onChange={(e) =>
                                updateParsedIngredient(
                                  index,
                                  "category",
                                  e.target.value
                                )
                              }
                              value={ingredient.category}
                            >
                              {CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                            <button
                              className="rounded p-1 text-secondary-400 hover:text-red-600"
                              onClick={() => removeParsedIngredient(index)}
                              type="button"
                            >
                              <X className="h-4 w-4" />
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
  NaturalLanguagePantryInputRaw
);
