import { ShoppingCart, X } from "lucide-react";
import type React from "react";
import type { ShoppingList } from "../../types";

interface ShoppingListsTabsProps {
  onDelete: (listId: string) => void;
  onSelect: (list: ShoppingList) => void;
  selectedList: ShoppingList | null;
  shoppingLists: ShoppingList[];
}

export const ShoppingListsTabs: React.FC<ShoppingListsTabsProps> = ({
  shoppingLists,
  selectedList,
  onSelect,
  onDelete,
}) => (
  <div className="flex flex-wrap gap-2">
    {shoppingLists.map((list) => (
      <button
        className={`flex items-center space-x-2 rounded-lg px-3 py-2 font-medium text-sm transition-colors ${
          selectedList?.id === list.id
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }`}
        key={list.id}
        onClick={() => onSelect(list)}
        type="button"
      >
        <ShoppingCart className="h-4 w-4" />
        <span>{list.name}</span>
        {selectedList?.id === list.id && (
          <button
            className="ml-1 rounded p-0.5 hover:bg-primary-foreground/20"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(list.id);
            }}
            type="button"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </button>
    ))}
  </div>
);
