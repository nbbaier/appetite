import React from "react";
import { type CellComponentProps, Grid } from "react-window";
import type { RecipeMatchResult } from "../../lib/database";
import type { Recipe } from "../../types";
import { RecipeCard } from "./RecipeCard";

interface RecipeListProps {
  bookmarkedRecipes: string[];
  canCookMatches?: RecipeMatchResult[];
  onBookmark: (id: string) => void;
  onDelete?: (recipe: Recipe) => void;
  onEdit?: (recipe: Recipe) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  recipes: (Recipe | RecipeMatchResult)[];
}

interface RecipeGridCellData {
  bookmarkedRecipes: string[];
  canCookMatchById: Map<string, RecipeMatchResult>;
  columnCount: number;
  onBookmark: (id: string) => void;
  onDelete?: (recipe: Recipe) => void;
  onEdit?: (recipe: Recipe) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  recipes: (Recipe | RecipeMatchResult)[];
}

function getRecipeId(recipe: Recipe | RecipeMatchResult) {
  return "id" in recipe ? recipe.id : recipe.recipe_id;
}

function getRecipeMatchInfo(
  recipe: Recipe | RecipeMatchResult,
  canCookMatchById: Map<string, RecipeMatchResult>
) {
  if ("recipe_id" in recipe) {
    return canCookMatchById.get(recipe.recipe_id);
  }

  return;
}

const RecipeGridCell = ({
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
}: CellComponentProps<RecipeGridCellData>) => {
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
        isBookmarked={bookmarkedRecipes.includes(recipeId)}
        matchPercentage={matchInfo?.match_percentage}
        missingIngredients={matchInfo?.missing_ingredients}
        onBookmark={onBookmark}
        onClick={() => onSelectRecipe(recipe as Recipe)}
        onDelete={onDelete}
        onEdit={onEdit}
        recipe={recipe}
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
        className="gap-4"
        columnCount={columnCount}
        columnWidth={340}
        rowCount={rowCount}
        rowHeight={320}
        style={{ height: 960, width: 1080 }}
      />
    );
  }

  // Fallback to normal rendering for small lists
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {recipes.map((recipe) => {
        const recipeId = getRecipeId(recipe);
        const matchInfo = getRecipeMatchInfo(recipe, canCookMatchById);

        return (
          <RecipeCard
            isBookmarked={bookmarkedRecipes.includes(recipeId)}
            key={recipeId}
            matchPercentage={matchInfo?.match_percentage}
            missingIngredients={matchInfo?.missing_ingredients}
            onBookmark={onBookmark}
            onClick={() => onSelectRecipe(recipe as Recipe)}
            onDelete={onDelete}
            onEdit={onEdit}
            recipe={recipe}
          />
        );
      })}
    </div>
  );
};

export const RecipeList = React.memo(RecipeListComponent);
