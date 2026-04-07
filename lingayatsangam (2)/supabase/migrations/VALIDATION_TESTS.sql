-- VALIDATION TESTS FOR CRITICAL FIXES
-- Run these queries after migrations to verify everything works

-- ============================================================
-- TEST 1: AUTO-DELETE TRIGGER WITH ALT_MOBILE
-- ============================================================

-- Create test admin profile with alt_mobile
INSERT INTO public.profiles (
  user_id, full_name, email, mobile, alt_mobile, is_admin_created, created_for, gender, sub_caste, status
) VALUES (
  NULL,
  'Test Admin Profile - Alt Mobile',
  'test.admin.alt@example.com',
  '9876543210',
  '9876543211',  -- Alternative phone
  true,
  'Self',
  'Female',
  'Panchamasali',
  'active'
) RETURNING id;
-- Save this ID as {TEST_ADMIN_PROFILE_ID}

-- Verify it was created
SELECT id, full_name, is_admin_created, email, mobile, alt_mobile
FROM public.profiles
WHERE email = 'test.admin.alt@example.com';

-- Now simulate user self-registering with alt_mobile (should trigger auto-delete)
INSERT INTO public.profiles (
  user_id, full_name, email, mobile, created_for, gender, sub_caste, status
) VALUES (
  gen_random_uuid(),  -- Real user ID
  'New User Self Registered',
  'test.user.alt@example.com',
  '9876543211',  -- SAME AS ALT_MOBILE from admin profile
  'Self',
  'Male',
  'Panchamasali',
  'pending_approval'
) RETURNING id;
-- Save this ID as {TEST_USER_PROFILE_ID}

-- Verify: Admin profile should be deleted (auto-delete trigger)
SELECT COUNT(*) as admin_profiles_remaining FROM public.profiles
WHERE email = 'test.admin.alt@example.com';
-- EXPECTED: 0 (deleted)

-- Verify: Check audit logs for auto-delete event
SELECT event_type, metadata, status
FROM public.audit_logs
WHERE event_type = 'AUTO_DELETE_TRIGGERED'
ORDER BY created_at DESC
LIMIT 3;

-- EXPECTED: "Alternative phone match (NEW FIX)" in metadata


-- ============================================================
-- TEST 2: PDF APPROVAL STATUS
-- ============================================================

-- Verify column exists and has correct constraint
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'pdf_approval_status';

-- Create test profile with PDF
INSERT INTO public.profiles (
  user_id, full_name, email, mobile, created_for, gender, sub_caste, status, bio_pdf_url, pdf_approval_status
) VALUES (
  gen_random_uuid(),
  'User With PDF',
  'user.pdf@example.com',
  '9999999999',
  'Self',
  'Female',
  'Jangama',
  'active',
  'https://drive.google.com/uc?export=view&id=fake-id',
  'pending'
) RETURNING id;

-- Verify PDF approval fields exist
SELECT id, bio_pdf_url, pdf_approval_status, pdf_rejection_reason, pdf_approved_at
FROM public.profiles
WHERE email = 'user.pdf@example.com';

-- EXPECTED: pdf_approval_status = 'pending'

-- Simulate admin approving PDF
UPDATE public.profiles
SET pdf_approval_status = 'approved',
    pdf_approved_by = gen_random_uuid(),  -- Admin's user ID (replace with real)
    pdf_approved_at = now()
WHERE email = 'user.pdf@example.com';

-- Verify approval
SELECT id, pdf_approval_status, pdf_approved_at
FROM public.profiles
WHERE email = 'user.pdf@example.com';

-- EXPECTED: pdf_approval_status = 'approved'


-- ============================================================
-- TEST 3: EXPRESS INTERESTS TABLE
-- ============================================================

-- Verify table and indexes exist
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'express_interests';
-- EXPECTED: express_interests

-- Check indexes
SELECT indexname
FROM pg_indexes
WHERE tablename = 'express_interests';
-- EXPECTED: Multiple indexes including unique constraint

-- Create test profiles for mutual interest
INSERT INTO public.profiles (user_id, full_name, email, mobile, created_for, gender, sub_caste, status)
VALUES
  (gen_random_uuid(), 'Profile A', 'a@test.com', '1111111111', 'Self', 'Female', 'Panchamasali', 'active'),
  (gen_random_uuid(), 'Profile B', 'b@test.com', '2222222222', 'Self', 'Male', 'Jangama', 'active')
RETURNING id;
-- Save IDs as {PROFILE_A_ID} and {PROFILE_B_ID}

