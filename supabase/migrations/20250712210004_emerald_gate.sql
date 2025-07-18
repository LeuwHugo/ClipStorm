/*
  # Complete Database Reset and Recreation
  
  This migration completely resets the database by:
  1. Dropping all existing tables, types, functions, and storage buckets
  2. Recreating everything with proper structure
  3. Setting up all RLS policies and authentication
  4. Creating storage buckets with proper policies
  
  ## Tables:
  - users (user profiles)
  - campaigns (video campaigns)
  - gigs (editor service offerings)
  - orders (work orders)
  - clip_submissions (campaign submissions)
  - reviews (user reviews)
  - metrics (performance tracking)
  
  ## Storage Buckets:
  - campaign-images (public)
  - user-avatars (public)
  - portfolio-videos (public)
  - order-assets (private)
  - delivered-videos (private)
*/

-- =============================================
-- STEP 1: DROP EVERYTHING
-- =============================================

-- Drop all triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
DROP TRIGGER IF EXISTS update_gigs_updated_at ON gigs;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_rating_on_review ON reviews;

-- Drop all views
DROP VIEW IF EXISTS public.campaign_stats;
DROP VIEW IF EXISTS public.user_stats;

-- Drop all functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS update_user_rating();

-- Drop all tables (in reverse dependency order)
DROP TABLE IF EXISTS metrics CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS clip_submissions CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS gigs CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop all custom types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS campaign_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS submission_status CASCADE;
DROP TYPE IF EXISTS platform CASCADE;

-- Drop storage buckets
DELETE FROM storage.buckets WHERE id IN (
  'campaign-images',
  'user-avatars', 
  'portfolio-videos',
  'order-assets',
  'delivered-videos'
);

-- =============================================
-- STEP 2: CREATE TYPES
-- =============================================

CREATE TYPE user_role AS ENUM ('creator', 'clipper');
CREATE TYPE campaign_status AS ENUM ('active', 'paused', 'completed');
CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'in_progress', 'delivered', 'approved', 'cancelled');
CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'rejected', 'paid');
CREATE TYPE platform AS ENUM ('tiktok', 'instagram', 'youtube', 'twitter');

-- =============================================
-- STEP 3: CREATE TABLES
-- =============================================

-- Users table (extends auth.users)
CREATE TABLE users (
  id uuid NOT NULL,
  email text NOT NULL,
  display_name text NOT NULL,
  avatar text NULL,
  role user_role NOT NULL DEFAULT 'creator',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Creator specific fields
  platforms text[] NULL,
  channel_name text NULL,
  subscriber_count integer NULL,
  
  -- Clipper specific fields
  bio text NULL,
  portfolio text[] NULL,
  languages text[] NULL DEFAULT ARRAY['English'],
  turnaround_time integer NULL DEFAULT 24,
  rating numeric(3, 2) NULL,
  review_count integer NOT NULL DEFAULT 0,
  
  -- Stripe fields
  stripe_account_id text NULL,
  stripe_customer_id text NULL,
  
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT users_rating_check CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
  CONSTRAINT users_subscriber_count_check CHECK (subscriber_count IS NULL OR subscriber_count >= 0),
  CONSTRAINT users_turnaround_time_check CHECK (turnaround_time IS NULL OR turnaround_time > 0),
  CONSTRAINT users_review_count_check CHECK (review_count >= 0)
);

-- Campaigns table
CREATE TABLE campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  title text NOT NULL,
  video_url text NOT NULL,
  thumbnail text NOT NULL,
  amount_per_million_views numeric(10, 2) NOT NULL,
  minimum_views integer NOT NULL DEFAULT 100000,
  rules text[] NOT NULL DEFAULT '{}',
  status campaign_status NOT NULL DEFAULT 'active',
  total_budget numeric(10, 2) NULL,
  remaining_budget numeric(10, 2) NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NULL,
  
  CONSTRAINT campaigns_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT campaigns_amount_positive CHECK (amount_per_million_views > 0),
  CONSTRAINT campaigns_minimum_views_positive CHECK (minimum_views > 0),
  CONSTRAINT campaigns_budget_positive CHECK (total_budget IS NULL OR total_budget > 0),
  CONSTRAINT campaigns_remaining_budget_valid CHECK (remaining_budget IS NULL OR remaining_budget >= 0),
  CONSTRAINT campaigns_remaining_budget_not_exceed_total CHECK (remaining_budget IS NULL OR total_budget IS NULL OR remaining_budget <= total_budget)
);

