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
import {
  clearCache,
  getFromCache,
  ingredientService,
  setToCache,
} from "../lib/database";
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
    z.number().min(0, "Quantity must be positive"),
  ),
  unit: z.string().min(1, "Unit is required"),
  category: z.string().min(1, "Category is required"),
  expiration_date: z.string().optional(),
  notes: z.string().optional(),
  low_stock_threshold: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, "Threshold must be positive").optional(),
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
    case "pieces":
    case "cans":
    case "bottles":
    default:
      return 1;
  }
};

export function Pantry() {
  const { user } = useAuth();
  const { getAllIngredientNames } = useIngredientHistory();
  const {
    ingredients,
    loading,
    addIngredient,
    updateIngredient,
    deleteIngredient,
  } = usePantry();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null,
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
    debounce((value: string) => setSearchTerm(value), 300),
  ).current;
  const { notify } = useNotification();

  // Notification integration
  useEffect(() => {
    if (!user || loading || !ingredients.length || !settings) return;
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
          className:
            notificationType === "expired"
              ? "bg-red-50 text-red-800 border-red-200"
              : notificationType === "critical"
                ? "bg-orange-50 text-orange-800 border-orange-200"
                : "bg-yellow-50 text-yellow-800 border-yellow-200",
          icon:
            notificationType === "expired" ? (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            ) : notificationType === "critical" ? (
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            ),
        });
      },
    });
  }, [user, loading, ingredients, settings]);

  // Replace ingredient fetch with caching and throttling
  useEffect(() => {
    const fetchIngredients = throttle(async () => {
      if (!user) return;
      let cached = getFromCache<Ingredient[]>(`ingredients_${user.id}`);
      if (!cached) {
        cached = await ingredientService.getAll(user.id);
        setToCache(`ingredients_${user.id}`, cached);
      }
    }, 1000);
    fetchIngredients();
  }, [user]);

  const onSubmit = useCallback(
    async (data: IngredientFormData) => {
      if (!user) return;
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
    [user, editingIngredient, updateIngredient, addIngredient, reset, notify],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Are you sure you want to delete this ingredient?")) return;
      try {
        await deleteIngredient(id);
      } catch (error) {
        console.error("Error deleting ingredient:", error);
        notify(handleApiError(error), { type: "error" });
      }
    },
    [deleteIngredient, notify],
  );

  const resetNaturalLanguageForm = useCallback(() => {
    setNaturalLanguageText("");
    setParsedIngredients([]);
    setShowNaturalLanguageInput(false);
  }, []);

  const parseNaturalLanguageText = useCallback(async () => {
    if (!naturalLanguageText.trim()) return;
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
        },
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
          i === index ? { ...item, [field]: value } : item,
        ),
      );
    },
    [],
  );

  const removeParsedIngredient = useCallback((index: number) => {
    setParsedIngredients((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addParsedIngredientsToPantry = useCallback(async () => {
    if (!user || parsedIngredients.length === 0) return;
    setIsAddingToPantry(true);
    try {
      for (const ingredient of parsedIngredients) {
        await addIngredient({
          user_id: user.id,
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          category: ingredient.category,
          notes: "Added via natural language input",
          low_stock_threshold: getDefaultThreshold(ingredient.unit),
          expiration_date: undefined,
        });
      }
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
    addIngredient,
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
    [setValue],
  );

  const isExpiringSoon = (expirationDate: string | undefined) => {
    if (!expirationDate) return false;
    const expDate = new Date(expirationDate);
    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  const isExpired = (expirationDate: string | undefined) => {
    if (!expirationDate) return false;
    const expDate = new Date(expirationDate);
    const today = new Date();
    return expDate < today;
  };

  const isLowStock = (ingredient: Ingredient) => {
    const threshold =
      ingredient.low_stock_threshold ?? defaultInventoryThreshold;
    return ingredient.quantity > 0 && ingredient.quantity <= threshold;
  };

  const isOutOfStock = (ingredient: Ingredient) => {
    return ingredient.quantity <= 0;
  };

  // Memoize expensive derived lists
  const sortedIngredients = useMemo(() => {
    return [...ingredients].sort((a, b) => {
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
        if (sortOrder === "asc") return aValue.localeCompare(bValue);
        return bValue.localeCompare(aValue);
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        if (sortOrder === "asc") return aValue - bValue;
        return bValue - aValue;
      }
      return 0;
    });
  }, [ingredients, sortKey, sortOrder]);

  const filteredIngredients = useMemo(() => {
    return sortedIngredients.filter((ingredient) => {
      const matchesSearch = ingredient.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || ingredient.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [sortedIngredients, searchTerm, selectedCategory]);

  const paginatedIngredients = useMemo(
    () => filteredIngredients.slice(0, itemsToShow),
    [filteredIngredients, itemsToShow],
  );

  const categoryCounts = CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = ingredients.filter(
        (ing) => ing.category === category,
      ).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Get ingredients with expiration dates for monitoring
  const ingredientsWithExpiration = ingredients.filter(
    (ing) => ing.expiration_date,
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 rounded-full border-b-2 animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-center sm:text-left">
          <h1 className="text-xl font-bold sm:text-2xl text-secondary-900">
            My Pantry
          </h1>
          <p className="text-sm sm:text-base text-secondary-600">
            Track your ingredients and expiration dates
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={() => {
              setShowAddForm(true);
              setShowNaturalLanguageInput(false);
            }}
            variant={showAddForm ? "default" : "outline"}
            className="flex justify-center items-center space-x-2 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            <span>Add Ingredient</span>
          </Button>
          <Button
            onClick={() => {
              setShowNaturalLanguageInput(true);
              setShowAddForm(false);
              setShowExpirationMonitor(false);
            }}
            variant={showNaturalLanguageInput ? "default" : "outline"}
            className="flex justify-center items-center space-x-2 text-sm sm:text-base"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Add from Text</span>
          </Button>
          {ingredientsWithExpiration.length > 0 && (
            <Button
              onClick={() => {
                setShowExpirationMonitor(!showExpirationMonitor);
                setShowAddForm(false);
                setShowNaturalLanguageInput(false);
              }}
              variant={showExpirationMonitor ? "default" : "outline"}
              className="flex justify-center items-center space-x-2 text-sm sm:text-base"
            >
              <Calendar className="w-4 h-4" />
              <span>Monitor Expiration</span>
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-secondary-400" />
          <Input
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={(e) => debouncedSetSearchTerm(e.target.value)}
            className="pl-10 text-sm sm:text-base"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="flex-shrink-0 w-4 h-4 text-secondary-600" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 px-3 py-2 text-sm rounded-lg border sm:flex-none border-secondary-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
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
      <div className="flex gap-2 items-center mb-4">
        <label className="text-sm font-medium">Sort by:</label>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          className="px-2 py-1 text-sm rounded border border-secondary-300"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="px-2 py-1 text-sm rounded border border-secondary-300"
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Main fields grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Ingredient Name - full width */}
                <div className="flex flex-col col-span-1 sm:col-span-2 lg:col-span-4">
                  <label className="mb-1 text-sm font-medium">
                    Ingredient Name
                  </label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <AutocompleteInput
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        onSelect={(suggestion) => {
                          field.onChange(suggestion.name);
                          setValue(
                            "category",
                            suggestion.category || field.value,
                          );
                        }}
                        userHistory={getAllIngredientNames()}
                        placeholder="Start typing ingredient name..."
                      />
                    )}
                  />
                </div>
                {/* Quantity */}
                <div className="flex flex-col col-span-1">
                  <label className="mb-1 text-sm font-medium">Quantity</label>
                  <Input type="number" step="0.1" {...register("quantity")} />
                </div>
                {/* Unit */}
                <div className="flex flex-col col-span-1">
                  <label className="mb-1 text-sm font-medium">Unit</label>
                  <select
                    {...register("unit")}
                    className="px-2 w-full h-10 text-sm rounded-lg border border-secondary-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    {UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Expiration Date */}
                <div className="flex flex-col col-span-1">
                  <label className="mb-1 text-sm font-medium">
                    Expiration Date
                  </label>
                  <Input type="date" {...register("expiration_date")} />
                </div>
                {/* Category - always its own row, but next to Expiration Date on sm+ */}
                <div className="flex overflow-x-auto flex-col col-span-1 min-w-0">
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <SmartCategorySelector
                        ingredientName={field.value}
                        currentCategory={field.value}
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
                  <label className="mb-1 text-sm font-medium">
                    Low Stock Threshold
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    {...register("low_stock_threshold")}
                    placeholder={`Default: ${getDefaultThreshold(getValues("unit"))} ${getValues("unit")}`}
                  />
                  <p className="mt-1 text-xs text-secondary-600">
                    Alert when quantity falls below this amount. Leave empty for
                    default.
                  </p>
                </div>
                <div className="flex flex-col sm:col-span-6">
                  <label className="mb-1 text-sm font-medium">Notes</label>
                  <Input
                    {...register("notes")}
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>
              {/* Buttons */}
              <div className="flex flex-col justify-end space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                <Button type="submit" className="text-sm sm:text-base">
                  {editingIngredient ? "Update Ingredient" : "Add Ingredient"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setShowAddForm(false);
                    setEditingIngredient(null);
                  }}
                  className="text-sm sm:text-base"
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
              <MessageCircle className="w-5 h-5" />
              <span>Add Ingredients from Text</span>
            </CardTitle>
            <CardDescription>
              Describe your ingredients in natural language (e.g., "3 apples,
              1kg flour, 2 cans of tuna")
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-secondary-700">
                Describe your ingredients:
              </label>
              <textarea
                value={naturalLanguageText}
                onChange={(e) => setNaturalLanguageText(e.target.value)}
                placeholder="Example: 3 apples, 1kg flour, 2 cans of tuna, 500ml olive oil, 1 liter milk"
                className="px-3 py-2 w-full h-24 text-sm rounded-lg border resize-none border-secondary-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button
                onClick={parseNaturalLanguageText}
                disabled={!naturalLanguageText.trim() || isParsingText}
                className="flex justify-center items-center space-x-2"
              >
                <Wand2 className="w-4 h-4" />
                <span>{isParsingText ? "Parsing..." : "Parse Text"}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetNaturalLanguageForm}
                disabled={isParsingText || isAddingToPantry}
              >
                Cancel
              </Button>
            </div>

            {/* Parsed Ingredients Display */}
            {parsedIngredients.length > 0 && (
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-secondary-900">
                    Parsed Ingredients ({parsedIngredients.length})
                  </h3>
                  <Button
                    onClick={addParsedIngredientsToPantry}
                    disabled={isAddingToPantry}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>
                      {isAddingToPantry ? "Adding..." : "Add All to Pantry"}
                    </span>
                  </Button>
                </div>

                <div className="space-y-3">
                  {parsedIngredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border bg-secondary-50 border-secondary-200"
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        <div>
                          <label className="block mb-1 text-xs font-medium text-secondary-700">
                            Name
                          </label>
                          <input
                            type="text"
                            value={ingredient.name}
                            onChange={(e) =>
                              updateParsedIngredient(
                                index,
                                "name",
                                e.target.value,
                              )
                            }
                            className="px-2 py-1 w-full text-sm rounded-md border border-secondary-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-xs font-medium text-secondary-700">
                            Quantity
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={ingredient.quantity}
                            onChange={(e) =>
                              updateParsedIngredient(
                                index,
                                "quantity",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="px-2 py-1 w-full text-sm rounded-md border border-secondary-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-xs font-medium text-secondary-700">
                            Unit
                          </label>
                          <select
                            value={ingredient.unit}
                            onChange={(e) =>
                              updateParsedIngredient(
                                index,
                                "unit",
                                e.target.value,
                              )
                            }
                            className="px-2 py-1 w-full text-sm rounded-md border border-secondary-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
                          >
                            {UNITS.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block mb-1 text-xs font-medium text-secondary-700">
                            Category
                          </label>
                          <div className="flex items-center space-x-2">
                            <select
                              value={ingredient.category}
                              onChange={(e) =>
                                updateParsedIngredient(
                                  index,
                                  "category",
                                  e.target.value,
                                )
                              }
                              className="flex-1 px-2 py-1 text-sm rounded-md border border-secondary-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
                            >
                              {CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => removeParsedIngredient(index)}
                              className="p-1 rounded text-secondary-400 hover:text-red-600"
                            >
                              <X className="w-4 h-4" />
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
            <Package className="mx-auto mb-4 w-10 h-10 sm:h-12 sm:w-12 text-secondary-400" />
            <h3 className="mb-2 text-base font-medium sm:text-lg text-secondary-900">
              No ingredients found
            </h3>
            <p className="px-4 mb-4 text-sm sm:text-base text-secondary-600">
              {searchTerm || selectedCategory !== "All"
                ? "Try adjusting your search or filter criteria"
                : "Start building your pantry by adding your first ingredient"}
            </p>
            {!searchTerm && selectedCategory === "All" && (
              <Button
                onClick={() => setShowAddForm(true)}
                className="text-sm sm:text-base"
              >
                Add Your First Ingredient
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          {paginatedIngredients.map((ingredient) => (
            <Card
              key={ingredient.id}
              className={`relative ${
                isExpired(ingredient.expiration_date)
                  ? "border-red-200 bg-red-50"
                  : isExpiringSoon(ingredient.expiration_date)
                    ? "border-orange-200 bg-orange-50"
                    : ""
              }`}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate text-secondary-900 sm:text-base">
                      {ingredient.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-secondary-600">
                      {ingredient.quantity} {ingredient.unit}
                    </p>
                    {isOutOfStock(ingredient) && (
                      <span className="inline-block px-2 py-1 text-xs text-red-700 bg-red-100 rounded-full">
                        Out of Stock
                      </span>
                    )}
                    {isLowStock(ingredient) && !isOutOfStock(ingredient) && (
                      <span className="inline-block px-2 py-1 text-xs text-orange-700 bg-orange-100 rounded-full">
                        Low Stock
                      </span>
                    )}
                    <span className="inline-block px-2 py-1 mt-1 text-xs rounded-full bg-secondary-100 text-secondary-700">
                      {ingredient.category}
                    </span>
                  </div>
                  <div className="flex flex-shrink-0 ml-2 space-x-1">
                    <button
                      onClick={() => startEdit(ingredient)}
                      className="p-1.5 text-secondary-400 hover:text-secondary-600 rounded"
                    >
                      <Edit3 className="w-3 h-3 sm:h-4 sm:w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ingredient.id)}
                      className="p-1.5 text-secondary-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-3 h-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>

                {/* Stock Level Alerts */}
                {(isOutOfStock(ingredient) || isLowStock(ingredient)) && (
                  <div
                    className={`flex items-center space-x-1 text-xs sm:text-sm mb-2 ${
                      isOutOfStock(ingredient)
                        ? "text-red-600"
                        : "text-orange-600"
                    }`}
                  >
                    <AlertTriangle className="flex-shrink-0 w-3 h-3" />
                    <span className="truncate">
                      {isOutOfStock(ingredient)
                        ? "Out of stock - reorder needed"
                        : `Low stock - below ${ingredient.low_stock_threshold ?? defaultInventoryThreshold} ${ingredient.unit}`}
                    </span>
                  </div>
                )}
                {ingredient.expiration_date && (
                  <div
                    className={`flex items-center space-x-1 text-xs sm:text-sm ${
                      isExpired(ingredient.expiration_date)
                        ? "text-red-600"
                        : isExpiringSoon(ingredient.expiration_date)
                          ? "text-orange-600"
                          : "text-secondary-600"
                    }`}
                  >
                    {(isExpired(ingredient.expiration_date) ||
                      isExpiringSoon(ingredient.expiration_date)) && (
                      <AlertTriangle className="flex-shrink-0 w-3 h-3" />
                    )}
                    <Calendar className="flex-shrink-0 w-3 h-3" />
                    <span className="truncate">
                      Expires:{" "}
                      {new Date(
                        ingredient.expiration_date,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {ingredient.notes && (
                  <p className="mt-2 text-xs text-secondary-500 line-clamp-2">
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
        <div className="flex justify-center mt-6">
          <Button
            onClick={throttle(() => setItemsToShow(itemsToShow + 12), 500)}
            disabled={loading}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
