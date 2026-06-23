import { Check, ChefHat, Package, Plus } from "lucide-react";
import type React from "react";
import type { ShoppingList } from "../../types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

interface ListHeaderWithStatsProps {
  onAddFromRecipe: () => void;
  onAddItem: () => void;
  purchasedCount: number;
  selectedList: ShoppingList;
  totalCount: number;
}

export const ListHeaderWithStats: React.FC<ListHeaderWithStatsProps> = ({
  selectedList,
  totalCount,
  purchasedCount,
  onAddFromRecipe,
  onAddItem,
}) => {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-lg text-secondary-900 sm:text-xl">
              {selectedList.name}
            </h2>
            {selectedList.description && (
              <p className="text-secondary-600 text-sm">
                {selectedList.description}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Package className="h-4 w-4 text-secondary-600" />
              <span>{totalCount} items</span>
            </div>
            <div className="flex items-center space-x-1">
              <Check className="h-4 w-4 text-green-600" />
              <span>{purchasedCount} purchased</span>
            </div>
            {totalCount > 0 && (
              <Badge variant="secondary">
                {Math.round((purchasedCount / totalCount) * 100)}% complete
              </Badge>
            )}
          </div>
        </div>
        {/* Quick Actions */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button
            className="flex items-center justify-center space-x-2 text-sm"
            onClick={onAddFromRecipe}
            variant="outline"
          >
            <ChefHat className="h-4 w-4" />
            <span>Add from Recipe</span>
          </Button>
          <Button
            className="flex items-center justify-center space-x-2 text-sm"
            onClick={onAddItem}
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            <span>Add Item</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
