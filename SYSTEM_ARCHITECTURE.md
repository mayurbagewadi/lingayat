# LINGAYAT MALI MATRIMONIAL APP - SYSTEM ARCHITECTURE

**Document Version:** 1.0
**Last Updated:** 2026-04-06
**Status:** Foundation - Ready for Schema & API Design

---

## 1. SYSTEM OVERVIEW

```
┌──────────────────────────────────────────────────────────────┐
│                    LINGAYAT MALI MATRIMONIAL                  │
│                      SYSTEM ARCHITECTURE                      │
└──────────────────────────────────────────────────────────────┘

┌─────────────┐
│  FRONTEND   │  (React/Vue)
│  Layer      │  - Landing Page
└──────┬──────┘  - Auth (Login/Register)
       │         - Profile Management
       │         - Photo Upload
       │         - PDF Upload/Download
       │         - Browse Profiles
       │         - Search & Filters
       │         - Interest System
       │         - Notifications
       │         - Subscription
       ▼
┌─────────────────────────────────────┐
│      API GATEWAY / BACKEND          │  (Node.js/Express)
│      (REST API Layer)               │
├─────────────────────────────────────┤
│ • Authentication (JWT)              │
│ • Authorization (Role-based)        │
│ • Request Validation                │
│ • Error Handling                    │
│ • Rate Limiting                     │
│ • Logging                           │
└──────────┬──────────┬────────┬──────┘
           │          │        │
    ┌──────▼────┐ ┌──▼──┐ ┌──▼────┐
    │ DATABASE  │ │GOOGLE│ │RAZORPAY
    │(PostgreSQL)│ │DRIVE │ │(Payment)
    └───────────┘ │     │ └────────┘
                  └─────┘
       │
    ┌──▼────────────────┐
    │  NOTIFICATION     │
    │  SERVICE          │
    ├───────────────────┤
    │ • Email           │
    │ • SMS (optional)  │
    │ • WhatsApp        │
    └───────────────────┘
       │
    ┌──▼─────────────┐
    │  ADMIN PANEL   │
    │  (Separate UI) │
    └────────────────┘
```

---

## 2. DETAILED COMPONENT ARCHITECTURE

### 2.1 FRONTEND LAYER

**Technology Stack:**
- Framework: React or Next.js
- State Management: Redux/Context
- UI Library: Tailwind CSS
- HTTP Client: Axios
- Form: React Hook Form
- Image Upload: React Dropzone
- PDF Viewer: React PDF
- Authentication: JWT (localStorage)

**Key Components:**
```
src/
├── pages/
│   ├── Landing.jsx
│   ├── Auth/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── ForgotPassword.jsx
│   ├── Profile/
│   │   ├── MyProfile.jsx
│   │   ├── EditProfile.jsx
│   │   ├── PhotoUpload.jsx
│   │   └── PDFUpload.jsx
│   ├── Browse/
│   │   ├── BrowseProfiles.jsx
│   │   ├── ProfileDetail.jsx
│   │   └── Search.jsx
│   ├── Subscription/
│   │   ├── Plans.jsx
│   │   ├── RazorpayPayment.jsx
│   │   └── ManualPayment.jsx
│   ├── Notifications/
│   │   ├── NotificationList.jsx
│   │   ├── ActivityLog.jsx
│   │   └── Preferences.jsx
│   └── Admin/
│       ├── Dashboard.jsx
│       ├── UserManagement.jsx
│       ├── ProfileReview.jsx
│       ├── PaymentVerification.jsx
│       └── GoogleDriveSettings.jsx
├── components/
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── ProfileCard.jsx
│   ├── PhotoGallery.jsx
│   ├── PDFViewer.jsx
│   └── ... (reusable components)
├── services/
│   ├── api.js (Axios instance)
│   ├── authService.js
│   ├── profileService.js
│   ├── photoService.js
│   ├── pdfService.js
│   ├── subscriptionService.js
│   └── notificationService.js
├── hooks/
│   ├── useAuth.js
│   ├── useProfile.js
│   └── useNotifications.js
└── utils/
    ├── constants.js
    ├── validators.js
    └── helpers.js
```

