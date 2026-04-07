# AWS CloudFront & Lambda@Edge Security Configuration

Complete guide to securing Lingayat Sangam on AWS with CloudFront and Lambda@Edge.

---

## 📋 Overview

This guide covers deploying to AWS S3 + CloudFront with Lambda@Edge for security headers.

**Benefits**:
- ✅ Global CDN with 200+ edge locations
- ✅ Automatic HTTPS with free SSL
- ✅ DDoS protection
- ✅ High availability
- ✅ Automatic caching

---

## 🚀 Step 1: Prepare Build

```bash
# Build production bundle
npm run build

# Verify dist folder exists
ls -la dist/
```

---

## 📦 Step 2: Create S3 Bucket

### Via AWS Console

1. Go to **S3** → **Create bucket**
2. Bucket name: `lingayat-sangam-prod`
3. AWS Region: Choose closest to your users
4. Uncheck "Block all public access" (we'll use CloudFront instead)
5. Click **Create bucket**

### Via AWS CLI

```bash
aws s3 mb s3://lingayat-sangam-prod --region us-east-1
```

---

## 🔐 Step 3: Configure S3 Bucket Policy

### Block Public Access

Keep the default - we'll serve through CloudFront only.

### Bucket Policy

Add this policy to allow CloudFront access:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity XXXXX"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::lingayat-sangam-prod/*"
        }
    ]
}
```

Replace `XXXXX` with your CloudFront Origin Access Identity (OAI).

---

## 📤 Step 4: Upload Build to S3

### Via AWS CLI

```bash
# Upload all files
aws s3 sync dist/ s3://lingayat-sangam-prod --delete

# Verify upload
aws s3 ls s3://lingayat-sangam-prod --recursive
```

### Via AWS Console

1. Go to S3 bucket
2. Click **Upload**
3. Select all files from `dist/` folder
4. Click **Upload**

---

## 🌐 Step 5: Create CloudFront Distribution

### Via AWS Console

1. Go to **CloudFront** → **Create distribution**

2. **Origin Settings**:
   - Origin domain: Select S3 bucket
   - Origin path: (leave empty)
   - Origin access: Create OAI (Origin Access Identity)
   - Save OAI policy to bucket

3. **Default Cache Behavior**:
   - Viewer protocol: Redirect HTTP to HTTPS
   - Allowed HTTP methods: GET, HEAD, OPTIONS
   - Cache policy: Managed-CachingOptimized
   - Compress objects: Yes
   - Function associations: (next step)

4. **Alternate domain names**: yourdomain.com, www.yourdomain.com

5. **SSL Certificate**:
   - Request ACM certificate for yourdomain.com
   - Or use CloudFront default

6. **Default root object**: index.html

7. Create distribution (takes ~15 minutes)

### CloudFront Distribution ID

After creation, note the distribution ID: `E1234ABCDEF5`

---

## 🔒 Step 6: Add Security Headers with Lambda@Edge

### Create Lambda Function

1. Go to **Lambda** → **Functions** → **Create function**
2. Name: `lingayat-sangam-security-headers`
3. Runtime: **Python 3.11** (or Node.js 18)
4. Role: Create new role with basic Lambda permissions

### Add Code

#### Option A: Python

```python
import json

def lambda_handler(event, context):
    response = event['Records'][0]['cf']['response']
    headers = response['headers']

    # Add security headers
    headers['strict-transport-security'] = [{
        'key': 'Strict-Transport-Security',
        'value': 'max-age=31536000; includeSubDomains; preload'
    }]

    headers['x-content-type-options'] = [{
        'key': 'X-Content-Type-Options',
        'value': 'nosniff'
    }]

    headers['x-frame-options'] = [{
        'key': 'X-Frame-Options',
        'value': 'DENY'
    }]

    headers['x-xss-protection'] = [{
        'key': 'X-XSS-Protection',
        'value': '1; mode=block'
    }]

    headers['referrer-policy'] = [{
        'key': 'Referrer-Policy',
        'value': 'strict-origin-when-cross-origin'
    }]

    headers['content-security-policy'] = [{
        'key': 'Content-Security-Policy',
        'value': "default-src 'self'; script-src 'self' 'unsafe-inline' cdn.jsdelivr.net unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://sentry.io; frame-ancestors 'none';"
    }]

    headers['permissions-policy'] = [{
        'key': 'Permissions-Policy',
        'value': 'geolocation=(), microphone=(), camera=()'
    }]

    return response
```

#### Option B: Node.js

```javascript
'use strict';

