-- Create subscriptions table
-- Tracks the current active subscription for each user (one row per user)

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_type text default 'free' check (plan_type in ('free', 'premium', 'expired')),
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- RLS
alter table public.subscriptions enable row level security;

-- Users can view their own subscription
create policy "Users can view own subscription"
on public.subscriptions for select
using ( auth.uid() = user_id );

-- Users can insert their own subscription
create policy "Users can insert own subscription"
on public.subscriptions for insert
with check ( auth.uid() = user_id );

-- Users can update their own subscription
create policy "Users can update own subscription"
on public.subscriptions for update
using ( auth.uid() = user_id );

-- Admins can manage all subscriptions
create policy "Admins can manage all subscriptions"
on public.subscriptions for all
using (
  exists (
    select 1 from public.profiles
    where user_id = auth.uid()
    and role in ('admin', 'moderator', 'support')
  )
);

-- Index for fast lookup
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_expires_at on public.subscriptions(expires_at);
