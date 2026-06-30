import { test, expect } from "@playwright/test";

test.describe("Wallet auth flow", () => {
  test("connects wallet and goes through wizard", async ({ page }) => {
    await page.goto("/auth");

    // Step 1: Connect Wallet
    await expect(
      page.getByRole("heading", { name: /Connect Wallet/i })
    ).toBeVisible({ timeout: 30000 });

    const freighterBtn = page.getByRole("button", { name: /Freighter/i });
    const isFreighterEnabled = await freighterBtn.isEnabled().catch(() => false);
    if (await freighterBtn.isVisible() && isFreighterEnabled) {
      await freighterBtn.click();
    } else {
      const firstWallet = page.locator('button:has-text("Albedo")').first();
      await firstWallet.click();
    }

    // Step 2: Select Role
    await expect(page.getByRole("heading", { name: /Select Role/i })).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: /Client/i }).click();

    // Step 3: Profile Basics
    await expect(page.getByRole("heading", { name: /Profile Basics/i })).toBeVisible({ timeout: 10000 });
    await page.getByPlaceholder(/e\.g\. Satoshi/i).fill("Test User");
    await page.getByPlaceholder(/satoshi@example/i).fill("test@test.com");
    await page.getByRole("button", { name: /Continue/i }).click();

    // Redirection
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30000 });
  });

  test("unauthenticated visit to /dashboard redirects to /auth", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/auth/, { timeout: 15000 });
  });
});
