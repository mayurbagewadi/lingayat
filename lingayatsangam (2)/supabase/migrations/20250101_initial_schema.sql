-- Enable Extensions
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade unique,
  full_name text not null,
  dob date,
  created_for text,
  sub_caste text,
  gender text,
  education text,
  location text,
  mobile text unique,
  alt_mobile text,
  email text unique,
  
  -- Media (Supabase Storage File IDs/Paths)
  photo_1_file_id text,
  photo_2_file_id text,
  photo_3_file_id text,
  photo_4_file_id text,
  photo_5_file_id text,
  bio_pdf_url text,
  
  -- Status Flags
  status text default 'pending_approval' check (status in ('pending_approval', 'active', 'rejected', 'changes_requested', 'deleted')),
  is_admin_created boolean default false,
  rejection_reason text,
  admin_notes text,
  
  -- Subscription
  subscription_status text default 'free' check (subscription_status in ('free', 'premium', 'expired')),
  subscription_started_at timestamptz,
  subscription_expires_at timestamptz,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. PAYMENTS TABLE
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete set null,
  amount numeric not null,
  transaction_id text,
  payment_method text check (payment_method in ('razorpay', 'bank_transfer')),
  status text default 'pending' check (status in ('pending', 'completed', 'rejected', 'refunded')),
  proof_url text,
  admin_notes text,
  created_at timestamptz default now(),
  verified_at timestamptz
);

-- 3. ACTIVITY LOGS
create table if not exists public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  action_type text, -- 'view_profile', 'express_interest', 'login'
  target_profile_id uuid references public.profiles(id),
  metadata jsonb,
  created_at timestamptz default now()
);

-- 4. AUDIT LOGS (System & Admin Actions)
create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  event_type text, -- 'AUTO_DELETE', 'PROFILE_APPROVED', 'PAYMENT_VERIFIED'
  admin_id uuid references auth.users(id),
  old_profile_id uuid, -- For tracking auto-deleted profiles
  metadata jsonb,
  status text,
  created_at timestamptz default now()
);

-- 5. STORAGE BUCKETS
insert into storage.buckets (id, name, public) values ('photos', 'photos', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('pdfs', 'pdfs', false) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('payment_proofs', 'payment_proofs', false) on conflict do nothing;

-- 6. SECURITY POLICIES (RLS)
alter table public.profiles enable row level security;

-- Profiles are viewable by everyone if active, or by owner
create policy "Public profiles are viewable by everyone" 
on public.profiles for select 
using ( status = 'active' );

create policy "Users can view own profile" 
on public.profiles for select 
using ( auth.uid() = user_id );

create policy "Users can update own profile" 
on public.profiles for update 
using ( auth.uid() = user_id );

create policy "Users can insert own profile" 
on public.profiles for insert 
with check ( auth.uid() = user_id );
