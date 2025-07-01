import { Filter, Search, Sparkles } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface RecipeFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (value: string) => void;
  showCanCookOnly: boolean;
  onToggleCanCook: () => void;
  sortKey: string;
  onSortKeyChange: (value: string) => void;
}

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "cook_time_asc", label: "Cooking Time (Shortest)" },
  { value: "cook_time_desc", label: "Cooking Time (Longest)" },
  { value: "difficulty_asc", label: "Difficulty (Easy → Hard)" },
  { value: "difficulty_desc", label: "Difficulty (Hard → Easy)" },
];

export const RecipeFilters: React.FC<RecipeFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedDifficulty,
  onDifficultyChange,
  showCanCookOnly,
  onToggleCanCook,
  sortKey,
  onSortKeyChange,
}) => {
  return (
    <div className="flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
        <Input
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 text-sm sm:text-base"
        />
      </div>
      <div className="flex flex-col items-stretch space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="flex-shrink-0 w-4 h-4 text-gray-600" />
          <select
            value={selectedDifficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="flex-1 px-3 py-2 text-sm rounded-md border border-gray-300 sm:flex-none focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="sort" className="text-sm text-gray-600">
            Sort by:
          </label>
          <select
            id="sort"
            value={sortKey}
            onChange={(e) => onSortKeyChange(e.target.value)}
            className="px-3 py-2 text-sm rounded-md border border-gray-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <Button
          variant={showCanCookOnly ? "default" : "outline"}
          onClick={onToggleCanCook}
          className="flex justify-center items-center space-x-2 text-sm sm:text-base"
        >
          <Sparkles className="w-4 h-4" />
          <span>Can Cook</span>
        </Button>
      </div>
    </div>
  );
};
