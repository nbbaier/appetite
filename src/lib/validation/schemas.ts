import { z } from "zod";

/**
 * Base schemas for common patterns
 */
const uuidSchema = z.string().uuid("Invalid UUID format");
const emailSchema = z.string().email("Invalid email address");
const urlSchema = z.string().url("Invalid URL format").optional();
const dateStringSchema = z.string().datetime("Invalid datetime format");
const positiveNumberSchema = z.number().positive("Must be a positive number");
const nonNegativeNumberSchema = z.number().nonnegative("Must be non-negative");

/**
 * User Schema
 */
export const userSchema = z.object({
  id: uuidSchema,
  email: emailSchema,
  full_name: z.string().min(1).max(255).optional(),
  avatar_url: urlSchema,
  created_at: dateStringSchema,
  updated_at: dateStringSchema,
});

export const userInsertSchema = userSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type UserInsert = z.infer<typeof userInsertSchema>;

/**
 * Ingredient Schema
 */
export const ingredientSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  name: z
    .string()
    .min(1, "Ingredient name is required")
    .max(255, "Ingredient name too long")
    .trim(),
  quantity: positiveNumberSchema,
  unit: z
    .string()
    .min(1, "Unit is required")
    .max(50, "Unit name too long")
    .trim(),
  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category name too long")
    .trim(),
  expiration_date: z.string().date("Invalid date format").optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
  low_stock_threshold: nonNegativeNumberSchema.optional(),
  created_at: dateStringSchema,
  updated_at: dateStringSchema,
});

export const ingredientInsertSchema = ingredientSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const ingredientUpdateSchema = ingredientInsertSchema.partial().omit({
  user_id: true,
});

export type IngredientInsert = z.infer<typeof ingredientInsertSchema>;
export type IngredientUpdate = z.infer<typeof ingredientUpdateSchema>;

/**
 * Recipe Schema
 */
export const recipeSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  title: z
    .string()
    .min(1, "Recipe title is required")
    .max(255, "Recipe title too long")
    .trim(),
  description: z
    .string()
    .min(1, "Recipe description is required")
    .max(5000, "Recipe description too long")
    .trim(),
  image_url: z.string().url("Invalid image URL").or(z.literal("")),
  prep_time: nonNegativeNumberSchema,
  cook_time: nonNegativeNumberSchema,
  servings: positiveNumberSchema.int("Servings must be a whole number"),
  difficulty: z.enum(["Easy", "Medium", "Hard"], {
    errorMap: () => ({ message: "Difficulty must be Easy, Medium, or Hard" }),
  }),
  cuisine_type: z.string().max(100, "Cuisine type too long").optional(),
  created_at: dateStringSchema,
  updated_at: dateStringSchema,
});

export const recipeInsertSchema = recipeSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const recipeUpdateSchema = recipeInsertSchema.partial().omit({
  user_id: true,
});

export type RecipeInsert = z.infer<typeof recipeInsertSchema>;
export type RecipeUpdate = z.infer<typeof recipeUpdateSchema>;

/**
 * Recipe Ingredient Schema
 */
export const recipeIngredientSchema = z.object({
  id: uuidSchema,
  recipe_id: uuidSchema,
  ingredient_name: z
    .string()
    .min(1, "Ingredient name is required")
    .max(255, "Ingredient name too long")
    .trim(),
  quantity: positiveNumberSchema,
  unit: z
    .string()
    .min(1, "Unit is required")
    .max(50, "Unit name too long")
    .trim(),
  notes: z.string().max(500, "Notes too long").optional(),
});

export const recipeIngredientInsertSchema = recipeIngredientSchema.omit({
  id: true,
});

export type RecipeIngredientInsert = z.infer<
  typeof recipeIngredientInsertSchema
>;

/**
 * Recipe Instruction Schema
 */
export const recipeInstructionSchema = z.object({
  id: uuidSchema,
  recipe_id: uuidSchema,
  step_number: positiveNumberSchema.int("Step number must be a whole number"),
  instruction: z
    .string()
    .min(1, "Instruction is required")
    .max(2000, "Instruction too long")
    .trim(),
});

export const recipeInstructionInsertSchema = recipeInstructionSchema.omit({
  id: true,
});

export type RecipeInstructionInsert = z.infer<
  typeof recipeInstructionInsertSchema
>;

/**
 * Shopping List Schema
 */
export const shoppingListSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  name: z
    .string()
    .min(1, "Shopping list name is required")
    .max(255, "Shopping list name too long")
    .trim(),
  description: z.string().max(1000, "Description too long").optional(),
  created_at: dateStringSchema,
  updated_at: dateStringSchema,
});

export const shoppingListInsertSchema = shoppingListSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const shoppingListUpdateSchema = shoppingListInsertSchema
  .partial()
  .omit({
    user_id: true,
  });

export type ShoppingListInsert = z.infer<typeof shoppingListInsertSchema>;
export type ShoppingListUpdate = z.infer<typeof shoppingListUpdateSchema>;

/**
 * Shopping List Item Schema
 */
