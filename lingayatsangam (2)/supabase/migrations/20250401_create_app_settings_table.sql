-- MIGRATION: Create app_settings table
-- Date: 2026-04-01
-- Description: Simple key-value settings table used by admin panel
-- Required for: Subscription pricing, auto-assign, payment gateway config

-- Create the table
create table if not exists public.app_settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

-- RLS
alter table public.app_settings enable row level security;

-- Allow admins full access
create policy "Admins can manage app_settings"
on public.app_settings
for all
using (
  exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin')
);

-- Allow all authenticated users to READ settings (needed for payment page to read price)
create policy "Authenticated users can read app_settings"
on public.app_settings
for select
using (auth.role() = 'authenticated');

-- Insert default settings
insert into public.app_settings (key, value) values
  ('yearly_price', '2999'),
  ('rzp_key_id', ''),
  ('rzp_key_secret', ''),
  ('rzp_webhook_secret', ''),
  ('merchant_name', 'Lingayat Sangam Org'),
  ('manual_upi_id', ''),
  ('manual_bank_acc', ''),
  ('manual_bank_ifsc', ''),
  ('auto_assign_enabled', 'false'),
  ('auto_assign_plan', 'free'),
  ('auto_assign_duration_months', '12')
on conflict (key) do nothing;
