export interface User {
  avatar_url?: string;
  created_at: string;
  email: string;
  full_name?: string;
  id: string;
  updated_at: string;
}

export interface Ingredient {
  category: string;
  created_at: string;
  expiration_date?: string;
  id: string;
  low_stock_threshold?: number;
  name: string;
  notes?: string;
  quantity: number;
  unit: string;
  updated_at: string;
  user_id: string;
}

export interface Recipe {
  cook_time: number;
  created_at: string;
  cuisine_type?: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  id: string;
  image_url: string;
  prep_time: number;
  servings: number;
  title: string;
  updated_at: string;
  user_id: string;
}

export interface RecipeIngredient {
  id: string;
  ingredient_name: string;
  notes?: string;
  quantity: number;
  recipe_id: string;
  unit: string;
}

export interface RecipeInstruction {
  id: string;
  instruction: string;
  recipe_id: string;
  step_number: number;
}

export interface ShoppingListItem {
  category: string;
  created_at: string;
  id: string;
  is_purchased: boolean;
  name: string;
  notes?: string;
  quantity: number;
  recipe_id?: string;
  shopping_list_id: string;
  unit: string;
  updated_at: string;
}

export interface ShoppingList {
  created_at: string;
  description?: string;
  id: string;
  name: string;
  updated_at: string;
  user_id: string;
}

export interface UserProfile {
  avatar_color: string;
  avatar_url?: string;
  bio: string;
  created_at: string;
  full_name: string;
  id: string;
  onboarding_completed: boolean;
  updated_at: string;
  user_id: string;
}

export interface UserPreferences {
  allergies: string[];
  cooking_skill_level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  created_at: string;
  dietary_restrictions: string[];
  expiration_threshold_days: number;
  family_size: number;
  id: string;
  inventory_threshold: number;
  kitchen_equipment: string[];
  measurement_units: "Metric" | "Imperial";
  notification_enabled: boolean;
  preferred_cuisines: string[];
  updated_at: string;
  user_id: string;
}

export interface Leftover {
  created_at: string;
  expiration_date?: string;
  id: string;
  name: string;
  notes?: string;
  quantity: number;
  source_recipe_id?: string;
  unit: string;
  updated_at: string;
  user_id: string;
}

export interface Conversation {
  created_at: string;
  id: string;
  title: string | null;
  updated_at: string;
  user_id: string;
}

export interface ChatMessage {
  content: string;
  conversation_id: string;
  id: string;
  recipes?: Recipe[] | null;
  sender: "user" | "ai";
  suggestions?: string[] | null;
  timestamp: string;
}
