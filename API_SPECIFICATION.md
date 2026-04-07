# LINGAYAT MALI MATRIMONIAL APP - API SPECIFICATION

**Version:** 1.0
**Last Updated:** 2026-04-06
**Status:** Ready for implementation
**Base URL:** `https://api.matrimonial.local` (production)

---

## API OVERVIEW

```
Total Endpoints: 45+
Authentication: JWT (Bearer tokens)
Response Format: JSON
Rate Limiting: 100 req/min per IP, 1000 req/min per user
CORS: Enabled for frontend domain
SSL/TLS: Required (HTTPS only)
```

---

## AUTHENTICATION HEADER

All authenticated endpoints require:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## RESPONSE FORMAT

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "INVALID_EMAIL",
    "message": "Email already exists",
    "details": { ... }
  },
  "timestamp": "2026-04-06T10:30:00Z"
}
```

---

## 1. AUTHENTICATION ENDPOINTS

### 1.1 Register User
```
POST /api/auth/register
```

**Description:** Create new user account

**Auth Required:** No

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "phone": "+919876543210",
  "name": "John Doe",
  "dob": "1995-05-15",
  "gender": "Male",
  "sub_caste": "Panchamasali",
  "education": "B.Tech",
  "location": "Bangalore",
  "profile_for": "Self"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "profile_status": "pending",
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Account created successfully. Please wait for admin approval."
}
```

**Error Codes:**
- `INVALID_EMAIL` (400) - Email format invalid or already exists
- `WEAK_PASSWORD` (400) - Password doesn't meet requirements
- `INVALID_AGE` (400) - User must be 18+
- `VALIDATION_ERROR` (400) - Missing required fields

**Rate Limit:** 5 requests per hour per IP

---

### 1.2 Login
```
POST /api/auth/login
```

**Description:** Authenticate user and get tokens

**Auth Required:** No

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "subscription_status": "active",
    "profile_status": "approved",
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600
  }
}
```

**Error Codes:**
- `INVALID_CREDENTIALS` (401) - Email or password incorrect
- `ACCOUNT_NOT_FOUND` (404) - Email not registered
- `ACCOUNT_DELETED` (403) - Account has been deleted

---

### 1.3 Refresh Token
```
POST /api/auth/refresh-token
```

**Description:** Get new access token using refresh token

**Auth Required:** No (Refresh token in body)

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600
  }
}
```

**Error Codes:**
- `INVALID_REFRESH_TOKEN` (401) - Token invalid or expired
- `TOKEN_REVOKED` (401) - Token has been revoked

---

### 1.4 Logout
```
POST /api/auth/logout
```

**Description:** Logout user and revoke tokens

**Auth Required:** Yes

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 1.5 Forgot Password
```
POST /api/auth/forgot-password
```

**Description:** Send password reset link to email

**Auth Required:** No

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

**Rate Limit:** 3 requests per hour per email

---

### 1.6 Reset Password
```
POST /api/auth/reset-password
```

**Description:** Reset password using token from email

**Auth Required:** No

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "new_password": "NewSecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Codes:**
- `INVALID_TOKEN` (400) - Token invalid or expired
- `TOKEN_EXPIRED` (400) - Reset link expired (24 hours)

---

## 2. PROFILE ENDPOINTS

### 2.1 Get My Profile
```
GET /api/profile/me
```

**Description:** Get current user's full profile

