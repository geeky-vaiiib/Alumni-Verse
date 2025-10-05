-- Migration: Update profiles table and RLS policies
-- Purpose: Add auth_id field and create safe, non-recursive RLS policies

-- Add auth_id column to link with Supabase auth.users
-- Note: The existing 'id' field already references auth.users(id), so auth_id is redundant
-- But keeping for explicit clarity if needed later
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add is_complete column to track profile setup status
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_complete BOOLEAN DEFAULT false;

-- Update existing rows to set auth_id = id if null
UPDATE public.profiles SET auth_id = id WHERE auth_id IS NULL;

-- Drop existing policies to recreate them safely
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create safe, non-recursive RLS policies

-- Allow everyone to view all profiles (public directory)
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT 
  USING (true);

-- Allow users to insert their own profile
-- Use auth.uid() = id (since id is the auth user id)
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile (optional, usually not needed)
CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE 
  USING (auth.uid() = id);

-- Create index on auth_id for faster lookups
CREATE INDEX IF NOT EXISTS profiles_auth_id_idx ON public.profiles(auth_id);

-- Comment for documentation
COMMENT ON COLUMN public.profiles.auth_id IS 'References the Supabase auth.users.id (redundant with id but explicit)';
COMMENT ON COLUMN public.profiles.is_complete IS 'Indicates whether user has completed profile setup';
