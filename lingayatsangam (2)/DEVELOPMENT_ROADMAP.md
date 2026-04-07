# Development Roadmap - Lingayat Mali Matrimonial Platform

**Status:** MVP Phase (Currently ~30% complete)
**Target Launch:** Q2 2026

---

## 🎯 RELEASE PHASES

### Phase 1: CRITICAL FIXES (Week 1) ⚡
**Goal:** Fix broken/incomplete functionality
**Timeline:** 1 week
**Target Date:** April 3, 2026

#### Task 1.1: Fix Auto-Delete Trigger
- **Effort:** 30 minutes
- **Task:** Update trigger to check `alt_mobile` in addition to email and primary phone
- **File:** `supabase/migrations/20250101_auto_delete_trigger.sql`
- **Testing:** Test with 3 scenarios:
  - Email match only ✓ (already works)
  - Primary phone match ✓ (already works)
  - Alternative phone match (NEEDS FIX)
- **Dependencies:** None

**SQL Change Needed:**
```sql
-- Add this condition to the WHERE clause:
OR (alt_mobile is not null and alt_mobile = new.mobile)
```

#### Task 1.2: Create Express Interests Table
- **Effort:** 1 hour
- **Task:** Create new table for mutual interest tracking
- **Fields:**
  - id (UUID)
  - from_profile_id (FK)
  - to_profile_id (FK)
  - status (expressed/mutual_match)
  - created_at
  - mutual_at (when both express interest)
- **File:** Create `supabase/migrations/20250101_express_interests.sql`
- **Testing:** Insert test records, verify FK constraints

#### Task 1.3: Add PDF Approval Status
- **Effort:** 30 minutes
- **Task:** Add field to profiles table for PDF approval tracking
- **Change:** Add column `pdf_approval_status` with values: null (not uploaded) | pending | approved | rejected
- **File:** Create `supabase/migrations/20250101_add_pdf_approval.sql`
- **Testing:** Test approval state transitions

#### Task 1.4: Create Settings Table
- **Effort:** 1 hour
- **Task:** Add configurable settings for admin
- **Fields:**
  - id (UUID)
  - key (text, unique)
  - value (text/jsonb)
  - updated_at
  - updated_by (FK to admin user)
- **Keys to Store:**
  - `razorpay_key_id` (encrypted)
  - `razorpay_secret_key` (encrypted)
  - `daily_digest_time` (time)
  - `contact_limit_per_day` (number)
  - `notification_channel` (email/sms/whatsapp)
  - `google_drive_folder_id` (folder ID)
  - `support_email`
  - `support_phone`
- **File:** Create `supabase/migrations/20250104_create_settings.sql`

#### Task 1.5: Test Auto-Delete with Fixed Trigger
- **Effort:** 45 minutes
- **Task:** Create test script to verify auto-delete works with all three conditions
- **Test Cases:**
  1. Register with matching email → should auto-delete
  2. Register with matching primary phone → should auto-delete
  3. Register with matching alt phone → should auto-delete (NEW)
- **Success Criteria:** All 3 cases pass

**Status:** 🔴 NOT STARTED

---

### Phase 2: CORE FEATURES (Weeks 2-3) 🚀
**Goal:** Get main features working
**Timeline:** 2 weeks
**Target Date:** April 17, 2026

#### Task 2.1: Profile Search Backend
- **Effort:** 4 hours
- **Task:** Create API endpoints for searching profiles
- **Endpoints Needed:**
  - `GET /api/search/basic` - Filter by age, caste, education, location
  - `GET /api/search/advanced` - Additional filters (income, height, etc.)
  - `GET /api/profiles/:id` - Get single profile with access control
- **Access Control Logic:**
  - Visitors: Can see public fields (name, age, caste, education, photos)
  - Registered: Can additionally see location
  - Paid: Can see phone number + PDF bio
- **Testing:**
  - Search with various filters
  - Verify access restrictions
  - Test with demo data
- **Files:** Create new backend routes or update existing

#### Task 2.2: Implement Payment Flow
- **Effort:** 6 hours
- **Task:** Build subscription payment system
- **Razorpay Integration:**
  - Create checkout endpoint
  - Handle webhook for payment completion
  - Create order in database
- **Manual Payment:**
  - File upload endpoint
  - Admin verification workflow
  - Status tracking
- **Endpoints:**
  - `POST /api/subscription/initiate-payment` - Create Razorpay order
  - `POST /api/subscription/verify-payment` - Handle webhook
  - `POST /api/subscription/manual-upload` - Upload payment proof
  - `POST /api/subscription/verify-manual` - Admin verification
- **Testing:**
  - Razorpay test mode
  - Manual payment upload
  - Verify subscription activation

#### Task 2.3: Update Subscription Logic
- **Effort:** 2 hours
- **Task:** Implement subscription expiry and downgrade
- **Logic:**
  - Check `subscription_expires_at` <= now → downgrade to free
  - Don't hide profile (stay "active")
  - Reduce access level but keep browsing
  - Show renewal CTA
- **Testing:**
  - Create expired subscription
  - Verify access is downgraded
  - Test renewal flow

