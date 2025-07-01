import { Filter, Search } from "lucide-react";
import React from "react";
import { Input } from "../ui/input";

interface SearchAndFilterBarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedCategory: string;
  onCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  categories: string[];
  categoryCounts: Record<string, number>;
}

export const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  categoryCounts,
}) => {
  return (
    <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-secondary-400" />
        <Input
          placeholder="Search items..."
          value={searchTerm}
          onChange={onSearchChange}
          className="pl-10 text-sm sm:text-base"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Filter className="flex-shrink-0 w-4 h-4 text-secondary-600" />
        <select
          value={selectedCategory}
          onChange={onCategoryChange}
          className="flex-1 px-3 py-2 text-sm rounded-lg border sm:flex-none border-secondary-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
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
};
