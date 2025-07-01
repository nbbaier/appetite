// biome-ignore-all assist/source/organizeImports: needed for testing
// @ts-nocheck
import React from "react";
import { AlertTriangle, Package, TrendingDown } from "lucide-react";
import type { Ingredient } from "../../types";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { useSettings } from "../../contexts/SettingsContext";

interface LowStockAlertProps {
  ingredients: Ingredient[];
  onViewPantry?: () => void;
  className?: string;
}

function LowStockAlertRaw({
  ingredients,
  onViewPantry,
  className,
}: LowStockAlertProps) {
  const { settings } = useSettings();
  const defaultThreshold = settings?.inventory_threshold ?? 1;
  if (ingredients.length === 0) return null;

  const outOfStock = ingredients.filter((item) => item.quantity <= 0);
  const lowStock = ingredients.filter(
    (item) =>
      item.quantity > 0 &&
      item.quantity <= (item.low_stock_threshold ?? defaultThreshold),
  );

  return (
    <Card className={`bg-orange-50 border-orange-200 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-2 space-x-2">
              <h3 className="font-semibold text-orange-900">Low Stock Alert</h3>
              <Badge
                variant="outline"
                className="text-orange-800 bg-orange-100 border-orange-300"
              >
                {ingredients.length} item
                {ingredients.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="space-y-2">
              {outOfStock.length > 0 && (
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="flex-shrink-0 w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">
                    {outOfStock.length} out of stock
                  </span>
                </div>
              )}

              {lowStock.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Package className="flex-shrink-0 w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-800">
                    {lowStock.length} running low
                  </span>
                </div>
              )}
            </div>

            {/* Show first few items */}
            <div className="mt-3 space-y-1">
              {ingredients.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="font-medium text-orange-900 truncate">
                    {item.name}
                  </span>
                  <div className="flex flex-shrink-0 items-center ml-2 space-x-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        item.quantity <= 0
                          ? "bg-red-100 text-red-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {item.quantity <= 0
                        ? "Out"
                        : `${item.quantity} ${item.unit}`}
                    </span>
                  </div>
                </div>
              ))}

              {ingredients.length > 3 && (
                <div className="text-xs italic text-orange-700">
                  ...and {ingredients.length - 3} more
                </div>
              )}
            </div>

            {onViewPantry && (
              <button
                onClick={onViewPantry}
                className="mt-3 text-sm font-medium text-orange-700 underline hover:text-orange-800"
              >
                View Pantry →
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const LowStockAlert = React.memo(LowStockAlertRaw);