-- Gigs table
CREATE TABLE gigs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clipper_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  price_per_thousand_views numeric(8, 4) NOT NULL,
  turnaround_time integer NOT NULL,
  deliverables text[] NOT NULL DEFAULT '{}',
  examples text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT gigs_clipper_id_fkey FOREIGN KEY (clipper_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT gigs_price_positive CHECK (price_per_thousand_views > 0),
  CONSTRAINT gigs_turnaround_positive CHECK (turnaround_time > 0)
);

-- Orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id uuid NOT NULL,
  creator_id uuid NOT NULL,
  clipper_id uuid NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  brief text NOT NULL,
  assets text[] NOT NULL DEFAULT '{}',
  delivered_videos text[] NOT NULL DEFAULT '{}',
  total_views integer NOT NULL DEFAULT 0,
  amount_paid numeric(10, 2) NOT NULL DEFAULT 0,
  stripe_payment_intent_id text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT orders_gig_id_fkey FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE CASCADE,
  CONSTRAINT orders_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT orders_clipper_id_fkey FOREIGN KEY (clipper_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT orders_total_views_positive CHECK (total_views >= 0),
  CONSTRAINT orders_amount_paid_positive CHECK (amount_paid >= 0)
);

-- Clip submissions table
CREATE TABLE clip_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL,
  submitter_id uuid NOT NULL,
  clip_url text NOT NULL,
  platform platform NOT NULL,
  view_count integer NOT NULL DEFAULT 0,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  status submission_status NOT NULL DEFAULT 'pending',
  payment_amount numeric(10, 2) NULL,
  rejection_reason text NULL,
  verified_at timestamptz NULL,
  
  CONSTRAINT clip_submissions_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  CONSTRAINT clip_submissions_submitter_id_fkey FOREIGN KEY (submitter_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT clip_submissions_view_count_positive CHECK (view_count >= 0),
  CONSTRAINT clip_submissions_payment_amount_positive CHECK (payment_amount IS NULL OR payment_amount >= 0),
  CONSTRAINT clip_submissions_unique_submission UNIQUE (campaign_id, submitter_id, clip_url)
);

-- Reviews table
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  reviewer_id uuid NOT NULL,
  reviewed_user_id uuid NOT NULL,
  rating integer NOT NULL,
  comment text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT reviews_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT reviews_reviewed_user_id_fkey FOREIGN KEY (reviewed_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT reviews_rating_valid CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT reviews_unique_per_order UNIQUE (order_id, reviewer_id),
  CONSTRAINT reviews_no_self_review CHECK (reviewer_id != reviewed_user_id)
);

-- Metrics table
CREATE TABLE metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  video_url text NOT NULL,
  platform platform NOT NULL,
  view_count integer NOT NULL DEFAULT 0,
  last_checked timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT metrics_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT metrics_view_count_positive CHECK (view_count >= 0)
);

-- =============================================
-- STEP 4: CREATE INDEXES
-- =============================================

-- Users indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_rating ON users(rating DESC) WHERE rating IS NOT NULL;
CREATE INDEX idx_users_email ON users(email);

-- Campaigns indexes
CREATE INDEX idx_campaigns_creator_id ON campaigns(creator_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);
CREATE INDEX idx_campaigns_expires_at ON campaigns(expires_at) WHERE expires_at IS NOT NULL;

-- Gigs indexes
CREATE INDEX idx_gigs_clipper_id ON gigs(clipper_id);
CREATE INDEX idx_gigs_active ON gigs(active) WHERE active = true;
CREATE INDEX idx_gigs_price ON gigs(price_per_thousand_views);