**Auth Required:** Yes

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "dob": "1995-05-15",
    "age": 28,
    "gender": "Male",
    "sub_caste": "Panchamasali",
    "education": "B.Tech",
    "location": "Bangalore",
    "height": "5.8",
    "income": "8-10 LPA",
    "profile_status": "approved",
    "profile_created_at": "2026-04-01T10:30:00Z",
    "profile_approved_at": "2026-04-03T14:20:00Z",
    "subscription_status": "active",
    "subscription_end_date": "2027-04-06",
    "photos": [
      {
        "number": 1,
        "url": "/api/photo/123/1",
        "uploaded_at": "2026-04-02T10:30:00Z"
      }
    ],
    "pdf": {
      "status": "approved",
      "url": "/api/pdf/123",
      "approved_at": "2026-04-03T14:20:00Z"
    }
  }
}
```

---

### 2.2 Update Profile
```
PUT /api/profile/me
```

**Description:** Update user profile information

**Auth Required:** Yes

**Request Body:** (All fields optional)
```json
{
  "name": "John Doe",
  "education": "MBA",
  "location": "Mumbai",
  "height": "5.10",
  "income": "10-15 LPA",
  "notify_email": true,
  "notify_sms": false,
  "notify_whatsapp": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": { ... updated profile ... }
}
```

**Error Codes:**
- `PROFILE_REJECTED` (403) - Cannot edit rejected profile
- `PROFILE_PENDING_APPROVAL` (403) - Wait for admin approval before editing

---

### 2.3 Delete Account
```
DELETE /api/profile/me
```

**Description:** Permanently delete user account and all data

**Auth Required:** Yes

**Request Body:**
```json
{
  "confirmation": "DELETE_MY_ACCOUNT",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Account deleted successfully. Your photos and PDFs have been removed."
}
```

**Side Effects:**
- All photos deleted from Google Drive
- PDF deleted from Google Drive
- User record soft-deleted (data retained for legal compliance)
- All interests & activity logs removed
- Subscriptions cancelled

---

### 2.4 View Other User Profile
```
GET /api/profile/:userId
```

**Description:** View another user's profile

**Auth Required:** Yes

**Access Control:**
- Non-subscribers see: name, age, sub_caste only
- Subscribers see: all except contact details
- Mutual interests see: all including contact details

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "name": "Jane Doe",
    "age": 26,
    "sub_caste": "Panchamasali",
    "education": "B.Tech",
    "location": "Bangalore",
    "photos": [
      { "number": 1, "url": "/api/photo/456/1" },
      { "number": 2, "url": "/api/photo/456/2" }
    ],
    "pdf": { "status": "approved", "url": "/api/pdf/456" },
    "phone": "9876543210",  // Only if subscriber or mutual interest
    "viewed_by_me": true,
    "interest_from_me": "pending",
    "interest_to_me": null
  }
}
```

**Error Codes:**
- `PROFILE_BLOCKED` (403) - User has blocked this profile
- `PROFILE_NOT_FOUND` (404) - User doesn't exist or deleted

---

## 3. PHOTO ENDPOINTS

### 3.1 Upload Photos
```
POST /api/photo/upload
```

**Description:** Upload profile photos (0-5 max)

**Auth Required:** Yes

**Request:** (FormData)
```
file: <binary photo data>
photo_number: 1-5 (optional, auto-assign if not provided)
```

**Constraints:**
- File type: JPG, PNG, JPEG only
- Max size: 5MB per photo
- Max count: 5 photos per user

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "photo_number": 1,
    "file_id": "1a2b3c4d5e6f7g8h...",
    "url": "/api/photo/123/1",
    "uploaded_at": "2026-04-06T10:30:00Z"
  }
}
```

**Error Codes:**
- `INVALID_FILE_TYPE` (400) - Only JPG/PNG/JPEG allowed
- `FILE_TOO_LARGE` (400) - File exceeds 5MB
- `MAX_PHOTOS_REACHED` (400) - User already has 5 photos
- `GOOGLE_DRIVE_NOT_CONNECTED` (500) - Admin hasn't connected Google Drive

**Rate Limit:** 10 uploads per hour

---

### 3.2 Get Photo
```
GET /api/photo/:userId/:photoNumber
```

**Description:** Get photo URL (displays directly from Google Drive)

**Auth Required:** No (but access control applied)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "url": "https://drive.google.com/uc?id=1a2b3c4d5e6f7g8h...",
    "quality": "high", // or "standard" for non-subscribers
    "photo_number": 1
  }
}
```

---

### 3.3 Delete Photo
```
DELETE /api/photo/:userId/:photoNumber
```

