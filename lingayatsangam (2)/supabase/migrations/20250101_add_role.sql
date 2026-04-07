-- Migration: Add Role Column to Profiles
-- Date: 2025-01-01

ALTER TABLE public.profiles 
ADD COLUMN role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator', 'support'));

-- Create index for faster role lookups
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Update RLS to allow Admins to view all profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING ( status = 'active' OR role = 'admin' OR (auth.uid() IN (SELECT user_id FROM public.profiles WHERE role = 'admin')) );

-- Allow Admins to update any profile
CREATE POLICY "Admins can update any profile" 
ON public.profiles FOR UPDATE 
USING ( (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin' );

-- Seed an Admin User (Update existing demo user if exists, or just rely on manual update)
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@example.com';
