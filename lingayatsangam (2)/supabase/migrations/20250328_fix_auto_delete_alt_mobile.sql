-- MIGRATION: Fix Auto-Delete Trigger to Include alt_mobile
-- Date: 2026-03-28
-- Description: Update handle_new_profile_conflict() to check alternative phone
-- Impact: Admin-created profiles now properly deleted when user self-registers with alt_mobile

-- Drop existing trigger and function
drop trigger if exists on_profile_created_check_conflict on public.profiles;
drop function if exists public.handle_new_profile_conflict();

-- Recreate function with alt_mobile check
create or replace function public.handle_new_profile_conflict()
returns trigger
language plpgsql
security definer
as $$
declare
  conflict_record record;
  match_reason text;
begin
  -- Search for existing 'admin_created' profile with matching:
  -- 1. Email, OR
  -- 2. Primary mobile, OR
  -- 3. Alternative mobile (NEW)
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

  -- If conflict found, log and delete
  if conflict_record.id is not null then
    -- Determine what matched (for logging)
    if email is not null and conflict_record.email = new.email then
      match_reason := 'Email match';
    elsif mobile is not null and conflict_record.mobile = new.mobile then
      match_reason := 'Primary phone match';
    elsif alt_mobile is not null and conflict_record.alt_mobile = new.mobile then
      match_reason := 'Alternative phone match (NEW FIX)';
    else
      match_reason := 'Unknown match type';
    end if;

    -- Log the auto-delete event
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

    -- Delete the old admin-created profile (cascading deletes handled by FK constraints)
    delete from public.profiles where id = conflict_record.id;
  end if;

  return new;
end;
$$;

-- Recreate trigger
create trigger on_profile_created_check_conflict
before insert on public.profiles
for each row execute procedure public.handle_new_profile_conflict();

-- Verification: Check trigger exists
-- SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'on_profile_created_check_conflict';
