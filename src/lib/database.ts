import type {
  ChatMessage,
  Conversation,
  Ingredient,
  Leftover,
  Recipe,
  RecipeIngredient,
  RecipeInstruction,
  ShoppingList,
  ShoppingListItem,
  UserPreferences,
  UserProfile,
} from "../types";
import { handleApiError, logError } from "./errorUtils";
import { supabase } from "./supabase";
import {
  chatMessageInsertSchema,
  chatMessageSchema,
  conversationInsertSchema,
  conversationSchema,
  ingredientInsertSchema,
  ingredientSchema,
  ingredientUpdateSchema,
  leftoverInsertSchema,
  leftoverSchema,
  leftoverUpdateSchema,
  recipeIngredientSchema,
  recipeInsertSchema,
  recipeInstructionSchema,
  recipeSchema,
  recipeUpdateSchema,
  shoppingListInsertSchema,
  shoppingListItemInsertSchema,
  shoppingListItemSchema,
  shoppingListItemUpdateSchema,
  shoppingListSchema,
  shoppingListUpdateSchema,
  userPreferencesSchema,
  userPreferencesUpdateSchema,
  userProfileSchema,
  userProfileUpdateSchema,
  validateOrThrow,
} from "./validation";

// Type for Supabase function result
export type RecipeMatchResult = {
  recipe_id: string;
  recipe_title: string;
  match_percentage: number;
  missing_ingredients: string[];
};

// In-memory cache utility
const _cache: Record<string, unknown> = {};
export function getFromCache<T>(key: string): T | undefined {
  return _cache[key] as T | undefined;
}
export function setToCache<T>(key: string, value: T): void {
  _cache[key] = value;
}
export function clearCache(key?: string): void {
  if (key) {
    delete _cache[key];
  } else {
    Object.keys(_cache).forEach((k) => delete _cache[k]);
  }
}

