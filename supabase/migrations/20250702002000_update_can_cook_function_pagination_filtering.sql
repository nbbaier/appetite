-- Migration: Update match_recipes_to_pantry for pagination and server-side filtering

DROP FUNCTION IF EXISTS match_recipes_to_pantry(UUID);

CREATE OR REPLACE FUNCTION match_recipes_to_pantry(
  user_id UUID,
  min_match_percentage NUMERIC DEFAULT 0,
  max_missing_ingredients INT DEFAULT NULL,
  limit_count INT DEFAULT 50,
  offset_count INT DEFAULT 0
)
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
  ),
  filtered_matches AS (
    SELECT
      recipe_id,
      recipe_title,
      ROUND((matched_count::NUMERIC / NULLIF(total_ingredients,0)) * 100, 2) AS match_percentage,
      COALESCE(missing_ingredients, '[]'::jsonb) AS missing_ingredients,
      matched_count,
      total_ingredients
    FROM ingredient_matches
  )
  SELECT
    recipe_id,
    recipe_title,
    match_percentage,
    missing_ingredients
  FROM filtered_matches
  WHERE match_percentage >= min_match_percentage
    AND (max_missing_ingredients IS NULL OR jsonb_array_length(missing_ingredients) <= max_missing_ingredients)
  ORDER BY match_percentage DESC, recipe_title
  LIMIT limit_count OFFSET offset_count;
END;
$$; 