# Migration Execution Guide - Critical Database Fixes

**Status:** Ready for Deployment
**Created:** March 28, 2026
**Version:** 1.0
**Risk Level:** MEDIUM (Data-safe, schema updates)

---

## 📋 MIGRATION FILES CREATED

All migrations are in `supabase/migrations/`:

### 1️⃣ Fix Auto-Delete Trigger (CRITICAL)
**File:** `20250328_fix_auto_delete_alt_mobile.sql`
**Size:** ~2 KB
**Complexity:** MEDIUM
**Time:** ~2 minutes to execute
**Impact:** **HIGH** - Core auto-delete feature fix

**What It Does:**
- Updates `handle_new_profile_conflict()` function
- Adds `alt_mobile` to conflict detection
- Improves logging with match type tracking
- Drops and recreates trigger

**Before:** Only checks email + primary phone
**After:** Checks email + primary phone + alternative phone ✅

**Risk:** LOW - Only updates function and trigger logic
**Rollback:** Revert from git or run original SQL

---

### 2️⃣ Add PDF Approval Status (HIGH)
**File:** `20250328_add_pdf_approval_status.sql`
**Size:** ~3 KB
**Complexity:** MEDIUM
**Time:** ~1 minute to execute
**Impact:** **HIGH** - Enables PDF workflow

**What It Does:**
- Adds `pdf_approval_status` column (null|pending|approved|rejected)
- Adds `pdf_rejection_reason` column
- Adds `pdf_approved_by` and `pdf_approved_at` columns
- Creates index on `pdf_approval_status`
- Creates trigger to auto-update `updated_at`
- Migrates existing PDFs to 'approved' status

**Data Migration:**
- Existing PDFs automatically set to `approved` (backward compatible)
- No data loss

**Risk:** LOW - Only adds columns and indexes
**Rollback:** `ALTER TABLE profiles DROP COLUMN pdf_approval_status CASCADE;`

---

### 3️⃣ Create Express Interests Table (CRITICAL)
**File:** `20250328_create_express_interests_table.sql`
**Size:** ~5 KB
**Complexity:** MEDIUM
**Time:** ~2 minutes to execute
**Impact:** **CRITICAL** - Enables mutual interest tracking

**What It Does:**
- Creates new `express_interests` table with columns:
  - `from_profile_id` (who expressed interest)
  - `to_profile_id` (who received interest)
  - `status` (expressed|mutual_match|rejected|withdrawn)
  - `mutual_matched_at` (when mutual match detected)
- Creates intelligent function `check_mutual_interest()`
- Auto-detects mutual matches on insert
- Adds RLS policies (secure)
- Creates comprehensive indexes

**Key Feature:** Automatic mutual match detection ✅

**Risk:** LOW - New table, no existing data affected
**Rollback:** `DROP TABLE express_interests CASCADE;`

---

### 4️⃣ Create Daily Digest Tracking (HIGH)
**File:** `20250328_create_daily_digest_table.sql`
**Size:** ~6 KB
**Complexity:** MEDIUM
**Time:** ~2 minutes to execute
**Impact:** **HIGH** - Prevents duplicate notifications

**What It Does:**
- Creates `daily_digest_sent` table to track digest delivery
- Columns for digest content, delivery status, open tracking
- Unique constraint prevents duplicate digests per profile per day
- Helper function `get_digest_stats()` for admin reporting
- RLS policies (users see own, admins see all)
- Email service tracking (SendGrid, AWS SES, etc.)

**Key Feature:** One digest per user per day (enforced) ✅

**Risk:** LOW - New table
**Rollback:** `DROP TABLE daily_digest_sent CASCADE;`

---

### 5️⃣ Create Settings Table (HIGH)
**File:** `20250328_create_settings_table.sql`
**Size:** ~8 KB
**Complexity:** MEDIUM
**Time:** ~3 minutes to execute
**Impact:** **MEDIUM** - Enables admin configuration

**What It Does:**
- Creates `settings` key-value table
- Inserts 25+ default settings:
  - Razorpay keys
  - Notification preferences
  - Platform limits
  - Google Drive config
  - Support contact info
  - Feature flags
