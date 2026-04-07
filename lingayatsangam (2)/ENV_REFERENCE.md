# Environment Variables Reference

Complete reference for all environment variables used by the application.

---

## Required Variables

### `VITE_SUPABASE_URL`

**Type**: String (URL)
**Required**: Yes
**Example**: `https://qomnebvjrdlqvlwrpmod.supabase.co`

The URL of your Supabase project.

**Where to get it**:
1. Go to https://supabase.com/dashboard
2. Click on your project
3. Go to Settings → API
4. Copy "Project URL"

**Used by**: Database connections, authentication

---

### `VITE_SUPABASE_ANON_KEY`

**Type**: String (JWT Token)
**Required**: Yes
**Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...`

The anonymous key for frontend database access.

**Where to get it**:
1. Go to https://supabase.com/dashboard
2. Click on your project
3. Go to Settings → API
4. Copy "anon public" key

**Security**: Safe to expose in frontend code (readonly access)

**Used by**: All database queries from frontend

---

## Optional Variables

### `VITE_GEMINI_API_KEY`

**Type**: String
**Required**: No (feature disabled if empty)
**Example**: `AIzaSyC...`

Google Gemini API key for AI bio generation.

**Where to get it**:
1. Go to https://aistudio.google.com/app/apikey
2. Create new API key
3. Copy the key

**Current Status**: Not actively used
**Used by**: AIBioGenerator component (if enabled)

---

### `VITE_SENTRY_DSN`

**Type**: String (URL)
**Required**: No (error tracking disabled if empty)
**Example**: `https://xxxxx@xxxxx.ingest.sentry.io/12345`

Sentry error tracking DSN for production error logging.

**Where to get it**:
1. Go to https://sentry.io
2. Create project for "React"
3. Go to Settings → Client Keys (DSN)
4. Copy the DSN

**When to use**: Production deployments only

**Behavior**:
- ✅ Enabled in production builds
- ❌ Disabled in development (even if configured)
- Captures: Runtime errors, React errors, console errors

**Used by**: ErrorBoundary, index.tsx (Sentry initialization)

---

### `VITE_APP_VERSION`

**Type**: String (semantic version)
**Required**: No (defaults to 0.0.0)
**Example**: `1.2.3`

Application version for tracking and debugging.

**Format**: MAJOR.MINOR.PATCH (semantic versioning)

**When to update**: With each release

**Used by**:
- Sentry error reporting (release tracking)
- Package.json version
- Build artifacts

**Example values**:
- `0.0.0` - Development/pre-release
- `1.0.0` - First production release
- `1.2.3` - Current version

---

## Environment-Specific Configuration

### Development (.env.local)

```env
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_dev_anon_key
VITE_GEMINI_API_KEY=your_optional_key
VITE_SENTRY_DSN=
VITE_APP_VERSION=0.0.0-dev
```

**Notes**:
- Sentry disabled (no error tracking noise)
- Can use development Supabase project
- Optional keys can be omitted

### Production (.env.production.local)

```env
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_prod_anon_key
VITE_GEMINI_API_KEY=your_optional_key
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
VITE_APP_VERSION=1.0.0
```

**Notes**:
- Sentry enabled for error tracking
- Use production Supabase project
- Version should match package.json

---

## Future Variables (Reserved)

These variables are reserved for future features:

```env
# Google Drive API (photo storage)
VITE_GOOGLE_DRIVE_API_KEY=future_use

# Razorpay (payment processing)
VITE_RAZORPAY_KEY_ID=future_use

# Email service (notifications)
VITE_SENDGRID_API_KEY=future_use

# Analytics
VITE_GA_TRACKING_ID=future_use
```

---

## How Variables Are Loaded

### File Priority

1. `.env.local` (local machine, highest priority)
2. `.env.production.local` (production-specific)
3. `.env.[mode].local` (mode-specific)
4. `.env.[mode]` (mode defaults)
5. `.env` (baseline)

### Access in Code

Variables must be prefixed with `VITE_` to be exposed to frontend:

```typescript
// ✅ Available in browser
const url = import.meta.env.VITE_SUPABASE_URL;

// ❌ NOT available in browser (wouldn't start with VITE_)
const secret = import.meta.env.DATABASE_PASSWORD;
```

### When Variables Are Loaded

- **Build time**: Variables are baked into the bundle
- **Runtime**: Cannot be changed without rebuilding
- **Restart needed**: Must restart dev server after changing .env.local

---

## Validation & Error Handling

### Missing Required Variables

If `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are missing:

```
Error: Could not find Supabase credentials
```

**Fix**: Add credentials to `.env.local`

### TypeScript Support

Get intellisense for environment variables:

```typescript
// tsconfig.json includes "vite/client" in types
// This enables autocomplete for import.meta.env
```

---

## Security Best Practices

### ✅ DO

- ✅ Keep `.env.local` in `.gitignore`
- ✅ Use different keys for dev/prod
- ✅ Rotate Sentry DSN if exposed
- ✅ Use environment variables for all secrets
- ✅ Share keys via secure channels (password manager, not email)

### ❌ DON'T

- ❌ Commit `.env.local` to version control
- ❌ Share keys in Slack or unencrypted email
- ❌ Use real production keys in development
- ❌ Hardcode secrets in source code
- ❌ Log sensitive values to console

---

## Troubleshooting

### Issue: Variables are `undefined`

**Checklist**:
- [ ] Variable name starts with `VITE_` ?
- [ ] `.env.local` exists?
- [ ] Correct spelling (case-sensitive)?
- [ ] Dev server restarted?

### Issue: Supabase connection fails

**Checklist**:
- [ ] `VITE_SUPABASE_URL` is correct?
- [ ] `VITE_SUPABASE_ANON_KEY` is correct?
- [ ] Project exists in Supabase dashboard?
- [ ] Network connection active?

### Issue: Sentry not reporting errors

**Checklist**:
- [ ] Building for production? (`npm run build`)
- [ ] `VITE_SENTRY_DSN` is configured?
- [ ] Project exists in Sentry dashboard?

---

## Variable Validation

### TypeScript Strict Mode

All environment variable access is type-safe:

```typescript
// Type: string | undefined
const url = import.meta.env.VITE_SUPABASE_URL;

// Safe access with fallback
const url = import.meta.env.VITE_SUPABASE_URL || '';
```

### Runtime Validation

Critical variables are validated on app load:

```typescript
// From lib/supabase.ts
if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error('Supabase URL not configured');
}
```

---

## Environment Variables by Component

| Component | Variable | Purpose |
|-----------|----------|---------|
| lib/supabase.ts | SUPABASE_URL, ANON_KEY | Database connection |
| services/sentry.ts | SENTRY_DSN, APP_VERSION | Error tracking |
| components/AIBioGenerator.tsx | GEMINI_API_KEY | AI features |
| vite.config.ts | APP_VERSION | Build metadata |

---

## Complete Configuration Checklist

- [ ] `.env.local` created
- [ ] `VITE_SUPABASE_URL` set
- [ ] `VITE_SUPABASE_ANON_KEY` set
- [ ] `VITE_GEMINI_API_KEY` set (optional)
- [ ] `VITE_SENTRY_DSN` set (optional, for production)
- [ ] `VITE_APP_VERSION` set
- [ ] `.env.local` in `.gitignore`
- [ ] Dev server restarted
- [ ] App runs without errors (`npm run dev`)

---

**Last Updated**: April 3, 2026
**For Support**: See [SETUP.md](./SETUP.md)
