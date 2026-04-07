-- ============================================================================
-- LINGAYAT MALI - CRITICAL DATABASE FIXES
-- Deploy Date: 2026-03-28
-- All 5 migrations combined for easy deployment
-- ============================================================================

-- Instructions:
-- 1. Go to: https://app.supabase.com/project/qomnebvjrdlqvlwrpmod/sql/new
-- 2. Copy entire content of this file
-- 3. Paste into SQL Editor
-- 4. Click "RUN" button
-- 5. Wait for "Success"

-- ============================================================================
-- MIGRATION 1: Fix Auto-Delete Trigger (Include alt_mobile)
-- ============================================================================

drop trigger if exists on_profile_created_check_conflict on public.profiles;
drop function if exists public.handle_new_profile_conflict();

create or replace function public.handle_new_profile_conflict()
returns trigger
language plpgsql
security definer
as $$
declare
  conflict_record record;
  match_reason text;
begin
  select * into conflict_record
  from public.profiles
  where is_admin_created = true
    and (
      (email is not null and email = new.email)
      or
      (mobile is not null and mobile = new.mobile)
      or
      (alt_mobile is not null and alt_mobile = new.mobile)
    )
  limit 1;

  if conflict_record.id is not null then
    if email is not null and conflict_record.email = new.email then
      match_reason := 'Email match';
    elsif mobile is not null and conflict_record.mobile = new.mobile then
      match_reason := 'Primary phone match';
    elsif alt_mobile is not null and conflict_record.alt_mobile = new.mobile then
      match_reason := 'Alternative phone match (NEW FIX)';
    else
      match_reason := 'Unknown match type';
    end if;

    insert into public.audit_logs (event_type, old_profile_id, metadata, status)
    values (
      'AUTO_DELETE_TRIGGERED',
      conflict_record.id,
      jsonb_build_object(
        'reason', 'User Self-Registered',
        'match_type', match_reason,
        'new_email', new.email,
        'new_mobile', new.mobile,
        'deleted_profile_id', conflict_record.id
      ),
      'success'
    );

    delete from public.profiles where id = conflict_record.id;
  end if;

  return new;
end;
$$;

create trigger on_profile_created_check_conflict
before insert on public.profiles
for each row execute procedure public.handle_new_profile_conflict();

-- ============================================================================
-- MIGRATION 2: Add PDF Approval Status
-- ============================================================================

alter table public.profiles
add column if not exists pdf_approval_status text default null;

alter table public.profiles
add constraint pdf_approval_status_check
check (pdf_approval_status is null or pdf_approval_status in ('pending', 'approved', 'rejected'));

alter table public.profiles
add column if not exists pdf_rejection_reason text default null;

alter table public.profiles
add column if not exists pdf_approved_by uuid references auth.users(id) on delete set null;

alter table public.profiles
add column if not exists pdf_approved_at timestamptz default null;

create index if not exists idx_profiles_pdf_approval_status
on public.profiles(pdf_approval_status)
where pdf_approval_status is not null;

comment on column public.profiles.pdf_approval_status is
'PDF bio approval status: null (not uploaded), pending (awaiting admin review), approved (visible to users), rejected (needs reupload)';

create or replace function public.update_pdf_approval_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_pdf_approval_change on public.profiles;
create trigger on_pdf_approval_change
before update on public.profiles
for each row
when (old.pdf_approval_status is distinct from new.pdf_approval_status)
execute procedure public.update_pdf_approval_timestamp();

update public.profiles
set pdf_approval_status = 'approved'
where bio_pdf_url is not null and pdf_approval_status is null;

-- ============================================================================
-- MIGRATION 3: Create Express Interests Table
-- ============================================================================

create table if not exists public.express_interests (
  id uuid primary key default gen_random_uuid(),
  from_profile_id uuid not null references public.profiles(id) on delete cascade,
  to_profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'expressed' check (status in ('expressed', 'mutual_match', 'rejected', 'withdrawn')),
  created_at timestamptz not null default now(),
  mutual_matched_at timestamptz,
  constraint from_to_different check (from_profile_id != to_profile_id)
);

create index if not exists idx_express_interests_from_profile
on public.express_interests(from_profile_id);

