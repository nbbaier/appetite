import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ingredientService } from "../lib/database";

interface IngredientHistory {
  name: string;
  frequency: number;
  lastUsed: Date;
  category: string;
}

export function useIngredientHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<IngredientHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const ingredients = await ingredientService.getAll(user.id);

      // Process ingredients to create history with frequency
      const historyMap = new Map<string, IngredientHistory>();

      ingredients.forEach((ingredient) => {
        const name = ingredient.name.toLowerCase();
        const existing = historyMap.get(name);

        if (existing) {
          existing.frequency += 1;
          if (new Date(ingredient.created_at) > existing.lastUsed) {
            existing.lastUsed = new Date(ingredient.created_at);
          }
        } else {
          historyMap.set(name, {
            name: ingredient.name,
            frequency: 1,
            lastUsed: new Date(ingredient.created_at),
            category: ingredient.category,
          });
        }
      });

      // Convert to array and sort by frequency and recency
      const historyArray = Array.from(historyMap.values()).sort((a, b) => {
        // First sort by frequency (descending)
        if (b.frequency !== a.frequency) {
          return b.frequency - a.frequency;
        }
        // Then by recency (most recent first)
        return b.lastUsed.getTime() - a.lastUsed.getTime();
      });

      setHistory(historyArray);
    } catch (error) {
      console.error("Error loading ingredient history:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user, loadHistory]);

  const getFrequentIngredients = (limit: number = 10) => {
    return history
      .filter((item) => item.frequency > 1)
      .slice(0, limit)
      .map((item) => item.name);
  };

  const getRecentIngredients = (limit: number = 10) => {
    return history
      .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
      .slice(0, limit)
      .map((item) => item.name);
  };

  const getAllIngredientNames = () => {
    return history.map((item) => item.name);
  };

  return {
    history,
    loading,
    getFrequentIngredients,
    getRecentIngredients,
    getAllIngredientNames,
    refreshHistory: loadHistory,
  };
}
