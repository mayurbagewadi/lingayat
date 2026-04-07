-- MIGRATION 1: Add Role Column to Profiles
-- Copy and run this in Supabase SQL Editor first

DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('user', 'admin', 'moderator', 'support'));

CREATE INDEX IF NOT EXISTS idx_profiles_role
ON public.profiles(role);

COMMENT ON COLUMN public.profiles.role IS
'User role: user (regular), admin (super admin), moderator (approvals), support (support staff)';

-- Verify
SELECT COUNT(*) as role_column_exists FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'role';
