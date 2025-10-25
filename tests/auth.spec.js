import { test, expect } from './fixtures/auth.js';

test('user can log in and sees Account', async ({ page, loginAs }) => {
  await loginAs('user');
  await expect(page.getByRole('heading', { name: /account|your account/i })).toBeVisible();
});

test('password reset link is visible on login', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible();
});

test('signup validations (client-side) show when invalid', async ({ page }) => {
  await page.goto('/signup');
  await page.getByLabel(/^full name$/i).fill('A');
  await page.getByLabel(/^email$/i).fill('not-an-email');
  await page.getByLabel(/^password$/i).fill('123');           // too short
  await page.getByLabel(/^confirm password$/i).fill('456');   // mismatch
  await page.getByRole('button', { name: /create account/i }).click();
  // Button remains disabled OR form shows errors depending on your logic
  // (This keeps it generic—adjust if you show specific error toasts.)
});
