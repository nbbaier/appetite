/*
  # Add Missing Recipe Ingredients

  1. Missing Ingredients
    - Greek Salad ingredients (recipe ID: 550e8400-e29b-41d4-a716-446655440010)
    - Beef Wellington ingredients (recipe ID: 550e8400-e29b-41d4-a716-446655440006)
    - Pad Thai ingredients (recipe ID: 550e8400-e29b-41d4-a716-446655440007)
    - Mushroom Risotto ingredients (recipe ID: 550e8400-e29b-41d4-a716-446655440008)
    - Fish and Chips ingredients (recipe ID: 550e8400-e29b-41d4-a716-446655440009)
    - Chicken Curry ingredients (recipe ID: 550e8400-e29b-41d4-a716-446655440011)
    - Ramen Bowl ingredients (recipe ID: 550e8400-e29b-41d4-a716-446655440013)
    - Chocolate Chip Cookies ingredients (recipe ID: 550e8400-e29b-41d4-a716-446655440014)

  2. Complete ingredient lists for each recipe
    - Realistic quantities and units
    - Proper ingredient names that match common pantry items
*/

-- Insert missing recipe ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, notes) VALUES
  -- Greek Salad (ID: 550e8400-e29b-41d4-a716-446655440010)
  ('550e8400-e29b-41d4-a716-446655440010', 'Tomatoes', 3, 'pieces', 'large, cut into wedges'),
  ('550e8400-e29b-41d4-a716-446655440010', 'Cucumber', 1, 'pieces', 'sliced'),
  ('550e8400-e29b-41d4-a716-446655440010', 'Red onion', 0.5, 'pieces', 'thinly sliced'),
  ('550e8400-e29b-41d4-a716-446655440010', 'Feta cheese', 200, 'g', 'crumbled'),
  ('550e8400-e29b-41d4-a716-446655440010', 'Kalamata olives', 100, 'g', 'pitted'),
  ('550e8400-e29b-41d4-a716-446655440010', 'Olive oil', 3, 'tbsp', 'extra virgin'),
  ('550e8400-e29b-41d4-a716-446655440010', 'Lemon juice', 2, 'tbsp', 'fresh'),
  ('550e8400-e29b-41d4-a716-446655440010', 'Oregano', 1, 'tsp', 'dried'),

  -- Beef Wellington (ID: 550e8400-e29b-41d4-a716-446655440006)
  ('550e8400-e29b-41d4-a716-446655440006', 'Beef tenderloin', 1, 'kg', 'center cut'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Puff pastry', 500, 'g', 'thawed'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Mushrooms', 500, 'g', 'mixed wild mushrooms'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Prosciutto', 200, 'g', 'thinly sliced'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Egg yolks', 2, 'pieces', 'for wash'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Dijon mustard', 2, 'tbsp', ''),
  ('550e8400-e29b-41d4-a716-446655440006', 'Thyme', 2, 'tsp', 'fresh'),

  -- Pad Thai (ID: 550e8400-e29b-41d4-a716-446655440007)
  ('550e8400-e29b-41d4-a716-446655440007', 'Rice noodles', 250, 'g', 'wide, dried'),
  ('550e8400-e29b-41d4-a716-446655440007', 'Shrimp', 300, 'g', 'peeled and deveined'),
  ('550e8400-e29b-41d4-a716-446655440007', 'Eggs', 2, 'pieces', ''),
  ('550e8400-e29b-41d4-a716-446655440007', 'Bean sprouts', 200, 'g', 'fresh'),
  ('550e8400-e29b-41d4-a716-446655440007', 'Fish sauce', 3, 'tbsp', ''),
  ('550e8400-e29b-41d4-a716-446655440007', 'Tamarind paste', 2, 'tbsp', ''),
  ('550e8400-e29b-41d4-a716-446655440007', 'Brown sugar', 2, 'tbsp', ''),
  ('550e8400-e29b-41d4-a716-446655440007', 'Peanuts', 50, 'g', 'crushed'),
  ('550e8400-e29b-41d4-a716-446655440007', 'Lime', 2, 'pieces', 'cut into wedges'),

  -- Mushroom Risotto (ID: 550e8400-e29b-41d4-a716-446655440008)
  ('550e8400-e29b-41d4-a716-446655440008', 'Arborio rice', 300, 'g', ''),
  ('550e8400-e29b-41d4-a716-446655440008', 'Mixed mushrooms', 400, 'g', 'porcini, shiitake, button'),
  ('550e8400-e29b-41d4-a716-446655440008', 'Vegetable broth', 1, 'l', 'warm'),
  ('550e8400-e29b-41d4-a716-446655440008', 'White wine', 150, 'ml', 'dry'),
  ('550e8400-e29b-41d4-a716-446655440008', 'Onion', 1, 'pieces', 'finely diced'),
  ('550e8400-e29b-41d4-a716-446655440008', 'Parmesan cheese', 100, 'g', 'grated'),
  ('550e8400-e29b-41d4-a716-446655440008', 'Butter', 50, 'g', ''),
  ('550e8400-e29b-41d4-a716-446655440008', 'Olive oil', 2, 'tbsp', ''),

  -- Fish and Chips (ID: 550e8400-e29b-41d4-a716-446655440009)
  ('550e8400-e29b-41d4-a716-446655440009', 'White fish fillets', 4, 'pieces', 'cod or haddock'),
  ('550e8400-e29b-41d4-a716-446655440009', 'Potatoes', 1, 'kg', 'large, for chips'),
  ('550e8400-e29b-41d4-a716-446655440009', 'Flour', 200, 'g', 'plain'),
  ('550e8400-e29b-41d4-a716-446655440009', 'Beer', 250, 'ml', 'lager'),
  ('550e8400-e29b-41d4-a716-446655440009', 'Baking powder', 1, 'tsp', ''),
  ('550e8400-e29b-41d4-a716-446655440009', 'Vegetable oil', 1, 'l', 'for frying'),
  ('550e8400-e29b-41d4-a716-446655440009', 'Salt', 1, 'tsp', 'to taste'),

  -- Chicken Curry (ID: 550e8400-e29b-41d4-a716-446655440011)
  ('550e8400-e29b-41d4-a716-446655440011', 'Chicken thighs', 800, 'g', 'boneless'),
  ('550e8400-e29b-41d4-a716-446655440011', 'Coconut milk', 400, 'ml', 'canned'),
  ('550e8400-e29b-41d4-a716-446655440011', 'Onion', 2, 'pieces', 'diced'),
  ('550e8400-e29b-41d4-a716-446655440011', 'Tomatoes', 2, 'pieces', 'diced'),
  ('550e8400-e29b-41d4-a716-446655440011', 'Garlic', 4, 'pieces', 'minced'),
  ('550e8400-e29b-41d4-a716-446655440011', 'Ginger', 2, 'tbsp', 'fresh, grated'),
  ('550e8400-e29b-41d4-a716-446655440011', 'Curry powder', 2, 'tbsp', ''),
  ('550e8400-e29b-41d4-a716-446655440011', 'Vegetable oil', 2, 'tbsp', ''),

  -- Ramen Bowl (ID: 550e8400-e29b-41d4-a716-446655440013)
  ('550e8400-e29b-41d4-a716-446655440013', 'Ramen noodles', 2, 'packets', 'fresh or dried'),
  ('550e8400-e29b-41d4-a716-446655440013', 'Pork belly', 300, 'g', 'sliced'),
  ('550e8400-e29b-41d4-a716-446655440013', 'Eggs', 2, 'pieces', 'soft-boiled'),
  ('550e8400-e29b-41d4-a716-446655440013', 'Chicken broth', 1, 'l', ''),
  ('550e8400-e29b-41d4-a716-446655440013', 'Miso paste', 3, 'tbsp', ''),
  ('550e8400-e29b-41d4-a716-446655440013', 'Green onions', 3, 'pieces', 'sliced'),
  ('550e8400-e29b-41d4-a716-446655440013', 'Nori sheets', 2, 'pieces', 'cut into strips'),
  ('550e8400-e29b-41d4-a716-446655440013', 'Corn kernels', 100, 'g', ''),

  -- Chocolate Chip Cookies (ID: 550e8400-e29b-41d4-a716-446655440014)
  ('550e8400-e29b-41d4-a716-446655440014', 'Flour', 300, 'g', 'all-purpose'),
  ('550e8400-e29b-41d4-a716-446655440014', 'Butter', 200, 'g', 'softened'),
  ('550e8400-e29b-41d4-a716-446655440014', 'Brown sugar', 150, 'g', 'packed'),
  ('550e8400-e29b-41d4-a716-446655440014', 'White sugar', 100, 'g', ''),
  ('550e8400-e29b-41d4-a716-446655440014', 'Eggs', 2, 'pieces', ''),
  ('550e8400-e29b-41d4-a716-446655440014', 'Vanilla extract', 2, 'tsp', ''),
  ('550e8400-e29b-41d4-a716-446655440014', 'Chocolate chips', 200, 'g', 'semi-sweet'),
  ('550e8400-e29b-41d4-a716-446655440014', 'Baking soda', 1, 'tsp', ''),
  ('550e8400-e29b-41d4-a716-446655440014', 'Salt', 0.5, 'tsp', '')
ON CONFLICT (id) DO NOTHING;

-- Insert missing recipe instructions for Greek Salad
INSERT INTO recipe_instructions (recipe_id, step_number, instruction) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', 1, 'Cut tomatoes into wedges and place in a large serving bowl.'),
  ('550e8400-e29b-41d4-a716-446655440010', 2, 'Slice cucumber and add to the bowl with tomatoes.'),
  ('550e8400-e29b-41d4-a716-446655440010', 3, 'Add thinly sliced red onion and Kalamata olives to the bowl.'),
  ('550e8400-e29b-41d4-a716-446655440010', 4, 'Crumble feta cheese over the vegetables.'),
  ('550e8400-e29b-41d4-a716-446655440010', 5, 'In a small bowl, whisk together olive oil, lemon juice, and oregano.'),
  ('550e8400-e29b-41d4-a716-446655440010', 6, 'Pour dressing over salad and toss gently. Let stand for 10 minutes before serving.')
ON CONFLICT (id) DO NOTHING;