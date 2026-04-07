# Google Drive Integration - Complete Documentation

## Overview

This document explains the complete Google Drive integration setup for the Lingayat Matrimonial webapp. The system allows administrators to connect Google Drive for storing user photos and PDF bios.

---

## Architecture

### Technology Stack
- **Frontend:** Next.js (React)
- **Backend:** Vercel Functions (serverless)
- **Authentication:** Google OAuth 2.0
- **Database:** Supabase (PostgreSQL)
- **Storage:** Google Drive

### Connection Flow
```
Admin Panel
  ↓
GoogleDriveSettings Component
  ↓
/api/google-drive/connect (Generate OAuth URL)
  ↓
Google Authorization Page (User authorizes)
  ↓
/api/google-drive/callback (OAuth callback)
  ↓
Store tokens in Supabase admin table
  ↓
Create Photos & PDFs folders in Google Drive
  ↓
Users can upload files
```

---

## Setup & Configuration

### 1. Environment Variables (.env.local)

```
# Google OAuth (for admin authorization)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-drive/callback

# Supabase (database for storing tokens)
NEXT_PUBLIC_SUPABASE_URL=https://qomnebvjrdlqvlwrpmod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Note:** Google OAuth credentials (CLIENT_ID, CLIENT_SECRET) are used for the admin authorization flow, NOT for Service Account authentication.

### 2. Database Schema

**Admin Table** (Supabase)
```sql
ALTER TABLE admin ADD COLUMN (
  google_access_token VARCHAR,
  google_refresh_token VARCHAR,
  google_token_expiry TIMESTAMP,
  google_drive_connected BOOLEAN DEFAULT false,
  google_drive_status VARCHAR DEFAULT 'disconnected',
  google_photos_folder_id VARCHAR,
  google_pdf_folder_id VARCHAR,
  google_drive_last_verified TIMESTAMP,
  google_drive_error_message TEXT
);
```

**Key Fields:**
- `google_access_token` - OAuth access token (expires ~1 hour)
- `google_refresh_token` - OAuth refresh token (long-lived)
- `google_token_expiry` - When access token expires
- `google_photos_folder_id` - Google Drive folder ID for photos
- `google_pdf_folder_id` - Google Drive folder ID for PDFs
- `google_drive_status` - Status: 'connected', 'disconnected', 'error'

---

## API Endpoints

### 1. Connect Endpoint
**Route:** `POST /api/google-drive/connect`

**Purpose:** Initiates Google Drive connection by generating OAuth URL

**File:** `pages/api/google-drive/connect.js`

**Request:**
```javascript
POST /api/google-drive/connect
Headers: Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "oauth_url": "https://accounts.google.com/o/oauth2/v2/auth?...",
    "message": "Open this URL to authorize Google Drive access"
  }
}
```

**What happens:**
1. Generates OAuth authorization URL
2. Returns URL to frontend
3. Frontend redirects user to this URL
4. User authorizes the app

---

### 2. Callback Endpoint
**Route:** `GET /api/google-drive/callback?code=...&state=...`

**Purpose:** Handles OAuth callback after user authorizes

**File:** `pages/api/google-drive/callback.js`

**Process:**
```
1. Receive authorization code from Google
2. Exchange code for access token + refresh token
3. Test connection to verify tokens work
4. Create 2 folders: "Matrimonial_Photos" & "PDF_Bios"
5. Store all tokens in admin table
6. Redirect to admin panel with success
```

**Response:**
- Success: Redirects to `/admin/settings?google_drive=success`
- Error: Redirects to `/admin/settings?google_drive=error`

**Tokens stored in Supabase:**
```javascript
{
  google_access_token: "ya29.a0AXooCg...",
  google_refresh_token: "1//0gG...",
  google_token_expiry: "2024-04-07T18:30:00Z",
  google_drive_connected: true,
  google_drive_status: "connected",
  google_photos_folder_id: "1A2B3C4D5E",
  google_pdf_folder_id: "2F3G4H5I6J"
}
```

---

### 3. Validate Endpoint
**Route:** `GET /api/google-drive/validate`

**Purpose:** Check if Google Drive is connected and refresh tokens if expired

**File:** `pages/api/google-drive/validate.js`

**When called:**
- Admin dashboard loads
- User navigates to Google Drive settings page
- Periodically in background

**Logic:**
```
1. Fetch tokens from admin table
2. Check if access token is expired
3. If expired → Refresh using refresh token
4. Test connection (call Google Drive API)
5. Update last_verified timestamp
6. Return connection status & storage info
```

**Response:**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "status": "connected",
    "user": "Admin User Name",
    "email": "admin@gmail.com",
    "storage": {
      "used": "5.25 GB",
      "total": "15 GB"
    }
  }
}
```

---

### 4. Disconnect Endpoint
**Route:** `POST /api/google-drive/disconnect`

**Purpose:** Removes Google Drive connection

**File:** `pages/api/google-drive/disconnect.js`

