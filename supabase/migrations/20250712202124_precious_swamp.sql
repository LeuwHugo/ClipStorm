/*
  # Complete ClipStorm Database Schema

  This migration creates all the necessary tables for the ClipStorm platform.

  ## Tables Created:
  1. Users - User profiles for creators and editors
  2. Campaigns - Video campaigns created by content creators
  3. Gigs - Service offerings by video editors
  4. Orders - Work orders between creators and editors
  5. Clip Submissions - Submissions for campaigns
  6. Reviews - User reviews and ratings
  7. Metrics - Video performance tracking
  8. Storage buckets and policies

  ## Security:
  - Row Level Security (RLS) enabled on all tables
  - Appropriate policies for data access
  - Storage policies for file uploads
*/

-- Create custom types/enums
CREATE TYPE user_role AS ENUM ('creator', 'clipper');
CREATE TYPE campaign_status AS ENUM ('active', 'paused', 'completed');
CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'in_progress', 'delivered', 'approved', 'cancelled');
CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'rejected', 'paid');
CREATE TYPE platform AS ENUM ('tiktok', 'instagram', 'youtube', 'twitter');

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid NOT NULL,
  email text NOT NULL,
  display_name text NOT NULL,
  avatar text NULL,
  role user_role NOT NULL,
  created_at timestamptz NULL DEFAULT now(),
  updated_at timestamptz NULL DEFAULT now(),
  
  -- Creator specific fields
  platforms text[] NULL,
  channel_name text NULL,
  subscriber_count integer NULL,
  
  -- Clipper specific fields
  bio text NULL,
  portfolio text[] NULL,
  languages text[] NULL,
  turnaround_time integer NULL,
  rating numeric(3, 2) NULL,
  review_count integer NULL DEFAULT 0,
  
  -- Stripe fields
  stripe_account_id text NULL,
  stripe_customer_id text NULL,
  
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT users_rating_check CHECK (rating >= 0 AND rating <= 5)
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
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
  CONSTRAINT campaigns_remaining_budget_valid CHECK (remaining_budget IS NULL OR remaining_budget >= 0)
);

-- Gigs table
CREATE TABLE IF NOT EXISTS gigs (
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
CREATE TABLE IF NOT EXISTS orders (
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
CREATE TABLE IF NOT EXISTS clip_submissions (
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
  CONSTRAINT clip_submissions_payment_amount_positive CHECK (payment_amount IS NULL OR payment_amount >= 0)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
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
  CONSTRAINT reviews_unique_per_order UNIQUE (order_id, reviewer_id)
);

-- Metrics table
CREATE TABLE IF NOT EXISTS metrics (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_rating ON users(rating DESC) WHERE rating IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_campaigns_creator_id ON campaigns(creator_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gigs_clipper_id ON gigs(clipper_id);
CREATE INDEX IF NOT EXISTS idx_gigs_active ON gigs(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_orders_creator_id ON orders(creator_id);
CREATE INDEX IF NOT EXISTS idx_orders_clipper_id ON orders(clipper_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_clip_submissions_campaign_id ON clip_submissions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_clip_submissions_submitter_id ON clip_submissions(submitter_id);
CREATE INDEX IF NOT EXISTS idx_clip_submissions_status ON clip_submissions(status);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_user_id ON reviews(reviewed_user_id);
CREATE INDEX IF NOT EXISTS idx_metrics_order_id ON metrics(order_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE clip_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Creators can manage their campaigns" ON campaigns
  FOR ALL TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- Gigs policies
CREATE POLICY "Anyone can view active gigs" ON gigs
  FOR SELECT TO anon, authenticated
  USING (active = true);

CREATE POLICY "Clippers can manage their gigs" ON gigs
  FOR ALL TO authenticated
  USING (auth.uid() = clipper_id)
  WITH CHECK (auth.uid() = clipper_id);

-- Orders policies
CREATE POLICY "Users can view their orders" ON orders
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

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('campaign-images', 'campaign-images', true),
  ('user-avatars', 'user-avatars', true),
  ('portfolio-videos', 'portfolio-videos', true),
  ('order-assets', 'order-assets', false),
  ('delivered-videos', 'delivered-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for campaign-images
CREATE POLICY "Allow authenticated users to upload campaign images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'campaign-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow public read access to campaign images" ON storage.objects
FOR SELECT USING (bucket_id = 'campaign-images');

-- Storage policies for user-avatars
CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-avatars' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow public read access to avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'user-avatars');

-- Storage policies for portfolio-videos
CREATE POLICY "Allow authenticated users to upload portfolio videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'portfolio-videos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow public read access to portfolio videos" ON storage.objects
FOR SELECT USING (bucket_id = 'portfolio-videos');

-- Storage policies for order-assets (private)
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

-- Storage policies for delivered-videos (private)
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

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
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

-- Function to handle new user creation from auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'creator'::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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

-- Create trigger to update ratings
CREATE TRIGGER update_rating_on_review
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rating();

-- Create some helpful views
CREATE OR REPLACE VIEW public.campaign_stats AS
SELECT 
  c.id,
  c.title,
  c.creator_id,
  COUNT(cs.id) as total_submissions,
  COUNT(CASE WHEN cs.status = 'approved' THEN 1 END) as approved_submissions,
  COUNT(CASE WHEN cs.status = 'pending' THEN 1 END) as pending_submissions,
  COALESCE(SUM(cs.view_count), 0) as total_views,
  COALESCE(SUM(cs.payment_amount), 0) as total_paid
FROM campaigns c
LEFT JOIN clip_submissions cs ON c.id = cs.campaign_id
GROUP BY c.id, c.title, c.creator_id;

CREATE OR REPLACE VIEW public.user_stats AS
SELECT 
  u.id,
  u.display_name,
  u.role,
  u.rating,
  u.review_count,
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
  END as total_orders
FROM users u;