import debounce from "lodash.debounce";
import throttle from "lodash.throttle";
import { ListPlus, Plus, ShoppingCart } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AddEditItemForm } from "../components/shopping/AddEditItemForm";
import { AddFromRecipeModal } from "../components/shopping/AddFromRecipeModal";
import { CreateListForm } from "../components/shopping/CreateListForm";
import { EmptyState } from "../components/shopping/EmptyState";
import { ListHeaderWithStats } from "../components/shopping/ListHeaderWithStats";
import { SearchAndFilterBar } from "../components/shopping/SearchAndFilterBar";
import { ShoppingListItems } from "../components/shopping/ShoppingListItems";
import { ShoppingListsTabs } from "../components/shopping/ShoppingListsTabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";

import {
  clearCache,
  getFromCache,
  ingredientService,
  recipeService,
  setToCache,
  shoppingListService,
} from "../lib/database";
import { handleApiError, logError } from "../lib/errorUtils";
import { supabase } from "../lib/supabase";
import type {
  Ingredient,
  Recipe,
  ShoppingList,
  ShoppingListItem,
} from "../types";

const CATEGORIES = [
  "Produce",
  "Meat & Seafood",
  "Dairy & Eggs",
  "Pantry",
  "Frozen",
  "Bakery",
  "Beverages",
  "Other",
];

const UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "cups",
  "tbsp",
  "tsp",
  "pieces",
  "cans",
  "bottles",
];

// Add Zod schema for item form validation
const ItemFormSchema = z.object({
  name: z.string().min(1, "Item name is required."),
  quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Quantity must be a positive number.",
  }),
  unit: z.string().min(1, "Unit is required."),
  category: z.string().min(1, "Category is required."),
  notes: z.string().optional(),
});

const ITEMS_PER_PAGE = 12;