**Description:** Delete a specific photo

**Auth Required:** Yes (own photo only)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Photo deleted successfully"
}
```

**Side Effects:**
- Photo deleted from Google Drive immediately
- File ID removed from database

---

### 3.4 Replace Photo
```
PUT /api/photo/:userId/:photoNumber
```

**Description:** Replace existing photo with new one

**Auth Required:** Yes

**Request:** (FormData)
```
file: <binary photo data>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": { ... new photo info ... }
}
```

---

### 3.5 Admin: View All Photos (Admin Only)
```
GET /api/admin/photo/:userId
```

**Description:** Admin view all photos of a user

**Auth Required:** Yes (admin only)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    { "number": 1, "file_id": "1a2b...", "url": "...", "uploaded_at": "..." },
    { "number": 2, "file_id": "2b3c...", "url": "...", "uploaded_at": "..." }
  ]
}
```

---

### 3.6 Admin: Delete Photo (Admin Only)
```
DELETE /api/admin/photo/:userId/:photoNumber
```

**Description:** Admin delete inappropriate photo

**Auth Required:** Yes (admin only)

**Request Body:**
```json
{
  "reason": "Inappropriate content detected"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Photo deleted. User will be notified."
}
```

**Side Effects:**
- Photo deleted from Google Drive
- User receives notification

---

## 4. PDF ENDPOINTS

### 4.1 Upload PDF
```
POST /api/pdf/upload
```

**Description:** Upload bio PDF (max 1)

**Auth Required:** Yes

**Request:** (FormData)
```
file: <binary PDF data>
```

**Constraints:**
- File type: PDF only
- Max size: 10MB
- Max count: 1 PDF per user (replaces old one)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "file_id": "2b3c4d5e6f7g8h...",
    "status": "pending",
    "uploaded_at": "2026-04-06T10:30:00Z",
    "message": "PDF submitted for admin approval"
  }
}
```

**Error Codes:**
- `INVALID_FILE_TYPE` (400) - Only PDF allowed
- `FILE_TOO_LARGE` (400) - File exceeds 10MB
- `GOOGLE_DRIVE_NOT_CONNECTED` (500) - Admin hasn't connected Google Drive

---

### 4.2 Get PDF (Subscribers Only)
```
GET /api/pdf/:userId
```

**Description:** Download user's bio PDF (subscribers only)

**Auth Required:** Yes (must be subscriber)

**Response (200 OK):**
```
Content-Type: application/pdf
[PDF binary content]
```

**Error Codes:**
- `SUBSCRIPTION_REQUIRED` (403) - User not subscribed
- `PDF_NOT_APPROVED` (404) - PDF not approved yet
- `PDF_NOT_FOUND` (404) - User hasn't uploaded PDF

---

### 4.3 Admin: Approve PDF
```
POST /api/admin/pdf/:userId/approve
```

**Description:** Admin approve pending PDF

**Auth Required:** Yes (admin only)

**Request Body:**
```json
{
  "notes": "Approved - content appropriate"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "PDF approved. User will be notified."
}
```

**Side Effects:**
- PDF status changed to "approved"
- Public sharing enabled in Google Drive
- User receives notification email
- PDF visible to all subscribers

---

### 4.4 Admin: Reject PDF
```
POST /api/admin/pdf/:userId/reject
```

**Description:** Admin reject PDF and request reupload

**Auth Required:** Yes (admin only)

**Request Body:**
```json
{
  "reason": "Content contains offensive material"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "PDF rejected. User will be asked to reupload."
}
```

**Side Effects:**
- PDF deleted from Google Drive
- User receives rejection email with reason
- User can reupload PDF

---

### 4.5 Admin: View Pending PDFs
```
GET /api/admin/pdf/pending
```

**Description:** List all PDFs pending approval

**Auth Required:** Yes (admin only)

**Query Params:**
```
page: 1
limit: 20
sort: -uploaded_at
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "items": [
      {
        "id": 1,
        "user_id": 123,
        "user_name": "John Doe",
        "user_email": "john@example.com",
        "file_id": "2b3c4d...",
        "uploaded_at": "2026-04-06T10:30:00Z",
        "url": "/api/pdf/123"
      }
    ]
  }
}
```

---

## 5. SUBSCRIPTION ENDPOINTS

### 5.1 Get Subscription Plans
```
GET /api/subscription/plans
```

**Description:** Get available subscription plans

**Auth Required:** No

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Premium Annual",
      "duration_months": 12,
      "price_inr": 2999.00,
      "features": {
        "contact_details": true,
        "pdf_download": true,
        "advanced_search": true,
        "view_interest": true
      }
    }
  ]
}
```

