/*
  # Add Low Stock Tracking

  1. Schema Changes
    - Add `low_stock_threshold` column to ingredients table
    - Add `stock_level` enum for categorizing stock levels
    - Add indexes for efficient stock level queries

  2. Functions
    - Function to calculate stock level based on quantity and threshold
    - Function to get low stock items for a user

  3. Default Values
    - Set reasonable default thresholds based on units
*/

-- Add low stock threshold column to ingredients table
ALTER TABLE ingredients 
ADD COLUMN IF NOT EXISTS low_stock_threshold numeric(10,2) DEFAULT 1;

-- Create enum for stock levels
DO $$ BEGIN
    CREATE TYPE stock_level AS ENUM ('out_of_stock', 'low_stock', 'adequate_stock');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Function to determine stock level
CREATE OR REPLACE FUNCTION get_stock_level(quantity numeric, threshold numeric)
RETURNS stock_level AS $$
BEGIN
    IF quantity <= 0 THEN
        RETURN 'out_of_stock';
    ELSIF quantity <= threshold THEN
        RETURN 'low_stock';
    ELSE
        RETURN 'adequate_stock';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get low stock items for a user
CREATE OR REPLACE FUNCTION get_low_stock_ingredients(user_uuid uuid)
RETURNS TABLE (
    id uuid,
    name text,
    quantity numeric,
    unit text,
    category text,
    low_stock_threshold numeric,
    stock_level stock_level,
    created_at timestamptz,
    updated_at timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.name,
        i.quantity,
        i.unit,
        i.category,
        i.low_stock_threshold,
        get_stock_level(i.quantity, i.low_stock_threshold) as stock_level,
        i.created_at,
        i.updated_at
    FROM ingredients i
    WHERE i.user_id = user_uuid
    AND get_stock_level(i.quantity, i.low_stock_threshold) IN ('out_of_stock', 'low_stock')
    ORDER BY 
        CASE 
            WHEN get_stock_level(i.quantity, i.low_stock_threshold) = 'out_of_stock' THEN 1
            ELSE 2
        END,
        i.quantity ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for efficient stock level queries
CREATE INDEX IF NOT EXISTS idx_ingredients_stock_level 
ON ingredients USING btree (user_id, quantity, low_stock_threshold);

-- Update existing ingredients with reasonable default thresholds based on units
UPDATE ingredients 
SET low_stock_threshold = CASE 
    WHEN unit IN ('kg', 'l') THEN 0.5
    WHEN unit IN ('g', 'ml') THEN 100
    WHEN unit IN ('cups') THEN 0.5
    WHEN unit IN ('tbsp', 'tsp') THEN 2
    WHEN unit IN ('pieces', 'cans', 'bottles') THEN 1
    ELSE 1
END
WHERE low_stock_threshold = 1;