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
  open: boolean;
  recipe: Recipe | null;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  loading: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onBookmark: (id: string) => void;
  canCook: boolean;
  userShoppingLists: ShoppingList[];
  showAddToShoppingModal: boolean;
  setShowAddToShoppingModal: (v: boolean) => void;
  selectedShoppingListId: string;
  setSelectedShoppingListId: (v: string) => void;
  addMissingToShoppingList: () => void;
  addingToShopping: boolean;
  showCreateLeftoverModal: boolean;
  setShowCreateLeftoverModal: (v: boolean) => void;
  createLeftoverFromRecipe: () => void;
  creatingLeftover: boolean;
  getMissingIngredients: () => RecipeIngredient[];
  currentUserId?: string;
  onDelete?: () => void;
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
    if (!open) return;
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
  if (!open || !recipe) return null;
  const missingIngredients = getMissingIngredients();
  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="relative pb-3 sm:pb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-2 right-2 z-10 sm:right-4 sm:top-4"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="relative">
            <img
              src={
                recipe.image_url ||
                "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
              }
              alt={recipe.title}
              className="object-cover w-full h-48 rounded-lg sm:h-64"
            />
            <div className="absolute right-3 bottom-3 left-3 sm:bottom-4 sm:left-4 sm:right-4">
              <div className="p-3 rounded-lg backdrop-blur-sm bg-white/95 sm:p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h2 className="mb-1 text-lg font-bold text-gray-900 sm:text-2xl sm:mb-2 line-clamp-2">
                      {recipe.title}
                    </h2>
                    <p className="mb-2 text-sm text-gray-600 sm:text-base sm:mb-3 line-clamp-2">
                      {recipe.description}
                    </p>
                    <div className="flex flex-wrap gap-2 items-center">
                      <Badge variant="outline" className="text-xs">
                        {recipe.difficulty}
                      </Badge>
                      {recipe.cuisine_type && (
                        <Badge variant="secondary" className="text-xs">
                          {recipe.cuisine_type}
                        </Badge>
                      )}
                      {canCook && (
                        <Badge className="text-xs bg-green-600">
                          <Sparkles className="mr-1 w-2 h-2 sm:h-3 sm:w-3" />
                          Can Cook
                        </Badge>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookmark(recipe.id);
                    }}
                    className={`p-2 rounded-full transition-colors ml-2 flex-shrink-0 ${
                      isBookmarked
                        ? "text-white bg-red-500"
                        : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${isBookmarked ? "fill-current" : ""}`}
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
              <div className="flex justify-center items-center py-8">
                <div className="w-8 h-8 rounded-full border-b-2 animate-spin border-primary"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Quick Add to Shopping List Button */}
                {missingIngredients.length > 0 &&
                  userShoppingLists.length > 0 && (
                    <div className="flex justify-end mb-4">
                      <Button
                        onClick={() => setShowAddToShoppingModal(true)}
                        variant="default"
                        className="flex items-center space-x-2"
                      >
                        <ShoppingCart className="mr-2 w-4 h-4" />
                        <span>Add missing ingredients to shopping list</span>
                      </Button>
                    </div>
                  )}
                {/* Recipe Stats */}
                <div className="grid grid-cols-3 gap-2 text-center sm:gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg sm:p-4">
                    <div className="flex justify-center items-center mb-1 sm:mb-2">
                      <Timer className="w-4 h-4 text-blue-600 sm:h-5 sm:w-5" />
                    </div>
                    <div className="text-lg font-bold text-gray-900 sm:text-2xl">
                      {recipe.prep_time}
                    </div>
                    <div className="text-xs text-gray-600 sm:text-sm">
                      Prep Time
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg sm:p-4">
                    <div className="flex justify-center items-center mb-1 sm:mb-2">
                      <ChefHat className="w-4 h-4 text-orange-600 sm:h-5 sm:w-5" />
                    </div>
                    <div className="text-lg font-bold text-gray-900 sm:text-2xl">
                      {recipe.cook_time}
                    </div>
                    <div className="text-xs text-gray-600 sm:text-sm">
                      Cook Time
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg sm:p-4">
                    <div className="flex justify-center items-center mb-1 sm:mb-2">
                      <Users className="w-4 h-4 text-green-600 sm:h-5 sm:w-5" />
                    </div>
                    <div className="text-lg font-bold text-gray-900 sm:text-2xl">
                      {recipe.servings}
                    </div>
                    <div className="text-xs text-gray-600 sm:text-sm">
                      Servings
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 sm:gap-8">
                  {/* Ingredients */}
                  <div>
                    <div className="flex items-center mb-3 space-x-2 sm:mb-4">
                      <Utensils className="w-4 h-4 text-gray-600 sm:h-5 sm:w-5" />
                      <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
                        Ingredients
                      </h3>
                    </div>
                    {/* Create Leftover Button */}
                    <div className="mb-4">
                      <Button
                        onClick={() => setShowCreateLeftoverModal(true)}
                        variant="outline"
                        className="flex items-center space-x-2 text-sm"
                      >
                        <Utensils className="w-4 h-4" />
                        <span>Create Leftover</span>
                      </Button>
                    </div>
                    {ingredients.length > 0 ? (
                      <div className="space-y-2 sm:space-y-3">
                        {ingredients.map((ingredient, index) => {
                          // You may want to pass in a checkIngredientAvailability function as a prop for full generality
                          // For now, just show all ingredients
                          return (
                            <div
                              key={index}
                              className="flex justify-between items-center p-2 rounded-lg border transition-colors sm:p-3"
                            >
                              <div className="flex flex-1 items-center space-x-2 min-w-0">
                                <div className="flex-shrink-0 w-2 h-2 bg-gray-300 rounded-full sm:w-3 sm:h-3" />
                                <div className="flex items-center space-x-1">
                                  <span className="text-sm font-medium truncate sm:text-base">
                                    {ingredient.ingredient_name}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-shrink-0 ml-2 text-xs sm:text-sm">
                                {ingredient.quantity} {ingredient.unit}
                                {ingredient.notes && (
                                  <span className="hidden ml-1 text-gray-500 sm:inline">
                                    ({ingredient.notes})
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm italic text-gray-500 sm:text-base">
                        No ingredients listed for this recipe.
                      </p>
                    )}
                  </div>
                  {/* Instructions */}
                  <div>
                    <div className="flex items-center mb-3 space-x-2 sm:mb-4">
                      <BookOpen className="w-4 h-4 text-gray-600 sm:h-5 sm:w-5" />
                      <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
                        Instructions
                      </h3>
                    </div>
                    {instructions.length > 0 ? (
                      <div className="space-y-3 sm:space-y-4">
                        {instructions.map((instruction, index) => (
                          <div
                            key={index}
                            className="flex space-x-3 sm:space-x-4"
                          >
                            <div className="flex-shrink-0">
                              <div className="flex justify-center items-center w-6 h-6 text-xs font-medium text-white rounded-full sm:w-8 sm:h-8 bg-primary sm:text-sm">
                                {instruction.step_number}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
                                {instruction.instruction}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm italic text-gray-500 sm:text-base">
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
            <div className="flex justify-end p-4 bg-red-50 border-t">
              <Button
                variant="destructive"
                onClick={onDelete}
                className="w-full sm:w-auto"
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