- Creates helper functions:
  - `get_setting(key, default)` - Get as text
  - `get_setting_bool(key, default)` - Get as boolean
  - `get_setting_number(key, default)` - Get as numeric
  - `update_setting(key, value)` - Update setting
- RLS policies (only admins)
- Audit trail (tracks who changed what)

**Key Feature:** Dynamic configuration without code changes ✅

**Risk:** LOW - New table, comes with default values
**Rollback:** `DROP TABLE settings CASCADE;`

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Backup Database (RECOMMENDED)
```bash
# Backup your Supabase database before running migrations
# In Supabase Dashboard: Settings → Backups → Create Backup
```

### Step 2: Run Migrations in Order

**Option A: Using Supabase CLI (Recommended)**
```bash
cd "C:\Users\Administrator\Desktop\lingayet\lingayatsangam (2)"

# Link to your project (first time only)
# npx supabase link --project-ref qomnebvjrdlqvlwrpmod

# Push all migrations
npx supabase db push
```

**Option B: Manual SQL (Via Supabase Dashboard)**
1. Go to Supabase Dashboard → SQL Editor
2. Copy/paste each migration file in order:
   1. `20250328_fix_auto_delete_alt_mobile.sql`
   2. `20250328_add_pdf_approval_status.sql`
   3. `20250328_create_express_interests_table.sql`
   4. `20250328_create_daily_digest_table.sql`
   5. `20250328_create_settings_table.sql`
3. Execute each one and wait for success

### Step 3: Validate Migrations

Run validation tests in SQL Editor:
```bash
# Open SQL Editor and run:
# supabase/migrations/VALIDATION_TESTS.sql
```

Expected results:
```
✅ Auto-delete with alt_mobile works
✅ PDF approval status fields exist
✅ Express interests table created with auto-match logic
✅ Daily digest tracking table created
✅ Settings table with 25+ default settings
```

---

## ✅ POST-DEPLOYMENT CHECKLIST

After running migrations:

- [ ] No error messages in execution log
- [ ] All 5 tables exist: `profiles` (modified), `express_interests`, `daily_digest_sent`, `settings`
- [ ] All triggers created: `on_profile_created_check_conflict`, `on_pdf_approval_change`, `on_express_interest_insert`, `on_digest_view`, `on_settings_update`
- [ ] All indexes created (use `pg_indexes` to verify)
- [ ] RLS enabled on new tables
- [ ] Validation tests pass without errors
- [ ] No downtime or user impact
- [ ] Git history updated with migration files

---

## 🧪 TESTING THE FIXES

### Test 1: Auto-Delete with Alt Mobile
```sql
-- Create admin profile with alt_mobile
-- Register user with same alt_mobile
-- Verify admin profile auto-deleted
-- Check audit logs for "Alternative phone match"
```

### Test 2: PDF Approval
```sql
-- Create profile with PDF
-- Update pdf_approval_status to 'pending'
-- Approve (set to 'approved')
-- Verify pdf_approved_at timestamp updated
```

### Test 3: Express Interest
```sql
-- Create 2 test profiles
-- A expresses interest in B
-- B expresses interest in A
-- Verify both get status 'mutual_match'
-- Verify mutual_matched_at is set
```

### Test 4: Daily Digest
```sql
-- Insert digest record
-- Try insert duplicate (should fail with constraint error)
-- Verify unique constraint works
-- Run get_digest_stats() function
```

### Test 5: Settings
```sql
-- SELECT all settings
-- Test get_setting() functions
-- Update a setting
-- Verify updated_by and updated_at changed
```

---

## 🔄 MIGRATION ORDER EXPLANATION

**Why this specific order?**

1. **Auto-Delete First** ✅ - Foundation for all user registrations
2. **PDF Status Next** ✅ - Extends profiles table (dependency clear)
3. **Express Interests** ✅ - New table, references profiles
4. **Daily Digest** ✅ - New table, references profiles
5. **Settings Last** ✅ - Independent, used by other features