// Ingredient operations
export const ingredientService = {
  async getAll(userId: string): Promise<Ingredient[]> {
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Validate all returned ingredients
    const validatedData = (data || []).map((item: unknown) =>
      validateOrThrow(ingredientSchema, item),
    );

    return validatedData;
  },

  async create(
    ingredient: Omit<Ingredient, "id" | "created_at" | "updated_at">,
  ): Promise<Ingredient> {
    // Validate input data
    const validatedInput = validateOrThrow(ingredientInsertSchema, ingredient);

    const { data, error } = await supabase
      .from("ingredients")
      .insert([validatedInput])
      .select()
      .single();

    if (error) throw error;

    // Validate output data
    return validateOrThrow(ingredientSchema, data);
  },

  async update(id: string, updates: Partial<Ingredient>): Promise<Ingredient> {
    // Validate input data
    const validatedUpdates = validateOrThrow(ingredientUpdateSchema, updates);

    const { data, error } = await supabase
      .from("ingredients")
      .update(validatedUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Validate output data
    return validateOrThrow(ingredientSchema, data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("ingredients").delete().eq("id", id);

    if (error) throw error;
  },

  async getExpiringSoon(
    userId: string,
    days: number = 7,
  ): Promise<Ingredient[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .eq("user_id", userId)
      .not("expiration_date", "is", null)
      .lte("expiration_date", futureDate.toISOString().split("T")[0])
      .order("expiration_date", { ascending: true });

    if (error) throw error;

    // Validate all returned ingredients
    const validatedData = (data || []).map((item: unknown) =>
      validateOrThrow(ingredientSchema, item),
    );

    return validatedData;
  },

  async addOrUpdateFromShopping(
    userId: string,
    itemName: string,
    quantity: number,
    unit: string,
    category: string = "Other",
  ): Promise<Ingredient> {
    // First, check if an ingredient with similar name already exists
    const { data: existingIngredients, error: searchError } = await supabase
      .from("ingredients")
      .select("*")
      .eq("user_id", userId)
      .ilike("name", `%${itemName}%`);

    if (searchError) throw searchError;

    // Find exact or close match
    const existingIngredient = existingIngredients?.find(
      (ingredient: Ingredient) =>
        ingredient.name.toLowerCase() === itemName.toLowerCase() ||
        ingredient.name.toLowerCase().includes(itemName.toLowerCase()) ||
        itemName.toLowerCase().includes(ingredient.name.toLowerCase()),
    );

    if (existingIngredient) {
      // Update existing ingredient quantity
      const newQuantity = (existingIngredient.quantity || 0) + quantity;

      return await this.update(existingIngredient.id, {
        quantity: newQuantity,
        unit: unit || existingIngredient.unit, // Keep existing unit if new one is empty
      });
    } else {
      // Create new ingredient
      return await this.create({
        user_id: userId,
        name: itemName,
        quantity: quantity,
        unit: unit,
        category: category,
        notes: "Added from shopping list",
      });
    }
  },

  async getLowStockItems(userId: string): Promise<Ingredient[]> {
    const { data, error } = await supabase.rpc("get_low_stock_ingredients", {
      user_uuid: userId,
    });

    if (error) throw error;

    // Validate all returned ingredients
    const validatedData = (data || []).map((item: unknown) =>
      validateOrThrow(ingredientSchema, item),
    );

    return validatedData;
  },

  async updateStockThreshold(
    id: string,
    threshold: number,
  ): Promise<Ingredient> {
    // Validate threshold is non-negative
    if (threshold < 0) {
      throw new Error("Stock threshold must be non-negative");
    }

    const { data, error } = await supabase
      .from("ingredients")
      .update({ low_stock_threshold: threshold })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Validate output data
    return validateOrThrow(ingredientSchema, data);
  },
};

// Recipe operations
export const recipeService = {
  async getAll(): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Validate all returned recipes
    const validatedData = (data || []).map((item: unknown) =>
      validateOrThrow(recipeSchema, item),
    );

    return validatedData;
  },

  async getById(id: string): Promise<Recipe | null> {
    try {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Validate output data
      return data ? validateOrThrow(recipeSchema, data) : null;
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "PGRST116"
      ) {
        return null; // Not found
      }
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: string }).message === "string" &&
        (error as { message?: string }).message!.includes(
          "multiple (or no) rows returned",
        )
      ) {
        return null; // Not found
      }
      logError(error, "recipeService.getById");
      throw new Error(handleApiError(error));
    }
  },

  async getIngredients(recipeId: string): Promise<RecipeIngredient[]> {
    const { data, error } = await supabase
      .from("recipe_ingredients")
      .select("*")
      .eq("recipe_id", recipeId)
      .order("ingredient_name");

    if (error) throw error;

    // Validate all returned recipe ingredients
    const validatedData = (data || []).map((item: unknown) =>
      validateOrThrow(recipeIngredientSchema, item),
    );

    return validatedData;
  },

  async getInstructions(recipeId: string): Promise<RecipeInstruction[]> {
    const { data, error } = await supabase
      .from("recipe_instructions")
      .select("*")
      .eq("recipe_id", recipeId)
      .order("step_number");

    if (error) throw error;

    // Validate all returned recipe instructions
    const validatedData = (data || []).map((item: unknown) =>
      validateOrThrow(recipeInstructionSchema, item),
    );

    return validatedData;
  },

  async getCanCook(userIngredients: string[]): Promise<Recipe[]> {
    if (userIngredients.length === 0) return [];

    // Get all recipes with their ingredients
    const { data: recipesWithIngredients, error } = await supabase
      .from("recipes")
      .select(`
        *,
        recipe_ingredients (
          ingredient_name,
          quantity,
          unit
        )
      `);

    if (error) throw error;

    // Filter recipes that can be made with available ingredients
    const canCookRecipes =
      recipesWithIngredients?.filter(
        (recipe: { recipe_ingredients?: { ingredient_name: string }[] }) => {
          const requiredIngredients =
            recipe.recipe_ingredients?.map((ri: { ingredient_name: string }) =>
              ri.ingredient_name.toLowerCase(),
            ) || [];

          return requiredIngredients.every((required: string) =>
            userIngredients.some(
              (available: string) =>
                available.toLowerCase().includes(required) ||
                required.includes(available.toLowerCase()),
            ),
          );
        },
      ) || [];

    return canCookRecipes;
  },

  async create(
    recipe: Omit<Recipe, "id" | "created_at" | "updated_at">,
  ): Promise<Recipe> {
    // Validate input data
    const validatedInput = validateOrThrow(recipeInsertSchema, recipe);

    const { data, error } = await supabase
      .from("recipes")
      .insert([validatedInput])
      .select()
      .single();

    if (error) throw error;

    // Validate output data
    return validateOrThrow(recipeSchema, data);
  },

  async update(id: string, updates: Partial<Recipe>): Promise<Recipe> {
    // Validate input data
    const validatedUpdates = validateOrThrow(recipeUpdateSchema, updates);

    const { data, error } = await supabase
      .from("recipes")
      .update(validatedUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Validate output data
    return validateOrThrow(recipeSchema, data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("recipes").delete().eq("id", id);

    if (error) throw error;
  },

  async getRecipeMatchesForPantry(
    userId: string,
    options?: {
      minMatchPercentage?: number;
      maxMissingIngredients?: number;
      limit?: number;
      offset?: number;
    },
  ): Promise<RecipeMatchResult[]> {
    const {
      minMatchPercentage = 0,
      maxMissingIngredients = null,
      limit = 50,
      offset = 0,
    } = options || {};
    const { data, error } = await supabase.rpc("match_recipes_to_pantry", {
      user_id: userId,
      min_match_percentage: minMatchPercentage,
      max_missing_ingredients: maxMissingIngredients,
      limit_count: limit,
      offset_count: offset,
    });
    if (error) throw error;
    return (data || []).map((row: RecipeMatchResult) => ({
      recipe_id: row.recipe_id,
      recipe_title: row.recipe_title,
      match_percentage: Number(row.match_percentage),
      missing_ingredients: Array.isArray(row.missing_ingredients)
        ? row.missing_ingredients
        : [],
    }));
  },
};

// Bookmark operations
export const bookmarkService = {
  async getUserBookmarks(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from("user_bookmarks")
      .select("recipe_id")
      .eq("user_id", userId);

    if (error) throw error;
    return data?.map((b: { recipe_id: string }) => b.recipe_id) || [];
  },

  async addBookmark(userId: string, recipeId: string): Promise<boolean> {
    const { error } = await supabase
      .from("user_bookmarks")
      .insert([{ user_id: userId, recipe_id: recipeId }]);

    if (error) {
      if (error.code === "23505") {
        // Duplicate key error - bookmark already exists
        return false;
      }
      throw error;
    }
    return true;
  },

  async removeBookmark(userId: string, recipeId: string): Promise<void> {
    const { error } = await supabase
      .from("user_bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("recipe_id", recipeId);

    if (error) throw error;
  },
};

// Shopping List operations
export const shoppingListService = {
  async getAllLists(userId: string): Promise<ShoppingList[]> {
    const { data, error } = await supabase
      .from("shopping_lists")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Validate all returned shopping lists
    const validatedData = (data || []).map((item: unknown) =>
      validateOrThrow(shoppingListSchema, item),
    );

    return validatedData;
  },

  async createList(
    list: Omit<ShoppingList, "id" | "created_at" | "updated_at">,
  ): Promise<ShoppingList> {
    // Validate input data
    const validatedInput = validateOrThrow(shoppingListInsertSchema, list);

    const { data, error } = await supabase
      .from("shopping_lists")
      .insert([validatedInput])
      .select()
      .single();

    if (error) throw error;

    // Validate output data
    return validateOrThrow(shoppingListSchema, data);
  },

  async updateList(
    id: string,
    updates: Partial<ShoppingList>,
  ): Promise<ShoppingList> {
    // Validate input data
    const validatedUpdates = validateOrThrow(shoppingListUpdateSchema, updates);

    const { data, error } = await supabase
      .from("shopping_lists")
      .update(validatedUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Validate output data
    return validateOrThrow(shoppingListSchema, data);
  },

  async deleteList(id: string): Promise<void> {
    const { error } = await supabase
      .from("shopping_lists")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async getListItems(listId: string): Promise<ShoppingListItem[]> {
    const { data, error } = await supabase
      .from("shopping_list_items")
      .select("*")
      .eq("shopping_list_id", listId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Validate all returned shopping list items
    const validatedData = (data || []).map((item: unknown) =>
      validateOrThrow(shoppingListItemSchema, item),
    );

    return validatedData;
  },

  async createItem(
    item: Omit<ShoppingListItem, "id" | "created_at" | "updated_at">,
  ): Promise<ShoppingListItem> {
    // Validate input data
    const validatedInput = validateOrThrow(shoppingListItemInsertSchema, item);

    const { data, error } = await supabase
      .from("shopping_list_items")
      .insert([validatedInput])
      .select()
      .single();

    if (error) throw error;

    // Validate output data
    return validateOrThrow(shoppingListItemSchema, data);
  },

  async updateItem(
    id: string,
    updates: Partial<ShoppingListItem>,
  ): Promise<ShoppingListItem> {
    // Validate input data
    const validatedUpdates = validateOrThrow(
      shoppingListItemUpdateSchema,
      updates,
    );

    const { data, error } = await supabase
      .from("shopping_list_items")
      .update(validatedUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Validate output data
    return validateOrThrow(shoppingListItemSchema, data);
  },

  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase
      .from("shopping_list_items")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async togglePurchased(
    id: string,
    isPurchased: boolean,
  ): Promise<ShoppingListItem> {
    const { data, error } = await supabase
      .from("shopping_list_items")
      .update({ is_purchased: isPurchased })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Validate output data
    return validateOrThrow(shoppingListItemSchema, data);
  },

  async createFromRecipe(
    listId: string,
    recipeId: string,
    userIngredients: Ingredient[],
  ): Promise<ShoppingListItem[]> {
    // Get recipe ingredients
    const recipeIngredients = await recipeService.getIngredients(recipeId);

    // Filter out ingredients the user already has
    const neededIngredients = recipeIngredients.filter((recipeIng) => {
      return !userIngredients.some(
        (userIng) =>
          userIng.name
            .toLowerCase()
            .includes(recipeIng.ingredient_name.toLowerCase()) ||
          recipeIng.ingredient_name
            .toLowerCase()
            .includes(userIng.name.toLowerCase()),
      );
    });

    // Create shopping list items
    const items = neededIngredients.map((ingredient) => ({
      shopping_list_id: listId,
      name: ingredient.ingredient_name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      category: "Other",
      is_purchased: false,
      notes: ingredient.notes || "",
      recipe_id: recipeId,
    }));

    if (items.length === 0) {
      return [];
    }

    // Validate items before inserting
    const validatedItems = items.map((item: unknown) =>
      validateOrThrow(shoppingListItemInsertSchema, item),
    );

    const { data, error } = await supabase
      .from("shopping_list_items")
      .insert(validatedItems)
      .select();

    if (error) {
      throw error;
    }

    // Validate returned data
    const validatedData = (data || []).map((item: unknown) =>
      validateOrThrow(shoppingListItemSchema, item),
    );

    return validatedData;
  },
  async addToPantryFromShopping(
    userId: string,
    itemName: string,
    quantity: number,
    unit: string,
    category: string = "Other",
  ): Promise<void> {
    await ingredientService.addOrUpdateFromShopping(
      userId,
      itemName,
      quantity,
      unit,
      category,
    );
  },
};

// Leftover operations
export const leftoverService = {
  async getAll(userId: string): Promise<Leftover[]> {
    const { data, error } = await supabase
      .from("leftovers")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Validate all returned leftovers
    const validatedData = (data || []).map((item: unknown) =>
      validateOrThrow(leftoverSchema, item),
    );

    return validatedData;
  },

  async create(
    leftover: Omit<Leftover, "id" | "created_at" | "updated_at">,
  ): Promise<Leftover> {
    // Validate input data
    const validatedInput = validateOrThrow(leftoverInsertSchema, leftover);

    const { data, error } = await supabase
      .from("leftovers")
      .insert([validatedInput])
      .select()
      .single();

    if (error) throw error;

    // Validate output data
    return validateOrThrow(leftoverSchema, data);
  },

  async update(id: string, updates: Partial<Leftover>): Promise<Leftover> {
    // Validate input data
    const validatedUpdates = validateOrThrow(leftoverUpdateSchema, updates);

    const { data, error } = await supabase
      .from("leftovers")
      .update(validatedUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Validate output data
    return validateOrThrow(leftoverSchema, data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("leftovers").delete().eq("id", id);

    if (error) throw error;
  },

  async getExpiringSoon(userId: string, days: number = 3): Promise<Leftover[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from("leftovers")
      .select("*")
      .eq("user_id", userId)
      .not("expiration_date", "is", null)
      .lte("expiration_date", futureDate.toISOString().split("T")[0])
      .order("expiration_date", { ascending: true });

    if (error) throw error;

    // Validate all returned leftovers
    const validatedData = (data || []).map((item: unknown) =>
      validateOrThrow(leftoverSchema, item),
    );

    return validatedData;
  },

  async createFromRecipe(
    userId: string,
    recipeId: string,
    recipeName: string,
    quantity: number = 1,
    unit: string = "portions",
    notes?: string,
  ): Promise<Leftover> {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 3); // Default 3 days for leftovers

    return await this.create({
      user_id: userId,
      name: `${recipeName} (Leftovers)`,
      quantity,
      unit,
      expiration_date: expirationDate.toISOString().split("T")[0],
      source_recipe_id: recipeId,
      notes: notes || "Created from recipe",
    });
  },

  async getByRecipe(userId: string, recipeId: string): Promise<Leftover[]> {
    const { data, error } = await supabase
      .from("leftovers")
      .select("*")
      .eq("user_id", userId)
      .eq("source_recipe_id", recipeId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Validate all returned leftovers
    const validatedData = (data || []).map((item: unknown) =>
      validateOrThrow(leftoverSchema, item),
    );

    return validatedData;
  },
};

// User Profile operations
export const userProfileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      return validateOrThrow(userProfileSchema, data);
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "PGRST116"
      ) {
        return null; // Not found
      }
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: string }).message === "string" &&
        (error as { message?: string }).message!.includes(
          "multiple (or no) rows returned",
        )
      ) {
        return null; // Not found
      }
      logError(error, "userProfileService.getProfile");
      throw new Error(handleApiError(error));
    }
  },

  async updateProfile(
    userId: string,
    updates: Partial<UserProfile>,
  ): Promise<UserProfile> {
    // Validate input data
    const validatedUpdates = validateOrThrow(userProfileUpdateSchema, updates);

    const { data, error } = await supabase
      .from("user_profiles")
      .update(validatedUpdates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;

    // Validate output data
    return validateOrThrow(userProfileSchema, data);
  },
};

// User Preferences operations
export const userPreferencesService = {
  async getPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "PGRST116"
      ) {
        return null; // Not found
      }
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: string }).message === "string" &&
        (error as { message?: string }).message!.includes(
          "multiple (or no) rows returned",
        )
      ) {
        return null; // Not found
      }
      logError(error, "userPreferencesService.getPreferences");
      throw new Error(handleApiError(error));
    }
  },

  async updatePreferences(
    userId: string,
    updates: Partial<UserPreferences>,
  ): Promise<UserPreferences> {
    // Validate input data
    const validatedUpdates = validateOrThrow(
      userPreferencesUpdateSchema,
      updates,
    );

    // Use upsert to either update existing record or create new one
    const dataToUpsert = {
      ...validatedUpdates,
      user_id: userId, // Ensure user_id is included for upsert
    };

    const { data, error } = await supabase
      .from("user_preferences")
      .upsert(dataToUpsert)
      .select()
      .single();

    if (error) throw error;

    // Validate output data
    return validateOrThrow(userPreferencesSchema, data);
  },
};

