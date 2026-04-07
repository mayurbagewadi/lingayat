-- ============================================================================
-- MIGRATION 0: Add Role Column to Profiles (Must run FIRST)
-- ============================================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user'
CHECK (role IN ('user', 'admin', 'moderator', 'support'));

CREATE INDEX IF NOT EXISTS idx_profiles_role
ON public.profiles(role);

COMMENT ON COLUMN public.profiles.role IS
'User role: user (regular), admin (super admin), moderator (approvals), support (support staff)';