-- Orders indexes
CREATE INDEX idx_orders_creator_id ON orders(creator_id);
CREATE INDEX idx_orders_clipper_id ON orders(clipper_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Clip submissions indexes
CREATE INDEX idx_clip_submissions_campaign_id ON clip_submissions(campaign_id);
CREATE INDEX idx_clip_submissions_submitter_id ON clip_submissions(submitter_id);
CREATE INDEX idx_clip_submissions_status ON clip_submissions(status);
CREATE INDEX idx_clip_submissions_submitted_at ON clip_submissions(submitted_at DESC);

-- Reviews indexes
CREATE INDEX idx_reviews_reviewed_user_id ON reviews(reviewed_user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Metrics indexes
CREATE INDEX idx_metrics_order_id ON metrics(order_id);
CREATE INDEX idx_metrics_last_checked ON metrics(last_checked);

-- =============================================
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE clip_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 6: CREATE RLS POLICIES
-- =============================================

-- Users policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public read access to basic profile info" ON users
  FOR SELECT TO anon, authenticated
  USING (true);

-- Campaigns policies
CREATE POLICY "Anyone can view active campaigns" ON campaigns
  FOR SELECT TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "Creators can view their campaigns" ON campaigns
  FOR SELECT TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can create campaigns" ON campaigns
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their campaigns" ON campaigns
  FOR UPDATE TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their campaigns" ON campaigns
  FOR DELETE TO authenticated
  USING (auth.uid() = creator_id);

-- Gigs policies
CREATE POLICY "Anyone can view active gigs" ON gigs
  FOR SELECT TO anon, authenticated
  USING (active = true);

CREATE POLICY "Clippers can view their gigs" ON gigs
  FOR SELECT TO authenticated
  USING (auth.uid() = clipper_id);

CREATE POLICY "Clippers can create gigs" ON gigs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = clipper_id);

CREATE POLICY "Clippers can update their gigs" ON gigs
  FOR UPDATE TO authenticated
  USING (auth.uid() = clipper_id)
  WITH CHECK (auth.uid() = clipper_id);

CREATE POLICY "Clippers can delete their gigs" ON gigs
  FOR DELETE TO authenticated
  USING (auth.uid() = clipper_id);

-- Orders policies
CREATE POLICY "Order participants can view orders" ON orders
  FOR SELECT TO authenticated
  USING (auth.uid() = creator_id OR auth.uid() = clipper_id);

CREATE POLICY "Creators can create orders" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Order participants can update orders" ON orders
  FOR UPDATE TO authenticated
  USING (auth.uid() = creator_id OR auth.uid() = clipper_id)
  WITH CHECK (auth.uid() = creator_id OR auth.uid() = clipper_id);

-- Clip submissions policies
CREATE POLICY "Anyone can view approved submissions" ON clip_submissions
  FOR SELECT TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "Users can view their submissions" ON clip_submissions
  FOR SELECT TO authenticated
  USING (auth.uid() = submitter_id);

CREATE POLICY "Campaign creators can view all submissions" ON clip_submissions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = clip_submissions.campaign_id 
      AND campaigns.creator_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can submit clips" ON clip_submissions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = submitter_id);

CREATE POLICY "Campaign creators can update submissions" ON clip_submissions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = clip_submissions.campaign_id 
      AND campaigns.creator_id = auth.uid()
    )
  );

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Order participants can create reviews" ON reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_id 
      AND (orders.creator_id = auth.uid() OR orders.clipper_id = auth.uid())
    )
  );

CREATE POLICY "Reviewers can update their reviews" ON reviews
  FOR UPDATE TO authenticated
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

-- Metrics policies
CREATE POLICY "Order participants can view metrics" ON metrics
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = metrics.order_id 
      AND (orders.creator_id = auth.uid() OR orders.clipper_id = auth.uid())
    )
  );

CREATE POLICY "System can manage metrics" ON metrics
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================
-- STEP 7: CREATE STORAGE BUCKETS
-- =============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
  ('campaign-images', 'campaign-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('user-avatars', 'user-avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('portfolio-videos', 'portfolio-videos', true, 104857600, ARRAY['video/mp4', 'video/webm', 'video/quicktime']),
  ('order-assets', 'order-assets', false, 1073741824, NULL),
  ('delivered-videos', 'delivered-videos', false, 1073741824, ARRAY['video/mp4', 'video/webm', 'video/quicktime'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =============================================
-- STEP 8: CREATE STORAGE POLICIES
-- =============================================

-- Campaign images policies
CREATE POLICY "Allow authenticated users to upload campaign images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'campaign-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow public read access to campaign images" ON storage.objects
FOR SELECT USING (bucket_id = 'campaign-images');

CREATE POLICY "Allow users to update their campaign images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'campaign-images' 
  AND auth.role() = 'authenticated'
) WITH CHECK (
  bucket_id = 'campaign-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to delete their campaign images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'campaign-images' 
  AND auth.role() = 'authenticated'
);

-- User avatars policies
CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-avatars' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow public read access to avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Allow users to update their avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-avatars' 
  AND auth.role() = 'authenticated'
) WITH CHECK (
  bucket_id = 'user-avatars' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to delete their avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-avatars' 
  AND auth.role() = 'authenticated'
);

-- Portfolio videos policies
CREATE POLICY "Allow authenticated users to upload portfolio videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'portfolio-videos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow public read access to portfolio videos" ON storage.objects
FOR SELECT USING (bucket_id = 'portfolio-videos');

CREATE POLICY "Allow users to update their portfolio videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'portfolio-videos' 
  AND auth.role() = 'authenticated'
) WITH CHECK (
  bucket_id = 'portfolio-videos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to delete their portfolio videos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'portfolio-videos' 
  AND auth.role() = 'authenticated'
);

