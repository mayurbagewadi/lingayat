# Lingayat Mali Matrimonial Platform - Project Documentation

**Supabase Dashboard:** https://supabase.com/dashboard/project/qomnebvjrdlqvlwrpmod

---

## 🚨 CRITICAL ISSUES & QUICK FIXES NEEDED

### Issue 1: Auto-Delete Trigger Incomplete ⚠️
**Current:** Only checks `email` + `mobile` (primary phone)
**Missing:** Does NOT check `alt_mobile` (alternative phone)
**Impact:** Admin-created profiles won't be deleted if user registers with alternative phone
**Fix Needed:** Update trigger to include `alt_mobile` in matching logic
**Priority:** HIGH

### Issue 2: PDF Approval System Missing ⚠️
**Current:** `bio_pdf_url` field exists but no approval workflow
**Missing:** No separate PDF approval status tracking
**Impact:** PDFs cannot be selectively approved/rejected by admin
**Fix Needed:** Add `pdf_approval_status` field to profiles table
**Priority:** HIGH

### Issue 3: Express Interest System Not Implemented ⚠️
**Current:** No `express_interests` table exists
**Missing:** Cannot track mutual interests, contact limits, interest notifications
**Impact:** Core subscription feature missing
**Fix Needed:** Create `express_interests` table + implement logic
**Priority:** CRITICAL

### Issue 4: Daily Digest Not Tracked ⚠️
**Current:** No way to track which digests were sent
**Missing:** No `daily_digest_sent` table
**Impact:** Risk of duplicate digests or missing recipients
**Fix Needed:** Create tracking table + implement cron job
**Priority:** HIGH

### Issue 5: Settings Table Missing ⚠️
**Current:** No place to store admin configuration
**Missing:** No `settings` table for Razorpay keys, contact limits, etc.
**Impact:** Cannot configure platform dynamically
**Fix Needed:** Create `settings` table with admin UI
**Priority:** MEDIUM

---

## 📋 PROJECT OVERVIEW

**Project Name:** Lingayat Mali Matrimonial Platform (Matrimonial Webapp)
**Purpose:** Subscription-based matrimonial platform exclusively for the Lingayat Mali community
**Target Users:** Community members seeking matrimonial matches
**Current Status:** MVP in progress (landing page + registration + basic dashboard built; advanced features pending)

---

## 🏗️ TECHNOLOGY STACK

### Frontend
- **Framework:** React 19.2.0
- **Build Tool:** Vite 6.2.0
- **Language:** TypeScript 5.8.2
- **Animations:** Framer Motion 12.23.24
- **Animation Library:** GSAP 3.12.5
- **UI Icons:** Lucide React 0.555.0
- **Styling:** Tailwind CSS (via project)
- **Testing:** Playwright 1.57.0

### Backend
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **API Client:** @supabase/supabase-js (latest)
- **AI Integration:** Google GenAI (@google/genai 1.30.0)

### External Services (Planned)
- **Payment Gateway:** Razorpay (automated & manual)
- **Photo Storage:** Google Drive API (direct upload, no server storage)
- **Notifications:** Email, SMS, WhatsApp (via third-party services)

---

## ✅ CURRENTLY BUILT COMPONENTS

### Frontend Components (Existing)
1. **Navbar** - Navigation with theme toggle
2. **Hero** - Landing page hero section with parallax effect
3. **Features** - Community features showcase
4. **Testimonials** - Success stories section
5. **Footer** - Footer with links and contact info
6. **VachanaSection** - Community values section
7. **AIBioGenerator** - AI-powered bio generation tool
8. **Login** - User login form
9. **CreateProfile** - User registration form
10. **UserDashboard** - Basic user dashboard
11. **ProfileBrowsing** - Profile browsing interface
12. **AdminDashboard** - Admin control panel (includes Subscriptions tab)
13. **AdminManualUser** - Manual user creation by admin
14. **NotFound** - 404 error page
15. **PendingApproval** - Profile pending approval message
16. **UpgradeToPremium** - Subscription upgrade page
17. **PhotoManager** - Photo management interface
18. **DailyDigest** - Daily notification digest
19. **ExpiryBanner** - Subscription expiry warning

