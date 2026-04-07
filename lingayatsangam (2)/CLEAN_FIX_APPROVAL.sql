-- TARGETED FIX FOR APPROVALS
-- RUN THIS IN SUPABASE SQL EDITOR

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Ensure schema cache is refreshed (this is usually automatic but good to have)
COMMENT ON COLUMN public.profiles.updated_at IS 'Self-repair: added to fix approval flow timeout/missing column error';