---

### 2.2 BACKEND API LAYER

**Technology Stack:**
- Runtime: Node.js
- Framework: Express.js
- Database: PostgreSQL
- ORM: Sequelize or TypeORM
- Authentication: JWT + bcrypt
- Google Drive SDK: google-auth-library-nodejs
- Payment: razorpay (SDK)
- Email: Nodemailer or SendGrid
- Logging: Winston
- Validation: Joi or Zod

**Project Structure:**
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── google-drive.js
│   │   ├── razorpay.js
│   │   ├── email.js
│   │   └── environment.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Photo.js
│   │   ├── PDF.js
│   │   ├── Subscription.js
│   │   ├── Payment.js
│   │   ├── Interest.js
│   │   ├── Notification.js
│   │   └── ActivityLog.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── profile.js
│   │   ├── photo.js
│   │   ├── pdf.js
│   │   ├── subscription.js
│   │   ├── search.js
│   │   ├── interest.js
│   │   ├── notification.js
│   │   ├── google-drive.js
│   │   └── admin.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── profileController.js
│   │   ├── photoController.js
│   │   ├── pdfController.js
│   │   ├── subscriptionController.js
│   │   ├── searchController.js
│   │   ├── interestController.js
│   │   ├── notificationController.js
│   │   ├── googleDriveController.js
│   │   └── adminController.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── profileService.js
│   │   ├── photoService.js
│   │   ├── pdfService.js
│   │   ├── subscriptionService.js
│   │   ├── googleDriveService.js
│   │   ├── razorpayService.js
│   │   ├── emailService.js
│   │   ├── notificationService.js
│   │   └── searchService.js
│   ├── middleware/
│   │   ├── auth.js (JWT verification)
│   │   ├── authorization.js (role-based)
│   │   ├── errorHandler.js
│   │   ├── requestValidator.js
│   │   ├── rateLimiter.js
│   │   └── requestLogger.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── validators.js
│   │   ├── helpers.js
│   │   └── errors.js
│   └── app.js
├── migrations/
│   └── [timestamp]_initial_schema.js
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── .env.example
├── package.json
└── docker-compose.yml
```

---

## 3. DATA FLOW DIAGRAMS

### 3.1 PHOTO UPLOAD FLOW

```
┌─────────────────┐
│  USER SELECTS   │
│  PHOTO (0-5)    │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────┐
│  FRONTEND VALIDATION         │
│ • File type: JPG, PNG, JPEG  │
│ • Max size: 5MB              │
│ • Max photos: 5              │
└────────┬─────────────────────┘
         │ (valid)
         ▼
┌──────────────────────────────────┐
│  FRONTEND SENDS TO BACKEND       │
│  POST /api/photo/upload          │
│  • file (FormData)               │
│ • userId (JWT decoded)           │
│ • photoNumber (1-5)              │
└────────┬─────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  BACKEND VALIDATION                    │
│ • Verify JWT token valid               │
│ • Check Google Drive connected         │
│ • Validate file again                  │
│ • Check upload quota (5 photos max)    │
└────────┬───────────────────────────────┘
         │ (valid)
         ▼