---

### 5.2 Create Razorpay Order
```
POST /api/subscription/razorpay-order
```

**Description:** Create Razorpay payment order

**Auth Required:** Yes

**Request Body:**
```json
{
  "plan_id": 1
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "order_id": "order_1a2b3c4d5e6f7g8h",
    "amount": 299900,
    "currency": "INR",
    "key_id": "rzp_live_1a2b3c4d5e6f7g8h",
    "user_email": "user@example.com",
    "user_phone": "9876543210"
  }
}
```

---

### 5.3 Verify Razorpay Payment (Webhook)
```
POST /api/payments/webhook
```

**Description:** Razorpay webhook for payment verification

**Auth Required:** No (signature verification)

**Request Body:**
```json
{
  "event": "payment.authorized",
  "payload": {
    "order": {
      "entity": {
        "id": "order_1a2b3c4d5e6f7g8h",
        "amount": 299900,
        "currency": "INR"
      }
    },
    "payment": {
      "entity": {
        "id": "pay_1a2b3c4d5e6f7g8h",
        "amount": 299900,
        "method": "card"
      }
    }
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Webhook processed"
}
```

**Side Effects:**
- Payment status updated to "completed"
- Subscription activated (end_date = now + 12 months)
- User notification email sent
- Subscription status visible in user profile

---

### 5.4 Manual Payment Upload
```
POST /api/subscription/manual-upload
```

**Description:** Upload payment proof for manual verification

**Auth Required:** Yes

**Request:** (FormData)
```
screenshot: <image file>
amount: 2999.00
payment_method: "bank_transfer" or "upi"
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "payment_id": 456,
    "status": "pending",
    "message": "Payment proof submitted. Admin will verify within 24 hours."
  }
}
```

---

### 5.5 Admin: Approve Manual Payment
```
POST /api/admin/payments/:paymentId/approve
```

**Description:** Admin verify and approve manual payment

**Auth Required:** Yes (admin only)

**Request Body:**
```json
{
  "notes": "Payment verified via bank statement"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment approved. User subscription activated."
}
```

**Side Effects:**
- Payment status: "completed"
- Subscription activated
- User receives confirmation email

---

### 5.6 Admin: Reject Manual Payment
```
POST /api/admin/payments/:paymentId/reject
```

**Description:** Admin reject manual payment proof

**Auth Required:** Yes (admin only)

**Request Body:**
```json
{
  "reason": "Invalid transaction ID"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment rejected. User notified to reupload."
}
```

---

### 5.7 Get Subscription Status
```
GET /api/subscription/status
```

**Description:** Get current user's subscription status

