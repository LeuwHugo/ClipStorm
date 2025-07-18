/*
  # Update campaign budget when clips are approved/paid
  
  This migration creates a trigger to automatically update campaign remaining_budget
  when clip submissions are approved or paid.
  
  ## Changes:
  1. Create function to update campaign budget when submission status changes
  2. Create trigger to call function on clip_submissions updates
  3. Ensure budget is properly deducted when payments are made
*/

-- Function to update campaign budget when submission is approved/paid
CREATE OR REPLACE FUNCTION update_campaign_budget()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update budget if status changed to approved or paid and payment_amount exists
  IF (NEW.status IN ('approved', 'paid') AND OLD.status NOT IN ('approved', 'paid') AND NEW.payment_amount IS NOT NULL) THEN
    -- Deduct payment from campaign remaining budget
    UPDATE campaigns 
    SET remaining_budget = GREATEST(0, COALESCE(remaining_budget, total_budget, 0) - NEW.payment_amount)
    WHERE id = NEW.campaign_id;
  END IF;
  
  -- If status changed from approved/paid to something else, add payment back to budget
  IF (OLD.status IN ('approved', 'paid') AND NEW.status NOT IN ('approved', 'paid') AND OLD.payment_amount IS NOT NULL) THEN
    -- Add payment back to campaign remaining budget
    UPDATE campaigns 
    SET remaining_budget = COALESCE(remaining_budget, 0) + OLD.payment_amount
    WHERE id = OLD.campaign_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update campaign budget on submission status changes
DROP TRIGGER IF EXISTS update_campaign_budget_on_submission ON clip_submissions;
CREATE TRIGGER update_campaign_budget_on_submission
  AFTER UPDATE ON clip_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_budget();

-- Also handle new submissions that are immediately approved
DROP TRIGGER IF EXISTS update_campaign_budget_on_new_submission ON clip_submissions;
CREATE TRIGGER update_campaign_budget_on_new_submission
  AFTER INSERT ON clip_submissions
  FOR EACH ROW
  WHEN (NEW.status IN ('approved', 'paid') AND NEW.payment_amount IS NOT NULL)
  EXECUTE FUNCTION update_campaign_budget();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_campaign_budget() TO authenticated;