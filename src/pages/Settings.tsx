import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  ChefHat,
  Globe,
  Heart,
  Save,
  User,
  Users,
  Utensils,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ExpirationThresholdInput } from "../components/settings/ExpirationThresholdInput";
import { InventoryThresholdInput } from "../components/settings/InventoryThresholdInput";
import { NotificationToggle } from "../components/settings/NotificationToggle";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Separator } from "../components/ui/separator";
import { useAuth } from "../contexts/AuthContext";
import { useSettings } from "../contexts/SettingsContext";
import { fetchWithErrorHandling } from "../lib/api";
import { userProfileService } from "../lib/database";
import { handleApiError, logError } from "../lib/errorUtils";
import { supabase } from "../lib/supabase";
import type { UserPreferences, UserProfile } from "../types";

const DIETARY_RESTRICTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Keto",
  "Low-Carb",
  "Paleo",
  "Halal",
  "Kosher",
];

const COMMON_ALLERGIES = [
  "Nuts",
  "Shellfish",
  "Eggs",
  "Dairy",
  "Soy",
  "Wheat",
  "Fish",
  "Sesame",
];

const CUISINE_TYPES = [
  "Italian",
  "Asian",
  "Mexican",
  "American",
  "Indian",
  "Thai",
  "Japanese",
  "Chinese",
  "French",
  "Greek",
  "Mediterranean",
  "British",
];

const KITCHEN_EQUIPMENT = [
  "Oven",
  "Microwave",
  "Stovetop",
  "Blender",
  "Food Processor",
  "Stand Mixer",
  "Air Fryer",
  "Slow Cooker",
  "Pressure Cooker",
  "Grill",
  "Toaster",
  "Rice Cooker",
];

const profileSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  bio: z.string().max(300, "Bio must be 300 characters or less").optional(),
  avatar_color: z.string().min(1),
});