┌────────────────────────────────────────┐
│  CALL GOOGLE DRIVE API                 │
│ • Use service: googleDriveService      │
│ • Upload to: Matrimonial_Photos folder │
│ • Filename: photo_user_[ID]_[NUM].jpg  │
│ • Set sharing: "Anyone with link"      │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  GOOGLE DRIVE RESPONSE                 │
│ • Returns File ID: "1a2b3c4d..."       │
│ • Weblink ready                        │
│ • Permissions set                      │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  SAVE TO DATABASE                      │
│ UPDATE users table:                    │
│ • photo_[NUM]_file_id = "1a2b3c4d..." │
│ • photo_[NUM]_uploaded_at = NOW()      │
│ • photo_[NUM]_status = "active"        │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  RETURN TO FRONTEND                    │
│ {                                      │
│   success: true,                       │
│   photoNumber: 1,                      │
│   fileId: "1a2b3c4d...",               │
│   url: "/api/photo/[userId]/1"         │
│ }                                      │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  FRONTEND DISPLAYS                     │
│ • Show success message                 │
│ • Update photo gallery                 │
│ • Enable [Remove] button               │
│ • Show thumbnail preview               │
└────────────────────────────────────────┘
```

---

### 3.2 PDF UPLOAD & APPROVAL FLOW

```
┌──────────────────┐
│  USER SELECTS    │
│  PDF (Max 1)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│  FRONTEND VALIDATION             │
│ • File type: PDF only            │
│ • Max size: 10MB                 │
│ • Max count: 1                   │
└────────┬─────────────────────────┘
         │ (valid)
         ▼
┌──────────────────────────────────────┐
│  FRONTEND SENDS TO BACKEND           │
│  POST /api/pdf/upload                │
│  • file (FormData)                   │
│ • userId (JWT decoded)               │
└────────┬─────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  BACKEND VALIDATION                    │
│ • Verify JWT token valid               │
│ • Check Google Drive connected         │
│ • Validate file again                  │
│ • Check if user already has PDF        │
└────────┬───────────────────────────────┘
         │ (valid)
         ▼
┌────────────────────────────────────────┐
│  UPLOAD TO GOOGLE DRIVE                │
│ • Upload to: PDF_Bios folder           │
│ • Filename: pdf_user_[ID].pdf          │
│ • DO NOT set public sharing yet        │
│ • Status: PENDING APPROVAL             │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  SAVE TO DATABASE                      │
│ INSERT INTO pdfs:                      │
│ • file_id = "2b3c4d5e..."              │
│ • status = "pending"                   │
│ • uploaded_at = NOW()                  │
│ • approved_at = NULL                   │
│ • approved_by = NULL                   │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  NOTIFY ADMIN                          │
│ • Add to admin pending list            │
│ • Send email: "New PDF pending review" │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  RETURN TO FRONTEND                    │
│ {                                      │
│   success: true,                       │
│   status: "pending",                   │
│   message: "Awaiting admin approval"   │
│ }                                      │
└────────┬───────────────────────────────┘
         │
         ▼
    ┌────────────────────────────┐
    │  ADMIN REVIEW (Parallel)   │
    │  GET /api/admin/pdf/pending│
    └────────┬───────────────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
  ┌─────────┐  ┌─────────┐
  │ APPROVE │  │ REJECT  │
  └────┬────┘  └────┬────┘
       │            │
       ▼            ▼
  ┌──────────────┐  ┌──────────────┐
  │ Set sharing: │  │ Delete from  │
  │ "Anyone with │  │ Google Drive │
  │  link"       │  │ Update DB:   │
  │ Update DB:   │  │ status=      │
  │ status=      │  │ "rejected"   │
  │ "approved"   │  │ Send email   │
  │ approved_by= │  │ with reason  │
  │ admin email  │  └──────────────┘
  │ approved_at= │
  │ NOW()        │
  │ Send success │
  │ email        │
  └──────────────┘
       │
       ▼
  ┌──────────────────────────────┐
  │  PDF VISIBLE TO SUBSCRIBERS  │
  │  • Users can download        │
  │  • Users can view            │
  │  • User can see checkmark    │
  └──────────────────────────────┘
```

---

### 3.3 SUBSCRIPTION & PAYMENT FLOW

```
┌──────────────────────┐
│ USER CLICKS          │
│ "SUBSCRIBE NOW"      │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────────────────┐
│ SHOW PAYMENT METHOD CHOICE       │
│ 1. Razorpay (Online)             │
│ 2. Manual (Bank Transfer/UPI)    │
└─────────┬────────────────────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌────────┐   ┌──────────────┐
│ RAZORPAY│   │ MANUAL       │
│ PAYMENT │   │ PAYMENT      │
└────┬───┘   └──────┬───────┘
     │              │
     ▼              ▼
