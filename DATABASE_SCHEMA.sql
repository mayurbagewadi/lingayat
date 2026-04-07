-- LINGAYAT MALI MATRIMONIAL APP - POSTGRESQL DATABASE SCHEMA
-- Version: 1.0
-- Created: 2026-04-06
-- Description: Complete database schema for production deployment

-- Drop existing tables (for fresh start - use with caution)
-- DROP TABLE IF EXISTS activity_logs CASCADE;
-- DROP TABLE IF EXISTS notifications CASCADE;
-- DROP TABLE IF EXISTS interests CASCADE;
-- DROP TABLE IF EXISTS payments CASCADE;
-- DROP TABLE IF EXISTS pdfs CASCADE;
-- DROP TABLE IF EXISTS photos CASCADE;
-- DROP TABLE IF EXISTS subscriptions CASCADE;
-- DROP TABLE IF EXISTS subscription_plans CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS admin CASCADE;

---============================================
--- 1. SUBSCRIPTION PLANS TABLE (Reference data)
---============================================
CREATE TABLE subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  duration_months INTEGER NOT NULL DEFAULT 12,
  price_inr DECIMAL(10, 2) NOT NULL,
  features JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active);

-- Sample data
INSERT INTO subscription_plans (name, description, duration_months, price_inr, features, is_active)
VALUES (
  'Premium Annual',
  'Full access for 1 year',
  12,
  2999.00,
  '{"contact_details": true, "pdf_download": true, "advanced_search": true, "view_interest": true}'::jsonb,
  TRUE
);

---============================================
--- 2. USERS TABLE (Core user data)
---============================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,

  -- Authentication
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),

  -- Personal Details
  name VARCHAR(255) NOT NULL,
  dob DATE NOT NULL,
  gender VARCHAR(10) CHECK (gender IN ('Male', 'Female')),
  sub_caste VARCHAR(100),

  -- Profile Details
  education VARCHAR(100),
  location VARCHAR(255),
  height VARCHAR(10),
  income VARCHAR(50),

  -- Profile Status
  profile_status VARCHAR(20) DEFAULT 'pending' CHECK (profile_status IN ('pending', 'approved', 'rejected')),
  profile_created_at TIMESTAMP WITH TIME ZONE,
  profile_approved_at TIMESTAMP WITH TIME ZONE,
  profile_approved_by VARCHAR(255),
  profile_rejection_reason TEXT,

  -- Google Drive Photos (File IDs)
  photo_1_file_id VARCHAR(255),
  photo_2_file_id VARCHAR(255),
  photo_3_file_id VARCHAR(255),
  photo_4_file_id VARCHAR(255),
  photo_5_file_id VARCHAR(255),

  -- Google Drive PDF
  pdf_file_id VARCHAR(255),
  pdf_status VARCHAR(20) DEFAULT 'pending' CHECK (pdf_status IN ('pending', 'approved', 'rejected')),
  pdf_uploaded_at TIMESTAMP WITH TIME ZONE,
  pdf_approved_at TIMESTAMP WITH TIME ZONE,
  pdf_approved_by VARCHAR(255),
  pdf_rejection_reason TEXT,

  -- Subscription Status
  subscription_status VARCHAR(20) DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'expired', 'inactive')),
  subscription_end_date DATE,

  -- Notification Preferences
  notify_email BOOLEAN DEFAULT TRUE,
  notify_sms BOOLEAN DEFAULT FALSE,
  notify_whatsapp BOOLEAN DEFAULT FALSE,

  -- Audit Fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_phone ON users(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_profile_status ON users(profile_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_subscription_status ON users(subscription_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_sub_caste ON users(sub_caste) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_location ON users(location) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_age ON users(dob) WHERE deleted_at IS NULL;

---============================================
--- 3. PHOTOS TABLE (Normalized photo storage)
---============================================
CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  file_id VARCHAR(255) NOT NULL,
  photo_number INTEGER NOT NULL CHECK (photo_number >= 1 AND photo_number <= 5),

  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'deleted')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,

  UNIQUE(user_id, photo_number)
);

-- Indexes
CREATE INDEX idx_photos_user_id ON photos(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_photos_status ON photos(status);

---============================================
--- 4. PDFS TABLE (PDF bio tracking)
---============================================
CREATE TABLE pdfs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  file_id VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),

  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by VARCHAR(255),
  rejection_reason TEXT,

  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_pdfs_user_id ON pdfs(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_pdfs_status ON pdfs(status);

---============================================
--- 5. SUBSCRIPTIONS TABLE
---============================================
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  auto_renew BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);

---============================================
--- 6. PAYMENTS TABLE
---============================================
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',

  method VARCHAR(20) NOT NULL CHECK (method IN ('razorpay', 'manual')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'rejected')),

  -- Razorpay specific
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  razorpay_signature VARCHAR(255),

  -- Manual payment specific
  manual_screenshot_url TEXT,
  verified_by VARCHAR(255),
  verified_at TIMESTAMP WITH TIME ZONE,

  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_method ON payments(method);
