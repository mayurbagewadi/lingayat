-- Create profile_views table
-- Tracks who viewed which profile and when (for "Who viewed me" feature)

create table if not exists public.profile_views (
  id uuid primary key default gen_random_uuid(),
  viewer_id uuid references auth.users(id) on delete cascade,
  viewed_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);

-- RLS
alter table public.profile_views enable row level security;

-- Profile owner can see who viewed their profile
create policy "Profile owner can see their viewers"
on public.profile_views for select
using (
  viewed_id in (
    select id from public.profiles where user_id = auth.uid()
  )
);

-- Viewer can see their own viewing history
create policy "Viewer can see own view history"
on public.profile_views for select
using ( auth.uid() = viewer_id );

-- Any logged-in user can record a profile view
create policy "Logged-in users can record views"
on public.profile_views for insert
with check ( auth.uid() = viewer_id );

-- Admins can manage all profile views
create policy "Admins can manage all profile views"
on public.profile_views for all
using (
  exists (
    select 1 from public.profiles
    where user_id = auth.uid()
    and role in ('admin', 'moderator', 'support')
  )
);

-- Indexes
create index if not exists idx_profile_views_viewer_id on public.profile_views(viewer_id);
create index if not exists idx_profile_views_viewed_id on public.profile_views(viewed_id);
create index if not exists idx_profile_views_created_at on public.profile_views(created_at desc);