export const shoppingListItemSchema = z.object({
  id: uuidSchema,
  shopping_list_id: uuidSchema,
  name: z
    .string()
    .min(1, "Item name is required")
    .max(255, "Item name too long")
    .trim(),
  quantity: positiveNumberSchema,
  unit: z
    .string()
    .min(1, "Unit is required")
    .max(50, "Unit name too long")
    .trim(),
  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category name too long")
    .trim(),
  is_purchased: z.boolean(),
  notes: z.string().max(500, "Notes too long").optional(),
  recipe_id: uuidSchema.optional(),
  created_at: dateStringSchema,
  updated_at: dateStringSchema,
});

export const shoppingListItemInsertSchema = shoppingListItemSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const shoppingListItemUpdateSchema = shoppingListItemInsertSchema
  .partial()
  .omit({
    shopping_list_id: true,
  });

export type ShoppingListItemInsert = z.infer<
  typeof shoppingListItemInsertSchema
>;
export type ShoppingListItemUpdate = z.infer<
  typeof shoppingListItemUpdateSchema
>;

/**
 * User Profile Schema
 */
export const userProfileSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  full_name: z
    .string()
    .min(1, "Full name is required")
    .max(255, "Full name too long")
    .trim(),
  bio: z.string().max(1000, "Bio too long").trim(),
  avatar_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format (use #RRGGBB)"),
  onboarding_completed: z.boolean(),
  avatar_url: urlSchema,
  created_at: dateStringSchema,
  updated_at: dateStringSchema,
});

export const userProfileInsertSchema = userProfileSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const userProfileUpdateSchema = userProfileInsertSchema.partial().omit({
  user_id: true,
});

export type UserProfileInsert = z.infer<typeof userProfileInsertSchema>;
export type UserProfileUpdate = z.infer<typeof userProfileUpdateSchema>;

/**
 * User Preferences Schema
 */
export const userPreferencesSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  dietary_restrictions: z.array(z.string().max(100)).default([]),
  allergies: z.array(z.string().max(100)).default([]),
  preferred_cuisines: z.array(z.string().max(100)).default([]),
  cooking_skill_level: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"], {
    errorMap: () => ({
      message: "Skill level must be Beginner, Intermediate, Advanced, or Expert",
    }),
  }),
  measurement_units: z.enum(["Metric", "Imperial"], {
    errorMap: () => ({ message: "Measurement units must be Metric or Imperial" }),
  }),
  family_size: positiveNumberSchema.int("Family size must be a whole number"),
  kitchen_equipment: z.array(z.string().max(100)).default([]),
  created_at: dateStringSchema,
  updated_at: dateStringSchema,
  notification_enabled: z.boolean().default(true),
  expiration_threshold_days: positiveNumberSchema
    .int("Expiration threshold must be a whole number")
    .max(365, "Expiration threshold too high"),
  inventory_threshold: nonNegativeNumberSchema,
});

export const userPreferencesInsertSchema = userPreferencesSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const userPreferencesUpdateSchema = userPreferencesInsertSchema
  .partial()
  .omit({
    user_id: true,
  });

export type UserPreferencesInsert = z.infer<typeof userPreferencesInsertSchema>;
export type UserPreferencesUpdate = z.infer<typeof userPreferencesUpdateSchema>;

/**
 * Leftover Schema
 */
export const leftoverSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  name: z
    .string()
    .min(1, "Leftover name is required")
    .max(255, "Leftover name too long")
    .trim(),
  quantity: positiveNumberSchema,
  unit: z
    .string()
    .min(1, "Unit is required")
    .max(50, "Unit name too long")
    .trim(),
  expiration_date: z.string().date("Invalid date format").optional(),
  source_recipe_id: uuidSchema.optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
  created_at: dateStringSchema,
  updated_at: dateStringSchema,
});

export const leftoverInsertSchema = leftoverSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const leftoverUpdateSchema = leftoverInsertSchema.partial().omit({
  user_id: true,
});

export type LeftoverInsert = z.infer<typeof leftoverInsertSchema>;
export type LeftoverUpdate = z.infer<typeof leftoverUpdateSchema>;

/**
 * Conversation Schema
 */
export const conversationSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  created_at: dateStringSchema,
  updated_at: dateStringSchema,
  title: z.string().max(255, "Title too long").nullable(),
});

export const conversationInsertSchema = conversationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type ConversationInsert = z.infer<typeof conversationInsertSchema>;

/**
 * Chat Message Schema
 */
export const chatMessageSchema = z.object({
  id: uuidSchema,
  conversation_id: uuidSchema,
  sender: z.enum(["user", "ai"], {
    errorMap: () => ({ message: "Sender must be 'user' or 'ai'" }),
  }),
  content: z
    .string()
    .min(1, "Message content is required")
    .max(10000, "Message content too long")
    .trim(),
  timestamp: dateStringSchema,
  suggestions: z.array(z.string().max(500)).nullable().optional(),
  recipes: z.array(recipeSchema).nullable().optional(),
});

export const chatMessageInsertSchema = chatMessageSchema.omit({
  id: true,
  timestamp: true,
});

export type ChatMessageInsert = z.infer<typeof chatMessageInsertSchema>;

/**
 * Environment Variables Schema
 */
export const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  VITE_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "Supabase anon key is required"),
  MODE: z.enum(["development", "production", "test"]).optional(),
});

export type EnvSchema = z.infer<typeof envSchema>;

/**
 * Authentication Schemas
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password too long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and number"
      ),
    confirmPassword: z.string(),
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(255, "Full name too long")
      .trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
