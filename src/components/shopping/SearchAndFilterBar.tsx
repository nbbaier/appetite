import { Filter, Search } from "lucide-react";
import type React from "react";
import { Input } from "../ui/input";

interface SearchAndFilterBarProps {
  categories: string[];
  categoryCounts: Record<string, number>;
  onCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchTerm: string;
  selectedCategory: string;
}

export const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  categoryCounts,
}) => (
  <div className="flex flex-col space-y-3 sm:flex-row sm:gap-4 sm:space-y-0">
    <div className="relative flex-1">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-secondary-400" />
      <Input
        className="pl-10 text-sm sm:text-base"
        onChange={onSearchChange}
        placeholder="Search items..."
        value={searchTerm}
      />
    </div>
    <div className="flex items-center space-x-2">
      <Filter className="h-4 w-4 shrink-0 text-secondary-600" />
      <select
        className="flex-1 rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 sm:flex-none"
        onChange={onCategoryChange}
        value={selectedCategory}
      >
        <option value="All">All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category} ({categoryCounts[category] || 0})
          </option>
        ))}
      </select>
    </div>
  </div>
);
