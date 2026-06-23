// biome-ignore-all assist/source/organizeImports: needed for testing
// @ts-nocheck
import React from "react";
import { AlertCircle, Check, Wand2 } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface SmartCategorySelectorProps {
  currentCategory: string;
  disabled?: boolean;
  ingredientName: string;
  onCategoryChange: (category: string) => void;
  userHistory?: Array<{ name: string; category: string }>;
}

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

export function SmartCategorySelectorRaw({
  ingredientName,
  currentCategory,
  onCategoryChange,
  userHistory = [],
  disabled = false,
}: SmartCategorySelectorProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState<{
    category: string;
    confidence: number;
    suggestions?: string[];
  } | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);

  const analyzeCategory = useCallback(async () => {
    if (!ingredientName.trim() || isAnalyzing) {
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/categorize-ingredient`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ingredientName: ingredientName.trim(),
            userHistory: userHistory.slice(-20), // Send recent history for context
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setSuggestion({
        category: data.category,
        confidence: data.confidence,
        suggestions: data.suggestions,
      });

      // Auto-apply if high confidence and different from current
      if (data.confidence > 0.8 && data.category !== currentCategory) {
        setShowSuggestion(true);
      }
    } catch (error) {
      console.error("Error analyzing category:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [ingredientName, isAnalyzing, currentCategory, userHistory]);

  const applySuggestion = () => {
    if (suggestion) {
      onCategoryChange(suggestion.category);
      setShowSuggestion(false);
      setSuggestion(null);
    }
  };

  const dismissSuggestion = () => {
    setShowSuggestion(false);
    setSuggestion(null);
  };

  return (
    <div className="flex w-full flex-col">
      <label
        className="mb-1 block font-medium text-secondary-700 text-sm"
        htmlFor="smart-category-select"
      >
        Category
      </label>
      <div className="flex w-full flex-row gap-2">
        <select
          className="h-10 flex-1 rounded-lg border border-secondary-300 px-3 text-sm focus:border-primary-500 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          id="smart-category-select"
          onChange={(e) => onCategoryChange(e.target.value)}
          value={currentCategory}
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <Button
          aria-label="Smart Suggest"
          className="flex h-10 items-center border border-secondary-300 px-3 text-sm shadow-none"
          disabled={!ingredientName.trim() || isAnalyzing || disabled}
          onClick={analyzeCategory}
          size={undefined}
          title="Suggest category based on ingredient name"
          type="button"
          variant="outline"
        >
          {isAnalyzing ? (
            <svg
              aria-hidden="true"
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                fill="none"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
            </svg>
          ) : (
            <Wand2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Smart Suggestion Banner */}
      {showSuggestion &&
        suggestion &&
        suggestion.category !== currentCategory && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center space-x-2">
                  <span className="font-medium text-blue-900 text-sm">
                    Smart suggestion:
                  </span>
                  <Badge
                    className="border-blue-300 bg-blue-100 text-blue-800"
                    variant="outline"
                  >
                    {suggestion.category}
                  </Badge>
                  <span className="text-blue-600 text-xs">
                    {Math.round(suggestion.confidence * 100)}% confident
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    className="h-6 text-xs"
                    onClick={applySuggestion}
                    size="sm"
                    type="button"
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Apply
                  </Button>
                  <Button
                    className="h-6 text-xs"
                    onClick={dismissSuggestion}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export const SmartCategorySelector = React.memo(SmartCategorySelectorRaw);
