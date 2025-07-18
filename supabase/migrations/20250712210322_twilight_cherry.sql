/*
  # Fix order_status enum error
  
  This migration fixes the enum error by updating the order_status enum
  to include 'completed' status and correcting the user_stats view.
  
  ## Changes:
  1. Add 'completed' to order_status enum
  2. Fix user_stats view to use correct status values
*/

-- Drop the problematic view first
DROP VIEW IF EXISTS public.user_stats;

-- Drop and recreate the order_status enum with the missing 'completed' value
DROP TYPE IF EXISTS order_status CASCADE;
CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'in_progress', 'delivered', 'approved', 'completed', 'cancelled');

-- Update the orders table to use the new enum
ALTER TABLE orders ALTER COLUMN status TYPE order_status USING status::text::order_status;

-- Recreate the user_stats view with correct enum values
CREATE OR REPLACE VIEW public.user_stats AS
SELECT 
  u.id,
  u.display_name,
  u.role,
  u.rating,
  u.review_count,
  u.created_at,
  CASE 
    WHEN u.role = 'creator' THEN (
      SELECT COUNT(*) FROM campaigns WHERE creator_id = u.id
    )
    ELSE (
      SELECT COUNT(*) FROM gigs WHERE clipper_id = u.id
    )
  END as total_listings,
  CASE 
    WHEN u.role = 'creator' THEN (
      SELECT COUNT(*) FROM orders WHERE creator_id = u.id
    )
    ELSE (
      SELECT COUNT(*) FROM orders WHERE clipper_id = u.id
    )
  END as total_orders,
  CASE 
    WHEN u.role = 'creator' THEN (
      SELECT COUNT(*) FROM orders WHERE creator_id = u.id AND status IN ('approved', 'completed')
    )
    ELSE (
      SELECT COUNT(*) FROM orders WHERE clipper_id = u.id AND status IN ('approved', 'completed')
    )
  END as completed_orders
FROM users u;

-- Grant permissions on the view
GRANT SELECT ON public.user_stats TO anon, authenticated;