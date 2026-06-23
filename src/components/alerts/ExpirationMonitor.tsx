// biome-ignore-all assist/source/organizeImports: needed for testing
// @ts-nocheck
import React from "react";
import { AlertTriangle, Calendar, Clock } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Ingredient } from "../../types";
import { useSettings } from "../../contexts/SettingsContext";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface ExpirationMonitorProps {
  className?: string;
  ingredients: Ingredient[];
}

interface ExpirationGroup {
  critical: Ingredient[];
  expired: Ingredient[];
  upcoming: Ingredient[];
  warning: Ingredient[];
}

type IngredientWithExpiration = Ingredient & { expiration_date: string };

const hasExpirationDate = (
  ingredient: Ingredient
): ingredient is IngredientWithExpiration =>
  Boolean(ingredient.expiration_date);

function ExpirationMonitorRaw({
  ingredients,
  className,
}: ExpirationMonitorProps) {
  const { settings } = useSettings();
  const criticalDays = settings?.expiration_threshold_days ?? 3;
  const warningDays = Math.max(criticalDays + 4, 7); // warning = critical+4 or 7
  const [groups, setGroups] = useState<ExpirationGroup>({
    expired: [],
    critical: [],
    warning: [],
    upcoming: [],
  });

  const categorizeByExpiration = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newGroups: ExpirationGroup = {
      expired: [],
      critical: [],
      warning: [],
      upcoming: [],
    };
    for (const ingredient of ingredients.filter(hasExpirationDate)) {
      const expDate = new Date(ingredient.expiration_date);
      expDate.setHours(0, 0, 0, 0);
      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        newGroups.expired.push(ingredient);
      } else if (diffDays <= criticalDays) {
        newGroups.critical.push(ingredient);
      } else if (diffDays <= warningDays) {
        newGroups.warning.push(ingredient);
      } else if (diffDays <= 14) {
        newGroups.upcoming.push(ingredient);
      }
    }
    for (const group of Object.values(newGroups)) {
      group.sort(
        (a: Ingredient, b: Ingredient) =>
          new Date(a.expiration_date ?? "").getTime() -
          new Date(b.expiration_date ?? "").getTime()
      );
    }
    setGroups(newGroups);
  }, [ingredients, criticalDays, warningDays]);

  useEffect(() => {
    categorizeByExpiration();
  }, [categorizeByExpiration]);

  const getDaysUntilExpiration = (expirationDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatExpirationText = (days: number) => {
    if (days < 0) {
      return `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`;
    }
    if (days === 0) {
      return "Expires today";
    }
    if (days === 1) {
      return "Expires tomorrow";
    }
    return `Expires in ${days} days`;
  };

  const totalExpiringItems =
    groups.expired.length + groups.critical.length + groups.warning.length;

  if (totalExpiringItems === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-4 text-center">
          <Calendar className="mx-auto mb-2 h-8 w-8 text-green-500" />
          <p className="text-gray-600 text-sm">
            No items expiring soon. Your pantry is well managed!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-lg">Expiration Monitor</CardTitle>
            <Badge
              className="border-orange-300 bg-orange-100 text-orange-800"
              variant="outline"
            >
              {totalExpiringItems} item
              {totalExpiringItems === 1 ? "" : "s"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {groups.expired.length > 0 && (
          <div>
            <h4 className="mb-2 flex items-center font-medium text-red-900 text-sm">
              <AlertTriangle className="mr-1 h-4 w-4" />
              Expired ({groups.expired.length})
            </h4>
            <div className="space-y-2">
              {groups.expired.map((item) => (
                <div
                  className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-2"
                  key={item.id}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-red-900">
                      {item.name}
                    </p>
                    <p className="text-red-700 text-xs">
                      {item.quantity} {item.unit} • {item.category}
                    </p>
                  </div>
                  <div className="ml-2 shrink-0 text-right">
                    <span className="font-medium text-red-600 text-xs">
                      {formatExpirationText(
                        getDaysUntilExpiration(item.expiration_date ?? "")
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {groups.critical.length > 0 && (
          <div>
            <h4 className="mb-2 flex items-center font-medium text-red-800 text-sm">
              <Clock className="mr-1 h-4 w-4" />
              Critical ({groups.critical.length})
            </h4>
            <div className="space-y-2">
              {groups.critical.map((item) => (
                <div
                  className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-2"
                  key={item.id}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-red-900">
                      {item.name}
                    </p>
                    <p className="text-red-700 text-xs">
                      {item.quantity} {item.unit} • {item.category}
                    </p>
                  </div>
                  <div className="ml-2 shrink-0 text-right">
                    <span className="font-medium text-red-600 text-xs">
                      {formatExpirationText(
                        getDaysUntilExpiration(item.expiration_date ?? "")
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {groups.warning.length > 0 && (
          <div>
            <h4 className="mb-2 flex items-center font-medium text-orange-800 text-sm">
              <AlertTriangle className="mr-1 h-4 w-4" />
              Warning ({groups.warning.length})
            </h4>
            <div className="space-y-2">
              {groups.warning.map((item) => (
                <div
                  className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-2"
                  key={item.id}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-orange-900">
                      {item.name}
                    </p>
                    <p className="text-orange-700 text-xs">
                      {item.quantity} {item.unit} • {item.category}
                    </p>
                  </div>
                  <div className="ml-2 shrink-0 text-right">
                    <span className="font-medium text-orange-600 text-xs">
                      {formatExpirationText(
                        getDaysUntilExpiration(item.expiration_date ?? "")
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {groups.upcoming.length > 0 && (
          <details className="group">
            <summary className="flex cursor-pointer items-center font-medium text-blue-800 text-sm">
              <Calendar className="mr-1 h-4 w-4" />
              Upcoming ({groups.upcoming.length})
              <span className="ml-auto text-blue-600 text-xs group-open:hidden">
                Click to expand
              </span>
            </summary>
            <div className="mt-2 space-y-2">
              {groups.upcoming.map((item) => (
                <div
                  className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-2"
                  key={item.id}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-blue-900">
                      {item.name}
                    </p>
                    <p className="text-blue-700 text-xs">
                      {item.quantity} {item.unit} • {item.category}
                    </p>
                  </div>
                  <div className="ml-2 shrink-0 text-right">
                    <span className="font-medium text-blue-600 text-xs">
                      {formatExpirationText(
                        getDaysUntilExpiration(item.expiration_date ?? "")
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

export const ExpirationMonitor = React.memo(ExpirationMonitorRaw);