### Database & Backend (Implemented)
- ✅ **Supabase PostgreSQL** - Full database setup
- ✅ **Auth System** - Email/password authentication
- ✅ **Profiles Table** - Complete with all fields (5 photos, PDF, subscription)
- ✅ **Payments Table** - Track Razorpay and manual payments
- ✅ **Activity Logs** - Track user actions
- ✅ **Audit Logs** - Track admin and system events
- ✅ **Storage Buckets** - Photos, PDFs, payment proofs
- ✅ **Auto-Delete Trigger** - Deletes admin profiles when user self-registers
- ✅ **Role System** - user | admin | moderator | support
- ✅ **RLS Policies** - Row-level security for data protection
- ✅ **Demo Data** - 8 sample profiles with various statuses

### Core Features (Built)
- ✅ Landing page with hero section
- ✅ Dark/Light theme toggle
- ✅ User authentication via Supabase
- ✅ Registration form with detailed profile fields (20+ fields)
- ✅ Login system with email/password
- ✅ Role-based routing (user/admin/visitor)
- ✅ Animated page transitions
- ✅ Responsive design
- ✅ Theme persistence
- ✅ Admin profile creation (manual user addition)
- ✅ Auto-delete logic (when user self-registers)
- ✅ Profile approval workflow (pending/active/rejected states)
- ✅ Subscription status tracking (free/premium/expired)
- ✅ Admin Subscription Management (manual set/extend/cancel per user, auto-assign plan for new users)
- ✅ Payment tracking (Razorpay + manual proofs)

---

## 📊 ACTUAL DATABASE STATUS SUMMARY

### ✅ Already In Database
| Table | Status | Fields | Purpose |
|-------|--------|--------|---------|
| `profiles` | ✅ Complete | 28+ fields | User profiles with photo/PDF storage + subscription |
| `payments` | ✅ Complete | 9 fields | Track manual + Razorpay payments |
| `activity_logs` | ✅ Complete | 5 fields | Log user actions (views, interests) |
| `audit_logs` | ✅ Complete | 6 fields | Track admin/system events (auto-deletes, approvals) |
| `storage.buckets` | ✅ 3 buckets | photos, pdfs, payment_proofs | File storage |

### ✅ Already Implemented
- Auto-delete trigger function
- Role system (user/admin/moderator/support)
- RLS security policies
- Demo data (8 profiles)

### ⚠️ Missing Tables (Not Yet Created)
- `express_interests` - Track mutual interest between users
- `reported_profiles` - Store profile reports
- `settings` - Admin-configurable settings
- `pdf_approvals` - Separate PDF approval workflow
- `daily_digest_sent` - Track digest delivery

### ⚠️ Needs Database Updates
- Add `alternative_phone` matching to auto-delete trigger (currently only checks email + primary phone)
- Add `pdf_approval_status` field to profiles table
- Add fields for tracking "who viewed profile"

---

## ❌ MISSING FEATURES & TODO

### High Priority (Core Functionality)

#### Backend Infrastructure
- [ ] **Database Schema** - Complete schema with all tables and relationships
- [ ] **Authentication & Authorization** - Role-based access control (Visitor, Registered, Subscriber, Moderator, Support, Super Admin)
- [ ] **Profile Approval Workflow** - Backend logic for profile review and approval
- [x] **Subscription Management** - Subscription activation, expiry, renewal logic (admin can manually set/extend/cancel per user + auto-assign for new users via app_settings)
- [ ] **Auto-Delete Logic** - Delete admin-created profiles when user self-registers with matching email/phone
- [ ] **Payment Processing** - Razorpay webhook integration + manual payment verification

#### Photo Management
- [ ] **Google Drive API Integration** - Upload photos directly to Google Drive
- [ ] **Photo Retrieval** - Fetch photos from Google Drive and display in frontend
- [ ] **Photo Deletion** - Delete photos from Google Drive when user deletes account or admin removes
- [ ] **File ID Storage** - Store Google Drive file IDs in database (not photos)

#### Search & Filter System
- [ ] **Basic Search** - Search by age, sub-caste, education, location (available to all)
- [ ] **Advanced Search** - Additional filters for paid subscribers only (height, income, occupation, family type, etc.)
- [ ] **Search Index** - Optimize database queries for fast search results
- [ ] **Profile Visibility** - Ensure access restrictions based on user subscription level

#### Notification System
- [ ] **Daily Digest** - Send daily email with activity summary
- [ ] **Email Integration** - Connect to email service (SendGrid, AWS SES, etc.)
- [ ] **SMS Integration** - WhatsApp/SMS notifications via Twilio or similar
- [ ] **Notification Preferences** - User preference management (handled by super admin)
- [ ] **Cron Jobs** - Background tasks for daily digest and cleanup

