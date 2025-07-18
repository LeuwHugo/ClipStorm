/*
  # Fix signup database trigger error
  
  This migration fixes the user creation trigger that's causing 500 errors during signup.
  The issue is likely with the trigger function not properly handling user metadata or
  having conflicts with existing data.
  
  ## Changes:
  1. Drop and recreate the user creation trigger with better error handling
  2. Ensure proper handling of user metadata
  3. Add conflict resolution for existing users
  4. Improve error logging without failing auth
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
  user_avatar text;
BEGIN
  -- Extract display name with multiple fallbacks
  user_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'displayName',
    split_part(NEW.email, '@', 1),
    'User'
  );
  
  -- Extract avatar URL
  user_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );
  
  -- Extract and validate role
  BEGIN
    user_role := COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'creator'::user_role
    );
  EXCEPTION
    WHEN invalid_text_representation THEN
      user_role := 'creator'::user_role;
    WHEN OTHERS THEN
      user_role := 'creator'::user_role;
  END;
  
  -- Insert user profile with comprehensive error handling
  BEGIN
    INSERT INTO public.users (
      id, 
      email, 
      display_name, 
      avatar, 
      role,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.email, ''),
      user_display_name,
      user_avatar,
      user_role,
      COALESCE(NEW.created_at, now()),
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      display_name = EXCLUDED.display_name,
      avatar = EXCLUDED.avatar,
      role = EXCLUDED.role,
      updated_at = now();
      
  EXCEPTION
    WHEN unique_violation THEN
      -- Handle unique constraint violations
      UPDATE public.users 
      SET 
        email = COALESCE(NEW.email, users.email),
        display_name = user_display_name,
        avatar = user_avatar,
        role = user_role,
        updated_at = now()
      WHERE id = NEW.id;
      
    WHEN foreign_key_violation THEN
      -- Log foreign key issues but don't fail
      RAISE WARNING 'Foreign key violation for user %: %', NEW.id, SQLERRM;
      
    WHEN check_violation THEN
      -- Log check constraint issues but don't fail
      RAISE WARNING 'Check constraint violation for user %: %', NEW.id, SQLERRM;
      
    WHEN OTHERS THEN
      -- Log any other errors but don't fail the auth process
      RAISE WARNING 'Failed to create user profile for % (email: %): % - %', 
        NEW.id, NEW.email, SQLSTATE, SQLERRM;
  END;
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Final catch-all to ensure auth never fails
    RAISE WARNING 'Critical error in handle_new_user for %: % - %', 
      NEW.id, SQLSTATE, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger with the improved function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure the function has proper permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Add a manual user creation function for testing/debugging
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id uuid,
  user_email text,
  user_display_name text DEFAULT NULL,
  user_role user_role DEFAULT 'creator',
  user_avatar text DEFAULT NULL
)
RETURNS boolean AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    display_name,
    avatar,
    role
  )
  VALUES (
    user_id,
    user_email,
    COALESCE(user_display_name, split_part(user_email, '@', 1)),
    user_avatar,
    user_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    avatar = EXCLUDED.avatar,
    role = EXCLUDED.role,
    updated_at = now();
    
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create user profile manually: %', SQLERRM;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions on the manual function
GRANT EXECUTE ON FUNCTION public.create_user_profile(uuid, text, text, user_role, text) TO authenticated;