create index if not exists idx_express_interests_to_profile
on public.express_interests(to_profile_id);

create index if not exists idx_express_interests_status
on public.express_interests(status);

create index if not exists idx_express_interests_created_at
on public.express_interests(created_at desc);

create unique index if not exists idx_express_interests_unique_active
on public.express_interests(from_profile_id, to_profile_id)
where status in ('expressed', 'mutual_match');

create or replace function public.check_mutual_interest()
returns trigger
language plpgsql
as $$
declare
  reverse_interest record;
begin
  select * into reverse_interest
  from public.express_interests
  where from_profile_id = new.to_profile_id
    and to_profile_id = new.from_profile_id
    and status = 'expressed';

  if reverse_interest.id is not null then
    update public.express_interests
    set status = 'mutual_match',
        mutual_matched_at = now()
    where id = reverse_interest.id;

    new.status := 'mutual_match';
    new.mutual_matched_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists on_express_interest_insert on public.express_interests;
create trigger on_express_interest_insert
before insert on public.express_interests
for each row execute procedure public.check_mutual_interest();

alter table public.express_interests enable row level security;

create policy "Users can view their own interests"
on public.express_interests
for select
using (
  from_profile_id = (select id from public.profiles where user_id = auth.uid())
  or
  to_profile_id = (select id from public.profiles where user_id = auth.uid())
);

create policy "Users can create interests from their profile"
on public.express_interests
for insert
with check (
  from_profile_id = (select id from public.profiles where user_id = auth.uid())
);

create policy "Users can update their own interests"
on public.express_interests
for update
using (
  from_profile_id = (select id from public.profiles where user_id = auth.uid())
);

comment on table public.express_interests is
'Tracks mutual interest between profiles. Subscription feature for paid users.';

-- ============================================================================
-- MIGRATION 4: Create Daily Digest Tracking Table
-- ============================================================================

create table if not exists public.daily_digest_sent (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  email_sent_to text not null,
  digest_date date not null,
  digest_period_start timestamptz not null,
  digest_period_end timestamptz not null,
  digest_content jsonb not null default '{}'::jsonb,
  sent_at timestamptz not null default now(),
  email_opened_at timestamptz,
  delivery_status text not null default 'sent' check (delivery_status in ('queued', 'sent', 'bounced', 'failed', 'opened')),
  delivery_error_message text,
  email_service_id text,
  email_service_provider text,
  created_at timestamptz not null default now()
);

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

create unique index if not exists idx_daily_digest_unique_per_day
on public.daily_digest_sent(profile_id, digest_date);

alter table public.daily_digest_sent enable row level security;

create policy "Users can view their own digests"
on public.daily_digest_sent
for select
using (
  profile_id = (select id from public.profiles where user_id = auth.uid())
);

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

comment on table public.daily_digest_sent is
'Tracks daily digest emails sent to users. Prevents duplicate sends and tracks delivery.';

-- ============================================================================
-- MIGRATION 5: Create Settings Table
-- ============================================================================

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text,
  value_type text not null default 'string' check (value_type in ('string', 'number', 'boolean', 'json', 'email', 'time')),
  description text,
  category text,
  is_sensitive boolean default false,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_settings_key
on public.settings(key);

create index if not exists idx_settings_category
on public.settings(category);

alter table public.settings enable row level security;

create policy "Admins can manage settings"
on public.settings
for all
using (
  (select role from public.profiles where user_id = auth.uid()) = 'admin'
);

create or replace function public.update_settings_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$;

drop trigger if exists on_settings_update on public.settings;
create trigger on_settings_update
before update on public.settings
for each row execute procedure public.update_settings_timestamp();