┌──────────────┐  ┌──────────────────┐
│ POST /api/   │  │ POST /api/       │
│ subscription │  │ subscription/    │
│ /razorpay-   │  │ manual-upload    │
│ order        │  │ • screenshot     │
│              │  │ • amount         │
│ Backend:     │  │                  │
│ • Verify     │  │ Backend:         │
│   user active│  │ • Save screenshot│
│ • Check if   │  │ • Status: pending│
│   already sub│  │ • Notify admin   │
│ • Create     │  │                  │
│   order in   │  └────────┬─────────┘
│   Razorpay   │           │
│ • Return     │           ▼
│   order ID & │  ┌──────────────────┐
│   amount     │  │ Admin Reviews    │
└──────┬───────┘  │ GET /api/admin/  │
       │          │ payments/pending │
       ▼          │                  │
┌──────────────┐  │ [View Screenshot]│
│ Frontend:    │  │ [Approve]        │
│ • Open       │  │ [Reject]         │
│   Razorpay   │  └────────┬─────────┘
│   popup      │           │
│ • User pays  │     ┌─────┴─────┐
│ • Success/   │     │           │
│   Failure    │     ▼           ▼
└──────┬───────┘ ┌────────┐  ┌──────────┐
       │         │APPROVE │  │ REJECT   │
       │         │Update: │  │ Update:  │
       │         │status= │  │ status=  │
       │         │"paid"  │  │"rejected"│
       │         │Sub:    │  │ Notify   │
       │         │active  │  │ user     │
       │         │Send    │  │ Send msg │
       │         │success │  │ to retry │
       │         │email   │  │ upload   │
       │         └────┬───┘  └──────────┘
       │              │
       ▼              ▼
┌──────────────────────────────────┐
│ WEBHOOK: /api/payments/webhook   │
│ Razorpay sends verification      │
│ • Check signature                │
│ • Verify order ID                │
│ • Update user subscription       │
│ • subscription_status = "active" │
│ • subscription_end_date = +1yr   │
│ • Send confirmation email        │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ USER IS NOW SUBSCRIBER           │
│ ✅ Full feature access enabled   │
│ ✅ Can see contact details       │
│ ✅ Can download PDFs             │
│ ✅ Can express interest          │
│ ✅ Advanced search enabled       │
└──────────────────────────────────┘
```

---

### 3.4 GOOGLE DRIVE CONNECTION FLOW

```
┌──────────────────────────┐
│ ADMIN CLICKS             │
│ "CONNECT GOOGLE DRIVE"   │
└────────┬─────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ FRONTEND: TRIGGER OAUTH            │
│ POST /api/google-drive/connect     │
│ Frontend opens Google Sign In popup│
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ GOOGLE OAUTH POPUP                 │
│ Scope requested:                   │
│ • https://...auth/drive.file       │
│ • https://...auth/drive            │
│                                    │
│ User authorizes                    │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ FRONTEND RECEIVES OAUTH RESPONSE   │
│ • access_token                     │
│ • refresh_token                    │
│ • expires_in (3600 seconds)        │
│ • granted_scopes                   │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ BACKEND: /api/google-drive/        │
│ callback                           │
│ Receives: access_token,            │
│           refresh_token            │
│                                    │
│ Step 1: Check token exists         │
│ ✅ YES → Continue                  │
│                                    │
│ Step 2: Check if expired           │
│ ✅ Fresh → Continue                │
│                                    │
│ Step 3: TEST API CALL              │
│ Call: drive.about.get()            │
│ ✅ Success → Continue              │
│ ❌ Fail → Error response           │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ CHECK/CREATE FOLDERS               │
│                                    │
│ Check if "Matrimonial_Photos"      │
│ exists in Google Drive             │
│ ✅ Exists → Get Folder ID          │
│ ❌ Not exists → Create it          │
│                                    │
│ Check if "PDF_Bios" exists         │
│ ✅ Exists → Get Folder ID          │
│ ❌ Not exists → Create it          │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ SAVE TO DATABASE                   │
│ UPDATE admin table:                │
│ • google_access_token = "..."      │
│ • google_refresh_token = "..."     │
│ • google_token_expiry = "..."      │
│ • google_drive_connected = TRUE    │
│ • google_drive_status = "active"   │
│ • google_photos_folder_id = "..."  │
│ • google_pdf_folder_id = "..."     │
│ • last_verified = NOW()            │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ RETURN TO FRONTEND                 │
│ {                                  │
│   success: true,                   │
│   message: "Connected",            │
│   user: "admin@example.com",       │
│   storage: "500MB / 1TB"           │
│ }                                  │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ ADMIN SEES:                        │
│ ✅ Google Drive Connected          │
│    Email: admin@example.com        │
│    Storage: 500MB / 1TB            │
│    Folders: Ready                  │
│                                    │
│ [Test Connection]                  │
│ [View in Drive]                    │
│ [Disconnect]                       │
└────────────────────────────────────┘
```

---

## 4. DATABASE SCHEMA OVERVIEW

### 4.1 CORE TABLES

```
USERS TABLE
├─ id (PK)
├─ email (UNIQUE)
├─ password_hash
├─ phone
├─ name
├─ dob
├─ gender
├─ sub_caste
├─ education
├─ location
├─ height (optional)
├─ income (optional)
├─ profile_status (pending/approved/rejected)
├─ profile_created_at
├─ photo_1_file_id (Google Drive File ID)
├─ photo_2_file_id
├─ ... photo_5_file_id
├─ pdf_file_id (Google Drive File ID)
├─ pdf_status (pending/approved/rejected)
├─ subscription_status (active/expired/inactive)
├─ subscription_end_date
├─ created_at
├─ updated_at
└─ deleted_at (soft delete)