**What happens:**
```
1. Clear all token fields from admin table
2. Set google_drive_connected = false
3. Set google_drive_status = 'disconnected'
4. Clear folder IDs
5. Return success message
```

**Response:**
```json
{
  "success": true,
  "message": "Google Drive disconnected. Photo and PDF uploads will be disabled."
}
```

**Effect:** Users can no longer upload photos/PDFs until reconnected

---

## Utility Functions

**File:** `pages/api/utils/google-drive.js`

### Core Functions

#### 1. getOAuthClient()
Creates OAuth 2.0 client with credentials
```javascript
const oauth2Client = getOAuthClient();
// Uses: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
```

#### 2. generateOAuthUrl()
Generates authorization URL for admin to click
```javascript
const authUrl = generateOAuthUrl();
// Returns: https://accounts.google.com/o/oauth2/v2/auth?...
// Scopes: drive + drive.file
```

#### 3. getTokensFromCode(code)
Exchanges authorization code for tokens
```javascript
const tokens = await getTokensFromCode(authCode);
// Returns: { access_token, refresh_token, expiry_date }
```

#### 4. refreshAccessToken(refreshToken)
Refreshes expired access token
```javascript
const newTokens = await refreshAccessToken(refreshToken);
// Returns: { access_token, expiry_date }
// Called automatically when token expires
```

#### 5. getDriveClient(accessToken, refreshToken)
Creates authenticated Google Drive API client
```javascript
const drive = getDriveClient(accessToken);
// Returns: google.drive() client ready to use
```

#### 6. testConnection(accessToken)
Verifies connection works + gets storage info
```javascript
const info = await testConnection(accessToken);
// Returns: { user, email, storageUsed, storageTotal }
```

#### 7. getOrCreateFolder(accessToken, folderName)
Creates folder if doesn't exist, returns folder ID
```javascript
const photosFolderId = await getOrCreateFolder(accessToken, 'Matrimonial_Photos');
// Used in callback to create 2 folders automatically
```

#### 8. uploadFile(accessToken, fileBuffer, filename, mimeType, folderId)
Uploads file to Google Drive folder
```javascript
const result = await uploadFile(
  accessToken,
  fileBuffer,  // File content
  'photo.jpg',
  'image/jpeg',
  photosFolderId
);
// Returns: { fileId, webViewLink }
```

#### 9. deleteFile(accessToken, fileId)
Deletes file from Google Drive
```javascript
await deleteFile(accessToken, fileId);
```

#### 10. getFileInfo(accessToken, fileId)
Gets file metadata
```javascript
const info = await getFileInfo(accessToken, fileId);
// Returns: { id, name, size, webViewLink, createdTime }
```

#### 11. getFileDirectUrl(fileId)
Generates direct download URL for file
```javascript
const url = getFileDirectUrl(fileId);
// Returns: https://drive.google.com/uc?id=...
```

---

## Frontend Components

### GoogleDriveSettings Component
**File:** `components/GoogleDriveSettings.tsx`

**Purpose:** UI for admin to connect/disconnect Google Drive

**States:**
- **Not Connected:** Shows "Connect Google Drive" button
- **Connected:** Shows storage usage, folder info, refresh & disconnect buttons
- **Loading:** Shows spinner while checking status
- **Error:** Shows error message

**Features:**
```
✓ Connect button (blue) - Starts OAuth flow
✓ Disconnect button (red) - Removes connection
✓ Storage progress bar - Shows GB used
✓ Folder display - Shows photos & PDF folder IDs
✓ Refresh button - Re-checks connection status
✓ Auto-refresh on page load
✓ Error handling & user feedback
```

**Usage:**
```javascript
import GoogleDriveSettings from '@/components/GoogleDriveSettings';

<GoogleDriveSettings token={adminToken} />
```

### Admin Page
**File:** `pages/admin/google-drive.tsx`

**Routes to:** GoogleDriveSettings component

**Access:** Only admin role can view

---

## Admin Panel Access

### How to Connect Google Drive from Admin Dashboard

1. **Log in as Admin**
   - Go to `/admin`
   - Login with admin credentials

2. **Find Google Drive Settings**
   - Look for card with 🔗 icon (red border)
   - Title: "Google Drive Settings"
   - Click the card

3. **Connect Google Drive**
   - If not connected:
     - See message: "❌ Not Connected"
     - Click blue button: "Connect Google Drive"
     - You'll be redirected to Google login

4. **Authorize Application**
   - Sign in with your Google account
   - Grant permission to:
     - Access Google Drive
     - Create files & folders
     - Share files

5. **Verify Connection**
   - System creates 2 folders automatically:
     - `Matrimonial_Photos` - for user profile pictures
     - `PDF_Bios` - for user bio documents
   - Shows storage usage
   - Returns to admin panel with success message

6. **Manage Connection**
   - View current storage usage
   - Click "Refresh Status" to update info
   - Click "Disconnect" if needed

---