#### Super Admin Panel (Core)
- [ ] **Dashboard** - Statistics overview (total users, subscriptions, revenue, pending approvals)
- [ ] **User Management** - List, search, edit, delete users; bulk import (CSV/Excel)
- [ ] **Profile Approval** - Review and approve/reject pending profiles
- [ ] **PDF Approval** - Review and approve/reject PDF bios
- [ ] **Photo Moderation** - View all photos, remove inappropriate ones
- [x] **Subscription Management** - Extend, cancel, set subscriptions (Subscriptions tab in admin panel with stats, user list, manual controls, auto-assign config)
- [ ] **Payment Reconciliation** - Review and approve manual payment proofs
- [ ] **Settings Panel** - Configure Razorpay keys, notification settings, contact limits, general settings
- [ ] **Reports & Analytics** - Generate reports (signups, conversions, revenue, activity)
- [ ] **Announcements** - Send messages to users
- [ ] **Reported Profiles** - Handle user reports about inappropriate profiles
- [ ] **Activity Logs** - Track all admin and user actions
- [ ] **Admin Roles** - Create and manage Moderator and Support Staff roles with permissions

#### User Features
- [ ] **PDF Bio Upload** - Allow users to upload PDF bios (10MB max)
- [ ] **Express Interest** - Paid subscribers only; notifications when interested
- [ ] **Contact Details** - Phone number visibility for paid subscribers
- [ ] **Profile Deletion** - User can delete own account and all data
- [ ] **Data Export** - GDPR-style data download (JSON + photos + PDF + activity log)
- [ ] **View Who Viewed** - See list of users who viewed profile
- [ ] **Report Profile** - Report inappropriate profiles
- [ ] **Download PDF Bio** - Paid subscribers can download profile bios

### Medium Priority (Enhancement)

#### Access Control & User Tiers
- [ ] **Visitor Access Matrix** - See name, age, caste, education, photos (full quality)
- [ ] **Registered Non-Subscriber Access** - Additionally see location, who viewed profile
- [ ] **Paid Subscriber Access** - Additionally see phone number, PDF bio, advanced search, express interest
- [ ] **Admin Access Levels** - Super Admin (full), Moderator (approvals + moderation), Support Staff (view only)

#### Profile Management
- [ ] **Profile Completion Status** - Track and display profile completion percentage
- [ ] **Multiple Photos** - Support 0-5 photos per profile
- [ ] **Profile Status States** - Admin Created, Pending Approval, Approved, Rejected, Deleted
- [ ] **Profile Source Tracking** - Distinguish user-created vs admin-created profiles

#### Subscription Features
- [ ] **Contact Limit Enforcement** - Limit how many profiles users can contact per day/month (set by admin)
- [x] **Subscription Expiry Handling** - Admin can see expiring-soon users (30d), manually extend or set expired
- [x] **Manual Renewal** - Admin can manually extend subscription from admin panel (set or extend by 1-24 months)
- [x] **Auto-Assign Plan** - Admin can enable auto-assign premium/free plan for all new registrations (configurable duration)
- [ ] **Yearly Plan Only** - Single subscription tier (yearly basis)

#### Data & Logging
- [ ] **View Tracking** - Log every profile view with timestamp
- [ ] **Interest Tracking** - Log all "Express Interest" actions
- [ ] **Activity History** - User action audit trail
- [ ] **System Logs** - Track payments, approvals, errors
- [ ] **Soft Deletes** - Keep deleted data in audit tables for compliance

#### Email/Notification Templates
- [ ] **Profile Approved Email** - Sent when admin approves profile
- [ ] **Profile Rejected Email** - Sent with reason when profile rejected
- [ ] **Express Interest Notification** - When someone expresses interest
- [ ] **View Notification** - Who viewed your profile
- [ ] **Subscription Activated Email** - After payment processed
- [ ] **Payment Verification Email** - Admin notification for manual payment review
- [ ] **Daily Digest Email** - Summary of activity

### Low Priority (Future Enhancements)

- [ ] Push notifications (PWA support)
- [ ] Mobile app (iOS/Android)
- [ ] Video profiles
- [ ] Video call integration
- [ ] Advanced matching algorithm
- [ ] User ratings/reviews
- [ ] Chat system
- [ ] Multiple subscription tiers
- [ ] Referral system
- [ ] Premium features (priority listing, featured profiles)

---

## 📊 DATABASE SCHEMA (Current - Actual)

### Core Tables (Implemented)

#### `auth.users` (Supabase Auth - Managed by Supabase)
- `id` (UUID, primary)
- `email` (unique)
- `created_at`
- `email_confirmed_at`

