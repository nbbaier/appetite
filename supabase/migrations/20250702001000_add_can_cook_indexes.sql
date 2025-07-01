-- Migration: Add indexes for Can Cook performance optimization
CREATE INDEX IF NOT EXISTS idx_ingredients_user_id_name ON ingredients (user_id, LOWER(name));

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id_name ON recipe_ingredients (recipe_id, LOWER(ingredient_name));