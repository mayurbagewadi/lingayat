import { test, expect } from '@playwright/test';

const SUPABASE_URL = 'https://qomnebvjrdlqvlwrpmod.supabase.co';

test.describe('Admin Panel Comprehensive Flow (Mocked)', () => {

    test.beforeEach(async ({ page }) => {
        page.on('console', msg => console.log(`BROWSER [${msg.type()}]: ${msg.text()}`));
        page.on('pageerror', err => console.log(`BROWSER ERROR: ${err.message}`));
        // Mock Supabase Get Session (Called on mount in App.tsx)
        await page.route(`${SUPABASE_URL}/auth/v1/session*`, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    session: {
                        access_token: 'mock-token',
                        token_type: 'bearer',
                        user: { id: 'admin-uuid', email: 'admin@example.com' }
                    }
                })
            });
        });

        // Mock Supabase Auth Token (for login if needed)
        await page.route(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    access_token: 'mock-token',
                    user: { id: 'admin-uuid', email: 'admin@example.com' }
                })
            });
        });

        // Mock Profile Fetch (Admin Role) - Called after session is found
        await page.route(`${SUPABASE_URL}/rest/v1/profiles?user_id=eq.admin-uuid&select=id%2Cstatus%2Crole`, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 'admin-profile-id', status: 'active', role: 'admin' }])
            });
        });

        // Mock All REST API calls with GLOBs for robustness
        await page.route(`${SUPABASE_URL}/rest/v1/profiles*`, async route => {
            const url = route.request().url();
            if (url.includes('status=eq.pending_approval')) {
                await route.fulfill({ status: 200, body: JSON.stringify([]), headers: { 'content-range': '0-5/5' } });
            } else if (url.includes('status=eq.active')) {
                await route.fulfill({ status: 200, body: JSON.stringify([]), headers: { 'content-range': '0-10/10' } });
            } else if (url.includes('or=%28status.eq.pending_approval%2Cbio_pdf_status.eq.pending_approval%29')) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([
                        { id: 'p1', full_name: 'Rahul Mock', sub_caste: 'Nolamba', status: 'pending_approval' }
                    ])
                });
            } else {
                await route.fulfill({ status: 200, body: JSON.stringify([]), headers: { 'content-range': '0-15/15' } });
            }
        });

        await page.route(`${SUPABASE_URL}/rest/v1/payments*`, async route => {
            const url = route.request().url();
            if (url.includes('status=eq.pending')) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([
                        { id: 'pay1', transaction_id: 'MOCK_123', amount: 2999, profiles: { full_name: 'User One' } }
                    ]),
                    headers: { 'content-range': '0-2/2' }
                });
            } else {
                await route.fulfill({ status: 200, body: JSON.stringify([]) });
            }
        });

        await page.route(`${SUPABASE_URL}/rest/v1/audit_logs*`, async route => {
            await route.fulfill({ status: 200, body: JSON.stringify([]) });
        });

        await page.route(`${SUPABASE_URL}/rest/v1/app_settings*`, async route => {
            await route.fulfill({ status: 200, body: JSON.stringify([]) });
        });

        await page.route(`${SUPABASE_URL}/rest/v1/announcements*`, async route => {
            await route.fulfill({ status: 200, body: JSON.stringify([]) });
        });

        // Navigate to the app with view=admin to force the Admin Dashboard
        await page.goto('http://localhost:5050?view=admin');

        // Verify we are in Admin Dashboard
        await expect(page.getByText('LingayatSangam')).toBeVisible();
        await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 15000 });
    });

    test('Verify Dashboard Stats and Navigation', async ({ page }) => {
        await expect(page.getByText('Total Profiles')).toBeVisible();
        await expect(page.getByText('Pending Approvals')).toBeVisible();

        await page.click('button:has-text("Approvals")');
        await expect(page.getByText('All Pending')).toBeVisible();

        await page.click('button:has-text("Payments")');
        await expect(page.getByText('Pending Proofs')).toBeVisible();
    });

    test('Profile Approval Flow', async ({ page }) => {
        await page.click('button:has-text("Approvals")');

        const reviewButtons = page.locator('button:has-text("Review Identity")');
        await expect(reviewButtons.first()).toBeVisible();
        await reviewButtons.first().click();
        await expect(page.getByText('Moderation Panel')).toBeVisible();

        await page.route(`${SUPABASE_URL}/rest/v1/profiles?id=eq.p1`, async route => {
            await route.fulfill({ status: 200, body: JSON.stringify({}) });
        });

        await page.fill('textarea[placeholder="Provide feedback if rejecting..."]', 'Verified by Admin');
        await page.click('button:has-text("Approve Profile")');

        await expect(page.getByText('Moderation Panel')).not.toBeVisible();
    });

    test('Payment Verification Flow', async ({ page }) => {
        await page.click('button:has-text("Payments")');

        const reviewButtons = page.locator('button:has-text("Review Proof")');
        await expect(reviewButtons.first()).toBeVisible();
        await reviewButtons.first().click();
        await expect(page.getByText('Verify Proof')).toBeVisible();

        await page.route(`${SUPABASE_URL}/rest/v1/payments?id=eq.pay1`, async route => {
            await route.fulfill({ status: 200, body: JSON.stringify({}) });
        });

        await page.click('button:has-text("Verify & Activate")');
        await expect(page.getByText('Verify Proof')).not.toBeVisible();
    });

    test('System Health Check', async ({ page }) => {
        await page.click('button:has-text("System Health")');
        await expect(page.getByText('Database Connectivity Diagnostic')).toBeVisible();
    });

    test('Settings Update Flow', async ({ page }) => {
        await page.click('button:has-text("Settings")');
        await expect(page.getByText('Payment Gateway')).toBeVisible();

        await page.route(`${SUPABASE_URL}/rest/v1/app_settings`, async route => {
            await route.fulfill({ status: 200, body: JSON.stringify({}) });
        });

        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('committed');
            await dialog.accept();
        });

        await page.click('button:has-text("Save All Credentials")');
    });

});
