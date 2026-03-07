import React from "react";
import { type CellComponentProps, Grid } from "react-window";
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

interface RecipeGridCellData {
  recipes: (Recipe | RecipeMatchResult)[];
  bookmarkedRecipes: string[];
  onBookmark: (id: string) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  canCookMatchById: Map<string, RecipeMatchResult>;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (recipe: Recipe) => void;
  columnCount: number;
}

function getRecipeId(recipe: Recipe | RecipeMatchResult) {
  return "id" in recipe ? recipe.id : recipe.recipe_id;
}

function getRecipeMatchInfo(
  recipe: Recipe | RecipeMatchResult,
  canCookMatchById: Map<string, RecipeMatchResult>,
) {
  if ("recipe_id" in recipe) {
    return canCookMatchById.get(recipe.recipe_id);
  }

  return undefined;
}

const RecipeGridCell: React.FC<CellComponentProps<RecipeGridCellData>> = ({
  ariaAttributes,
  columnIndex,
  rowIndex,
  style,
  recipes,
  bookmarkedRecipes,
  onBookmark,
  onSelectRecipe,
  canCookMatchById,
  onEdit,
  onDelete,
  columnCount,
}) => {
  const index = rowIndex * columnCount + columnIndex;

  if (index >= recipes.length) {
    return <div aria-hidden="true" style={style} {...ariaAttributes} />;
  }

  const recipe = recipes[index];
  const recipeId = getRecipeId(recipe);
  const matchInfo = getRecipeMatchInfo(recipe, canCookMatchById);

  return (
    <div style={style} {...ariaAttributes}>
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

const RecipeListComponent: React.FC<RecipeListProps> = ({
  recipes,
  bookmarkedRecipes,
  onBookmark,
  onSelectRecipe,
  canCookMatches,
  onEdit,
  onDelete,
}) => {
  const canCookMatchById = React.useMemo(() => {
    const matchMap = new Map<string, RecipeMatchResult>();

    for (const match of canCookMatches ?? []) {
      matchMap.set(match.recipe_id, match);
    }

    return matchMap;
  }, [canCookMatches]);

  // Virtualize if list is long
  if (recipes.length > 30) {
    const columnCount = 3;
    const rowCount = Math.ceil(recipes.length / columnCount);

    return (
      <Grid
        cellComponent={RecipeGridCell}
        cellProps={{
          recipes,
          bookmarkedRecipes,
          onBookmark,
          onSelectRecipe,
          canCookMatchById,
          onEdit,
          onDelete,
          columnCount,
        }}
        columnCount={columnCount}
        rowCount={rowCount}
        columnWidth={340}
        rowHeight={320}
        style={{ height: 960, width: 1080 }}
        className="gap-4"
      />
    );
  }

  // Fallback to normal rendering for small lists
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
      {recipes.map((recipe) => {
        const recipeId = getRecipeId(recipe);
        const matchInfo = getRecipeMatchInfo(recipe, canCookMatchById);

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