insert into public.settings (key, value, value_type, category, description, is_sensitive)
values
  ('razorpay_key_id', '', 'string', 'payment', 'Razorpay API Key ID', true),
  ('razorpay_secret_key', '', 'string', 'payment', 'Razorpay Secret Key', true),
  ('payment_currency', 'INR', 'string', 'payment', 'Currency for payments'),
  ('subscription_yearly_amount', '0', 'number', 'payment', 'Yearly subscription amount in paisa (INR)'),
  ('daily_digest_enabled', 'true', 'boolean', 'notification', 'Enable daily digest emails'),
  ('daily_digest_time', '20:00', 'time', 'notification', 'Time to send daily digest (HH:MM in UTC)'),
  ('notification_channel', 'email', 'string', 'notification', 'Primary notification channel: email, sms, whatsapp'),
  ('email_service_provider', 'sendgrid', 'string', 'notification', 'Email service: sendgrid, aws_ses'),
  ('sendgrid_api_key', '', 'string', 'notification', 'SendGrid API Key', true),
  ('sms_service_provider', '', 'string', 'notification', 'SMS provider: twilio'),
  ('sms_api_key', '', 'string', 'notification', 'SMS service API key', true),
  ('max_daily_contacts', '10', 'number', 'platform', 'Max contacts per paid subscriber per day'),
  ('max_monthly_contacts', '100', 'number', 'platform', 'Max contacts per paid subscriber per month'),
  ('photos_per_profile', '5', 'number', 'platform', 'Max photos allowed per profile'),
  ('pdf_max_size_mb', '10', 'number', 'platform', 'Max PDF bio size in MB'),
  ('google_drive_folder_id', '', 'string', 'platform', 'Google Drive folder ID for matrimonial photos'),
  ('google_drive_enabled', 'false', 'boolean', 'storage', 'Use Google Drive for photo storage'),
  ('google_service_account_email', '', 'string', 'storage', 'Google Service Account Email', true),
  ('google_service_account_key', '', 'json', 'storage', 'Google Service Account JSON Key', true),
  ('support_email', 'support@example.com', 'email', 'support', 'Support email address'),
  ('support_phone', '', 'string', 'support', 'Support phone number'),
  ('help_center_url', '', 'string', 'support', 'Help center URL'),
  ('feature_express_interest', 'true', 'boolean', 'features', 'Enable express interest feature'),
  ('feature_pdf_bio', 'true', 'boolean', 'features', 'Enable PDF bio uploads'),
  ('feature_manual_payments', 'true', 'boolean', 'features', 'Enable manual payment verification'),
  ('maintenance_mode', 'false', 'boolean', 'platform', 'Enable maintenance mode (blocks users)'),
  ('maintenance_message', '', 'string', 'platform', 'Message shown during maintenance')
on conflict (key) do nothing;

create or replace function public.get_setting(p_key text, p_default text default null)
returns text as $$
declare
  v_value text;
  v_type text;
begin
  select value, value_type into v_value, v_type
  from public.settings
  where key = p_key;

  if v_value is null then
    return p_default;
  end if;

  return v_value;
end;
$$ language plpgsql;

create or replace function public.get_setting_bool(p_key text, p_default boolean default false)
returns boolean as $$
declare
  v_value text;
begin
  select value into v_value
  from public.settings
  where key = p_key;

  if v_value is null then
    return p_default;
  end if;

  return v_value::boolean;
end;
$$ language plpgsql;

create or replace function public.get_setting_number(p_key text, p_default numeric default 0)
returns numeric as $$
declare
  v_value text;
begin
  select value into v_value
  from public.settings
  where key = p_key;

  if v_value is null then
    return p_default;
  end if;

  return v_value::numeric;
end;
$$ language plpgsql;

create or replace function public.update_setting(p_key text, p_value text)
returns boolean as $$
begin
  update public.settings
  set value = p_value,
      updated_at = now(),
      updated_by = auth.uid()
  where key = p_key;

  return found;
end;
$$ language plpgsql;

-- ============================================================================
-- VERIFICATION QUERIES (Run these after to confirm)
-- ============================================================================

SELECT 'Migration 1: Auto-Delete Trigger' as step;
SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name = 'on_profile_created_check_conflict';

SELECT 'Migration 2: PDF Approval Status' as step;
SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'pdf_approval_status';

SELECT 'Migration 3: Express Interests Table' as step;
SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'express_interests';

SELECT 'Migration 4: Daily Digest Table' as step;
SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'daily_digest_sent';

SELECT 'Migration 5: Settings Table' as step;
SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'settings';
SELECT COUNT(*) as total_settings FROM public.settings;

-- ============================================================================
-- DEPLOYMENT COMPLETE
-- All 5 critical database fixes have been applied
-- ============================================================================
