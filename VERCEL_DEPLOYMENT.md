# Vercel Deployment Setup

**Architecture:** Next.js + Vercel Functions + Supabase

---

## Project Structure

```
lingayat/
├── pages/                          # Frontend pages
│   ├── index.js                    # Landing page
│   ├── login.js
│   ├── register.js
│   ├── profile/
│   │   ├── index.js
│   │   └── edit.js
│   ├── browse.js
│   └── _app.js
│
├── api/                            # Backend API Routes (Serverless Functions)
│   ├── auth/
│   │   ├── register.js             # POST /api/auth/register
│   │   ├── login.js                # POST /api/auth/login
│   │   ├── logout.js               # POST /api/auth/logout
│   │   └── refresh.js              # POST /api/auth/refresh
│   │
│   ├── profile.js                  # GET/PUT /api/profile
│   ├── photo.js                    # POST /api/photo
│   ├── pdf.js                      # POST /api/pdf
│   ├── subscription.js             # POST /api/subscription
│   ├── search.js                   # GET /api/search
│   ├── interest.js                 # POST /api/interest
│   │
│   ├── webhook/
│   │   ├── razorpay.js             # Razorpay webhook
│   │   └── google.js               # Google OAuth callback
│   │
│   ├── cron/
│   │   ├── subscription-expiry.js
│   │   └── notification-digest.js
│   │
│   └── utils/
│       ├── supabase.js             # Supabase client
│       ├── jwt.js                  # JWT utilities
│       ├── errors.js               # Error handling
│       └── validation.js           # Input validation
│
├── lib/                            # Shared utilities
│   ├── supabase.js
│   └── api.js
│
├── public/                         # Static assets
│
├── styles/                         # CSS files
│
├── vercel.json                     # Vercel configuration
├── next.config.js                  # Next.js configuration
├── .env.local.example              # Environment template
└── package.json
```

---

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Supabase

#### Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Wait for project initialization
4. Get credentials:
   - `SUPABASE_URL`
   - `SUPABASE_KEY` (anon key)
   - `SUPABASE_SECRET` (service role key)

#### Import Database Schema
```bash
# In Supabase SQL Editor, run:
# Copy contents of DATABASE_SCHEMA.sql
# Paste into SQL Editor
# Execute
```

Or use Supabase CLI:
```bash
npm install -g supabase
supabase link --project-id <your-project-id>
supabase db push
```

### 3. Setup Environment Variables

Create `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_ACCESS_SECRET=generate_32_char_random_string
JWT_REFRESH_SECRET=generate_32_char_random_string

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/webhook/google

# Razorpay
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# API
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. Start Development Server
```bash
npm run dev
```

Server: http://localhost:3000

---

## API Route Example

### File: `pages/api/auth/register.js`

```javascript
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name, dob, gender, sub_caste } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([
        {
          email,
          password_hash: hashedPassword,
          name,
          dob,
          gender,
          sub_caste,
          profile_status: 'pending'
        }
      ])
      .select();

    if (userError) {
      return res.status(400).json({ error: userError.message });
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user[0].id, email },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user[0].id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      success: true,
      user: user[0],
      accessToken,
      refreshToken
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
```

---

## Deploy to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Connect to Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Select your GitHub repository
4. Click "Import"

### 3. Configure Environment Variables
In Vercel Project Settings → Environment Variables, add:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
SMTP_HOST
SMTP_USER
SMTP_PASSWORD
```

### 4. Deploy
Click "Deploy"

Live at: `https://your-project.vercel.app`

---

## Key Differences from Traditional Express

| Aspect | Express | Vercel Functions |
|--------|---------|-----------------|
| Server | Always running | Starts on request |
| Scaling | Manual | Automatic |
| Database | Self-managed | Supabase (managed) |
| Cost | Fixed server cost | Pay per request |
| Startup | Fast | ~1-2 sec cold start |
| Deployment | Manual or via Docker | Git push |

---

## Supabase vs Self-Managed PostgreSQL

| Feature | Supabase | Self-Managed |
|---------|----------|--------------|
| Setup | 2 minutes | 30 minutes |
| Backups | Automatic | Manual |
| Scaling | Automatic | Manual |
| Security | Enterprise-grade | Your responsibility |
| Cost | $25-100/month | $10-20/month |
| Maintenance | Zero | You manage |
| Compliance | GDPR, SOC2 | Your responsibility |

**Recommendation:** Use Supabase for ease, reliability, and compliance.

---

## Cold Start Performance

Vercel Functions have ~1-2 second cold start on first request.

**Optimization:**
1. Keep function size small
2. Lazy load dependencies
3. Use serverless-friendly libraries
4. Implement caching (Redis, CloudFlare)

---

## Database Limits (Supabase Free Plan)

- Storage: 500 MB
- Bandwidth: 2 GB
- Row count: Unlimited
- Connections: 10

**Upgrade Plan:** $25/month for production use.

---

## Monitoring & Logs

### Vercel Logs
```bash
vercel logs
```

### Supabase Logs
- Dashboard → Logs
- Real-time monitoring
- SQL query analysis

---

## Next Steps

1. Create Supabase account
2. Create .env.local file
3. Implement API routes (one at a time)
4. Build frontend pages
5. Deploy to Vercel

---

**Status:** ✅ Vercel setup configured
**Database:** Supabase (managed PostgreSQL)
**Hosting:** Vercel (serverless)
**Cost:** ~$25-50/month (Supabase + Vercel usage)
