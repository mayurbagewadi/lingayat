# 🔒 HTTPS/SSL & Security Headers Configuration

Complete guide to HTTPS, SSL/TLS, and security headers for Lingayat Sangam.

---

## 📋 Overview

This is a **frontend-only React application** (no backend server). HTTPS and security headers are configured at:

1. **Web Server** (Nginx, Apache)
2. **CDN** (Cloudflare, AWS CloudFront)
3. **Hosting Platform** (Vercel, Netlify, AWS S3)
4. **Domain Registrar** (DNS settings)

---

## 🔐 Security Headers Required

| Header | Purpose | Value |
|--------|---------|-------|
| **Strict-Transport-Security (HSTS)** | Force HTTPS | `max-age=31536000; includeSubDomains` |
| **X-Content-Type-Options** | Prevent MIME sniffing | `nosniff` |
| **X-Frame-Options** | Prevent clickjacking | `DENY` |
| **Content-Security-Policy** | XSS protection | Custom (see below) |
| **X-XSS-Protection** | Legacy XSS protection | `1; mode=block` |
| **Referrer-Policy** | Control referrer info | `strict-origin-when-cross-origin` |
| **Permissions-Policy** | Control browser features | Restrictive (see below) |

---

## 🚀 Deployment Scenarios

### Scenario 1: Vercel Deployment (Recommended)

**Best for**: Easiest setup, automatic HTTPS, managed security

#### Step 1: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Step 2: Create `vercel.json`

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' cdn.jsdelivr.net unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://sentry.io; frame-ancestors 'none';"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=()"
        }
      ]
    }
  ]
}
```

✅ **Benefits**:
- Automatic HTTPS with free SSL
- Automatic security headers
- No server management
- Global CDN

---

### Scenario 2: Netlify Deployment

**Best for**: GitHub integration, easy deployment

#### Step 1: Deploy to Netlify

1. Connect GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`

#### Step 2: Create `netlify.toml`

```toml
[[headers]]
for = "/*"
[headers.values]
  Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
  X-Content-Type-Options = "nosniff"
  X-Frame-Options = "DENY"
  X-XSS-Protection = "1; mode=block"
  Referrer-Policy = "strict-origin-when-cross-origin"
  Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' cdn.jsdelivr.net unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://sentry.io; frame-ancestors 'none';"
  Permissions-Policy = "geolocation=(), microphone=(), camera=()"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

✅ **Benefits**:
- Automatic HTTPS
- GitHub integration
- Automatic deployments
- Easy rollback

---

### Scenario 3: Nginx (Self-Hosted)

**Best for**: Full control, custom domain

#### Step 1: Install Let's Encrypt Certificate

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get free SSL certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renew (runs automatically)
sudo systemctl enable certbot.timer
```

#### Step 2: Configure Nginx

