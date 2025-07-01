/*
  # Shopping List Management Schema

  1. New Tables
    - `shopping_lists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `name` (text, list name like "Weekly Groceries")
      - `description` (text, optional description)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `shopping_list_items`
      - `id` (uuid, primary key)
      - `shopping_list_id` (uuid, foreign key to shopping_lists)
      - `name` (text, item name)
      - `quantity` (numeric, amount needed)
      - `unit` (text, measurement unit)
      - `category` (text, store section)
      - `is_purchased` (boolean, purchase status)
      - `notes` (text, optional notes)
      - `recipe_id` (uuid, optional reference to source recipe)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own lists
    - Users can only access their own shopping lists and items

  3. Indexes
    - Index on user_id for shopping_lists
    - Index on shopping_list_id for shopping_list_items
    - Index on is_purchased for quick filtering
*/

-- Create shopping_lists table
CREATE TABLE IF NOT EXISTS shopping_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shopping_list_items table
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id uuid NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity numeric(10,2) DEFAULT 1,
  unit text DEFAULT '',
  category text DEFAULT 'Other',
  is_purchased boolean DEFAULT false,
  notes text DEFAULT '',
  recipe_id uuid REFERENCES recipes(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shopping_lists_user_id ON shopping_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_list_id ON shopping_list_items(shopping_list_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_purchased ON shopping_list_items(is_purchased);

-- Enable RLS
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shopping_lists
CREATE POLICY "Users can read own shopping lists"
  ON shopping_lists
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shopping lists"
  ON shopping_lists
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shopping lists"
  ON shopping_lists
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own shopping lists"
  ON shopping_lists
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for shopping_list_items
CREATE POLICY "Users can read own shopping list items"
  ON shopping_list_items
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = (
      SELECT user_id FROM shopping_lists WHERE id = shopping_list_items.shopping_list_id
    )
  );

CREATE POLICY "Users can insert own shopping list items"
  ON shopping_list_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM shopping_lists WHERE id = shopping_list_items.shopping_list_id
    )
  );

CREATE POLICY "Users can update own shopping list items"
  ON shopping_list_items
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = (
      SELECT user_id FROM shopping_lists WHERE id = shopping_list_items.shopping_list_id
    )
  )
  WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM shopping_lists WHERE id = shopping_list_items.shopping_list_id
    )
  );

CREATE POLICY "Users can delete own shopping list items"
  ON shopping_list_items
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = (
      SELECT user_id FROM shopping_lists WHERE id = shopping_list_items.shopping_list_id
    )
  );

-- Create update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shopping_lists_updated_at
  BEFORE UPDATE ON shopping_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_list_items_updated_at
  BEFORE UPDATE ON shopping_list_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();