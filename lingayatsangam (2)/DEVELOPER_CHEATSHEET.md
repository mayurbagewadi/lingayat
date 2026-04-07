# 🎯 Developer Cheatsheet

Quick reference for common tasks and commands.

---

## ⚡ Essential Commands

```bash
# Install dependencies (run once)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Format code
npm run format

# Check TypeScript
npx tsc --noEmit
```

---

## 🔐 Environment Setup

```bash
# Copy template to local config
cp .env.example .env.local

# Edit with your credentials (never commit this file!)
nano .env.local  # or use your editor

# Restart dev server after changes
npm run dev
```

**Required for .env.local:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 🏗️ Project Structure

```
components/       → React UI components
services/         → Business logic & utilities
lib/              → Helper functions
.env.example      → Environment variable template
SETUP.md          → Complete setup guide
QUICK_START.md    → 5-minute setup
```

---

## 📝 Code Patterns

### Sanitize User Input (on submission)

```typescript
import { sanitizeInput } from '../services/sanitizer';

const clean = sanitizeInput(userProvidedText);
```

### Sanitize for Display (in components)

```typescript
import { sanitizeProfileForDisplay, getSafeDisplayValue } from '../services/displaySanitizer';

const safe = sanitizeProfileForDisplay(profile);
const safeValue = getSafeDisplayValue(profileName, 'Unknown');
```

### Rate Limiting

```typescript
import { checkLoginRateLimit, resetLoginRateLimit } from '../services/rateLimiter';

checkLoginRateLimit(email);  // Throws if exceeded
// ... perform operation ...
resetLoginRateLimit(email);  // Clear counter on success
```

### Error Tracking (Sentry)

```typescript
import { captureError, setUserContext } from '../services/sentry';

// Log custom error
captureError('Custom message', { context: 'data' });

// Set user for error context
setUserContext(userId, email, name);
```

---

## 🔗 Database Queries

### Using Supabase Client

```typescript
import { supabase } from '../lib/supabase';

// Select
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', profileId);

// Insert
const { data, error } = await supabase
  .from('profiles')
  .insert([{ full_name, email, mobile }]);

// Update
const { data, error } = await supabase
  .from('profiles')
  .update({ full_name: newName })
  .eq('id', profileId);
```

---

## 🎨 Component Structure

### Functional Component Template

```typescript
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ComponentProps {
  onNavigate: (view: string) => void;
}

const MyComponent: React.FC<ComponentProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Setup logic
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Component JSX */}
    </motion.div>
  );
};

export default MyComponent;
```

---

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run E2E Tests (Playwright)

```bash
npx playwright test
```

### Run Specific Test

```bash
npm test -- --testNamePattern="LoginFlow"
```

---

## 🐛 Debugging

### Browser DevTools

1. Press `F12` to open DevTools
2. Check Console tab for errors
3. Use Network tab for API calls
4. Use React DevTools browser extension

### Check Environment Variables

```typescript
// In browser console:
console.log(import.meta.env.VITE_SUPABASE_URL);
```

### TypeScript Errors

```bash
# Find type errors before building
npx tsc --noEmit
```

---

## 🚀 Building for Production

```bash
# Build optimized bundle
npm run build

# Check output
ls -la dist/

# Preview production build
npm run preview

# Access at http://localhost:4173
```

---

## 🔐 Security Checklist

- ✅ `.env.local` is in `.gitignore`
- ✅ Never commit `.env.local`
- ✅ Sanitize all user input with `sanitizeInput()`
- ✅ Display user data with `sanitizeProfileForDisplay()`
- ✅ Use rate limiting on auth endpoints
- ✅ Enable TypeScript strict mode
- ✅ Review error logs in Sentry
- ✅ Disable source maps in production (enabled by default)

---

## 📊 Important Files

| File | Purpose |
|------|---------|
| `.env.local` | Your configuration (DON'T commit) |
| `.env.example` | Template for env variables |
| `SETUP.md` | Complete setup guide |
| `QUICK_START.md` | 5-minute setup |
| `CLAUDE.md` | Architecture & scope |
| `vite.config.ts` | Build configuration |
| `tsconfig.json` | TypeScript settings |
| `package.json` | Dependencies & scripts |

---

## 🔗 Useful Links

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Sentry Dashboard**: https://sentry.io
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **TypeScript Docs**: https://www.typescriptlang.org/docs

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Port 5050 in use | `npm run dev -- --port 3000` |
| Env vars undefined | Restart dev server |
| Supabase connection fails | Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY |
| TypeScript errors | Run `npx tsc --noEmit` to check |
| Module not found | Run `npm install` |
| Build fails | Check `npm run build` output carefully |

---

## 💡 Pro Tips

1. **Use React DevTools** - Browser extension for debugging
2. **Use Supabase Studio** - Check data in real time
3. **Check Console** - Most errors appear here first
4. **Restart Dev Server** - After changing `.env.local`
5. **Use TypeScript** - Intellisense catches bugs early
6. **Test Before Committing** - `npm run build` before push

---

## 📖 Full Documentation

Need more details? Check:
- **[QUICK_START.md](./QUICK_START.md)** - 5-minute setup
- **[SETUP.md](./SETUP.md)** - Complete guide
- **[ENV_REFERENCE.md](./ENV_REFERENCE.md)** - Environment variables
- **[DOCS_INDEX.md](./DOCS_INDEX.md)** - All documentation

---

**Print this page for quick reference!**

Last Updated: April 3, 2026
