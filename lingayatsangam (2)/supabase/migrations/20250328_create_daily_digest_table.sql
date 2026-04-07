-- MIGRATION: Create Daily Digest Tracking Table
-- Date: 2026-03-28
-- Description: Track which digests were sent to which users to prevent duplicates
-- Impact: Reliable daily digest delivery without duplicates

-- Create daily_digest_sent table
create table if not exists public.daily_digest_sent (
  id uuid primary key default gen_random_uuid(),

  -- User who received the digest
  profile_id uuid not null references public.profiles(id) on delete cascade,

  -- Email address it was sent to
  email_sent_to text not null,

  -- Digest content summary
  digest_date date not null,
  digest_period_start timestamptz not null,
  digest_period_end timestamptz not null,

  -- Digest content (JSON for flexibility)
  digest_content jsonb not null default '{}'::jsonb,

  -- Tracking info
  sent_at timestamptz not null default now(),
  email_opened_at timestamptz,
  delivery_status text not null default 'sent' check (delivery_status in ('queued', 'sent', 'bounced', 'failed', 'opened')),
  delivery_error_message text,

  -- Email service tracking
  email_service_id text,  -- Email service provider's message ID
  email_service_provider text,  -- sendgrid, aws_ses, etc.

  created_at timestamptz not null default now()
);

-- Create indexes for efficient queries
create index if not exists idx_daily_digest_profile
on public.daily_digest_sent(profile_id);

create index if not exists idx_daily_digest_date
on public.daily_digest_sent(digest_date desc);

create index if not exists idx_daily_digest_email
on public.daily_digest_sent(email_sent_to);

create index if not exists idx_daily_digest_sent_at
on public.daily_digest_sent(sent_at desc);

create index if not exists idx_daily_digest_delivery_status
on public.daily_digest_sent(delivery_status)
where delivery_status in ('queued', 'failed');

-- Unique constraint: Only one digest per profile per day
create unique index if not exists idx_daily_digest_unique_per_day
on public.daily_digest_sent(profile_id, digest_date);

-- RLS Policies
alter table public.daily_digest_sent enable row level security;

-- Policy: Users can view their own digests
create policy "Users can view their own digests"
on public.daily_digest_sent
for select
using (
  profile_id = (select id from public.profiles where user_id = auth.uid())
);

-- Policy: Admins can view all digests
create policy "Admins can view all digests"
on public.daily_digest_sent
for select
using (
  (select role from public.profiles where user_id = auth.uid()) in ('admin', 'moderator', 'support')
);

-- Trigger: Auto-mark as opened when user views
create or replace function public.mark_digest_opened()
returns trigger
language plpgsql
as $$
begin
  if new.email_opened_at is null and new.delivery_status = 'sent' then
    new.email_opened_at := now();
    new.delivery_status := 'opened';
  end if;
  return new;
end;
$$;

drop trigger if exists on_digest_view on public.daily_digest_sent;
create trigger on_digest_view
before update on public.daily_digest_sent
for each row execute procedure public.mark_digest_opened();

-- Helper function: Get digest stats for admin
create or replace function public.get_digest_stats(p_date date default current_date)
returns table (
  total_sent bigint,
  total_opened bigint,
  total_failed bigint,
  open_rate numeric,
  failure_rate numeric
) as $$
declare
  v_total bigint;
  v_opened bigint;
  v_failed bigint;
begin
  select count(*) into v_total from public.daily_digest_sent where digest_date = p_date;
  select count(*) into v_opened from public.daily_digest_sent where digest_date = p_date and delivery_status = 'opened';
  select count(*) into v_failed from public.daily_digest_sent where digest_date = p_date and delivery_status in ('failed', 'bounced');

  return query select
    v_total,
    v_opened,
    v_failed,
    case when v_total > 0 then (v_opened::numeric / v_total::numeric * 100)::numeric(5,2) else 0 end,
    case when v_total > 0 then (v_failed::numeric / v_total::numeric * 100)::numeric(5,2) else 0 end;
end;
$$ language plpgsql;

-- Add comments for documentation
comment on table public.daily_digest_sent is
'Tracks daily digest emails sent to users. Prevents duplicate sends and tracks delivery.';

comment on column public.daily_digest_sent.digest_date is
'Date of the digest (local date)';

comment on column public.daily_digest_sent.digest_period_start is
'Start of period covered by digest (usually previous midnight)';

comment on column public.daily_digest_sent.digest_period_end is
'End of period covered by digest (usually current midnight)';

comment on column public.daily_digest_sent.digest_content is
'JSON object with digest content: {profile_views: [...], interests_received: [...], etc}';

comment on column public.daily_digest_sent.delivery_status is
'Email delivery status: queued (pending), sent (delivered), bounced (bad email), failed (service error), opened (user opened)';

-- Verification query (run after migration):
-- SELECT COUNT(*) as total_digests FROM public.daily_digest_sent;
-- SELECT digest_date, COUNT(*) as count, delivery_status FROM daily_digest_sent GROUP BY digest_date, delivery_status;
-- SELECT * FROM get_digest_stats(current_date);