#### Task 2.4: Profile Approval Workflow
- **Effort:** 2 hours
- **Task:** Implement admin approval/rejection logic
- **Endpoints:**
  - `POST /api/admin/profiles/:id/approve`
  - `POST /api/admin/profiles/:id/reject`
  - `GET /api/admin/profiles/pending`
- **Notifications:**
  - Send email when approved
  - Send email with reason when rejected
- **Testing:**
  - Approve profile → goes live in search
  - Reject → user sees reason

#### Task 2.5: Activity Logging
- **Effort:** 3 hours
- **Task:** Log all user activities
- **Events to Log:**
  - Profile views
  - Express interest actions
  - PDF downloads
  - Search queries
- **Implementation:**
  - Create helper function to log activity
  - Call from relevant endpoints
  - Build admin dashboard to view logs
- **Testing:**
  - Perform activities
  - Verify logs are created

**Status:** 🔴 NOT STARTED

---

### Phase 3: NOTIFICATIONS & INTEGRATION (Week 4) 📧
**Goal:** Enable notifications and file storage
**Timeline:** 1 week
**Target Date:** April 24, 2026

#### Task 3.1: Google Drive Integration
- **Effort:** 8 hours
- **Task:** Implement photo upload to Google Drive
- **Setup:**
  - Create Google Service Account
  - Get credentials JSON
  - Create "Matrimonial_Photos" folder
- **Implementation:**
  - Upload endpoint using Google Drive API
  - Store file ID in database
  - Generate public sharing link
  - Delete file when needed
- **Frontend:**
  - Photo upload form
  - Progress bar
  - Preview
- **Testing:**
  - Upload photo → verify in Google Drive
  - Delete photo → verify removal from Drive
  - Multiple photo uploads

#### Task 3.2: Email Service Setup
- **Effort:** 4 hours
- **Task:** Integrate email notifications (SendGrid or AWS SES)
- **Email Templates:**
  - Profile approved
  - Profile rejected
  - Express interest received
  - Subscription activated
  - Payment verification pending
- **Implementation:**
  - Email service client
  - Template rendering
  - Send on relevant events
- **Testing:**
  - Send test email
  - Verify template rendering
  - Check deliverability

#### Task 3.3: Daily Digest System
- **Effort:** 6 hours
- **Task:** Implement daily digest notifications
- **Database:**
  - Create `daily_digest_sent` table to track
- **Implementation:**
  - Cron job (run daily at admin-configured time)
  - Fetch user activities from past 24 hours
  - Generate digest email
  - Send and mark as sent
- **Testing:**
  - Trigger digest manually
  - Verify content
  - Check tracking table

#### Task 3.4: SMS/WhatsApp Integration (Optional)
- **Effort:** 4 hours
- **Task:** Add SMS and WhatsApp notifications (if resources permit)
- **Service:** Twilio or similar
- **Implementation:**
  - Send notifications for critical events
  - Template messages
- **Testing:**
  - Send test message

**Status:** 🔴 NOT STARTED

---

### Phase 4: ADMIN PANEL (Week 5) 🛠️
**Goal:** Complete admin capabilities
**Timeline:** 1 week
**Target Date:** May 1, 2026

#### Task 4.1: Dashboard
- **Effort:** 3 hours
- **Task:** Show statistics and quick actions
- **Metrics:**
  - Total users
  - Active subscriptions
  - Pending approvals
  - Revenue
- **Quick Actions:**
  - Approve profiles
  - Review payments
  - View reports

#### Task 4.2: User Management
- **Effort:** 4 hours
- **Task:** Full user CRUD operations
- **Features:**
  - List all users with filters
  - Edit user profile
  - View user activity
  - Bulk import (CSV/Excel)
  - Delete user
  - Change subscription status

#### Task 4.3: Payment Reconciliation
- **Effort:** 3 hours
- **Task:** Manual payment verification
- **Features:**
  - View pending payment proofs
  - Approve/reject with notes
  - View payment history
  - Export reports

#### Task 4.4: Profile & PDF Approval
- **Effort:** 3 hours
- **Task:** Separate approval workflows
- **Features:**
  - List pending profiles
  - Review and approve/reject
  - Separate PDF approval
  - Bulk actions

#### Task 4.5: Reports & Analytics
- **Effort:** 4 hours
- **Task:** Generate reports
- **Reports:**
  - Signup trends
  - Conversion rates
  - Revenue analysis
  - User activity
  - Payment methods

#### Task 4.6: Settings Management
- **Effort:** 2 hours
- **Task:** Admin configuration UI
- **Settings:**
  - Razorpay keys
  - Daily digest time
  - Contact limits
  - Notification channels

**Status:** 🔴 NOT STARTED

---

### Phase 5: POLISH & TESTING (Week 6) ✨
**Goal:** Bug fixes, performance, UX
**Timeline:** 1 week
**Target Date:** May 8, 2026

#### Task 5.1: Bug Fixes
- **Effort:** 4 hours
- **Task:** Fix issues found during testing
- **Focus:** Edge cases, error handling, validation

