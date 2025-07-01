-- Add user_id column to recipes table
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE;

-- (Optional) If you want to enforce user_id as NOT NULL for all recipes, run:
-- ALTER TABLE recipes ALTER COLUMN user_id SET NOT NULL;
-- Note: You may want to backfill user_id for existing recipes if needed.`