**Can order be changed?**
- Settings can move anywhere (independent)
- Others have implicit dependencies

---

## 📊 MIGRATION STATISTICS

| Migration | Tables | Columns | Triggers | Functions | Indexes | RLS |
|-----------|--------|---------|----------|-----------|---------|-----|
| 1. Auto-Delete Fix | 0 | 0 | 1 (update) | 1 (update) | 0 | 0 |
| 2. PDF Status | 1 | 4 added | 1 | 1 | 1 | 0 |
| 3. Express Interests | 1 | 8 | 1 | 1 | 5 | ✅ |
| 4. Daily Digest | 1 | 12 | 1 | 1 (helper) | 6 | ✅ |
| 5. Settings | 1 | 9 | 1 | 4 (helpers) | 2 | ✅ |
| **TOTAL** | **4 new** | **~25 new** | **5 total** | **~8** | **~14** | **3** |

---

## ⏱️ EXECUTION TIME ESTIMATE

- Pre-migration backup: **2 minutes**
- Auto-delete fix: **2 minutes**
- PDF approval: **1 minute**
- Express interests: **2 minutes**
- Daily digest: **2 minutes**
- Settings: **3 minutes**
- Validation tests: **5 minutes**
- **TOTAL: ~15-20 minutes**

**Downtime:** NONE (schema changes don't block reads/writes)

---

## 🔍 VERIFICATION QUERIES

Run these after migrations to confirm everything:

```sql
-- Check all new tables exist
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('express_interests', 'daily_digest_sent', 'settings', 'profiles')
ORDER BY table_name;

-- Count all settings
SELECT COUNT(*) as setting_count FROM public.settings;

-- List PDF-related columns
SELECT column_name FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name LIKE 'pdf%';

-- Check triggers
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

-- Check RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## ⚠️ ROLLBACK PLAN

If something goes wrong:

### Rollback Option 1: Restore from Backup
```bash
# Restore from backup in Supabase Dashboard
# Time: 5-10 minutes
# Data Loss: None
```

### Rollback Option 2: Manual Delete (If needed)
```sql
-- Drop new tables
DROP TABLE IF EXISTS express_interests CASCADE;
DROP TABLE IF EXISTS daily_digest_sent CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Drop columns from profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS pdf_approval_status CASCADE;
ALTER TABLE profiles DROP COLUMN IF EXISTS pdf_rejection_reason CASCADE;
ALTER TABLE profiles DROP COLUMN IF EXISTS pdf_approved_by CASCADE;
ALTER TABLE profiles DROP COLUMN IF EXISTS pdf_approved_at CASCADE;

-- Restore original trigger
-- (see git history for original version)
```

---

## 📞 SUPPORT & TROUBLESHOOTING

### Error: "Relation already exists"
**Cause:** Migrations run twice
**Fix:** Check git history, only run once per environment

### Error: "Foreign key violation"
**Cause:** Data conflicts with constraints
**Fix:** Backup and restore from backup, then debug

### Error: "RLS policy violation"
**Cause:** RLS too strict for current user
**Fix:** Check user role, might be non-admin trying to edit settings

### Performance: Slow queries on new tables
**Cause:** Missing indexes or no ANALYZE
**Fix:** Run `ANALYZE` on tables after large data imports

---

## 📝 NEXT STEPS AFTER DEPLOYMENT

1. ✅ Validate all migrations succeeded
2. ✅ Run test suite
3. ✅ Deploy application code that uses new features
4. ✅ Monitor database performance
5. ✅ Update CLAUDE.md to reflect completed fixes
6. ✅ Start building features that depend on these tables

---

## 🎯 SUCCESS CRITERIA

**Migration is successful when:**
- ✅ No error messages
- ✅ All 5 files applied successfully
- ✅ Validation tests pass
- ✅ Application still functions normally
- ✅ No performance degradation
- ✅ Users not affected (transparent upgrade)

---

**Document Version:** 1.0
**Created:** March 28, 2026
**Ready for:** Production Deployment
**Confidence Level:** HIGH
