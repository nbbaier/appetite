import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ingredientService } from "../lib/database";
import { supabase } from "../lib/supabase";
import type { Ingredient } from "../types";
import { useAuth } from "./AuthContext";

interface PantryContextType {
  ingredients: Ingredient[];
  loading: boolean;
  loadIngredients: () => Promise<void>;
  addIngredient: (
    ingredient: Omit<Ingredient, "id" | "created_at" | "updated_at">,
  ) => Promise<void>;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => Promise<void>;
  deleteIngredient: (id: string) => Promise<void>;
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
}

const PantryContext = createContext<PantryContextType | undefined>(undefined);

export const PantryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  const loadIngredients = useCallback(async () => {
    console.log("loadIngredients called");
    if (!user) return;
    try {
      setLoading(true);
      const data = await ingredientService.getAll(user.id);
      setIngredients(data);
    } catch (error) {
      console.error("Error loading ingredients:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addIngredient = useCallback(
    async (
      ingredient: Omit<Ingredient, "id" | "created_at" | "updated_at">,
    ) => {
      if (!user) return;
      try {
        await ingredientService.create(ingredient);
        await loadIngredients();
      } catch (error) {
        console.error("Error adding ingredient:", error);
      }
    },
    [user, loadIngredients],
  );

  const updateIngredient = useCallback(
    async (id: string, updates: Partial<Ingredient>) => {
      if (!user) return;
      try {
        await ingredientService.update(id, updates);
        await loadIngredients();
      } catch (error) {
        console.error("Error updating ingredient:", error);
      }
    },
    [user, loadIngredients],
  );

  const deleteIngredient = useCallback(
    async (id: string) => {
      if (!user) return;
      try {
        await ingredientService.delete(id);
        await loadIngredients();
      } catch (error) {
        console.error("Error deleting ingredient:", error);
      }
    },
    [user, loadIngredients],
  );

  useEffect(() => {
    if (user) {
      loadIngredients();
    }
  }, [user, loadIngredients]);

  useEffect(() => {
    if (!user) return;
    // Subscribe to real-time changes for the user's ingredients
    const channel = supabase
      .channel("ingredients-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ingredients",
          filter: `user_id=eq.${user.id}`,
        },
        (_payload) => {
          // Reload ingredients on any change
          loadIngredients();
        },
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [user, loadIngredients]);

  return (
    <PantryContext.Provider
      value={{
        ingredients,
        loading,
        loadIngredients,
        addIngredient,
        updateIngredient,
        deleteIngredient,
        setIngredients,
      }}
    >
      {children}
    </PantryContext.Provider>
  );
};

export function usePantry() {
  const context = useContext(PantryContext);
  if (!context) {
    throw new Error("usePantry must be used within a PantryProvider");
  }
  return context;
}