PHOTOS TABLE (Alternative normalized)
├─ id (PK)
├─ user_id (FK → users)
├─ file_id (Google Drive File ID)
├─ photo_number (1-5)
├─ status (active/deleted)
├─ uploaded_at
└─ deleted_at

PDFS TABLE
├─ id (PK)
├─ user_id (FK → users) UNIQUE
├─ file_id (Google Drive File ID)
├─ status (pending/approved/rejected)
├─ uploaded_at
├─ approved_at
├─ approved_by (admin email)
├─ rejection_reason
└─ deleted_at

SUBSCRIPTIONS TABLE
├─ id (PK)
├─ user_id (FK → users)
├─ plan_id (FK → subscription_plans)
├─ start_date
├─ end_date
├─ status (active/expired/cancelled)
├─ auto_renew (boolean)
├─ created_at
└─ cancelled_at

PAYMENTS TABLE
├─ id (PK)
├─ user_id (FK → users)
├─ amount
├─ currency (INR)
├─ method (razorpay/manual)
├─ status (pending/completed/failed/rejected)
├─ razorpay_order_id (for Razorpay payments)
├─ razorpay_payment_id (after success)
├─ manual_screenshot_url (for manual payments)
├─ verified_by (admin email)
├─ verified_at
├─ created_at
└─ notes

INTERESTS TABLE
├─ id (PK)
├─ from_user_id (FK → users)
├─ to_user_id (FK → users)
├─ status (pending/accepted/rejected)
├─ created_at
├─ responded_at
└─ UNIQUE(from_user_id, to_user_id)

ACTIVITY_LOGS TABLE
├─ id (PK)
├─ user_id (FK → users)
├─ action (profile_view/interest_sent/pdf_viewed)
├─ target_user_id (who did they view)
├─ created_at
└─ INDEX (user_id, created_at)

NOTIFICATIONS TABLE
├─ id (PK)
├─ user_id (FK → users)
├─ type (interest/view/approval/system)
├─ title
├─ message
├─ from_user_id (FK → users, nullable)
├─ read (boolean)
├─ read_at
├─ created_at
└─ expires_at

