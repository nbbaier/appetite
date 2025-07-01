// biome-ignore-all assist/source/organizeImports: needed for testing
// @ts-nocheck
import React from "react";
import { AlertCircle, Check, Wand2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface SmartCategorySelectorProps {
  ingredientName: string;
  currentCategory: string;
  onCategoryChange: (category: string) => void;
  userHistory?: Array<{ name: string; category: string }>;
  disabled?: boolean;
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
    if (!ingredientName.trim() || isAnalyzing) return;

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
        },
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
    <div className="flex flex-col w-full">
      <label className="block mb-1 text-sm font-medium text-secondary-700">
        Category
      </label>
      <div className="flex flex-row gap-2 w-full">
        <select
          value={currentCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          disabled={disabled}
          className="flex-1 px-3 h-10 text-sm rounded-lg border border-secondary-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="outline"
          size={undefined}
          onClick={analyzeCategory}
          disabled={!ingredientName.trim() || isAnalyzing || disabled}
          className="flex items-center px-3 h-10 text-sm border shadow-none border-secondary-300"
          title="Suggest category based on ingredient name"
        >
          {isAnalyzing ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
            </svg>
          ) : (
            <Wand2 className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Smart Suggestion Banner */}
      {showSuggestion &&
        suggestion &&
        suggestion.category !== currentCategory && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center mb-1 space-x-2">
                  <span className="text-sm font-medium text-blue-900">
                    Smart suggestion:
                  </span>
                  <Badge
                    variant="outline"
                    className="text-blue-800 bg-blue-100 border-blue-300"
                  >
                    {suggestion.category}
                  </Badge>
                  <span className="text-xs text-blue-600">
                    {Math.round(suggestion.confidence * 100)}% confident
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={applySuggestion}
                    className="h-6 text-xs"
                  >
                    <Check className="mr-1 w-3 h-3" />
                    Apply
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={dismissSuggestion}
                    className="h-6 text-xs"
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
