# ⚡ Quick Start (5 Minutes)

Get up and running in 5 minutes.

## 1️⃣ Install Dependencies (1 min)

```bash
npm install
```

## 2️⃣ Setup Environment (2 min)

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
# VITE_SUPABASE_URL=your_url
# VITE_SUPABASE_ANON_KEY=your_key
```

Get credentials from: https://supabase.com/dashboard

## 3️⃣ Start Development Server (1 min)

```bash
npm run dev
```

Access: **http://localhost:5050**

## 4️⃣ Test Features (1 min)

✅ See landing page
✅ Toggle dark/light theme (top right)
✅ Click "Create Profile" to register
✅ Login with test account
✅ Browse profiles

---

## 📚 Full Setup

For complete setup with database, see **[SETUP.md](./SETUP.md)**

## 🔗 Quick Links

- Supabase: https://supabase.com/dashboard
- Sentry (optional): https://sentry.io
- Docs: [SETUP.md](./SETUP.md) | [.env.example](./.env.example)

---

## 🚀 Production Build

```bash
npm run build       # Build optimized bundle
npm run preview     # Preview production build
```

Output: `dist/` folder

---

**Issues?** Check [SETUP.md Troubleshooting](./SETUP.md#-troubleshooting)