#### `public.profiles` (✅ IMPLEMENTED)
```sql
- id (UUID, primary key)
- user_id (UUID, FK to auth.users, UNIQUE, CASCADE DELETE)
- full_name (text, required)
- dob (date, optional)
- created_for (text) -- Self/Son/Daughter/Sibling
- sub_caste (text) -- Panchamasali, Jangama, Banajiga, etc.
- gender (text) -- Male/Female
- education (text)
- location (text)
- mobile (text, UNIQUE) -- Primary phone
- alt_mobile (text) -- Alternative phone
- email (text, UNIQUE)

-- Media (File IDs for Google Drive integration)
- photo_1_file_id (text, nullable)
- photo_2_file_id (text, nullable)
- photo_3_file_id (text, nullable)
- photo_4_file_id (text, nullable)
- photo_5_file_id (text, nullable)
- bio_pdf_url (text, nullable)

-- Status & Approval
- status (text) -- pending_approval | active | rejected | changes_requested | deleted
- is_admin_created (boolean, default false)
- rejection_reason (text, nullable)
- admin_notes (text, nullable)

-- Subscription
- subscription_status (text) -- free | premium | expired (default: free)
- subscription_started_at (timestamptz, nullable)
- subscription_expires_at (timestamptz, nullable)

-- Admin & Roles (Added via migration)
- role (text) -- user | admin | moderator | support (default: user)

-- Timestamps
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())
```

**Indexes:**
- `idx_profiles_role` - For faster role lookups

**RLS Policies (Enabled):**
1. Public profiles viewable by everyone (status = 'active' OR admin)
2. Users can view own profile
3. Users can update own profile
4. Users can insert own profile
5. Admins can update any profile

#### `public.payments` (✅ IMPLEMENTED)
```sql
- id (UUID, primary key)
- profile_id (UUID, FK to profiles, nullable on delete)
- amount (numeric, required)
- transaction_id (text)
- payment_method (text) -- razorpay | bank_transfer
- status (text) -- pending | completed | rejected | refunded (default: pending)
- proof_url (text) -- URL to payment screenshot/proof
- admin_notes (text, nullable)
- created_at (timestamptz, default now())
- verified_at (timestamptz, nullable)
```

**Purpose:** Track all subscription payments (both automated and manual)

#### `public.activity_logs` (✅ IMPLEMENTED)
```sql
- id (UUID, primary key)
- user_id (UUID, FK to auth.users)
- action_type (text) -- view_profile | express_interest | login | download_pdf
- target_profile_id (UUID, FK to profiles)
- metadata (jsonb) -- Additional data as JSON
- created_at (timestamptz, default now())
```

**Purpose:** Track user activities (views, interests, downloads)

#### `public.audit_logs` (✅ IMPLEMENTED)
```sql
- id (UUID, primary key)
- event_type (text) -- AUTO_DELETE | PROFILE_APPROVED | PAYMENT_VERIFIED | etc.
- admin_id (UUID, FK to auth.users)
- old_profile_id (UUID) -- For tracking auto-deleted profiles
- metadata (jsonb) -- Additional context
- status (text)
- created_at (timestamptz, default now())
```

**Purpose:** Audit trail for admin and system actions (especially auto-deletes)

### Storage Buckets (✅ CREATED)

```
storage.buckets:
├── photos (public: true) -- User profile photos (Supabase Storage)
├── pdfs (public: false) -- PDF bios (private, signed URLs)
└── payment_proofs (public: false) -- Manual payment screenshots
```

### Triggers & Functions (✅ IMPLEMENTED)

#### `public.handle_new_profile_conflict()` (Auto-Delete Logic)
**Purpose:** Automatically delete admin-created profiles when matching user self-registers

**Trigger:** `on_profile_created_check_conflict` (BEFORE INSERT on profiles)

**Logic:**
- When new profile inserted, check for existing admin-created profile with:
  - Same email, OR
  - Same mobile phone
- If found:
  - Log event to `audit_logs`
  - Delete old admin-created profile
  - Allow new profile insert to continue
- Return new profile

---

### Tables NOT YET IMPLEMENTED (Planned for Future)

These will be added when building specific features:

#### `public.express_interests` (Planned)
- Track mutual interest between users
- Store interest status and timestamps

#### `public.reported_profiles` (Planned)
- Store user reports of inappropriate profiles
- Track admin action taken

#### `public.settings` (Planned)
- Store admin-configurable settings
- Razorpay keys, notification preferences, etc.

