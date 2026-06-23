import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash.debounce";
import throttle from "lodash.throttle";
import {
  AlertTriangle,
  Calendar,
  Edit3,
  Filter,
  MessageCircle,
  Package,
  Plus,
  Search,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ExpirationMonitor } from "../components/alerts/ExpirationMonitor";
import { SmartCategorySelector } from "../components/categories/SmartCategorySelector";
import { AutocompleteInput } from "../components/ui/AutocompleteInput";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import { usePantry } from "../contexts/PantryContext";
import { useSettings } from "../contexts/SettingsContext";
import { useIngredientHistory } from "../hooks/useIngredientHistory";
import { clearCache } from "../lib/database";
import { handleApiError, logError } from "../lib/errorUtils";
import { checkExpiringItems } from "../lib/notificationService";
import type { Ingredient } from "../types";

const CATEGORIES = [
  "Vegetables",
  "Fruits",
  "Meat",
  "Dairy",
  "Grains",
  "Spices",
  "Condiments",
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

const ingredientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  quantity: z.preprocess(
    (val) => Number(val),
    z.number().min(0, "Quantity must be positive")
  ),
  unit: z.string().min(1, "Unit is required"),
  category: z.string().min(1, "Category is required"),
  expiration_date: z.string().optional(),
  notes: z.string().optional(),
  low_stock_threshold: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, "Threshold must be positive").optional()
  ),
});
type IngredientFormData = z.infer<typeof ingredientSchema>;

const SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "expiration_date", label: "Expiration Date" },
  { value: "quantity", label: "Quantity" },
];

// Move getDefaultThreshold to module scope
const getDefaultThreshold = (unit: string): number => {
  switch (unit) {
    case "kg":
    case "l":
      return 0.5;
    case "g":
    case "ml":
      return 100;
    case "cups":
      return 0.5;
    case "tbsp":
    case "tsp":
      return 2;
    default:
      return 1;
  }
};

const NOTIF_CLASS: Record<string, string> = {
  expired: "bg-red-50 text-red-800 border-red-200",
  critical: "bg-orange-50 text-orange-800 border-orange-200",
  warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
};

