import {
  AlertTriangle,
  Calendar,
  ChefHat,
  Clock,
  Edit3,
  Trash2,
} from "lucide-react";
import React from "react";
import type { Leftover } from "../../types";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

interface LeftoverCardProps {
  className?: string;
  leftover: Leftover;
  onDelete?: (id: string) => void;
  onEdit?: (leftover: Leftover) => void;
}

function LeftoverCardRaw({
  leftover,
  onEdit,
  onDelete,
  className,
}: LeftoverCardProps) {
  const getDaysUntilExpiration = () => {
    if (!leftover.expiration_date) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(leftover.expiration_date);
    expDate.setHours(0, 0, 0, 0);

    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isExpired = () => {
    const days = getDaysUntilExpiration();
    return days !== null && days < 0;
  };

  const isExpiringSoon = () => {
    const days = getDaysUntilExpiration();
    return days !== null && days >= 0 && days <= 2;
  };

  const getExpirationText = () => {
    const days = getDaysUntilExpiration();
    if (days === null) {
      return null;
    }

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

  const getExpirationColor = () => {
    if (isExpired()) {
      return "text-red-600";
    }
    if (isExpiringSoon()) {
      return "text-orange-600";
    }
    return "text-gray-600";
  };

  return (
    <Card
      className={`relative ${
        isExpired()
          ? "border-red-200 bg-red-50"
          : isExpiringSoon()
            ? "border-orange-200 bg-orange-50"
            : ""
      } ${className}`}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="mb-2 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium text-secondary-900 text-sm sm:text-base">
              {leftover.name}
            </h3>
            <p className="text-secondary-600 text-xs sm:text-sm">
              {leftover.quantity} {leftover.unit}
            </p>

            {/* Source Recipe Badge */}
            {leftover.source_recipe_id && (
              <div className="mt-1 flex items-center space-x-1">
                <ChefHat className="h-3 w-3 text-blue-600" />
                <Badge
                  className="border-blue-200 bg-blue-50 text-blue-700 text-xs"
                  variant="outline"
                >
                  From Recipe
                </Badge>
              </div>
            )}
          </div>

          <div className="ml-2 flex shrink-0 space-x-1">
            {onEdit && (
              <button
                className="rounded p-1.5 text-secondary-400 hover:text-secondary-600"
                onClick={() => onEdit(leftover)}
                type="button"
              >
                <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            )}
            {onDelete && (
              <button
                className="rounded p-1.5 text-secondary-400 hover:text-red-600"
                onClick={() => onDelete(leftover.id)}
                type="button"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Expiration Info */}
        {leftover.expiration_date && (
          <div
            className={`mb-2 flex items-center space-x-1 text-xs sm:text-sm ${getExpirationColor()}`}
          >
            {(isExpired() || isExpiringSoon()) && (
              <AlertTriangle className="h-3 w-3 shrink-0" />
            )}
            <Calendar className="h-3 w-3 shrink-0" />
            <span className="truncate">{getExpirationText()}</span>
          </div>
        )}

        {/* Notes */}
        {leftover.notes && (
          <p className="line-clamp-2 text-secondary-500 text-xs">
            {leftover.notes}
          </p>
        )}

        {/* Created Date */}
        <div className="mt-2 flex items-center space-x-1 text-secondary-400 text-xs">
          <Clock className="h-3 w-3" />
          <span>
            Added {new Date(leftover.created_at).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export const LeftoverCard = React.memo(LeftoverCardRaw);
