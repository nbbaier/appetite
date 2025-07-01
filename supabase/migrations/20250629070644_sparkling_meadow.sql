/*
  # Sample Recipe Data

  1. New Data
    - 5 sample recipes with ingredients and instructions
    - Classic Spaghetti with Tomato Sauce (Italian, Easy)
    - Chicken Stir Fry (Asian, Medium)
    - Hearty Vegetable Soup (Comfort Food, Easy)
    - Fluffy Pancakes (Breakfast, Easy)
    - Fresh Caesar Salad (Salad, Medium)

  2. Tables Populated
    - `recipes` - Basic recipe information
    - `recipe_ingredients` - Ingredient lists for each recipe
    - `recipe_instructions` - Step-by-step cooking instructions

  This migration adds sample data to help users explore the recipe functionality.
*/

-- Insert sample recipes using gen_random_uuid()
INSERT INTO recipes (title, description, image_url, prep_time, cook_time, servings, difficulty, cuisine_type) VALUES
(
  'Classic Spaghetti with Tomato Sauce',
  'A simple and delicious pasta dish with fresh tomato sauce, garlic, and basil. Perfect for a quick weeknight dinner.',
  'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
  15,
  20,
  4,
  'Easy',
  'Italian'
),
(
  'Chicken Stir Fry',
  'Quick and healthy stir fry with tender chicken, fresh vegetables, and a savory sauce.',
  'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg',
  20,
  15,
  3,
  'Medium',
  'Asian'
),
(
  'Hearty Vegetable Soup',
  'Warming and nutritious soup packed with seasonal vegetables and herbs.',
  'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg',
  15,
  30,
  6,
  'Easy',
  'Comfort Food'
),
(
  'Fluffy Pancakes',
  'Light and fluffy pancakes perfect for breakfast or brunch. Serve with maple syrup and fresh berries.',
  'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg',
  10,
  15,
  4,
  'Easy',
  'Breakfast'
),
(
  'Fresh Caesar Salad',
  'Crisp romaine lettuce with homemade Caesar dressing, parmesan cheese, and crunchy croutons.',
  'https://images.pexels.com/photos/1213710/pexels-photo-1213710.jpeg',
  15,
  0,
  2,
  'Medium',
  'Salad'
);

-- Get the recipe IDs for inserting ingredients and instructions
DO $$
DECLARE
    spaghetti_id uuid;
    stir_fry_id uuid;
    soup_id uuid;
    pancakes_id uuid;
    salad_id uuid;
