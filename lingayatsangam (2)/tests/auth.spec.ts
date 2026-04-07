
import { test, expect } from '@playwright/test';

test.describe('Registration & Conflict Flow', () => {
    test('User can register successfully', async ({ page }) => {
        // 1. Navigate to Registration
        await page.goto('http://localhost:5050');
        await page.getByText('Start Journey').click();

        // 2. Step 1: Account
        await page.fill('input[name="email"]', `demo.user.${Date.now()}@example.com`);
        await page.fill('input[name="password"]', 'password');
        await page.getByText('NEXT STEP').click();

        // 3. Step 2: Personal
        await page.fill('input[name="fullName"]', 'User Demo Name');
        await page.fill('input[name="dob"]', '1995-05-15');
        await page.fill('input[name="mobile"]', `9${Date.now().toString().substring(3, 12)}`); // Random 10 digit
        await page.selectOption('select[name="gender"]', 'Male');
        await page.getByText('NEXT STEP').click();

        // 4. Step 3: Community
        await page.selectOption('select[name="subCaste"]', 'Panchamasali');
        await page.fill('input[name="education"]', 'BE Computer Science');
        await page.fill('input[name="location"]', 'Bangalore');

        // 5. Submit
        await page.getByText('COMPLETE REGISTRATION').click();

        // 6. Verify success message or redirection
        // Handling window alert if possible, or checking redirection
        page.on('dialog', dialog => dialog.accept());

        // Verify successful redirection by checking for Dashboard specific text
        // Note: The app uses internal state routing, so URL might remain localhost:3000
        await expect(page.getByText('Namaste')).toBeVisible();
    });
});
