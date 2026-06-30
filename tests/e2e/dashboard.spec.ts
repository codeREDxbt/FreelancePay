/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect } from '@playwright/test';

test.describe('Dashboard User Flows', () => {
  // Inject the mocked wallet address and Playwright flag before each test
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem('fp_wallet_address', 'GA2T6ODCEEQ2J3724LUIZ54M72DXYNUK3C3V53P6R7EFRWFYV4T7QO3K');
      (window as any).__PLAYWRIGHT__ = true;
    });
  });

  test('should load the dashboard and display key metrics', async ({ page }) => {
    await page.goto('/dashboard');

    // Verify overview cards (wallet-kit init is async, allow time to settle)
    await expect(page.getByText('Available Balance', { exact: true })).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Escrowed Amount', { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Pending Payouts', { exact: true })).toBeVisible({ timeout: 10000 });

    // Verify wallet address is displayed correctly (it usually truncates)
    await expect(page.getByText('Connected as GA2T6O…QO3K')).toBeVisible({ timeout: 10000 });
  });

  test('should display active contracts or empty state', async ({ page }) => {
    await page.goto('/dashboard');

    // The dashboard lists contracts or shows "No Active Contracts"
    const noContracts = page.getByText('No Active Contracts', { exact: true });
    const createBtn = page.getByRole('button', { name: /Create Contract/i });

    await expect(noContracts).toBeVisible({ timeout: 30000 });
    await expect(createBtn).toBeVisible({ timeout: 10000 });
    
    // Click create contract should navigate
    await createBtn.click();
    await page.waitForURL('/dashboard/contracts/new');
  });
});
