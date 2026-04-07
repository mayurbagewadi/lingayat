# Deployment Guide

## Pre-Deployment Checklist

- [ ] All tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] Google Drive API configured
- [ ] Razorpay keys configured
- [ ] Email service configured
- [ ] All secrets stored in Vercel
- [ ] Production database prepared
- [ ] Backup strategy in place

## Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```bash
# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_ACCESS_SECRET=your_32_char_secret_min
JWT_REFRESH_SECRET=your_32_char_refresh_secret

# GOOGLE OAUTH
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# RAZORPAY
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx

# EMAIL
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# API
NEXT_PUBLIC_API_URL=https://yourdomain.com
NODE_ENV=production
```

## Vercel Deployment

### 1. Connect Repository

```bash
vercel link
```

### 2. Configure Environment Variables

Add all secrets in Vercel dashboard:
- Settings → Environment Variables
- Set for Production environment

### 3. Deploy

```bash
vercel deploy --prod
```

Or enable automatic deployments:
- GitHub → Settings → Vercel integration
- Auto-deploy on main branch

### 4. Verify Deployment

```bash
curl https://yourdomain.com/api/health
```

Should return 200 with health status.

## Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Configure region (closer to users)
4. Enable backups

### 2. Run Migrations

```bash
npm run db:migrate
```

This creates all required tables and indexes.

### 3. Seed Initial Data

```sql
INSERT INTO subscription_plans (name, price, duration_days, features) VALUES
('1 Month', 999, 30, '["Browse profiles", "Express interest", "View messages"]'),
('3 Months', 2499, 90, '["Browse profiles", "Express interest", "View messages"]'),
('1 Year', 7999, 365, '["Browse profiles", "Express interest", "View messages"]');
```

## Google Drive Setup

### 1. Create OAuth Application

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable Google Drive API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI: `https://yourdomain.com/api/google-drive/callback`
6. Copy Client ID and Secret

### 2. Create Service Folder

1. Create folder in Google Drive: "Matrimonial_Photos"
2. Create folder: "PDF_Bios"
3. Share folder with service account (if using service account)

## Razorpay Setup

### 1. Create Account

1. Go to [razorpay.com](https://razorpay.com)
2. Sign up and verify account
3. Get API keys from Dashboard

### 2. Configure Webhook

1. Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/subscription/verify`
3. Subscribe to: `payment.authorized`, `payment.failed`

## Email Configuration

### Using Gmail

1. Enable 2-factor authentication
2. Generate app-specific password
3. Use in SMTP_PASSWORD

### Using SendGrid

1. Create SendGrid account
2. Generate API key
3. Update SMTP configuration

## Monitoring

### Application Metrics

Monitor in Vercel dashboard:
- Function duration
- Cold start times
- Error rate
- Memory usage

### Database Monitoring

In Supabase:
- Monitor connection count
- Query performance
- Disk usage
- Backup status

### Error Tracking

Set up error tracking (Sentry recommended):

```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1
});
```

## Scaling Considerations

### Database

- Add read replicas for high traffic
- Enable connection pooling
- Monitor query performance

### File Storage

- Monitor Google Drive storage usage
- Clean up old files periodically
- Consider archival strategy

### API Rate Limiting

Vercel Functions scale automatically. Monitor:
- Function duration (max 10s for Hobby, 60s for Pro)
- Memory usage (max 3008 MB)
- Concurrent executions

## Backup Strategy

### Database

```bash
# Automated backups
# Configure in Supabase: Settings → Backups
# - Daily backups (14 days retention)
- Weekly backups (8 weeks retention)
- Restore from dashboard if needed
```

### Code

- GitHub repository (primary source)
- Vercel deployments (backup of releases)

## Rollback Procedure

If deployment fails:

1. **Vercel**
   - Deployments → Select previous version
   - Click "Promote to Production"

2. **Database**
   - Supabase → Backups → Restore from date
   - Test on staging first

## Performance Optimization

### Frontend

- Enable Next.js image optimization
- Implement code splitting
- Use lazy loading for components
- Compress assets

### Backend

- Add caching headers
- Optimize database queries
- Use indexes efficiently
- Monitor slow queries

### Monitoring

```bash
# Test performance
npm run build
npm run start

# Check build size
npm run analyze
```

## Security

### HTTPS

- Automatically handled by Vercel
- Force HTTPS redirects

### Secrets Management

- Use Vercel Environment Variables (not in git)
- Rotate keys regularly
- Limit access to secrets

### Database Security

- Enable SSL connections
- Use strong passwords
- Restrict IP access (if possible)
- Regular security audits

## Disaster Recovery

### Plan

1. **Communication**: Notify users of outage
2. **Diagnosis**: Identify root cause
3. **Mitigation**: Revert problematic changes
4. **Recovery**: Restore from backups if needed
5. **Analysis**: Post-mortem review

### Contact List

- Admin team
- Vercel support
- Supabase support
- Domain registrar

## Post-Launch

- Monitor error logs daily
- Check user feedback
- Monitor performance metrics
- Plan gradual feature rollout
- Schedule security audits
