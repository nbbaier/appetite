import { Check, Edit3, Trash2 } from "lucide-react";
import React from "react";
import { List, type RowComponentProps } from "react-window";
import type { ShoppingListItem } from "../../types";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

interface ShoppingListItemsProps {
  items: ShoppingListItem[];
  loading?: boolean;
  onDelete: (itemId: string) => void;
  onEdit: (item: ShoppingListItem) => void;
  onTogglePurchased: (itemId: string, isPurchased: boolean) => void;
}

interface VirtualizedShoppingRowData {
  items: ShoppingListItem[];
  onDelete: (itemId: string) => void;
  onEdit: (item: ShoppingListItem) => void;
  onTogglePurchased: (itemId: string, isPurchased: boolean) => void;
}

const SHOPPING_LIST_SKELETON_KEYS = [
  "shopping-list-skeleton-1",
  "shopping-list-skeleton-2",
  "shopping-list-skeleton-3",
  "shopping-list-skeleton-4",
  "shopping-list-skeleton-5",
  "shopping-list-skeleton-6",
  "shopping-list-skeleton-7",
  "shopping-list-skeleton-8",
];

const VirtualizedShoppingRow = ({
  ariaAttributes,
  index,
  style,
  items,
  onEdit,
  onDelete,
  onTogglePurchased,
}: RowComponentProps<VirtualizedShoppingRowData>) => {
  const item = items[index];

  if (!item) {
    return <div aria-hidden="true" style={style} />;
  }

  return (
    <div style={style} {...ariaAttributes}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center space-x-3">
            <button
              className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-secondary-300 transition-colors hover:border-primary sm:h-6 sm:w-6"
              onClick={() => onTogglePurchased(item.id, item.is_purchased)}
              type="button"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <div className="min-w-0 flex-1">
                  <h4 className="truncate font-medium text-secondary-900 text-sm sm:text-base">
                    {item.name}
                  </h4>
                  <p className="text-secondary-600 text-xs sm:text-sm">
                    {item.quantity} {item.unit}
                    {item.notes && ` • ${item.notes}`}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center space-x-2">
                  <Badge className="text-xs" variant="outline">
                    {item.category}
                  </Badge>
                  <button
                    className="rounded p-1.5 text-secondary-400 hover:text-secondary-600"
                    onClick={() => onEdit(item)}
                    type="button"
                  >
                    <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                  <button
                    className="rounded p-1.5 text-secondary-400 hover:text-red-600"
                    onClick={() => onDelete(item.id)}
                    type="button"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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
        {SHOPPING_LIST_SKELETON_KEYS.map((key) => (
          <Card className="animate-pulse bg-gray-100" key={key}>
            <CardContent className="p-3 sm:p-4">
              <div className="mb-2 h-4 w-1/3 rounded bg-gray-300" />
              <div className="mb-2 h-3 w-2/3 rounded bg-gray-200" />
              <div className="h-3 w-1/4 rounded bg-gray-200" />
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
    return (
      <List
        rowComponent={VirtualizedShoppingRow}
        rowCount={items.length}
        rowHeight={120}
        rowProps={{ items, onEdit, onDelete, onTogglePurchased }}
        style={{ height: 600, width: "100%" }}
      />
    );
  }

  // Fallback to normal rendering for small lists
  return (
    <div className="space-y-3">
      {/* Unpurchased Items */}
      <div className="grid grid-cols-1 gap-2 sm:gap-3">
        {unpurchased.map((item) => (
          <Card className="transition-shadow hover:shadow-md" key={item.id}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-3">
                <button
                  className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-secondary-300 transition-colors hover:border-primary sm:h-6 sm:w-6"
                  onClick={() => onTogglePurchased(item.id, item.is_purchased)}
                  type="button"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-medium text-secondary-900 text-sm sm:text-base">
                        {item.name}
                      </h4>
                      <p className="text-secondary-600 text-xs sm:text-sm">
                        {item.quantity} {item.unit}
                        {item.notes && ` • ${item.notes}`}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center space-x-2">
                      <Badge className="text-xs" variant="outline">
                        {item.category}
                      </Badge>
                      <button
                        className="rounded p-1.5 text-secondary-400 hover:text-secondary-600"
                        onClick={() => onEdit(item)}
                        type="button"
                      >
                        <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        className="rounded p-1.5 text-secondary-400 hover:text-red-600"
                        onClick={() => onDelete(item.id)}
                        type="button"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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
          <h3 className="mb-3 flex items-center font-medium text-secondary-600 text-sm">
            <Check className="mr-1 h-4 w-4" />
            Purchased ({purchased.length})
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            {purchased.map((item) => (
              <Card className="opacity-60" key={item.id}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center space-x-3">
                    <button
                      className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 border-green-500 bg-green-500 transition-colors hover:bg-green-600 sm:h-6 sm:w-6"
                      onClick={() =>
                        onTogglePurchased(item.id, item.is_purchased)
                      }
                      type="button"
                    >
                      <Check className="h-3 w-3 text-white sm:h-4 sm:w-4" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate font-medium text-secondary-900 text-sm line-through sm:text-base">
                            {item.name}
                          </h4>
                          <p className="text-secondary-500 text-xs sm:text-sm">
                            {item.quantity} {item.unit}
                            {item.notes && ` • ${item.notes}`}
                          </p>
                        </div>
                        <button
                          className="flex-shrink-0 rounded p-1.5 text-secondary-400 hover:text-red-600"
                          onClick={() => onDelete(item.id)}
                          type="button"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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
