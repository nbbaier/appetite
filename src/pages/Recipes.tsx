import debounce from "lodash.debounce";
import throttle from "lodash.throttle";
import { BookOpen, Plus, Sparkles, Utensils, X } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { RecipeDetailModal } from "../components/recipes/RecipeDetailModal";
import { RecipeFilters } from "../components/recipes/RecipeFilters";
import { RecipeList } from "../components/recipes/RecipeList";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import { useRecipe } from "../contexts/RecipeContext";
import type { RecipeMatchResult } from "../lib/database";
import {
  clearCache,
  getFromCache,
  ingredientService,
  leftoverService,
  recipeService,
  setToCache,
  shoppingListService,
} from "../lib/database";
import type { Ingredient, Recipe, ShoppingList } from "../types";

export function Recipes() {
  const { user } = useAuth();
  const {
    recipes,
    loading,
    bookmarkedRecipes,
    selectedRecipe,
    recipeIngredients,
    recipeInstructions,
    loadRecipeDetails,
    toggleBookmark,
    setSelectedRecipe,
    addRecipe,
    updateRecipe,
    deleteRecipe,
  } = useRecipe();
  const [userIngredients, setUserIngredients] = useState<Ingredient[]>([]);
  const [userShoppingLists, setUserShoppingLists] = useState<ShoppingList[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [showCanCookOnly, setShowCanCookOnly] = useState(false);
  const [showAddToShoppingModal, setShowAddToShoppingModal] = useState(false);
  const [selectedShoppingListId, setSelectedShoppingListId] =
    useState<string>("");
  const [addingToShopping, setAddingToShopping] = useState(false);
  const [showCreateLeftoverModal, setShowCreateLeftoverModal] = useState(false);
  const [creatingLeftover, setCreatingLeftover] = useState(false);
  const [sortKey, setSortKey] = useState("recent");
  const [itemsToShow, setItemsToShow] = useState(12);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [formState, setFormState] = useState<{
    user_id: string;
    title: string;
    description: string;
    image_url: string;
    prep_time: number;
    cook_time: number;
    servings: number;
    difficulty: "Easy" | "Medium" | "Hard";
    cuisine_type?: string;
  }>({
    user_id: user?.id || "",
    title: "",
    description: "",
    image_url: "",
    prep_time: 0,
    cook_time: 0,
    servings: 1,
    difficulty: "Easy",
    cuisine_type: "",
  });
  const [canCookMatches, setCanCookMatches] = useState<RecipeMatchResult[]>([]);
  const [minMatch, setMinMatch] = useState(70); // Default: show recipes with at least 70% match
  const [maxMissing, setMaxMissing] = useState(3); // Default: show recipes with at most 3 missing ingredients
  const [canCookSortKey, setCanCookSortKey] = useState<
    | "match"
    | "missing"
    | "cook_time_asc"
    | "cook_time_desc"
    | "difficulty_asc"
    | "difficulty_desc"
  >("match");
  const [error, _setError] = useState<string | null>(null);

  const debouncedSetSearchTerm = useRef(
    debounce((value: string) => setSearchTerm(value), 300)
  ).current;

  const loadData = useCallback(
    throttle(async () => {
      if (!user) {
        return;
      }
      try {
        // Caching for ingredients
        let ingredientsData = getFromCache<Ingredient[]>(
          `ingredients_${user.id}`
        );
        if (!ingredientsData) {
          ingredientsData = await ingredientService.getAll(user.id);
          setToCache(`ingredients_${user.id}`, ingredientsData);
        }
        setUserIngredients(ingredientsData);
        // Caching for shopping lists
        let shoppingListsData = getFromCache<ShoppingList[]>(
          `shoppingLists_${user.id}`
        );
        if (!shoppingListsData) {
          shoppingListsData = await shoppingListService.getAllLists(user.id);
          setToCache(`shoppingLists_${user.id}`, shoppingListsData);
        }
        setUserShoppingLists(shoppingListsData);
        // Caching for canCookMatches (pagination-aware)
        const cacheKey = `canCookMatches_${user.id}_${minMatch}_${maxMissing}_${itemsToShow}`;
        let matches = getFromCache<RecipeMatchResult[]>(cacheKey);
        if (!matches) {
          matches = await recipeService.getRecipeMatchesForPantry(user.id, {
            minMatchPercentage: minMatch,
            maxMissingIngredients: maxMissing,
            limit: itemsToShow,
            offset: 0,
          });
          setToCache(cacheKey, matches);
        }
        setCanCookMatches(matches);
      } catch (error) {
        toast.error("Failed to load recipes or lists. Please try again.");
        console.error("Error loading data:", error);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const checkIngredientAvailability = (ingredientName: string) =>
    userIngredients.some(
      (userIng) =>
        userIng.name.toLowerCase().includes(ingredientName.toLowerCase()) ||
        ingredientName.toLowerCase().includes(userIng.name.toLowerCase())
    );

  const getMissingIngredients = () => {
    if (!recipeIngredients.length) {
      return [];
    }

    return recipeIngredients.filter(
      (recipeIng) => !checkIngredientAvailability(recipeIng.ingredient_name)
    );
  };

  const openAddRecipe = useCallback(() => {
    setEditingRecipe(null);
    setFormState({
      user_id: user?.id || "",
      title: "",
      description: "",
      image_url: "",
      prep_time: 0,
      cook_time: 0,
      servings: 1,
      difficulty: "Easy",
      cuisine_type: "",
    });
    setShowRecipeForm(true);
  }, [user]);

  const handleFormChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value } = e.target;
      setFormState((prev) => ({
        ...prev,
        [name]:
          name === "prep_time" || name === "cook_time" || name === "servings"
            ? Number(value)
            : value,
      }));
    },
    []
  );

  const handleRecipeFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (editingRecipe) {
        await updateRecipe(editingRecipe.id, {
          ...formState,
          difficulty: formState.difficulty as "Easy" | "Medium" | "Hard",
        });
      } else {
        await addRecipe({
          ...formState,
          difficulty: formState.difficulty as "Easy" | "Medium" | "Hard",
        });
      }
      clearCache(`recipes_${user?.id}`);
      clearCache(
        `canCookMatches_${user?.id}_${minMatch}_${maxMissing}_${itemsToShow}`
      );
      setShowRecipeForm(false);
      setEditingRecipe(null);
    },
    [
      editingRecipe,
      updateRecipe,
      addRecipe,
      formState,
      user,
      minMatch,
      maxMissing,
      itemsToShow,
    ]
  );

  const addMissingToShoppingList = useCallback(async () => {
    if (!(selectedRecipe && selectedShoppingListId)) {
      return;
    }
    try {
      setAddingToShopping(true);
      await shoppingListService.createFromRecipe(
        selectedShoppingListId,
        selectedRecipe.id,
        userIngredients
      );
      setShowAddToShoppingModal(false);
      setSelectedShoppingListId("");
      toast.success(
        `Added missing ingredients from "${selectedRecipe.title}" to your shopping list!`
      );
    } catch (error) {
      console.error("Error adding to shopping list:", error);
      toast.error(
        "Failed to add ingredients to shopping list. Please try again."
      );
    } finally {
      setAddingToShopping(false);
    }
  }, [selectedRecipe, selectedShoppingListId, userIngredients]);

  const createLeftoverFromRecipe = useCallback(async () => {
    if (!(selectedRecipe && user)) {
      return;
    }
    try {
      setCreatingLeftover(true);
      await leftoverService.createFromRecipe(
        user.id,
        selectedRecipe.id,
        selectedRecipe.title,
        2, // Default 2 portions
        "portions",
        "Created from recipe"
      );
      setShowCreateLeftoverModal(false);
      toast.success(`Created leftover entry for "${selectedRecipe.title}"!`);
    } catch (error) {
      console.error("Error creating leftover:", error);
      toast.error("Failed to create leftover. Please try again.");
    } finally {
      setCreatingLeftover(false);
    }
  }, [selectedRecipe, user]);

  // Memoize expensive derived lists
  const filteredRecipes = useMemo(() => {
    if (showCanCookOnly) {
      return canCookMatches.filter((match) => {
        const matchesSearch = match.recipe_title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        return matchesSearch;
      });
    }
    return recipes.filter((recipe) => {
      const matchesSearch =
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty =
        selectedDifficulty === "All" ||
        recipe.difficulty === selectedDifficulty;
      return matchesSearch && matchesDifficulty;
    });
  }, [
    showCanCookOnly,
    canCookMatches,
    searchTerm,
    recipes,
    selectedDifficulty,
  ]);

  const sortedRecipes = useMemo(
    () =>
      [...filteredRecipes].sort((a, b) => {
        if (showCanCookOnly) {
          const aMatch = a as RecipeMatchResult;
          const bMatch = b as RecipeMatchResult;
          switch (canCookSortKey) {
            case "match":
              return bMatch.match_percentage - aMatch.match_percentage;
            case "missing":
              return (
                (aMatch.missing_ingredients?.length ?? 0) -
                (bMatch.missing_ingredients?.length ?? 0)
              );
            default:
              return 0;
          }
        }
        const aRecipe = a as Recipe;
        const bRecipe = b as Recipe;
        switch (sortKey) {
          case "cook_time_asc":
            return (
              aRecipe.prep_time +
              aRecipe.cook_time -
              (bRecipe.prep_time + bRecipe.cook_time)
            );
          case "cook_time_desc":
            return (
              bRecipe.prep_time +
              bRecipe.cook_time -
              (aRecipe.prep_time + aRecipe.cook_time)
            );
          case "difficulty_asc": {
            const diffOrder = { Easy: 1, Medium: 2, Hard: 3 };
            return (
              (diffOrder[aRecipe.difficulty as keyof typeof diffOrder] || 0) -
              (diffOrder[bRecipe.difficulty as keyof typeof diffOrder] || 0)
            );
          }
          case "difficulty_desc": {
            const diffOrder = { Easy: 1, Medium: 2, Hard: 3 };
            return (
              (diffOrder[bRecipe.difficulty as keyof typeof diffOrder] || 0) -
              (diffOrder[aRecipe.difficulty as keyof typeof diffOrder] || 0)
            );
          }
          default:
            return (
              new Date(bRecipe.created_at).getTime() -
              new Date(aRecipe.created_at).getTime()
            );
        }
      }),
    [filteredRecipes, showCanCookOnly, canCookSortKey, sortKey]
  );

  const visibleRecipes = useMemo(
    () => sortedRecipes.slice(0, itemsToShow),
    [sortedRecipes, itemsToShow]
  );

  useEffect(() => {
    if (itemsToShow < sortedRecipes.length) {
      // Progressive loading: load more recipes after idle or short delay
      let handle: number;
      let usedIdleCallback = false;
      if (window.requestIdleCallback) {
        handle = window.requestIdleCallback(() =>
          setItemsToShow(itemsToShow + 12)
        );
        usedIdleCallback = true;
      } else {
        handle = window.setTimeout(() => setItemsToShow(itemsToShow + 12), 500);
      }
      return () => {
        if (usedIdleCallback && window.cancelIdleCallback) {
          window.cancelIdleCallback(handle);
        } else {
          clearTimeout(handle);
        }
      };
    }
  }, [itemsToShow, sortedRecipes.length]);

  // Add delete handler
  const handleDeleteRecipe = useCallback(async () => {
    if (!selectedRecipe) {
      return;
    }
    if (
      !window.confirm(
        "Are you sure you want to delete this recipe? This cannot be undone."
      )
    ) {
      return;
    }
    try {
      await deleteRecipe(selectedRecipe.id);
      toast.success("Recipe deleted successfully.");
      setSelectedRecipe(null);
    } catch (_err) {
      toast.error("Failed to delete recipe. Please try again.");
    }
  }, [selectedRecipe, deleteRecipe, setSelectedRecipe]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-center sm:text-left">
          <h1 className="font-bold text-gray-900 text-xl sm:text-2xl lg:text-3xl">
            Recipe Discovery
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Find delicious recipes to cook
          </p>
        </div>
        <div className="flex items-center justify-center space-x-2 sm:justify-start">
          <span className="text-gray-600 text-sm">Can cook:</span>
          <Badge className="bg-green-100 text-green-800" variant="secondary">
            {canCookMatches.length} recipes
          </Badge>
          <Button className="ml-4" onClick={openAddRecipe} variant="default">
            <Plus className="mr-1 h-4 w-4" /> Add Recipe
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <RecipeFilters
        onDifficultyChange={setSelectedDifficulty}
        onSearchChange={debouncedSetSearchTerm}
        onSortKeyChange={setSortKey}
        onToggleCanCook={() => setShowCanCookOnly((v) => !v)}
        searchTerm={searchTerm}
        selectedDifficulty={selectedDifficulty}
        showCanCookOnly={showCanCookOnly}
        sortKey={sortKey}
      />

      {/* Advanced Filters for Can Cook */}
      {showCanCookOnly && (
        <div className="mb-2 flex flex-col rounded-lg border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center sm:space-x-6">
          <div className="mb-2 flex items-center space-x-2 sm:mb-0">
            <label
              className="font-medium text-gray-700 text-sm"
              htmlFor="min-match"
            >
              Min Match %:
            </label>
            <input
              className="w-16 rounded border px-2 py-1 text-sm"
              id="min-match"
              max={100}
              min={0}
              onChange={(e) => setMinMatch(Number(e.target.value))}
              type="number"
              value={minMatch}
            />
          </div>
          <div className="mb-2 flex items-center space-x-2 sm:mb-0">
            <label
              className="font-medium text-gray-700 text-sm"
              htmlFor="max-missing"
            >
              Max Missing:
            </label>
            <input
              className="w-16 rounded border px-2 py-1 text-sm"
              id="max-missing"
              max={20}
              min={0}
              onChange={(e) => setMaxMissing(Number(e.target.value))}
              type="number"
              value={maxMissing}
            />
          </div>
          <div className="flex items-center space-x-2">
            <label
              className="font-medium text-gray-700 text-sm"
              htmlFor="can-cook-sort"
            >
              Sort by:
            </label>
            <select
              className="rounded border px-2 py-1 text-sm"
              id="can-cook-sort"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setCanCookSortKey(e.target.value as typeof canCookSortKey)
              }
              value={canCookSortKey}
            >
              <option value="match">Match % (high → low)</option>
              <option value="missing">Fewest Missing</option>
              {/* Optionally add more when RecipeMatchResult includes cook_time/difficulty */}
            </select>
          </div>
        </div>
      )}

      {/* Can Cook Banner */}
      {canCookMatches.length > 0 && !showCanCookOnly && (
        <Card className="border-green-200 bg-linear-to-r from-green-50 to-emerald-50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-3">
                <div className="shrink-0 rounded-lg bg-green-600 p-2">
                  <Sparkles className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-green-900 text-sm sm:text-base">
                    You can cook {canCookMatches.length} recipes with your
                    current ingredients!
                  </h3>
                  <p className="text-green-700 text-xs sm:text-sm">
                    Make the most of what you have in your pantry
                  </p>
                </div>
              </div>
              <Button
                className="text-sm sm:text-base"
                onClick={() => setShowCanCookOnly(true)}
              >
                View Recipes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recipes Grid */}
      {filteredRecipes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center sm:py-12">
            <BookOpen className="mx-auto mb-4 h-10 w-10 text-gray-400 sm:h-12 sm:w-12" />
            <h3 className="mb-2 font-medium text-base text-gray-900 sm:text-lg">
              No recipes found
            </h3>
            <p className="px-4 text-gray-600 text-sm sm:text-base">
              {showCanCookOnly
                ? "Add more ingredients to your pantry to unlock more recipes"
                : "Try adjusting your search or filter criteria"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <RecipeList
          bookmarkedRecipes={bookmarkedRecipes}
          canCookMatches={
            showCanCookOnly ? (visibleRecipes as RecipeMatchResult[]) : []
          }
          onBookmark={toggleBookmark}
          onSelectRecipe={loadRecipeDetails}
          recipes={visibleRecipes}
        />
      )}

      {itemsToShow < sortedRecipes.length && (
        <div className="mt-6 flex justify-center">
          <Button
            disabled={loading}
            onClick={throttle(() => setItemsToShow(itemsToShow + 12), 500)}
          >
            Load More
          </Button>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          addingToShopping={addingToShopping}
          addMissingToShoppingList={addMissingToShoppingList}
          canCook={
            selectedRecipe && showCanCookOnly
              ? canCookMatches.some(
                  (r) =>
                    r.recipe_id === selectedRecipe.id &&
                    r.match_percentage >= minMatch
                )
              : false
          }
          createLeftoverFromRecipe={createLeftoverFromRecipe}
          creatingLeftover={creatingLeftover}
          currentUserId={user?.id}
          getMissingIngredients={getMissingIngredients}
          ingredients={recipeIngredients}
          instructions={recipeInstructions}
          isBookmarked={
            selectedRecipe
              ? bookmarkedRecipes.includes(selectedRecipe.id)
              : false
          }
          loading={loading}
          onBookmark={toggleBookmark}
          onClose={() => {
            setSelectedRecipe(null);
            setShowAddToShoppingModal(false);
            setShowCreateLeftoverModal(false);
            setSelectedShoppingListId("");
          }}
          onDelete={handleDeleteRecipe}
          open={!!selectedRecipe}
          recipe={selectedRecipe}
          selectedShoppingListId={selectedShoppingListId}
          setSelectedShoppingListId={setSelectedShoppingListId}
          setShowAddToShoppingModal={setShowAddToShoppingModal}
          setShowCreateLeftoverModal={setShowCreateLeftoverModal}
          showAddToShoppingModal={showAddToShoppingModal}
          showCreateLeftoverModal={showCreateLeftoverModal}
          userShoppingLists={userShoppingLists}
        />
      )}

      {/* Add to Shopping List Modal */}
      {showAddToShoppingModal && selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="pb-3 sm:pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl">
                  Add to Shopping List
                </CardTitle>
                <Button
                  onClick={() => {
                    setShowAddToShoppingModal(false);
                    setSelectedShoppingListId("");
                  }}
                  size="icon"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Add missing ingredients from "{selectedRecipe.title}" to your
                shopping list
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Missing Ingredients Preview */}
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                <h4 className="mb-2 font-medium text-orange-900 text-sm">
                  Missing Ingredients ({getMissingIngredients().length}
                  ):
                </h4>
                <div className="space-y-1">
                  {getMissingIngredients()
                    .slice(0, 5)
                    .map((ingredient) => (
                      <div
                        className="text-orange-800 text-xs"
                        key={`${ingredient.ingredient_name}-${ingredient.quantity}-${ingredient.unit}`}
                      >
                        • {ingredient.ingredient_name} ({ingredient.quantity}{" "}
                        {ingredient.unit})
                      </div>
                    ))}
                  {getMissingIngredients().length > 5 && (
                    <div className="text-orange-600 text-xs italic">
                      ...and {getMissingIngredients().length - 5} more
                    </div>
                  )}
                </div>
              </div>

              {/* Shopping List Selection */}
              <div>
                <label
                  className="mb-2 block font-medium text-gray-700 text-sm"
                  htmlFor="add-to-shopping-list-select"
                >
                  Select Shopping List:
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  id="add-to-shopping-list-select"
                  onChange={(e) => setSelectedShoppingListId(e.target.value)}
                  value={selectedShoppingListId}
                >
                  <option value="">Choose a list...</option>
                  {userShoppingLists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                <Button
                  className="flex items-center justify-center space-x-2"
                  disabled={!selectedShoppingListId || addingToShopping}
                  onClick={addMissingToShoppingList}
                >
                  <Plus className="h-4 w-4" />
                  <span>{addingToShopping ? "Adding..." : "Add to List"}</span>
                </Button>
                <Button
                  disabled={addingToShopping}
                  onClick={() => {
                    setShowAddToShoppingModal(false);
                    setSelectedShoppingListId("");
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Leftover Modal */}
      {showCreateLeftoverModal && selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="pb-3 sm:pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl">
                  Create Leftover
                </CardTitle>
                <Button
                  onClick={() => {
                    setShowCreateLeftoverModal(false);
                  }}
                  size="icon"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Create a leftover entry for "{selectedRecipe.title}"
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recipe Preview */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center space-x-3">
                  <img
                    alt={selectedRecipe.title}
                    className="h-12 w-12 rounded-lg object-cover"
                    height={48}
                    src={
                      selectedRecipe.image_url ||
                      "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
                    }
                    width={48}
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-medium text-gray-900">
                      {selectedRecipe.title}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Serves {selectedRecipe.servings} •{" "}
                      {selectedRecipe.difficulty}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <h4 className="mb-2 font-medium text-blue-900 text-sm">
                  Default Leftover Details:
                </h4>
                <div className="space-y-1 text-blue-800 text-sm">
                  <div>• Name: {selectedRecipe.title} (Leftovers)</div>
                  <div>• Quantity: 2 portions</div>
                  <div>• Expires: 3 days from now</div>
                  <div>• Linked to this recipe</div>
                </div>
                <p className="mt-2 text-blue-600 text-xs">
                  You can edit these details after creation in the Leftovers
                  page.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                <Button
                  className="flex items-center justify-center space-x-2"
                  disabled={creatingLeftover}
                  onClick={createLeftoverFromRecipe}
                >
                  <Utensils className="h-4 w-4" />
                  <span>
                    {creatingLeftover ? "Creating..." : "Create Leftover"}
                  </span>
                </Button>
                <Button
                  disabled={creatingLeftover}
                  onClick={() => {
                    setShowCreateLeftoverModal(false);
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recipe Add/Edit Modal */}
      {showRecipeForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <RecipeFormModal
            editingRecipe={editingRecipe}
            formState={formState}
            handleFormChange={handleFormChange}
            handleRecipeFormSubmit={handleRecipeFormSubmit}
            setShowRecipeForm={setShowRecipeForm}
          />
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

function RecipeFormModal({
  formState,
  handleFormChange,
  handleRecipeFormSubmit,
  editingRecipe,
  setShowRecipeForm,
}: {
  formState: {
    user_id: string;
    title: string;
    description: string;
    image_url: string;
    prep_time: number;
    cook_time: number;
    servings: number;
    difficulty: "Easy" | "Medium" | "Hard";
    cuisine_type?: string;
  };
  handleFormChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >;
  handleRecipeFormSubmit: React.FormEventHandler<HTMLFormElement>;
  editingRecipe: Recipe | null;
  setShowRecipeForm: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowRecipeForm(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setShowRecipeForm]);
  return (
    <form
      className="w-full max-w-md space-y-2 rounded-lg bg-white p-6 shadow-lg"
      onSubmit={handleRecipeFormSubmit}
    >
      <h2 className="mb-2 font-bold text-lg">
        {editingRecipe ? "Edit Recipe" : "Add Recipe"}
      </h2>
      {/* Title */}
      <div className="flex flex-col">
        <label className="font-medium text-sm" htmlFor="recipe-title">
          Title
        </label>
        <input
          className="mt-1 w-full rounded border p-2"
          id="recipe-title"
          name="title"
          onChange={handleFormChange}
          placeholder="Title"
          required
          value={formState.title}
        />
      </div>
      {/* Description */}
      <div className="flex flex-col">
        <label className="font-medium text-sm" htmlFor="recipe-description">
          Description
        </label>
        <textarea
          className="mt-1 w-full rounded border p-2"
          id="recipe-description"
          name="description"
          onChange={handleFormChange}
          placeholder="Description"
          required
          value={formState.description}
        />
      </div>
      {/* Image URL */}
      <div className="flex flex-col">
        <label className="font-medium text-sm" htmlFor="recipe-image-url">
          Image URL
        </label>
        <input
          className="mt-1 w-full rounded border p-2"
          id="recipe-image-url"
          name="image_url"
          onChange={handleFormChange}
          placeholder="Image URL"
          value={formState.image_url}
        />
      </div>
      {/* Prep Time, Cook Time, Servings */}
      <div className="flex space-x-2">
        <div className="flex w-1/3 flex-col">
          <label className="font-medium text-sm" htmlFor="prep-time">
            Prep Time (min)
          </label>
          <input
            className="mt-1 rounded border p-2"
            id="prep-time"
            min={0}
            name="prep_time"
            onChange={handleFormChange}
            placeholder="Prep Time (min)"
            required
            type="number"
            value={formState.prep_time}
          />
        </div>
        <div className="flex w-1/3 flex-col">
          <label className="font-medium text-sm" htmlFor="cook-time">
            Cook Time (min)
          </label>
          <input
            className="mt-1 rounded border p-2"
            id="cook-time"
            min={0}
            name="cook_time"
            onChange={handleFormChange}
            placeholder="Cook Time (min)"
            required
            type="number"
            value={formState.cook_time}
          />
        </div>
        <div className="flex w-1/3 flex-col">
          <label className="font-medium text-sm" htmlFor="servings">
            Servings
          </label>
          <input
            className="mt-1 rounded border p-2"
            id="servings"
            min={1}
            name="servings"
            onChange={handleFormChange}
            placeholder="Servings"
            required
            type="number"
            value={formState.servings}
          />
        </div>
      </div>
      {/* Difficulty */}
      <div className="flex flex-col">
        <label className="font-medium text-sm" htmlFor="difficulty">
          Difficulty
        </label>
        <select
          className="mt-1 w-full rounded border p-2"
          id="difficulty"
          name="difficulty"
          onChange={handleFormChange}
          value={formState.difficulty}
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>
      {/* Cuisine Type */}
      <div className="flex flex-col">
        <label className="font-medium text-sm" htmlFor="cuisine-type">
          Cuisine Type
        </label>
        <input
          className="mt-1 w-full rounded border p-2"
          id="cuisine-type"
          name="cuisine_type"
          onChange={handleFormChange}
          placeholder="Cuisine Type"
          value={formState.cuisine_type}
        />
      </div>
      <div className="mt-4 flex justify-end space-x-2">
        <Button
          onClick={() => setShowRecipeForm(false)}
          type="button"
          variant="ghost"
        >
          Cancel
        </Button>
        <Button type="submit" variant="default">
          {editingRecipe ? "Update" : "Add"}
        </Button>
      </div>
    </form>
  );
}