**Auth Required:** Yes

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "active",
    "plan_name": "Premium Annual",
    "start_date": "2026-04-06",
    "end_date": "2027-04-06",
    "days_remaining": 365,
    "auto_renew": false,
    "features": {
      "contact_details": true,
      "pdf_download": true,
      "advanced_search": true
    }
  }
}
```

---

## 6. SEARCH & BROWSE ENDPOINTS

### 6.1 Browse Profiles
```
GET /api/profiles/browse
```

**Description:** Browse all profiles with pagination

**Auth Required:** Yes

**Query Params:**
```
page: 1
limit: 20
sort: -created_at (newest first)
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 1234,
    "page": 1,
    "limit": 20,
    "profiles": [
      {
        "id": 123,
        "name": "Jane Doe",
        "age": 26,
        "sub_caste": "Panchamasali",
        "photo_url": "/api/photo/123/1",
        "has_pdf": true
      }
    ]
  }
}
```

---

### 6.2 Search Profiles
```
GET /api/profiles/search
```

**Description:** Search profiles with filters

**Auth Required:** Yes

**Query Params:**
```
age_min: 20
age_max: 35
sub_caste: "Panchamasali,Banajiga"
location: "Bangalore"
education: "B.Tech"
page: 1
limit: 20
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "profiles": [ ... ]
  }
}
```

---

### 6.3 Advanced Search (Subscribers Only)
```
GET /api/profiles/advanced-search
```

**Description:** Advanced search with more filters (subscribers only)

**Auth Required:** Yes (must be subscriber)

**Query Params:**
```
age_min: 20
age_max: 35
height_min: "5.6"
height_max: "6.0"
income_min: "5"
income_max: "15"
sub_caste: "Panchamasali"
education: "B.Tech,MBA"
location: "Bangalore"
page: 1
limit: 20
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": { ... similar to basic search ... }
}
```

---

## 7. INTEREST ENDPOINTS

### 7.1 Express Interest
```
POST /api/interest/express/:userId
```

**Description:** Express interest in another user

**Auth Required:** Yes (must be subscriber)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "interest_id": 789,
    "to_user_id": 456,
    "status": "pending",
    "message": "Interest expressed. User will be notified."
  }
}
```

**Error Codes:**
- `SUBSCRIPTION_REQUIRED` (403) - User not subscribed
- `ALREADY_INTERESTED` (409) - Already expressed interest to this user
- `MUTUAL_MATCH` (200) - Both users interested! Contact details revealed

---

### 7.2 View Interests Received
```
GET /api/interest/received
```

**Description:** View interests received from other users

**Auth Required:** Yes

**Query Params:**
```
status: "all" or "pending" or "accepted"
page: 1
limit: 20
sort: -created_at
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 12,
    "page": 1,
    "limit": 20,
    "interests": [
      {
        "id": 789,
        "from_user": {
          "id": 123,
          "name": "John Doe",
          "age": 28,
          "photo_url": "/api/photo/123/1"
        },
        "status": "pending",
        "created_at": "2026-04-06T10:30:00Z"
      }
    ]
  }
}
```

---

### 7.3 View Interests Sent
```
GET /api/interest/sent
```

**Description:** View interests sent to other users

**Auth Required:** Yes

**Response (200 OK):**
```json
{
  "success": true,
  "data": { ... similar structure ... }
}
```

---

### 7.4 Withdraw Interest
```
DELETE /api/interest/:userId
```

**Description:** Withdraw interest from a user

**Auth Required:** Yes

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Interest withdrawn"
}
```

---

### 7.5 View Matches
```
GET /api/interest/matches
```

**Description:** View mutual matches (both expressed interest)

**Auth Required:** Yes

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 3,
    "matches": [
      {
        "id": 456,
        "name": "Jane Doe",
        "age": 26,
        "phone": "9876543210",
        "photo_url": "/api/photo/456/1",
        "matched_at": "2026-04-06T10:30:00Z"
      }
    ]
  }
}
```

---

## 8. NOTIFICATION ENDPOINTS

### 8.1 Get Notifications
```
GET /api/notifications
```

**Description:** Get user notifications

**Auth Required:** Yes

**Query Params:**
```
type: "all" or "interest" or "view" or "approval" or "system"
read: "all" or "unread"
page: 1
limit: 20
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "page": 1,
    "unread_count": 5,
    "notifications": [
      {
        "id": 999,
        "type": "interest",
        "title": "John Doe expressed interest",
        "message": "John Doe is interested in your profile",
        "from_user_id": 123,
        "read": false,
        "created_at": "2026-04-06T10:30:00Z"
      }
    ]
  }
}
```

---

