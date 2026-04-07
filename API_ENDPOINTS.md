# API Endpoints Reference

## Authentication Endpoints

### POST /api/auth/signup
Register new user account.

**Request:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "john@example.com",
      "full_name": "John Doe",
      "role": "user",
      "subscription_status": "inactive"
    },
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 3600
  }
}
```

### POST /api/auth/login
Authenticate user with credentials.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "secure_password"
}
```

**Response (200):** Same as signup response

### GET /api/auth/me
Get current authenticated user.

**Headers:** `Authorization: Bearer {access_token}`

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "user",
    "subscription_status": "active"
  }
}
```

### POST /api/auth/refresh
Refresh access token.

**Request:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "expires_in": 3600
  }
}
```

---

## Photo Management

### POST /api/photo/upload
Upload user photo to Google Drive.

**Headers:**
- `Authorization: Bearer {access_token}`
- `Content-Type: multipart/form-data`

**Body:**
- `file`: Image file (max 5MB)
- `photo_number`: 1-5

**Response (201):**
```json
{
  "success": true,
  "data": {
    "photoNumber": 1,
    "fileId": "drive_file_123",
    "url": "/api/photo/user_123/1",
    "uploadedAt": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/photo/:userId/:photoNumber
Get photo URL (subscribers only).

**Headers:** `Authorization: Bearer {access_token}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "url": "https://drive.google.com/uc?id=...",
    "photoNumber": 1
  }
}
```

---

## PDF Management

### POST /api/pdf/upload
Upload user bio PDF (max 10MB).

**Headers:**
- `Authorization: Bearer {access_token}`
- `Content-Type: multipart/form-data`

**Response (201):**
```json
{
  "success": true,
  "data": {
    "fileId": "drive_file_456",
    "status": "pending",
    "uploadedAt": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/pdf/:userId
Get approved PDF (subscribers only).

**Headers:** `Authorization: Bearer {access_token}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "url": "https://drive.google.com/uc?id=...",
    "status": "approved"
  }
}
```

### POST /api/admin/pdf-approve
Approve pending PDF (admin only).

**Headers:** `Authorization: Bearer {admin_token}`

**Request:**
```json
{
  "userId": "user_123",
  "notes": "Approved"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "PDF approved"
}
```

---

## Search & Profiles

### GET /api/search/profiles
Search profiles (subscribers only).

**Headers:** `Authorization: Bearer {access_token}`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 12)
- `search`: Search term (optional)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "name": "Jane Doe",
      "photoCount": 3,
      "firstPhotoUrl": "/api/photo/user_123/1"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 150,
    "pages": 13
  }
}
```

### GET /api/search/profile/:userId
Get profile details (subscribers only).

**Headers:** `Authorization: Bearer {access_token}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "Jane Doe",
    "joinedDate": "2024-01-01T00:00:00Z",
    "pdfStatus": "approved",
    "photos": [
      {
        "number": 1,
        "url": "/api/photo/user_123/1",
        "status": "active"
      }
    ]
  }
}
```

---

## Interest & Notifications

### POST /api/interest/express
Express interest in a profile.

**Headers:** `Authorization: Bearer {access_token}`

**Request:**
```json
{
  "interested_user_id": "user_456"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "interest_789",
    "status": "pending"
  }
}
```

### GET /api/notification/list
Get user notifications.

**Headers:** `Authorization: Bearer {access_token}`

**Query Parameters:**
- `page`: Page number
- `limit`: Results per page

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "notif_123",
      "type": "interest_received",
      "title": "New Interest",
      "message": "Someone expressed interest",
      "read": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "relatedUser": {
        "id": "user_456",
        "name": "Jane Doe"
      }
    }
  ],
  "unreadCount": 5
}
```

### POST /api/notification/mark-read
Mark notification as read.

**Headers:** `Authorization: Bearer {access_token}`

**Request:**
```json
{
  "notification_id": "notif_123"
}
```

Or mark all as read:
```json
{
  "mark_all": true
}
```

---

## Subscription & Payments

### GET /api/subscription/plans
Get available subscription plans.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "plan_123",
      "name": "1 Month",
      "price": 999,
      "duration_days": 30,
      "features": ["Browse profiles", "Express interest"]
    }
  ]
}
```

### POST /api/subscription/initiate
Create Razorpay order.

**Headers:** `Authorization: Bearer {access_token}`

**Request:**
```json
{
  "plan_id": "plan_123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "orderId": "order_123",
    "amount": 999,
    "currency": "INR"
  }
}
```

### POST /api/subscription/verify
Verify payment and activate subscription.

**Headers:** `Authorization: Bearer {access_token}`

**Request:**
```json
{
  "razorpay_order_id": "order_123",
  "razorpay_payment_id": "pay_123",
  "razorpay_signature": "signature_123"
}
```

---

## Admin Endpoints

### GET /api/admin/dashboard
Get admin dashboard stats.

**Headers:** `Authorization: Bearer {admin_token}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 1000,
      "activeSubscribers": 500,
      "pendingPdfs": 25,
      "newUsersMonth": 150,
      "totalRevenue": 50000
    }
  }
}
```

### GET /api/admin/users/list
List users with filters.

**Headers:** `Authorization: Bearer {admin_token}`

**Query Parameters:**
- `page`: Page number
- `limit`: Results per page
- `search`: Search term
- `role`: Filter by role (user/subscriber/admin)
- `status`: Filter by subscription status

### POST /api/admin/users/update
Update user role or subscription.

**Headers:** `Authorization: Bearer {admin_token}`

**Request:**
```json
{
  "userId": "user_123",
  "role": "subscriber",
  "subscription_status": "active"
}
```

---

## Error Responses

All endpoints return error responses in this format:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Description of the error"
  }
}
```

### Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

---

## Rate Limiting

API endpoints are rate limited:
- **Authenticated users**: 100 requests/minute
- **Unauthenticated**: 10 requests/minute

Rate limit info in response headers:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

---

## Authentication

All protected endpoints require:
```
Authorization: Bearer {access_token}
```

Access tokens expire after 1 hour. Use refresh token to get new access token.

Refresh tokens expire after 30 days.
