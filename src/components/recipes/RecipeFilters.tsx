import { Filter, Search, Sparkles } from "lucide-react";
import type React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface RecipeFiltersProps {
  onDifficultyChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSortKeyChange: (value: string) => void;
  onToggleCanCook: () => void;
  searchTerm: string;
  selectedDifficulty: string;
  showCanCookOnly: boolean;
  sortKey: string;
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
}) => (
  <div className="flex flex-col space-y-3 lg:flex-row lg:gap-4 lg:space-y-0">
    <div className="relative flex-1">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
      <Input
        className="pl-10 text-sm sm:text-base"
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search recipes..."
        value={searchTerm}
      />
    </div>
    <div className="flex flex-col items-stretch space-y-3 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 shrink-0 text-gray-600" />
        <select
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 sm:flex-none"
          onChange={(e) => onDifficultyChange(e.target.value)}
          value={selectedDifficulty}
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>
      <div className="flex items-center space-x-2">
        <label className="text-gray-600 text-sm" htmlFor="sort">
          Sort by:
        </label>
        <select
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
          id="sort"
          onChange={(e) => onSortKeyChange(e.target.value)}
          value={sortKey}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <Button
        className="flex items-center justify-center space-x-2 text-sm sm:text-base"
        onClick={onToggleCanCook}
        variant={showCanCookOnly ? "default" : "outline"}
      >
        <Sparkles className="h-4 w-4" />
        <span>Can Cook</span>
      </Button>
    </div>
  </div>
);
