import { Clock, Package, Search, TrendingUp } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

interface Suggestion {
  category?: string;
  frequency?: number;
  id: string;
  name: string;
  type: "history" | "common" | "brand";
}

interface AutocompleteInputProps {
  className?: string;
  disabled?: boolean;
  id?: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: Suggestion) => void;
  placeholder?: string;
  userHistory?: string[];
  value: string;
}

// Common ingredients database
const COMMON_INGREDIENTS = [
  { name: "Apple", category: "Fruits" },
  { name: "Banana", category: "Fruits" },
  { name: "Orange", category: "Fruits" },
  { name: "Tomato", category: "Vegetables" },
  { name: "Onion", category: "Vegetables" },
  { name: "Garlic", category: "Vegetables" },
  { name: "Carrot", category: "Vegetables" },
  { name: "Potato", category: "Vegetables" },
  { name: "Broccoli", category: "Vegetables" },
  { name: "Spinach", category: "Vegetables" },
  { name: "Chicken Breast", category: "Meat" },
  { name: "Ground Beef", category: "Meat" },
  { name: "Salmon", category: "Meat" },
  { name: "Eggs", category: "Dairy" },
  { name: "Milk", category: "Dairy" },
  { name: "Cheese", category: "Dairy" },
  { name: "Butter", category: "Dairy" },
  { name: "Yogurt", category: "Dairy" },
  { name: "Rice", category: "Grains" },
  { name: "Pasta", category: "Grains" },
  { name: "Bread", category: "Grains" },
  { name: "Flour", category: "Grains" },
  { name: "Olive Oil", category: "Condiments" },
  { name: "Salt", category: "Spices" },
  { name: "Black Pepper", category: "Spices" },
  { name: "Basil", category: "Spices" },
  { name: "Oregano", category: "Spices" },
];

// Brand and product variations
const BRAND_PRODUCTS = [
  { name: "Heinz Ketchup", category: "Condiments" },
  { name: "Hellmann's Mayonnaise", category: "Condiments" },
  { name: "Philadelphia Cream Cheese", category: "Dairy" },
  { name: "Barilla Pasta", category: "Grains" },
  { name: "Uncle Ben's Rice", category: "Grains" },
  { name: "Hunt's Tomato Sauce", category: "Condiments" },
];

export function AutocompleteInput({
  id,
  value,
  onChange,
  onSelect,
  placeholder = "Enter ingredient name...",
  userHistory = [],
  className,
  disabled = false,
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Generate suggestions based on input
  useEffect(() => {
    if (!value.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const query = value.toLowerCase().trim();
    const newSuggestions: Suggestion[] = [];

    // Add user history suggestions
    const historySuggestions = userHistory
      .filter((item) => item.toLowerCase().includes(query))
      .slice(0, 3)
      .map((item, index) => ({
        id: `history-${index}`,
        name: item,
        type: "history" as const,
        frequency: userHistory.filter((h) => h === item).length,
      }));

    // Add common ingredient suggestions
    const commonSuggestions = COMMON_INGREDIENTS.filter((item) =>
      item.name.toLowerCase().includes(query)
    )
      .slice(0, 5)
      .map((item, index) => ({
        id: `common-${index}`,
        name: item.name,
        type: "common" as const,
        category: item.category,
      }));

    // Add brand product suggestions
    const brandSuggestions = BRAND_PRODUCTS.filter((item) =>
      item.name.toLowerCase().includes(query)
    )
      .slice(0, 3)
      .map((item, index) => ({
        id: `brand-${index}`,
        name: item.name,
        type: "brand" as const,
        category: item.category,
      }));

    // Combine and prioritize suggestions
    newSuggestions.push(...historySuggestions);
    newSuggestions.push(...commonSuggestions);
    newSuggestions.push(...brandSuggestions);

    // Remove duplicates and limit total suggestions
    const uniqueSuggestions = newSuggestions
      .filter(
        (suggestion, index, self) =>
          self.findIndex(
            (s) => s.name.toLowerCase() === suggestion.name.toLowerCase()
          ) === index
      )
      .slice(0, 8);

    setSuggestions(uniqueSuggestions);
    setIsOpen(uniqueSuggestions.length > 0);
    setSelectedIndex(-1);
  }, [value, userHistory]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    onChange(suggestion.name);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelect?.(suggestion);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "history":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "common":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "brand":
        return <Package className="h-4 w-4 text-purple-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSuggestionLabel = (type: string) => {
    switch (type) {
      case "history":
        return "Recent";
      case "common":
        return "Popular";
      case "brand":
        return "Brand";
      default:
        return "";
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
        <input
          className={cn(
            "w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          disabled={disabled}
          id={id}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() =>
            value.trim() &&
            setSuggestions((suggestions) =>
              suggestions.length > 0 ? suggestions : []
            )
          }
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          ref={inputRef}
          type="text"
          value={value}
        />
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          <ul className="py-1" ref={listRef}>
            {suggestions.map((suggestion, index) => (
              <li key={suggestion.id}>
                <button
                  className={cn(
                    "w-full px-3 py-2 text-left transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-hidden",
                    selectedIndex === index && "bg-gray-50"
                  )}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  type="button"
                >
                  <div className="flex items-center space-x-3">
                    {getSuggestionIcon(suggestion.type)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="truncate font-medium text-gray-900">
                          {suggestion.name}
                        </span>
                        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-gray-500 text-xs">
                          {getSuggestionLabel(suggestion.type)}
                        </span>
                      </div>
                      {suggestion.category && (
                        <div className="mt-0.5 text-gray-500 text-xs">
                          {suggestion.category}
                          {suggestion.frequency && suggestion.frequency > 1 && (
                            <span className="ml-2">
                              • Used {suggestion.frequency} times
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
