export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: string;
  user_id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiration_date?: string;
  notes?: string;
  low_stock_threshold?: number;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: "Easy" | "Medium" | "Hard";
  cuisine_type?: string;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface RecipeInstruction {
  id: string;
  recipe_id: string;
  step_number: number;
  instruction: string;
}

export interface ShoppingListItem {
  id: string;
  shopping_list_id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  is_purchased: boolean;
  notes?: string;
  recipe_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ShoppingList {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  bio: string;
  avatar_color: string;
  onboarding_completed: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  dietary_restrictions: string[];
  allergies: string[];
  preferred_cuisines: string[];
  cooking_skill_level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  measurement_units: "Metric" | "Imperial";
  family_size: number;
  kitchen_equipment: string[];
  created_at: string;
  updated_at: string;
  notification_enabled: boolean;
  expiration_threshold_days: number;
  inventory_threshold: number;
}

export interface Leftover {
  id: string;
  user_id: string;
  name: string;
  quantity: number;
  unit: string;
  expiration_date?: string;
  source_recipe_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  title: string | null;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: string;
  suggestions?: string[] | null;
  recipes?: Recipe[] | null;
}
