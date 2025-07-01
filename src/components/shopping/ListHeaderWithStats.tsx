import { Check, ChefHat, Package, Plus } from "lucide-react";
import React from "react";
import type { ShoppingList } from "../../types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

interface ListHeaderWithStatsProps {
  selectedList: ShoppingList;
  totalCount: number;
  purchasedCount: number;
  onAddFromRecipe: () => void;
  onAddItem: () => void;
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
            <h2 className="text-lg font-semibold sm:text-xl text-secondary-900">
              {selectedList.name}
            </h2>
            {selectedList.description && (
              <p className="text-sm text-secondary-600">
                {selectedList.description}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Package className="w-4 h-4 text-secondary-600" />
              <span>{totalCount} items</span>
            </div>
            <div className="flex items-center space-x-1">
              <Check className="w-4 h-4 text-green-600" />
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
        <div className="flex flex-col gap-2 mt-4 sm:flex-row">
          <Button
            onClick={onAddFromRecipe}
            variant="outline"
            className="flex justify-center items-center space-x-2 text-sm"
          >
            <ChefHat className="w-4 h-4" />
            <span>Add from Recipe</span>
          </Button>
          <Button
            onClick={onAddItem}
            variant="outline"
            className="flex justify-center items-center space-x-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
