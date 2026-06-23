import {
  BookOpen,
  ChefHat,
  Heart,
  ShoppingCart,
  Sparkles,
  Timer,
  Users,
  Utensils,
  X,
} from "lucide-react";
import React from "react";
import type {
  Recipe,
  RecipeIngredient,
  RecipeInstruction,
  ShoppingList,
} from "../../types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";

interface RecipeDetailModalProps {
  addingToShopping: boolean;
  addMissingToShoppingList: () => void;
  canCook: boolean;
  createLeftoverFromRecipe: () => void;
  creatingLeftover: boolean;
  currentUserId?: string;
  getMissingIngredients: () => RecipeIngredient[];
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  isBookmarked: boolean;
  loading: boolean;
  onBookmark: (id: string) => void;
  onClose: () => void;
  onDelete?: () => void;
  open: boolean;
  recipe: Recipe | null;
  selectedShoppingListId: string;
  setSelectedShoppingListId: (v: string) => void;
  setShowAddToShoppingModal: (v: boolean) => void;
  setShowCreateLeftoverModal: (v: boolean) => void;
  showAddToShoppingModal: boolean;
  showCreateLeftoverModal: boolean;
  userShoppingLists: ShoppingList[];
}

const RecipeDetailModalRaw: React.FC<RecipeDetailModalProps> = ({
  open,
  recipe,
  ingredients,
  instructions,
  loading,
  onClose,
  isBookmarked,
  onBookmark,
  canCook,
  userShoppingLists,
  setShowAddToShoppingModal,
  setShowCreateLeftoverModal,
  getMissingIngredients,
  currentUserId,
  onDelete,
}) => {
  React.useEffect(() => {
    if (!open) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);
  if (!(open && recipe)) {
    return null;
  }
  const missingIngredients = getMissingIngredients();
  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4 pb-[env(safe-area-inset-bottom)]">
      <Card className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden">
        <CardHeader className="relative pb-3 sm:pb-4">
          <Button
            aria-label="Close recipe details"
            className="absolute top-2 right-2 z-dropdown sm:top-4 sm:right-4"
            onClick={onClose}
            size="icon"
            variant="ghost"
          >
            <X className="size-4" />
          </Button>
          <div className="relative">
            <img
              alt={recipe.title}
              className="h-48 w-full rounded-lg object-cover sm:h-64"
              height={256}
              src={
                recipe.image_url ||
                "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
              }
              width={512}
            />
            <div className="absolute right-3 bottom-3 left-3 sm:right-4 sm:bottom-4 sm:left-4">
              <div className="rounded-lg bg-white/95 p-3 backdrop-blur-sm sm:p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h2 className="mb-1 line-clamp-2 text-balance font-bold text-gray-900 text-lg sm:mb-2 sm:text-2xl">
                      {recipe.title}
                    </h2>
                    <p className="mb-2 line-clamp-2 text-pretty text-gray-600 text-sm sm:mb-3 sm:text-base">
                      {recipe.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="text-xs" variant="outline">
                        {recipe.difficulty}
                      </Badge>
                      {recipe.cuisine_type && (
                        <Badge className="text-xs" variant="secondary">
                          {recipe.cuisine_type}
                        </Badge>
                      )}
                      {canCook && (
                        <Badge className="bg-green-600 text-xs">
                          <Sparkles className="mr-1 size-2 sm:size-3" />
                          Can Cook
                        </Badge>
                      )}
                    </div>
                  </div>
                  <button
                    aria-label={
                      isBookmarked
                        ? "Remove from bookmarks"
                        : "Add to bookmarks"
                    }
                    className={`ml-2 flex-shrink-0 rounded-full p-2 transition-colors ${
                      isBookmarked
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookmark(recipe.id);
                    }}
                    type="button"
                  >
                    <Heart
                      className={`size-4 sm:size-5 ${isBookmarked ? "fill-current" : ""}`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <ScrollArea className="h-[calc(90vh-300px)]">
          <CardContent className="p-4 sm:p-6">
            {loading ? (
              <div
                aria-label="Loading recipe details"
                className="flex items-center justify-center py-8"
                role="status"
              >
                <div className="size-8 animate-spin rounded-full border-primary border-b-2" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Quick Add to Shopping List Button */}
                {missingIngredients.length > 0 &&
                  userShoppingLists.length > 0 && (
                    <div className="mb-4 flex justify-end">
                      <Button
                        className="flex items-center space-x-2"
                        onClick={() => setShowAddToShoppingModal(true)}
                        variant="default"
                      >
                        <ShoppingCart className="mr-2 size-4" />
                        <span>Add missing ingredients to shopping list</span>
                      </Button>
                    </div>
                  )}
                {/* Recipe Stats */}
                <div className="grid grid-cols-3 gap-2 text-center sm:gap-4">
                  <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                    <div className="mb-1 flex items-center justify-center sm:mb-2">
                      <Timer className="size-4 text-blue-600 sm:size-5" />
                    </div>
                    <div className="font-bold text-gray-900 text-lg tabular-nums sm:text-2xl">
                      {recipe.prep_time}
                    </div>
                    <div className="text-gray-600 text-xs sm:text-sm">
                      Prep Time
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                    <div className="mb-1 flex items-center justify-center sm:mb-2">
                      <ChefHat className="size-4 text-orange-600 sm:size-5" />
                    </div>
                    <div className="font-bold text-gray-900 text-lg tabular-nums sm:text-2xl">
                      {recipe.cook_time}
                    </div>
                    <div className="text-gray-600 text-xs sm:text-sm">
                      Cook Time
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                    <div className="mb-1 flex items-center justify-center sm:mb-2">
                      <Users className="size-4 text-green-600 sm:size-5" />
                    </div>
                    <div className="font-bold text-gray-900 text-lg tabular-nums sm:text-2xl">
                      {recipe.servings}
                    </div>
                    <div className="text-gray-600 text-xs sm:text-sm">
                      Servings
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
                  {/* Ingredients */}
                  <div>
                    <div className="mb-3 flex items-center space-x-2 sm:mb-4">
                      <Utensils className="size-4 text-gray-600 sm:size-5" />
                      <h3 className="text-balance font-semibold text-base text-gray-900 sm:text-lg">
                        Ingredients
                      </h3>
                    </div>
                    {/* Create Leftover Button */}
                    <div className="mb-4">
                      <Button
                        className="flex items-center space-x-2 text-sm"
                        onClick={() => setShowCreateLeftoverModal(true)}
                        variant="outline"
                      >
                        <Utensils className="size-4" />
                        <span>Create Leftover</span>
                      </Button>
                    </div>
                    {ingredients.length > 0 ? (
                      <div className="space-y-2 sm:space-y-3">
                        {ingredients.map((ingredient) => {
                          // You may want to pass in a checkIngredientAvailability function as a prop for full generality
                          // For now, just show all ingredients
                          return (
                            <div
                              className="flex items-center justify-between rounded-lg border p-2 transition-colors sm:p-3"
                              key={ingredient.id}
                            >
                              <div className="flex min-w-0 flex-1 items-center space-x-2">
                                <div className="size-2 flex-shrink-0 rounded-full bg-gray-300 sm:size-3" />
                                <div className="flex items-center space-x-1">
                                  <span className="truncate font-medium text-sm sm:text-base">
                                    {ingredient.ingredient_name}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-2 flex-shrink-0 text-xs sm:text-sm">
                                {ingredient.quantity} {ingredient.unit}
                                {ingredient.notes && (
                                  <span className="ml-1 hidden text-gray-500 sm:inline">
                                    ({ingredient.notes})
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm italic sm:text-base">
                        No ingredients listed for this recipe.
                      </p>
                    )}
                  </div>
                  {/* Instructions */}
                  <div>
                    <div className="mb-3 flex items-center space-x-2 sm:mb-4">
                      <BookOpen className="size-4 text-gray-600 sm:size-5" />
                      <h3 className="text-balance font-semibold text-base text-gray-900 sm:text-lg">
                        Instructions
                      </h3>
                    </div>
                    {instructions.length > 0 ? (
                      <div className="space-y-3 sm:space-y-4">
                        {instructions.map((instruction) => (
                          <div
                            className="flex space-x-3 sm:space-x-4"
                            key={instruction.id}
                          >
                            <div className="flex-shrink-0">
                              <div className="flex size-6 items-center justify-center rounded-full bg-primary font-medium text-white text-xs tabular-nums sm:size-8 sm:text-sm">
                                {instruction.step_number}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-gray-700 text-sm leading-relaxed sm:text-base">
                                {instruction.instruction}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm italic sm:text-base">
                        No instructions available for this recipe.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </ScrollArea>
        {/* Delete button for user-defined recipes */}
        {recipe &&
          currentUserId &&
          recipe.user_id === currentUserId &&
          onDelete && (
            <div className="flex justify-end border-t bg-red-50 p-4">
              <Button
                className="w-full sm:w-auto"
                onClick={onDelete}
                variant="destructive"
              >
                Delete Recipe
              </Button>
            </div>
          )}
      </Card>
    </div>
  );
};

export const RecipeDetailModal = React.memo(RecipeDetailModalRaw);
