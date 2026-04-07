-- MIGRATION: Create Express Interests Table
-- Date: 2026-03-28
-- Description: Track mutual interest between profiles for subscription feature
-- Impact: Core feature for paid subscribers to express interest and track mutual matches

-- Create express_interests table
create table if not exists public.express_interests (
  id uuid primary key default gen_random_uuid(),

  -- Who expressed interest
  from_profile_id uuid not null references public.profiles(id) on delete cascade,

  -- Who received interest
  to_profile_id uuid not null references public.profiles(id) on delete cascade,

  -- Status of interest
  status text not null default 'expressed' check (status in ('expressed', 'mutual_match', 'rejected', 'withdrawn')),

  -- Timestamps
  created_at timestamptz not null default now(),
  mutual_matched_at timestamptz,

  constraint from_to_different check (from_profile_id != to_profile_id)
);

-- Create indexes for faster queries
create index if not exists idx_express_interests_from_profile
on public.express_interests(from_profile_id);

create index if not exists idx_express_interests_to_profile
on public.express_interests(to_profile_id);

create index if not exists idx_express_interests_status
on public.express_interests(status);

create index if not exists idx_express_interests_created_at
on public.express_interests(created_at desc);

-- Unique constraint: A profile can only express interest once per target profile
-- (but interest can be withdrawn and expressed again)
create unique index if not exists idx_express_interests_unique_active
on public.express_interests(from_profile_id, to_profile_id)
where status in ('expressed', 'mutual_match');

-- Function: Auto-detect mutual match
create or replace function public.check_mutual_interest()
returns trigger
language plpgsql
as $$
declare
  reverse_interest record;
begin
  -- Check if the target profile has already expressed interest back
  select * into reverse_interest
  from public.express_interests
  where from_profile_id = new.to_profile_id
    and to_profile_id = new.from_profile_id
    and status = 'expressed';

  -- If mutual interest found, update both records
  if reverse_interest.id is not null then
    -- Update the existing reverse interest record
    update public.express_interests
    set status = 'mutual_match',
        mutual_matched_at = now()
    where id = reverse_interest.id;

    -- Update the new record too
    new.status := 'mutual_match';
    new.mutual_matched_at := now();
  end if;

  return new;
end;
$$;

-- Trigger: Check for mutual match before insert
drop trigger if exists on_express_interest_insert on public.express_interests;
create trigger on_express_interest_insert
before insert on public.express_interests
for each row execute procedure public.check_mutual_interest();

-- RLS Policies
alter table public.express_interests enable row level security;

-- Policy: Users can view interests directed at them or from them
create policy "Users can view their own interests"
on public.express_interests
for select
using (
  from_profile_id = (select id from public.profiles where user_id = auth.uid())
  or
  to_profile_id = (select id from public.profiles where user_id = auth.uid())
);

-- Policy: Users can create interests from their own profile
create policy "Users can create interests from their profile"
on public.express_interests
for insert
with check (
  from_profile_id = (select id from public.profiles where user_id = auth.uid())
);

-- Policy: Users can only withdraw their own interests
create policy "Users can update their own interests"
on public.express_interests
for update
using (
  from_profile_id = (select id from public.profiles where user_id = auth.uid())
);

-- Admins can view all interests
create policy "Admins can view all interests"
on public.express_interests
for select
using (
  (select role from public.profiles where user_id = auth.uid()) in ('admin', 'moderator', 'support')
);

-- Add comments for documentation
comment on table public.express_interests is
'Tracks mutual interest between profiles. Subscription feature for paid users.';

comment on column public.express_interests.from_profile_id is
'Profile ID of the user expressing interest';

comment on column public.express_interests.to_profile_id is
'Profile ID of the user receiving interest';

comment on column public.express_interests.status is
'expressed: one-way interest, mutual_match: both expressed, rejected: explicitly rejected, withdrawn: user withdrew interest';

comment on column public.express_interests.mutual_matched_at is
'When mutual interest was detected (when second user expressed interest)';

-- Verification query (run after migration):
-- SELECT COUNT(*) as total_interests FROM public.express_interests;
-- SELECT status, COUNT(*) as count FROM public.express_interests GROUP BY status;