### 8.2 Mark as Read
```
PUT /api/notifications/:notificationId/read
```

**Description:** Mark notification as read

**Auth Required:** Yes

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### 8.3 Delete Notification
```
DELETE /api/notifications/:notificationId
```

**Description:** Delete a notification

**Auth Required:** Yes

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

---

### 8.4 Get Notification Preferences
```
GET /api/notifications/preferences
```

**Description:** Get notification settings

**Auth Required:** Yes

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "email": true,
    "sms": false,
    "whatsapp": true,
    "frequency": "real_time",
    "by_type": {
      "interest": true,
      "view": true,
      "approval": true,
      "system": true
    }
  }
}
```

---

### 8.5 Update Notification Preferences
```
PUT /api/notifications/preferences
```

**Description:** Update notification settings

**Auth Required:** Yes

**Request Body:**
```json
{
  "email": true,
  "sms": false,
  "whatsapp": true,
  "frequency": "daily_digest",
  "by_type": {
    "interest": true,
    "view": false,
    "approval": true,
    "system": true
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Preferences updated"
}
```

---

## 9. GOOGLE DRIVE INTEGRATION ENDPOINTS

### 9.1 Initiate Google Drive Connection
```
POST /api/google-drive/connect
```

**Description:** Initiate OAuth flow for Google Drive

**Auth Required:** Yes (admin only)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "oauth_url": "https://accounts.google.com/o/oauth2/v2/auth?...",
    "state": "random_state_token"
  }
}
```

---

### 9.2 Google Drive OAuth Callback
```
POST /api/google-drive/callback
```

**Description:** Handle OAuth callback from Google

**Auth Required:** Yes (admin only)

**Request Body:**
```json
{
  "code": "auth_code_from_google",
  "state": "random_state_token"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "email": "admin@example.com",
    "storage_info": {
      "used": "500MB",
      "total": "1TB"
    },
    "folders": {
      "photos": "Matrimonial_Photos",
      "pdfs": "PDF_Bios"
    }
  }
}
```

---

### 9.3 Validate Google Drive Connection
```
GET /api/google-drive/validate
```

**Description:** Test if Google Drive connection is still valid

**Auth Required:** Yes (admin only)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "status": "active",
    "last_verified": "2026-04-06T10:30:00Z",
    "email": "admin@example.com",
    "storage": {
      "used_gb": 0.5,
      "total_gb": 1024
    }
  }
}
```

**Error Codes:**
- `CONNECTION_FAILED` (503) - Cannot connect to Google Drive
- `TOKEN_EXPIRED` (401) - Token expired, need to reconnect

---

### 9.4 Disconnect Google Drive
```
POST /api/google-drive/disconnect
```

**Description:** Revoke Google Drive access

**Auth Required:** Yes (admin only)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Google Drive disconnected. Photo/PDF uploads will be disabled."
}
```

---

## 10. ADMIN ENDPOINTS

### 10.1 Admin Dashboard
```
GET /api/admin/dashboard
```

**Description:** Get admin dashboard statistics

**Auth Required:** Yes (admin only)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_users": 1234,
      "active_subscriptions": 567,
      "pending_profiles": 45,
      "pending_pdfs": 12,
      "pending_payments": 8,
      "revenue_today": 45000,
      "revenue_month": 1234567
    },
    "recent_signups": [ ... ],
    "pending_actions": [ ... ]
  }
}
```

---

### 10.2 Get All Users
```
GET /api/admin/users
```

**Description:** List all users with filtering

**Auth Required:** Yes (admin only)

**Query Params:**
```
search: "email or name"
status: "all" or "pending" or "approved" or "rejected"
subscription: "all" or "active" or "expired"
page: 1
limit: 20
sort: -created_at
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 1234,
    "page": 1,
    "limit": 20,
    "users": [
      {
        "id": 123,
        "email": "user@example.com",
        "name": "John Doe",
        "profile_status": "approved",
        "subscription_status": "active",
        "created_at": "2026-04-01T10:30:00Z"
      }
    ]
  }
}
```

---

### 10.3 View User Details (Admin)
```
GET /api/admin/users/:userId
```

**Description:** View complete user details as admin

**Auth Required:** Yes (admin only)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "9876543210",
    "all_personal_details": "...",
    "photos": [ ... ],
    "pdf": { ... },
    "subscription": { ... },
    "payments": [ ... ],
    "activity_logs": [ ... ],
    "interests_received": 5,
    "interests_sent": 3
  }
}
```