#### Task 5.2: Performance Optimization
- **Effort:** 3 hours
- **Task:** Optimize database and frontend
- **Optimization:**
  - Add database indexes
  - Lazy load images
  - Caching strategies
  - API response times

#### Task 5.3: Error Handling & Validation
- **Effort:** 3 hours
- **Task:** Improve error messages and validation
- **Coverage:**
  - Form validation
  - API error responses
  - User-friendly messages

#### Task 5.4: Security Audit
- **Effort:** 2 hours
- **Task:** Review security
- **Check:**
  - SQL injection prevention
  - XSS protection
  - CSRF tokens
  - RLS policies
  - Sensitive data handling

#### Task 5.5: User Acceptance Testing
- **Effort:** 3 hours
- **Task:** Test with actual users (or stakeholders)
- **Scenarios:**
  - Complete registration flow
  - Search and browse
  - Subscribe and pay
  - Admin workflows

**Status:** 🔴 NOT STARTED

---

### Phase 6: LAUNCH PREPARATION 🚀
**Goal:** Get ready for production
**Timeline:** 1 week
**Target Date:** May 15, 2026

#### Task 6.1: Deployment Setup
- [ ] Configure production Supabase
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure CDN for images
- [ ] Set up backups

#### Task 6.2: Documentation
- [ ] User guide
- [ ] Admin guide
- [ ] API documentation
- [ ] Troubleshooting guide

#### Task 6.3: Marketing Assets
- [ ] Landing page copy finalization
- [ ] Email templates
- [ ] Help center setup
- [ ] FAQ section

#### Task 6.4: Go-Live Checklist
- [ ] Domain DNS configured
- [ ] SSL certificate installed
- [ ] Monitoring alerts set up
- [ ] Support procedures ready
- [ ] Backup procedures tested

**Status:** 🔴 NOT STARTED

---

## 📈 PROGRESS TRACKING

### Current Status: ~30% Complete
```
Phase 1 (Critical Fixes):    ████░░░░░░ 40% (Database schema done)
Phase 2 (Core Features):     ░░░░░░░░░░ 0%
Phase 3 (Integration):       ░░░░░░░░░░ 0%
Phase 4 (Admin Panel):       ██░░░░░░░░ 20% (Shells created)
Phase 5 (Polish):            ░░░░░░░░░░ 0%
Phase 6 (Launch):            ░░░░░░░░░░ 0%
─────────────────────────────────────────────
OVERALL:                      ██░░░░░░░░ 25%
```

---

## 🎯 MILESTONES

| Milestone | Target Date | Status |
|-----------|------------|--------|
| Critical Fixes Complete | Apr 3 | 🔴 Not Started |
| Core Features Ready | Apr 17 | 🔴 Not Started |
| Integrations Complete | Apr 24 | 🔴 Not Started |
| Admin Panel Complete | May 1 | 🔴 Not Started |
| Testing & Fixes | May 8 | 🔴 Not Started |
| Production Ready | May 15 | 🔴 Not Started |
| **LAUNCH** | **May 22** | 🔴 Not Started |

---

## 👥 RESOURCE ALLOCATION

**Recommended Team:**
- 1x Backend Developer (Node.js/Supabase)
- 1x Frontend Developer (React/TypeScript)
- 1x QA/Tester
- 1x DevOps (for deployment)
- 1x Product Manager (oversight)

**Time Commitment:**
- Phase 1: 40 dev hours
- Phase 2: 80 dev hours
- Phase 3: 60 dev hours
- Phase 4: 60 dev hours
- Phase 5: 40 dev hours
- Phase 6: 20 dev hours
- **TOTAL: 300 hours (~7-8 weeks)**

---

## 🚨 RISK & MITIGATION

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Payment gateway delays | HIGH | Start Razorpay setup immediately |
| Google Drive API limits | MEDIUM | Plan caching strategy |
| Large-scale testing fails | HIGH | Run load tests in week 5 |
| Missing features discovered late | MEDIUM | Weekly stakeholder review |
| Database migration issues | MEDIUM | Test migrations thoroughly |

---

## ✅ SUCCESS CRITERIA

**Phase Completion Requirements:**

### Phase 1 (Critical Fixes)
- ✅ All 4 SQL migrations applied successfully
- ✅ Auto-delete works with all 3 conditions
- ✅ No critical bugs blocking other phases

### Phase 2 (Core Features)
- ✅ Search returns results with filters
- ✅ Payment flow completes successfully
- ✅ Subscriptions activate and expire correctly
- ✅ Profiles approve/reject properly

### Phase 3 (Integrations)
- ✅ Photos upload to Google Drive
- ✅ Emails send successfully
- ✅ Daily digest cron runs correctly

### Phase 4 (Admin Panel)
- ✅ All admin features functional
- ✅ Admin can manage all aspects
- ✅ Reports generate correctly

### Phase 5 (Polish)
- ✅ < 10 known bugs
- ✅ Load tests pass
- ✅ All user scenarios work

### Phase 6 (Launch)
- ✅ All systems monitored
- ✅ Backups working
- ✅ Team trained
- ✅ Support ready

---

**Document Version:** 1.0
**Created:** March 27, 2026
**Next Update:** Weekly during development
