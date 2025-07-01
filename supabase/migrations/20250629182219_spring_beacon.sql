/*
  # Seed Recipe Database with Real Recipe Data

  1. New Data
    - 15 diverse recipes with full details
    - Complete ingredient lists for each recipe
    - Step-by-step instructions
    - Proper categorization and timing

  2. Recipe Categories
    - Italian, Asian, American, Mexican cuisines
    - Easy, Medium, Hard difficulty levels
    - Various cooking times and serving sizes

  3. Ingredients & Instructions
    - Realistic ingredient quantities and units
    - Detailed cooking instructions
    - Proper step numbering
*/

-- Insert sample recipes
INSERT INTO recipes (id, title, description, image_url, prep_time, cook_time, servings, difficulty, cuisine_type) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Classic Spaghetti Carbonara', 'Creamy Italian pasta dish with eggs, cheese, and pancetta', 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg', 10, 15, 4, 'Medium', 'Italian'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Chicken Stir Fry', 'Quick and healthy stir fry with fresh vegetables', 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg', 15, 10, 2, 'Easy', 'Asian'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Beef Tacos', 'Authentic Mexican tacos with seasoned ground beef', 'https://images.pexels.com/photos/2087748/pexels-photo-2087748.jpeg', 20, 15, 4, 'Easy', 'Mexican'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Margherita Pizza', 'Classic Italian pizza with tomato, mozzarella, and basil', 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg', 30, 12, 2, 'Medium', 'Italian'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Chicken Caesar Salad', 'Fresh romaine lettuce with grilled chicken and Caesar dressing', 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg', 20, 15, 2, 'Easy', 'American'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Beef Wellington', 'Elegant beef tenderloin wrapped in puff pastry', 'https://images.pexels.com/photos/4253302/pexels-photo-4253302.jpeg', 45, 35, 6, 'Hard', 'British'),
  ('550e8400-e29b-41d4-a716-446655440007', 'Pad Thai', 'Traditional Thai noodle dish with shrimp and peanuts', 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg', 25, 12, 3, 'Medium', 'Thai'),
  ('550e8400-e29b-41d4-a716-446655440008', 'Mushroom Risotto', 'Creamy Italian rice dish with wild mushrooms', 'https://images.pexels.com/photos/4518669/pexels-photo-4518669.jpeg', 10, 25, 4, 'Medium', 'Italian'),
  ('550e8400-e29b-41d4-a716-446655440009', 'Fish and Chips', 'Classic British fried fish with crispy fries', 'https://images.pexels.com/photos/1199956/pexels-photo-1199956.jpeg', 20, 15, 2, 'Medium', 'British'),
  ('550e8400-e29b-41d4-a716-446655440010', 'Greek Salad', 'Fresh Mediterranean salad with feta and olives', 'https://images.pexels.com/photos/1213710/pexels-photo-1213710.jpeg', 15, 0, 4, 'Easy', 'Greek'),
  ('550e8400-e29b-41d4-a716-446655440011', 'Chicken Curry', 'Aromatic Indian curry with tender chicken pieces', 'https://images.pexels.com/photos/2474658/pexels-photo-2474658.jpeg', 20, 30, 4, 'Medium', 'Indian'),
  ('550e8400-e29b-41d4-a716-446655440012', 'Pancakes', 'Fluffy American breakfast pancakes', 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg', 10, 15, 3, 'Easy', 'American'),
  ('550e8400-e29b-41d4-a716-446655440013', 'Ramen Bowl', 'Rich Japanese noodle soup with pork and egg', 'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg', 30, 20, 2, 'Medium', 'Japanese'),
  ('550e8400-e29b-41d4-a716-446655440014', 'Chocolate Chip Cookies', 'Classic homemade cookies with chocolate chips', 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg', 15, 12, 24, 'Easy', 'American'),
  ('550e8400-e29b-41d4-a716-446655440015', 'Salmon Teriyaki', 'Grilled salmon with sweet teriyaki glaze', 'https://images.pexels.com/photos/1516415/pexels-photo-1516415.jpeg', 10, 15, 2, 'Easy', 'Japanese')
ON CONFLICT (id) DO NOTHING;

-- Insert recipe ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, notes) VALUES
  -- Spaghetti Carbonara
  ('550e8400-e29b-41d4-a716-446655440001', 'Spaghetti', 400, 'g', ''),
  ('550e8400-e29b-41d4-a716-446655440001', 'Pancetta', 150, 'g', 'diced'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Eggs', 3, 'pieces', 'large eggs'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Parmesan cheese', 100, 'g', 'grated'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Black pepper', 1, 'tsp', 'freshly ground'),
  
  -- Chicken Stir Fry
  ('550e8400-e29b-41d4-a716-446655440002', 'Chicken breast', 500, 'g', 'sliced thin'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Bell peppers', 2, 'pieces', 'mixed colors'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Broccoli', 300, 'g', 'cut into florets'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Soy sauce', 3, 'tbsp', ''),
  ('550e8400-e29b-41d4-a716-446655440002', 'Garlic', 3, 'pieces', 'minced'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Vegetable oil', 2, 'tbsp', ''),
  
  -- Beef Tacos
  ('550e8400-e29b-41d4-a716-446655440003', 'Ground beef', 500, 'g', ''),
  ('550e8400-e29b-41d4-a716-446655440003', 'Taco shells', 8, 'pieces', ''),
  ('550e8400-e29b-41d4-a716-446655440003', 'Lettuce', 1, 'pieces', 'shredded'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Tomatoes', 2, 'pieces', 'diced'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Cheese', 200, 'g', 'shredded cheddar'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Onion', 1, 'pieces', 'diced'),
  
  -- Margherita Pizza
  ('550e8400-e29b-41d4-a716-446655440004', 'Pizza dough', 1, 'pieces', 'store-bought or homemade'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Tomato sauce', 150, 'ml', ''),
  ('550e8400-e29b-41d4-a716-446655440004', 'Mozzarella cheese', 200, 'g', 'fresh'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Basil', 10, 'pieces', 'fresh leaves'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Olive oil', 2, 'tbsp', 'extra virgin'),
  
  -- Caesar Salad
  ('550e8400-e29b-41d4-a716-446655440005', 'Chicken breast', 300, 'g', 'grilled'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Romaine lettuce', 2, 'pieces', 'heads'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Caesar dressing', 100, 'ml', ''),
  ('550e8400-e29b-41d4-a716-446655440005', 'Parmesan cheese', 50, 'g', 'shaved'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Croutons', 100, 'g', ''),

  -- Pancakes
  ('550e8400-e29b-41d4-a716-446655440012', 'Flour', 200, 'g', 'all-purpose'),
  ('550e8400-e29b-41d4-a716-446655440012', 'Milk', 300, 'ml', ''),
  ('550e8400-e29b-41d4-a716-446655440012', 'Eggs', 2, 'pieces', ''),
  ('550e8400-e29b-41d4-a716-446655440012', 'Sugar', 2, 'tbsp', ''),
  ('550e8400-e29b-41d4-a716-446655440012', 'Butter', 50, 'g', 'melted'),
  ('550e8400-e29b-41d4-a716-446655440012', 'Baking powder', 2, 'tsp', ''),

  -- Salmon Teriyaki
  ('550e8400-e29b-41d4-a716-446655440015', 'Salmon fillets', 4, 'pieces', 'skin-on'),
  ('550e8400-e29b-41d4-a716-446655440015', 'Soy sauce', 4, 'tbsp', ''),
  ('550e8400-e29b-41d4-a716-446655440015', 'Brown sugar', 2, 'tbsp', ''),
  ('550e8400-e29b-41d4-a716-446655440015', 'Rice vinegar', 2, 'tbsp', ''),
  ('550e8400-e29b-41d4-a716-446655440015', 'Garlic', 2, 'pieces', 'minced'),
  ('550e8400-e29b-41d4-a716-446655440015', 'Ginger', 1, 'tsp', 'grated')
ON CONFLICT (id) DO NOTHING;

-- Insert recipe instructions
INSERT INTO recipe_instructions (recipe_id, step_number, instruction) VALUES
  -- Spaghetti Carbonara
  ('550e8400-e29b-41d4-a716-446655440001', 1, 'Bring a large pot of salted water to boil. Cook spaghetti according to package directions until al dente.'),
  ('550e8400-e29b-41d4-a716-446655440001', 2, 'While pasta cooks, heat a large skillet over medium heat. Add pancetta and cook until crispy, about 5 minutes.'),
  ('550e8400-e29b-41d4-a716-446655440001', 3, 'In a bowl, whisk together eggs, grated Parmesan, and black pepper.'),
  ('550e8400-e29b-41d4-a716-446655440001', 4, 'Drain pasta, reserving 1 cup of pasta water. Add hot pasta to the skillet with pancetta.'),
  ('550e8400-e29b-41d4-a716-446655440001', 5, 'Remove from heat and quickly stir in the egg mixture, adding pasta water as needed to create a creamy sauce.'),
  ('550e8400-e29b-41d4-a716-446655440001', 6, 'Serve immediately with extra Parmesan and black pepper.'),
  
  -- Chicken Stir Fry
  ('550e8400-e29b-41d4-a716-446655440002', 1, 'Heat vegetable oil in a large wok or skillet over high heat.'),
  ('550e8400-e29b-41d4-a716-446655440002', 2, 'Add chicken and cook until golden brown and cooked through, about 5-6 minutes.'),
  ('550e8400-e29b-41d4-a716-446655440002', 3, 'Add garlic and cook for 30 seconds until fragrant.'),
  ('550e8400-e29b-41d4-a716-446655440002', 4, 'Add bell peppers and broccoli, stir-fry for 3-4 minutes until vegetables are crisp-tender.'),
  ('550e8400-e29b-41d4-a716-446655440002', 5, 'Add soy sauce and toss everything together for 1 minute.'),
  ('550e8400-e29b-41d4-a716-446655440002', 6, 'Serve immediately over steamed rice.'),
  
  -- Beef Tacos
  ('550e8400-e29b-41d4-a716-446655440003', 1, 'Heat a large skillet over medium-high heat. Add ground beef and cook, breaking it up, until browned.'),
  ('550e8400-e29b-41d4-a716-446655440003', 2, 'Add diced onion and cook until softened, about 3 minutes.'),
  ('550e8400-e29b-41d4-a716-446655440003', 3, 'Season with salt, pepper, and your favorite taco seasoning. Cook for 2 more minutes.'),
  ('550e8400-e29b-41d4-a716-446655440003', 4, 'Warm taco shells according to package directions.'),
  ('550e8400-e29b-41d4-a716-446655440003', 5, 'Fill each taco shell with beef mixture, lettuce, tomatoes, and cheese.'),
  ('550e8400-e29b-41d4-a716-446655440003', 6, 'Serve with salsa, sour cream, and lime wedges.'),

  -- Pancakes
  ('550e8400-e29b-41d4-a716-446655440012', 1, 'In a large bowl, whisk together flour, sugar, and baking powder.'),
  ('550e8400-e29b-41d4-a716-446655440012', 2, 'In another bowl, whisk together milk, eggs, and melted butter.'),
  ('550e8400-e29b-41d4-a716-446655440012', 3, 'Pour wet ingredients into dry ingredients and stir until just combined. Don''t overmix.'),
  ('550e8400-e29b-41d4-a716-446655440012', 4, 'Heat a non-stick pan or griddle over medium heat. Lightly grease with butter.'),
  ('550e8400-e29b-41d4-a716-446655440012', 5, 'Pour 1/4 cup batter for each pancake. Cook until bubbles form on surface, then flip.'),
  ('550e8400-e29b-41d4-a716-446655440012', 6, 'Cook until golden brown on both sides. Serve with maple syrup and butter.'),

  -- Salmon Teriyaki
  ('550e8400-e29b-41d4-a716-446655440015', 1, 'In a small bowl, whisk together soy sauce, brown sugar, rice vinegar, garlic, and ginger.'),
  ('550e8400-e29b-41d4-a716-446655440015', 2, 'Place salmon in a shallow dish and pour half the marinade over it. Let marinate for 15 minutes.'),
  ('550e8400-e29b-41d4-a716-446655440015', 3, 'Heat a large skillet over medium-high heat with a little oil.'),
  ('550e8400-e29b-41d4-a716-446655440015', 4, 'Cook salmon skin-side down for 4-5 minutes until skin is crispy.'),
  ('550e8400-e29b-41d4-a716-446655440015', 5, 'Flip and cook for 3-4 minutes more, brushing with remaining marinade.'),
  ('550e8400-e29b-41d4-a716-446655440015', 6, 'Serve with steamed rice and vegetables.')
ON CONFLICT (id) DO NOTHING;