---

### 10.4 Edit User (Admin)
```
PUT /api/admin/users/:userId
```

**Description:** Admin edit user information

**Auth Required:** Yes (admin only)

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "phone": "9876543210",
  "subscription_end_date": "2027-04-06",
  "profile_status": "approved"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": { ... updated user ... }
}
```

---

### 10.5 Delete User (Admin)
```
DELETE /api/admin/users/:userId
```

**Description:** Admin delete user account

**Auth Required:** Yes (admin only)

**Request Body:**
```json
{
  "reason": "Violation of community guidelines"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User account deleted"
}
```

---

### 10.6 Get Pending Profiles
```
GET /api/admin/profiles/pending
```

**Description:** List profiles awaiting approval

**Auth Required:** Yes (admin only)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 45,
    "profiles": [
      {
        "id": 123,
        "user_id": 123,
        "email": "user@example.com",
        "name": "John Doe",
        "created_at": "2026-04-05T10:30:00Z",
        "has_photos": true,
        "has_pdf": true
      }
    ]
  }
}
```

---

### 10.7 Approve Profile (Admin)
```
POST /api/admin/profiles/:userId/approve
```

**Description:** Admin approve user profile

**Auth Required:** Yes (admin only)

**Request Body:**
```json
{
  "notes": "Profile looks good"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile approved. User will be notified."
}
```

---

### 10.8 Reject Profile (Admin)
```
POST /api/admin/profiles/:userId/reject
```

**Description:** Admin reject user profile

**Auth Required:** Yes (admin only)

**Request Body:**
```json
{
  "reason": "Photo doesn't look professional"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile rejected. User will be asked to resubmit."
}
```

---

### 10.9 Get Pending Payments
```
GET /api/admin/payments/pending
```

**Description:** List manual payments awaiting verification

**Auth Required:** Yes (admin only)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 8,
    "payments": [
      {
        "id": 456,
        "user_id": 123,
        "user_email": "user@example.com",
        "amount": 2999.00,
        "screenshot_url": "...",
        "submitted_at": "2026-04-06T10:30:00Z"
      }
    ]
  }
}
```

---

## ERROR CODES & HTTP STATUS CODES

```
200 OK                       - Success
201 Created                  - Resource created
204 No Content              - Success (no body)
400 Bad Request             - Validation error
401 Unauthorized            - Auth required/failed
403 Forbidden               - Access denied
404 Not Found               - Resource not found
409 Conflict                - Resource already exists
422 Unprocessable Entity    - Business logic error
500 Internal Server Error   - Server error
503 Service Unavailable     - External service down
```

---

## RATE LIMITING

```
Free Tier (Non-subscribers):
- 100 requests/minute per IP
- 10 file uploads/hour

Premium Tier (Subscribers):
- 500 requests/minute per IP
- 30 file uploads/hour

Admin:
- 2000 requests/minute
- Unlimited file uploads
```

---

## PAGINATION

```
Default limit: 20 items
Max limit: 100 items
Offset-based pagination:
  page: Current page (1-indexed)
  limit: Items per page

Response:
{
  "total": 1234,
  "page": 1,
  "limit": 20,
  "data": [ ... ]
}
```

---

## FILTERING & SORTING

```
Filters: ?field=value&field2=value2
Sorting: ?sort=field or ?sort=-field (descending)

Common filters:
  status=active,pending
  date_from=2026-04-01&date_to=2026-04-30
  search=keyword
```

---

**API Status:** Ready for backend implementation
**Next Step:** Backend project setup & API implementation
