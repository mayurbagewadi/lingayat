-- Create contact_usage table
-- Tracks how many contacts each user has used per reset period
-- Admin sets the contact limit in the settings table

create table if not exists public.contact_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  usage_count integer default 0,
  reset_date date default current_date
);

-- RLS
alter table public.contact_usage enable row level security;

-- Users can view their own contact usage
create policy "Users can view own contact usage"
on public.contact_usage for select
using ( auth.uid() = user_id );

-- System can insert contact usage records
create policy "Users can insert own contact usage"
on public.contact_usage for insert
with check ( auth.uid() = user_id );

-- System can update contact usage records
create policy "Users can update own contact usage"
on public.contact_usage for update
using ( auth.uid() = user_id );

-- Admins can manage all contact usage
create policy "Admins can manage all contact usage"
on public.contact_usage for all
using (
  exists (
    select 1 from public.profiles
    where user_id = auth.uid()
    and role in ('admin', 'moderator', 'support')
  )
);

-- Indexes
create index if not exists idx_contact_usage_user_id on public.contact_usage(user_id);
create index if not exists idx_contact_usage_reset_date on public.contact_usage(reset_date);

-- One usage record per user per reset date
create unique index if not exists idx_contact_usage_user_date
on public.contact_usage(user_id, reset_date);
