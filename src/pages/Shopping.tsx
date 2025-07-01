import debounce from "lodash.debounce";
import throttle from "lodash.throttle";
import { ListPlus, Plus, ShoppingCart } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useAuth } from "../contexts/AuthContext";

import {
  clearCache,
  getFromCache,
  ingredientService,
  recipeService,
  setToCache,
  shoppingListService,
} from "../lib/database";
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

export function Shopping() {
  const { user } = useAuth();
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
  const [error, _setError] = useState<string | null>(null);

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

  const loadData = useCallback(
    throttle(async () => {
      if (!user) return;
      setLoading(true);
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
        let recipes = getFromCache<Recipe[]>(`recipes_all`);
        if (!recipes) {
          recipes = await recipeService.getAll();
          setToCache(`recipes_all`, recipes);
        }
        setAvailableRecipes(recipes);
        // No caching for list items (list-specific, often changing)
      } finally {
        setLoading(false);
      }
    }, 1000),
    [],
  );

  const loadListItems = useCallback(async () => {
    if (!selectedList) return;

    try {
      const items = await shoppingListService.getListItems(selectedList.id);
      setListItems(items);
    } catch (error) {
      console.error("Error loading list items:", error);
    }
  }, [selectedList]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  useEffect(() => {
    if (selectedList) {
      loadListItems();
    }
  }, [selectedList, loadListItems]);

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
          loadData();
        },
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [user, loadData]);

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
    const lastListId = localStorage.getItem("lastSelectedShoppingListId");
    if (lastListId && shoppingLists.length > 0) {
      const found = shoppingLists.find((l) => l.id === lastListId);
      if (found) setSelectedList(found);
    } else if (shoppingLists.length === 1) {
      setSelectedList(shoppingLists[0]);
    }
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
      const newList = await shoppingListService.createList({
        user_id: user.id,
        name: listFormData.name,
        description: listFormData.description,
      });
      clearCache(`shoppingLists_${user.id}`);
      setShoppingLists([newList, ...shoppingLists]);
      setSelectedList(newList);
      resetListForm();
    } catch (error) {
      console.error("Error creating list:", error);
    }
  };

  const deleteList = async (listId: string) => {
    if (!confirm("Are you sure you want to delete this shopping list?")) return;

    try {
      await shoppingListService.deleteList(listId);
      const updatedLists = shoppingLists.filter((list) => list.id !== listId);
      setShoppingLists(updatedLists);

      if (selectedList?.id === listId) {
        setSelectedList(updatedLists[0] || null);
      }
    } catch (error) {
      console.error("Error deleting list:", error);
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
      console.error("Error saving item:", error);
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      await shoppingListService.deleteItem(itemId);
      await loadListItems();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const togglePurchased = async (itemId: string, isPurchased: boolean) => {
    try {
      console.log("Toggling purchase status:", {
        itemId,
        isPurchased,
        newStatus: !isPurchased,
      });

      // Find the item being toggled
      const item = listItems.find((item) => item.id === itemId);
      if (!item) {
        console.error("Item not found:", itemId);
        return;
      }

      console.log("Found item:", item);

      const updatedItem = await shoppingListService.togglePurchased(
        itemId,
        !isPurchased,
      );
      console.log("Updated item:", updatedItem);

      // If item was just marked as purchased, add it to pantry
      if (!isPurchased && user) {
        // Item was just marked as purchased
        console.log("Item marked as purchased, adding to pantry...");
        await shoppingListService.addToPantryFromShopping(
          user.id,
          updatedItem.name,
          updatedItem.quantity,
          updatedItem.unit,
          updatedItem.category,
        );
      } else {
        console.log("Item unmarked as purchased or no user");
      }

      await loadListItems();
    } catch (error) {
      console.error("Error toggling purchase status:", error);
      alert("Failed to update item. Please try again.");
    }
  };

  const addFromRecipe = async (recipeId: string) => {
    if (!selectedList) return;

    try {
      console.log("Adding from recipe:", recipeId, "to list:", selectedList.id);
      await shoppingListService.createFromRecipe(
        selectedList.id,
        recipeId,
        userIngredients,
      );
      await loadListItems();
      setShowRecipeModal(false);
    } catch (error) {
      console.error("Error adding from recipe:", error);
      alert("Failed to add recipe ingredients. Please try again.");
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

  const filteredItems = listItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryCounts = CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = listItems.filter(
        (item) => item.category === category,
      ).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  const purchasedCount = listItems.filter((item) => item.is_purchased).length;
  const totalCount = listItems.length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 rounded-full border-b-2 animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-center sm:text-left">
          <h1 className="text-xl font-bold sm:text-2xl text-secondary-900">
            Shopping Lists
          </h1>
          <p className="text-sm sm:text-base text-secondary-600">
            Plan your grocery trips and track purchases
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={() => setShowListForm(true)}
            variant="outline"
            className="flex justify-center items-center space-x-2 text-sm sm:text-base"
          >
            <ListPlus className="w-4 h-4" />
            <span>New List</span>
          </Button>
          <Button
            onClick={() => setShowAddForm(true)}
            disabled={!selectedList}
            className="flex justify-center items-center space-x-2 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </Button>
        </div>
      </div>

      {/* Shopping Lists Tabs */}
      {shoppingLists.length > 0 && (
        <ShoppingListsTabs
          shoppingLists={shoppingLists}
          selectedList={selectedList}
          onSelect={setSelectedList}
          onDelete={deleteList}
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
            onAddFromRecipe={() => {
              console.log("Add from Recipe button clicked, opening modal");
              setShowRecipeModal(true);
            }}
            onAddItem={() => setShowAddForm(true)}
          />

          {/* Search and Filter */}
          <SearchAndFilterBar
            searchTerm={searchTerm}
            onSearchChange={(e) => debouncedSetSearchTerm(e.target.value)}
            selectedCategory={selectedCategory}
            onCategoryChange={(e) => setSelectedCategory(e.target.value)}
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
                <ShoppingCart className="mx-auto mb-4 w-10 h-10 sm:h-12 sm:w-12 text-secondary-400" />
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
              items={filteredItems}
              onEdit={startEditItem}
              onDelete={deleteItem}
              onTogglePurchased={togglePurchased}
            />
          )}

          {filteredItems.length < listItems.length && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={throttle(
                  () =>
                    setListItems(listItems.slice(0, filteredItems.length + 12)),
                  500,
                )}
                disabled={loading}
              >
                Load More
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-8 text-center sm:py-12">
            <ShoppingCart className="mx-auto mb-4 w-10 h-10 sm:h-12 sm:w-12 text-secondary-400" />
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
    </div>
  );
}
