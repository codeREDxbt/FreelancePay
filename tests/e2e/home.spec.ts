import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load the home page correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page title matches
    await expect(page).toHaveTitle(/FreelancePay/i, { timeout: 30000 });
    
    // Check if the main heading is visible
    await expect(page.getByRole('heading', { name: /SHIP CODE/i })).toBeVisible({ timeout: 30000 });
    
    // Check if the Initialize Application button is visible and links to /auth
    const initAppBtn = page.getByRole('link', { name: /Deploy Contract/i });
    await expect(initAppBtn).toBeVisible();
    await expect(initAppBtn).toHaveAttribute('href', '/auth');
  });
});