#### `public.daily_digest_sent` (Planned)
- Track which digests were sent to which users
- Prevent duplicate sends

#### `public.pdf_approvals` (Planned)
- Separate table for PDF bio approval workflow
- Track approval status and admin decisions

---

## 🔐 USER ROLES & ACCESS MATRIX

### Role Hierarchy
1. **Visitor** (Not logged in)
2. **Registered Non-Subscriber** (Logged in, free)
3. **Paid Subscriber** (Active subscription)
4. **Moderator** (Staff)
5. **Support Staff** (Staff)
6. **Super Admin** (Full control)

### Access Matrix

| Feature | Visitor | Registered | Paid Sub | Moderator | Support | Super Admin |
|---------|---------|-----------|----------|-----------|---------|------------|
| View Name & Age | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Sub-Caste | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Education | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Photos (Full Quality) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Location | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Phone Number | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Download PDF Bio | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Express Interest | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| See Who Viewed | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Advanced Search | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Basic Search | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Report Profile | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Approve Profiles | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 💾 PHOTO STORAGE ARCHITECTURE

### Key Strategy: **Google Drive Direct Storage (No Server Storage)**

### Why Google Drive?
- Zero server storage costs
- Unlimited capacity (15GB free or unlimited with Google Workspace)
- Fast image delivery via Google CDN
- Centralized admin control
- Easy backup and recovery
- Automatic deletion when needed

### Photo Flow

#### Upload Process
```
User selects photo → Frontend sends to backend → Backend uses Google Drive API
→ Photo uploaded to "Matrimonial_Photos" folder → Google Drive returns File ID
→ File ID saved in database (NOT the photo) → Photo marked "Anyone with link" permission
```

#### Display Process
```
User views profile → Backend fetches File ID from database → Backend generates
Google Drive image URL → Frontend displays image → Users see photo (not URL)
```

#### Deletion Process
```
User deletes account OR Admin removes photo → Backend gets File ID from database
→ Calls Google Drive API to delete file → Removes File ID from database
→ Photo permanently deleted
```

### Database Storage
- Only store **Google Drive File IDs**, not actual photos
- Table: `profile_photos` stores `google_drive_file_id` field
- Naming convention: `photo_user_[USER_ID]_[PHOTO_NUMBER].jpg`

### Google Drive Setup Required
- Create super admin's Google Service Account
- Generate service account JSON key
- Share "Matrimonial_Photos" folder with service account
- Store credentials securely in environment variables

---

## 🔄 KEY BUSINESS LOGIC

### Auto-Delete Profile Logic (Critical)

**Scenario:** Super admin creates profile without user's permission. Later, user self-registers.

**Trigger Conditions:** If user's registration data matches:
- User email = Admin profile email, OR
- User phone = Admin profile primary phone, OR
- User phone = Admin profile alternative phone

**Actions on Match:**
1. Delete old admin-created profile silently
2. Create new user-created profile with user's input
3. NO data transferred between profiles
4. User never knows old profile existed
5. Admin gets notification about auto-delete

**Database Flags:**
- `profiles.source` = 'admin_created' vs 'user_created'
- `profiles.status` tracks: pending_approval, approved, rejected, deleted

### Subscription System

**Payment Options:**
- **Automated:** Razorpay payment gateway (instant activation)
- **Manual:** User uploads payment screenshot → Admin verification → Manual activation

**Subscription Duration:**
- Yearly only (no monthly options)
- No auto-renewal
- Manual renewal when expired

**Expiry Handling:**
- Profile stays live (not hidden/deleted)
- Access downgraded to "Registered Non-Subscriber" level
- No payment reminders sent
- User manually renews when ready

**Contact Limits:**
- Super admin sets global daily/monthly contact limit
- Applied to all subscribers
- Enforced during "Express Interest" action
- Resets daily/monthly

### Profile Approval Workflow

**New Profile States:**
1. Pending Admin Approval (initial)
2. Approved (goes live in search)
3. Rejected (with reason)
4. Deleted (by user or admin)

**PDF Approval (Separate):**
- Photos auto-publish (admin can remove later)
- PDFs require admin approval before visible
- Admin can reject PDFs with reason sent to user

### Activity Tracking

**Events to Log:**
- Profile views (who viewed whom, timestamp)
- Express Interest actions
- PDF downloads
- Search queries (optional)
- Login/logout (optional)
- Profile modifications
- Payment transactions
- Admin actions (approvals, deletions, etc.)

---

## 📧 NOTIFICATION FLOWS