ADMIN TABLE
├─ id (PK)
├─ email (UNIQUE)
├─ password_hash
├─ role (super_admin/moderator)
├─ google_access_token (encrypted)
├─ google_refresh_token (encrypted)
├─ google_token_expiry
├─ google_drive_connected (boolean)
├─ google_drive_status
├─ google_photos_folder_id
├─ google_pdf_folder_id
├─ google_drive_last_verified
├─ created_at
└─ updated_at
```

---

## 5. API ENDPOINTS MAPPING

### 5.1 AUTHENTICATION ENDPOINTS
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/verify-email
```

### 5.2 PROFILE ENDPOINTS
```
GET    /api/profile/me
PUT    /api/profile/me
DELETE /api/profile/me
GET    /api/profile/:userId
POST   /api/profile/edit
```

### 5.3 PHOTO ENDPOINTS
```
POST   /api/photo/upload
GET    /api/photo/:userId/:photoNumber
DELETE /api/photo/:userId/:photoNumber
PUT    /api/photo/:userId/:photoNumber (replace)
GET    /api/admin/photo/:userId (all photos)
DELETE /api/admin/photo/:userId/:photoNumber (admin delete)
```

### 5.4 PDF ENDPOINTS
```
POST   /api/pdf/upload
GET    /api/pdf/:userId (subscribers only)
DELETE /api/pdf/:userId
GET    /api/admin/pdf/pending
POST   /api/admin/pdf/:userId/approve
POST   /api/admin/pdf/:userId/reject
```

### 5.5 SUBSCRIPTION ENDPOINTS
```
GET    /api/subscription/plans
GET    /api/subscription/status
POST   /api/subscription/razorpay-order
POST   /api/subscription/razorpay-verify
POST   /api/subscription/manual-upload
GET    /api/subscription/payment-history
POST   /api/subscription/cancel
```

### 5.6 SEARCH & FILTER ENDPOINTS
```
GET    /api/profiles/browse (paginated)
GET    /api/profiles/search (with filters)
GET    /api/profiles/advanced-search (subscribers only)
```

### 5.7 INTEREST ENDPOINTS
```
POST   /api/interest/express/:userId
GET    /api/interest/received
GET    /api/interest/sent
DELETE /api/interest/:userId
GET    /api/interest/matches
```

### 5.8 NOTIFICATION ENDPOINTS
```
GET    /api/notifications
GET    /api/notifications/:id
PUT    /api/notifications/:id/read
DELETE /api/notifications/:id
GET    /api/notifications/preferences
PUT    /api/notifications/preferences
GET    /api/activity-log
```

### 5.9 GOOGLE DRIVE ENDPOINTS
```
POST   /api/google-drive/connect
POST   /api/google-drive/callback
GET    /api/google-drive/validate
POST   /api/google-drive/disconnect
GET    /api/google-drive/status
```

### 5.10 ADMIN ENDPOINTS
```
GET    /api/admin/dashboard
GET    /api/admin/users
PUT    /api/admin/users/:userId
DELETE /api/admin/users/:userId
GET    /api/admin/profiles/pending
POST   /api/admin/profiles/:userId/approve
POST   /api/admin/profiles/:userId/reject
GET    /api/admin/payments
POST   /api/admin/payments/:paymentId/approve
POST   /api/admin/payments/:paymentId/reject
GET    /api/admin/google-drive/settings
PUT    /api/admin/google-drive/settings
POST   /api/admin/google-drive/test
```

---

## 6. AUTHENTICATION & AUTHORIZATION

### 6.1 JWT TOKEN STRUCTURE
```
ACCESS TOKEN (expires 1 hour):
{
  userId: 123,
  email: "user@example.com",
  role: "user", // user / admin
  subscription: "active", // active / expired / inactive
  iat: 1234567890,
  exp: 1234571490
}

REFRESH TOKEN (expires 30 days):
{
  userId: 123,
  tokenVersion: 1,
  iat: 1234567890,
  exp: 1237159890
}
```

