-- FUNCTION: Handle Conflict and Auto-Delete
-- Triggered BEFORE INSERT on profiles
create or replace function public.handle_new_profile_conflict()
returns trigger
language plpgsql
security definer
as $$
declare
  conflict_record record;
begin
  -- Search for existing 'admin_created' profile with same email or mobile
  select * into conflict_record
  from public.profiles
  where is_admin_created = true
    and (
      (email is not null and email = new.email)
      or 
      (mobile is not null and mobile = new.mobile)
    )
  limit 1;

  -- If conflict found
  if conflict_record.id is not null then
    -- 1. Log the event
    insert into public.audit_logs (event_type, old_profile_id, metadata, status)
    values (
      'AUTO_DELETE_TRIGGERED', 
      conflict_record.id, 
      jsonb_build_object('reason', 'User Self-Registered', 'new_email', new.email),
      'success'
    );

    -- 2. Delete the old admin-created profile
    -- Note: We rely on Cascading Deletes or Logic App to clean up Storage files later
    delete from public.profiles where id = conflict_record.id;
  end if;

  return new;
end;
$$;

-- TRIGGER
drop trigger if exists on_profile_created_check_conflict on public.profiles;
create trigger on_profile_created_check_conflict
before insert on public.profiles
for each row execute procedure public.handle_new_profile_conflict();
