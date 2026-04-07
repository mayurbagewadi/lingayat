-- Create subscription_history table
-- Keeps full history of all subscription payments and activations per profile

create table if not exists public.subscription_history (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  plan_name text default 'Yearly Royal',
  amount numeric,
  started_at timestamptz default now(),
  expires_at timestamptz,
  payment_id text,
  created_at timestamptz default now()
);

-- RLS
alter table public.subscription_history enable row level security;

-- Users can view their own subscription history
create policy "Users can view own subscription history"
on public.subscription_history for select
using (
  profile_id in (
    select id from public.profiles where user_id = auth.uid()
  )
);

-- Admins can view and manage all subscription history
create policy "Admins can manage all subscription history"
on public.subscription_history for all
using (
  exists (
    select 1 from public.profiles
    where user_id = auth.uid()
    and role in ('admin', 'moderator', 'support')
  )
);

-- Indexes
create index if not exists idx_subscription_history_profile_id on public.subscription_history(profile_id);
create index if not exists idx_subscription_history_created_at on public.subscription_history(created_at desc);
