-- Create interests table
-- Tracks express interest requests sent between users (paid subscribers only)

create table if not exists public.interests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references auth.users(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamptz default now()
);

-- RLS
alter table public.interests enable row level security;

-- Sender can view interests they sent
create policy "Sender can view sent interests"
on public.interests for select
using ( auth.uid() = sender_id );

-- Receiver can view interests they received (via their profile)
create policy "Receiver can view received interests"
on public.interests for select
using (
  receiver_id in (
    select id from public.profiles where user_id = auth.uid()
  )
);

-- Logged-in users can send interests
create policy "Users can send interests"
on public.interests for insert
with check ( auth.uid() = sender_id );

-- Sender can withdraw / receiver can accept or reject
create policy "Sender or receiver can update interest"
on public.interests for update
using (
  auth.uid() = sender_id
  or receiver_id in (
    select id from public.profiles where user_id = auth.uid()
  )
);

-- Admins can manage all interests
create policy "Admins can manage all interests"
on public.interests for all
using (
  exists (
    select 1 from public.profiles
    where user_id = auth.uid()
    and role in ('admin', 'moderator', 'support')
  )
);

-- Indexes
create index if not exists idx_interests_sender_id on public.interests(sender_id);
create index if not exists idx_interests_receiver_id on public.interests(receiver_id);
create index if not exists idx_interests_status on public.interests(status);

-- Prevent duplicate interest requests
create unique index if not exists idx_interests_unique_pair
on public.interests(sender_id, receiver_id);
