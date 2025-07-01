import React from "react";
import { FixedSizeGrid as Grid } from "react-window";
import type { RecipeMatchResult } from "../../lib/database";
import type { Recipe } from "../../types";
import { RecipeCard } from "./RecipeCard";

interface RecipeListProps {
  recipes: (Recipe | RecipeMatchResult)[];
  bookmarkedRecipes: string[];
  onBookmark: (id: string) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  canCookMatches?: RecipeMatchResult[];
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (recipe: Recipe) => void;
}

const RecipeListComponent: React.FC<RecipeListProps> = ({
  recipes,
  bookmarkedRecipes,
  onBookmark,
  onSelectRecipe,
  canCookMatches,
  onEdit,
  onDelete,
}) => {
  // Virtualize if list is long
  if (recipes.length > 30) {
    const columnCount = 3;
    const rowCount = Math.ceil(recipes.length / columnCount);
    const Cell: React.FC<{
      columnIndex: number;
      rowIndex: number;
      style: React.CSSProperties;
    }> = ({ columnIndex, rowIndex, style }) => {
      const index = rowIndex * columnCount + columnIndex;
      if (index >= recipes.length) return null;
      const recipe = recipes[index];
      let matchInfo: RecipeMatchResult | undefined = undefined;
      if (canCookMatches && "recipe_id" in recipe) {
        matchInfo = canCookMatches.find(
          (m) => m.recipe_id === (recipe as RecipeMatchResult).recipe_id,
        );
      }
      const recipeId =
        "id" in recipe ? recipe.id : (recipe as RecipeMatchResult).recipe_id;
      return (
        <div style={style} key={recipeId}>
          <RecipeCard
            recipe={recipe}
            isBookmarked={bookmarkedRecipes.includes(recipeId)}
            onBookmark={onBookmark}
            onClick={() => onSelectRecipe(recipe as Recipe)}
            matchPercentage={matchInfo?.match_percentage}
            missingIngredients={matchInfo?.missing_ingredients}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      );
    };
    return (
      <Grid
        columnCount={columnCount}
        rowCount={rowCount}
        columnWidth={340}
        rowHeight={320}
        height={960}
        width={1080}
        className="gap-4"
      >
        {Cell}
      </Grid>
    );
  }
  // Fallback to normal rendering for small lists
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
      {recipes.map((recipe) => {
        let matchInfo: RecipeMatchResult | undefined = undefined;
        if (canCookMatches && "recipe_id" in recipe) {
          matchInfo = canCookMatches.find(
            (m) => m.recipe_id === (recipe as RecipeMatchResult).recipe_id,
          );
        }
        const recipeId =
          "id" in recipe ? recipe.id : (recipe as RecipeMatchResult).recipe_id;
        return (
          <RecipeCard
            key={recipeId}
            recipe={recipe}
            isBookmarked={bookmarkedRecipes.includes(recipeId)}
            onBookmark={onBookmark}
            onClick={() => onSelectRecipe(recipe as Recipe)}
            matchPercentage={matchInfo?.match_percentage}
            missingIngredients={matchInfo?.missing_ingredients}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
};

export const RecipeList = React.memo(RecipeListComponent);
