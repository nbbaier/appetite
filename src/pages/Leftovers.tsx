import {
  AlertTriangle,
  Calendar,
  ChefHat,
  Clock,
  Package,
  Plus,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { LeftoverCard } from "../components/leftovers/LeftoverCard";
import { LeftoverForm } from "../components/leftovers/LeftoverForm";
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
import { useSettings } from "../contexts/SettingsContext";
import { leftoverService } from "../lib/database";
import { checkExpiringItems } from "../lib/notificationService";
import type { Leftover } from "../types";

export function Leftovers() {
  const { user } = useAuth();
  const [leftovers, setLeftovers] = useState<Leftover[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLeftover, setEditingLeftover] = useState<Leftover | null>(null);
  const [saving, setSaving] = useState(false);
  const { settings } = useSettings();
  const [error, _setError] = useState<string | null>(null);
  const { notify } = useNotification();

  const loadLeftovers = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await leftoverService.getAll(user.id);
      setLeftovers(data);
    } catch (error) {
      console.error("Error loading leftovers:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadLeftovers();
    }
  }, [user, loadLeftovers]);

  // Notification integration
  useEffect(() => {
    if (!user || loading || !leftovers.length || !settings) return;
    checkExpiringItems({
      ingredients: [],
      leftovers,
      criticalDays: settings.expiration_threshold_days,
      warningDays: Math.max(settings.expiration_threshold_days + 4, 7),
      notificationEnabled: settings.notification_enabled,
      onNotify: ({ item, notificationType, message }) => {
        notify(message, {
          description: `${item.type === "ingredient" ? "Ingredient" : "Leftover"}: ${item.name}`,
          duration: 8000,
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
  }, [user, loading, leftovers, settings, notify]);

  const handleSubmit = async (
    data: Omit<Leftover, "id" | "created_at" | "updated_at">,
  ) => {
    try {
      setSaving(true);
      if (editingLeftover) {
        await leftoverService.update(editingLeftover.id, data);
      } else {
        await leftoverService.create(data);
      }
      await loadLeftovers();
      resetForm();
    } catch (error) {
      console.error("Error saving leftover:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this leftover?")) return;

    try {
      await leftoverService.delete(id);
      await loadLeftovers();
    } catch (error) {
      console.error("Error deleting leftover:", error);
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingLeftover(null);
  };

  const startEdit = (leftover: Leftover) => {
    setEditingLeftover(leftover);
    setShowAddForm(true);
  };

  const getDaysUntilExpiration = (expirationDate: string | undefined) => {
    if (!expirationDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);

    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredLeftovers = leftovers.filter((leftover) =>
    leftover.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Categorize leftovers by expiration status
  const expiredLeftovers = filteredLeftovers.filter((leftover) => {
    const days = getDaysUntilExpiration(leftover.expiration_date);
    return days !== null && days < 0;
  });

  const expiringSoonLeftovers = filteredLeftovers.filter((leftover) => {
    const days = getDaysUntilExpiration(leftover.expiration_date);
    return days !== null && days >= 0 && days <= 2;
  });

  const freshLeftovers = filteredLeftovers.filter((leftover) => {
    const days = getDaysUntilExpiration(leftover.expiration_date);
    return days === null || days > 2;
  });

  const totalExpiring = expiredLeftovers.length + expiringSoonLeftovers.length;

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
            Leftovers
          </h1>
          <p className="text-sm sm:text-base text-secondary-600">
            Track your leftovers and reduce food waste
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="flex justify-center items-center space-x-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          <span>Add Leftover</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="w-6 h-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <div className="flex-1 ml-3 min-w-0 sm:ml-4">
                <p className="text-xs font-medium truncate sm:text-sm text-secondary-600">
                  Total Leftovers
                </p>
                <p className="text-lg font-bold sm:text-2xl text-secondary-900">
                  {leftovers.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={totalExpiring > 0 ? "border-orange-200 bg-orange-50" : ""}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle
                  className={`h-6 w-6 sm:h-8 sm:w-8 ${totalExpiring > 0 ? "text-orange-600" : "text-primary"}`}
                />
              </div>
              <div className="flex-1 ml-3 min-w-0 sm:ml-4">
                <p className="text-xs font-medium truncate sm:text-sm text-secondary-600">
                  Expiring Soon
                </p>
                <p className="text-lg font-bold sm:text-2xl text-secondary-900">
                  {totalExpiring}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChefHat className="w-6 h-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <div className="flex-1 ml-3 min-w-0 sm:ml-4">
                <p className="text-xs font-medium truncate sm:text-sm text-secondary-600">
                  From Recipes
                </p>
                <p className="text-lg font-bold sm:text-2xl text-secondary-900">
                  {leftovers.filter((l) => l.source_recipe_id).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-secondary-400" />
        <Input
          placeholder="Search leftovers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 text-sm sm:text-base"
        />
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">
              {editingLeftover ? "Edit Leftover" : "Add New Leftover"}
            </CardTitle>
            <CardDescription>
              Track your leftovers to reduce food waste and plan meals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LeftoverForm
              leftover={editingLeftover || undefined}
              onSubmit={handleSubmit}
              onCancel={resetForm}
              loading={saving}
            />
          </CardContent>
        </Card>
      )}

      {/* Leftovers Display */}
      {filteredLeftovers.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center sm:py-12">
            <Package className="mx-auto mb-4 w-10 h-10 sm:h-12 sm:w-12 text-secondary-400" />
            <h3 className="mb-2 text-base font-medium sm:text-lg text-secondary-900">
              {searchTerm ? "No leftovers found" : "No leftovers yet"}
            </h3>
            <p className="px-4 mb-4 text-sm sm:text-base text-secondary-600">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "Start tracking your leftovers to reduce food waste"}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setShowAddForm(true)}
                className="text-sm sm:text-base"
              >
                Add Your First Leftover
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Expired Leftovers */}
          {expiredLeftovers.length > 0 && (
            <div>
              <h2 className="flex items-center mb-3 text-lg font-semibold text-red-900">
                <AlertTriangle className="mr-2 w-5 h-5" />
                Expired ({expiredLeftovers.length})
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
                {expiredLeftovers.map((leftover) => (
                  <LeftoverCard
                    key={leftover.id}
                    leftover={leftover}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Expiring Soon */}
          {expiringSoonLeftovers.length > 0 && (
            <div>
              <h2 className="flex items-center mb-3 text-lg font-semibold text-orange-900">
                <Clock className="mr-2 w-5 h-5" />
                Expiring Soon ({expiringSoonLeftovers.length})
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
                {expiringSoonLeftovers.map((leftover) => (
                  <LeftoverCard
                    key={leftover.id}
                    leftover={leftover}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Fresh Leftovers */}
          {freshLeftovers.length > 0 && (
            <div>
              <h2 className="flex items-center mb-3 text-lg font-semibold text-secondary-900">
                <Calendar className="mr-2 w-5 h-5" />
                Fresh ({freshLeftovers.length})
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
                {freshLeftovers.map((leftover) => (
                  <LeftoverCard
                    key={leftover.id}
                    leftover={leftover}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