### Daily Digest Email
- **Sent:** Every evening (time set by admin)
- **Content:** Who viewed profile, who expressed interest
- **Recipients:** All registered users (paid + non-paid)
- **Channel:** Email (admin sets preference)

### Notification Channels
- Email (primary)
- SMS (optional)
- WhatsApp (optional)
- Admin decides which channels to use

### Key Notifications
1. Profile approved → Send to user
2. Profile rejected → Send with reason
3. Someone viewed your profile → Include in daily digest
4. Someone expressed interest → Include in daily digest + real-time
5. Subscription activated → Send confirmation
6. Payment verification pending → Send to admin

---

## 🎯 CURRENT VIEW ROUTING (App.tsx)

```
Landing Page (default)
├─ Visitor (no login)
└─ Guest browsing only

Login → Creates Session
├─ Profile Status Pending → Redirect to PendingApproval
├─ Profile Status Approved → Redirect to Dashboard
├─ Role = Admin → Redirect to AdminDashboard
└─ Role = User → Redirect to UserDashboard

Navigation:
├─ Landing
├─ Register (CreateProfile)
├─ Login
├─ Dashboard (UserDashboard)
├─ Browse (ProfileBrowsing)
├─ Upgrade (UpgradeToPremium)
├─ Admin (AdminDashboard)
├─ NotFound (404)
└─ PendingApproval
```

---

## 🛠️ IMPORTANT DEVELOPMENT NOTES

### Code Modification Rules
1. **ALWAYS read existing code** before making changes
2. **Ask clarifying questions** if scope is unclear
3. **Show exactly what will change** and get approval
4. **Make ONLY minimal changes** needed for task
5. **NEVER refactor untouched code**
6. **NEVER modify working features** unless specifically requested
7. **NEVER add extra features** beyond what was asked
8. **Test thoroughly** to confirm nothing broke

### Environment Setup
- Create `.env.local` with:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `GOOGLE_DRIVE_API_KEY` (when implemented)
  - `RAZORPAY_KEY_ID` (when implemented)

### Supabase Setup
- Database must be initialized with schema tables
- Row-level security (RLS) policies needed for privacy
- Auth configuration for email/password login
- Storage bucket for temporary uploads (if needed)

### Testing Checklist
- [ ] All views render without errors
- [ ] Authentication flows work (login, register, logout)
- [ ] Role-based access restrictions enforced
- [ ] Data persists in Supabase
- [ ] API responses correct
- [ ] No console errors
- [ ] Responsive on mobile

---

## 📝 FUTURE MIGRATION NOTES

### When Scaling
- Implement message queue for notifications (Bull, RabbitMQ)
- Add database connection pooling
- Cache frequently accessed profiles (Redis)
- Implement CDN for images
- Add monitoring and logging (Sentry, LogRocket)
- Rate limiting on API endpoints
- Consider database replication for backup

### Performance Optimization
- Lazy load profile photos
- Implement pagination for search results
- Optimize database queries with indexes
- Add API response caching
- Compress images on Google Drive upload

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Supabase RLS policies enabled
- [ ] Google Drive API credentials secured
- [ ] Razorpay test mode → production
- [ ] Email service configured (SendGrid/AWS SES)
- [ ] SMS service configured (Twilio)
- [ ] Domain SSL certificate configured
- [ ] Error logging configured (Sentry)
- [ ] Database backups configured
- [ ] CDN configured for images
- [ ] Rate limiting enabled
- [ ] GDPR compliance checks done

---

## 👥 STAKEHOLDERS & CONTACTS

**Project Owner:** (Add name)
**Super Admin:** (Add email/phone)
**Developers:** (Add team members)
**Testers:** (Add QA team)

---

## 📅 VERSION HISTORY

- **v0.0.0** - Initial setup with landing page, auth, and basic components (Current)
- **v1.0.0** - MVP: Full feature set with dashboard, profiles, subscription system
- **v2.0.0** - Admin panel and advanced features
- **v3.0.0** - Mobile app launch

---

## 🔗 USEFUL RESOURCES

- **Supabase Docs:** https://supabase.com/docs
- **React 19 Docs:** https://react.dev
- **Vite Docs:** https://vitejs.dev
- **Framer Motion:** https://www.framer.com/motion/
- **Razorpay Docs:** https://razorpay.com/docs/
- **Google Drive API:** https://developers.google.com/drive/api

---

**Last Updated:** March 27, 2026
**Maintained By:** Claude Code
**Next Review:** After major feature completion
