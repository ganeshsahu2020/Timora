// tests/smoke.spec.js
import { test, expect } from './fixtures/auth.js';

test('home loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('navigation')).toBeVisible();
  await expect(page).toHaveTitle(/timora|ai time shifter|nexus/i);
});

test('a11y landmarks visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('header')).toBeVisible();
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();
});
