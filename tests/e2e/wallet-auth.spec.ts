import { test, expect } from "@playwright/test";

test.describe("Wallet auth flow", () => {
  test("connects wallet, signs nonce, and redirects to dashboard", async ({ page }) => {
    await page.goto("/auth");

    await expect(
      page.getByRole("heading", { name: /connect your wallet/i })
    ).toBeVisible({ timeout: 30000 });

    const connectBtn = page.locator("#connect-wallet-btn");
    await expect(connectBtn).toBeVisible();
    await connectBtn.click();

    const modal = page.getByRole("heading", { name: /connect wallet/i });
    await expect(modal).toBeVisible({ timeout: 10000 });

    const freighterBtn = page.getByRole("button", { name: /freighter/i });
    if (await freighterBtn.isVisible()) {
      await freighterBtn.click();
    } else {
      const firstWallet = page
        .locator('[class*="group"]')
        .first();
      await firstWallet.click();
    }

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30000 });
  });

  test("unauthenticated visit to /dashboard redirects to /auth", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/auth/, { timeout: 15000 });
  });
});
