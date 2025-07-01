/*
  # Fix user defaults trigger and policies

  1. Changes
     - Drop and recreate the auth user trigger with proper security definer
     - Add policies for function owner to insert profiles and preferences with existence checks
     - Ensure policies are only created if they don't already exist

  2. Security
     - Maintains proper security definer settings for the function
     - Ensures function owner has appropriate insert permissions
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function with proper security definer
CREATE OR REPLACE FUNCTION create_user_defaults()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default profile
  INSERT INTO public.user_profiles (user_id, full_name, avatar_color)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    '#10B981'
  );
  
  -- Create default preferences
  INSERT INTO public.user_preferences (
    user_id, 
    dietary_restrictions, 
    allergies, 
    preferred_cuisines,
    cooking_skill_level,
    measurement_units,
    family_size,
    kitchen_equipment,
    notification_enabled,
    expiration_threshold_days,
    inventory_threshold
  )
  VALUES (
    NEW.id,
    '{}',
    '{}',
    '{}',
    'Beginner',
    'Metric',
    2,
    '{}',
    true,
    3,
    1
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function owner policy to allow inserting profiles (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Function owner can insert profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Function owner can insert profile"
      ON public.user_profiles
      FOR INSERT
      TO postgres
      WITH CHECK (true)';
  END IF;
END
$$;

-- Add function owner policy to allow inserting preferences (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_preferences' 
    AND policyname = 'Function owner can insert preferences'
  ) THEN
    EXECUTE 'CREATE POLICY "Function owner can insert preferences"
      ON public.user_preferences
      FOR INSERT
      TO postgres
      WITH CHECK (true)';
  END IF;
END
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_defaults();