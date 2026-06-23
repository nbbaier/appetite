// biome-ignore-all assist/source/organizeImports: needed for testing
// @ts-nocheck
import React from "react";
import { AlertTriangle, Package, TrendingDown } from "lucide-react";
import type { Ingredient } from "../../types";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { useSettings } from "../../contexts/SettingsContext";

interface LowStockAlertProps {
  className?: string;
  ingredients: Ingredient[];
  onViewPantry?: () => void;
}

function LowStockAlertRaw({
  ingredients,
  onViewPantry,
  className,
}: LowStockAlertProps) {
  const { settings } = useSettings();
  const defaultThreshold = settings?.inventory_threshold ?? 1;
  if (ingredients.length === 0) {
    return null;
  }

  const outOfStock = ingredients.filter((item) => item.quantity <= 0);
  const lowStock = ingredients.filter(
    (item) =>
      item.quantity > 0 &&
      item.quantity <= (item.low_stock_threshold ?? defaultThreshold)
  );

  return (
    <Card className={`border-orange-200 bg-orange-50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="shrink-0">
            <div className="rounded-lg bg-orange-100 p-2">
              <TrendingDown className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center space-x-2">
              <h3 className="font-semibold text-orange-900">Low Stock Alert</h3>
              <Badge
                className="border-orange-300 bg-orange-100 text-orange-800"
                variant="outline"
              >
                {ingredients.length} item
                {ingredients.length === 1 ? "" : "s"}
              </Badge>
            </div>

            <div className="space-y-2">
              {outOfStock.length > 0 && (
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                  <span className="font-medium text-red-800 text-sm">
                    {outOfStock.length} out of stock
                  </span>
                </div>
              )}

              {lowStock.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 shrink-0 text-orange-600" />
                  <span className="text-orange-800 text-sm">
                    {lowStock.length} running low
                  </span>
                </div>
              )}
            </div>

            {/* Show first few items */}
            <div className="mt-3 space-y-1">
              {ingredients.slice(0, 3).map((item) => (
                <div
                  className="flex items-center justify-between text-sm"
                  key={item.id}
                >
                  <span className="truncate font-medium text-orange-900">
                    {item.name}
                  </span>
                  <div className="ml-2 flex shrink-0 items-center space-x-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
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
                <div className="text-orange-700 text-xs italic">
                  ...and {ingredients.length - 3} more
                </div>
              )}
            </div>

            {onViewPantry && (
              <button
                className="mt-3 font-medium text-orange-700 text-sm underline hover:text-orange-800"
                onClick={onViewPantry}
                type="button"
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
