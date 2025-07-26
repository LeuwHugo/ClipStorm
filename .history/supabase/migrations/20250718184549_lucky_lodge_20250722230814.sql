/*
  # Add Stripe integration fields
  
  This migration adds necessary fields for Stripe integration:
  1. Add stripe_payment_intent_id to campaigns table
  2. Add stripe_transfer_id to clip_submissions table
  3. Update campaign status handling for payment flow
  
  ## Changes:
  - Add payment tracking fields
  - Update constraints for payment flow
*/

-- Add Stripe payment intent ID to campaigns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'stripe_payment_intent_id'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN stripe_payment_intent_id text NULL;
  END IF;
END $$;

-- Add Stripe transfer ID to clip submissions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clip_submissions' AND column_name = 'stripe_transfer_id'
  ) THEN
    ALTER TABLE clip_submissions ADD COLUMN stripe_transfer_id text NULL;
  END IF;
END $$;

-- Add payment status to campaigns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed'));
  END IF;
END $$;

-- Create index for payment tracking
CREATE INDEX IF NOT EXISTS idx_campaigns_payment_status ON campaigns(payment_status);
CREATE INDEX IF NOT EXISTS idx_campaigns_stripe_payment_intent ON campaigns(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clip_submissions_stripe_transfer ON clip_submissions(stripe_transfer_id) WHERE stripe_transfer_id IS NOT NULL;

-- Update campaign_stats view to include payment information
DROP VIEW IF EXISTS public.campaign_stats;
CREATE OR REPLACE VIEW public.campaign_stats AS
SELECT 
  c.id,
  c.title,
  c.creator_id,
  c.status,
  c.payment_status,
  c.total_budget,
  c.remaining_budget,
  c.stripe_payment_intent_id,
  COUNT(cs.id) as total_submissions,
  COUNT(CASE WHEN cs.status = 'approved' THEN 1 END) as approved_submissions,
  COUNT(CASE WHEN cs.status = 'pending' THEN 1 END) as pending_submissions,
  COUNT(CASE WHEN cs.status = 'rejected' THEN 1 END) as rejected_submissions,
  COUNT(CASE WHEN cs.status = 'paid' THEN 1 END) as paid_submissions,
  COALESCE(SUM(cs.view_count), 0) as total_views,
  COALESCE(SUM(CASE WHEN cs.status IN ('approved', 'paid') THEN cs.payment_amount ELSE 0 END), 0) as total_paid,
  c.created_at,
  c.expires_at
FROM campaigns c
LEFT JOIN clip_submissions cs ON c.id = cs.campaign_id
GROUP BY c.id, c.title, c.creator_id, c.status, c.payment_status, c.total_budget, c.remaining_budget, c.stripe_payment_intent_id, c.created_at, c.expires_at;

-- Grant permissions on updated view
GRANT SELECT ON public.campaign_stats TO anon, authenticated;