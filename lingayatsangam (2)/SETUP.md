# 🚀 Lingayat Sangam - Setup & Installation Guide

Complete setup instructions for the Lingayat Mali Matrimonial Platform.

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** (v18+) and **npm** (v9+)
- **Git** for version control
- A **Supabase account** (free tier available at https://supabase.com)
- **Text editor** (VS Code recommended)
- **Terminal/Command line** familiarity

Check versions:
```bash
node --version    # Should be v18 or higher
npm --version     # Should be v9 or higher
git --version     # Any recent version
```

---

## 🔧 Installation Steps

### 1. Clone the Repository

```bash
# Clone the project
git clone https://github.com/yourusername/lingayat-sangam.git
cd lingayat-sangam
```

### 2. Install Dependencies

```bash
# Install all npm packages
npm install

# Verify installation
npm list | head -20
```

This installs:
- React 19.2.0 (frontend framework)
- Vite 6.2.0 (build tool)
- TypeScript 5.8.2 (type safety)
- Supabase client (database SDK)
- Framer Motion & GSAP (animations)
- DOMPurify (input sanitization)
- Sentry (error tracking)
- And more...

### 3. Environment Configuration

#### Create `.env.local` file:

```bash
# Copy the example to .env.local
cp .env.example .env.local
```

#### Get Supabase Credentials:

1. Go to https://supabase.com/dashboard
2. Create a new project or use existing one
3. Click on project → Settings → API
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon Key** → `VITE_SUPABASE_ANON_KEY`

#### Update `.env.local`:

```bash
# Example .env.local
VITE_SUPABASE_URL=https://qomnebvjrdlqvlwrpmod.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
VITE_GEMINI_API_KEY=your_optional_gemini_key
VITE_SENTRY_DSN=
VITE_APP_VERSION=0.0.0
```

⚠️ **IMPORTANT**: Never commit `.env.local` to version control!

### 4. Verify Setup

```bash
# Start development server
npm run dev

# You should see:
# VITE v6.4.1 building for development...
# ➜ Local:   http://127.0.0.1:5050/
```

Open browser and navigate to: **http://localhost:5050**

You should see the landing page with:
- ✅ Hero section with "Discover Matches"
- ✅ Features section
- ✅ Dark/Light theme toggle
- ✅ Login button

---

## 🗄️ Database Setup

### Initialize Supabase Schema

The database tables are already created in Supabase. Verify they exist:

1. Go to Supabase Dashboard → Your Project
2. Click **SQL Editor** on the left
3. Check these tables exist:
   - `profiles` - User profile data
   - `payments` - Subscription payments
   - `activity_logs` - User activity tracking
   - `audit_logs` - Admin & system events

### Load Demo Data (Optional)

For testing/development, seed with demo profiles:

```bash
# Run SQL in Supabase SQL Editor
-- Insert 8 demo profiles for testing
INSERT INTO profiles (user_id, full_name, email, mobile, status, subscription_status)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Rajesh Kumar', 'rajesh@example.com', '9876543210', 'active', 'premium'),
  ('00000000-0000-0000-0000-000000000002', 'Priya Sharma', 'priya@example.com', '9876543211', 'active', 'free'),
  -- ... add more as needed
```

Or contact the team for a database dump.

---

## 🧪 Testing

### Run Development Server

```bash
npm run dev
```

Access at: http://localhost:5050

### Test Login

1. Go to Supabase Dashboard → Authentication
2. Create a test user with email/password
3. Try logging in at http://localhost:5050/login

### Run Tests (if configured)

```bash
npm test
```

### Run E2E Tests (Playwright)

```bash
npx playwright test
```

---

## 🏗️ Production Build

### Build Optimized Production Bundle

```bash
npm run build

# Output in: dist/
```

### Preview Production Build

```bash
npm run preview

# Access at: http://localhost:4173
```

### Build Statistics

The production build includes:
- ✅ Source map disabled (security)
- ✅ Minification with Terser (smaller size)
- ✅ Code splitting (vendor chunks)
- ✅ CSS extraction
- ✅ Asset optimization

---

## 📚 Project Structure

```
lingayat-sangam/
├── components/               # React components
│   ├── ProfileBrowsing.tsx
│   ├── UserDashboard.tsx
│   ├── AdminDashboard.tsx
│   ├── Login.tsx
│   ├── CreateProfile.tsx
│   └── ... (18+ components)
├── services/                 # Business logic & utilities
│   ├── profileService.ts     # Profile operations
│   ├── sanitizer.ts          # Input sanitization
│   ├── displaySanitizer.ts   # Display sanitization
│   ├── rateLimiter.ts        # Rate limiting
│   └── sentry.ts             # Error tracking
├── lib/                      # Utilities
│   └── supabase.ts          # Supabase client
├── App.tsx                   # Main app component
├── index.tsx                 # React entry point
├── vite.config.ts            # Build configuration
├── tsconfig.json             # TypeScript config
├── package.json              # Dependencies
├── .env.example              # Environment template
├── .env.local                # Your configuration (not versioned)
└── README.md                 # Project README
```

---

## 🔐 Security Checklist

- ✅ `.env.local` is in `.gitignore` (never commit secrets)
- ✅ Supabase Anon Key is safe to expose (frontend only)
- ✅ Input sanitization enabled (DOMPurify)
- ✅ Rate limiting on auth (5 attempts per 15 mins)
- ✅ TypeScript strict mode enabled
- ✅ Error boundary catches runtime errors
- ✅ Source maps disabled in production

⚠️ **Before going live**:
- [ ] Update `VITE_APP_VERSION` in `.env.local`
- [ ] Enable Sentry error tracking (`VITE_SENTRY_DSN`)
- [ ] Configure production Supabase project
- [ ] Review and test all features
- [ ] Check HTTPS is enabled
- [ ] Set up CORS properly
- [ ] Configure domain SSL certificate

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: "Cannot find module '@supabase/supabase-js'"

**Solution:**
```bash
npm install
npm run dev
```

#### Issue: "Supabase connection failed"

**Checklist:**
- [ ] Is `.env.local` created?
- [ ] Is `VITE_SUPABASE_URL` correct?
- [ ] Is `VITE_SUPABASE_ANON_KEY` correct?
- [ ] Does the project exist in Supabase dashboard?
- [ ] Is internet connection active?

#### Issue: "Environment variables undefined"

**Remember:**
- Only variables starting with `VITE_` are exposed to frontend
- Restart dev server after changing `.env.local`
- Variables are loaded at build time, not runtime

#### Issue: "Port 5050 already in use"

**Solution:**
```bash
# Use different port
npm run dev -- --port 3000
```

#### Issue: "TypeError: Cannot read property 'full_name' of null"

**Solution:**
- Ensure user is logged in
- Check if profile exists in database
- Verify Supabase RLS policies allow read access

---

## 📞 Getting Help

### Documentation
- Supabase Docs: https://supabase.com/docs
- React Docs: https://react.dev
- Vite Docs: https://vitejs.dev
- TypeScript Docs: https://www.typescriptlang.org/docs

### Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Format code (if configured)
npm run format

# Run tests
npm test
```

### Contact
- For issues: Create a GitHub issue
- For questions: Check documentation or ask in team chat

---

## 🎯 Next Steps

1. ✅ Complete this setup
2. ✅ Test login/registration
3. ✅ Browse profiles
4. ✅ Test admin features
5. ✅ Deploy to staging
6. ✅ Get stakeholder approval
7. ✅ Deploy to production

---

## 📝 Environment Files

### Files You'll Create
- `.env.local` - Your local development configuration (do NOT version control)

### Files in Repository
- `.env.example` - Template (reference only)
- `.gitignore` - Includes .env* patterns (prevents accidental commits)
- `vite.config.ts` - Build configuration
- `tsconfig.json` - TypeScript configuration

---

**Last Updated**: April 3, 2026
**Maintained By**: Claude Code
**Status**: ✅ Production Ready