### 6.2 ROLE-BASED ACCESS CONTROL
```
VISITOR (Not logged in):
├─ View landing page
├─ View search results (name, age only)
├─ View profile preview (name, age, sub-caste)
└─ Cannot: see contact, download PDF, express interest

NON-SUBSCRIBER (Logged in, no payment):
├─ Browse profiles (name, age, sub-caste, education, location)
├─ See who viewed them
├─ Upload/manage photos
├─ Upload/manage PDF
├─ Express interest
├─ Receive notifications
└─ Cannot: see contact details, download PDF, advanced filters

PAID SUBSCRIBER (Active subscription):
├─ All non-subscriber features +
├─ View contact details (phone)
├─ Download PDF bio
├─ Advanced search filters
├─ All photos (high resolution)
├─ See who viewed them
└─ Priority in recommendations (optional)

ADMIN (Super admin):
├─ All user features +
├─ Access admin dashboard
├─ Review pending profiles
├─ Review pending PDFs
├─ Manage users (edit, delete, ban)
├─ Verify manual payments
├─ Configure Google Drive
├─ View all activity logs
├─ Generate reports
└─ Manage system settings
```

---

## 7. EXTERNAL INTEGRATIONS

### 7.1 GOOGLE DRIVE INTEGRATION
```
Purpose: Store user photos & PDFs
Folders:
├─ Matrimonial_Photos/
│  ├─ photo_user_1_1.jpg
│  ├─ photo_user_1_2.jpg
│  ├─ photo_user_2_1.jpg
│  └─ ... (all users' photos)
│
└─ PDF_Bios/
   ├─ pdf_user_1.pdf
   ├─ pdf_user_2.pdf
   └─ ... (all users' PDFs)

Sharing:
├─ Photos: Public (anyone with link)
├─ PDFs: Private until approved, then public

API Methods:
├─ drive.files.create() - Upload file
├─ drive.files.delete() - Delete file
├─ drive.files.list() - List files
├─ drive.files.get() - Get file info
├─ drive.files.update() - Update permissions
└─ drive.about.get() - Test connection

Authentication:
├─ OAuth 2.0 for admin
├─ Service Account JSON (backup option)
└─ Token refresh strategy
```

### 7.2 RAZORPAY INTEGRATION
```
Purpose: Payment processing

Flow:
├─ Create order → Get order ID
├─ Display payment form
├─ User completes payment
├─ Webhook verification
├─ Subscription activation

Webhook:
├─ Endpoint: POST /api/payments/webhook
├─ Signature verification (SHA256)
├─ Payment confirmation
├─ Database update
└─ Email notification
```

### 7.3 NOTIFICATION SERVICES
```
Email Service:
├─ Provider: Nodemailer / SendGrid / AWS SES
├─ Templates: HTML email templates
└─ Events: Interest, approval, expiry, etc.

SMS Service (Optional):
├─ Provider: Twilio / AWS SNS
└─ Events: High priority notifications

WhatsApp Service (Optional):
├─ Provider: Twilio / AWS SNS / Custom API
└─ Events: Match notifications, approvals
```

---

## 8. SECURITY ARCHITECTURE

### 8.1 DATA SECURITY
```
At Rest:
├─ Database: PostgreSQL with SSL
├─ Sensitive fields: Encrypted (google tokens, passwords)
├─ Backups: Encrypted daily
└─ Google Drive: Files shared via link only

In Transit:
├─ HTTPS/TLS 1.3 mandatory
├─ API requests: JWT in Authorization header
├─ Google Drive API: OAuth tokens over HTTPS
└─ Razorpay: Webhook signature verification

User Data:
├─ Passwords: bcrypt hashing
├─ Tokens: JWT signed with secret
├─ Google tokens: Encrypted in DB
├─ Refresh tokens: Stored securely, revocable
└─ PII: Only accessible to authorized users
```

