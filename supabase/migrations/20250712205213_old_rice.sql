/*
  # Fix user creation trigger

  This migration fixes the database error when creating new users by updating the trigger function
  to properly handle user metadata and prevent conflicts.

  1. Drop existing trigger and function
  2. Create improved trigger function with better error handling
  3. Recreate trigger
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_display_name text;
  user_role user_role;
BEGIN
  -- Extract display name with fallbacks
  user_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Extract role with fallback to creator
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::user_role,
    'creator'::user_role
  );
  
  -- Insert user with proper error handling
  INSERT INTO public.users (
    id, 
    email, 
    display_name, 
    avatar, 
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_display_name,
    NEW.raw_user_meta_data->>'avatar_url',
    user_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    avatar = EXCLUDED.avatar,
    role = EXCLUDED.role,
    updated_at = now();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();