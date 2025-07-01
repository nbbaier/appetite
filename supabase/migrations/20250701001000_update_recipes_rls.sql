-- RLS policies for recipes: public read, user-only update/delete, admin/migration can insert predefined recipes
-- Allow anyone to read all recipes
CREATE POLICY "Read public or own recipes" ON recipes FOR
SELECT
   TO authenticated USING (
      user_id IS NULL
      OR auth.uid () = user_id
   );

-- Allow users to insert their own recipes, and allow admin/migration to insert predefined recipes (user_id IS NULL)
CREATE POLICY "Users can insert own recipes or admin can insert predefined" ON recipes FOR INSERT TO authenticated
WITH
   CHECK (
      user_id IS NULL -- allow admin/predefined recipes
      OR auth.uid () = user_id -- allow user to insert their own
   );

-- Allow users to update only their own recipes
CREATE POLICY "Users can update own recipes" ON recipes FOR
UPDATE TO authenticated USING (auth.uid () = user_id)
WITH
   CHECK (auth.uid () = user_id);

-- Allow users to delete only their own recipes
CREATE POLICY "Users can delete own recipes" ON recipes FOR DELETE TO authenticated USING (auth.uid () = user_id);