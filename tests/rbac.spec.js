// tests/rbac.spec.js
import { test, expect } from './fixtures/auth.js';

test.describe('RBAC (optional)', () => {
  test.skip(); // remove when /admin exists

  test('agent cannot access admin area', async ({ page, loginAs }) => {
    await loginAs('agent');
    await page.goto('/admin');
    await expect(page.getByText(/forbidden|403/i)).toBeVisible();
  });

  test('superadmin can access admin area', async ({ page, loginAs }) => {
    await loginAs('superadmin');
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible();
  });
});