const NOTIF_ICON_COLOR: Record<string, string> = {
  expired: "text-red-600",
  critical: "text-orange-600",
  warning: "text-yellow-600",
};

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO refactor; tracked separately
export function Pantry() {
  const { user } = useAuth();
  const { getAllIngredientNames } = useIngredientHistory();
  const {
    ingredients,
    loading,
    addIngredient,
    addIngredients,
    updateIngredient,
    deleteIngredient,
  } = usePantry();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null
  );
  const [showNaturalLanguageInput, setShowNaturalLanguageInput] =
    useState(false);
  const [naturalLanguageText, setNaturalLanguageText] = useState("");
  const [parsedIngredients, setParsedIngredients] = useState<
    Array<{
      name: string;
      quantity: number;
      unit: string;
      category: string;
    }>
  >([]);
  const [isParsingText, setIsParsingText] = useState(false);
  const [isAddingToPantry, setIsAddingToPantry] = useState(false);
  const [showExpirationMonitor, setShowExpirationMonitor] = useState(false);
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [itemsToShow, setItemsToShow] = useState(12);
  const [error, _setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<string | null>(
    null
  );
  const { register, handleSubmit, reset, setValue, control, getValues } =
    useForm<IngredientFormData>({
      resolver: zodResolver(ingredientSchema),
      defaultValues: {
        name: "",
        quantity: 0,
        unit: "g",
        category: "Other",
        expiration_date: "",
        notes: "",
        low_stock_threshold: undefined,
      },
    });
  const { settings } = useSettings();
  const defaultInventoryThreshold = settings?.inventory_threshold ?? 1;
  const debouncedSetSearchTerm = useRef(
    debounce((value: string) => setSearchTerm(value), 300)
  ).current;
  const { notify } = useNotification();

  // Notification integration
  useEffect(() => {
    if (!user || loading || !ingredients.length || !settings) {
      return;
    }
    checkExpiringItems({
      ingredients,
      leftovers: [],
      criticalDays: settings.expiration_threshold_days,
      warningDays: Math.max(settings.expiration_threshold_days + 4, 7),
      notificationEnabled: settings.notification_enabled,
      onNotify: ({ item, notificationType, message }) => {
        toast(message, {
          description: `${item.type === "ingredient" ? "Ingredient" : "Leftover"}: ${item.name}`,
          duration: 8000,
          className: NOTIF_CLASS[notificationType] ?? NOTIF_CLASS.warning,
          icon: (
            <AlertTriangle
              className={`size-5 ${NOTIF_ICON_COLOR[notificationType] ?? "text-yellow-600"}`}
            />
          ),
        });
      },
    });
  }, [user, loading, ingredients, settings]);

  const onSubmit = useCallback(
    async (data: IngredientFormData) => {
      if (!user) {
        return;
      }
      try {
        const ingredientData = {
          user_id: user.id,
          ...data,
          expiration_date: data.expiration_date || undefined,
        };
        if (editingIngredient) {
          await updateIngredient(editingIngredient.id, ingredientData);
        } else {
          await addIngredient(ingredientData);
        }
        clearCache(`ingredients_${user.id}`);
        reset();
        setShowAddForm(false);
        setEditingIngredient(null);
      } catch (error) {
        console.error("Error saving ingredient:", error);
        notify(handleApiError(error), { type: "error" });
      }
    },
    [user, editingIngredient, updateIngredient, addIngredient, reset, notify]
  );

  const handleDeleteClick = useCallback((id: string) => {
    setIngredientToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!ingredientToDelete) {
      return;
    }
    try {
      await deleteIngredient(ingredientToDelete);
    } catch (error) {
      console.error("Error deleting ingredient:", error);
      notify(handleApiError(error), { type: "error" });
    } finally {
      setDeleteDialogOpen(false);
      setIngredientToDelete(null);
    }
  }, [ingredientToDelete, deleteIngredient, notify]);

  const resetNaturalLanguageForm = useCallback(() => {
    setNaturalLanguageText("");
    setParsedIngredients([]);
    setShowNaturalLanguageInput(false);
  }, []);

  const parseNaturalLanguageText = useCallback(async () => {
    if (!naturalLanguageText.trim()) {
      return;
    }
    setIsParsingText(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-ingredients`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: naturalLanguageText.trim(),
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setParsedIngredients(data.ingredients || []);
    } catch (error) {
      setParsedIngredients([]);
      notify(handleApiError(error), { type: "error" });
      logError(error, "parseNaturalLanguageText");
    } finally {
      setIsParsingText(false);
    }
  }, [naturalLanguageText, notify]);

  const updateParsedIngredient = useCallback(
    (index: number, field: string, value: string | number) => {
      setParsedIngredients((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        )
      );
    },
    []
  );

  const removeParsedIngredient = useCallback((index: number) => {
    setParsedIngredients((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addParsedIngredientsToPantry = useCallback(async () => {
    if (!user || parsedIngredients.length === 0) {
      return;
    }
    setIsAddingToPantry(true);
    try {
      const ingredientBatch = parsedIngredients.map((ingredient) => ({
        user_id: user.id,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: ingredient.category,
        notes: "Added via natural language input",
        low_stock_threshold: getDefaultThreshold(ingredient.unit),
        expiration_date: undefined,
      }));

      await addIngredients(ingredientBatch);
      clearCache(`ingredients_${user.id}`);
      notify(
        `Added ${ingredientBatch.length} ingredient${ingredientBatch.length === 1 ? "" : "s"} to your pantry`,
        { type: "success" }
      );
      resetNaturalLanguageForm();
    } catch (error) {
      console.error("Error adding parsed ingredients:", error);
      notify(handleApiError(error), { type: "error" });
    } finally {
      setIsAddingToPantry(false);
    }
  }, [
    user,
    parsedIngredients,
    addIngredients,
    resetNaturalLanguageForm,
    notify,
  ]);

  const startEdit = useCallback(
    (ingredient: Ingredient) => {
      setEditingIngredient(ingredient);
      setShowAddForm(true);
      setValue("name", ingredient.name);
      setValue("quantity", ingredient.quantity);
      setValue("unit", ingredient.unit);
      setValue("category", ingredient.category);
      setValue("expiration_date", ingredient.expiration_date || "");
      setValue("notes", ingredient.notes || "");
      setValue("low_stock_threshold", ingredient.low_stock_threshold);
      setShowNaturalLanguageInput(false);
    },
    [setValue]
  );

  const isExpiringSoon = (expirationDate: string | undefined) => {
    if (!expirationDate) {
      return false;
    }
    const expDate = new Date(expirationDate);
    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  const isExpired = (expirationDate: string | undefined) => {
    if (!expirationDate) {
      return false;
    }
    const expDate = new Date(expirationDate);
    const today = new Date();
    return expDate < today;
  };

  const expirationBorderClass = (expirationDate: string | undefined) => {
    if (isExpired(expirationDate)) {
      return "border-red-200 bg-red-50";
    }
    if (isExpiringSoon(expirationDate)) {
      return "border-orange-200 bg-orange-50";
    }
    return "";
  };

  const expirationTextClass = (expirationDate: string | undefined) => {
    if (isExpired(expirationDate)) {
      return "text-red-600";
    }
    if (isExpiringSoon(expirationDate)) {
      return "text-orange-600";
    }
    return "text-secondary-600";
  };

  const isLowStock = (ingredient: Ingredient) => {
    const threshold =
      ingredient.low_stock_threshold ?? defaultInventoryThreshold;
    return ingredient.quantity > 0 && ingredient.quantity <= threshold;
  };

  const isOutOfStock = (ingredient: Ingredient) => ingredient.quantity <= 0;

  // Memoize expensive derived lists
  const sortedIngredients = useMemo(
    () =>
      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO refactor; tracked separately
      [...ingredients].sort((a, b) => {
        let aValue: string | number = "";
        let bValue: string | number = "";
        switch (sortKey) {
          case "name":
            aValue = a.name;
            bValue = b.name;
            break;
          case "expiration_date":
            aValue = a.expiration_date || "9999-12-31";
            bValue = b.expiration_date || "9999-12-31";
            break;
          case "quantity":
            aValue = a.quantity;
            bValue = b.quantity;
            break;
          default:
            break;
        }
        if (typeof aValue === "string" && typeof bValue === "string") {
          if (sortOrder === "asc") {
            return aValue.localeCompare(bValue);
          }
          return bValue.localeCompare(aValue);
        }
        if (typeof aValue === "number" && typeof bValue === "number") {
          if (sortOrder === "asc") {
            return aValue - bValue;
          }
          return bValue - aValue;
        }
        return 0;
      }),
    [ingredients, sortKey, sortOrder]
  );

  const filteredIngredients = useMemo(
    () =>
      sortedIngredients.filter((ingredient) => {
        const matchesSearch = ingredient.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesCategory =
          selectedCategory === "All" ||
          ingredient.category === selectedCategory;
        return matchesSearch && matchesCategory;
      }),
    [sortedIngredients, searchTerm, selectedCategory]
  );

  const paginatedIngredients = useMemo(
    () => filteredIngredients.slice(0, itemsToShow),
    [filteredIngredients, itemsToShow]
  );

  const categoryCounts = CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = ingredients.filter(
        (ing) => ing.category === category
      ).length;
      return acc;
    },
    {} as Record<string, number>
  );

  // Get ingredients with expiration dates for monitoring
  const ingredientsWithExpiration = ingredients.filter(
    (ing) => ing.expiration_date
  );

  if (loading) {
    return (
      <div
        aria-label="Loading pantry"
        className="flex items-center justify-center py-12"
        role="status"
      >
        <div className="size-8 animate-spin rounded-full border-primary border-b-2" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700 text-sm">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-center sm:text-left">
          <h1 className="text-balance font-bold text-secondary-900 text-xl sm:text-2xl">
            My Pantry
          </h1>
          <p className="text-pretty text-secondary-600 text-sm sm:text-base">
            Track your ingredients and expiration dates
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            className="flex items-center justify-center space-x-2 text-sm sm:text-base"
            onClick={() => {
              setShowAddForm(true);
              setShowNaturalLanguageInput(false);
            }}
            variant={showAddForm ? "default" : "outline"}
          >
            <Plus className="size-4" />
            <span>Add Ingredient</span>
          </Button>
          <Button
            className="flex items-center justify-center space-x-2 text-sm sm:text-base"
            onClick={() => {
              setShowNaturalLanguageInput(true);
              setShowAddForm(false);
              setShowExpirationMonitor(false);
            }}
            variant={showNaturalLanguageInput ? "default" : "outline"}
          >
            <MessageCircle className="size-4" />
            <span>Add from Text</span>
          </Button>
          {ingredientsWithExpiration.length > 0 && (
            <Button
              className="flex items-center justify-center space-x-2 text-sm sm:text-base"
              onClick={() => {
                setShowExpirationMonitor(!showExpirationMonitor);
                setShowAddForm(false);
                setShowNaturalLanguageInput(false);
              }}
              variant={showExpirationMonitor ? "default" : "outline"}
            >
              <Calendar className="size-4" />
              <span>Monitor Expiration</span>
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:gap-4 sm:space-y-0">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 transform text-secondary-400" />
          <Input
            className="pl-10 text-sm sm:text-base"
            onChange={(e) => debouncedSetSearchTerm(e.target.value)}
            placeholder="Search ingredients..."
            value={searchTerm}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="size-4 flex-shrink-0 text-secondary-600" />
          <select
            className="flex-1 rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 sm:flex-none"
            onChange={(e) => setSelectedCategory(e.target.value)}
            value={selectedCategory}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category} ({categoryCounts[category] || 0})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sorting Controls */}
      <div className="mb-4 flex items-center gap-2">
        <label className="font-medium text-sm" htmlFor="pantry-sort-key">
          Sort by:
        </label>
        <select
          className="rounded border border-secondary-300 px-2 py-1 text-sm"
          id="pantry-sort-key"
          onChange={(e) => setSortKey(e.target.value)}
          value={sortKey}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          className="rounded border border-secondary-300 px-2 py-1 text-sm"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          type="button"
        >
          {sortOrder === "asc" ? "↑" : "↓"}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">
              {editingIngredient ? "Edit Ingredient" : "Add New Ingredient"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {/* Main fields grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Ingredient Name - full width */}
                <div className="col-span-1 flex flex-col sm:col-span-2 lg:col-span-4">
                  <label
                    className="mb-1 font-medium text-sm"
                    htmlFor="pantry-ingredient-name"
                  >
                    Ingredient Name
                  </label>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <AutocompleteInput
                        id="pantry-ingredient-name"
                        onChange={(value) => field.onChange(value)}
                        onSelect={(suggestion) => {
                          field.onChange(suggestion.name);
                          setValue(
                            "category",
                            suggestion.category || field.value
                          );
                        }}
                        placeholder="Start typing ingredient name..."
                        userHistory={getAllIngredientNames()}
                        value={field.value}
                      />
                    )}
                  />
                </div>
                {/* Quantity */}
                <div className="col-span-1 flex flex-col">
                  <label
                    className="mb-1 font-medium text-sm"
                    htmlFor="pantry-ingredient-quantity"
                  >
                    Quantity
                  </label>
                  <Input
                    id="pantry-ingredient-quantity"
                    step="0.1"
                    type="number"
                    {...register("quantity")}
                  />
                </div>
                {/* Unit */}
                <div className="col-span-1 flex flex-col">
                  <label
                    className="mb-1 font-medium text-sm"
                    htmlFor="pantry-ingredient-unit"
                  >
                    Unit
                  </label>
                  <select
                    id="pantry-ingredient-unit"
                    {...register("unit")}
                    className="h-10 w-full rounded-lg border border-secondary-300 px-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    {UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Expiration Date */}
                <div className="col-span-1 flex flex-col">
                  <label
                    className="mb-1 font-medium text-sm"
                    htmlFor="pantry-ingredient-expiration-date"
                  >
                    Expiration Date
                  </label>
                  <Input
                    id="pantry-ingredient-expiration-date"
                    type="date"
                    {...register("expiration_date")}
                  />
                </div>
                {/* Category - always its own row, but next to Expiration Date on sm+ */}
                <div className="col-span-1 flex min-w-0 flex-col overflow-x-auto">
                  <Controller
                    control={control}
                    name="category"
                    render={({ field }) => (
                      <SmartCategorySelector
                        currentCategory={field.value}
                        ingredientName={field.value}
                        onCategoryChange={(category) =>
                          field.onChange(category)
                        }
                        userHistory={ingredients.map((ing) => ({
                          name: ing.name,
                          category: ing.category,
                        }))}
                      />
                    )}
                  />
                </div>
              </div>
              {/* Threshold and Notes */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                <div className="flex flex-col sm:col-span-6">
                  <label
                    className="mb-1 font-medium text-sm"
                    htmlFor="pantry-ingredient-low-stock-threshold"
                  >
                    Low Stock Threshold
                  </label>
                  <Input
                    id="pantry-ingredient-low-stock-threshold"
                    step="0.1"
                    type="number"
                    {...register("low_stock_threshold")}
                    placeholder={`Default: ${getDefaultThreshold(getValues("unit"))} ${getValues("unit")}`}
                  />
                  <p className="mt-1 text-secondary-600 text-xs">
                    Alert when quantity falls below this amount. Leave empty for
                    default.
                  </p>
                </div>
                <div className="flex flex-col sm:col-span-6">
                  <label
                    className="mb-1 font-medium text-sm"
                    htmlFor="pantry-ingredient-notes"
                  >
                    Notes
                  </label>
                  <Input
                    id="pantry-ingredient-notes"
                    {...register("notes")}
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>
              {/* Buttons */}
              <div className="flex flex-col justify-end space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                <Button className="text-sm sm:text-base" type="submit">
                  {editingIngredient ? "Update Ingredient" : "Add Ingredient"}
                </Button>
                <Button
                  className="text-sm sm:text-base"
                  onClick={() => {
                    reset();
                    setShowAddForm(false);
                    setEditingIngredient(null);
                  }}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Natural Language Input Form */}
      {showNaturalLanguageInput && (
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <MessageCircle className="size-5" />
              <span>Add Ingredients from Text</span>
            </CardTitle>
            <CardDescription>
              Describe your ingredients in natural language (e.g., "3 apples,
              1kg flour, 2 cans of tuna")
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label
                className="mb-2 block font-medium text-secondary-700 text-sm"
                htmlFor="pantry-natural-language-text"
              >
                Describe your ingredients:
              </label>
              <textarea
                className="h-24 w-full resize-none rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                id="pantry-natural-language-text"
                onChange={(e) => setNaturalLanguageText(e.target.value)}
                placeholder="Example: 3 apples, 1kg flour, 2 cans of tuna, 500ml olive oil, 1 liter milk"
                value={naturalLanguageText}
              />
            </div>

            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <Button
                className="flex items-center justify-center space-x-2"
                disabled={!naturalLanguageText.trim() || isParsingText}
                onClick={parseNaturalLanguageText}
              >
                <Wand2 className="size-4" />
                <span>{isParsingText ? "Parsing..." : "Parse Text"}</span>
              </Button>
              <Button
                disabled={isParsingText || isAddingToPantry}
                onClick={resetNaturalLanguageForm}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
            </div>

            {/* Parsed Ingredients Display */}
            {parsedIngredients.length > 0 && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-lg text-secondary-900">
                    Parsed Ingredients ({parsedIngredients.length})
                  </h3>
                  <Button
                    className="flex items-center space-x-2"
                    disabled={isAddingToPantry}
                    onClick={addParsedIngredientsToPantry}
                  >
                    <Plus className="size-4" />
                    <span>
                      {isAddingToPantry ? "Adding..." : "Add All to Pantry"}
                    </span>
                  </Button>
                </div>

                <div className="space-y-3">
                  {parsedIngredients.map((ingredient, index) => (
                    <div
                      className="rounded-lg border border-secondary-200 bg-secondary-50 p-4"
                      key={`${ingredient.name}-${ingredient.quantity}-${ingredient.unit}-${ingredient.category}`}
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        <div>
                          <label
                            className="mb-1 block font-medium text-secondary-700 text-xs"
                            htmlFor={`pantry-parsed-ingredient-${index}-name`}
                          >
                            Name
                          </label>
                          <input
                            className="w-full rounded-md border border-secondary-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
                            id={`pantry-parsed-ingredient-${index}-name`}
                            onChange={(e) =>
                              updateParsedIngredient(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            type="text"
                            value={ingredient.name}
                          />
                        </div>
                        <div>
                          <label
                            className="mb-1 block font-medium text-secondary-700 text-xs"
                            htmlFor={`pantry-parsed-ingredient-${index}-quantity`}
                          >
                            Quantity
                          </label>
                          <input
                            className="w-full rounded-md border border-secondary-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
                            id={`pantry-parsed-ingredient-${index}-quantity`}
                            onChange={(e) =>
                              updateParsedIngredient(
                                index,
                                "quantity",
                                Number.parseFloat(e.target.value) || 0
                              )
                            }
                            step="0.1"
                            type="number"
                            value={ingredient.quantity}
                          />
                        </div>
                        <div>
                          <label
                            className="mb-1 block font-medium text-secondary-700 text-xs"
                            htmlFor={`pantry-parsed-ingredient-${index}-unit`}
                          >
                            Unit
                          </label>
                          <select
                            className="w-full rounded-md border border-secondary-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
                            id={`pantry-parsed-ingredient-${index}-unit`}
                            onChange={(e) =>
                              updateParsedIngredient(
                                index,
                                "unit",
                                e.target.value
                              )
                            }
                            value={ingredient.unit}
                          >
                            {UNITS.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label
                            className="mb-1 block font-medium text-secondary-700 text-xs"
                            htmlFor={`pantry-parsed-ingredient-${index}-category`}
                          >
                            Category
                          </label>
                          <div className="flex items-center space-x-2">
                            <select
                              className="flex-1 rounded-md border border-secondary-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
                              id={`pantry-parsed-ingredient-${index}-category`}
                              onChange={(e) =>
                                updateParsedIngredient(
                                  index,
                                  "category",
                                  e.target.value
                                )
                              }
                              value={ingredient.category}
                            >
                              {CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                            <button
                              className="rounded p-1 text-secondary-400 hover:text-red-600"
                              onClick={() => removeParsedIngredient(index)}
                              type="button"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Expiration Monitor */}
      {showExpirationMonitor && ingredientsWithExpiration.length > 0 && (
        <ExpirationMonitor ingredients={ingredientsWithExpiration} />
      )}

      {/* Ingredients Grid */}
      {paginatedIngredients.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center sm:py-12">
            <Package className="mx-auto mb-4 size-10 text-secondary-400 sm:size-12" />
            <h3 className="mb-2 font-medium text-base text-secondary-900 sm:text-lg">
              No ingredients found
            </h3>
            <p className="mb-4 px-4 text-secondary-600 text-sm sm:text-base">
              {searchTerm || selectedCategory !== "All"
                ? "Try adjusting your search or filter criteria"
                : "Start building your pantry by adding your first ingredient"}
            </p>
            {!searchTerm && selectedCategory === "All" && (
              <Button
                className="text-sm sm:text-base"
                onClick={() => setShowAddForm(true)}
              >
                Add Your First Ingredient
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {paginatedIngredients.map((ingredient) => (
            <Card
              className={`relative ${expirationBorderClass(
                ingredient.expiration_date
              )}`}
              key={ingredient.id}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium text-secondary-900 text-sm sm:text-base">
                      {ingredient.name}
                    </h3>
                    <p className="text-secondary-600 text-xs sm:text-sm">
                      {ingredient.quantity} {ingredient.unit}
                    </p>
                    {isOutOfStock(ingredient) && (
                      <span className="inline-block rounded-full bg-red-100 px-2 py-1 text-red-700 text-xs">
                        Out of Stock
                      </span>
                    )}
                    {isLowStock(ingredient) && !isOutOfStock(ingredient) && (
                      <span className="inline-block rounded-full bg-orange-100 px-2 py-1 text-orange-700 text-xs">
                        Low Stock
                      </span>
                    )}
                    <span className="mt-1 inline-block rounded-full bg-secondary-100 px-2 py-1 text-secondary-700 text-xs">
                      {ingredient.category}
                    </span>
                  </div>
                  <div className="ml-2 flex flex-shrink-0 space-x-1">
                    <button
                      aria-label={`Edit ${ingredient.name}`}
                      className="rounded p-1.5 text-secondary-400 hover:text-secondary-600"
                      onClick={() => startEdit(ingredient)}
                      type="button"
                    >
                      <Edit3 className="size-3 sm:size-4" />
                    </button>
                    <button
                      aria-label={`Delete ${ingredient.name}`}
                      className="rounded p-1.5 text-secondary-400 hover:text-red-600"
                      onClick={() => handleDeleteClick(ingredient.id)}
                      type="button"
                    >
                      <Trash2 className="size-3 sm:size-4" />
                    </button>
                  </div>
                </div>

                {/* Stock Level Alerts */}
                {(isOutOfStock(ingredient) || isLowStock(ingredient)) && (
                  <div
                    className={`mb-2 flex items-center space-x-1 text-xs sm:text-sm ${
                      isOutOfStock(ingredient)
                        ? "text-red-600"
                        : "text-orange-600"
                    }`}
                  >
                    <AlertTriangle className="size-3 flex-shrink-0" />
                    <span className="truncate">
                      {isOutOfStock(ingredient)
                        ? "Out of stock - reorder needed"
                        : `Low stock - below ${ingredient.low_stock_threshold ?? defaultInventoryThreshold} ${ingredient.unit}`}
                    </span>
                  </div>
                )}
                {ingredient.expiration_date && (
                  <div
                    className={`flex items-center space-x-1 text-xs sm:text-sm ${expirationTextClass(
                      ingredient.expiration_date
                    )}`}
                  >
                    {(isExpired(ingredient.expiration_date) ||
                      isExpiringSoon(ingredient.expiration_date)) && (
                      <AlertTriangle className="size-3 flex-shrink-0" />
                    )}
                    <Calendar className="size-3 flex-shrink-0" />
                    <span className="truncate">
                      Expires:{" "}
                      {new Date(
                        ingredient.expiration_date
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {ingredient.notes && (
                  <p className="mt-2 line-clamp-2 text-secondary-500 text-xs">
                    {ingredient.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {itemsToShow < filteredIngredients.length && (
        <div className="mt-6 flex justify-center">
          <Button
            disabled={loading}
            onClick={throttle(() => setItemsToShow(itemsToShow + 12), 500)}
          >
            Load More
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ingredient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this ingredient? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
