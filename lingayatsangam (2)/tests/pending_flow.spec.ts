
import { test, expect } from '@playwright/test';

test.describe('Pending Approval Flow', () => {

    test('New Registration is redirected to Pending Screen', async ({ page }) => {
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
        // 1. Navigate to Registration
        await page.goto('http://localhost:5050');
        await page.getByText('Start Journey').click();

        // 2. Register flow
        const timestamp = Date.now();
        await page.fill('input[name="email"]', `pending.user.${timestamp}@example.com`);
        await page.fill('input[name="password"]', 'password123');
        await page.getByText('NEXT STEP').click();

        await page.fill('input[name="fullName"]', 'Pending User');
        await page.fill('input[name="dob"]', '1998-01-01');
        await page.fill('input[name="mobile"]', `9${timestamp.toString().substring(3, 12)}`);
        await page.selectOption('select[name="gender"]', 'Male');
        await page.getByText('NEXT STEP').click();

        await page.selectOption('select[name="subCaste"]', 'Panchamasali');
        await page.fill('input[name="education"]', 'BCA');
        await page.fill('input[name="location"]', 'Mysore');

        await page.getByText('COMPLETE REGISTRATION').click();

        // 3. Verify Pending View
        // Should NOT see "Namaste, Pending!" (Dashboard)
        // Should see "Verification in Progress" (Pending Component)
        await expect(page.getByText('Verification in Progress')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Namaste')).not.toBeVisible();

        // 4. Verify Logout works
        await page.getByText('Logout').click();
        await expect(page.getByText('Start Journey')).toBeVisible();
    });

});
