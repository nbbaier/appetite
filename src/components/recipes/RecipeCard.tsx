import { Clock, Heart, Info, Sparkles, Users } from "lucide-react";
import React from "react";
import type { RecipeMatchResult } from "../../lib/database";
import type { Recipe } from "../../types";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface RecipeCardProps {
  recipe: Recipe | RecipeMatchResult;
  isBookmarked: boolean;
  onBookmark: (id: string) => void;
  onClick?: () => void;
  matchPercentage?: number;
  missingIngredients?: string[];
  canCook?: boolean;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (recipe: Recipe) => void;
}

function getDifficultyColor(difficulty: string | undefined) {
  switch (difficulty) {
    case "Easy":
      return "bg-green-100 text-green-800 border-green-200";
    case "Medium":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "Hard":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

const prefetchRecipeDetailModal = () => {
  import("../recipes/RecipeDetailModal");
};

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isBookmarked,
  onBookmark,
  onClick,
  matchPercentage,
  missingIngredients,
  canCook,
  onEdit,
  onDelete,
}) => {
  // Support both Recipe and RecipeMatchResult
  const recipeId = "id" in recipe ? recipe.id : recipe.recipe_id;
  const title = "title" in recipe ? recipe.title : recipe.recipe_title;
  const description = "description" in recipe ? recipe.description : "";
  const imageUrl = "image_url" in recipe ? recipe.image_url : undefined;
  const prepTime = "prep_time" in recipe ? recipe.prep_time : undefined;
  const cookTime = "cook_time" in recipe ? recipe.cook_time : undefined;
  const servings = "servings" in recipe ? recipe.servings : undefined;
  const difficulty = "difficulty" in recipe ? recipe.difficulty : undefined;
  const cuisineType =
    "cuisine_type" in recipe ? recipe.cuisine_type : undefined;

  return (
    <Card
      className="overflow-hidden transition-all duration-200 cursor-pointer group hover:shadow-lg"
      onClick={onClick}
      onMouseEnter={prefetchRecipeDetailModal}
      onFocus={prefetchRecipeDetailModal}
    >
      <div className="relative">
        <img
          src={
            imageUrl ||
            "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
          }
          alt={title}
          className="object-cover w-full h-40 sm:h-48"
        />
        <div className="flex absolute top-2 right-2 z-10 space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmark(recipeId);
            }}
            className={`p-2 rounded-full transition-colors ${
              isBookmarked
                ? "text-white bg-red-500"
                : "text-gray-600 bg-white/80 hover:bg-white"
            }`}
          >
            <Heart
              className={`h-3 w-3 sm:h-4 sm:w-4 ${isBookmarked ? "fill-current" : ""}`}
            />
          </button>
          {onEdit && "id" in recipe && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(recipe as Recipe);
              }}
              className="p-2 text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200"
              title="Edit Recipe"
            >
              ✎
            </button>
          )}
          {onDelete && "id" in recipe && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(recipe as Recipe);
              }}
              className="p-2 text-red-700 bg-red-100 rounded-full hover:bg-red-200"
              title="Delete Recipe"
            >
              🗑️
            </button>
          )}
        </div>
        {canCook && (
          <Badge className="absolute top-2 left-2 text-xs bg-green-600 sm:top-3 sm:left-3 hover:bg-green-700">
            <Sparkles className="mr-1 w-2 h-2 sm:h-3 sm:w-3" />
            Can Cook
          </Badge>
        )}
        {typeof matchPercentage === "number" && (
          <div className="flex absolute bottom-2 left-2 items-center space-x-1">
            <Badge className="flex items-center text-xs bg-blue-600">
              {matchPercentage}% match
              <span title="This is the percentage of recipe ingredients you already have in your pantry.">
                <Info className="ml-1 w-3 h-3 cursor-help" />
              </span>
            </Badge>
            {matchPercentage === 100 && (
              <Badge
                className="ml-2 text-xs font-bold text-yellow-900 bg-yellow-400 animate-pulse"
                title="You have every ingredient for this recipe!"
              >
                Perfect Match!
              </Badge>
            )}
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg line-clamp-1">
          {title}
        </CardTitle>
        <CardDescription className="text-sm line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between items-center mb-3 text-xs text-gray-600 sm:text-sm">
          <div className="flex items-center space-x-1">
            <Clock className="flex-shrink-0 w-3 h-3 sm:h-4 sm:w-4" />
            <span>
              {typeof prepTime === "number" && typeof cookTime === "number"
                ? prepTime + cookTime + " min"
                : ""}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="flex-shrink-0 w-3 h-3 sm:h-4 sm:w-4" />
            <span>{servings ?? ""}</span>
          </div>
          <Badge
            variant="outline"
            className={`text-xs ${getDifficultyColor(difficulty)}`}
          >
            {difficulty}
          </Badge>
        </div>
        {cuisineType && (
          <Badge variant="secondary" className="text-xs">
            {cuisineType}
          </Badge>
        )}
        {missingIngredients && missingIngredients.length > 0 && (
          <div className="flex items-center mt-2 text-xs text-red-700">
            <span>Missing</span>
            <span title="Ingredients required for this recipe that are not in your pantry.">
              <Info className="ml-1 w-3 h-3 cursor-help" />
            </span>
            : {missingIngredients.slice(0, 3).join(", ")}
            {missingIngredients.length > 3 &&
              ` (+${missingIngredients.length - 3} more)`}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