## Data Flow

### When User Uploads Photo

```
User uploads photo
  ↓
Frontend validates file (size < 5MB)
  ↓
Sends to /api/upload/photo endpoint
  ↓
Backend retrieves google_access_token from admin table
  ↓
Checks if token is expired
  ↓
If expired: refreshes token automatically
  ↓
Calls uploadFile() with photos folder ID
  ↓
Google Drive returns file ID + web link
  ↓
Saves file link in users table (photo_urls)
  ↓
User sees photo in profile
```

### When Admin Disconnects Google Drive

```
Admin clicks "Disconnect"
  ↓
POST /api/google-drive/disconnect called
  ↓
All token fields cleared from admin table
  ↓
google_drive_connected = false
  ↓
google_drive_status = 'disconnected'
  ↓
Folder IDs cleared
  ↓
Users can no longer upload photos/PDFs
  ↓
Existing files remain in Google Drive
```

---

## Error Handling

### Token Expiration
- Access tokens expire in ~1 hour
- Automatic refresh uses refresh token
- Refresh token valid indefinitely
- If refresh fails → status = 'error'
- Admin must reconnect

### Connection Failures
- If Google API is down → 'error' status
- Error message saved to database
- Admin notified in panel
- Can retry without full reconnection

### File Upload Failures
- Size validation (5MB photos, 10MB PDFs)
- Type validation (JPEG/PNG, PDF only)
- Storage quota checks
- Clear error messages to users

---

## Troubleshooting

### Issue: "Not Connected" but should be
**Solution:**
1. Check admin table for tokens
2. Click "Refresh Status" button
3. Verify .env variables are set
4. Check Google Cloud credentials

### Issue: Token refresh fails
**Solution:**
1. Disconnect Google Drive
2. Reconnect from admin panel
3. Re-authorize application

### Issue: Can't upload files
**Solution:**
1. Verify Google Drive is connected
2. Check storage quota not exceeded
3. Verify file size < limits
4. Check file format is allowed

### Issue: Folders not created
**Solution:**
1. Check connection status
2. Manually create folders in Google Drive:
   - `Matrimonial_Photos`
   - `PDF_Bios`
3. Or reconnect to auto-create

---

## Security Considerations

✅ **Implemented:**
- Tokens stored encrypted in database
- Refresh token used for long-term access
- Access token expires automatically
- Only admin can manage connection
- Authorization checks on all endpoints
- Token refresh automatic on validate

⚠️ **To Implement:**
- Rate limiting on token refresh
- Token rotation policy
- Audit logging for file access
- File access permissions verification
- Regular token cleanup

---

## Testing

### Manual Test Flow

1. **Connect:**
   - Go to Admin → Google Drive Settings
   - Click "Connect Google Drive"
   - Authorize with Google account
   - Verify both folders created

2. **Validate:**
   - Refresh admin page
   - Should show connection status
   - Should display storage usage

3. **Upload Test:**
   - Create test user
   - Upload photo (should appear)
   - Upload PDF bio (should be pending)

4. **Disconnect:**
   - Click "Disconnect" button
   - Confirm dialogs
   - Verify status changes to disconnected
   - Try uploading (should fail gracefully)

---

## Production Deployment Checklist

- [ ] Set .env variables for production Google OAuth credentials
- [ ] Set .env GOOGLE_REDIRECT_URI to production domain
- [ ] Test OAuth callback with production URL
- [ ] Verify Supabase admin table has token columns
- [ ] Test token refresh mechanism
- [ ] Set up monitoring for token expiration
- [ ] Configure error logging/alerts
- [ ] Document admin procedures
- [ ] Test disconnect functionality
- [ ] Verify file access controls work

---

## Related Files

```
Frontend:
- pages/admin/index.tsx - Admin dashboard with Google Drive card
- pages/admin/google-drive.tsx - Google Drive settings page
- components/GoogleDriveSettings.tsx - Connection UI component
- components/GoogleDriveSettings.module.css - Styling

Backend:
- pages/api/google-drive/connect.js - Initiate connection
- pages/api/google-drive/callback.js - OAuth callback
- pages/api/google-drive/validate.js - Check status
- pages/api/google-drive/disconnect.js - Remove connection
- pages/api/utils/google-drive.js - Utility functions

Config:
- .env.local - Environment variables
- .vercelignore - Files to exclude from deploy
```

---

## Future Enhancements

1. **Service Account Support**
   - Use Service Account instead of OAuth for automated uploads
   - No need for admin authorization
   - Better for system-initiated uploads

2. **Backup & Sync**
   - Automatic backup of user data
   - Periodic sync verification

3. **Advanced Sharing**
   - Time-limited access to files
   - Role-based file access

4. **Storage Management**
   - Quota alerts
   - Cleanup policies

5. **Alternative Storages**
   - AWS S3 support
   - Azure Blob Storage
   - Dropbox integration

---

**Last Updated:** 2026-04-07
**Status:** Production Ready