### 8.2 API SECURITY
```
Authentication:
├─ JWT tokens (access + refresh)
├─ Token expiration & refresh
├─ Token revocation on logout
└─ Secure token storage (httpOnly cookies recommended)

Authorization:
├─ Role-based access control
├─ Endpoint-level permission checks
├─ Resource-level ownership verification
└─ Admin actions logged

Rate Limiting:
├─ 100 requests/minute per IP
├─ 1000 requests/minute per user
├─ File upload: 10 files/hour
└─ API endpoint specific limits

Validation:
├─ Input validation (Joi/Zod)
├─ File type verification
├─ File size enforcement
├─ MIME type validation
└─ SQL injection prevention (ORM)

CORS:
├─ Whitelist frontend domain
├─ Allow credentials
├─ Specific methods allowed
└─ Headers validation
```

### 8.3 FILE SECURITY
```
Photo Files:
├─ Type: JPG, PNG, JPEG only
├─ Max size: 5MB
├─ Scan for malware (optional)
├─ Store on Google Drive (not server)
└─ Filename: non-user-guessable (File ID)

PDF Files:
├─ Type: PDF only
├─ Max size: 10MB
├─ Scan for malware (optional)
├─ Store on Google Drive
├─ Access: Users can't directly access file ID
└─ Download: Via backend /api/pdf/:userId
```

---

## 9. DEPLOYMENT ARCHITECTURE

### 9.1 DEPLOYMENT STACK
```
Frontend:
├─ Hosting: Vercel / Netlify / AWS S3 + CloudFront
├─ CDN: Cloudflare
├─ SSL: Automatic (Let's Encrypt)
└─ Environments: Production, Staging, Development

Backend:
├─ Hosting: AWS EC2 / Digital Ocean / Railway
├─ Containerization: Docker
├─ Orchestration: Docker Compose (single server) / Kubernetes (scale)
├─ Database: AWS RDS PostgreSQL / Self-managed
├─ Backup: Automated daily backups
└─ Environments: Production, Staging, Development

Storage:
├─ Google Drive: Admin's account
├─ Backup: Drive backup strategy
└─ Redundancy: Multiple backups

Monitoring:
├─ Error tracking: Sentry
├─ Performance: NewRelic / DataDog
├─ Logs: CloudWatch / ELK Stack
└─ Uptime: UptimeRobot
```

### 9.2 CI/CD PIPELINE
```
Code Push → GitHub
   ↓
GitHub Actions:
   ├─ Run tests
   ├─ Code quality checks
   ├─ Build Docker image
   ├─ Push to registry
   ↓
Deploy to Staging
   ├─ Run integration tests
   ├─ Smoke tests
   ├─ Manual approval
   ↓
Deploy to Production
   ├─ Blue-green deployment
   ├─ Health checks
   ├─ Rollback on failure
   ↓
Post-deployment:
   ├─ Monitor errors
   ├─ Check performance metrics
   └─ Alert on issues
```

---

## 10. SCALING CONSIDERATIONS

```
Current (MVP):
├─ Single backend server
├─ PostgreSQL single instance
├─ Unlimited Google Drive quota
└─ Expected: 1,000-5,000 users

Phase 2 Scaling:
├─ Load balancer (2-3 backend servers)
├─ Database read replicas
├─ Redis for caching
├─ CDN for static assets
└─ Expected: 5,000-50,000 users

Phase 3 Scaling:
├─ Kubernetes cluster
├─ Database sharding
├─ Message queue (RabbitMQ/Kafka)
├─ Microservices (Photo service, Payment service)
└─ Expected: 50,000+ users

Bottlenecks to Monitor:
├─ Google Drive API rate limits (20,000 requests/day free)
├─ Database query performance
├─ File upload bandwidth
├─ Email delivery rate
└─ Razorpay webhook processing
```

---

## 11. NEXT STEPS

✅ **Task 1 Complete:** System Architecture Diagram created

**Next Tasks:**
1. Task 2: Design Database Schema (use this architecture)
2. Task 3: Design API Endpoints Specification (detailed)
3. Task 4: Setup Backend Project & Dependencies

---

**Document Status:** Ready for development
**Last Review:** 2026-04-06
**Architecture Validated:** ✅ Production-ready