Create `/etc/nginx/sites-available/lingayat-sangam`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificates (from Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' cdn.jsdelivr.net unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://sentry.io; frame-ancestors 'none';" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # Root directory
    root /var/www/lingayat-sangam/dist;
    index index.html;

    # Serve static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Single Page App - route all requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Hide sensitive files
    location ~ /\. {
        deny all;
    }
    location ~ ~$ {
        deny all;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/lingayat-sangam /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

✅ **Benefits**:
- Full control
- Free SSL via Let's Encrypt
- Optimized performance
- Complete security header control

---

### Scenario 4: AWS CloudFront + S3

**Best for**: High availability, global CDN

#### Step 1: Deploy to S3

```bash
# Build the app
npm run build

# Sync to S3 bucket
aws s3 sync dist/ s3://your-bucket-name --delete
```

#### Step 2: Create CloudFront Distribution

1. AWS Console → CloudFront → Create Distribution
2. Choose S3 bucket as origin
3. Add SSL certificate (AWS Certificate Manager - free)
4. Set default root object: `index.html`
5. Add cache behaviors for static files

#### Step 3: Add Custom Headers in CloudFront

Create Lambda@Edge function:

```javascript
'use strict';

exports.handler = (event, context, callback) => {
    const request = event.Records[0].cf.request;
    const headers = request.headers;

    // Add security headers
    headers['strict-transport-security'] = [{
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload'
    }];

    headers['x-content-type-options'] = [{
        key: 'X-Content-Type-Options',
        value: 'nosniff'
    }];

    headers['x-frame-options'] = [{
        key: 'X-Frame-Options',
        value: 'DENY'
    }];

    headers['content-security-policy'] = [{
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' cdn.jsdelivr.net unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://sentry.io; frame-ancestors 'none';"
    }];

    headers['x-xss-protection'] = [{
        key: 'X-XSS-Protection',
        value: '1; mode=block'
    }];

    headers['referrer-policy'] = [{
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
    }];

    callback(null, request);
};
```

✅ **Benefits**:
- Global CDN with 200+ edge locations
- High availability
- DDoS protection
- Automatic HTTPS

---

## 📋 Content Security Policy (CSP) Explained

Our CSP:

```
default-src 'self'                              → Only same-origin by default
script-src 'self' 'unsafe-inline'               → Scripts from same-origin + inline
                   cdn.jsdelivr.net unpkg.com   → Allow CDN for libraries
style-src 'self' 'unsafe-inline'                → Styles from same-origin + inline
img-src 'self' data: https:                     → Images from same-origin, data URLs, HTTPS
font-src 'self' data:                           → Fonts from same-origin, data URLs
connect-src 'self' https://*.supabase.co        → API calls to same-origin + Supabase
            https://sentry.io                   → Error reporting to Sentry
frame-ancestors 'none'                          → Cannot be embedded in iframes (prevents clickjacking)
```

### Customize for Your Needs

If you add new CDNs or services, update the CSP:

```
script-src 'self' 'unsafe-inline'
  cdn.jsdelivr.net                              → Existing
  cdnjs.cloudflare.com                          → New CDN example
```

---

## 🔐 Security Headers Checklist

### Before Going Live

- [ ] HTTPS enabled on domain
- [ ] SSL certificate valid (not self-signed)
- [ ] Redirect HTTP → HTTPS
- [ ] HSTS header set (max-age=31536000)
- [ ] CSP policy configured
- [ ] X-Frame-Options set to DENY
- [ ] X-Content-Type-Options set to nosniff
- [ ] X-XSS-Protection enabled
- [ ] Referrer-Policy configured
- [ ] Permissions-Policy restrictive

### Verify Headers

Check headers using curl:

```bash
# Check all security headers
curl -I https://yourdomain.com | grep -E "Strict-Transport|X-Frame|X-Content|CSP"

# Output should show all headers with proper values
```

Or use online tools:
- https://securityheaders.com
- https://observatory.mozilla.org

---

## 🚨 SSL Certificate Best Practices

### ✅ DO

- ✅ Use trusted CA (Let's Encrypt, DigiCert, etc.)
- ✅ Renew before expiry (auto-renew when possible)
- ✅ Use wildcard cert for subdomains
- ✅ Include all domains (yourdomain.com + www.yourdomain.com)
- ✅ Monitor certificate expiry

### ❌ DON'T

- ❌ Use self-signed certificates in production
- ❌ Let certificates expire
- ❌ Ignore certificate warnings
- ❌ Mix HTTP and HTTPS content
- ❌ Use old TLS versions (< 1.2)

---

## 🔍 Testing & Validation

### Test HTTPS Configuration

```bash
# Check SSL/TLS configuration
nmap --script ssl-enum-ciphers -p 443 yourdomain.com

# Check certificate validity
openssl s_client -connect yourdomain.com:443

# Validate CSP policy
curl -I https://yourdomain.com | grep -i "content-security-policy"
```

### Security Score Tools

Check your security headers:

1. **Mozilla Observatory**: https://observatory.mozilla.org
   - Tests HTTPS, security headers, cookie settings
   - Gives A-F grade

2. **Security Headers**: https://securityheaders.com
   - Tests security headers only
   - Shows missing headers

3. **SSL Labs**: https://www.ssllabs.com/ssltest/
   - Deep SSL/TLS analysis
   - Finds vulnerabilities

### Target Scores

- **Mozilla Observatory**: A+ (100)
- **Security Headers**: A (90+)
- **SSL Labs**: A (90+)

---

## 🛠️ Troubleshooting

### Issue: "Mixed Content" Errors in Browser

**Problem**: Page loads HTTPS but loads resources via HTTP

**Solution**:
```nginx
# In Nginx config
add_header Content-Security-Policy "upgrade-insecure-requests;" always;
```

This auto-upgrades HTTP resources to HTTPS.

### Issue: "Invalid Certificate" Warning

**Problem**: Browser shows certificate warning

**Causes**:
- Certificate expired
- Domain mismatch
- Self-signed certificate

**Solution**:
- Check cert expiry: `openssl s_client -connect yourdomain.com:443 -showcerts`
- Ensure domain matches certificate
- Renew certificate if expired

### Issue: CSP Blocking Valid Resources

**Problem**: CSP blocks resources that should be allowed

**Solution**:
1. Check browser console for CSP violations
2. Add resource origin to CSP
3. Rebuild and redeploy

Example:
```
Blocked by CSP: https://mycdn.com/script.js
→ Add to CSP: script-src 'self' mycdn.com
```

---

## 📚 Additional Resources

### SSL/TLS

- Let's Encrypt: https://letsencrypt.org
- SSL Labs: https://www.ssllabs.com
- Mozilla SSL Config: https://ssl-config.mozilla.org

### Security Headers

- OWASP: https://owasp.org/www-project-secure-headers/
- CSP Reference: https://content-security-policy.com
- HTTP Headers: https://securityheaders.com

### Tools

- Mozilla Observatory: https://observatory.mozilla.org
- Security Headers: https://securityheaders.com
- SSL Labs: https://www.ssllabs.com/ssltest/

---

## 📋 Deployment Recommendation

### For Most Teams: **Vercel or Netlify**

- ✅ Automatic HTTPS
- ✅ Automatic security headers (with config)
- ✅ No server management
- ✅ Global CDN
- ✅ Automatic deployments

### For Enterprise: **AWS + CloudFront**

- ✅ Full control
- ✅ Global presence
- ✅ DDoS protection
- ✅ Advanced caching

### For Self-Hosted: **Nginx + Let's Encrypt**

- ✅ Cost-effective
- ✅ Full control
- ✅ Mature ecosystem
- ✅ Excellent performance

---

## ✅ Pre-Production Checklist

- [ ] Select deployment platform
- [ ] Configure HTTPS/SSL
- [ ] Add security headers
- [ ] Test with security scanners
- [ ] Monitor certificate expiry
- [ ] Set up auto-renewal
- [ ] Test from different regions
- [ ] Verify CSP policy working
- [ ] Check Google Search Console (SSL status)
- [ ] Update DNS records if needed
- [ ] Test mobile access
- [ ] Test with slow networks

---

**Last Updated**: April 3, 2026
**Status**: ✅ Production Ready
**Maintained By**: Claude Code
