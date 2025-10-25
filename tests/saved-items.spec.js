// tests/saved-items.spec.js
import { test, expect } from './fixtures/auth.js';

test.describe('Saved items (optional)', () => {
  test('user can save and unsave', async ({ page, loginAs }) => {
    test.skip(); // unskip when routes exist
    await loginAs('user');
    await page.goto('/explore');
    await page.getByRole('button', { name: /save/i }).first().click();
    await page.goto('/saved');
    await expect(page.getByText(/saved/i)).toBeVisible();
    await page.getByRole('button', { name: /remove|unsave/i }).first().click();
    await expect(page.getByText(/no saved items/i)).toBeVisible();
  });
});
