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
import { userProfileService } from "../lib/database";
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
    value: unknown
  ) => {
    setPreferencesForm((prev) => ({ ...prev, [field]: value }));
  };

  const savePreferences = async () => {
    if (!settings) {
      return;
    }
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

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
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
      <div className="mb-2 flex items-center space-x-4">
        <div className="flex-1">
          <div className="mb-1 font-medium text-secondary-700 text-xs">
            Profile {getInitials(profileForm.full_name)}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary-200">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </div>
      <div className="text-center sm:text-left">
        <h1 className="font-bold text-secondary-900 text-xl sm:text-2xl">
          Settings
        </h1>
        <p className="text-secondary-600 text-sm sm:text-base">
          Customize your cooking preferences and profile
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            className={`flex items-center space-x-2 rounded-lg px-3 py-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      {activeTab === "profile" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Information</span>
            </CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full font-bold text-white text-xl"
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
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            savePreferences();
          }}
        >
          {activeTab === "dietary" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
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
                      className={`rounded-full px-3 py-1 font-medium text-sm transition-colors ${
                        (preferencesForm.dietary_restrictions || []).includes(
                          restriction
                        )
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                      key={restriction}
                      onClick={() => {
                        const current =
                          preferencesForm.dietary_restrictions || [];
                        handlePreferencesChange(
                          "dietary_restrictions",
                          current.includes(restriction)
                            ? current.filter((r: string) => r !== restriction)
                            : [...current, restriction]
                        );
                      }}
                      type="button"
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
                  <AlertTriangle className="h-5 w-5" />
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
                      className={`rounded-full px-3 py-1 font-medium text-sm transition-colors ${
                        (preferencesForm.allergies || []).includes(allergy)
                          ? "bg-red-500 text-white"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                      key={allergy}
                      onClick={() => {
                        const current = preferencesForm.allergies || [];
                        handlePreferencesChange(
                          "allergies",
                          current.includes(allergy)
                            ? current.filter((a: string) => a !== allergy)
                            : [...current, allergy]
                        );
                      }}
                      type="button"
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
                  <Globe className="h-5 w-5" />
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
                      className={`rounded-full px-3 py-1 font-medium text-sm transition-colors ${
                        (preferencesForm.preferred_cuisines || []).includes(
                          cuisine
                        )
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                      key={cuisine}
                      onClick={() => {
                        const current =
                          preferencesForm.preferred_cuisines || [];
                        handlePreferencesChange(
                          "preferred_cuisines",
                          current.includes(cuisine)
                            ? current.filter((c: string) => c !== cuisine)
                            : [...current, cuisine]
                        );
                      }}
                      type="button"
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
                  <ChefHat className="h-5 w-5" />
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
                        className={`rounded-lg px-3 py-2 font-medium text-sm transition-colors ${
                          preferencesForm.cooking_skill_level === level
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                        key={level}
                        onClick={() =>
                          handlePreferencesChange("cooking_skill_level", level)
                        }
                        type="button"
                      >
                        {level}
                      </button>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === "cooking" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
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
                      className={`rounded-lg px-4 py-2 font-medium text-sm transition-colors ${
                        preferencesForm.measurement_units === unit
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                      key={unit}
                      onClick={() =>
                        handlePreferencesChange("measurement_units", unit)
                      }
                      type="button"
                    >
                      {unit}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-secondary-600 text-xs">
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
                  <Users className="h-5 w-5" />
                  <span>Family Size</span>
                </CardTitle>
                <CardDescription>
                  Set your household size for recipe scaling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Input
                    className="w-20 rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                    max={20}
                    min={1}
                    onChange={(e) =>
                      handlePreferencesChange(
                        "family_size",
                        Number.parseInt(e.target.value, 10) || 1
                      )
                    }
                    type="number"
                    value={preferencesForm.family_size || 1}
                  />
                  <span className="text-secondary-600 text-sm">
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
                  <Utensils className="h-5 w-5" />
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
                      className={`rounded-full px-3 py-1 font-medium text-sm transition-colors ${
                        (preferencesForm.kitchen_equipment || []).includes(
                          equipment
                        )
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                      key={equipment}
                      onClick={() => {
                        const current = preferencesForm.kitchen_equipment || [];
                        handlePreferencesChange(
                          "kitchen_equipment",
                          current.includes(equipment)
                            ? current.filter((e: string) => e !== equipment)
                            : [...current, equipment]
                        );
                      }}
                      type="button"
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
                  <AlertTriangle className="h-5 w-5" />
                  <span>Notifications & Alerts</span>
                </CardTitle>
                <CardDescription>
                  Manage notification and alert preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <NotificationToggle
                  loading={saving}
                  onChange={(val) =>
                    handlePreferencesChange("notification_enabled", val)
                  }
                  value={!!preferencesForm.notification_enabled}
                />
                <ExpirationThresholdInput
                  loading={saving}
                  onChange={(val) =>
                    handlePreferencesChange("expiration_threshold_days", val)
                  }
                  value={preferencesForm.expiration_threshold_days || 3}
                />
                <InventoryThresholdInput
                  loading={saving}
                  onChange={(val) =>
                    handlePreferencesChange("inventory_threshold", val)
                  }
                  value={preferencesForm.inventory_threshold || 1}
                />
              </CardContent>
            </Card>
          )}
          <Button className="w-full sm:w-auto" disabled={saving} type="submit">
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </form>
      )}
    </div>
  );
}
