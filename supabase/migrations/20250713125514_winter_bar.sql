/*
  # Creator-only campaign management
  
  This migration adds role-based access control for campaigns:
  1. Only creators can create campaigns
  2. Only campaign creators can edit, delete, and pause their campaigns
  3. Updates RLS policies to enforce these restrictions
  
  ## Security Changes:
  - Enhanced RLS policies for campaigns table
  - Role-based access control
  - Creator ownership validation
*/

-- Drop existing campaign policies
DROP POLICY IF EXISTS "Anyone can view active campaigns" ON campaigns;
DROP POLICY IF EXISTS "Creators can view their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Creators can create campaigns" ON campaigns;
DROP POLICY IF EXISTS "Creators can update their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Creators can delete their campaigns" ON campaigns;

-- Create new enhanced policies for campaigns

-- Public can view active campaigns
CREATE POLICY "Public can view active campaigns" ON campaigns
  FOR SELECT TO anon, authenticated
  USING (status = 'active');

-- Creators can view all their campaigns (any status)
CREATE POLICY "Creators can view their own campaigns" ON campaigns
  FOR SELECT TO authenticated
  USING (
    auth.uid() = creator_id AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'creator'
    )
  );

-- Only creators can create campaigns
CREATE POLICY "Only creators can create campaigns" ON campaigns
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = creator_id AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'creator'
    )
  );

-- Only campaign creators can update their campaigns
CREATE POLICY "Only campaign creators can update campaigns" ON campaigns
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = creator_id AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'creator'
    )
  )
  WITH CHECK (
    auth.uid() = creator_id AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'creator'
    )
  );

-- Only campaign creators can delete their campaigns
CREATE POLICY "Only campaign creators can delete campaigns" ON campaigns
  FOR DELETE TO authenticated
  USING (
    auth.uid() = creator_id AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'creator'
    )
  );

-- Create function to check if user is creator
CREATE OR REPLACE FUNCTION is_creator(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id 
    AND role = 'creator'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_creator(uuid) TO authenticated;