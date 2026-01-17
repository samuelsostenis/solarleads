import { test, expect } from '@playwright/test';

test.describe('SolarLeads Frontend', () => {
  test('homepage redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    // Should redirect to /login when not authenticated
    await page.waitForURL(/login|register/, { timeout: 5000 }).catch(() => {});
    expect(page.url()).toContain('login');
  });

  test('login page accessible', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    const email = await page.locator('input[type="email"]');
    await expect(email).toBeVisible();
  });

  test('register page accessible', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    const nameInput = await page.locator('input[placeholder*="nome"], input[type="text"]').first();
    await expect(nameInput).toBeVisible();
  });

  test('title is SolarLeads', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await expect(page).toHaveTitle(/SolarLeads/);
  });
});