// Conversation operations
export const conversationService = {
  async getAll(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    // Validate all returned conversations
    const validatedData = (data || []).map((item: unknown) =>
      validateOrThrow(conversationSchema, item),
    );

    return validatedData;
  },

  async create(
    userId: string,
    title: string | null = null,
  ): Promise<Conversation> {
    // Validate input data
    const conversationInput = validateOrThrow(conversationInsertSchema, {
      user_id: userId,
      title,
    });

    const { data, error } = await supabase
      .from("conversations")
      .insert([conversationInput])
      .select()
      .single();

    if (error) throw error;

    // Validate output data
    return validateOrThrow(conversationSchema, data);
  },

  async updateTitle(id: string, title: string): Promise<Conversation> {
    // Validate title using schema
    validateOrThrow(conversationUpdateSchema, { title });

    const { data, error } = await supabase
      .from("conversations")
      .update({ title })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Validate output data
    return validateOrThrow(conversationSchema, data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

// Message operations
export const chatMessageService = {
  async getAll(conversationId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("timestamp", { ascending: true });

    if (error) throw error;

    // Validate all returned chat messages
    const validatedData = (data || []).map((item: unknown) =>
      validateOrThrow(chatMessageSchema, item),
    );

    return validatedData;
  },

  async create(
    conversationId: string,
    sender: "user" | "ai",
    content: string,
    suggestions?: string[] | null,
    recipes?: Recipe[] | null,
  ): Promise<ChatMessage> {
    const messageInput = {
      conversation_id: conversationId,
      sender,
      content,
      ...(suggestions !== undefined ? { suggestions } : {}),
      ...(recipes !== undefined ? { recipes } : {}),
    };

    const validatedInput = validateOrThrow(
      chatMessageInsertSchema,
      messageInput,
    );

    const { data, error } = await supabase
      .from("messages")
      .insert([validatedInput])
      .select()
      .single();

    if (error) throw error;

    // Validate output data
    return validateOrThrow(chatMessageSchema, data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (error) throw error;
  },
};
