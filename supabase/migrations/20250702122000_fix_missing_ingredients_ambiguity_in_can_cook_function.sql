-- Migration: Fix ambiguous missing_ingredients reference in match_recipes_to_pantry

DROP FUNCTION IF EXISTS match_recipes_to_pantry(UUID, NUMERIC, INT, INT, INT);

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
    SELECT LOWER(name) AS name FROM ingredients WHERE ingredients.user_id = match_recipes_to_pantry.user_id
  ),
  recipe_ingredients AS (
    SELECT r.id AS recipe_id, r.title AS recipe_title, ri.ingredient_name
    FROM recipes r
    JOIN recipe_ingredients ri ON r.id = ri.recipe_id
  ),
  ingredient_matches AS (
    SELECT
      ri.recipe_id AS recipe_id,
      ri.recipe_title AS recipe_title,
      COUNT(CASE WHEN up.name IS NOT NULL THEN 1 END) AS matched_count,
      COUNT(*) AS total_ingredients,
      JSONB_AGG(CASE WHEN up.name IS NULL THEN ri.ingredient_name END) FILTER (WHERE up.name IS NULL) AS missing_ingredients
    FROM recipe_ingredients ri
    LEFT JOIN user_pantry up ON up.name = LOWER(ri.ingredient_name)
    GROUP BY ri.recipe_id, ri.recipe_title
  ),
  filtered_matches AS (
    SELECT
      ingredient_matches.recipe_id,
      ingredient_matches.recipe_title,
      ROUND((matched_count::NUMERIC / NULLIF(total_ingredients,0)) * 100, 2) AS match_percentage,
      COALESCE(ingredient_matches.missing_ingredients, '[]'::jsonb) AS missing_ingredients,
      matched_count,
      total_ingredients
    FROM ingredient_matches
  )
  SELECT
    filtered_matches.recipe_id,
    filtered_matches.recipe_title,
    filtered_matches.match_percentage,
    filtered_matches.missing_ingredients
  FROM filtered_matches
  WHERE filtered_matches.match_percentage >= min_match_percentage
    AND (max_missing_ingredients IS NULL OR jsonb_array_length(filtered_matches.missing_ingredients) <= max_missing_ingredients)
  ORDER BY filtered_matches.match_percentage DESC, filtered_matches.recipe_title
  LIMIT limit_count OFFSET offset_count;
END;
$$; 