export function Shopping() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [listItems, setListItems] = useState<ShoppingListItem[]>([]);
  const [userIngredients, setUserIngredients] = useState<Ingredient[]>([]);
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showListForm, setShowListForm] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteListDialogOpen, setDeleteListDialogOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<string | null>(null);
  const [visibleItemsCount, setVisibleItemsCount] = useState(ITEMS_PER_PAGE);

  const [listFormData, setListFormData] = useState({
    name: "",
    description: "",
  });

  const [itemFormData, setItemFormData] = useState({
    name: "",
    quantity: "1",
    unit: "pieces",
    category: "Other",
    notes: "",
  });

  const debouncedSetSearchTerm = useRef(
    debounce((value: string) => setSearchTerm(value), 300),
  ).current;

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // Caching for shopping lists
      let lists = getFromCache<ShoppingList[]>(`shoppingLists_${user.id}`);
      if (!lists) {
        lists = await shoppingListService.getAllLists(user.id);
        setToCache(`shoppingLists_${user.id}`, lists);
      }
      setShoppingLists(lists);

      // Caching for ingredients
      let ingredients = getFromCache<Ingredient[]>(`ingredients_${user.id}`);
      if (!ingredients) {
        ingredients = await ingredientService.getAll(user.id);
        setToCache(`ingredients_${user.id}`, ingredients);
      }
      setUserIngredients(ingredients);

      // Caching for recipes
      let recipes = getFromCache<Recipe[]>("recipes_all");
      if (!recipes) {
        recipes = await recipeService.getAll();
        setToCache("recipes_all", recipes);
      }
      setAvailableRecipes(recipes);
    } catch (error) {
      const message = handleApiError(error);
      setError(message);
      notify(message, { type: "error" });
      logError(error, "Shopping.loadData");
    } finally {
      setLoading(false);
    }
  }, [notify, user]);

  const throttledRefreshData = useMemo(
    () => throttle(() => void loadData(), 1000),
    [loadData],
  );

  const loadListItems = useCallback(async () => {
    if (!selectedList) return;

    try {
      const items = await shoppingListService.getListItems(selectedList.id);
      setListItems(items);
    } catch (error) {
      const message = handleApiError(error);
      setError(message);
      notify(message, { type: "error" });
      logError(error, "Shopping.loadListItems");
    }
  }, [notify, selectedList]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  useEffect(() => {
    if (selectedList) {
      setVisibleItemsCount(ITEMS_PER_PAGE);
      loadListItems();
      return;
    }

    setListItems([]);
  }, [selectedList, loadListItems]);

  useEffect(() => {
    return () => {
      debouncedSetSearchTerm.cancel();
      throttledRefreshData.cancel();
    };
  }, [debouncedSetSearchTerm, throttledRefreshData]);

  useEffect(() => {
    if (!user) return;
    // Real-time subscription for shopping_lists
    const channel = supabase
      .channel("shopping-lists-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shopping_lists",
          filter: `user_id=eq.${user.id}`,
        },
        (_payload) => {
          throttledRefreshData();
        },
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [user, throttledRefreshData]);

  useEffect(() => {
    if (!selectedList) return;
    // Real-time subscription for shopping_list_items in the selected list
    const channel = supabase
      .channel(`shopping-list-items-changes-${selectedList.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shopping_list_items",
          filter: `shopping_list_id=eq.${selectedList.id}`,
        },
        (_payload) => {
          loadListItems();
        },
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [selectedList, loadListItems]);

  // Restore last selected list from localStorage on mount
  useEffect(() => {
    if (shoppingLists.length === 0) {
      setSelectedList(null);
      return;
    }

    setSelectedList((current) => {
      if (current) {
        const matchedCurrent = shoppingLists.find(
          (list) => list.id === current.id,
        );
        if (matchedCurrent) {
          return matchedCurrent;
        }
      }

      const lastListId = localStorage.getItem("lastSelectedShoppingListId");
      if (lastListId) {
        const lastSelected = shoppingLists.find(
          (list) => list.id === lastListId,
        );
        if (lastSelected) {
          return lastSelected;
        }
      }

      return shoppingLists[0];
    });
  }, [shoppingLists]);

  // Save selected list id to localStorage
  useEffect(() => {
    if (selectedList) {
      localStorage.setItem("lastSelectedShoppingListId", selectedList.id);
    }
  }, [selectedList]);

  const createList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setError(null);
      const newList = await shoppingListService.createList({
        user_id: user.id,
        name: listFormData.name,
        description: listFormData.description,
      });
      clearCache(`shoppingLists_${user.id}`);
      setShoppingLists((previousLists) => [newList, ...previousLists]);
      setSelectedList(newList);
      resetListForm();
    } catch (error) {
      const message = handleApiError(error);
      setError(message);
      notify(message, { type: "error" });
      logError(error, "Shopping.createList");
    }
  };

  const handleDeleteListClick = (listId: string) => {
    setListToDelete(listId);
    setDeleteListDialogOpen(true);
  };

  const handleDeleteListConfirm = async () => {
    if (!listToDelete) return;

    try {
      setError(null);
      await shoppingListService.deleteList(listToDelete);
      const updatedLists = shoppingLists.filter(
        (list) => list.id !== listToDelete,
      );
      if (user) {
        clearCache(`shoppingLists_${user.id}`);
      }
      setShoppingLists(updatedLists);

      if (selectedList?.id === listToDelete) {
        setSelectedList(updatedLists[0] || null);
      }
    } catch (error) {
      const message = handleApiError(error);
      setError(message);
      notify(message, { type: "error" });
      logError(error, "Shopping.handleDeleteListConfirm");
    } finally {
      setDeleteListDialogOpen(false);
      setListToDelete(null);
    }
  };

  const createItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedList) return;

    // Zod validation
    const result = ItemFormSchema.safeParse(itemFormData);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    try {
      setError(null);
      const itemData = {
        shopping_list_id: selectedList.id,
        name: itemFormData.name,
        quantity: parseFloat(itemFormData.quantity) || 1,
        unit: itemFormData.unit,
        category: itemFormData.category,
        is_purchased: false,
        notes: itemFormData.notes,
      };

      if (editingItem) {
        await shoppingListService.updateItem(editingItem.id, itemData);
      } else {
        await shoppingListService.createItem(itemData);
      }

      await loadListItems();
      resetItemForm();
    } catch (error) {
      const message = handleApiError(error);
      setError(message);
      notify(message, { type: "error" });
      logError(error, "Shopping.createItem");
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      setError(null);
      await shoppingListService.deleteItem(itemId);
      await loadListItems();
    } catch (error) {
      const message = handleApiError(error);
      setError(message);
      notify(message, { type: "error" });
      logError(error, "Shopping.deleteItem");
    }
  };

  const togglePurchased = async (itemId: string, isPurchased: boolean) => {
    try {
      setError(null);

      const updatedItem = await shoppingListService.togglePurchased(
        itemId,
        !isPurchased,
      );

      // If item was just marked as purchased, add it to pantry
      if (!isPurchased && user) {
        await shoppingListService.addToPantryFromShopping(
          user.id,
          updatedItem.name,
          updatedItem.quantity,
          updatedItem.unit,
          updatedItem.category,
        );
        clearCache(`ingredients_${user.id}`);
      }

      await loadListItems();
    } catch (error) {
      const message = handleApiError(error);
      setError(message);
      notify(message, { type: "error" });
      logError(error, "Shopping.togglePurchased");
    }
  };

  const addFromRecipe = async (recipeId: string) => {
    if (!selectedList) return;

    try {
      setError(null);
      await shoppingListService.createFromRecipe(
        selectedList.id,
        recipeId,
        userIngredients,
      );
      await loadListItems();
      setShowRecipeModal(false);
    } catch (error) {
      const message = handleApiError(error);
      setError(message);
      notify(message, { type: "error" });
      logError(error, "Shopping.addFromRecipe");
    }
  };

  const resetListForm = () => {
    setListFormData({ name: "", description: "" });
    setShowListForm(false);
  };

  const resetItemForm = () => {
    setItemFormData({
      name: "",
      quantity: "1",
      unit: "pieces",
      category: "Other",
      notes: "",
    });
    setShowAddForm(false);
    setEditingItem(null);
  };

  const startEditItem = (item: ShoppingListItem) => {
    setEditingItem(item);
    setItemFormData({
      name: item.name,
      quantity: item.quantity.toString(),
      unit: item.unit,
      category: item.category,
      notes: item.notes || "",
    });
    setShowAddForm(true);
  };

  const handleSelectList = useCallback((list: ShoppingList) => {
    setVisibleItemsCount(ITEMS_PER_PAGE);
    setSelectedList(list);
  }, []);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setVisibleItemsCount(ITEMS_PER_PAGE);
      debouncedSetSearchTerm(event.target.value);
    },
    [debouncedSetSearchTerm],
  );

  const handleCategoryChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setVisibleItemsCount(ITEMS_PER_PAGE);
      setSelectedCategory(event.target.value);
    },
    [],
  );

  const filteredItems = useMemo(() => {
    return listItems.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [listItems, searchTerm, selectedCategory]);

  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleItemsCount),
    [filteredItems, visibleItemsCount],
  );

  const categoryCounts = useMemo(
    () =>
      CATEGORIES.reduce(
        (acc, category) => {
          acc[category] = listItems.filter(
            (item) => item.category === category,
          ).length;
          return acc;
        },
        {} as Record<string, number>,
      ),
    [listItems],
  );

  const hasMoreVisibleItems = visibleItems.length < filteredItems.length;

  const purchasedCount = listItems.filter((item) => item.is_purchased).length;
  const totalCount = listItems.length;

  if (loading) {
    return (
      <div
        className="flex justify-center items-center py-12"
        role="status"
        aria-label="Loading shopping lists"
      >
        <div className="size-8 rounded-full border-b-2 animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-center sm:text-left">
          <h1 className="text-xl font-bold sm:text-2xl text-secondary-900 text-balance">
            Shopping Lists
          </h1>
          <p className="text-sm sm:text-base text-secondary-600 text-pretty">
            Plan your grocery trips and track purchases
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={() => setShowListForm(true)}
            variant="outline"
            className="flex justify-center items-center space-x-2 text-sm sm:text-base"
          >
            <ListPlus className="size-4" />
            <span>New List</span>
          </Button>
          <Button
            onClick={() => setShowAddForm(true)}
            disabled={!selectedList}
            className="flex justify-center items-center space-x-2 text-sm sm:text-base"
          >
            <Plus className="size-4" />
            <span>Add Item</span>
          </Button>
        </div>
      </div>

      {/* Shopping Lists Tabs */}
      {shoppingLists.length > 0 && (
        <ShoppingListsTabs
          shoppingLists={shoppingLists}
          selectedList={selectedList}
          onSelect={handleSelectList}
          onDelete={handleDeleteListClick}
        />
      )}

      {/* Create List Form */}
      <CreateListForm
        visible={showListForm}
        onSubmit={createList}
        onCancel={resetListForm}
        formData={listFormData}
        setFormData={setListFormData}
      />

      {selectedList ? (
        <>
          <ListHeaderWithStats
            selectedList={selectedList}
            totalCount={totalCount}
            purchasedCount={purchasedCount}
            onAddFromRecipe={() => setShowRecipeModal(true)}
            onAddItem={() => setShowAddForm(true)}
          />

          {/* Search and Filter */}
          <SearchAndFilterBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            categories={CATEGORIES}
            categoryCounts={categoryCounts}
          />

          {/* Add/Edit Item Form */}
          <AddEditItemForm
            visible={showAddForm}
            onSubmit={createItem}
            onCancel={resetItemForm}
            formData={itemFormData}
            setFormData={setItemFormData}
            editingItem={editingItem}
            categories={CATEGORIES}
            units={UNITS}
          />

          {/* Shopping List Items */}
          {filteredItems.length === 0 ? (
            <EmptyState
              icon={
                <ShoppingCart className="mx-auto mb-4 size-10 sm:size-12 text-secondary-400" />
              }
              message={
                searchTerm || selectedCategory !== "All"
                  ? "No items found"
                  : "No items in this list"
              }
              subMessage={
                searchTerm || selectedCategory !== "All"
                  ? "Try adjusting your search or filter criteria"
                  : "Add items to start building your shopping list"
              }
              actions={
                !searchTerm && selectedCategory === "All" ? (
                  <>
                    <Button
                      onClick={() => setShowAddForm(true)}
                      className="text-sm sm:text-base"
                    >
                      Add Item
                    </Button>
                    <Button
                      onClick={() => setShowRecipeModal(true)}
                      variant="outline"
                      className="text-sm sm:text-base"
                    >
                      Add from Recipe
                    </Button>
                  </>
                ) : null
              }
            />
          ) : (
            <ShoppingListItems
              items={visibleItems}
              onEdit={startEditItem}
              onDelete={deleteItem}
              onTogglePurchased={togglePurchased}
            />
          )}

          {hasMoreVisibleItems && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={() =>
                  setVisibleItemsCount((current) => current + ITEMS_PER_PAGE)
                }
              >
                Load More
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-8 text-center sm:py-12">
            <ShoppingCart className="mx-auto mb-4 size-10 sm:size-12 text-secondary-400" />
            <h3 className="mb-2 text-base font-medium sm:text-lg text-secondary-900">
              No shopping lists yet
            </h3>
            <p className="px-4 mb-4 text-sm sm:text-base text-secondary-600">
              Create your first shopping list to start planning your grocery
              trips
            </p>
            <Button
              onClick={() => setShowListForm(true)}
              className="text-sm sm:text-base"
            >
              Create Your First List
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add From Recipe Modal */}
      <AddFromRecipeModal
        visible={showRecipeModal}
        onClose={() => setShowRecipeModal(false)}
        onAddFromRecipe={addFromRecipe}
        availableRecipes={availableRecipes}
        loading={loading}
      />

      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {/* Delete List Confirmation Dialog */}
      <AlertDialog
        open={deleteListDialogOpen}
        onOpenChange={setDeleteListDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shopping List</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this shopping list? All items in
              the list will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteListConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
