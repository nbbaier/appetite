import { Clock, Heart, Info, Sparkles, Users } from "lucide-react";
import type React from "react";
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
  canCook?: boolean;
  isBookmarked: boolean;
  matchPercentage?: number;
  missingIngredients?: string[];
  onBookmark: (id: string) => void;
  onClick?: () => void;
  onDelete?: (recipe: Recipe) => void;
  onEdit?: (recipe: Recipe) => void;
  recipe: Recipe | RecipeMatchResult;
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
  import("./RecipeDetailModal");
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
      className="group cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg"
      onClick={onClick}
      onFocus={prefetchRecipeDetailModal}
      onMouseEnter={prefetchRecipeDetailModal}
    >
      <div className="relative">
        <img
          alt={title}
          className="h-40 w-full object-cover sm:h-48"
          src={
            imageUrl ||
            "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
          }
        />
        <div className="absolute top-2 right-2 z-10 flex space-x-1">
          <button
            className={`rounded-full p-2 transition-colors ${
              isBookmarked
                ? "bg-red-500 text-white"
                : "bg-white/80 text-gray-600 hover:bg-white"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onBookmark(recipeId);
            }}
            type="button"
          >
            <Heart
              className={`h-3 w-3 sm:h-4 sm:w-4 ${isBookmarked ? "fill-current" : ""}`}
            />
          </button>
          {onEdit && "id" in recipe && (
            <button
              className="rounded-full bg-blue-100 p-2 text-blue-700 hover:bg-blue-200"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(recipe as Recipe);
              }}
              title="Edit Recipe"
              type="button"
            >
              ✎
            </button>
          )}
          {onDelete && "id" in recipe && (
            <button
              className="rounded-full bg-red-100 p-2 text-red-700 hover:bg-red-200"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(recipe as Recipe);
              }}
              title="Delete Recipe"
              type="button"
            >
              🗑️
            </button>
          )}
        </div>
        {canCook && (
          <Badge className="absolute top-2 left-2 bg-green-600 text-xs hover:bg-green-700 sm:top-3 sm:left-3">
            <Sparkles className="mr-1 h-2 w-2 sm:h-3 sm:w-3" />
            Can Cook
          </Badge>
        )}
        {typeof matchPercentage === "number" && (
          <div className="absolute bottom-2 left-2 flex items-center space-x-1">
            <Badge className="flex items-center bg-blue-600 text-xs">
              {matchPercentage}% match
              <span title="This is the percentage of recipe ingredients you already have in your pantry.">
                <Info className="ml-1 h-3 w-3 cursor-help" />
              </span>
            </Badge>
            {matchPercentage === 100 && (
              <Badge
                className="ml-2 animate-pulse bg-yellow-400 font-bold text-xs text-yellow-900"
                title="You have every ingredient for this recipe!"
              >
                Perfect Match!
              </Badge>
            )}
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1 text-base sm:text-lg">
          {title}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mb-3 flex items-center justify-between text-gray-600 text-xs sm:text-sm">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
            <span>
              {typeof prepTime === "number" && typeof cookTime === "number"
                ? `${prepTime + cookTime} min`
                : ""}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
            <span>{servings ?? ""}</span>
          </div>
          <Badge
            className={`text-xs ${getDifficultyColor(difficulty)}`}
            variant="outline"
          >
            {difficulty}
          </Badge>
        </div>
        {cuisineType && (
          <Badge className="text-xs" variant="secondary">
            {cuisineType}
          </Badge>
        )}
        {missingIngredients && missingIngredients.length > 0 && (
          <div className="mt-2 flex items-center text-red-700 text-xs">
            <span>Missing</span>
            <span title="Ingredients required for this recipe that are not in your pantry.">
              <Info className="ml-1 h-3 w-3 cursor-help" />
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
