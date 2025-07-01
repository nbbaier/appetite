import { Check, Edit3, Trash2 } from "lucide-react";
import React from "react";
import { FixedSizeList as List } from "react-window";
import type { ShoppingListItem } from "../../types";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

interface ShoppingListItemsProps {
  items: ShoppingListItem[];
  onEdit: (item: ShoppingListItem) => void;
  onDelete: (itemId: string) => void;
  onTogglePurchased: (itemId: string, isPurchased: boolean) => void;
  loading?: boolean;
}

const ShoppingListItemsComponent: React.FC<ShoppingListItemsProps> = ({
  items,
  onEdit,
  onDelete,
  onTogglePurchased,
  loading = false,
}) => {
  if (loading) {
    // Render 8 skeleton cards
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="bg-gray-100 animate-pulse">
            <CardContent className="p-3 sm:p-4">
              <div className="mb-2 w-1/3 h-4 bg-gray-300 rounded" />
              <div className="mb-2 w-2/3 h-3 bg-gray-200 rounded" />
              <div className="w-1/4 h-3 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const unpurchased = items.filter((item) => !item.is_purchased);
  const purchased = items.filter((item) => item.is_purchased);

  // Virtualize if list is long
  if (items.length > 30) {
    const Row: React.FC<{ index: number; style: React.CSSProperties }> = ({
      index,
      style,
    }) => {
      const item = items[index];
      return (
        <div style={style} key={item.id}>
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onTogglePurchased(item.id, item.is_purchased)}
                  className="flex-shrink-0 w-5 h-5 rounded-full border-2 transition-colors sm:w-6 sm:h-6 border-secondary-300 hover:border-primary"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate text-secondary-900 sm:text-base">
                        {item.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-secondary-600">
                        {item.quantity} {item.unit}
                        {item.notes && ` • ${item.notes}`}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-secondary-400 hover:text-secondary-600 rounded"
                      >
                        <Edit3 className="w-3 h-3 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 text-secondary-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-3 h-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    };
    return (
      <List height={600} itemCount={items.length} itemSize={120} width={"100%"}>
        {Row}
      </List>
    );
  }
  // Fallback to normal rendering for small lists
  return (
    <div className="space-y-3">
      {/* Unpurchased Items */}
      <div className="grid grid-cols-1 gap-2 sm:gap-3">
        {unpurchased.map((item) => (
          <Card key={item.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onTogglePurchased(item.id, item.is_purchased)}
                  className="flex-shrink-0 w-5 h-5 rounded-full border-2 transition-colors sm:w-6 sm:h-6 border-secondary-300 hover:border-primary"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate text-secondary-900 sm:text-base">
                        {item.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-secondary-600">
                        {item.quantity} {item.unit}
                        {item.notes && ` • ${item.notes}`}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-secondary-400 hover:text-secondary-600 rounded"
                      >
                        <Edit3 className="w-3 h-3 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 text-secondary-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-3 h-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Purchased Items */}
      {purchased.length > 0 && (
        <div className="mt-6">
          <h3 className="flex items-center mb-3 text-sm font-medium text-secondary-600">
            <Check className="mr-1 w-4 h-4" />
            Purchased ({purchased.length})
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            {purchased.map((item) => (
              <Card key={item.id} className="opacity-60">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() =>
                        onTogglePurchased(item.id, item.is_purchased)
                      }
                      className="flex flex-shrink-0 justify-center items-center w-5 h-5 bg-green-500 rounded-full border-2 border-green-500 transition-colors sm:w-6 sm:h-6 hover:bg-green-600"
                    >
                      <Check className="w-3 h-3 text-white sm:h-4 sm:w-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium line-through truncate text-secondary-900 sm:text-base">
                            {item.name}
                          </h4>
                          <p className="text-xs sm:text-sm text-secondary-500">
                            {item.quantity} {item.unit}
                            {item.notes && ` • ${item.notes}`}
                          </p>
                        </div>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-1.5 text-secondary-400 hover:text-red-600 rounded flex-shrink-0"
                        >
                          <Trash2 className="w-3 h-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const ShoppingListItems = React.memo(ShoppingListItemsComponent);
