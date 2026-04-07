
import { test, expect } from '@playwright/test';

test.describe('Admin Panel - Full Functionality & Approvals', () => {
    test.beforeEach(async ({ page }) => {
        // 1. Mock Supabase Auth Session
        await page.route('**/auth/v1/session**', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    access_token: 'mock-token',
                    token_type: 'bearer',
                    expires_in: 3600,
                    refresh_token: 'mock-refresh',
                    user: { id: 'admin-123', email: 'admin@example.com', user_metadata: { full_name: 'Super Admin' } }
                })
            });
        });

        // 2. Mock Profile Fetch (Admin Role)
        await page.route('**/rest/v1/profiles?user_id=eq.admin-123&select=id%2Cstatus%2Crole**', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 'admin-id-456', status: 'active', role: 'admin' }])
            });
        });

        // 3. Mock Admin Stats
        await page.route('**/rest/v1/profiles?select=%2A&status=eq.pending_approval&head=true**', async route => {
            await route.fulfill({ status: 200, headers: { 'content-range': '0-0/16' } });
        });
        await page.route('**/rest/v1/profiles?select=%2A&status=eq.active&head=true**', async route => {
            await route.fulfill({ status: 200, headers: { 'content-range': '0-0/42' } });
        });
        await page.route('**/rest/v1/payments?select=%2A&status=eq.pending&head=true**', async route => {
            await route.fulfill({ status: 200, headers: { 'content-range': '0-0/5' } });
        });

        // 4. Mock Pending Approvals List
        await page.route('**/rest/v1/profiles?select=%2A&or=%28status.eq.pending_approval%2Cbio_pdf_status.eq.pending_approval%29**', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    { id: 'user-1', full_name: 'Ramesh Patil', sub_caste: 'Panchamasali', status: 'pending_approval', created_at: new Date().toISOString() },
                    { id: 'user-2', full_name: 'Anita Bagewadi', sub_caste: 'Jangama', status: 'active', bio_pdf_status: 'pending_approval', created_at: new Date().toISOString() }
                ])
            });
        });

        // 5. Mock Update Profile Status (Successful Approval)
        await page.route('**/rest/v1/profiles?id=eq.**', async route => {
            if (route.request().method() === 'PATCH') {
                await route.fulfill({ status: 204 });
            } else {
                await route.fulfill({ status: 200, body: '[]' });
            }
        });

        // 6. Navigate to Admin View directly
        await page.goto('http://localhost:5050/?view=admin');
    });

    test('Verify Dashboard Stats & Sidebar Navigation', async ({ page }) => {
        // Check stats
        await expect(page.locator('text=16')).toBeVisible(); // Pending
        await expect(page.locator('text=42')).toBeVisible(); // Active

        // Test Sidebar Tabs
        const tabs = ['ALL USERS', 'APPROVALS', 'PAYMENTS', 'ANNOUNCEMENTS', 'SYSTEM HEALTH', 'SETTINGS'];
        for (const tab of tabs) {
            await page.click(`text=${tab}`);
            // Simple verification that the tab changed the header or content
            // The header text is usually uppercase or capitalized
            await expect(page.locator('h2, h1').filter({ hasText: new RegExp(tab, 'i') }).first()).toBeVisible();
        }
    });

    test('Full Approvals Flow - Review & Approve User', async ({ page }) => {
        // Go to Approvals
        await page.click('text=APPROVALS');
        await expect(page.locator('text=Ramesh Patil')).toBeVisible();

        // Click Review Identity
        await page.locator('button:has-text("Review Identity")').first().click();

        // Expect Review Modal
        await expect(page.locator('text=Review Profile')).toBeVisible();
        await expect(page.locator('text=Ramesh Patil')).toBeVisible();

        // Click Approve
        await page.click('button:has-text("Approve Profile")');

        // Modal should close and list should refresh (in mock, list remains same but we verify interaction)
        await expect(page.locator('text=Review Profile')).not.toBeVisible();
    });

    test('Full Approvals Flow - Reject with Reason', async ({ page }) => {
        await page.click('text=APPROVALS');
        await page.locator('button:has-text("Review Identity")').first().click();

        // Click Reject
        await page.click('button:has-text("Reject Profile")');

        // Modal for rejection reason
        await page.fill('textarea[placeholder*="reason"]', 'Invalid ID proof');
        await page.click('button:has-text("Confirm Rejection")');

        await expect(page.locator('text=Review Profile')).not.toBeVisible();
    });

    test('System Health Check Flow', async ({ page }) => {
        await page.click('text=SYSTEM HEALTH');
        await expect(page.locator('text=System Health Status')).toBeVisible();

        // Refresh health
        await page.click('button:has-text("Refresh Diagnostics")');
        await expect(page.locator('text=Accessible').first()).toBeVisible();
    });
});