exports.handler = (event, context, callback) => {
    const response = event.Records[0].cf.response;
    const headers = response.headers;

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

    headers['x-xss-protection'] = [{
        key: 'X-XSS-Protection',
        value: '1; mode=block'
    }];

    headers['referrer-policy'] = [{
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
    }];

    headers['content-security-policy'] = [{
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' cdn.jsdelivr.net unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://sentry.io; frame-ancestors 'none';"
    }];

    headers['permissions-policy'] = [{
        key: 'Permissions-Policy',
        value: 'geolocation=(), microphone=(), camera=()'
    }];

    callback(null, response);
};
```

### Deploy to Lambda@Edge

1. After creating function, go to **Versions** → **Publish new version**
2. Copy ARN (includes version number)
3. Go to **CloudFront** → **Behaviors** → **Default** → Edit
4. Function associations → Response headers policy:
   - Choose Lambda@Edge function
   - Paste Lambda ARN
   - Click Add association
5. Save distribution (5-10 minutes to propagate)

---

## 🔗 Step 7: Configure DNS

### Using Route 53 (Recommended)

1. Go to **Route 53** → **Hosted zones**
2. Create hosted zone for yourdomain.com
3. Create A record:
   - Name: yourdomain.com
   - Type: A
   - Alias: Yes
   - Alias target: CloudFront distribution
   - Routing policy: Simple
4. Create CNAME record for www:
   - Name: www
   - Type: CNAME
   - Value: yourdomain.com
5. Update domain registrar nameservers to Route 53

### Using External DNS

1. Note CloudFront domain: `d123456.cloudfront.net`
2. Add CNAME record at your DNS provider:
   - yourdomain.com → d123456.cloudfront.net

---

## ✅ Step 8: Verification

### Test HTTPS

```bash
curl -I https://yourdomain.com
```

Should show 200 OK with security headers.

### Check Headers

```bash
curl -I https://yourdomain.com | grep -i "strict-transport\|x-frame\|csp"
```

### Security Audit

Use online tools:
- https://securityheaders.com
- https://observatory.mozilla.org
- https://www.ssllabs.com/ssltest/

---

## 📊 Cache Configuration

### Static Assets (JS, CSS, Images)

Cached for 1 year (files have content hash):

```
Cache-Control: max-age=31536000, public, immutable
```

### HTML Files

Never cached (can update anytime):

```
Cache-Control: no-cache, no-store, must-revalidate
```

### Automatic Cache Invalidation

When you reupload to S3:

```bash
aws s3 sync dist/ s3://lingayat-sangam-prod --delete
```

CloudFront still serves cached versions. Invalidate manually:

```bash
aws cloudfront create-invalidation \
  --distribution-id E1234ABCDEF5 \
  --paths "/*"
```

Or use invalidation policy (paid):

```bash
# CloudFront can auto-invalidate based on S3 events
# More info: AWS CloudFront documentation
```

---

## 💰 Cost Optimization

### Estimate Costs

- **CloudFront**: ~$0.085 per GB (first 10TB/month)
- **S3**: ~$0.023 per GB stored
- **Lambda@Edge**: ~$0.60 per million requests
- **Data transfer**: Included in CloudFront

**Example**: 1M monthly visits, 2MB per visit:
- CloudFront: ~$170/month
- Lambda@Edge: ~$0.60/month
- S3: ~$1/month
- **Total**: ~$172/month

### Cost Reduction

1. **Use CloudFront aggressively** - Caches everything, cheaper than direct S3
2. **Compress assets** - Smaller files = lower bandwidth costs
3. **Use S3 Intelligent-Tiering** - Auto-archives old versions
4. **Set object expiration** - Delete old versions automatically

---

## 🔐 Additional Security

### WAF (Web Application Firewall)

Protect against common attacks:

1. Go to **WAF** → **Web ACLs** → **Create**
2. Add managed rules:
   - AWS managed rules (SQL injection, XSS)
   - Rate limiting (prevent DDoS)
3. Attach to CloudFront distribution

### DDoS Protection

CloudFront includes basic DDoS protection.

For advanced: Use **AWS Shield Advanced** (~$3000/month)

---

## 🆘 Troubleshooting

### Issue: "Access Denied" from S3

**Cause**: OAI permissions not set correctly

**Fix**:
1. Create OAI in CloudFront
2. Update S3 bucket policy with OAI ARN
3. Wait 5 minutes for propagation

### Issue: "404 Not Found" for SPA Routes

**Cause**: CloudFront not set to serve index.html for deep routes

**Fix**:
1. CloudFront → Behaviors → Default
2. Set "Default root object" to `index.html`
3. Add custom error responses:
   - 403 → /index.html (200)
   - 404 → /index.html (200)

### Issue: Old Content Still Showing

**Cause**: CloudFront cache serving stale content

**Fix**:
```bash
# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E1234ABCDEF5 \
  --paths "/*"
```

---

## 📋 Deployment Checklist

- [ ] S3 bucket created
- [ ] Build uploaded to S3
- [ ] CloudFront distribution created
- [ ] OAI configured with S3 policy
- [ ] Lambda@Edge function created
- [ ] Lambda@Edge attached to CloudFront
- [ ] DNS records configured
- [ ] SSL certificate installed
- [ ] HTTPS working (curl test)
- [ ] Security headers present
- [ ] SPA routing works (deep links)
- [ ] Cache working (check Cache-Control headers)
- [ ] Security audit passed (A+ grade)
- [ ] Mobile access tested
- [ ] Slow network tested (throttling)

---

## 📚 Resources

- AWS CloudFront: https://docs.aws.amazon.com/cloudfront/
- Lambda@Edge: https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html
- S3 + CloudFront: https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html
- WAF: https://docs.aws.amazon.com/waf/

---

**Last Updated**: April 3, 2026
**Status**: ✅ Production Ready
