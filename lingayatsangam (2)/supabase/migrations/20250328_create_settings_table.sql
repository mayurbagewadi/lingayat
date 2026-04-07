-- MIGRATION: Create Settings Table
-- Date: 2026-03-28
-- Description: Store admin-configurable settings
-- Impact: Platform configuration without code changes

-- Create settings table
create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),

  -- Setting key (unique identifier)
  key text not null unique,

  -- Setting value (can be JSON for complex values)
  value text,
  value_type text not null default 'string' check (value_type in ('string', 'number', 'boolean', 'json', 'email', 'time')),

  -- Metadata
  description text,
  category text,  -- For grouping: payment, notification, platform, etc.
  is_sensitive boolean default false,  -- Mask in UI if true (passwords, keys)

  -- Audit trail
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),

  created_at timestamptz not null default now()
);

-- Create indexes
create index if not exists idx_settings_key
on public.settings(key);

create index if not exists idx_settings_category
on public.settings(category);

-- RLS Policies
alter table public.settings enable row level security;

-- Policy: Only admins can read/write settings
create policy "Admins can manage settings"
on public.settings
for all
using (
  (select role from public.profiles where user_id = auth.uid()) = 'admin'
);

-- Add trigger to auto-update updated_at
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

-- Insert default settings
insert into public.settings (key, value, value_type, category, description, is_sensitive)
values
  -- Payment Settings
  ('razorpay_key_id', '', 'string', 'payment', 'Razorpay API Key ID', true),
  ('razorpay_secret_key', '', 'string', 'payment', 'Razorpay Secret Key', true),
  ('payment_currency', 'INR', 'string', 'payment', 'Currency for payments', false),
  ('subscription_yearly_amount', '0', 'number', 'payment', 'Yearly subscription amount in paisa (INR)', false),

  -- Notification Settings
  ('daily_digest_enabled', 'true', 'boolean', 'notification', 'Enable daily digest emails', false),
  ('daily_digest_time', '20:00', 'time', 'notification', 'Time to send daily digest (HH:MM in UTC)', false),
  ('notification_channel', 'email', 'string', 'notification', 'Primary notification channel: email, sms, whatsapp', false),
  ('email_service_provider', 'sendgrid', 'string', 'notification', 'Email service: sendgrid, aws_ses', false),
  ('sendgrid_api_key', '', 'string', 'notification', 'SendGrid API Key', true),
  ('sms_service_provider', '', 'string', 'notification', 'SMS provider: twilio', false),
  ('sms_api_key', '', 'string', 'notification', 'SMS service API key', true),

  -- Platform Settings
  ('max_daily_contacts', '10', 'number', 'platform', 'Max contacts per paid subscriber per day', false),
  ('max_monthly_contacts', '100', 'number', 'platform', 'Max contacts per paid subscriber per month', false),
  ('photos_per_profile', '5', 'number', 'platform', 'Max photos allowed per profile', false),
  ('pdf_max_size_mb', '10', 'number', 'platform', 'Max PDF bio size in MB', false),
  ('google_drive_folder_id', '', 'string', 'platform', 'Google Drive folder ID for matrimonial photos', false),

  -- Google Drive Settings
  ('google_drive_enabled', 'false', 'boolean', 'storage', 'Use Google Drive for photo storage', false),
  ('google_service_account_email', '', 'string', 'storage', 'Google Service Account Email', true),
  ('google_service_account_key', '', 'json', 'storage', 'Google Service Account JSON Key', true),

  -- Support Settings
  ('support_email', 'support@example.com', 'email', 'support', 'Support email address', false),
  ('support_phone', '', 'string', 'support', 'Support phone number', false),
  ('help_center_url', '', 'string', 'support', 'Help center URL', false),

  -- Feature Flags
  ('feature_express_interest', 'true', 'boolean', 'features', 'Enable express interest feature', false),
  ('feature_pdf_bio', 'true', 'boolean', 'features', 'Enable PDF bio uploads', false),
  ('feature_manual_payments', 'true', 'boolean', 'features', 'Enable manual payment verification', false),

  -- Maintenance
  ('maintenance_mode', 'false', 'boolean', 'platform', 'Enable maintenance mode (blocks users)', false),
  ('maintenance_message', '', 'string', 'platform', 'Message shown during maintenance', false)
on conflict (key) do nothing;

-- Helper function: Get setting value with type casting
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

-- Helper function: Get setting as boolean
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

-- Helper function: Get setting as number
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

-- Helper function: Update setting
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

-- Add comments for documentation
comment on table public.settings is
'Stores configurable settings for the matrimonial platform. Updated by super admins only.';

comment on column public.settings.key is
'Unique setting identifier (snake_case, e.g., "daily_digest_time")';

comment on column public.settings.value_type is
'Data type: string, number, boolean, json, email, time';

comment on column public.settings.is_sensitive is
'If true, value is masked in admin UI (passwords, API keys)';

comment on function public.get_setting(text, text) is
'Get setting value as text, with optional default if not found';

comment on function public.get_setting_bool(text, boolean) is
'Get setting value as boolean, with optional default';

comment on function public.get_setting_number(text, numeric) is
'Get setting value as numeric, with optional default';

comment on function public.update_setting(text, text) is
'Update a setting value (triggers timestamp and updated_by updates)';

-- Verification query (run after migration):
-- SELECT key, value, category FROM public.settings ORDER BY category, key;
-- SELECT * FROM get_setting('daily_digest_time', '20:00');
-- SELECT * FROM get_setting_bool('daily_digest_enabled', true);
-- SELECT * FROM get_setting_number('max_daily_contacts', 10);
