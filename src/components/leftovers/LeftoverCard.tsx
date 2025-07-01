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
  leftover: Leftover;
  onEdit?: (leftover: Leftover) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

function LeftoverCardRaw({
  leftover,
  onEdit,
  onDelete,
  className,
}: LeftoverCardProps) {
  const getDaysUntilExpiration = () => {
    if (!leftover.expiration_date) return null;

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
    if (days === null) return null;

    if (days < 0) {
      return `Expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} ago`;
    } else if (days === 0) {
      return "Expires today";
    } else if (days === 1) {
      return "Expires tomorrow";
    } else {
      return `Expires in ${days} days`;
    }
  };

  const getExpirationColor = () => {
    if (isExpired()) return "text-red-600";
    if (isExpiringSoon()) return "text-orange-600";
    return "text-gray-600";
  };

  return (
    <Card
      className={`relative ${
        isExpired()
          ? "bg-red-50 border-red-200"
          : isExpiringSoon()
            ? "bg-orange-50 border-orange-200"
            : ""} ${className}`}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium truncate text-secondary-900 sm:text-base">
              {leftover.name}
            </h3>
            <p className="text-xs sm:text-sm text-secondary-600">
              {leftover.quantity} {leftover.unit}
            </p>

            {/* Source Recipe Badge */}
            {leftover.source_recipe_id && (
              <div className="flex items-center mt-1 space-x-1">
                <ChefHat className="w-3 h-3 text-blue-600" />
                <Badge
                  variant="outline"
                  className="text-xs text-blue-700 bg-blue-50 border-blue-200"
                >
                  From Recipe
                </Badge>
              </div>
            )}
          </div>

          <div className="flex flex-shrink-0 ml-2 space-x-1">
            {onEdit && (
              <button
                onClick={() => onEdit(leftover)}
                className="p-1.5 text-secondary-400 hover:text-secondary-600 rounded"
              >
                <Edit3 className="w-3 h-3 sm:h-4 sm:w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(leftover.id)}
                className="p-1.5 text-secondary-400 hover:text-red-600 rounded"
              >
                <Trash2 className="w-3 h-3 sm:h-4 sm:w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Expiration Info */}
        {leftover.expiration_date && (
          <div
            className={`flex items-center mb-2 space-x-1 text-xs sm:text-sm ${getExpirationColor()}`}
          >
            {(isExpired() || isExpiringSoon()) && (
              <AlertTriangle className="flex-shrink-0 w-3 h-3" />
            )}
            <Calendar className="flex-shrink-0 w-3 h-3" />
            <span className="truncate">{getExpirationText()}</span>
          </div>
        )}

        {/* Notes */}
        {leftover.notes && (
          <p className="text-xs text-secondary-500 line-clamp-2">
            {leftover.notes}
          </p>
        )}

        {/* Created Date */}
        <div className="flex items-center mt-2 space-x-1 text-xs text-secondary-400">
          <Clock className="w-3 h-3" />
          <span>
            Added {new Date(leftover.created_at).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export const LeftoverCard = React.memo(LeftoverCardRaw);
