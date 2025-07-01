import { ShoppingCart, X } from "lucide-react";
import React from "react";
import type { ShoppingList } from "../../types";

interface ShoppingListsTabsProps {
  shoppingLists: ShoppingList[];
  selectedList: ShoppingList | null;
  onSelect: (list: ShoppingList) => void;
  onDelete: (listId: string) => void;
}

export const ShoppingListsTabs: React.FC<ShoppingListsTabsProps> = ({
  shoppingLists,
  selectedList,
  onSelect,
  onDelete,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {shoppingLists.map((list) => (
        <button
          key={list.id}
          onClick={() => onSelect(list)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedList?.id === list.id
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{list.name}</span>
          {selectedList?.id === list.id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(list.id);
              }}
              className="ml-1 p-0.5 hover:bg-primary-foreground/20 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </button>
      ))}
    </div>
  );
};
