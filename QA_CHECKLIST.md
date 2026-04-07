# QA Testing Checklist

## Pre-Launch Testing

### Authentication
- [ ] Signup form validation works
- [ ] Login with valid credentials succeeds
- [ ] Login with invalid credentials fails
- [ ] Password reset flow works
- [ ] Email verification works
- [ ] Token refresh works
- [ ] Session timeout works
- [ ] Logout clears authentication

### User Profile
- [ ] Profile page loads correctly
- [ ] User can view their profile
- [ ] Profile editing works
- [ ] Profile deletion option appears
- [ ] User data persists correctly

### Photo Upload
- [ ] Photo upload accepts valid images
- [ ] Photo upload rejects invalid files
- [ ] File size validation works (5MB limit)
- [ ] Multiple photos can be uploaded
- [ ] Photo preview works
- [ ] Photo deletion works
- [ ] Photos appear in profile
- [ ] Photo URL generation works

### PDF Upload
- [ ] PDF upload accepts valid PDFs
- [ ] PDF upload rejects invalid files
- [ ] File size validation works (10MB limit)
- [ ] PDF status shows "pending" initially
- [ ] PDF can only be viewed when approved

### Admin PDF Approval
- [ ] Admin can see pending PDFs list
- [ ] Admin can approve PDFs
- [ ] Admin can reject PDFs
- [ ] User is notified of approval
- [ ] Approved PDFs are visible to subscribers

### Search & Browsing
- [ ] Non-subscribers cannot search profiles
- [ ] Subscribers can search profiles
- [ ] Search filtering works
- [ ] Pagination works correctly
- [ ] Profile details load correctly
- [ ] Photos display in profile view

### Subscription & Payments
- [ ] Subscription plans display correctly
- [ ] Plan pricing is accurate
- [ ] Payment gateway integrates correctly
- [ ] Razorpay popup opens
- [ ] Payment verification works
- [ ] Subscription status updates after payment
- [ ] User access changes after subscription
- [ ] Subscription expiry works

### Notifications
- [ ] Interest notifications are created
- [ ] Notifications appear in panel
- [ ] Unread count is accurate
- [ ] Mark as read works
- [ ] Mark all as read works

### Express Interest
- [ ] User can express interest
- [ ] Cannot express interest twice
- [ ] Cannot express interest in self
- [ ] Interest notifications sent correctly

### Admin Dashboard
- [ ] Stats display correctly
- [ ] User count is accurate
- [ ] Subscriber count is accurate
- [ ] Revenue calculation is correct
- [ ] Recent payments show

### Admin User Management
- [ ] User list loads
- [ ] Search filters work
- [ ] Role can be changed
- [ ] Subscription status can be changed
- [ ] Pagination works

### Admin Payment Management
- [ ] Payment list loads
- [ ] Filter by status works
- [ ] Revenue calculation is correct
- [ ] Payment details are accurate

### Google Drive Integration
- [ ] Connection status shows correctly
- [ ] Storage usage displays
- [ ] Folders are created
- [ ] Files upload to Google Drive
- [ ] File sharing works correctly

---

## Performance Testing

### Page Load Times
- [ ] Homepage: < 2 seconds
- [ ] Login page: < 1 second
- [ ] Search page: < 3 seconds (after search)
- [ ] Profile page: < 2 seconds
- [ ] Admin dashboard: < 2 seconds

### API Response Times
- [ ] Auth endpoints: < 500ms
- [ ] Search queries: < 800ms
- [ ] File uploads: < 5 seconds
- [ ] Admin operations: < 1 second

### Database Performance
- [ ] Query response times monitored
- [ ] No N+1 queries
- [ ] Indexes are effective
- [ ] Connection pooling works

---

## Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Responsive Design
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] All layouts work correctly

---

## Security Testing

- [ ] SQL injection prevention verified
- [ ] XSS protection verified
- [ ] CSRF tokens validated
- [ ] Authentication checks work
- [ ] Authorization checks work
- [ ] Password hashing verified
- [ ] Token validation works
- [ ] Rate limiting works
- [ ] Error messages don't leak sensitive info

---

## Data Validation

- [ ] Email validation works
- [ ] Password strength validated
- [ ] File type validation works
- [ ] File size validation works
- [ ] Input sanitization works
- [ ] Phone number format validated
- [ ] Date formats validated

---

## Error Handling

- [ ] Network errors handled gracefully
- [ ] Validation errors display clearly
- [ ] Server errors show user-friendly message
- [ ] 404 page exists and works
- [ ] 500 page exists and works
- [ ] Timeout handling works
- [ ] Redirect loops don't occur

---

## Accessibility

- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast adequate
- [ ] Focus indicators visible
- [ ] Alt text on images

---

## Email Testing

- [ ] Signup confirmation email sent
- [ ] Welcome email sent
- [ ] Password reset email works
- [ ] Interest notification emails sent
- [ ] Admin notification emails work

---

## Testing Results Summary

| Category | Status | Notes |
|----------|--------|-------|
| Authentication | ⚪ Pending | |
| User Profile | ⚪ Pending | |
| Photo Upload | ⚪ Pending | |
| PDF Upload | ⚪ Pending | |
| Search | ⚪ Pending | |
| Subscription | ⚪ Pending | |
| Admin Features | ⚪ Pending | |
| Performance | ⚪ Pending | |
| Security | ⚪ Pending | |
| Compatibility | ⚪ Pending | |

**Status Codes:**
- ⚪ Pending
- 🟡 In Progress
- 🟢 Passed
- 🔴 Failed

## Critical Issues Found

(List any blockers that must be fixed before launch)

## Minor Issues Found

(List non-blocking issues for future improvements)

## Sign-Off

- [ ] QA Lead approval
- [ ] Product Owner approval
- [ ] Technical Lead approval

**Date:** _____________
**Tester:** _____________
**Notes:** _____________