BEGIN
    -- Get recipe IDs
    SELECT id INTO spaghetti_id FROM recipes WHERE title = 'Classic Spaghetti with Tomato Sauce';
    SELECT id INTO stir_fry_id FROM recipes WHERE title = 'Chicken Stir Fry';
    SELECT id INTO soup_id FROM recipes WHERE title = 'Hearty Vegetable Soup';
    SELECT id INTO pancakes_id FROM recipes WHERE title = 'Fluffy Pancakes';
    SELECT id INTO salad_id FROM recipes WHERE title = 'Fresh Caesar Salad';

    -- Insert recipe ingredients
    -- Spaghetti with Tomato Sauce
    INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, notes) VALUES
    (spaghetti_id, 'Spaghetti', 400, 'g', ''),
    (spaghetti_id, 'Canned Tomatoes', 800, 'g', 'crushed'),
    (spaghetti_id, 'Garlic', 3, 'cloves', 'minced'),
    (spaghetti_id, 'Olive Oil', 3, 'tbsp', ''),
    (spaghetti_id, 'Fresh Basil', 10, 'leaves', ''),
    (spaghetti_id, 'Salt', 1, 'tsp', 'to taste'),
    (spaghetti_id, 'Black Pepper', 0.5, 'tsp', 'to taste');

    -- Chicken Stir Fry
    INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, notes) VALUES
    (stir_fry_id, 'Chicken Breast', 500, 'g', 'sliced'),
    (stir_fry_id, 'Bell Peppers', 2, 'pieces', 'mixed colors'),
    (stir_fry_id, 'Broccoli', 200, 'g', 'florets'),
    (stir_fry_id, 'Carrots', 2, 'pieces', 'sliced'),
    (stir_fry_id, 'Soy Sauce', 3, 'tbsp', ''),
    (stir_fry_id, 'Garlic', 2, 'cloves', 'minced'),
    (stir_fry_id, 'Ginger', 1, 'tbsp', 'fresh, grated'),
    (stir_fry_id, 'Vegetable Oil', 2, 'tbsp', '');

    -- Vegetable Soup
    INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, notes) VALUES
    (soup_id, 'Onion', 1, 'piece', 'diced'),
    (soup_id, 'Carrots', 3, 'pieces', 'diced'),
    (soup_id, 'Celery', 2, 'stalks', 'diced'),
    (soup_id, 'Potatoes', 2, 'pieces', 'cubed'),
    (soup_id, 'Vegetable Broth', 1, 'liter', ''),
    (soup_id, 'Canned Tomatoes', 400, 'g', 'diced'),
    (soup_id, 'Green Beans', 150, 'g', 'trimmed'),
    (soup_id, 'Olive Oil', 2, 'tbsp', '');

    -- Pancakes
    INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, notes) VALUES
    (pancakes_id, 'All-Purpose Flour', 200, 'g', ''),
    (pancakes_id, 'Milk', 300, 'ml', ''),
    (pancakes_id, 'Eggs', 2, 'pieces', ''),
    (pancakes_id, 'Sugar', 2, 'tbsp', ''),
    (pancakes_id, 'Baking Powder', 2, 'tsp', ''),
    (pancakes_id, 'Salt', 0.5, 'tsp', ''),
    (pancakes_id, 'Butter', 2, 'tbsp', 'melted');

    -- Caesar Salad
    INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, notes) VALUES
    (salad_id, 'Romaine Lettuce', 2, 'heads', 'chopped'),
    (salad_id, 'Parmesan Cheese', 100, 'g', 'grated'),
    (salad_id, 'Bread', 4, 'slices', 'for croutons'),
    (salad_id, 'Mayonnaise', 3, 'tbsp', ''),
    (salad_id, 'Lemon Juice', 2, 'tbsp', 'fresh'),
    (salad_id, 'Garlic', 2, 'cloves', 'minced'),
    (salad_id, 'Olive Oil', 2, 'tbsp', '');

    -- Insert recipe instructions
    -- Spaghetti with Tomato Sauce
    INSERT INTO recipe_instructions (recipe_id, step_number, instruction) VALUES
    (spaghetti_id, 1, 'Bring a large pot of salted water to boil. Cook spaghetti according to package directions until al dente.'),
    (spaghetti_id, 2, 'While pasta cooks, heat olive oil in a large pan over medium heat. Add minced garlic and cook for 1 minute until fragrant.'),
    (spaghetti_id, 3, 'Add crushed tomatoes to the pan with garlic. Season with salt and pepper. Simmer for 10-15 minutes.'),
    (spaghetti_id, 4, 'Drain pasta and add to the tomato sauce. Toss to combine.'),
    (spaghetti_id, 5, 'Remove from heat and stir in fresh basil leaves. Serve immediately with grated parmesan if desired.');

    -- Chicken Stir Fry
    INSERT INTO recipe_instructions (recipe_id, step_number, instruction) VALUES
    (stir_fry_id, 1, 'Cut chicken breast into thin strips. Season with salt and pepper.'),
    (stir_fry_id, 2, 'Prepare all vegetables: slice bell peppers, cut broccoli into florets, and slice carrots.'),
    (stir_fry_id, 3, 'Heat oil in a large wok or skillet over high heat. Add chicken and cook for 3-4 minutes until golden.'),
    (stir_fry_id, 4, 'Add garlic and ginger, stir for 30 seconds. Add vegetables and stir-fry for 3-4 minutes.'),
    (stir_fry_id, 5, 'Add soy sauce and toss everything together. Cook for another 2 minutes until vegetables are tender-crisp.');

    -- Vegetable Soup
    INSERT INTO recipe_instructions (recipe_id, step_number, instruction) VALUES
    (soup_id, 1, 'Heat olive oil in a large pot over medium heat. Add diced onion and cook until softened, about 5 minutes.'),
    (soup_id, 2, 'Add carrots and celery to the pot. Cook for another 5 minutes, stirring occasionally.'),
    (soup_id, 3, 'Add cubed potatoes, vegetable broth, and diced tomatoes. Bring to a boil.'),
    (soup_id, 4, 'Reduce heat and simmer for 15 minutes. Add green beans and cook for another 10 minutes.'),
    (soup_id, 5, 'Season with salt and pepper to taste. Serve hot with crusty bread.');

    -- Pancakes
    INSERT INTO recipe_instructions (recipe_id, step_number, instruction) VALUES
    (pancakes_id, 1, 'In a large bowl, whisk together flour, sugar, baking powder, and salt.'),
    (pancakes_id, 2, 'In another bowl, whisk together milk, eggs, and melted butter.'),
    (pancakes_id, 3, 'Pour wet ingredients into dry ingredients and stir until just combined. Don''t overmix - lumps are okay.'),
    (pancakes_id, 4, 'Heat a non-stick pan over medium heat. Pour 1/4 cup batter for each pancake.'),
    (pancakes_id, 5, 'Cook until bubbles form on surface and edges look set, about 2-3 minutes. Flip and cook another 1-2 minutes.');

    -- Caesar Salad
    INSERT INTO recipe_instructions (recipe_id, step_number, instruction) VALUES
    (salad_id, 1, 'Cut bread into cubes and toss with 1 tbsp olive oil. Toast in oven at 200°C for 10 minutes until golden.'),
    (salad_id, 2, 'Wash and chop romaine lettuce. Pat dry and place in a large salad bowl.'),
    (salad_id, 3, 'In a small bowl, whisk together mayonnaise, lemon juice, minced garlic, and remaining olive oil.'),
    (salad_id, 4, 'Pour dressing over lettuce and toss to coat evenly.'),
    (salad_id, 5, 'Top with grated parmesan cheese and toasted croutons. Serve immediately.');

END $$;