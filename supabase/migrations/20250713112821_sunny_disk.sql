/*
  # Disable automatic user creation trigger and handle manually
  
  This migration disables the problematic automatic user creation trigger
  and allows the application to handle user profile creation manually
  after successful authentication.
  
  ## Changes:
  1. Drop the problematic trigger that's causing 500 errors
  2. Create a manual user creation function for the app to call
  3. Update RLS policies to allow manual user creation
*/

-- Drop the problematic trigger that's causing signup failures
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a manual user creation function that the app can call
CREATE OR REPLACE FUNCTION public.create_user_profile_manual(
  user_id uuid,
  user_email text,
  user_display_name text DEFAULT NULL,
  user_role user_role DEFAULT 'creator',
  user_avatar text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  -- Insert user profile
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
    user_id,
    user_email,
    COALESCE(user_display_name, split_part(user_email, '@', 1)),
    user_avatar,
    user_role,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    avatar = EXCLUDED.avatar,
    role = EXCLUDED.role,
    updated_at = now();
    
  -- Return success result
  SELECT json_build_object(
    'success', true,
    'user_id', user_id,
    'message', 'User profile created successfully'
  ) INTO result;
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return error result
    SELECT json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to create user profile'
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_profile_manual(uuid, text, text, user_role, text) TO authenticated;

-- Update RLS policy to allow authenticated users to insert their own profile
DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Add a policy for service role to insert user data (for manual creation)
CREATE POLICY "Service role can insert user data" ON users
  FOR INSERT TO service_role
  WITH CHECK (true);