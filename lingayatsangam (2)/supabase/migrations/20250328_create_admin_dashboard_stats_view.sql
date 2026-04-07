-- Create admin_dashboard_stats view
-- Provides real-time aggregate stats for the admin dashboard
-- This is a VIEW (not a table) - data is computed live from other tables

create or replace view public.admin_dashboard_stats as
select
  -- Total registered users (profiles)
  (select count(*) from public.profiles)::bigint as total_users,

  -- Active premium subscribers
  (
    select count(*) from public.profiles
    where subscription_status = 'premium'
    and (subscription_expires_at is null or subscription_expires_at > now())
  )::bigint as active_subs,

  -- Profiles pending admin approval
  (
    select count(*) from public.profiles
    where status = 'pending_approval'
  )::bigint as pending_approvals,

  -- Revenue from completed payments this month
  (
    select coalesce(sum(amount), 0) from public.payments
    where status = 'completed'
    and date_trunc('month', created_at) = date_trunc('month', now())
  )::numeric as monthly_revenue;
