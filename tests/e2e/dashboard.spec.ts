import { test, expect } from '@playwright/test';

test.describe('Dashboard User Flows', () => {
  // Inject the mocked wallet address before each test
  test.beforeEach(async ({ page, context }) => {
    // Add the local storage item before navigating
    await context.addInitScript(() => {
      window.localStorage.setItem('fp_wallet_address', 'GA1234567890MOCKADDRESS1234567890');
      window.localStorage.setItem('theme', 'light');
    });
  });

  test('should load the dashboard and display key metrics', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verify title and overview cards
    await expect(page.getByText('Dashboard Overview')).toBeVisible();
    await expect(page.getByText('Active Contracts')).toBeVisible();
    await expect(page.getByText('Total Earnings')).toBeVisible();
    
    // Verify wallet address is displayed correctly (it usually truncates)
    await expect(page.getByText('GA12...7890')).toBeVisible();
  });

  test('should navigate to contracts page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click on the Contracts link in the sidebar or topnav
    // Looking for the link with href="/dashboard/contracts"
    await page.click('a[href="/dashboard/contracts"]');
    
    // Wait for the URL to change
    await page.waitForURL('/dashboard/contracts');
    
    // Verify contracts page content
    await expect(page.getByRole('heading', { name: 'Contracts' })).toBeVisible();
    await expect(page.getByText('Create Contract')).toBeVisible();
  });

  test('should toggle dark mode successfully', async ({ page }) => {
    await page.goto('/dashboard');
    
    // The HTML element shouldn't have the dark class initially
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    
    // Find the theme toggle button (usually an icon button in the header)
    // We can find it by its aria-label if it has one, or by looking for the Sun/Moon icons
    // In our TopNav it's a button wrapping Sun/Moon icons. Let's find it by role and its likely icon class or just by clicking the first button in the nav that looks like a toggle
    const themeToggle = page.locator('button.rounded-full.p-2').first();
    await themeToggle.click();
    
    // Verify the HTML element now has the dark class
    await expect(page.locator('html')).toHaveClass(/dark/);
    
    // Verify local storage was updated
    const themeInStorage = await page.evaluate(() => window.localStorage.getItem('theme'));
    expect(themeInStorage).toBe('dark');
  });
});
