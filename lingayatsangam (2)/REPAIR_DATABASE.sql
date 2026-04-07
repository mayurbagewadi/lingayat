-- MASTER DATABASE REPAIR SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. FIX PROFILES TABLE
DO $$ 
BEGIN 
    -- Add role if missing
    IF NOT EXISTS (SELECT 1 FROM pf_get_columns('profiles') WHERE column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator', 'support'));
    END IF;

    -- Add updated_at if missing
    IF NOT EXISTS (SELECT 1 FROM pf_get_columns('profiles') WHERE column_name = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
END $$;

-- Helper function to check columns if it doesn't exist
CREATE OR REPLACE FUNCTION pf_get_columns(t_name text) 
RETURNS TABLE(column_name text) AS $$
BEGIN
    RETURN QUERY SELECT c.column_name::text FROM information_schema.columns c WHERE c.table_name = t_name;
END;
$$ LANGUAGE plpgsql;

-- Re-run the fix logic with the helper
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pf_get_columns('profiles') WHERE column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator', 'support'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pf_get_columns('profiles') WHERE column_name = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
END $$;

-- 2. CREATE MISSING TABLES
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    amount numeric NOT NULL,
    transaction_id text,
    payment_method text CHECK (payment_method IN ('razorpay', 'bank_transfer')),
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected', 'refunded')),
    proof_url text,
    admin_notes text,
    created_at timestamptz DEFAULT now(),
    verified_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.announcements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subject text NOT NULL,
    body text NOT NULL,
    recipient_group text CHECK (recipient_group IN ('all', 'paid', 'free', 'specific')),
    attachment_url text,
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent')),
    created_at timestamptz DEFAULT now(),
    sent_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type text,
    admin_id uuid REFERENCES auth.users(id),
    old_profile_id uuid,
    metadata jsonb,
    status text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id),
    action_type text,
    target_profile_id uuid REFERENCES public.profiles(id),
    metadata jsonb,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.interests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    message text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_settings (
    key text PRIMARY KEY,
    value jsonb,
    updated_at timestamptz DEFAULT now()
);

-- 3. UPDATED RLS POLICIES FOR ADMIN
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING ( status = 'active' OR role = 'admin' OR (auth.uid() IN (SELECT user_id FROM public.profiles WHERE role = 'admin')) );

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" 
ON public.profiles FOR UPDATE 
USING ( (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin' );

-- 4. SEED APP SETTINGS
INSERT INTO public.app_settings (key, value) VALUES ('yearly_price', '2999') ON CONFLICT (key) DO NOTHING;

-- 5. ENSURE BUCKETS EXIST
-- (Bucket creation usually requires calling a Supabase RPC or using the Dashboard, 
-- but we'll try to insert into the storage meta table just in case it works for the user)
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('pdfs', 'pdfs', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('payment_proofs', 'payment_proofs', false) ON CONFLICT DO NOTHING;