export function Settings() {
  const { user } = useAuth();
  const { settings, loading, updateSettings } = useSettings();
  const [_profile, setProfile] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    bio: "",
    avatar_color: "#10B981",
  });

  const {
    formState: { errors: _profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: profileForm,
  });

  useEffect(() => {
    if (user) {
      userProfileService.getProfile(user.id).then((profileData) => {
        if (profileData) {
          setProfile(profileData);
          setProfileForm({
            full_name: profileData.full_name,
            bio: profileData.bio,
            avatar_color: profileData.avatar_color,
          });
        }
      });
    }
  }, [user]);

  const [preferencesForm, setPreferencesForm] = useState<
    Partial<UserPreferences>
  >({});
  useEffect(() => {
    if (settings) {
      setPreferencesForm({ ...settings });
    }
  }, [settings]);

  const handlePreferencesChange = (
    field: keyof UserPreferences,
    value: unknown,
  ) => {
    setPreferencesForm((prev) => ({ ...prev, [field]: value }));
  };

  const savePreferences = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      await updateSettings(preferencesForm);
      toast.success("Preferences saved successfully!");
    } catch {
      toast.error("Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 rounded-full border-b-2 animate-spin border-primary"></div>
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "dietary", label: "Dietary", icon: Heart },
    { id: "cooking", label: "Cooking", icon: ChefHat },
    { id: "equipment", label: "Equipment", icon: Utensils },
    { id: "alerts", label: "Alerts", icon: AlertTriangle },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center mb-2 space-x-4">
        <div className="flex-1">
          <div className="mb-1 text-xs font-medium text-secondary-700">
            Profile {getInitials(profileForm.full_name)}
          </div>
          <div className="overflow-hidden w-full h-2 rounded-full bg-secondary-200">
            <div
              className="h-2 rounded-full transition-all bg-primary"
              style={{ width: `100%` }}
            />
          </div>
        </div>
      </div>
      <div className="text-center sm:text-left">
        <h1 className="text-xl font-bold sm:text-2xl text-secondary-900">
          Settings
        </h1>
        <p className="text-sm sm:text-base text-secondary-600">
          Customize your cooking preferences and profile
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      {activeTab === "profile" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Profile Information</span>
            </CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <div
                className="flex justify-center items-center w-16 h-16 text-xl font-bold text-white rounded-full"
                style={{ backgroundColor: profileForm.avatar_color }}
              >
                {getInitials(profileForm.full_name || user?.email || "U")}
              </div>
            </div>
            <Separator />
          </CardContent>
        </Card>
      )}
      {(activeTab === "dietary" ||
        activeTab === "cooking" ||
        activeTab === "equipment" ||
        activeTab === "alerts") && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            savePreferences();
          }}
          className="space-y-6"
        >
          {activeTab === "dietary" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5" />
                  <span>Dietary Restrictions</span>
                </CardTitle>
                <CardDescription>
                  Select any dietary restrictions you follow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_RESTRICTIONS.map((restriction) => (
                    <button
                      key={restriction}
                      type="button"
                      onClick={() => {
                        const current =
                          preferencesForm.dietary_restrictions || [];
                        handlePreferencesChange(
                          "dietary_restrictions",
                          current.includes(restriction)
                            ? current.filter((r: string) => r !== restriction)
                            : [...current, restriction],
                        );
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        (preferencesForm.dietary_restrictions || []).includes(
                          restriction,
                        )
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {restriction}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === "dietary" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Allergies</span>
                </CardTitle>
                <CardDescription>
                  Select any food allergies you have
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {COMMON_ALLERGIES.map((allergy) => (
                    <button
                      key={allergy}
                      type="button"
                      onClick={() => {
                        const current = preferencesForm.allergies || [];
                        handlePreferencesChange(
                          "allergies",
                          current.includes(allergy)
                            ? current.filter((a: string) => a !== allergy)
                            : [...current, allergy],
                        );
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        (preferencesForm.allergies || []).includes(allergy)
                          ? "bg-red-500 text-white"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {allergy}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === "dietary" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Preferred Cuisines</span>
                </CardTitle>
                <CardDescription>
                  Select the types of cuisine you enjoy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {CUISINE_TYPES.map((cuisine) => (
                    <button
                      key={cuisine}
                      type="button"
                      onClick={() => {
                        const current =
                          preferencesForm.preferred_cuisines || [];
                        handlePreferencesChange(
                          "preferred_cuisines",
                          current.includes(cuisine)
                            ? current.filter((c: string) => c !== cuisine)
                            : [...current, cuisine],
                        );
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        (preferencesForm.preferred_cuisines || []).includes(
                          cuisine,
                        )
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {cuisine}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === "cooking" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ChefHat className="w-5 h-5" />
                  <span>Cooking Skill Level</span>
                </CardTitle>
                <CardDescription>
                  Select your cooking skill level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {["Beginner", "Intermediate", "Advanced", "Expert"].map(
                    (level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() =>
                          handlePreferencesChange("cooking_skill_level", level)
                        }
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          preferencesForm.cooking_skill_level === level
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {level}
                      </button>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === "cooking" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Preferred Measurement Units</span>
                </CardTitle>
                <CardDescription>
                  Choose your preferred measurement system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {["Metric", "Imperial"].map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() =>
                        handlePreferencesChange("measurement_units", unit)
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        preferencesForm.measurement_units === unit
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-xs text-secondary-600">
                  {preferencesForm.measurement_units === "Metric"
                    ? "Grams, kilograms, milliliters, liters, Celsius"
                    : "Ounces, pounds, cups, tablespoons, Fahrenheit"}
                </p>
              </CardContent>
            </Card>
          )}
          {activeTab === "cooking" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Family Size</span>
                </CardTitle>
                <CardDescription>
                  Set your household size for recipe scaling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={preferencesForm.family_size || 1}
                    onChange={(e) =>
                      handlePreferencesChange(
                        "family_size",
                        parseInt(e.target.value) || 1,
                      )
                    }
                    className="px-3 py-2 w-20 text-sm rounded-lg border border-secondary-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                  <span className="text-sm text-secondary-600">
                    people (affects recipe serving suggestions)
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === "equipment" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Utensils className="w-5 h-5" />
                  <span>Kitchen Equipment</span>
                </CardTitle>
                <CardDescription>
                  Select the kitchen equipment you have available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {KITCHEN_EQUIPMENT.map((equipment) => (
                    <button
                      key={equipment}
                      type="button"
                      onClick={() => {
                        const current = preferencesForm.kitchen_equipment || [];
                        handlePreferencesChange(
                          "kitchen_equipment",
                          current.includes(equipment)
                            ? current.filter((e: string) => e !== equipment)
                            : [...current, equipment],
                        );
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        (preferencesForm.kitchen_equipment || []).includes(
                          equipment,
                        )
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {equipment}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === "alerts" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Notifications & Alerts</span>
                </CardTitle>
                <CardDescription>
                  Manage notification and alert preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <NotificationToggle
                  value={!!preferencesForm.notification_enabled}
                  onChange={(val) =>
                    handlePreferencesChange("notification_enabled", val)
                  }
                  loading={saving}
                />
                <ExpirationThresholdInput
                  value={preferencesForm.expiration_threshold_days || 3}
                  onChange={(val) =>
                    handlePreferencesChange("expiration_threshold_days", val)
                  }
                  loading={saving}
                />
                <InventoryThresholdInput
                  value={preferencesForm.inventory_threshold || 1}
                  onChange={(val) =>
                    handlePreferencesChange("inventory_threshold", val)
                  }
                  loading={saving}
                />
              </CardContent>
            </Card>
          )}
          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            <Save className="mr-2 w-4 h-4" />
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </form>
      )}
    </div>
  );
}
