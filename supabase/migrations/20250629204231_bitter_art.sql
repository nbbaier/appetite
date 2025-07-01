/*
  # Leftovers Table Schema

  1. New Table
    - `leftovers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `quantity` (numeric)
      - `unit` (text)
      - `expiration_date` (date, optional)
      - `source_recipe_id` (uuid, optional, references recipes)
      - `notes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on the table
    - Add policies for authenticated users to manage their own data

  3. Triggers
    - Add `update_updated_at_column` trigger

  4. Indexes
    - Index on user_id for efficient user queries
    - Index on expiration_date for expiration monitoring
*/

-- Create leftovers table
CREATE TABLE IF NOT EXISTS leftovers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  quantity numeric(10,2) DEFAULT 0,
  unit text DEFAULT '',
  expiration_date date,
  source_recipe_id uuid REFERENCES recipes(id) ON DELETE SET NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leftovers_user_id ON leftovers(user_id);
CREATE INDEX IF NOT EXISTS idx_leftovers_expiration ON leftovers(expiration_date) WHERE expiration_date IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE leftovers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leftovers
CREATE POLICY "Users can read own leftovers"
  ON leftovers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leftovers"
  ON leftovers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leftovers"
  ON leftovers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own leftovers"
  ON leftovers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_leftovers_updated_at
  BEFORE UPDATE ON leftovers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();