-- Order assets policies (private)
CREATE POLICY "Allow order participants to upload assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'order-assets' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow order participants to view assets" ON storage.objects
FOR SELECT USING (
  bucket_id = 'order-assets' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow order participants to update assets" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'order-assets' 
  AND auth.role() = 'authenticated'
) WITH CHECK (
  bucket_id = 'order-assets' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow order participants to delete assets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'order-assets' 
  AND auth.role() = 'authenticated'
);

-- Delivered videos policies (private)
CREATE POLICY "Allow order participants to upload delivered videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'delivered-videos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow order participants to view delivered videos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'delivered-videos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow order participants to update delivered videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'delivered-videos' 
  AND auth.role() = 'authenticated'
) WITH CHECK (
  bucket_id = 'delivered-videos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow order participants to delete delivered videos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'delivered-videos' 
  AND auth.role() = 'authenticated'
);

-- =============================================
-- STEP 9: CREATE FUNCTIONS
-- =============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update user rating when new review is added
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users 
  SET 
    rating = (
      SELECT AVG(rating)::numeric(3,2) 
      FROM reviews 
      WHERE reviewed_user_id = NEW.reviewed_user_id
    ),
    review_count = (
      SELECT COUNT(*) 
      FROM reviews 
      WHERE reviewed_user_id = NEW.reviewed_user_id
    )
  WHERE id = NEW.reviewed_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user creation from auth
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
  BEGIN
    user_role := COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'creator'::user_role
    );
  EXCEPTION
    WHEN invalid_text_representation THEN
      user_role := 'creator'::user_role;
  END;
  
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

-- =============================================
-- STEP 10: CREATE TRIGGERS
-- =============================================

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gigs_updated_at
    BEFORE UPDATE ON gigs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update ratings
CREATE TRIGGER update_rating_on_review
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rating();

-- Trigger for automatic user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- STEP 11: CREATE HELPFUL VIEWS
-- =============================================

CREATE OR REPLACE VIEW public.campaign_stats AS
SELECT 
  c.id,
  c.title,
  c.creator_id,
  c.status,
  c.total_budget,
  c.remaining_budget,
  COUNT(cs.id) as total_submissions,
  COUNT(CASE WHEN cs.status = 'approved' THEN 1 END) as approved_submissions,
  COUNT(CASE WHEN cs.status = 'pending' THEN 1 END) as pending_submissions,
  COUNT(CASE WHEN cs.status = 'rejected' THEN 1 END) as rejected_submissions,
  COALESCE(SUM(cs.view_count), 0) as total_views,
  COALESCE(SUM(cs.payment_amount), 0) as total_paid,
  c.created_at,
  c.expires_at
FROM campaigns c
LEFT JOIN clip_submissions cs ON c.id = cs.campaign_id
GROUP BY c.id, c.title, c.creator_id, c.status, c.total_budget, c.remaining_budget, c.created_at, c.expires_at;

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
      SELECT COUNT(*) FROM orders WHERE creator_id = u.id AND status = 'completed'
    )
    ELSE (
      SELECT COUNT(*) FROM orders WHERE clipper_id = u.id AND status = 'completed'
    )
  END as completed_orders
FROM users u;

-- =============================================
-- STEP 12: INSERT SAMPLE DATA (OPTIONAL)
-- =============================================

-- This section can be uncommented to insert sample data for testing
/*
-- Sample users will be created automatically via auth triggers
-- Sample campaigns, gigs, etc. can be added here if needed for testing
*/

-- =============================================
-- FINAL STEP: GRANT PERMISSIONS
-- =============================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant read access to anonymous users for public data
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON users TO anon;
GRANT SELECT ON campaigns TO anon;
GRANT SELECT ON gigs TO anon;
GRANT SELECT ON clip_submissions TO anon;
GRANT SELECT ON reviews TO anon;
GRANT SELECT ON public.campaign_stats TO anon;
GRANT SELECT ON public.user_stats TO anon;

-- Grant permissions for storage
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;