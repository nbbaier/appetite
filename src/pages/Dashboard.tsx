import {
  AlertTriangle,
  BookOpen,
  Clock,
  Package,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  Utensils,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExpirationMonitor } from "../components/alerts/ExpirationMonitor";
import { LowStockAlert } from "../components/alerts/LowStockAlert";
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
import {
  ingredientService,
  leftoverService,
  recipeService,
} from "../lib/database";
import type { Ingredient, Leftover, Recipe } from "../types";

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalIngredients: 0,
    availableRecipes: 0,
    expiringSoon: 0,
    canCookRecipes: 0,
    lowStockItems: 0,
    expiringLeftovers: 0,
    totalLeftovers: 0,
  });
  const [expiringSoonItems, setExpiringSoonItems] = useState<Ingredient[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Ingredient[]>([]);
  const [canCookRecipes, setCanCookRecipes] = useState<Recipe[]>([]);
  const [expiringLeftovers, setExpiringLeftovers] = useState<Leftover[]>([]);
  const [_allLeftovers, setAllLeftovers] = useState<Leftover[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);

      // Load ingredients, recipes, and leftovers
      const [ingredients, recipes, expiringLeftoversData, allLeftoversData] =
        await Promise.all([
          ingredientService.getAll(user.id),
          recipeService.getAll(),
          leftoverService.getExpiringSoon(user.id, 3), // 3 days for leftovers
          leftoverService.getAll(user.id), // All leftovers for total count
        ]);

      // Get expiring items
      const expiring = await ingredientService.getExpiringSoon(user.id, 7);

      // Get low stock items
      const lowStock = await ingredientService.getLowStockItems(user.id);
      // Get recipes that can be cooked
      const ingredientNames = ingredients.map((ing) => ing.name);
      const canCook = await recipeService.getCanCook(ingredientNames);

      setStats({
        totalIngredients: ingredients.length,
        availableRecipes: recipes.length,
        expiringSoon: expiring.length,
        canCookRecipes: canCook.length,
        lowStockItems: lowStock.length,
        expiringLeftovers: expiringLeftoversData.length,
        totalLeftovers: allLeftoversData.length,
      });

      setExpiringSoonItems(expiring.slice(0, 5)); // Show top 5
      setLowStockItems(lowStock.slice(0, 5)); // Show top 5
      setCanCookRecipes(canCook.slice(0, 3)); // Show top 3
      setExpiringLeftovers(expiringLeftoversData.slice(0, 3)); // Show top 3
      setAllLeftovers(allLeftoversData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  const getDaysUntilExpiration = (expirationDate: string) => {
    const expDate = new Date(expirationDate);
    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="font-bold text-secondary-900 text-xl sm:text-2xl">
          Dashboard
        </h1>
        <p className="text-secondary-600 text-sm sm:text-base">
          Welcome back! Here's what's happening in your kitchen.
        </p>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <LowStockAlert
          ingredients={lowStockItems}
          onViewPantry={() => (window.location.href = "/pantry")}
        />
      )}

      {/* Expiring Leftovers Alert */}
      {expiringLeftovers.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="shrink-0">
                <div className="rounded-lg bg-orange-100 p-2">
                  <Utensils className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center space-x-2">
                  <h3 className="font-semibold text-orange-900">
                    Leftovers Expiring Soon
                  </h3>
                  <Badge
                    className="border-orange-300 bg-orange-100 text-orange-800"
                    variant="outline"
                  >
                    {stats.expiringLeftovers} item
                    {stats.expiringLeftovers === 1 ? "" : "s"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {expiringLeftovers.map((leftover) => {
                    const daysLeft = getDaysUntilExpiration(
                      leftover.expiration_date ?? ""
                    );
                    return (
                      <div
                        className="flex items-center justify-between text-sm"
                        key={leftover.id}
                      >
                        <span className="truncate font-medium text-orange-900">
                          {leftover.name}
                        </span>
                        <div className="ml-2 flex shrink-0 items-center space-x-2">
                          <span className="text-orange-700 text-xs">
                            {leftover.quantity} {leftover.unit}
                          </span>
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              daysLeft <= 0
                                ? "bg-red-100 text-red-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {daysLeft <= 0
                              ? "Expired"
                              : `${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Link to="/leftovers">
                  <button
                    className="mt-3 font-medium text-orange-700 text-sm underline hover:text-orange-800"
                    type="button"
                  >
                    View All Leftovers →
                  </button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Expiration Monitor */}
      {expiringSoonItems.length > 0 && (
        <ExpirationMonitor className="mb-6" ingredients={expiringSoonItems} />
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5 lg:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <Package className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
              </div>
              <div className="ml-3 min-w-0 flex-1 sm:ml-4">
                <p className="truncate font-medium text-secondary-600 text-xs sm:text-sm">
                  Pantry Items
                </p>
                <p className="font-bold text-lg text-secondary-900 sm:text-2xl">
                  {stats.totalIngredients}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <Sparkles className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
              </div>
              <div className="ml-3 min-w-0 flex-1 sm:ml-4">
                <p className="truncate font-medium text-secondary-600 text-xs sm:text-sm">
                  Can Cook
                </p>
                <p className="font-bold text-lg text-secondary-900 sm:text-2xl">
                  {stats.canCookRecipes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <BookOpen className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
              </div>
              <div className="ml-3 min-w-0 flex-1 sm:ml-4">
                <p className="truncate font-medium text-secondary-600 text-xs sm:text-sm">
                  Total Recipes
                </p>
                <p className="font-bold text-lg text-secondary-900 sm:text-2xl">
                  {stats.availableRecipes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <Utensils className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
              </div>
              <div className="ml-3 min-w-0 flex-1 sm:ml-4">
                <p className="truncate font-medium text-secondary-600 text-xs sm:text-sm">
                  Leftovers
                </p>
                <p className="font-bold text-lg text-secondary-900 sm:text-2xl">
                  {stats.totalLeftovers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <Clock
                  className={`h-6 w-6 sm:h-8 sm:w-8 ${stats.expiringSoon > 0 ? "text-orange-600" : "text-primary"}`}
                />
              </div>
              <div className="ml-3 min-w-0 flex-1 sm:ml-4">
                <p className="truncate font-medium text-secondary-600 text-xs sm:text-sm">
                  Expiring Soon
                </p>
                <p className="font-bold text-lg text-secondary-900 sm:text-2xl">
                  {stats.expiringSoon}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {stats.expiringLeftovers > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="shrink-0">
                  <Utensils className="h-6 w-6 text-orange-600 sm:h-8 sm:w-8" />
                </div>
                <div className="ml-3 min-w-0 flex-1 sm:ml-4">
                  <p className="truncate font-medium text-orange-700 text-xs sm:text-sm">
                    Leftovers Expiring
                  </p>
                  <p className="font-bold text-lg text-orange-900 sm:text-2xl">
                    {stats.expiringLeftovers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Additional Stats Row for Low Stock */}
      {stats.lowStockItems > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="shrink-0">
                  <TrendingDown className="h-6 w-6 text-orange-600 sm:h-8 sm:w-8" />
                </div>
                <div className="ml-3 min-w-0 flex-1 sm:ml-4">
                  <p className="truncate font-medium text-orange-700 text-xs sm:text-sm">
                    Low Stock
                  </p>
                  <p className="font-bold text-lg text-orange-900 sm:text-2xl">
                    {stats.lowStockItems}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* What Can I Cook */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
              <CardTitle className="text-base sm:text-lg">
                What Can I Cook?
              </CardTitle>
            </div>
            <CardDescription className="text-sm">
              Recipes you can make with your current ingredients
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {canCookRecipes.length > 0 ? (
              <div className="space-y-3">
                {canCookRecipes.map((recipe) => (
                  <div
                    className="flex items-center space-x-3 rounded-lg bg-secondary-50 p-3"
                    key={recipe.id}
                  >
                    <img
                      alt={recipe.title}
                      className="h-10 w-10 shrink-0 rounded-lg object-cover sm:h-12 sm:w-12"
                      height={48}
                      src={
                        recipe.image_url ||
                        "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
                      }
                      width={48}
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-medium text-secondary-900 text-sm sm:text-base">
                        {recipe.title}
                      </h4>
                      <p className="text-secondary-600 text-xs sm:text-sm">
                        {recipe.prep_time + recipe.cook_time} min •{" "}
                        {recipe.difficulty}
                      </p>
                    </div>
                  </div>
                ))}
                <Link to="/recipes">
                  <Button className="w-full text-sm sm:text-base">
                    View All Recipes
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="py-6 text-center">
                <BookOpen className="mx-auto mb-3 h-10 w-10 text-secondary-400 sm:h-12 sm:w-12" />
                <p className="mb-4 text-secondary-600 text-sm sm:text-base">
                  Add ingredients to your pantry to discover recipes you can
                  cook!
                </p>
                <Link to="/pantry">
                  <Button className="text-sm sm:text-base">
                    Add Ingredients
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expiring Soon */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle
                className={`h-4 w-4 sm:h-5 sm:w-5 ${stats.expiringSoon > 0 ? "text-orange-600" : "text-secondary-400"}`}
              />
              <CardTitle className="text-base sm:text-lg">
                Expiring Soon
              </CardTitle>
            </div>
            <CardDescription className="text-sm">
              Items in your pantry that need attention
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {expiringSoonItems.length > 0 ? (
              <div className="space-y-3">
                {expiringSoonItems.map((item) => {
                  const daysLeft = getDaysUntilExpiration(
                    item.expiration_date ?? ""
                  );
                  return (
                    <div
                      className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-3"
                      key={item.id}
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-medium text-secondary-900 text-sm sm:text-base">
                          {item.name}
                        </h4>
                        <p className="text-secondary-600 text-xs sm:text-sm">
                          {item.quantity} {item.unit}
                        </p>
                      </div>
                      <div className="ml-2 shrink-0 text-right">
                        <span
                          className={`font-medium text-xs sm:text-sm ${
                            daysLeft <= 1
                              ? "text-red-600"
                              : daysLeft <= 3
                                ? "text-orange-600"
                                : "text-orange-600"
                          }`}
                        >
                          {daysLeft <= 0
                            ? "Expired"
                            : `${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <Link to="/pantry">
                  <Button
                    className="w-full text-sm sm:text-base"
                    variant="outline"
                  >
                    Manage Pantry
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="py-6 text-center">
                <Clock className="mx-auto mb-3 h-10 w-10 text-secondary-400 sm:h-12 sm:w-12" />
                <p className="mb-4 text-secondary-600 text-sm sm:text-base">
                  No items expiring soon. Your pantry is well managed!
                </p>
                <Link to="/pantry">
                  <Button className="text-sm sm:text-base" variant="outline">
                    View Pantry
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <Link to="/pantry">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="p-4 text-center sm:p-6">
              <Package className="mx-auto mb-2 h-6 w-6 text-primary sm:h-8 sm:w-8" />
              <h3 className="font-medium text-secondary-900 text-sm sm:text-base">
                Manage Pantry
              </h3>
              <p className="text-secondary-600 text-xs sm:text-sm">
                Add and track ingredients
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/recipes">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="p-4 text-center sm:p-6">
              <BookOpen className="mx-auto mb-2 h-6 w-6 text-primary sm:h-8 sm:w-8" />
              <h3 className="font-medium text-secondary-900 text-sm sm:text-base">
                Browse Recipes
              </h3>
              <p className="text-secondary-600 text-xs sm:text-sm">
                Discover new dishes
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/shopping">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="p-4 text-center sm:p-6">
              <ShoppingCart className="mx-auto mb-2 h-6 w-6 text-primary sm:h-8 sm:w-8" />
              <h3 className="font-medium text-secondary-900 text-sm sm:text-base">
                Shopping List
              </h3>
              <p className="text-secondary-600 text-xs sm:text-sm">
                Plan your grocery trips
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/leftovers">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="p-4 text-center sm:p-6">
              <Utensils className="mx-auto mb-2 h-6 w-6 text-primary sm:h-8 sm:w-8" />
              <h3 className="font-medium text-secondary-900 text-sm sm:text-base">
                Leftovers
              </h3>
              <p className="text-secondary-600 text-xs sm:text-sm">
                Track and reduce waste
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