CREATE INDEX idx_payments_razorpay_order ON payments(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;

---============================================
--- 7. INTERESTS TABLE
---============================================
CREATE TABLE interests (
  id SERIAL PRIMARY KEY,

  from_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP WITH TIME ZONE,

  -- Prevent duplicate interests
  UNIQUE(from_user_id, to_user_id),
  -- Prevent self-interest
  CONSTRAINT no_self_interest CHECK (from_user_id != to_user_id)
);

-- Indexes
CREATE INDEX idx_interests_from_user ON interests(from_user_id);
CREATE INDEX idx_interests_to_user ON interests(to_user_id);
CREATE INDEX idx_interests_status ON interests(status);
CREATE INDEX idx_interests_created_at ON interests(created_at);

---============================================
--- 8. ACTIVITY_LOGS TABLE
---============================================
CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  action VARCHAR(50) NOT NULL CHECK (action IN ('profile_view', 'interest_sent', 'pdf_viewed', 'login', 'photo_upload')),
  target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

  details JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_user_action ON activity_logs(user_id, action);

---============================================
--- 9. NOTIFICATIONS TABLE
---============================================
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  type VARCHAR(50) NOT NULL CHECK (type IN ('interest', 'view', 'approval', 'subscription', 'system')),

  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  from_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

---============================================
--- 10. ADMIN TABLE
---============================================
CREATE TABLE admin (
  id SERIAL PRIMARY KEY,

  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,

  role VARCHAR(50) DEFAULT 'super_admin' CHECK (role IN ('super_admin', 'moderator')),

  -- Google Drive Integration
  google_access_token TEXT,  -- Encrypted in application
  google_refresh_token TEXT,  -- Encrypted in application
  google_token_expiry TIMESTAMP WITH TIME ZONE,

  google_drive_connected BOOLEAN DEFAULT FALSE,
  google_drive_status VARCHAR(50) DEFAULT 'disconnected' CHECK (google_drive_status IN ('connected', 'disconnected', 'error')),

  google_photos_folder_id VARCHAR(255),
  google_pdf_folder_id VARCHAR(255),

  google_drive_last_verified TIMESTAMP WITH TIME ZONE,
  google_drive_error_message TEXT,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_admin_email ON admin(email);

---============================================
--- VIEWS FOR COMMON QUERIES
---============================================

-- View: Active subscribers
CREATE OR REPLACE VIEW active_subscribers AS
SELECT
  u.id,
  u.email,
  u.name,
  s.id as subscription_id,
  s.end_date,
  sp.name as plan_name
FROM users u
JOIN subscriptions s ON u.id = s.user_id
JOIN subscription_plans sp ON s.plan_id = sp.id
WHERE s.status = 'active'
  AND s.end_date >= CURRENT_DATE
  AND u.deleted_at IS NULL;

-- View: Profiles pending approval
CREATE OR REPLACE VIEW pending_profiles AS
SELECT
  id,
  email,
  name,
  profile_status,
  profile_created_at,
  (CASE WHEN pdf_file_id IS NOT NULL THEN TRUE ELSE FALSE END) as has_pdf,
  (CASE WHEN photo_1_file_id IS NOT NULL THEN TRUE ELSE FALSE END) as has_photos
FROM users
WHERE profile_status = 'pending'
  AND deleted_at IS NULL
ORDER BY profile_created_at DESC;

-- View: PDFs pending approval
CREATE OR REPLACE VIEW pending_pdfs AS
SELECT
  p.id,
  p.user_id,
  u.name,
  u.email,
  p.file_id,
  p.uploaded_at
FROM pdfs p
JOIN users u ON p.user_id = u.id
WHERE p.status = 'pending'
  AND p.deleted_at IS NULL
ORDER BY p.uploaded_at DESC;

-- View: Payments pending verification
CREATE OR REPLACE VIEW pending_payments AS
SELECT
  p.id,
  p.user_id,
  u.name,
  u.email,
  p.amount,
  p.method,
  p.manual_screenshot_url,
  p.created_at
FROM payments p
JOIN users u ON p.user_id = u.id
WHERE p.status = 'pending'
  AND p.method = 'manual'
ORDER BY p.created_at DESC;

---============================================
--- TRIGGERS FOR AUDIT FIELDS
---============================================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users
CREATE TRIGGER users_update_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Apply trigger to payments
CREATE TRIGGER payments_update_timestamp
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Apply trigger to admin
CREATE TRIGGER admin_update_timestamp
BEFORE UPDATE ON admin
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

---============================================
--- CONSTRAINTS & VALIDATION
---============================================

-- Ensure subscription_end_date > start_date
ALTER TABLE subscriptions
ADD CONSTRAINT valid_subscription_dates CHECK (end_date > start_date);

-- Ensure at least one notification preference is enabled
ALTER TABLE users
ADD CONSTRAINT at_least_one_notification CHECK (
  notify_email = TRUE OR notify_sms = TRUE OR notify_whatsapp = TRUE
);

---============================================
--- SAMPLE DATA (For Testing)
---============================================

-- Insert sample subscription plan
INSERT INTO subscription_plans (name, description, duration_months, price_inr, features, is_active)
VALUES (
  'Premium Yearly',
  'Full access to all features for 1 year',
  12,
  2999.00,
  '{
    "contact_details": true,
    "pdf_download": true,
    "advanced_search": true,
    "view_who_viewed": true,
    "priority_listing": false
  }'::jsonb,
  TRUE
);

-- Note: Sample users, photos, pdfs data should be inserted during application setup
-- Not included here for security reasons

---============================================
--- BACKUP & RESTORE NOTES
---============================================
-- Backup: pg_dump -U postgres lingayat_matrimonial > backup.sql
-- Restore: psql -U postgres lingayat_matrimonial < backup.sql

---============================================
--- PERFORMANCE OPTIMIZATION
---============================================

-- Analyze tables for query optimization
ANALYZE users;
ANALYZE photos;
ANALYZE pdfs;
ANALYZE subscriptions;
ANALYZE payments;
ANALYZE interests;
ANALYZE activity_logs;
ANALYZE notifications;
ANALYZE admin;

-- Vacuum to reclaim space
VACUUM ANALYZE;

---============================================
--- SCHEMA VERSION
---============================================
-- Version: 1.0
-- Status: Ready for production
-- Last Updated: 2026-04-06
-- Next Review: 2026-05-06