-- A expresses interest in B
INSERT INTO public.express_interests (from_profile_id, to_profile_id, status)
VALUES ('{PROFILE_A_ID}', '{PROFILE_B_ID}', 'expressed');

-- B expresses interest in A (should trigger mutual match)
INSERT INTO public.express_interests (from_profile_id, to_profile_id, status)
VALUES ('{PROFILE_B_ID}', '{PROFILE_A_ID}', 'expressed');

-- Verify mutual match was detected
SELECT from_profile_id, to_profile_id, status, mutual_matched_at
FROM public.express_interests
WHERE (from_profile_id = '{PROFILE_A_ID}' OR from_profile_id = '{PROFILE_B_ID}');

-- EXPECTED: Both records have status = 'mutual_match' and mutual_matched_at is set


-- ============================================================
-- TEST 4: DAILY DIGEST TRACKING
-- ============================================================

-- Verify table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'daily_digest_sent';
-- EXPECTED: daily_digest_sent

-- Create test digest record
INSERT INTO public.daily_digest_sent (
  profile_id, email_sent_to, digest_date, digest_period_start, digest_period_end,
  digest_content, delivery_status
) VALUES (
  '{PROFILE_A_ID}',
  'a@test.com',
  current_date,
  now() - interval '24 hours',
  now(),
  jsonb_build_object('profile_views', 5, 'interests_received', 2),
  'sent'
);

-- Verify digest was created
SELECT id, profile_id, email_sent_to, delivery_status, sent_at
FROM public.daily_digest_sent
WHERE digest_date = current_date;

-- EXPECTED: Record with delivery_status = 'sent'

-- Test duplicate prevention (should fail due to unique constraint)
INSERT INTO public.daily_digest_sent (
  profile_id, email_sent_to, digest_date, digest_period_start, digest_period_end,
  digest_content
) VALUES (
  '{PROFILE_A_ID}',
  'a@test.com',
  current_date,
  now() - interval '24 hours',
  now(),
  jsonb_build_object('test', 'duplicate')
);
-- EXPECTED: Error due to unique constraint (good!)

-- Test digest stats function
SELECT * FROM get_digest_stats(current_date);


-- ============================================================
-- TEST 5: SETTINGS TABLE
-- ============================================================

-- Verify table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'settings';
-- EXPECTED: settings

-- Verify default settings were inserted
SELECT COUNT(*) as setting_count FROM public.settings;
-- EXPECTED: > 20 settings

-- List all settings
SELECT key, category, value_type, description
FROM public.settings
ORDER BY category, key;

-- Test getting settings
SELECT get_setting('daily_digest_time', '20:00');
SELECT get_setting_bool('daily_digest_enabled', true);
SELECT get_setting_number('max_daily_contacts', 10);

-- Update a setting
UPDATE public.settings
SET value = '15'
WHERE key = 'max_daily_contacts';

-- Verify update
SELECT value FROM public.settings WHERE key = 'max_daily_contacts';
-- EXPECTED: '15'

-- Verify sensitive settings are marked correctly
SELECT key, is_sensitive FROM public.settings
WHERE is_sensitive = true;


-- ============================================================
-- CLEANUP (Run after testing)
-- ============================================================

-- Delete test profiles
DELETE FROM public.profiles WHERE email LIKE 'test.%' OR email LIKE 'user.%' OR email LIKE '%@test.com';

-- Delete test digest records
DELETE FROM public.daily_digest_sent WHERE email_sent_to LIKE '%@test.com';

-- Verify cleanup
SELECT COUNT(*) FROM public.profiles WHERE email LIKE 'test.%';
SELECT COUNT(*) FROM public.daily_digest_sent WHERE email_sent_to LIKE '%@test.com';


-- ============================================================
-- FINAL VERIFICATION
-- ============================================================

-- Check all migrations completed
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('express_interests', 'daily_digest_sent', 'settings')
ORDER BY table_name;
-- EXPECTED: All 3 tables present

-- Check trigger exists
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_name LIKE '%conflict%' OR trigger_name LIKE '%digest%'
ORDER BY trigger_name;

-- Check profiles table has new columns
SELECT column_name FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name LIKE 'pdf%'
ORDER BY column_name;

-- Check RLS enabled on new tables
SELECT schemaname, tablename
FROM pg_tables
WHERE tablename IN ('express_interests', 'daily_digest_sent', 'settings')
ORDER BY tablename;

PRINT '✅ All validation tests completed!';
