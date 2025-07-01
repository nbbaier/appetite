-- Supabase migration: Can Cook match function
-- Creates a function to match recipes to a user's pantry, returning match percentage and missing ingredients

CREATE OR REPLACE FUNCTION match_recipes_to_pantry(user_id UUID)
RETURNS TABLE (
  recipe_id UUID,
  recipe_title TEXT,
  match_percentage NUMERIC,
  missing_ingredients JSONB
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  WITH user_pantry AS (
    SELECT LOWER(name) AS name FROM ingredients WHERE user_id = match_recipes_to_pantry.user_id
  ),
  recipe_ingredients AS (
    SELECT r.id AS recipe_id, r.title AS recipe_title, ri.ingredient_name
    FROM recipes r
    JOIN recipe_ingredients ri ON r.id = ri.recipe_id
  ),
  ingredient_matches AS (
    SELECT
      ri.recipe_id,
      ri.recipe_title,
      COUNT(CASE WHEN up.name IS NOT NULL THEN 1 END) AS matched_count,
      COUNT(*) AS total_ingredients,
      JSONB_AGG(CASE WHEN up.name IS NULL THEN ri.ingredient_name END) FILTER (WHERE up.name IS NULL) AS missing_ingredients
    FROM recipe_ingredients ri
    LEFT JOIN user_pantry up ON up.name = LOWER(ri.ingredient_name)
    GROUP BY ri.recipe_id, ri.recipe_title
  )
  SELECT
    recipe_id,
    recipe_title,
    ROUND((matched_count::NUMERIC / NULLIF(total_ingredients,0)) * 100, 2) AS match_percentage,
    COALESCE(missing_ingredients, '[]'::jsonb) AS missing_ingredients
  FROM ingredient_matches
  ORDER BY match_percentage DESC, recipe_title;
END;
$$; 