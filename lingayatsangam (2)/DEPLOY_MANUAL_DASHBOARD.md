# Manual Deployment via Supabase Dashboard

**Best Option:** Use Supabase Dashboard SQL Editor (Simplest, No CLI issues)

---

## 📋 STEP-BY-STEP DEPLOYMENT

### Step 1: Access Supabase SQL Editor

1. Go to: https://app.supabase.com
2. Select your project: **Lingayat Mali**
3. Navigate to: **SQL Editor** (left sidebar)
4. Click: **New Query**

---

### Step 2: Deploy Migrations in Order

#### Migration 1️⃣: Fix Auto-Delete Trigger

1. Click **New Query**
2. Copy the entire content of: `supabase/migrations/20250328_fix_auto_delete_alt_mobile.sql`
3. Paste into SQL Editor
4. Click **Run** (Ctrl+Enter)
5. Wait for success (green checkmark)
6. Copy the output message

**Expected Output:**
```
✅ Success
Function handle_new_profile_conflict updated
Trigger on_profile_created_check_conflict updated
```

---

#### Migration 2️⃣: Add PDF Approval Status

1. Click **New Query**
2. Copy: `supabase/migrations/20250328_add_pdf_approval_status.sql`
3. Paste into SQL Editor
4. Click **Run**
5. Wait for success

**Expected Output:**
```
✅ Success
Added 4 columns to profiles table
Created index idx_profiles_pdf_approval_status
Created trigger on_pdf_approval_change
```

---

#### Migration 3️⃣: Create Express Interests Table

1. Click **New Query**
2. Copy: `supabase/migrations/20250328_create_express_interests_table.sql`
3. Paste into SQL Editor
4. Click **Run**
5. Wait for success

**Expected Output:**
```
✅ Success
Created table public.express_interests
Created indexes and RLS policies
```

---

#### Migration 4️⃣: Create Daily Digest Table

1. Click **New Query**
2. Copy: `supabase/migrations/20250328_create_daily_digest_table.sql`
3. Paste into SQL Editor
4. Click **Run**
5. Wait for success

**Expected Output:**
```
✅ Success
Created table public.daily_digest_sent
Created indexes and RLS policies
Function get_digest_stats created
```

---

#### Migration 5️⃣: Create Settings Table

1. Click **New Query**
2. Copy: `supabase/migrations/20250328_create_settings_table.sql`
3. Paste into SQL Editor
4. Click **Run**
5. Wait for success

**Expected Output:**
```
✅ Success
Created table public.settings
Inserted 25 default settings
Created helper functions
```

---

## ✅ VERIFY DEPLOYMENTS

### Step 3: Verify All Migrations

Run these verification queries:

#### Query 1: Check All New Tables Exist

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('express_interests', 'daily_digest_sent', 'settings')
ORDER BY table_name;
```

**Expected Result:**
```
 table_name
─────────────────────
 daily_digest_sent
 express_interests
 settings
```

---

#### Query 2: Check Profiles Has New Columns

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name LIKE 'pdf%'
ORDER BY column_name;
```

**Expected Result:**
```
 column_name
──────────────────────
 pdf_approval_status
 pdf_approved_at
 pdf_approved_by
 pdf_rejection_reason
```

---

#### Query 3: Check All Triggers Created

```sql
SELECT trigger_name
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY trigger_name;
```

**Expected Result:** (Should include)
```
 trigger_name
────────────────────────────────
 on_digest_view
 on_express_interest_insert
 on_pdf_approval_change
 on_profile_created_check_conflict
 on_settings_update
```

---

#### Query 4: Count Settings

```sql
SELECT COUNT(*) as total_settings
FROM public.settings;
```

**Expected Result:**
```
 total_settings
────────────────
      25+
```

---

#### Query 5: Test Express Interest Auto-Detect

```sql
-- Create 2 test profiles
INSERT INTO public.profiles (
  full_name, email, mobile, created_for, gender, sub_caste, status
) VALUES
  ('Test A', 'a@test.com', '1111111111', 'Self', 'Female', 'Panchamasali', 'active'),
  ('Test B', 'b@test.com', '2222222222', 'Self', 'Male', 'Jangama', 'active')
RETURNING id;

-- Save the IDs
-- Then express mutual interest
INSERT INTO public.express_interests (from_profile_id, to_profile_id)
VALUES (
  (SELECT id FROM public.profiles WHERE email = 'a@test.com'),
  (SELECT id FROM public.profiles WHERE email = 'b@test.com')
);

INSERT INTO public.express_interests (from_profile_id, to_profile_id)
VALUES (
  (SELECT id FROM public.profiles WHERE email = 'b@test.com'),
  (SELECT id FROM public.profiles WHERE email = 'a@test.com')
);

-- Verify mutual match detected
SELECT from_profile_id, to_profile_id, status, mutual_matched_at
FROM public.express_interests
ORDER BY created_at DESC LIMIT 2;
```

**Expected Result:** Both should show `status = 'mutual_match'` ✅

---

## 🎯 SUCCESS CHECKLIST

After all 5 migrations:

- [ ] Migration 1 ✅ - Auto-delete trigger updated
- [ ] Migration 2 ✅ - PDF approval columns added
- [ ] Migration 3 ✅ - Express interests table created
- [ ] Migration 4 ✅ - Daily digest table created
- [ ] Migration 5 ✅ - Settings table created
- [ ] All verification queries pass ✅
- [ ] No error messages ✅
- [ ] Database is responsive ✅

---

## 🔄 IF SOMETHING FAILS

### Issue: "Relation already exists"
**Cause:** Migration already ran
**Fix:** Check in Data Editor if table exists, skip that migration

### Issue: "Syntax error in SQL"
**Cause:** Incomplete copy/paste
**Fix:**
1. Copy entire file again carefully
2. Make sure nothing is cut off
3. Paste in fresh query window

### Issue: "Permission denied"
**Cause:** User role too low
**Fix:**
1. Use project owner/admin account
2. Or contact Supabase support

### Issue: "Foreign key violation"
**Cause:** Data conflicts
**Fix:**
1. Check existing data in profiles table
2. Adjust constraint if needed
3. Or restore from backup and retry

---

## 📞 NEED HELP?

If you get stuck:

1. **Check SQL Syntax:** Copy the entire migration file again
2. **Check Permissions:** Logged in as project owner?
3. **Check Existing Data:** Does the table already exist?
4. **Read Error Message:** Usually tells you what's wrong
5. **Contact Supabase:** Support team can help

---

## ⏱️ TIMING

- Each migration: 30 seconds - 1 minute
- Verification queries: 5 minutes
- **Total: ~10-15 minutes**

---

## 🎉 AFTER SUCCESSFUL DEPLOYMENT

1. ✅ Go to **Data Editor** and verify tables exist
2. ✅ Check **Schema** to see columns and indexes
3. ✅ Review **RLS Policies** to see security
4. ✅ Read `CRITICAL_FIXES_SUMMARY.md`
5. ✅ Start building backend code using new tables

---

**Next:** Backend implementation using new tables and functions
**Timeline:** Ready for immediate development
**Status:** ✅ Production Ready
