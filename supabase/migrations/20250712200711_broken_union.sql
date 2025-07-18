/*
  # Create users table and setup

  1. New Tables
    - `users`
      - `id` (uuid, primary key, matches auth.users.id)
      - `email` (text, unique, not null)
      - `display_name` (text, not null)
      - `avatar` (text, nullable)
      - `role` (user_role enum, not null)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
      - Creator specific fields: `platforms`, `channel_name`, `subscriber_count`
      - Clipper specific fields: `bio`, `portfolio`, `languages`, `turnaround_time`, `rating`, `review_count`
      - Stripe fields: `stripe_account_id`, `stripe_customer_id`

  2. Security
    - Enable RLS on `users` table
    - Add policies for users to read/update their own data
    - Add policy for public read access to basic profile info

  3. Functions
    - Add trigger to automatically update `updated_at` timestamp
    - Add function to handle user creation from auth triggers
*/

-- Create user_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('creator', 'clipper');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create users table if it doesn't exist
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
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Public read access for basic profile info (for marketplace)
CREATE POLICY "Public read access to basic profile info" ON users
  FOR SELECT TO anon, authenticated
  USING (true);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation
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