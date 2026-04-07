-- MIGRATION: Add PDF Approval Status Field
-- Date: 2026-03-28
-- Description: Add pdf_approval_status field to profiles table for PDF bio approval workflow
-- Impact: PDFs can now be individually approved/rejected by admin

-- Add new column to profiles table
alter table public.profiles
add column if not exists pdf_approval_status text default null;

-- Add constraint to ensure valid values
alter table public.profiles
add constraint pdf_approval_status_check
check (pdf_approval_status is null or pdf_approval_status in ('pending', 'approved', 'rejected'));

-- Add column for admin notes on PDF rejection
alter table public.profiles
add column if not exists pdf_rejection_reason text default null;

-- Add column to track who approved/rejected and when
alter table public.profiles
add column if not exists pdf_approved_by uuid references auth.users(id) on delete set null;

alter table public.profiles
add column if not exists pdf_approved_at timestamptz default null;

-- Create index for faster PDF approval queries
create index if not exists idx_profiles_pdf_approval_status
on public.profiles(pdf_approval_status)
where pdf_approval_status is not null;

-- Add comment for documentation
comment on column public.profiles.pdf_approval_status is
'PDF bio approval status: null (not uploaded), pending (awaiting admin review), approved (visible to users), rejected (needs reupload)';

comment on column public.profiles.pdf_rejection_reason is
'Reason provided by admin when PDF is rejected (e.g., "Contains inappropriate content")';

comment on column public.profiles.pdf_approved_by is
'Admin user who approved or rejected the PDF';

comment on column public.profiles.pdf_approved_at is
'Timestamp when PDF was approved or rejected';

-- Update trigger: When pdf_approval_status changes, update updated_at
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

-- Data migration: Set existing PDFs to 'approved' (assume already validated)
update public.profiles
set pdf_approval_status = 'approved'
where bio_pdf_url is not null and pdf_approval_status is null;

-- Verification query (run after migration):
-- SELECT id, bio_pdf_url, pdf_approval_status, pdf_rejection_reason FROM profiles WHERE bio_pdf_url IS NOT NULL;
